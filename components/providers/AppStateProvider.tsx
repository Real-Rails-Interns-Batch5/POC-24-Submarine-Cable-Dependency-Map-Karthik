"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, FilterState } from '@/lib/types';

type Action = 
  | { type: 'SET_SELECTED_CABLE'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_SIM_STATE'; payload: Partial<AppState['sim']> }
  | { type: 'SET_PANEL'; payload: AppState['panel'] };

const initialState: AppState = {
  selectedCable: null,
  activeTab: 'map',
  filters: { region: 'all', capacity: 'all', status: 'all' },
  sim: { running: false, cableId: null },
  panel: null,
};

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function appStateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SELECTED_CABLE':
      return { ...state, selectedCable: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SIM_STATE':
      return { ...state, sim: { ...state.sim, ...action.payload } };
    case 'SET_PANEL':
      return { ...state, panel: action.payload };
    default:
      return state;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
