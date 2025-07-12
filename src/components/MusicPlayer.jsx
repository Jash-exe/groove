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
  isPlaying,
  playbackPosition,
  getSyncedPosition,
  volume,
  isShuffling,
  setIsShuffling,

  onPlay,
  onPause,
  onEnded,
  onSeek,
  onSongChange,
  onQueueUpdate,
}) => {
  const playerRef = useRef(null);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);
  const [internalVolume, setInternalVolume] = useState(volume);
  const youtubeApiLoaded = useRef(false); // Tracks if window.YT is available
  const playerInstanceReady = useRef(false); // NEW: Tracks if playerRef.current is fully ready

  // Update internal volume when prop changes
  useEffect(() => {
    setInternalVolume(volume);
    if (playerRef.current && playerInstanceReady.current) { // Check playerInstanceReady
      playerRef.current.setVolume(volume[0]);
    }
  }, [volume]);

  // Use useCallback for createPlayer to prevent unnecessary re-creations
  const createPlayer = useCallback((videoId) => {
    if (!window.YT || !window.YT.Player) {
      console.warn("YouTube Iframe API not ready yet for createPlayer.");
      return;
    }

    // If player exists and is playing the same video, just ensure state
    // ONLY check getVideoData if playerInstanceReady.current is true
    if (playerRef.current && playerInstanceReady.current && playerRef.current.getVideoData().video_id === videoId) {
      if (isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
        playerRef.current.playVideo();
      } else if (!isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PAUSED) {
        playerRef.current.pauseVideo();
      }
      const syncedTime = getSyncedPosition();
      const currentLocalTime = playerRef.current.getCurrentTime();
      if (Math.abs(currentLocalTime - syncedTime) > 1.5) {
        playerRef.current.seekTo(syncedTime, true);
      }
      setDuration(playerRef.current.getDuration());
      setIsLoading(false);
      return;
    }

    // If player exists but needs a new video or needs to be recreated
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        playerInstanceReady.current = false; // Reset readiness
    }

    playerRef.current = new window.YT.Player("yt-player", {
      videoId: videoId,
      playerVars: {
        controls: 0,
        modestbranding: 1,
        disablekb: 1,
        enablejsapi: 1,
        autoplay: 0,
      },
      events: {
        onReady: (e) => {
          playerInstanceReady.current = true; // Player instance is now fully ready!
          e.target.setVolume(internalVolume[0]);
          const syncedPos = getSyncedPosition();
          e.target.seekTo(syncedPos, true);
          if (isPlaying) {
            e.target.playVideo();
          } else {
            e.target.pauseVideo();
          }
          setDuration(e.target.getDuration());
          setIsLoading(false);
          setInternalIsPlaying(isPlaying);
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING && !internalIsPlaying) {
            onPlay();
          } else if (e.data === window.YT.PlayerState.PAUSED && internalIsPlaying) {
            onPause();
          } else if (e.data === window.YT.PlayerState.ENDED) {
            handleSkip();
          }
          setInternalIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          setIsLoading(e.data === window.YT.PlayerState.BUFFERING || e.data === window.YT.PlayerState.UNSTARTED);
        },
        onError: (e) => {
          console.error("YouTube Player Error:", e);
          setIsLoading(false);
          if (queue.length > 0) {
            handleSkip();
          }
        }
      },
    });
  }, [isPlaying, internalVolume, getSyncedPosition, onPlay, onPause, onEnded, queue]);

  // Load YouTube Iframe API script and set global callback
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      youtubeApiLoaded.current = true; // Mark API as loaded
      // If a song is already set, and the API is ready, try to create the player
      if (currentSong && Object.keys(currentSong).length > 0) {
          createPlayer(currentSong.videoId);
      }
    };

    return () => {
      const tag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (tag && document.body.contains(tag)) {
        document.body.removeChild(tag);
      }
      delete window.onYouTubeIframeAPIReady;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        playerInstanceReady.current = false; // Reset on cleanup
      }
    };
  }, []); // Empty dependency array to run once on mount

  // Effect to react to synchronized state changes (play/pause, song change, seek)
  useEffect(() => {
    // If no song, stop player and reset UI
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
    // or song changed (needs new player/load)
    if (!youtubeApiLoaded.current || !playerInstanceReady.current || playerRef.current.getVideoData().video_id !== currentSong.videoId) {
      // Only attempt to create/load player if YouTube API is loaded
      if (youtubeApiLoaded.current) {
        createPlayer(currentSong.videoId);
      }
      return; // Exit, as player creation/loading will handle the state sync
    }

    // If same song and player instance is ready, but state (play/pause/seek) might have changed
    if (isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
      playerRef.current.playVideo();
    } else if (!isPlaying && playerRef.current.getPlayerState() !== window.YT.PlayerState.PAUSED) {
      playerRef.current.pauseVideo();
    }

    const currentLocalTime = playerRef.current.getCurrentTime();
    const syncedTime = getSyncedPosition();
    const diff = Math.abs(currentLocalTime - syncedTime);

    if (diff > 1.5) {
      playerRef.current.seekTo(syncedTime, true);
    }
  }, [currentSong, isPlaying, getSyncedPosition, createPlayer, youtubeApiLoaded, playerInstanceReady]); // Added new refs to dependencies


  useEffect(() => {
    clearInterval(intervalRef.current);
    if (internalIsPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerInstanceReady.current) { // Check playerInstanceReady
          const current = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          setProgress(current);
          setDuration(dur);
        }
      }, 500);
    }
    return () => clearInterval(intervalRef.current);
  }, [internalIsPlaying]);

  const togglePlay = () => {
    if (!playerRef.current || !playerInstanceReady.current || !currentSong || Object.keys(currentSong).length === 0) return; // Guard with playerInstanceReady
    internalIsPlaying ? onPause() : onPlay();
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

    onSongChange(newCurrentSong, newQueue);
  };

  const handlePrev = () => {
    if (!currentSong || Object.keys(currentSong).length === 0) return;
    if (playerRef.current && playerInstanceReady.current) { // Guard with playerInstanceReady
      onSeek(0);
    }
  };

  const handleSeek = (val) => {
    if (!playerRef.current || !playerInstanceReady.current || !currentSong || Object.keys(currentSong).length === 0) return; // Guard with playerInstanceReady
    const newTime = val[0];
    onSeek(newTime);
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
        onQueueUpdate(shuffledQueue);
    }
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
                if (playerRef.current && playerInstanceReady.current) playerRef.current.setVolume(val[0]); // Guard with playerInstanceReady
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

