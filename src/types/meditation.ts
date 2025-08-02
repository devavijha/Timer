export interface MeditationSession {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  type: 'breathing' | 'guided' | 'relaxation';
  color: string;
  icon: string;
  user_id?: string;
}

export interface MeditationState {
  sessions: MeditationSession[];
  currentSession: MeditationSession | null;
  isActive: boolean;
  timeRemaining: number;
  progress: Array<{
    sessionId: string;
    date: string;
    duration: number;
    completionRate: number;
  }>;
  totalMinutes: number;
  streakDays: number;
  activeDate: string;
}
