import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Music } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const JoinRoomDialog = ({ open, onOpenChange }) => {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast({
        title: "Room code required",
        description: "Please enter a room code to join.",
        variant: "destructive"
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter your username.",
        variant: "destructive"
      });
      return;
    }

    // Simulate room joining (in real app, this would check if room exists)
    toast({
      title: "Joining room...",
      description: `Welcome to room ${roomCode.toUpperCase()}, ${username}!`
    });

    // Navigate to room and close dialog
    navigate(`/room/${roomCode.toUpperCase()}`);
    setRoomCode("");
    setUsername("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setRoomCode("");
    setUsername("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Join Room
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the room code to join your friends' listening session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">Your Name</Label>
            <Input
              id="username"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roomCode" className="text-foreground">Room Code</Label>
            <Input
              id="roomCode"
              placeholder="Enter room code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="bg-input border-border text-foreground font-mono tracking-wider text-center text-lg"
              maxLength={6}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleJoinRoom}
              variant="hero"
              className="flex-1"
            >
              <Music className="w-4 h-4" />
              Join Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomDialog;