'use client';

import { supabase } from './client';
import { toast } from 'react-toastify';

export const signInAdmin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (adminError || !adminData) {
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin privileges required.');
    }

    return { user: data.user, admin: adminData };
  } catch (error: any) {
    toast.error(error.message || 'Login failed');
    throw error;
  }
};

export const signOutAdmin = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Logged out successfully');
  } catch (error: any) {
    toast.error(error.message || 'Logout failed');
    throw error;
  }
};

export const getCurrentAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single();

    return adminData ? { user, admin: adminData } : null;
  } catch (error) {
    return null;
  }
};

