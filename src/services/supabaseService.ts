import { supabase } from '../config/supabase';
import { Task, TaskCategory, Habit, Goal, MeditationSession, User } from '../types';

export class SupabaseService {
  // Wait for supabase to be initialized
  private static async waitForSupabase() {
    let retries = 0;
    const maxRetries = 10;
    
    while ((!supabase || !supabase.auth) && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!supabase || !supabase.auth) {
      throw new Error('Supabase client failed to initialize');
    }
    
    return supabase;
  }

  // Authentication
  static async signUp(email: string, password: string, name: string) {
    const client = await this.waitForSupabase();

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw error;

    if (data.user) {
      await this.createUserProfile(data.user.id, name, email);
    }

    return data;
  }

  static async signIn(email: string, password: string) {
    const client = await this.waitForSupabase();
    
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const client = await this.waitForSupabase();
    const { error } = await client.auth.signOut();
    
    // If there's no active session, that's fine - user is already signed out
    if (error && !error.message?.includes('Auth session missing')) {
      throw error;
    }
    
    // Clear any stored session data
    try {
      await client.auth.getSession();
    } catch {
      // Ignore errors when clearing session
    }
  }

  static async getCurrentUser() {
    const client = await this.waitForSupabase();
    const { data: { user } } = await client.auth.getUser();
    return user;
  }

  // User Profile
  static async createUserProfile(id: string, name: string, email: string): Promise<User> {
    const client = await this.waitForSupabase();
    
    const { data, error } = await client
      .from('user_profiles')
      .insert({
        id,
        name,
        email,
        preferences: {
          notifications: true,
          theme: 'light' as const,
          language: 'en',
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      if (error.message?.includes('row-level security policy')) {
        throw new Error('Database access denied. Please check Row Level Security policies for user_profiles table.');
      }
      throw error;
    }
    return data as User;
  }

  static async getUserProfile(userId: string): Promise<User> {
    const client = await this.waitForSupabase();
    
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, try to get user info from auth and create profile
      if (error.code === 'PGRST116') {
        console.log('User profile not found, attempting to create one...');
        try {
          const { data: { user } } = await client.auth.getUser();
          if (user && user.id === userId) {
            // Extract name from user metadata or use email as fallback
            const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
            const email = user.email || '';
            
            console.log('Creating profile for existing user:', { userId, name, email });
            return await this.createUserProfile(userId, name, email);
          }
        } catch (createError) {
          console.error('Failed to create user profile:', createError);
          throw new Error('User profile not found and could not be created. Please check database permissions.');
        }
      }
      throw error;
    }
    return data as User;
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const client = await this.waitForSupabase();
    
    const { data, error } = await client
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  // Task Categories
  static async getTaskCategories(userId: string): Promise<TaskCategory[]> {
    const { data, error } = await supabase
      .from('task_categories')
      .select(`
        *,
        tasks (*)
      `)
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;

    return (data || []).map(category => ({
      id: category.id,
      name: category.name,
      color: category.color,
      user_id: category.user_id,
      tasks: (category.tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        createdAt: task.created_at,
        category: category.name,
        category_id: task.category_id,
        user_id: task.user_id,
      })),
      progress: category.tasks?.length > 0 
        ? Math.round((category.tasks.filter((t: any) => t.completed).length / category.tasks.length) * 100)
        : 0,
    }));
  }

  static async createTaskCategory(userId: string, name: string, color: string): Promise<TaskCategory> {
    const { data, error } = await supabase
      .from('task_categories')
      .insert({
        user_id: userId,
        name,
        color,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      user_id: data.user_id,
      tasks: [],
      progress: 0,
    };
  }

  static async deleteTaskCategory(categoryId: string) {
    // First delete all tasks in this category
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('category_id', categoryId);

    if (tasksError) throw tasksError;

    // Then delete the category
    const { error: categoryError } = await supabase
      .from('task_categories')
      .delete()
      .eq('id', categoryId);

    if (categoryError) throw categoryError;
  }

  // Tasks
static async createTask(userId: string, categoryId: string, title: string, timer?: number): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        category_id: categoryId,
        title,
        timer,
      })
      .select(`
        *,
        task_categories (name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      completed: data.completed,
      createdAt: data.created_at,
      category: (data.task_categories as any)?.name || '',
      category_id: data.category_id,
      user_id: data.user_id,
      timer: data.timer,
    };
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        completed: updates.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select(`
        *,
        task_categories (name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      completed: data.completed,
      createdAt: data.created_at,
      category: (data.task_categories as any)?.name || '',
      category_id: data.category_id,
      user_id: data.user_id,
    };
  }

  static async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }

  // Habits
  static async getHabits(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;

    return (data || []).map(habit => ({
      id: habit.id,
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      streak: habit.streak,
      longestStreak: habit.longest_streak,
      completedDates: habit.completed_dates,
      createdAt: habit.created_at,
      user_id: habit.user_id,
    }));
  }

  static async createHabit(userId: string, habitData: Omit<Habit, 'id' | 'createdAt' | 'user_id'>): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: habitData.name,
        color: habitData.color,
        icon: habitData.icon,
        streak: habitData.streak || 0,
        longest_streak: habitData.longestStreak || 0,
        completed_dates: habitData.completedDates || [],
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      icon: data.icon,
      streak: data.streak,
      longestStreak: data.longest_streak,
      completedDates: data.completed_dates,
      createdAt: data.created_at,
      user_id: data.user_id,
    };
  }

  static async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update({
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        streak: updates.streak,
        longest_streak: updates.longestStreak,
        completed_dates: updates.completedDates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      icon: data.icon,
      streak: data.streak,
      longestStreak: data.longest_streak,
      completedDates: data.completed_dates,
      createdAt: data.created_at,
      user_id: data.user_id,
    };
  }

  static async deleteHabit(habitId: string) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) throw error;
  }

  // Goals
  static async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;

    return (data || []).map(goal => ({
      id: goal.id,
      name: goal.name,
      description: goal.description || '',
      progress: goal.progress,
      target: goal.target,
      color: goal.color,
      icon: goal.icon,
      type: goal.type,
      createdAt: goal.created_at,
      user_id: goal.user_id,
    }));
  }

  static async createGoal(userId: string, goalData: Omit<Goal, 'id' | 'createdAt' | 'user_id'>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        name: goalData.name,
        description: goalData.description,
        progress: goalData.progress || 0,
        target: goalData.target,
        color: goalData.color,
        icon: goalData.icon,
        type: goalData.type,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      progress: data.progress,
      target: data.target,
      color: data.color,
      icon: data.icon,
      type: data.type,
      createdAt: data.created_at,
      user_id: data.user_id,
    };
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({
        name: updates.name,
        description: updates.description,
        progress: updates.progress,
        target: updates.target,
        color: updates.color,
        icon: updates.icon,
        type: updates.type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      progress: data.progress,
      target: data.target,
      color: data.color,
      icon: data.icon,
      type: data.type,
      createdAt: data.created_at,
      user_id: data.user_id,
    };
  }

  static async deleteGoal(goalId: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  }
}