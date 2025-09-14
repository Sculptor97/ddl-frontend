import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface PDFDownloadButtonProps {
  date: string;
  logSheetRef: React.RefObject<HTMLDivElement | null>;
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
  logSheetRef,
  collapsibleStates, 
  onStateChange 
}: PDFDownloadButtonProps) {

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
        imageTimeout: 15000,
        proxy: undefined,
        ignoreElements: (element) => {
          // Skip elements that might cause color parsing issues
          return element.classList.contains('skip-pdf');
        },
        onclone: (clonedDoc) => {
          // Comprehensive oklch color replacement for PDF compatibility
          const replaceOklchColors = (text: string): string => {
            return text.replace(/oklch\([^)]+\)/g, (match) => {
              // More comprehensive oklch to hex conversion
              const oklchMatch = match.match(/oklch\(([^)]+)\)/);
              if (!oklchMatch) return '#000000';
              
              const values = oklchMatch[1].split(/\s+/).map(v => parseFloat(v.trim()));
              if (values.length < 3) return '#000000';
              
              const [l, , h] = values;
              
              // Convert oklch to approximate hex values based on lightness and hue
              if (l > 0.8) {
                if (h >= 0 && h < 60) return '#fef3c7'; // yellow
                if (h >= 60 && h < 120) return '#d1fae5'; // green
                if (h >= 120 && h < 180) return '#dbeafe'; // cyan
                if (h >= 180 && h < 240) return '#e0e7ff'; // blue
                if (h >= 240 && h < 300) return '#f3e8ff'; // purple
                return '#f3f4f6'; // gray
              } else if (l > 0.6) {
                if (h >= 0 && h < 60) return '#f59e0b'; // amber
                if (h >= 60 && h < 120) return '#10b981'; // emerald
                if (h >= 120 && h < 180) return '#06b6d4'; // cyan
                if (h >= 180 && h < 240) return '#3b82f6'; // blue
                if (h >= 240 && h < 300) return '#8b5cf6'; // violet
                return '#6b7280'; // gray
              } else if (l > 0.4) {
                if (h >= 0 && h < 60) return '#d97706'; // orange
                if (h >= 60 && h < 120) return '#059669'; // green
                if (h >= 120 && h < 180) return '#0891b2'; // sky
                if (h >= 180 && h < 240) return '#2563eb'; // blue
                if (h >= 240 && h < 300) return '#7c3aed'; // purple
                return '#4b5563'; // gray
              } else {
                if (h >= 0 && h < 60) return '#b45309'; // amber
                if (h >= 60 && h < 120) return '#047857'; // green
                if (h >= 120 && h < 180) return '#0e7490'; // cyan
                if (h >= 180 && h < 240) return '#1d4ed8'; // blue
                if (h >= 240 && h < 300) return '#6d28d9'; // purple
                return '#374151'; // gray
              }
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

          // Replace oklch in CSS custom properties and computed styles
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

          // Additional comprehensive oklch replacement in all text content
          const walker = clonedDoc.createTreeWalker(
            clonedDoc.body,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          while ((node = walker.nextNode())) {
            if (node.textContent && node.textContent.includes('oklch')) {
              node.textContent = replaceOklchColors(node.textContent);
            }
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
      
      // Validate dimensions before proceeding
      if (!isFinite(imgHeight) || imgHeight <= 0) {
        throw new Error('Invalid image dimensions calculated');
      }
      
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
              return text.replace(/oklch\([^)]+\)/g, (match) => {
                // Simple fallback - convert to safe colors
                const oklchMatch = match.match(/oklch\(([^)]+)\)/);
                if (!oklchMatch) return '#000000';
                
                const values = oklchMatch[1].split(/\s+/).map(v => parseFloat(v.trim()));
                if (values.length < 3) return '#000000';
                
                const [l] = values;
                
                // Simple lightness-based conversion
                if (l > 0.7) return '#ffffff'; // white
                if (l > 0.4) return '#6b7280'; // gray
                return '#000000'; // black
              });
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
        
        // Ensure valid dimensions
        if (imgWidth > 0 && imgHeight > 0 && isFinite(imgWidth) && isFinite(imgHeight)) {
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          // Fallback with default dimensions
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }
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

    </div>
  );
}
