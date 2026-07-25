"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import MemoryTimeline from "@/components/MemoryTimeline";
import Cake3D from "@/components/Cake3D";

export default function SurprisePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchSurpriseData = async () => {
      try {
        const decodedSlug = decodeURIComponent(slug);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "fu2otsgk";
        const url = `https://res.cloudinary.com/${cloudName}/raw/upload/birthday_surprises/data/${decodedSlug}.json`;
        
        const res = await fetch(url, { cache: 'no-store' }); // Disable cache to get fresh updates
        
        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
        } else {
          setData(null);
          setErrorMsg(`No surprise found for link: /s/${decodedSlug}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMsg(error.message);
      }
      setLoading(false);
    };

    if (slug) fetchSurpriseData();
  }, [slug]);

  const getThemeConfig = () => {
    if (!data) return {};
    if (data.celebrationType === "Grand") {
      return {
        colors: ['#FFD700', '#C0C0C0', '#ffffff'],
        bgClass: "bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#434343]", // Royal Black & Silver
        audioSrc: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=epic-cinematic-trailer-113904.mp3", // Cinematic Epic
        emoji: "👑",
        titleGlow: "from-[#FFD700] via-white to-[#FFD700]"
      };
    } else if (data.relationType === "Girlfriend" || data.relationType === "Boyfriend" || data.celebrationType === "Romantic") {
      return {
        colors: ['#ff0a54', '#ff477e', '#ff7096'],
        bgClass: "bg-gradient-to-br from-[#2a0845] to-[#6441A5]", 
        audioSrc: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_731422b9c7.mp3?filename=romantic-piano-116534.mp3",
        emoji: "❤️",
        titleGlow: "from-pink-400 to-red-500"
      };
    } else if (data.celebrationType === "Party") {
      return {
        colors: ['#00f5d4', '#fee440', '#f15bb5', '#9b5de5'],
        bgClass: "bg-gradient-to-br from-[#141E30] to-[#243B55]", 
        audioSrc: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=upbeat-party-electronic-dance-10900.mp3",
        emoji: "🎉",
        titleGlow: "from-cyan-400 to-purple-500"
      };
    } else { // Quiet / Family
      return {
        colors: ['#FFD700', '#FDF5E6', '#ffffff'],
        bgClass: "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]", 
        audioSrc: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_0cbdfef2d1.mp3?filename=warm-acoustic-guitar-75304.mp3",
        emoji: "✨",
        titleGlow: "from-gold-accent to-white"
      };
    }
  };

  const handleOpen = () => {
    var duration = 3000;
    var end = Date.now() + duration;
    
    const theme = getThemeConfig();

    // Play Background Music (Custom audio if uploaded, else default theme song)
    const audioSource = data.customAudio || theme.audioSrc;
    const audio = new Audio(audioSource);
    audio.loop = true;
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Audio autoplay blocked by browser:", e));

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: theme.colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: theme.colors
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-midnight-blue text-white text-2xl font-serif p-8 text-center">
        <p className="mb-4">Oops! Surprise not found.</p>
        {errorMsg && <p className="text-sm text-royal-pink font-sans">Debug Info: {errorMsg}</p>}
      </div>
    );
  }

  const theme = getThemeConfig();

  return (
    <main className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${theme.bgClass}`}>
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="z-10 flex flex-col items-center text-center space-y-6"
          >
            <h1 className={`text-6xl md:text-8xl font-serif text-glow bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGlow}`}>
              Happy Birthday
            </h1>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-widest text-white mt-4">
              {data.name}
            </h2>
            
            <p className="text-xl md:text-2xl text-royal-pink italic mt-4 shadow-black drop-shadow-md">
              "A Special Surprise Awaits You {theme.emoji}"
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
            <div className="glassmorphism max-w-4xl w-full p-8 text-center mt-32 md:mt-0 mb-8 flex flex-col items-center">
              {data.friendPhoto && (
                <div className="mb-6 -mt-16">
                  <img src={data.friendPhoto} alt={data.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gold-accent shadow-2xl shadow-black/50" />
                </div>
              )}
              <h2 className="text-4xl font-serif text-gold-accent mb-6">Dear {data.name},</h2>
              <div className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap font-sans text-left w-full">
                {data.letterContent}
              </div>
              <div className="mt-8 text-royal-pink italic font-serif text-right w-full">
                <p className="text-xl">With lots of love,</p>
                {data.senderName ? (
                  <p className="text-2xl font-bold">{data.senderName}</p>
                ) : (
                  <p className="text-xl">Your {data.relationType === "Girlfriend" ? "Boyfriend" : "Friend"}</p>
                )}
              </div>
            </div>

            {/* Interactive 3D Cake Section */}
            <Cake3D themeColor={theme.colors?.[0] || "#D12260"} photoUrl={data.cakePhoto || data.friendPhoto} />

            {/* Memory Timeline Section */}
            <MemoryTimeline timeline={data.timeline} themeColor={theme.colors?.[0] || "#FFD700"} />
            
            {/* Gallery Section */}
            {data.gallery && data.gallery.length > 0 && (
              <div className="max-w-4xl w-full mb-16">
                <h3 className="text-3xl font-serif text-gold-accent text-center mb-8 border-b border-white/10 pb-4">Beautiful Memories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {data.gallery.map((url, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.05 }}
                      className="overflow-hidden rounded-xl shadow-lg border border-white/10 bg-white/5"
                    >
                      <img src={url} alt={`Memory ${index + 1}`} className="w-full h-auto object-cover hover:opacity-90 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="mt-8 text-gray-400 text-sm animate-pulse">More surprises coming soon!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
