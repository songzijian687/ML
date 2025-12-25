
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
}

export interface TextureOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}
