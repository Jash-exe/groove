import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat, Heart } from "lucide-react";

interface MusicPlayerProps {
  currentSong: {
    title: string;
    artist: string;
    album: string;
    duration: string;
    currentTime: string;
  };
}

const MusicPlayer = ({ currentSong }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([35]);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one

  return (
    <Card className="bg-card/90 backdrop-blur-md border-border shadow-glow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Album Art */}
          <div className="w-20 h-20 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-sm">
            <div className="w-16 h-16 bg-gradient-secondary rounded-md flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-foreground truncate">
                {currentSong.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-red-500" : "text-muted-foreground"}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
            <p className="text-muted-foreground mb-1">{currentSong.artist}</p>
            <p className="text-sm text-muted-foreground">{currentSong.album}</p>
            
            {/* Sync Status */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                🟢 In Sync
              </Badge>
              <span className="text-xs text-muted-foreground">All listeners synchronized</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            {/* Transport Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsShuffled(!isShuffled)}
                className={isShuffled ? "text-primary" : "text-muted-foreground"}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                variant="hero"
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full shadow-glow"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>
              
              <Button variant="ghost" size="sm">
                <SkipForward className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRepeatMode((repeatMode + 1) % 3)}
                className={repeatMode > 0 ? "text-primary" : "text-muted-foreground"}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === 2 && <span className="text-xs ml-1">1</span>}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 w-80">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {currentSong.currentTime}
              </span>
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {currentSong.duration}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicPlayer;