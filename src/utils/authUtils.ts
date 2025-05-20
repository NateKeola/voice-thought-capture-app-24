
import { supabase } from '@/integrations/supabase/client';

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getUser();
  return !!data.user;
};

// Get current user ID or generate a guest ID
export const getUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    return data.user.id;
  }
  
  // For users not logged in, use a local storage guest ID
  let guestId = localStorage.getItem('memo_guest_id');
  if (!guestId) {
    guestId = `guest-${crypto.randomUUID()}`;
    localStorage.setItem('memo_guest_id', guestId);
  }
  return guestId;
};
