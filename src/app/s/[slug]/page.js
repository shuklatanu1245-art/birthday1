"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function SurprisePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSurpriseData = async () => {
      try {
        const q = query(collection(db, "surprises"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setData(querySnapshot.docs[0].data());
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchSurpriseData();
  }, [slug]);

  const handleOpen = () => {
    var duration = 3000;
    var end = Date.now() + duration;

    // Different confetti colors based on relation type
    const colors = data?.relationType === "Girlfriend" ? ['#ff0a54', '#ff477e', '#ff7096'] : ['#D12260', '#F4D03F', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    setIsOpen(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-midnight-blue text-white text-2xl font-serif">Loading your surprise...</div>;
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center bg-midnight-blue text-white text-2xl font-serif">Oops! Surprise not found.</div>;
  }

  // Determine theme based on relation
  const isRomantic = data.relationType === "Girlfriend" || data.relationType === "Boyfriend";
  const themeClass = isRomantic ? "bg-gradient-to-br from-[#23083D] to-[#D12260]" : "aurora-bg";

  return (
    <main className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${themeClass}`}>
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
              {data.name}
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-midnight-blue/90 z-20 p-8 overflow-y-auto"
          >
            <div className="glassmorphism max-w-2xl w-full p-8 text-center mt-32 md:mt-0">
              <h2 className="text-4xl font-serif text-gold-accent mb-6">Dear {data.name},</h2>
              <div className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap font-sans text-left">
                {data.letterContent}
              </div>
              <p className="mt-8 text-royal-pink italic text-xl font-serif">
                With lots of love, <br/> Your {data.relationType === "Girlfriend" ? "Boyfriend" : "Friend"}
              </p>
            </div>
            {/* The rest of the sections (Gallery, Video, Timeline) will be built below this */}
            <p className="mt-12 text-gray-400 text-sm animate-pulse">Scroll down for more memories (Coming Soon)</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
