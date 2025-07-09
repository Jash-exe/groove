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
  // Audio settings state
  const [masterVolume, setMasterVolume] = useState(75);
  const [audioDevices, setAudioDevices] = useState([{ deviceId: "default", label: "Default" }]);
  const [selectedDevice, setSelectedDevice] = useState("default");
  const [audioQuality, setAudioQuality] = useState("high");

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

  // Helper for sharing room
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
      // Remove user from participants table
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("room_code", roomCode)
        .eq("user_name", userName);
  
      if (error) {
        console.error("Error removing participant:", error.message);
      }
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
  

  // Fetch audio output devices
  useEffect(() => {
    if (!audioModalOpen) return;
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const outputs = devices.filter((d) => d.kind === "audiooutput");
      setAudioDevices([{ deviceId: "default", label: "Default" }, ...outputs.map((d) => ({ deviceId: d.deviceId, label: d.label || `Device ${d.deviceId.slice(-4)}` }))]);
    });
  }, [audioModalOpen]);

  // Pass volume to MusicPlayer
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
          {
            event: "INSERT",
            schema: "public",
            table: "participants",
            filter: `room_code=eq.${roomCode}`,
          },
          (payload) => {
            console.log("Participant joined:", payload);
            setParticipants((prev) => {
              const newParticipant = payload.new;
              const exists = prev.some((p) => p.id === newParticipant.id);
              if (exists) return prev;
              const isHost = prev.length === 0;
              return [
                ...prev,
                {
                  id: newParticipant.id,
                  name: newParticipant.user_name === userName ? `${newParticipant.user_name} (You)` : newParticipant.user_name,
                  avatar: "🎧",
                  isHost,
                  isActive: true,
                },
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
            filter: `room_code=eq.${roomCode}`, // This is the correct way to add the filter
          },
          (payload) => {
            console.log("Participant left:", payload);
            // You can remove the manual check now as the filter above handles it
            // if (payload?.old?.room_code !== roomCode) return;
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
            volume={playerVolume}
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
          {/* Quick Actions Section */}
          <Card className="mt-6 bg-card/80 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full flex justify-start gap-2" onClick={() => setAudioModalOpen(true)}>
                <span className="mr-2"><Volume2 className="w-4 h-4" /></span>
                Audio Settings
              </Button>
              <Button variant="outline" className="w-full flex justify-start gap-2" onClick={handleShareRoom}>
                <span className="mr-2"><Share2 className="w-4 h-4" /></span>
                Share Room
              </Button>
              <Button variant="destructive" className="w-full flex justify-start gap-2" onClick={() => setLeaveDialogOpen(true)}> 
                Leave Room
              </Button>
            </CardContent>
          </Card>
          {/* Audio Settings Modal */}
          {audioModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
              <div className="bg-[#181825] rounded-2xl border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] p-8 w-full max-w-lg relative">
                <button className="absolute top-4 right-4 text-muted-foreground hover:text-white" onClick={() => setAudioModalOpen(false)}><X className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold text-white mb-8">Audio Settings</h2>
                <div className="mb-8">
                  <label className="block text-white font-semibold mb-2">Master Volume</label>
                  <Slider
                    value={[masterVolume]}
                    onValueChange={val => setMasterVolume(val[0])}
                    max={100}
                    min={0}
                    step={1}
                  />
                  <div className="text-slate-300 text-sm mt-2">{masterVolume}%</div>
                </div>
                <div className="mb-8">
                  <label className="block text-white font-semibold mb-2">Audio Device</label>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger>
                      <SelectValue>{audioDevices.find(d => d.deviceId === selectedDevice)?.label || "Default"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices
                        .filter(d => d.deviceId && d.deviceId !== "")
                        .map((d) => (
                          <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `Device ${d.deviceId.slice(-4)}`}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-2">
                  <label className="block text-white font-semibold mb-2">Audio Quality</label>
                  <Select value={audioQuality} onValueChange={setAudioQuality}>
                    <SelectTrigger>
                      <SelectValue>{audioQuality === "high" ? "High (320 kbps)" : audioQuality === "medium" ? "Medium (128 kbps)" : "Low (64 kbps)"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (320 kbps)</SelectItem>
                      <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                      <SelectItem value="low">Low (64 kbps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          {/* Leave Room Confirmation Dialog */}
          {leaveDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
              <div className="bg-[#181825] rounded-2xl border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-2">Leave Room?</h2>
                <p className="text-slate-300 mb-8">Are you sure you want to leave this room? You'll need the room code to rejoin.</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="px-6" onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" className="px-6" onClick={handleLeaveRoom}>Leave Room</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Room;
