import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Volume2, VolumeX, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ParticipantsList = ({ participants }) => {
  return (
    <Card className="bg-card/80 backdrop-blur-md border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-foreground flex items-center gap-2">
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
                  {participant.avatar}
                </div>
                {participant.isActive && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm truncate">
                    {participant.name}
                  </span>
                  {participant.isHost && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant={participant.isActive ? "secondary" : "outline"} 
                    className="text-xs"
                  >
                    {participant.isActive ? "🟢 Active" : "⚫ Away"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {participant.isActive ? (
                  <Volume2 className="w-3 h-3" />
                ) : (
                  <VolumeX className="w-3 h-3" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem className="text-foreground">
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground">
                    Send Message
                  </DropdownMenuItem>
                  {participant.name !== "You" && (
                    <>
                      <DropdownMenuItem className="text-foreground">
                        Mute User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Kick User
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;