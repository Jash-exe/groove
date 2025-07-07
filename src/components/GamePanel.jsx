import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Trophy, Users, Clock, Play } from "lucide-react";

const GamePanel = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameInProgress, setGameInProgress] = useState(false);

  const games = [
    {
      id: "trivia",
      name: "Music Trivia",
      description: "Test your music knowledge with questions about artists, songs, and albums",
      icon: "🎵",
      players: "2-8",
      duration: "10-15 min",
      difficulty: "Medium"
    },
    {
      id: "would-you-rather",
      name: "Would You Rather",
      description: "Choose between two music-related scenarios and see what others pick",
      icon: "🤔",
      players: "2-10",
      duration: "5-10 min",
      difficulty: "Easy"
    },
    {
      id: "guess-the-song",
      name: "Guess the Song",
      description: "Listen to short clips and guess the song title and artist",
      icon: "🎧",
      players: "2-6",
      duration: "15-20 min",
      difficulty: "Hard"
    },
    {
      id: "music-quiz",
      name: "Music Quiz",
      description: "Answer questions about music history, theory, and pop culture",
      icon: "📚",
      players: "2-8",
      duration: "20-25 min",
      difficulty: "Hard"
    }
  ];

  const currentTrivia = {
    question: "Which band released the album 'Dark Side of the Moon' in 1973?",
    options: ["Led Zeppelin", "Pink Floyd", "The Beatles", "Queen"],
    timeLeft: 15,
    currentPlayer: "Alex",
    scores: [
      { name: "You", score: 150 },
      { name: "Alex", score: 120 },
      { name: "Sam", score: 90 },
      { name: "Jordan", score: 180 }
    ]
  };

  const handleStartGame = (gameId) => {
    setSelectedGame(gameId);
    setGameInProgress(true);
  };

  if (gameInProgress && selectedGame === "trivia") {
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-lg">🎵</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Music Trivia</h3>
              <p className="text-sm text-muted-foreground">Round 3 of 10</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setGameInProgress(false)}>
            Leave Game
          </Button>
        </div>

        {/* Current Question */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {currentTrivia.currentPlayer}'s turn - {currentTrivia.timeLeft}s left
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-foreground mb-6">
                {currentTrivia.question}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTrivia.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-4 h-auto text-left justify-start"
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
              
              <Progress value={(currentTrivia.timeLeft / 30) * 100} className="mt-6" />
            </div>
          </CardContent>
        </Card>

        {/* Scoreboard */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentTrivia.scores
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-foreground">{player.name}</span>
                    </div>
                    <span className="font-semibold text-primary">{player.score}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Game Room</h3>
        <p className="text-sm text-muted-foreground">
          Play interactive games with your friends while listening to music
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game) => (
          <Card key={game.id} className="bg-muted/30 border-border hover:bg-muted/40 transition-colors cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <CardTitle className="text-sm text-foreground">{game.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {game.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {game.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {game.players} players
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {game.duration}
                </span>
              </div>
              
              <Button 
                variant="hero" 
                size="sm" 
                className="w-full"
                onClick={() => handleStartGame(game.id)}
              >
                <Play className="w-4 h-4" />
                Start Game
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GamePanel;