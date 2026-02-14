import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

export interface Dataset {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, any>[];
  created_at: string;
  cleaned: boolean;
  row_count: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  split_delimiter: string;
  active_dataset_id: string | null;
}

interface AppState {
  datasets: Dataset[];
  activeDataset: Dataset | null;
  settings: AppSettings;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_DATASETS'; payload: Dataset[] }
  | { type: 'SET_ACTIVE_DATASET'; payload: Dataset | null }
  | { type: 'ADD_DATASET'; payload: Dataset }
  | { type: 'DELETE_DATASET'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  datasets: [],
  activeDataset: null,
  settings: {
    theme: 'system',
    split_delimiter: ',',
    active_dataset_id: null,
  },
  loading: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadDatasets: () => Promise<void>;
  addDataset: (dataset: Omit<Dataset, 'id' | 'created_at'>) => Promise<Dataset>;
  setActiveDataset: (datasetId: string) => Promise<void>;
  deleteDataset: (datasetId: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}>({
  state: initialState,
  dispatch: () => { },
  loadDatasets: async () => { },
  addDataset: async () => ({} as Dataset),
  setActiveDataset: async () => { },
  deleteDataset: async () => { },
  updateSettings: async () => { },
});

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DATASETS':
      return { ...state, datasets: action.payload };
    case 'SET_ACTIVE_DATASET':
      return { ...state, activeDataset: action.payload };
    case 'ADD_DATASET':
      return { ...state, datasets: [...state.datasets, action.payload] };
    case 'DELETE_DATASET':
      return {
        ...state,
        datasets: state.datasets.filter(d => d.id !== action.payload),
        activeDataset: state.activeDataset?.id === action.payload ? null : state.activeDataset,
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadDatasets = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/datasets');
      if (!response.ok) throw new Error('Failed to fetch datasets');
      const data = await response.json();
      dispatch({ type: 'SET_DATASETS', payload: data });

      // Load active dataset
      const settings = JSON.parse(localStorage.getItem('sparkly_settings') || '{}');
      if (settings.active_dataset_id) {
        const activeDataset = data.find((d: Dataset) => d.id === settings.active_dataset_id);
        if (activeDataset) {
          dispatch({ type: 'SET_ACTIVE_DATASET', payload: activeDataset });
        }
      }
      dispatch({ type: 'UPDATE_SETTINGS', payload: { ...initialState.settings, ...settings } });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load datasets');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addDataset = async (dataset: Omit<Dataset, 'id' | 'created_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataset),
      });

      if (!response.ok) throw new Error('Failed to create dataset');

      const newDataset = await response.json();
      dispatch({ type: 'ADD_DATASET', payload: newDataset });
      return newDataset;
    } catch (error) {
      console.error(error);
      toast.error('Failed to add dataset');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveDataset = async (datasetId: string) => {
    const dataset = state.datasets.find(d => d.id === datasetId);
    if (dataset) {
      dispatch({ type: 'SET_ACTIVE_DATASET', payload: dataset });
      const newSettings = { ...state.settings, active_dataset_id: datasetId };
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
      localStorage.setItem('sparkly_settings', JSON.stringify(newSettings));
      toast.success(`Active dataset: ${dataset.name}`);
    }
  };

  const deleteDataset = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete dataset');

      dispatch({ type: 'DELETE_DATASET', payload: datasetId });
      toast.success('Dataset deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete dataset');
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });
    localStorage.setItem('sparkly_settings', JSON.stringify(updatedSettings));
    toast.success('Settings updated');
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        loadDatasets,
        addDataset,
        setActiveDataset,
        deleteDataset,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};