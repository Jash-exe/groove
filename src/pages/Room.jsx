import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
  X,
  Volume2
} from "lucide-react";

import MusicPlayer from "@/components/MusicPlayer";
import ChatPanel from "@/components/ChatPanel";
import GamePanel from "@/components/GamePanel";
import KaraokePanel from "@/components/KaraokePanel";
import ParticipantsList from "@/components/ParticipantsList";
import { useToast, toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

const Room = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const userName = location.state?.userName || "You";
  const roomName = location.state?.roomName || "Chill Vibes Room";
  const navigate = useNavigate();
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [masterVolume, setMasterVolume] = useState(75);
  const [audioDevices, setAudioDevices] = useState([{ deviceId: "default", label: "Default" }]);
  const [selectedDevice, setSelectedDevice] = useState("default");
  const [audioQuality, setAudioQuality] = useState("high");

  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("music");

  const [queue, setQueue] = useState([]);
  const [originalQueue, setOriginalQueue] = useState([]); // used for shuffle display consistency
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
    setOriginalQueue((prev) => [...prev, song]);
    if (!currentSong) setCurrentSong(song);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFromQueue = (videoId) => {
    const newQueue = queue.filter((s) => s.videoId !== videoId);
    setQueue(newQueue);
    setOriginalQueue((prev) => prev.filter((s) => s.videoId !== videoId));
    if (currentSong?.videoId === videoId) {
      setCurrentSong(newQueue.length > 0 ? newQueue[0] : null);
    }
  };

  const handleShareRoom = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Room link copied!" });
    } catch (err) {
      toast({ title: "Failed to copy link", description: err.message, variant: "destructive" });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("room_code", roomCode)
        .eq("user_name", userName);

      if (error) console.error("Error removing participant:", error.message);
    } catch (err) {
      console.error("Unexpected error leaving room:", err);
    }

    setLeaveDialogOpen(false);
    navigate("/");
    toast({
      title: "Left room",
      description: "You've successfully left the room",
      position: "bottom-left"
    });
  };

  useEffect(() => {
    if (!audioModalOpen) return;
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const outputs = devices.filter((d) => d.kind === "audiooutput");
      setAudioDevices([
        { deviceId: "default", label: "Default" },
        ...outputs.map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Device ${d.deviceId.slice(-4)}`
        }))
      ]);
    });
  }, [audioModalOpen]);

  const [playerVolume, setPlayerVolume] = useState([75]);
  useEffect(() => {
    setPlayerVolume([masterVolume]);
  }, [masterVolume]);

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

      const hostId = data?.[0]?.id;

      setParticipants(
        data.map((p) => ({
          id: p.id,
          name: p.user_name === userName ? `${p.user_name} (You)` : p.user_name,
          avatar: "🎧",
          isHost: p.id === hostId,
          isActive: true
        }))
      );
    };

    const subscribeToParticipants = () => {
      subscription = supabase
        .channel("room-participants-" + roomCode)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "participants",
            filter: `room_code=eq.${roomCode}`
          },
          (payload) => {
            const newParticipant = payload.new;
            setParticipants((prev) => {
              const exists = prev.some((p) => p.id === newParticipant.id);
              if (exists) return prev;
              const isHost = prev.length === 0;
              return [
                ...prev,
                {
                  id: newParticipant.id,
                  name: newParticipant.user_name === userName
                    ? `${newParticipant.user_name} (You)`
                    : newParticipant.user_name,
                  avatar: "🎧",
                  isHost,
                  isActive: true
                }
              ];
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "participants",
            filter: `room_code=eq.${roomCode}`
          },
          (payload) => {
            const deletedId = payload.old.id;
            setParticipants((prev) => prev.filter((p) => p.id !== deletedId));
          }
        )
        .subscribe();
    };

    fetchRoomData();
    fetchParticipants();
    subscribeToParticipants();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [roomCode]);

  return (
    <div className="min-h-screen bg-gradient-secondary">
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
                  <Users className="w-3 h-3" />{participants.length}
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
        <div className="lg:col-span-3 space-y-6">
          <MusicPlayer
            currentSong={currentSong}
            queue={queue}
            setCurrentSong={setCurrentSong}
            setQueue={setQueue}
            volume={playerVolume}
          />

          <Card className="bg-card/80 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Room Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                  <TabsTrigger value="music"><Music className="w-4 h-4" /> Queue</TabsTrigger>
                  <TabsTrigger value="chat"><MessageCircle className="w-4 h-4" /> Chat</TabsTrigger>
                  <TabsTrigger value="games"><Gamepad2 className="w-4 h-4" /> Games</TabsTrigger>
                  <TabsTrigger value="karaoke"><Mic className="w-4 h-4" /> Karaoke</TabsTrigger>
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

                  <TabsContent value="chat"><ChatPanel userName={userName} roomCode={roomCode} /></TabsContent>
                  <TabsContent value="games"><GamePanel userName={userName} roomCode={roomCode} /></TabsContent>
                  <TabsContent value="karaoke"><KaraokePanel userName={userName} roomCode={roomCode} /></TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <ParticipantsList participants={participants} />
          <Card className="mt-6 bg-card/80 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full flex justify-start gap-2" onClick={() => setAudioModalOpen(true)}>
                <Volume2 className="w-4 h-4" /> Audio Settings
              </Button>
              <Button variant="outline" className="w-full flex justify-start gap-2" onClick={handleShareRoom}>
                <Share2 className="w-4 h-4" /> Share Room
              </Button>
              <Button variant="destructive" className="w-full flex justify-start gap-2" onClick={() => setLeaveDialogOpen(true)}>
                Leave Room
              </Button>
            </CardContent>
          </Card>

          {/* Modals (Audio + Leave) — same as before */ }
          {/* Keep your modal code as-is — no change needed */}
        </div>
      </div>
    </div>
  );
};

export default Room;
