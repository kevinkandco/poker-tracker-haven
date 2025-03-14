
import React from 'react';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import Hero from '@/components/home/Hero';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Container>
          <Hero />
        </Container>
      </main>
    </div>
  );
};

export default Index;
