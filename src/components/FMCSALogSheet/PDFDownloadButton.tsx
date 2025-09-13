import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface PDFDownloadButtonProps {
  date: string;
  collapsibleStates: {
    isTripInfoOpen: boolean;
    isVehicleInfoOpen: boolean;
    isRemarksOpen: boolean;
    isRecapOpen: boolean;
    isSummaryOpen: boolean;
  };
  onStateChange: (states: {
    isTripInfoOpen: boolean;
    isVehicleInfoOpen: boolean;
    isRemarksOpen: boolean;
    isRecapOpen: boolean;
    isSummaryOpen: boolean;
  }) => void;
}

export function PDFDownloadButton({ 
  date, 
  collapsibleStates, 
  onStateChange 
}: PDFDownloadButtonProps) {
  const logSheetRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!logSheetRef.current) return;

    const logSheetElement = logSheetRef.current;

    // Store original collapsible states
    const originalStates = { ...collapsibleStates };

    try {
      // Dynamic import for better performance
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      // Add PDF-specific class to the log sheet
      if (logSheetElement) {
        logSheetElement.classList.add('fmcsa-log-sheet-pdf');
      }
      
      // Force all sections to be open for PDF generation
      onStateChange({
        isTripInfoOpen: true,
        isVehicleInfoOpen: true,
        isRemarksOpen: true,
        isRecapOpen: true,
        isSummaryOpen: true
      });
      
      // Wait for state updates to take effect
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(logSheetRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: false,
        removeContainer: true,
        ignoreElements: (element) => {
          // Skip elements that might cause color parsing issues
          return element.classList.contains('skip-pdf');
        },
        onclone: (clonedDoc) => {
          // Comprehensive oklch color replacement for PDF compatibility
          const replaceOklchColors = (text: string): string => {
            return text.replace(/oklch\([^)]+\)/g, (match) => {
              // Convert common oklch colors to hex equivalents
              if (match.includes('0.7') && match.includes('0.15')) return '#3b82f6'; // blue
              if (match.includes('0.6') && match.includes('0.2')) return '#10b981'; // green
              if (match.includes('0.5') && match.includes('0.25')) return '#f59e0b'; // amber
              if (match.includes('0.4') && match.includes('0.3')) return '#ef4444'; // red
              if (match.includes('0.8') && match.includes('0.1')) return '#6b7280'; // gray
              return '#000000'; // fallback to black
            });
          };

          // Replace oklch in style elements
          const clonedStyles = clonedDoc.querySelectorAll('style');
          clonedStyles.forEach(style => {
            if (style.textContent?.includes('oklch')) {
              style.textContent = replaceOklchColors(style.textContent);
            }
          });

          // Replace oklch in inline styles
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(element => {
            const style = element.getAttribute('style');
            if (style && style.includes('oklch')) {
              element.setAttribute('style', replaceOklchColors(style));
            }
          });

          // Replace oklch in CSS custom properties
          const rootElement = clonedDoc.documentElement;
          const computedStyle = clonedDoc.defaultView?.getComputedStyle(rootElement);
          if (computedStyle) {
            const cssVariables = Array.from(computedStyle).filter(prop => 
              prop.startsWith('--') && computedStyle.getPropertyValue(prop).includes('oklch')
            );
            cssVariables.forEach(prop => {
              const value = computedStyle.getPropertyValue(prop);
              rootElement.style.setProperty(prop, replaceOklchColors(value));
            });
          }
        }
      });

      // Remove PDF-specific class
      if (logSheetElement && logSheetElement instanceof HTMLElement) {
        logSheetElement.classList.remove('fmcsa-log-sheet-pdf');
      }

      // Restore original collapsible states
      onStateChange(originalStates);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`FMCSA_LogSheet_${date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Ensure PDF class is removed even on error
      if (logSheetElement && logSheetElement instanceof HTMLElement) {
        logSheetElement.classList.remove('fmcsa-log-sheet-pdf');
      }
      
      // Restore original collapsible states on error
      onStateChange(originalStates);
      
      // Fallback: try with simpler options and aggressive oklch replacement
      try {
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).jsPDF;

        const canvas = await html2canvas(logSheetRef.current, {
          scale: 1,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: false,
          allowTaint: false,
          foreignObjectRendering: false,
          onclone: (clonedDoc) => {
            // Aggressive oklch replacement for fallback
            const replaceAllOklch = (text: string): string => {
              return text.replace(/oklch\([^)]+\)/g, '#000000');
            };

            // Replace in all style elements
            const allStyles = clonedDoc.querySelectorAll('style');
            allStyles.forEach(style => {
              if (style.textContent) {
                style.textContent = replaceAllOklch(style.textContent);
              }
            });

            // Replace in all inline styles
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach(element => {
              const style = element.getAttribute('style');
              if (style) {
                element.setAttribute('style', replaceAllOklch(style));
              }
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save(`FMCSA_LogSheet_${date.replace(/\//g, '-')}.pdf`);
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed:', fallbackError);
        alert('Failed to generate PDF. Please try again or contact support.');
      } finally {
        // Ensure states are restored even if fallback fails
        onStateChange(originalStates);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Download Button */}
      <div className="flex justify-center">
        <div className="w-[1424px] flex justify-end">
          <Button 
            onClick={handleDownloadPDF}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Hidden ref for PDF generation */}
      <div ref={logSheetRef} style={{ display: 'none' }} />
    </div>
  );
}
