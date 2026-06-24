"use client";

import React, { useMemo } from 'react';
import { useAppState } from '@/components/providers/AppStateProvider';
import { CABLES, OWNERS } from '@/lib/constants';
import { getFilteredCables } from '@/lib/utils';
import { downloadData } from '@/lib/download';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export function IntelligenceSidebar() {
  const { state, dispatch } = useAppState();
  const { filters, selectedCable, sim } = state;

  const filteredCables = useMemo(() => getFilteredCables(CABLES, filters), [filters]);

  const activeCablesCount = filteredCables.filter(c => c.status === 'active').length;
  const totalCapacity = filteredCables.reduce((sum, c) => sum + c.capacityTbps, 0);

  const selectedCableData = selectedCable ? CABLES.find(c => c.id === selectedCable) : null;

  // Chart data computation
  const ownerData = useMemo(() => {
    let hyperscalerCapacity = 0;
    let telcoCapacity = 0;

    filteredCables.forEach(cable => {
      const cableOwners = cable.owners.map(oId => OWNERS.find(o => o.id === oId));
      const hyperCount = cableOwners.filter(o => o?.type === 'private').length;
      const telcoCount = cableOwners.filter(o => o?.type === 'telecom').length;
      const total = hyperCount + telcoCount;

      if (total > 0) {
        hyperscalerCapacity += (hyperCount / total) * cable.capacityTbps;
        telcoCapacity += (telcoCount / total) * cable.capacityTbps;
      }
    });

    return [
      { name: 'Hyperscalers', capacity: Math.round(hyperscalerCapacity), fill: 'var(--primary)' },
      { name: 'Telecoms', capacity: Math.round(telcoCapacity), fill: 'var(--secondary)' }
    ];
  }, [filteredCables]);

  const handleFilterChange = (key: keyof typeof state.filters, value: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { [key]: value } });
  };

  const handleSimulate = () => {
    if (selectedCable) {
      dispatch({ type: 'SET_SIM_STATE', payload: { running: true, cableId: selectedCable } });
    }
  };

  const handleResetSim = () => {
    dispatch({ type: 'SET_SIM_STATE', payload: { running: false, cableId: null } });
  };

  const handleDownload = () => {
    downloadData();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] text-[var(--text-primary)]">
      {/* SECTION A: Title + KPI */}
      <div className="p-5 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold text-[var(--primary)] mb-1">Infrastructure Intelligence</h1>
        {selectedCableData ? (
          <div className="mt-4 flex flex-col bg-[var(--background)] border border-[var(--border)] rounded shadow-sm overflow-hidden">
            {/* Header / Badge */}
            <div className="flex justify-between items-center p-3 border-b border-[var(--border)] bg-[#0f1d38]/30">
              <h2 className="text-sm font-bold text-gray-100 uppercase tracking-widest">{selectedCableData.name}</h2>
              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-widest ${selectedCableData.status === 'active' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'}`}>
                {selectedCableData.status}
              </span>
            </div>
            
            {/* 2x2 Grid for Core Metrics */}
            <div className="grid grid-cols-2 gap-[1px] bg-[var(--border)]">
              <div className="bg-[var(--background)] p-3 flex flex-col">
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold tracking-wider mb-0.5">Capacity</span>
                <span className="text-sm font-bold text-gray-200">{selectedCableData.capacityTbps} <span className="text-[10px] text-[#64748b]">Tbps</span></span>
              </div>
              <div className="bg-[var(--background)] p-3 flex flex-col">
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold tracking-wider mb-0.5">Landing Hubs</span>
                <span className="text-sm font-bold text-gray-200">{selectedCableData.landingPoints.length}</span>
              </div>
              <div className="bg-[var(--background)] p-3 flex flex-col">
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold tracking-wider mb-0.5">Connected Region</span>
                <span className="text-sm font-bold text-gray-200 uppercase">{selectedCableData.region}</span>
              </div>
              <div className="bg-[var(--background)] p-3 flex flex-col">
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold tracking-wider mb-0.5">Ownership</span>
                <span className="text-[10px] font-bold text-[#38BDF8] leading-tight mt-1 truncate" title={selectedCableData.owners.map(oId => OWNERS.find(o => o.id === oId)?.name).join(', ')}>
                  {selectedCableData.owners.map(oId => OWNERS.find(o => o.id === oId)?.name).join(', ')}
                </span>
              </div>
            </div>

            {/* Risk / Redundancy Bar */}
            <div className="flex border-t border-[var(--border)] bg-[#0B1117]">
              <div className="flex-1 p-2 border-r border-[var(--border)] flex justify-between items-center">
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold tracking-wider">Redundancy</span>
                <span className={`text-[10px] font-bold ${selectedCableData.landingPoints.length > 2 ? 'text-[#22c55e]' : selectedCableData.landingPoints.length === 2 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                  {selectedCableData.landingPoints.length > 2 ? 'HIGH' : selectedCableData.landingPoints.length === 2 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
              <div className="flex-1 p-2 flex justify-between items-center">
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold tracking-wider">Risk Rating</span>
                <span className={`text-[10px] font-bold ${selectedCableData.landingPoints.length > 2 ? 'text-[#22c55e]' : selectedCableData.landingPoints.length === 2 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                  {selectedCableData.landingPoints.length > 2 ? 'LOW' : selectedCableData.landingPoints.length === 2 ? 'MEDIUM' : 'HIGH'}
                </span>
              </div>
            </div>

            {/* Analytical Context */}
            <div className="p-3 border-t border-[var(--border)] bg-[#0B1117]">
              <span className="text-[9px] uppercase text-[#818CF8] font-bold tracking-widest mb-1.5 block">Why This Matters</span>
              <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                {selectedCableData.name === 'AAE-1' ? 'Supports connectivity between Europe, the Middle East, and Asia. Disruption would increase routing dependency on alternative Mediterranean corridors.' :
                 selectedCableData.name === '2Africa' ? 'Encircles the African continent, providing critical backbone access to emerging markets. Disruption impacts vast swathes of coastal infrastructure.' :
                 ['MAREA', 'Dunant', 'EllaLink'].includes(selectedCableData.name) ? 'Serves as a primary Trans-Atlantic data pipe. High traffic volume creates massive potential impact during severance.' :
                 ['FASTER', 'Jupiter'].includes(selectedCableData.name) ? 'Critical Trans-Pacific corridor. Supports major hyperscaler synchronization between US and Asian data centers.' :
                 `Strategic corridor in the ${selectedCableData.region} region. Disruption requires immediate payload shifting to adjacent subsea networks.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm">
              <span className="text-xl font-bold text-[var(--text-primary)] leading-none tracking-tight mb-1">{activeCablesCount}</span>
              <span className="text-[9px] uppercase font-semibold tracking-wider text-[var(--text-muted)] mb-1.5">Active Cables</span>
              <span className="text-[9px] text-[#64748b] leading-tight">Critical physical connections carrying global backbone traffic.</span>
            </div>
            
            <div className="flex flex-col bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm">
              <span className="text-xl font-bold text-[var(--text-primary)] leading-none tracking-tight mb-1">{new Set(filteredCables.flatMap(c => c.landingPoints)).size}</span>
              <span className="text-[9px] uppercase font-semibold tracking-wider text-[var(--text-muted)] mb-1.5">Landing Points</span>
              <span className="text-[9px] text-[#64748b] leading-tight">Coastal hubs terminating and amplifying signals.</span>
            </div>

            <div className="flex flex-col bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm">
              <span className="text-xl font-bold text-[var(--text-primary)] leading-none tracking-tight mb-1">{totalCapacity} <span className="text-xs font-medium text-[var(--text-muted)]">Tbps</span></span>
              <span className="text-[9px] uppercase font-semibold tracking-wider text-[var(--text-muted)] mb-1.5">Total Capacity</span>
              <span className="text-[9px] text-[#64748b] leading-tight">Supports major transcontinental internet corridors.</span>
            </div>

            <div className="flex flex-col bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm">
              <span className={`text-xl font-bold leading-none tracking-tight mb-1 ${sim.running ? 'text-[#ef4444]' : 'text-[#38BDF8]'}`}>{sim.running ? '74' : '92'}<span className="text-xs font-medium opacity-50">/100</span></span>
              <span className="text-[9px] uppercase font-semibold tracking-wider text-[var(--text-muted)] mb-1.5">Network Health</span>
              <span className="text-[9px] text-[#64748b] leading-tight">Current aggregated global infrastructure resilience score.</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: Intelligence Assessment */}
      <div className="p-5 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Current Assessment</h3>
        
        {/* Core Indicators */}
        <div className="flex flex-col gap-1.5 mb-4 border-l-2 border-[#38BDF8] pl-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Network Health</span>
            <span className={`text-xs font-bold ${sim.running ? 'text-[#ef4444]' : 'text-[#38BDF8]'}`}>{sim.running ? '74/100' : '92/100'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Infrastructure Resilience</span>
            <span className={`text-xs font-bold ${sim.running ? 'text-[#f59e0b]' : 'text-[#22c55e]'}`}>{sim.running ? 'Stressed' : 'Strong'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Ownership Concentration</span>
            <span className="text-xs font-bold text-[#f59e0b]">Moderate</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Primary Bottleneck</span>
            <span className="text-xs font-bold text-gray-200">Suez Corridor</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Regional Dependency</span>
            <span className="text-xs font-bold text-gray-200">High in EMEA</span>
          </div>
        </div>

        {/* 3 Compact Cards */}
        <div className="flex flex-col gap-2">
          <div className="bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm">
            <span className="text-[9px] uppercase font-bold text-[#38BDF8] tracking-widest block mb-1">Network Exposure</span>
            <span className="text-[10px] text-[#cbd5e1] leading-tight block">
              {activeCablesCount} active cables currently connect major economic corridors, bearing concentrated global traffic.
            </span>
          </div>

          <div className="bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm">
            <span className="text-[9px] uppercase font-bold text-[#38BDF8] tracking-widest block mb-1">Redundancy Assessment</span>
            <span className="text-[10px] text-[#cbd5e1] leading-tight block">
              Atlantic routes maintain strong redundancy while Mediterranean corridors remain highly concentrated and vulnerable.
            </span>
          </div>

          <div className="bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm">
            <span className="text-[9px] uppercase font-bold text-[#38BDF8] tracking-widest block mb-1">Operational Outlook</span>
            <span className="text-[10px] text-[#cbd5e1] leading-tight block">
              {sim.running 
                ? 'Active disruption detected. Payload shifting to adjacent networks causing elevated regional latency and bottlenecking.' 
                : 'Current network posture remains stable with no active disruption scenarios reported.'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION C: Who Controls The Rail */}
      <div className="p-5 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Ownership Intelligence</h3>
        
        {/* Ownership Assessment */}
        <div className="bg-[var(--background)] border border-[var(--border)] p-2.5 rounded shadow-sm mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] uppercase font-bold text-[#38BDF8] tracking-widest">Ownership Concentration Risk</span>
            <span className="text-[10px] font-bold text-[#f59e0b]">MODERATE</span>
          </div>
          <span className="text-[10px] text-[#cbd5e1] leading-tight block mb-1.5">
            Four entities influence more than half of tracked network capacity.
          </span>
          <span className="text-[10px] text-[#cbd5e1] leading-tight block">
            Concentration increases operational dependence on a limited set of infrastructure stakeholders.
          </span>
        </div>

        <div className="h-28 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={ownerData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: 'var(--border)' }} contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', fontSize: '12px' }} />
              <Bar dataKey="capacity" radius={[0, 4, 4, 0]}>
                {ownerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Owners List */}
        <div className="mb-4">
          <span className="text-[9px] uppercase text-[#818CF8] font-bold tracking-widest mb-1.5 block">Top Owners</span>
          <div className="flex flex-col gap-[1px] bg-[var(--border)]">
            <div className="bg-[var(--background)] p-2 flex justify-between items-center">
              <span className="text-[10px] text-gray-200 font-medium">Google</span>
              <span className="text-[10px] font-bold text-[#38BDF8]">24%</span>
            </div>
            <div className="bg-[var(--background)] p-2 flex justify-between items-center">
              <span className="text-[10px] text-gray-200 font-medium">Meta</span>
              <span className="text-[10px] font-bold text-[#38BDF8]">18%</span>
            </div>
            <div className="bg-[var(--background)] p-2 flex justify-between items-center">
              <span className="text-[10px] text-gray-200 font-medium">Microsoft</span>
              <span className="text-[10px] font-bold text-[#38BDF8]">15%</span>
            </div>
            <div className="bg-[var(--background)] p-2 flex justify-between items-center">
              <span className="text-[10px] text-gray-200 font-medium">Orange</span>
              <span className="text-[10px] font-bold text-[#38BDF8]">12%</span>
            </div>
            <div className="bg-[var(--background)] p-2 flex justify-between items-center">
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Others</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">31%</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Insight */}
        <div className="border-l-2 border-[#10b981] pl-3 py-1">
          <span className="text-[9px] uppercase font-bold text-[#10b981] tracking-widest block mb-1">Governance Outlook</span>
          <p className="text-[10px] text-[#94a3b8] leading-tight">
            Ownership remains diversified across telecom operators and hyperscalers, reducing single-entity control risk.
          </p>
        </div>
      </div>

      {/* SECTION D: Filters & Operational Controls */}
      <div className="p-5 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Operational Controls</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex flex-col">
            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Region</label>
            <select value={filters.region} onChange={(e) => handleFilterChange('region', e.target.value)} className="bg-[var(--background)] border border-[var(--border)] rounded text-xs p-2 focus:outline-none focus:border-[var(--primary)]">
              <option value="all">Global</option>
              <option value="transatlantic">Trans-Atlantic</option>
              <option value="transpacific">Trans-Pacific</option>
              <option value="emea">EMEA</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Capacity</label>
            <select value={filters.capacity} onChange={(e) => handleFilterChange('capacity', e.target.value)} className="bg-[var(--background)] border border-[var(--border)] rounded text-xs p-2 focus:outline-none focus:border-[var(--primary)]">
              <option value="all">All</option>
              <option value=">100">&gt;100 Tbps</option>
              <option value="10-100">10-100 Tbps</option>
              <option value="<10">&lt;10 Tbps</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--background)] p-4 border border-[var(--border)] rounded-md border-l-2 border-l-[var(--accent-amber)]">
          <h4 className="text-xs font-semibold mb-2">Failure Simulation</h4>
          <p className="text-[10px] text-[var(--text-muted)] mb-3">Analyze network rerouting capacity and physical bottlenecks upon simulated cable cuts.</p>
          
          <div className="flex flex-col mb-3">
            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Select Cable</label>
            <select 
              value={selectedCable || ''} 
              onChange={(e) => dispatch({ type: 'SET_SELECTED_CABLE', payload: e.target.value || null })}
              className="bg-[var(--surface)] border border-[var(--border)] rounded text-xs p-2 focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="">-- Choose target infrastructure --</option>
              {filteredCables.filter(c => c.status !== 'planned').map(cable => (
                <option key={cable.id} value={cable.id}>{cable.name} ({cable.capacityTbps} Tbps)</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSimulate}
              disabled={!selectedCable || sim.running}
              className="flex-1 bg-[var(--border)] hover:bg-[var(--primary)] hover:text-black disabled:opacity-50 text-xs py-2 rounded transition-colors"
            >
              Simulate Cut
            </button>
            <button 
              onClick={handleResetSim}
              disabled={!sim.running}
              className="flex-1 bg-transparent border border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-50 text-xs py-2 rounded transition-colors"
            >
              Reset
            </button>
          </div>
          {sim.running && selectedCable && (
            <div className="mt-3 p-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded text-[10px] text-[var(--accent-red)]">
              CRITICAL: Active simulation running. {CABLES.find(c => c.id === selectedCable)?.capacityTbps} Tbps rerouted to adjacent infrastructure.
            </div>
          )}
        </div>
      </div>

      {/* SECTION E: Infrastructure Events */}
      <div className="p-5 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Infrastructure Events</h3>
        
        <div className="relative border-l border-[var(--border)] ml-1.5 py-1 flex flex-col gap-4">
          
          <div className="relative pl-3.5">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#f97316] -left-[3.5px] top-1.5 shadow-[0_0_4px_#f97316]"></div>
            <p className="text-[10px] text-gray-200 leading-tight mb-1">Marseille remains primary EMEA landing hub</p>
            <span className="inline-block text-[8px] uppercase font-bold tracking-widest text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 px-1 py-0.5 rounded">Impact: High</span>
          </div>

          <div className="relative pl-3.5">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#06b6d4] -left-[3.5px] top-1.5 shadow-[0_0_4px_#06b6d4]"></div>
            <p className="text-[10px] text-gray-200 leading-tight mb-1">Suez corridor carrying concentrated regional traffic</p>
            <span className="inline-block text-[8px] uppercase font-bold tracking-widest text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20 px-1 py-0.5 rounded">Impact: Moderate</span>
          </div>

          <div className="relative pl-3.5">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#818CF8] -left-[3.5px] top-1.5 shadow-[0_0_4px_#818CF8]"></div>
            <p className="text-[10px] text-gray-200 leading-tight mb-1">{activeCablesCount} active cable systems currently operational</p>
            <span className="inline-block text-[8px] uppercase font-bold tracking-widest text-[#818CF8] bg-[#818CF8]/10 border border-[#818CF8]/20 px-1 py-0.5 rounded">Impact: Informational</span>
          </div>

          <div className="relative pl-3.5">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#06b6d4] -left-[3.5px] top-1.5 shadow-[0_0_4px_#06b6d4]"></div>
            <p className="text-[10px] text-gray-200 leading-tight mb-1">Ownership concentration unchanged</p>
            <span className="inline-block text-[8px] uppercase font-bold tracking-widest text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20 px-1 py-0.5 rounded">Impact: Moderate</span>
          </div>

          <div className="relative pl-3.5">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#64748b] -left-[3.5px] top-1.5 shadow-[0_0_4px_#64748b]"></div>
            <p className="text-[10px] text-gray-200 leading-tight mb-1">Atlantic redundancy remains strong</p>
            <span className="inline-block text-[8px] uppercase font-bold tracking-widest text-[#64748b] bg-[#64748b]/10 border border-[#64748b]/20 px-1 py-0.5 rounded">Impact: Low</span>
          </div>

        </div>
      </div>

      {/* SECTION F: Data & Export */}
      <div className="p-5 mt-auto">
        <button 
          onClick={handleDownload}
          className="w-full bg-transparent border border-[var(--border)] hover:bg-[var(--border)] text-xs py-2 rounded transition-colors"
        >
          Download Intelligence Data (JSON)
        </button>
      </div>
    </div>
  );
}
