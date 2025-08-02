export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  category: string;
  category_id?: string; // Added for Supabase
  user_id?: string; // Added for Supabase
  timer?: number; // Timer in seconds, optional
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
  progress: number;
  user_id?: string; // Added for Supabase
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  streak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: string;
  user_id?: string; // Added for Supabase
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  color: string;
  icon: string;
  type: 'weekly' | 'monthly' | 'daily';
  createdAt: string;
  user_id?: string; // Added for Supabase
}

export interface MeditationSession {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  type: 'breathing' | 'guided' | 'relaxation';
  icon: string;
  color: string;
  user_id?: string; // Added for Supabase
  completed_at?: string; // Added for Supabase
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'task' | 'habit' | 'meditation' | 'reminder';
  color: string;
  user_id?: string; // Added for Supabase
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar: string | null;
          preferences: {
            notifications: boolean;
            theme: 'light' | 'dark';
            language: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar?: string;
          preferences?: {
            notifications: boolean;
            theme: 'light' | 'dark';
            language: string;
          };
        };
        Update: {
          name?: string;
          email?: string;
          avatar?: string;
          preferences?: {
            notifications: boolean;
            theme: 'light' | 'dark';
            language: string;
          };
        };
      };
      task_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          color?: string;
        };
        Update: {
          name?: string;
          color?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          category_id: string;
          title: string;
          completed?: boolean;
        };
        Update: {
          title?: string;
          completed?: boolean;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          streak: number;
          longest_streak: number;
          completed_dates: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          color?: string;
          icon?: string;
          streak?: number;
          longest_streak?: number;
          completed_dates?: string[];
        };
        Update: {
          name?: string;
          color?: string;
          icon?: string;
          streak?: number;
          longest_streak?: number;
          completed_dates?: string[];
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          progress: number;
          target: number;
          color: string;
          icon: string;
          type: 'daily' | 'weekly' | 'monthly';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string;
          progress?: number;
          target: number;
          color?: string;
          icon?: string;
          type: 'daily' | 'weekly' | 'monthly';
        };
        Update: {
          name?: string;
          description?: string;
          progress?: number;
          target?: number;
          color?: string;
          icon?: string;
          type?: 'daily' | 'weekly' | 'monthly';
        };
      };
      meditation_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          duration: number;
          type: 'breathing' | 'guided' | 'relaxation';
          icon: string;
          color: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string;
          duration: number;
          type: 'breathing' | 'guided' | 'relaxation';
          icon?: string;
          color?: string;
          completed_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          duration?: number;
          type?: 'breathing' | 'guided' | 'relaxation';
          icon?: string;
          color?: string;
          completed_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          time: string | null;
          type: 'task' | 'habit' | 'meditation' | 'reminder';
          color: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          date: string;
          time?: string;
          type: 'task' | 'habit' | 'meditation' | 'reminder';
          color?: string;
        };
        Update: {
          title?: string;
          date?: string;
          time?: string;
          type?: 'task' | 'habit' | 'meditation' | 'reminder';
          color?: string;
        };
      };
    };
  };
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  Home: undefined;
  Tasks: undefined;
  Habits: undefined;
  Meditation: undefined;
  Progress: undefined;
  Profile: undefined;
  FocusModeScreen: undefined;
  WelcomeScreen: undefined;
  OnboardingScreen: undefined;
  NicknameScreen: undefined;
  RegionSelectionScreen: undefined;
  NotificationPermissionScreen: undefined;
  StudyTimeScreen: undefined;
};

export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  Habits: undefined;
  Meditation: undefined;
  Profile: undefined;
  Progress: undefined;
  FocusModeScreen: undefined;
};