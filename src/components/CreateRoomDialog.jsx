import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const CreateRoomDialog = ({ open, onOpenChange }) => {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const navigate = useNavigate();

  // Generate a 6-character uppercase room code
  const generateRoomCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      toast({
        title: "Your name is required",
        description: "Please enter your name to create a room.",
        variant: "destructive"
      });
      return;
    }
    if (!roomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for your room.",
        variant: "destructive"
      });
      return;
    }
  
    const newRoomCode = generateRoomCode();
  
    // Insert into rooms table with host_name
    const { data: roomData, error: roomError } = await supabase
  .from("rooms")
  .insert([{ room_name: roomName, code: newRoomCode, host_name: userName }]) // make sure host_name exists
  .select()
  .single();

if (roomError) {
  console.error("Room creation error object:", roomError);
  console.error("Room creation error details:");
  console.log("Message:", roomError.message);
  console.log("Details:", roomError.details);
  console.log("Hint:", roomError.hint);
  console.log("Code:", roomError.code);
 // Full error object
  toast({
    title: "Error creating room",
    description: roomError.message,
    variant: "destructive"
  });
  return;
}

  
    // Insert the creator into participants table
    const { error: partError } = await supabase
      .from("participants")
      .insert([{ room_code: newRoomCode, user_name: userName }]);
  
    if (partError) {
      console.error("Error adding participant:", partError);
      toast({
        title: "Failed to add participant",
        description: partError.message,
        variant: "destructive"
      });
      return;
    }
  
    setRoomCode(newRoomCode);
    setIsCreated(true);
    toast({
      title: "Room created successfully!",
      description: `Your room "${roomName}" is ready to go.`
    });
  };
  
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({
        title: "Room code copied!",
        description: "Share this code with your friends to join the room."
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the room code manually.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setUserName("");
    setRoomName("");
    setRoomCode("");
    setIsCreated(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Music className="w-5 h-5 text-primary" />
            {isCreated ? "Room Created!" : "Create New Room"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isCreated 
              ? "Your room is ready! Share the code with your friends."
              : "Create a new listening room for you and your friends."
            }
          </DialogDescription>
        </DialogHeader>

        {!isCreated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-foreground">Your Name</Label>
              <Input
                id="userName"
                placeholder="Enter your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomName" className="text-foreground">Room Name</Label>
              <Input
                id="roomName"
                placeholder="Enter room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button 
              onClick={handleCreateRoom} 
              className="w-full" 
              variant="hero"
              size="lg"
            >
              <Music className="w-4 h-4" />
              Create Room
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="bg-muted/50 border-border">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">{roomName}</p>
                  <p className="text-sm text-muted-foreground">Room Code</p>
                  <div className="flex items-center justify-center gap-2 p-3 bg-background rounded-lg border">
                    <code className="text-2xl font-bold text-primary tracking-wider">
                      {roomCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyRoomCode}
                      className="ml-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button 
                variant="hero" 
                className="flex-1"
                onClick={() => {
                  navigate(`/room/${roomCode}`, { state: { roomName, userName, roomCode } });
                  handleClose();
                }}
              >
                Enter Room
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
