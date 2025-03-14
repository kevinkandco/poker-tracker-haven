
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, History } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 glassmorphism animate-slide-down">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-medium text-primary">PokerTracker</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link 
            to="/" 
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200"
          >
            <Clock size={20} />
            <span className="sr-only">Active Game</span>
          </Link>
          <Link 
            to="/history" 
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200"
          >
            <History size={20} />
            <span className="sr-only">History</span>
          </Link>
        </nav>
        
        <div className="md:hidden flex">
          <button className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
