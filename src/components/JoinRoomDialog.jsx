import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const JoinRoomDialog = ({ open, onOpenChange }) => {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      toast({
        title: "Your name is required",
        description: "Please enter your name to join the room.",
        variant: "destructive"
      });
      return;
    }
    if (!roomCode.trim()) {
      toast({
        title: "Room code is required",
        description: "Please enter a room code to join.",
        variant: "destructive"
      });
      return;
    }

    // Validate room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("room_name")
      .eq("code", roomCode)
      .single();

    if (roomError || !room) {
      toast({
        title: "Invalid Room Code",
        description: "No room found with that code.",
        variant: "destructive"
      });
      return;
    }
    // console.log("Trying to join with", { roomCode, username });

    setRoomName(room.room_name);

    // Insert into participants table
    const { data: participantData, error: joinError } = await supabase
      .from("participants")
      .insert([{ room_code: roomCode, user_name: username }])
      .select();

    if (joinError) {
      console.error("Join error:", joinError);
      toast({
        title: "Failed to join room",
        description: joinError.message,
        variant: "destructive"
      });
      return;
    }

    console.log("Participant added:", participantData);

    setIsJoined(true);
    toast({
      title: `Welcome to ${room.room_name}!`,
      description: "You're now part of the room."
    });
  };

  const handleClose = () => {
    setUsername("");
    setRoomCode("");
    setRoomName("");
    setIsJoined(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Music className="w-5 h-5 text-primary" />
            {isJoined ? "Joined Room!" : "Join a Room"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isJoined
              ? "You're in! Let the music flow 🎵"
              : "Enter your name and a room code to join an existing session."
            }
          </DialogDescription>
        </DialogHeader>

        {!isJoined ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Your Name
              </Label>
              <Input
                id="username"
                placeholder="Enter your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomCode" className="text-foreground">
                Room Code
              </Label>
              <Input
                id="roomCode"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="bg-input border-border text-foreground uppercase"
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              className="w-full"
              variant="hero"
              size="lg"
            >
              Join Room
            </Button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="font-semibold text-foreground">
              {roomName}
            </p>
            <Button
              variant="hero"
              className="w-full"
              onClick={() => {
                navigate(`/room/${roomCode}`, {
                  state: { roomName, userName: username, roomCode }
                });
                handleClose();
              }}
            >
              Enter Room
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomDialog;
