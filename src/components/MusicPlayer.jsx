import { useRef, useEffect, useState } from "react";
import {
  Play, Pause, SkipForward, SkipBack, Repeat, Volume2, Shuffle, Music
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MusicPlayer = ({ currentSong, queue, setCurrentSong, setQueue }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (currentSong && window.YT && window.YT.Player) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(currentSong.videoId);
      } else {
        playerRef.current = new window.YT.Player("yt-player", {
          videoId: currentSong.videoId,
          playerVars: { controls: 0, modestbranding: 1 },
          events: {
            onReady: () => {
              playerRef.current.setVolume(volume[0]);
              playerRef.current.playVideo();
              setIsPlaying(true);
              setDuration(playerRef.current.getDuration());
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                handleSkip();
              }
              setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
            },
          },
        });
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          setProgress(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const handleSkip = () => {
    const currentIndex = queue.findIndex((s) => s.videoId === currentSong?.videoId);
    if (isShuffling) {
      const next = queue[Math.floor(Math.random() * queue.length)];
      if (next) setCurrentSong(next);
    } else if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      setCurrentSong(queue[currentIndex + 1]);
    } else {
      // End of queue: clear
      setCurrentSong(null);
    }
  };

  const handlePrev = () => {
    const currentIndex = queue.findIndex((s) => s.videoId === currentSong?.videoId);
    if (currentIndex > 0) {
      setCurrentSong(queue[currentIndex - 1]);
    }
  };

  const handleSeek = (val) => {
    if (playerRef.current) {
      playerRef.current.seekTo(val[0]);
      setProgress(val[0]);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Card className="bg-card/90 backdrop-blur-md border-border shadow-glow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center">
            {currentSong ? (
              <img src={currentSong.thumbnail} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {currentSong ? (
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

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsShuffling(!isShuffling)}>
                <Shuffle className={`w-4 h-4 ${isShuffling ? "text-pink-400" : "text-muted-foreground"}`} />
              </Button>
              <Button variant="ghost" size="sm" disabled={!currentSong} onClick={handlePrev}>
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="hero"
                size="lg"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full shadow-glow flex items-center justify-center"
                disabled={!currentSong}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button variant="ghost" size="sm" disabled={!currentSong} onClick={handleSkip}>
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
                max={duration}
                step={1}
                className="flex-1"
                disabled={!currentSong}
              />
              <span className="text-xs text-muted-foreground w-10">
                {currentSong ? currentSong.duration : "--:--"}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={(val) => {
                setVolume(val);
                if (playerRef.current) playerRef.current.setVolume(val[0]);
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
