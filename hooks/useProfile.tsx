// hooks/useProfile.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Charge au montage
export function useProfile() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        setAvatarUrl(data?.avatar_url || null);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { avatarUrl, loading };
}