"use client";

import dynamic from 'next/dynamic';
import { useAppState } from '@/components/providers/AppStateProvider';
import { IntelligenceSidebar } from '@/components/layout/IntelligenceSidebar';

const LeafletCableMap = dynamic(() => import('@/components/map/LeafletCableMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#030712] flex items-center justify-center text-[#38BDF8]">Loading geographic data...</div>
});

export default function Home() {
  const { state } = useAppState();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--text-primary)] relative">
      {/* Main Visualization (70%) */}
      <main className="flex-[7] min-w-0 relative z-0">
        <LeafletCableMap />
      </main>

      {/* Intelligence Sidebar (30%) */}
      <aside className="flex-[3] min-w-[380px] max-w-[520px] border-l border-[var(--border)] overflow-y-auto sidebar-scroll">
        <IntelligenceSidebar />
      </aside>
    </div>
  );
}
