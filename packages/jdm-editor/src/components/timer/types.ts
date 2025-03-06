export type TimerType = 'duration' | 'date' | 'cycle';

export interface TimerDurationConfig {
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface TimerDateConfig {
  date: string; // ISO date string
  time: string; // HH:MM format
}

export interface TimerCycleConfig {
  type: 'iso8601' | 'cron';
  value: string; // ISO 8601 format (R/PTnM) or CRON expression
}

export interface TimerEventConfig {
  eventType: 'start' | 'intermediate' | 'boundary';
  interrupting?: boolean; // For boundary events
  escalationAction?: string; // For boundary events
}

export interface TimerNodeData {
  timerType: TimerType;
  durationConfig?: TimerDurationConfig;
  dateConfig?: TimerDateConfig;
  cycleConfig?: TimerCycleConfig;
  eventConfig: TimerEventConfig;
  description?: string;
}