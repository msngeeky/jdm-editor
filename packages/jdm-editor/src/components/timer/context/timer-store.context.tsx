import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';

import type {
  TimerCycleConfig,
  TimerDateConfig,
  TimerDurationConfig,
  TimerEventConfig,
  TimerNodeData,
  TimerType
} from '../types';

type TimerStore = {
  timerType: TimerType;
  durationConfig?: TimerDurationConfig;
  dateConfig?: TimerDateConfig;
  cycleConfig?: TimerCycleConfig;
  eventConfig: TimerEventConfig;
  description?: string;
  setTimerType: (type: TimerType) => void;
  setDurationConfig: (config: TimerDurationConfig) => void;
  setDateConfig: (config: TimerDateConfig) => void;
  setCycleConfig: (config: TimerCycleConfig) => void;
  setEventConfig: (config: TimerEventConfig) => void;
  setDescription: (description: string) => void;
};

type TimerStoreContext = {
  store: ReturnType<typeof createTimerStore>;
};

const TimerContext = createContext<TimerStoreContext | null>(null);

export const createTimerStore = (initialData?: Partial<TimerNodeData>) => {
  return createStore<TimerStore>((set) => ({
    timerType: initialData?.timerType ?? 'duration',
    durationConfig: initialData?.durationConfig ?? { hours: 0, minutes: 0, seconds: 0 },
    dateConfig: initialData?.dateConfig,
    cycleConfig: initialData?.cycleConfig,
    eventConfig: initialData?.eventConfig ?? { eventType: 'start' },
    description: initialData?.description ?? '',
    setTimerType: (type) => set({ timerType: type }),
    setDurationConfig: (config) => set({ durationConfig: config }),
    setDateConfig: (config) => set({ dateConfig: config }),
    setCycleConfig: (config) => set({ cycleConfig: config }),
    setEventConfig: (config) => set({ eventConfig: config }),
    setDescription: (description) => set({ description }),
  }));
};

export const TimerProvider: React.FC<{
  children: React.ReactNode;
  store: ReturnType<typeof createTimerStore>;
}> = ({ children, store }) => {
  return (
    <TimerContext.Provider value={{ store }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerStore = <T,>(selector: (state: TimerStore) => T): T => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerStore must be used within TimerProvider');
  }

  return useStore(context.store, selector);
};

export const useTimerStoreRaw = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerStoreRaw must be used within TimerProvider');
  }

  return context.store;
};