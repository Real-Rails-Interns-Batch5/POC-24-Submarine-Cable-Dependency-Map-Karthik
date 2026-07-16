"use client";

import { Info, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="animate-header-rise absolute top-0 left-0 w-full z-40 flex justify-between items-start px-6 py-4 pointer-events-none">
      <div className="flex items-center backdrop-blur-md bg-[var(--surface)]/30 border border-[var(--border)]/50 px-4 py-2 rounded-lg pointer-events-auto shadow-lg">
        <h1 className="text-xs font-bold tracking-widest uppercase text-[var(--text-primary)]">
          Infrastructure <span className="text-[var(--primary)] ml-1">Intelligence</span>
        </h1>
      </div>
      
      <div className="relative pointer-events-auto" ref={popoverRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center p-2 backdrop-blur-md bg-[var(--surface)]/30 border border-[var(--border)]/50 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors shadow-lg"
          aria-label="Information"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <Info size={16} />
        </button>

        {isOpen && (
          <div 
            className="absolute top-full right-0 mt-2 w-56 p-4 rounded-xl backdrop-blur-md bg-[#0D1C28]/80 border border-[#1D3446]/50 shadow-2xl animate-fade-in text-[#F1F5F9]"
            role="dialog"
            aria-label="Project Information"
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-3 right-3 text-[#94A3B8] hover:text-[#36D6FF] transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
            
            <div className="flex flex-col gap-3">
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-[#94A3B8] font-bold mb-0.5">Architect</span>
                <span className="text-xs font-medium">Karthik L</span>
              </div>
              
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-[#94A3B8] font-bold mb-0.5">Batch</span>
                <span className="text-xs font-medium">Batch 5 Interns</span>
              </div>
              
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-[#94A3B8] font-bold mb-1.5">Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#36D6FF]/10 text-[#36D6FF] border border-[#36D6FF]/20">Next.js</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">FastAPI</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/20">Tailwind CSS</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Leaflet</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
