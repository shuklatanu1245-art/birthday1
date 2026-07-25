"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleOpen = () => {
    // Trigger confetti
    var duration = 3000;
    var end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D12260', '#F4D03F', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D12260', '#F4D03F', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    setIsOpen(true);
    // Ideally, we'd navigate to the main dashboard/surprise page here after a delay
    // setTimeout(() => router.push('/surprise'), 2000);
  };

  return (
    <main 
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center aurora-bg overflow-hidden"
    >
      {/* Top Bar for Admin Navigation */}
      <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2 font-serif text-gold-accent font-bold text-lg md:text-xl tracking-wider drop-shadow-md">
          <span>👑 Premium Birthday Studio</span>
        </div>
        <a 
          href="/admin" 
          className="px-4 py-2 md:px-6 md:py-2.5 rounded-full bg-glass-bg border border-gold-accent/50 text-gold-accent hover:bg-gold-accent hover:text-midnight-blue font-sans text-xs md:text-sm font-bold tracking-wide transition-all shadow-lg shadow-black/50 backdrop-blur-md flex items-center space-x-2"
        >
          <span>⚡ Admin Panel (Create & Manage)</span>
        </a>
      </header>
      
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="z-10 flex flex-col items-center text-center space-y-6"
          >
            <h1 className="text-6xl md:text-8xl font-serif text-glow bg-clip-text text-transparent bg-gradient-to-r from-gold-accent to-white">
              Happy Birthday
            </h1>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-widest text-white mt-4">
              Best Friend
            </h2>
            
            <p className="text-xl md:text-2xl text-royal-pink italic mt-4 shadow-black drop-shadow-md">
              "A Special Surprise Awaits You ❤️"
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(244, 208, 63, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="mt-12 px-8 py-4 bg-glass-bg border border-gold-accent/50 rounded-full text-gold-accent text-xl tracking-wide font-medium backdrop-blur-md hover:bg-gold-accent hover:text-midnight-blue transition-all duration-300"
            >
              Open Your Surprise
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* When Opened: The Main Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-midnight-blue/90 z-20"
          >
            <h2 className="text-5xl text-glow text-white">Welcome to your premium gift!</h2>
            <p className="text-lg text-gray-300 mt-4">(Navigation and other sections will be here)</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
