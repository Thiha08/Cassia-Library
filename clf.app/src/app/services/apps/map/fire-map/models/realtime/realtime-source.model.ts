import { FireEvent } from '../base/fire-source-base.model';

export interface RealtimeFireEvent {
  type: 'fire_detected' | 'fire_updated' | 'fire_resolved';
  event: FireEvent;
  timestamp: string;
}

export interface RealtimeBatch {
  events: RealtimeFireEvent[];
  batchId: string;
  timestamp: string;
} 