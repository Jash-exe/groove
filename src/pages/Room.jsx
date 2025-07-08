import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import axios from "axios";
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
  Share2,
  X
} from "lucide-react";

import MusicPlayer from "@/components/MusicPlayer";
import ChatPanel from "@/components/ChatPanel";
import GamePanel from "@/components/GamePanel";
import KaraokePanel from "@/components/KaraokePanel";
import ParticipantsList from "@/components/ParticipantsList";

const Room = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const userName = location.state?.userName || "You";
  const roomName = location.state?.roomName || "Chill Vibes Room";

  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("music");

  const [queue, setQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/search?query=${query}`);
      setSearchResults(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  const addToQueue = (song) => {
    const newQueue = [...queue, song];
    setQueue(newQueue);
    if (!currentSong) setCurrentSong(song);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFromQueue = (videoId) => {
    const newQueue = queue.filter((s) => s.videoId !== videoId);
    setQueue(newQueue);
    if (currentSong?.videoId === videoId) {
      setCurrentSong(newQueue.length > 0 ? newQueue[0] : null);
    }
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
        return;
      }
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
    
      // First participant is host (created first)
      const hostId = data?.[0]?.id;
    
      setParticipants(
        data.map((p) => ({
          id: p.id,
          name: p.user_name === userName ? `${p.user_name} (You)` : p.user_name,
          avatar: "🎧",
          isHost: p.id === hostId,
          isActive: true,
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
            <Button variant="ghost" size="sm"><Heart className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><Share2 className="w-4 h-4" /></Button>
            <Button variant="hero" size="sm">Invite Friends</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <MusicPlayer
            currentSong={currentSong}
            queue={queue}
            setCurrentSong={setCurrentSong}
            setQueue={setQueue}
          />

          <Card className="bg-card/80 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Room Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  <TabsContent value="music">
                    <input
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full p-2 border rounded mb-2 bg-muted/30 text-foreground"
                      placeholder="Search for songs..."
                    />
                    {searchResults.length > 0 && (
                      <div className="bg-card border border-border rounded mb-3">
                        {searchResults.map((song, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer"
                            onClick={() => addToQueue(song)}
                          >
                            <div className="flex items-center gap-2">
                              <img src={song.thumbnail} alt="" className="w-10 h-10 rounded" />
                              <div>
                                <p className="font-medium text-foreground">{song.title}</p>
                                <p className="text-xs text-muted-foreground">{song.artist}</p>
                              </div>
                            </div>
                            <Badge variant="outline">+ Add</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    {queue.map((song, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                          <img src={song.thumbnail} alt="" className="w-10 h-10 rounded" />
                          <div>
                            <p className="font-medium text-foreground">{song.title}</p>
                            <p className="text-xs text-muted-foreground">{song.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{song.duration}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => removeFromQueue(song.videoId)}>
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
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

        {/* Right Sidebar */}
        <div>
          <ParticipantsList participants={participants} />
        </div>
      </div>
    </div>
  );
};

export default Room;
