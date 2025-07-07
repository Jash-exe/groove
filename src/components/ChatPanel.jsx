import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Smile, Music } from "lucide-react";

const ChatPanel = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "System",
      message: "Welcome to the room! 🎵",
      timestamp: "2:30 PM",
      type: "system"
    },
    {
      id: 2,
      user: "Alex",
      message: "Hey everyone! Great song choice! 🔥",
      timestamp: "2:31 PM",
      type: "message",
      avatar: "🎧"
    },
    {
      id: 3,
      user: "Sam",
      message: "Added Bohemian Rhapsody to the queue!",
      timestamp: "2:32 PM",
      type: "song",
      avatar: "🎤"
    },
    {
      id: 4,
      user: "Jordan",
      message: "This beat is incredible! Anyone know the artist?",
      timestamp: "2:33 PM",
      type: "message",
      avatar: "🎸"
    },
    {
      id: 5,
      user: "You",
      message: "It's M83 - they're amazing for late night vibes",
      timestamp: "2:34 PM",
      type: "message",
      avatar: "🎵"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      user: "You",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "message",
      avatar: "🎵"
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Chat Messages */}
      <ScrollArea className="h-80 w-full rounded-lg border border-border bg-muted/20 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.type === 'system' ? 'justify-center' : ''}`}>
              {msg.type === 'system' ? (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {msg.message}
                  </Badge>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">
                        {msg.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp}
                      </span>
                      {msg.type === 'song' && (
                        <Badge variant="outline" className="text-xs">
                          <Music className="w-3 h-3 mr-1" />
                          Song
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground break-words">
                      {msg.message}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-input border-border text-foreground"
        />
        <Button variant="ghost" size="sm">
          <Smile className="w-4 h-4" />
        </Button>
        <Button variant="hero" size="sm" onClick={handleSendMessage}>
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Reactions */}
      <div className="flex gap-2 flex-wrap">
        {["🔥", "💯", "🎵", "👏", "😍", "🚀"].map((emoji) => (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            className="text-lg p-2 h-auto"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatPanel;