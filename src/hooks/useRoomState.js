import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useRoomMusicState(roomCode) {
  const [state, setState] = useState({
    current_song_data: null,
    queue: [], // CHANGED: from queue_data to queue
    is_playing: false,
    playback_position: 0,
    updated_at: null
  });

  useEffect(() => {
    if (!roomCode) return;

    async function fetchState() {
      const { data } = await supabase
        .from("room_music_state")
        .select("*")
        .eq("room_code", roomCode)
        .single();
      // CHANGED: payload.new.queue_data to payload.new.queue
      if (data) setState({ ...data, queue: data.queue || [] }); // Ensure queue is an array
    }

    fetchState();

    const channel = supabase
      .channel(`room-music-${roomCode}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "room_music_state",
        filter: `room_code=eq.${roomCode}`
      }, (payload) => setState({ ...payload.new, queue: payload.new.queue || [] })) // CHANGED: payload.new.queue_data to payload.new.queue
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomCode]);

  const getSyncedPosition = () => {
    if (!state.updated_at) return state.playback_position;
    const elapsed = (Date.now() - new Date(state.updated_at).getTime()) / 1000;
    // Ensure playback_position is treated as a number
    const currentPosition = parseFloat(state.playback_position || 0);
    return state.is_playing ? currentPosition + elapsed : currentPosition;
  };

  return { ...state, getSyncedPosition };
}
