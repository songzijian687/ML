
export interface RenderVersion {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
  type: 'original' | 'edited';
}

export interface LightingProfile {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
}

export interface RepairOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export interface FixtureOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export interface PointMarker {
  kind: 'point';
  id: string;
  toolId: string; // 'downlight' | 'spotlight' | 'pendant'
  variant?: 'recessed' | 'surface'; // 'recessed' (暗装) | 'surface' (明装)
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  radius: number; // Percentage relative to image width
}

export interface PathMarker {
  kind: 'path';
  id: string;
  toolId: string; // 'light-strip'
  points: { x: number; y: number }[]; // Array of percentages
}

export type LightingMarker = PointMarker | PathMarker;

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
