
import React, { useState, useRef, useEffect } from 'react';

interface CompareSliderProps {
  before: string;
  after: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-col-resize select-none border border-neutral-800"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* After Image (Background) */}
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Clipping) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl border border-neutral-200">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-neutral-400 rounded-full" />
            <div className="w-0.5 h-3 bg-neutral-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-md text-xs font-medium text-white uppercase tracking-wider">
        原始图像
      </div>
      <div className="absolute bottom-4 right-4 bg-indigo-600/70 backdrop-blur-md px-3 py-1 rounded-md text-xs font-medium text-white uppercase tracking-wider">
        AI 增强
      </div>
    </div>
  );
};

export default CompareSlider;
