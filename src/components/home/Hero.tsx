
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Users, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <div className="py-20 md:py-28 flex flex-col items-center text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-primary/10 blur-3xl rounded-full"></div>
        <div className="p-4 rounded-full bg-primary/5 animate-pulse-subtle">
          <DollarSign size={40} className="text-primary" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-4">
        Track your poker games with precision
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
        Real-time bet tracking, custom blind settings, and seamless gameplay for your poker sessions.
      </p>
      
      <Link to="/game">
        <Button size="lg" className="button-hover">
          Start Tracking
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-3xl">
        <FeatureCard 
          icon={<Users className="h-6 w-6" />}
          title="Multiple Players"
          description="Track bets for all players at your table with ease."
        />
        <FeatureCard 
          icon={<DollarSign className="h-6 w-6" />}
          title="Custom Blinds"
          description="Set and adjust blind levels to match your game."
        />
        <FeatureCard 
          icon={<Clock className="h-6 w-6" />}
          title="Real-time Updates"
          description="See changes instantly as they happen during play."
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="p-6 rounded-lg border border-border bg-card shadow-sm card-hover">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default Hero;
