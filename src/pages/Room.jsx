import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Users, MessageCircle, Gamepad2, Mic, Play, Pause, SkipForward, SkipBack, Volume2, Heart, Share2 } from "lucide-react";
import MusicPlayer from "@/components/MusicPlayer";
import ChatPanel from "@/components/ChatPanel";
import ParticipantsList from "@/components/ParticipantsList";
import GamePanel from "@/components/GamePanel";
import KaraokePanel from "@/components/KaraokePanel";

const Room = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("music");
  const roomName = location.state?.roomName || "Chill Vibes Room";
  const userName = location.state?.userName || "You";
  
  // Mock room data
  const roomData = {
    name: roomName,
    code: roomCode || "ABC123",
    participants: [
      { id: 1, name: `${userName} (You)`, avatar: "🎵", isHost: true, isActive: true },
      { id: 2, name: "Alex", avatar: "🎧", isHost: false, isActive: true },
      { id: 3, name: "Sam", avatar: "🎤", isHost: false, isActive: false },
      { id: 4, name: "Jordan", avatar: "🎸", isHost: false, isActive: true },
    ]
  };

  const currentSong = {
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    duration: "4:03",
    currentTime: "1:32"
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Room Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{roomData.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {roomData.code}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {roomData.participants.length}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="hero" size="sm">
              Invite Friends
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Music Player */}
          <MusicPlayer currentSong={currentSong} />
          
          {/* Tabs for Features */}
          <Card className="bg-card/80 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Room Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                  <TabsTrigger value="music" className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Queue
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="games" className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Games
                  </TabsTrigger>
                  <TabsTrigger value="karaoke" className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Karaoke
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <TabsContent value="music" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Up Next</h3>
                      {[
                        { title: "Bohemian Rhapsody", artist: "Queen", addedBy: "Alex" },
                        { title: "Hotel California", artist: "Eagles", addedBy: "Sam" },
                        { title: "Stairway to Heaven", artist: "Led Zeppelin", addedBy: "Jordan" },
                      ].map((song, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{song.title}</p>
                            <p className="text-sm text-muted-foreground">{song.artist}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Added by {song.addedBy}
                          </Badge>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        <Music className="w-4 h-4" />
                        Add Song to Queue
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="chat">
                    <ChatPanel />
                  </TabsContent>
                  
                  <TabsContent value="games">
                    <GamePanel />
                  </TabsContent>
                  
                  <TabsContent value="karaoke">
                    <KaraokePanel />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ParticipantsList participants={roomData.participants} />
          
          {/* Quick Actions */}
          <Card className="bg-card/80 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Volume2 className="w-4 h-4" />
                Audio Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="w-4 h-4" />
                Share Room
              </Button>
              <Button variant="destructive" size="sm" className="w-full justify-start">
                Leave Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Room;