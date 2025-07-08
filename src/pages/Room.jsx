import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  Users,
  MessageCircle,
  Gamepad2,
  Mic,
  Heart,
  Share2
} from "lucide-react";

import MusicPlayer from "@/components/MusicPlayer";
import ChatPanel from "@/components/ChatPanel";
import ParticipantsList from "@/components/ParticipantsList";
import GamePanel from "@/components/GamePanel";
import KaraokePanel from "@/components/KaraokePanel";

const Room = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const userName = location.state?.userName || "You";
  const [roomName, setRoomName] = useState("Loading...");
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("music");

  // Dummy song
  const currentSong = {
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    duration: "4:03",
    currentTime: "1:32"
  };

  useEffect(() => {
    let subscription;

    const fetchRoomData = async () => {
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", roomCode)
        .single();

      if (roomError || !roomData) {
        console.error("Error fetching room:", roomError?.message);
        setRoomName("Room Not Found");
        return;
      }

      setRoomName(roomData.room_name || `Room ${roomCode}`);
    };

    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("room_code", roomCode)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching participants:", error.message);
        return;
      }

      setParticipants(
        data.map((p) => ({
          id: p.id,
          name: p.user_name,
          avatar: "🎧",
          isActive: true
        }))
      );
    };

    const subscribeToParticipants = () => {
      subscription = supabase
        .channel("room-participants-" + roomCode)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "participants", filter: `room_code=eq.${roomCode}` },
          () => fetchParticipants()
        )
        .subscribe();
    };

    fetchRoomData();
    fetchParticipants();
    subscribeToParticipants();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomCode]);

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{roomName}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">{roomCode}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {participants.length}
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
        {/* Left 3/4 */}
        <div className="lg:col-span-3 space-y-6">
          <MusicPlayer currentSong={currentSong} />

          <Card className="bg-card/80 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Room Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                  <TabsTrigger value="music" className="flex items-center gap-2">
                    <Music className="w-4 h-4" /> Queue
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Chat
                  </TabsTrigger>
                  <TabsTrigger value="games" className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" /> Games
                  </TabsTrigger>
                  <TabsTrigger value="karaoke" className="flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Karaoke
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="music" className="space-y-4">
                    <h3 className="font-semibold text-foreground">Up Next</h3>
                    {/* Dummy playlist */}
                    {[
                      { title: "Bohemian Rhapsody", artist: "Queen", addedBy: "Alex" },
                      { title: "Hotel California", artist: "Eagles", addedBy: "Jash" },
                    ].map((song, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{song.title}</p>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Added by {song.addedBy}</span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="chat">
                    <ChatPanel userName={userName} roomCode={roomCode} />
                  </TabsContent>

                  <TabsContent value="games">
                    <GamePanel userName={userName} roomCode={roomCode} />
                  </TabsContent>

                  <TabsContent value="karaoke">
                    <KaraokePanel userName={userName} roomCode={roomCode} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right 1/4 */}
        <div>
          <ParticipantsList participants={participants} />
        </div>
      </div>
    </div>
  );
};

export default Room;
