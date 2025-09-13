import { useRef, useEffect } from 'react';
import { createContinuousTimeline } from '@/lib/utils/fmcsaUtils';
import type { DailyLog } from '@/lib/types/api';

interface DutyStatusCanvasProps {
  dailyLogs: DailyLog[];
}

export function DutyStatusCanvas({ dailyLogs }: DutyStatusCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw duty status lines on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed dimensions to match the layout
    const labelWidth = 192; // Duty status label width
    const totalWidth = 80; // Total hours column width
    const timeSlotsWidth = 1152; // 96 slots * 12px each
    const slotWidth = 12; // Each 15-minute slot is 12px wide
    const rowHeight = 40; // Each duty status row height
    const totalWidth_canvas = labelWidth + timeSlotsWidth + totalWidth;
    
    canvas.width = totalWidth_canvas;
    canvas.height = 160; // 4 rows * 40px height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use the timeline from dailyLogs calculation (already processed)
    if (dailyLogs.length === 0) return;
    
    const timeline = createContinuousTimeline(dailyLogs[0].entries);

    // Draw the continuous square wave line
    ctx.strokeStyle = '#0000FF'; // Blue color like in the reference
    ctx.lineWidth = 3; // Bold line
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    if (timeline.length === 0) return;

    let currentStatus = timeline[0];
    const startX = labelWidth;
    let currentY = getStatusRowY(currentStatus, rowHeight);

    ctx.beginPath();
    ctx.moveTo(startX, currentY);

    for (let slot = 1; slot < timeline.length; slot++) {
      const x = labelWidth + (slot * slotWidth);
      
      if (timeline[slot] !== currentStatus) {
        // Status changed - draw horizontal line to transition point, then vertical line
        ctx.lineTo(x, currentY);
        
        const newY = getStatusRowY(timeline[slot], rowHeight);
        ctx.lineTo(x, newY);
        
        currentStatus = timeline[slot];
        currentY = newY;
      }
    }
    
    // Draw final horizontal line to end
    const finalX = labelWidth + (timeline.length * slotWidth);
    ctx.lineTo(finalX, currentY);
    
    ctx.stroke();

    // Helper function to get Y position for each status row
    function getStatusRowY(status: string | null, rowHeight: number): number {
      if (!status) status = 'off_duty'; // Default to off_duty for null status
      
      const statusIndex = status === 'off_duty' ? 0 : 
                         status === 'sleeper_berth' ? 1 :
                         status === 'driving' ? 2 : 3;
      return (statusIndex * rowHeight) + (rowHeight / 2); // Center of the row
    }
  }, [dailyLogs]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-overlay"
      style={{ width: '1424px', height: '160px' }}
    />
  );
}
