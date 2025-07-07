import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useMessages(room_code) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!room_code) return;
    let ignore = false;
    // Fetch initial messages
    supabase
      .from('messages')
      .select('*')
      .eq('room_code', room_code)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!ignore && !error) setMessages(data || []);
      });
    // Subscribe to new messages
    const channel = supabase
      .channel('room-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_code=eq.${room_code}` },
        (payload) => {
          setMessages((msgs) => [...msgs, payload.new]);
        }
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [room_code]);

  return messages;
} 