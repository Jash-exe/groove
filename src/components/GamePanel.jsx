import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { startGame } from '../lib/startGame';
import MusicTriviaGame from './MusicTriviaGame';
import GuessTheSongGame from './GuessTheSongGame';
import WyrGame from './WyrGame';
import PickWhoGame from './PickWhoGame';
import GameCard from './GameCard';
import { isHostUser } from '../lib/isHostUser';
import SettingsDialog from './SettingsDialog';
import GameResults from './GameResults';

export default function GamePanel({ roomCode, currentUserName }) {
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(null); // null = not yet determined
  const [activeGame, setActiveGame] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingGameType, setPendingGameType] = useState(null);
  const [session, setSession] = useState(null); // add this to track session for results

  useEffect(() => {
    // Get room data
    const fetchRoom = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      setRoom(data);
      console.log('ROOM HOST:', data?.host_name, 'CURRENT USER:', currentUserName);
      console.log('Is Host:', isHostUser(data?.host_name, currentUserName));
      setIsHost(isHostUser(data?.host_name, currentUserName));
    };

    fetchRoom();

    // Fetch active game session (in case it already exists)
    const fetchActiveGame = async () => {
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('room_code', roomCode)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      if (sessionData) {
        setActiveGame(sessionData.game_type);
        setSession(sessionData);
      } else {
        setSession(null);
      }
    };
    fetchActiveGame();

    // Listen for game start and updates
    const sub = supabase
      .channel('game_session_sync')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_sessions',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          setActiveGame(payload.new.game_type);
          setSession(payload.new); // Set session immediately on insert
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          setActiveGame(payload.new.game_type);
          setSession(payload.new); // Set session immediately on update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [roomCode, currentUserName]);

  const handleStartGame = async (gameType) => {
    await startGame(gameType, roomCode, currentUserName);
  };

  const handleGameCardClick = (gameType) => {
    setPendingGameType(gameType);
    setShowSettings(true);
  };

  const handleStartWithSettings = async ({ total, secs }) => {
    setShowSettings(false);
    if (!pendingGameType) return;
    // Pass settings to startGame
    await startGame(pendingGameType, roomCode, currentUserName, { total, secs });
    setPendingGameType(null);
  };

  if (isHost === null) {
    return (
      <div className="w-full max-w-5xl mx-auto text-center text-white p-8">
        Loading room data...
      </div>
    );
  }

  if (activeGame === 'music_trivia') 
    return <MusicTriviaGame roomCode={roomCode} currentUserName={currentUserName} />;
  if (activeGame === 'guess_the_song') 
    return <GuessTheSongGame roomCode={roomCode} currentUserName={currentUserName} />;
  if (activeGame === 'would_you_rather') 
    return <WyrGame roomCode={roomCode} currentUserName={currentUserName} />;
  if (activeGame === 'pick_who') 
    return <PickWhoGame roomCode={roomCode} currentUserName={currentUserName} />;

  // Show results screen if game_state is ended
  if (session && session.game_state === 'ended') {
    return (
      <GameResults
        roomCode={roomCode}
        currentUserName={currentUserName}
        gameType={session.game_type}
        sessionId={session.id}
        isHost={isHost}
        onReturnToLobby={async () => {
          setActiveGame(null);
          setSession(null);
        }}
        onAction={async (action) => {
          if (action === 'replay') {
            // Start the same game again with the same settings
            const settings = session.config || {};
            await startGame(session.game_type, roomCode, currentUserName, settings);
          } else if (action === 'pick_new') {
            // Return to game selection screen
            setActiveGame(null);
            setSession(null);
          }
        }}
      />
    );
  }

  // No game started yet
  if (isHost) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-2 text-white text-center">Game Room</h3>
        <p className="mb-8 text-slate-300 text-center">Choose a game to start with your friends</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <GameCard 
            title="Music Trivia"
            description="Test your music knowledge with questions about artists, songs, and albums"
            icon="🎵"
            difficulty="Medium"
            players="2-8"
            duration="10-15 min"
            badgeColor="bg-[#a259ff] bg-opacity-20"
            onStart={() => handleGameCardClick('music_trivia')}
          />
          <GameCard 
            title="Guess the Song"
            description="Guess the song title from emoji clues!"
            icon="🎧"
            difficulty="Hard"
            players="2-8"
            duration="15-20 min"
            badgeColor="bg-pink-600 bg-opacity-20"
            onStart={() => handleGameCardClick('guess_the_song')}
          />
          <GameCard 
            title="Would You Rather"
            description="Choose between two scenarios and see what others pick"
            icon="🤔"
            difficulty="Easy"
            players="2-10"
            duration="5-10 min"
            badgeColor="bg-green-600 bg-opacity-20"
            onStart={() => handleGameCardClick('would_you_rather')}
          />
          <GameCard 
            title="Pick Who Game"
            description="Vote on who best fits the scenario or who you would choose"
            icon="🥳"
            difficulty="Easy"
            players="2-8"
            duration="10-15 min"
            badgeColor="bg-green-600 bg-opacity-20"
            onStart={() => handleGameCardClick('pick_who')}
          />
        </div>
        {showSettings && (
          <SettingsDialog 
            onStart={handleStartWithSettings} 
            onClose={() => setShowSettings(false)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-center">
      <h3 className="text-2xl font-bold mb-2 text-white">Game Room</h3>
      <p className="text-slate-300 mb-8">Waiting for host to start the game...</p>
      <div className="bg-[#181825] rounded-2xl border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] p-8">
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-white text-lg">The host will choose a game to play with everyone!</p>
      </div>
    </div>
  );
}