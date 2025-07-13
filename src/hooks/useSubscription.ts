import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_subscribed')
          .single();
        setIsSubscribed(profile?.is_subscribed || false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_subscribed')
          .single();
        setIsSubscribed(profile?.is_subscribed || false);
      } else {
        setIsSubscribed(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isSubscribed, session };
}
