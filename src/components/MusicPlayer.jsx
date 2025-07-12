import { useRef, useEffect, useState, useCallback } from "react";
import {
  Play, Pause, SkipForward, SkipBack, Repeat, Volume2, Shuffle, Music, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MusicPlayer = ({
  currentSong,
  queue,
  isPlaying, // Synced state from Supabase
  playbackPosition, // Synced state from Supabase
  getSyncedPosition, // Function to get adjusted synced position

  volume,
  isShuffling,
  setIsShuffling,

  onPlay, // Callback to Room.jsx to update Supabase
  onPause, // Callback to Room.jsx to update Supabase
  onEnded, // Callback to Room.jsx when song ends (e.g., skip to next)
  onSeek, // Callback to Room.jsx to update Supabase
  onSongChange, // Callback to Room.jsx to change current song and queue
  onQueueUpdate, // Callback to Room.jsx to update queue (e.g., shuffle)
}) => {
  const playerRef = useRef(null); // Reference to the YouTube player instance
  const [internalIsPlaying, setInternalIsPlaying] = useState(false); // Local state for UI/player's actual play status
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0); // Local state for UI progress slider
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null); // Reference for the progress update interval
  const [internalVolume, setInternalVolume] = useState(volume); // Local state for volume slider
  const youtubeApiLoaded = useRef(false); // Tracks if window.YT is available
  const playerInstanceReady = useRef(false); // Tracks if playerRef.current is fully initialized and ready to receive commands

  // Flag to prevent redundant Supabase updates when a client receives its own update back
  const isUpdatingSupabase = useRef(false);

  // --- Volume Control ---
  useEffect(() => {
    setInternalVolume(volume);
    if (playerRef.current && playerInstanceReady.current) {
      playerRef.current.setVolume(volume[0]);
    }
  }, [volume]);

  // --- YouTube Iframe API Loading ---
  useEffect(() => {
    // Load YouTube Iframe API script if not already loaded
    if (!window.YT && !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Set the global callback for YouTube API readiness
    window.onYouTubeIframeAPIReady = () => {
      youtubeApiLoaded.current = true; // Mark API as loaded
      // If a song is already set when API becomes ready, try to create the player
      if (currentSong && Object.keys(currentSong).length > 0) {
          createPlayer(currentSong.videoId);
      }
    };

    // Cleanup function for when component unmounts
    return () => {
      // Remove global callback to prevent issues if component unmounts and re-mounts
      delete window.onYouTubeIframeAPIReady;
      // Destroy the player instance to prevent memory leaks
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        playerInstanceReady.current = false;
      }
      // Optionally remove the script tag, though often left for app lifetime
      const tag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (tag && document.body.contains(tag)) {
        document.body.removeChild(tag);
      }
    };
  }, []); // Empty dependency array to run once on mount

  // --- Player Creation and State Management ---
  const createPlayer = useCallback((videoId) => {
    // Ensure YouTube API is fully loaded before attempting to create player
    if (!window.YT || !window.YT.Player) {
      console.warn("createPlayer: YouTube Iframe API not ready.");
      return;
    }

    // If player already exists and is playing the same video, just ensure state
    // Only proceed if player instance is ready to avoid `getVideoData` error
    if (playerRef.current && playerInstanceReady.current && playerRef.current.getVideoData().video_id === videoId) {
      console.log("createPlayer: Player already exists for this video, syncing state.");
      // Apply synced play state
      if (isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
        playerRef.current.playVideo();
      } else if (!isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PAUSED) {
        playerRef.current.pauseVideo();
      }
      // Apply synced position if significant difference
      const syncedTime = getSyncedPosition();
      const currentLocalTime = playerRef.current.getCurrentTime();
      if (Math.abs(currentLocalTime - syncedTime) > 1.5) { // Resync if more than 1.5s difference
        playerRef.current.seekTo(syncedTime, true);
      }
      setDuration(playerRef.current.getDuration());
      setIsLoading(false);
      return;
    }

    // If player exists but needs a new video or needs to be recreated (e.g., video changed)
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        console.log("createPlayer: Destroying existing player for new video or recreation.");
        playerRef.current.destroy();
        playerRef.current = null;
        playerInstanceReady.current = false; // Reset readiness as old player is destroyed
    }

    console.log("createPlayer: Creating new YouTube Player instance for videoId:", videoId);
    playerRef.current = new window.YT.Player("yt-player", {
      videoId: videoId,
      playerVars: {
        controls: 0, // Hide native controls, we use our own
        modestbranding: 1, // Hide YouTube logo
        disablekb: 1, // Disable keyboard controls
        enablejsapi: 1, // Enable JavaScript API control
        autoplay: 0, // We control autoplay based on synced state
      },
      events: {
        onReady: (e) => {
          playerInstanceReady.current = true; // Crucial: Player instance is now fully ready!
          console.log("YouTube Player onReady: Player instance is ready.");
          e.target.setVolume(internalVolume[0]); // Set initial volume

          // Sync initial state from Room.jsx props immediately after player is ready
          const syncedPos = getSyncedPosition();
          e.target.seekTo(syncedPos, true);
          if (isPlaying) {
            e.target.playVideo();
          } else {
            e.target.pauseVideo();
          }
          setDuration(e.target.getDuration()); // Get and set total duration
          setIsLoading(false); // No longer loading
          setInternalIsPlaying(isPlaying); // Update local playing state
        },
        onStateChange: (e) => {
          console.log("YouTube Player onStateChange:", e.data);
          const newPlayerState = e.data;

          // Update local playing state based on actual player state
          setInternalIsPlaying(newPlayerState === window.YT.PlayerState.PLAYING);
          setIsLoading(newPlayerState === window.YT.PlayerState.BUFFERING || newPlayerState === window.YT.PlayerState.UNSTARTED);

          // Only update Supabase if the change originated from user interaction or song end,
          // AND it's not a redundant update from our own Supabase broadcast.
          if (!isUpdatingSupabase.current) { // Prevent infinite loop
            if (newPlayerState === window.YT.PlayerState.PLAYING) {
              onPlay(); // Notify Room.jsx to update Supabase to playing
            } else if (newPlayerState === window.YT.PlayerState.PAUSED) {
              onPause(); // Notify Room.jsx to update Supabase to paused
            } else if (newPlayerState === window.YT.PlayerState.ENDED) {
              handleSkip(); // Song ended, trigger skip logic
            }
          }
        },
        onError: (e) => {
          console.error("YouTube Player Error:", e);
          setIsLoading(false);
          // If current song has an error and there's a queue, skip it
          if (queue.length > 0) {
            handleSkip(); // Any user can trigger a skip on error
          }
        }
      },
    });
  }, [isPlaying, internalVolume, getSyncedPosition, onPlay, onPause, onEnded, queue]); // Dependencies for useCallback

  // --- Main Effect for Synchronizing Player with Supabase State ---
  useEffect(() => {
    // If no song is current, stop player and reset UI
    if (!currentSong || Object.keys(currentSong).length === 0) {
      if (playerRef.current && playerInstanceReady.current && typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      }
      setInternalIsPlaying(false);
      setProgress(0);
      setDuration(0);
      setIsLoading(false);
      return;
    }

    // If YouTube API is not loaded yet, or player instance is not ready,
    // or the current video in the player is different from the synced song,
    // then we need to create/load a new player.
    if (!youtubeApiLoaded.current || !playerRef.current || (playerInstanceReady.current && playerRef.current.getVideoData().video_id !== currentSong.videoId)) {
      console.log("useEffect [currentSong, isPlaying]: Player needs creation/re-load.");
      // Only attempt to create/load player if YouTube API is loaded
      if (youtubeApiLoaded.current) {
        createPlayer(currentSong.videoId);
      }
      return; // Exit, as player creation/loading will handle the state sync
    }

    // If the same song is playing, but the play/pause state or position changed from Supabase
    if (playerInstanceReady.current) { // Ensure player is ready before sending commands
        console.log("useEffect [currentSong, isPlaying]: Player is ready, syncing play/pause/seek.");
        // Prevent redundant commands if player is already in desired state
        if (isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
            console.log("Playing video due to synced state.");
            playerRef.current.playVideo();
        } else if (!isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PAUSED) {
            console.log("Pausing video due to synced state.");
            playerRef.current.pauseVideo();
        }

        const currentLocalTime = playerRef.current.getCurrentTime();
        const syncedTime = getSyncedPosition();
        const diff = Math.abs(currentLocalTime - syncedTime);

        if (diff > 1.5) { // Resync if difference is more than 1.5 seconds
            console.log(`Seeking video due to synced state. Diff: ${diff.toFixed(2)}s`);
            playerRef.current.seekTo(syncedTime, true);
        }
    }
  }, [currentSong, isPlaying, getSyncedPosition, createPlayer, youtubeApiLoaded, playerInstanceReady]);

  // --- Progress Update Interval for UI ---
  useEffect(() => {
    clearInterval(intervalRef.current); // Clear any existing interval
    if (internalIsPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerInstanceReady.current) {
          const current = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          setProgress(current);
          setDuration(dur);
        }
      }, 500); // Update progress every 500ms
    }
    return () => clearInterval(intervalRef.current); // Cleanup interval on unmount or when not playing
  }, [internalIsPlaying]);

  // --- User Interaction Handlers (Triggering Local Player & Supabase Update) ---
  const togglePlay = () => {
    // Only proceed if player is ready and there's a song
    if (!playerRef.current || !playerInstanceReady.current || !currentSong || Object.keys(currentSong).length === 0) {
      console.warn("togglePlay: Player not ready or no song.");
      return;
    }

    // Optimistically tell the local player to change state
    if (internalIsPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    // The onStateChange callback will then detect this change and trigger onPlay/onPause to Supabase
  };

  const handleSkip = () => {
    if (!currentSong || Object.keys(currentSong).length === 0) return;

    let newCurrentSong = null;
    let newQueue = [...queue];

    if (newQueue.length > 0) {
        if (isShuffling) {
            const randomIndex = Math.floor(Math.random() * newQueue.length);
            newCurrentSong = newQueue[randomIndex];
            newQueue.splice(randomIndex, 1);
        } else {
            newCurrentSong = newQueue[0];
            newQueue = newQueue.slice(1);
        }
    }

    isUpdatingSupabase.current = true; // Set flag to prevent redundant update from onStateChange
    onSongChange(newCurrentSong, newQueue); // Notify Room.jsx to update Supabase
    setTimeout(() => { isUpdatingSupabase.current = false; }, 500); // Reset flag after short delay
  };

  const handlePrev = () => {
    if (!currentSong || Object.keys(currentSong).length === 0) return;
    if (playerRef.current && playerInstanceReady.current) {
      isUpdatingSupabase.current = true; // Set flag
      onSeek(0); // Seek to beginning of current song
      setTimeout(() => { isUpdatingSupabase.current = false; }, 500); // Reset flag
    }
  };

  const handleSeek = (val) => {
    if (!playerRef.current || !playerInstanceReady.current || !currentSong || Object.keys(currentSong).length === 0) return;
    const newTime = val[0];
    playerRef.current.seekTo(newTime, true); // Immediately seek locally
    isUpdatingSupabase.current = true; // Set flag
    onSeek(newTime); // Notify Room.jsx to update Supabase
    setTimeout(() => { isUpdatingSupabase.current = false; }, 500); // Reset flag
  };

  const handleShuffleToggle = () => {
    const updatedShuffleState = !isShuffling;
    setIsShuffling(updatedShuffleState);

    if (updatedShuffleState) {
        const shuffledQueue = [...queue];
        for (let i = shuffledQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
        }
        isUpdatingSupabase.current = true; // Set flag
        onQueueUpdate(shuffledQueue); // Update remote queue with shuffled version
        setTimeout(() => { isUpdatingSupabase.current = false; }, 500); // Reset flag
    }
    // If unshuffling, you'd typically revert to an original order, which requires more complex state management.
    // For now, unshuffling just means future skips won't be random.
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Card className="bg-card/90 backdrop-blur-md border-border shadow-glow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center">
            {currentSong && Object.keys(currentSong).length > 0 ? (
              <img src={currentSong.thumbnail} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {currentSong && Object.keys(currentSong).length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-foreground truncate">{currentSong.title}</h3>
                </div>
                <p className="text-muted-foreground mb-1">{currentSong.artist}</p>
                <p className="text-sm text-muted-foreground">{currentSong.album}</p>
              </>
            ) : (
              <h3 className="text-lg text-muted-foreground">Nothing playing</h3>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShuffleToggle}>
                <Shuffle className={`w-4 h-4 ${isShuffling ? "text-pink-400" : "text-muted-foreground"}`} />
              </Button>
              <Button variant="ghost" size="sm" disabled={!currentSong || Object.keys(currentSong).length === 0} onClick={handlePrev}>
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="hero"
                size="lg"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full shadow-glow flex items-center justify-center"
                disabled={!currentSong || Object.keys(currentSong).length === 0}
              >
                {isLoading && currentSong && Object.keys(currentSong).length > 0 ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : internalIsPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
              <Button variant="ghost" size="sm" disabled={!currentSong || Object.keys(currentSong).length === 0} onClick={handleSkip}>
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 w-80">
              <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(progress)}</span>
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={duration || 1}
                step={1}
                className="flex-1"
                disabled={!currentSong || Object.keys(currentSong).length === 0}
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={internalVolume}
              onValueChange={(val) => {
                setInternalVolume(val);
                if (playerRef.current && playerInstanceReady.current) playerRef.current.setVolume(val[0]);
              }}
              max={100}
              step={1}
              className="w-20"
            />
          </div>
        </div>

        <div style={{ display: "none" }}>
          <div id="yt-player"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicPlayer;
