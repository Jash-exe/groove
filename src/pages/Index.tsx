import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, MessageCircle, Gamepad2, Users, Headphones, Mic } from "lucide-react";
import heroImage from "@/assets/hero-groove.jpg";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import JoinRoomDialog from "@/components/JoinRoomDialog";

const Index = () => {
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = useState(false);

  const features = [
    {
      icon: Music,
      title: "Synchronized Listening",
      description: "Listen to music together in perfect sync with your friends, no matter where you are."
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Chat with your friends while listening, share thoughts and discover new music together."
    },
    {
      icon: Gamepad2,
      title: "Interactive Games",
      description: "Play trivia, would you rather, and quiz games to spice up your listening sessions."
    },
    {
      icon: Mic,
      title: "Karaoke Mode",
      description: "Sing along with your favorite tracks and host virtual karaoke nights."
    },
    {
      icon: Users,
      title: "Private Rooms",
      description: "Create private listening rooms and invite friends with simple room codes."
    },
    {
      icon: Headphones,
      title: "High Quality Audio",
      description: "Experience crystal clear audio quality that brings you closer to the music."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-hero opacity-90"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Groove
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8 max-w-2xl mx-auto">
            Listen to music together, chat with friends, and play games in synchronized listening rooms
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => setCreateRoomOpen(true)}
              className="min-w-48"
            >
              <Music className="w-5 h-5" />
              Create Room
            </Button>
            <Button 
              variant="glass" 
              size="xl" 
              onClick={() => setJoinRoomOpen(true)}
              className="min-w-48"
            >
              <Users className="w-5 h-5" />
              Join Room
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Experience Music Together
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Groove brings people together through the power of shared music experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/60 backdrop-blur-sm border-border hover:bg-card/80 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-card/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to Groove?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your synchronized music journey today. Create a room and invite your friends!
          </p>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={() => setCreateRoomOpen(true)}
            className="text-lg px-12"
          >
            <Music className="w-6 h-6" />
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Dialogs */}
      <CreateRoomDialog open={createRoomOpen} onOpenChange={setCreateRoomOpen} />
      <JoinRoomDialog open={joinRoomOpen} onOpenChange={setJoinRoomOpen} />
    </div>
  );
};

export default Index;