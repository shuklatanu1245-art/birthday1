"use client";
import React from "react";
import { motion } from "framer-motion";

const defaultTimeline = [
  {
    year: "Chapter 1",
    title: "A Special Beginning ✨",
    description: "The universe brought us together, starting a bond that would only grow stronger and more magical with time.",
    emoji: "🌟"
  },
  {
    year: "Chapter 2",
    title: "Unforgettable Memories 📸",
    description: "From spontaneous adventures to late-night conversations, every moment shared with you became a priceless treasure.",
    emoji: "💫"
  },
  {
    year: "Today",
    title: "Celebrating YOU! 🎂",
    description: "Here's to another amazing year of your life, filled with joy, success, love, and endless smiles!",
    emoji: "🎉"
  }
];

export default function MemoryTimeline({ timeline, themeColor = "gold-accent" }) {
  const items = (timeline && timeline.length > 0) ? timeline : defaultTimeline;

  return (
    <section className="w-full max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif text-gold-accent mb-4 drop-shadow-md">
          Our Beautiful Journey
        </h2>
        <p className="text-gray-300 text-lg font-sans max-w-xl mx-auto">
          A walkthrough of special chapters, milestones, and memories that make this bond unforgettable.
        </p>
      </div>

      <div className="relative">
        {/* Vertical glowing center line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-accent via-royal-pink to-transparent transform -translate-x-1/2 shadow-[0_0_15px_rgba(244,208,63,0.5)]" />

        <div className="space-y-12">
          {items.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative flex flex-col md:flex-row items-start ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Node / Circle */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-midnight-blue border-4 border-gold-accent shadow-[0_0_20px_rgba(244,208,63,0.8)] z-10 transform -translate-x-1/2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>

                {/* Card Container */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="glassmorphism p-6 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md shadow-2xl hover:border-gold-accent/50 transition-all duration-300"
                  >
                    <div className={`flex items-center space-x-2 mb-2 ${isEven ? "md:justify-end" : "justify-start"}`}>
                      <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-gold-accent/20 text-gold-accent border border-gold-accent/30">
                        {item.year || `Milestone ${index + 1}`}
                      </span>
                      {item.emoji && <span className="text-xl">{item.emoji}</span>}
                    </div>

                    <h3 className="text-2xl font-serif text-white font-bold mb-2">
                      {item.title}
                    </h3>

                    <p className="text-gray-300 font-sans leading-relaxed text-sm md:text-base">
                      {item.description}
                    </p>

                    {item.photo && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-white/20 shadow-lg">
                        <img 
                          src={item.photo} 
                          alt={item.title} 
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
