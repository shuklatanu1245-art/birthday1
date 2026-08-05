"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function Cake3D({ themeColor = "#D12260", photoUrl, letterContent, name, senderName, relationType }) {
  const [blown, setBlown] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState("");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Trigger celebration on blow
  const handleBlow = () => {
    if (blown) return;
    setBlown(true);
    stopMic();

    // Massive Confetti Explosion
    confetti({
      particleCount: 180,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#ff0a54', '#ff477e', '#ff7096', '#FFD700', '#00f5d4', '#ffffff']
    });
    setTimeout(() => {
      confetti({
        particleCount: 120,
        angle: 60,
        spread: 80,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 120,
        angle: 120,
        spread: 80,
        origin: { x: 1 },
      });
    }, 300);
  };

  // Start Microphone Air Blow Detection
  const startMic = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicActive(true);

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold for blowing into mic (air pressure onto mic diaphragm creates high amplitude > 35)
        if (average > 35) {
          handleBlow();
        } else {
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        }
      };

      checkVolume();
    } catch (err) {
      console.error("Microphone access denied:", err);
      setMicError("Microphone permission denied! Please allow microphone access in your browser settings to blow out the candle.");
      setMicActive(false);
    }
  };

  const stopMic = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (microphoneRef.current && microphoneRef.current.mediaStream) {
      microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    setMicActive(false);
  };

  useEffect(() => {
    return () => stopMic();
  }, []);

  return (
    <section className="w-full max-w-4xl mx-auto py-16 px-4 flex flex-col items-center">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-serif text-gold-accent mb-3 drop-shadow-md">
          Make a Wish & Blow the Candle! 🎂
        </h2>
        <p className="text-gray-200 text-lg font-sans max-w-md mx-auto">
          Make your special wish, and blow air into your microphone to extinguish the candle!
        </p>
      </div>

      {/* 2D Cake Image Container with CSS Candle */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 mb-12 flex justify-center">
        
        {/* The Candle and Flame (Absolute positioned on top of cake) */}
        {!blown && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
            {/* Flame */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 0.9, 1.2, 1],
                rotate: [-2, 2, -1, 3, -2],
                opacity: [0.8, 1, 0.9, 1, 0.8]
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-6 h-8 bg-gradient-to-t from-yellow-300 via-orange-400 to-red-500 blur-[1px] shadow-[0_0_25px_#ff9900]"
              style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
            />
            {/* Wick */}
            <div className="w-1 h-2 bg-gray-800 rounded-full -mt-1" />
            {/* Candle Stick */}
            <div className="w-5 h-16 bg-gradient-to-r from-red-500 via-pink-400 to-red-500 rounded-sm border border-white/50 shadow-md" />
          </div>
        )}
        
        {/* Smoke after blowing */}
        {blown && (
          <motion.div 
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -50, scale: 2 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-300 rounded-full blur-md z-10"
          />
        )}

        {/* The Uploaded Cake Image */}
        <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-gold-accent shadow-[0_0_40px_rgba(255,215,0,0.3)] bg-black/40 backdrop-blur-md p-1 relative z-0">
          {photoUrl ? (
             <img src={photoUrl} alt="Birthday Cake" className="w-full h-full object-cover rounded-xl" />
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                <span className="text-6xl mb-2">🎂</span>
                <p>No cake image uploaded</p>
             </div>
          )}
        </div>
      </div>

      {/* Control Buttons - Only Mic Button */}
      <div className="flex flex-col items-center justify-center w-full max-w-lg">
        {!blown ? (
          <div className="w-full flex flex-col items-center">
            {!micActive ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startMic}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-accent via-royal-pink to-pink-600 hover:opacity-95 text-midnight-blue font-extrabold text-lg md:text-xl tracking-wide rounded-full shadow-2xl shadow-pink-500/50 flex items-center justify-center space-x-3 border-2 border-white/50 transition-all cursor-pointer"
              >
                <span className="text-2xl animate-bounce">🎙️</span>
                <span>Click Here & Blow Into Mic to Extinguish Candle! 🕯️💨</span>
              </motion.button>
            ) : (
              <div className="w-full sm:w-auto px-8 py-4 bg-red-600 animate-pulse text-white font-extrabold text-lg md:text-xl rounded-full flex items-center justify-center space-x-3 border-2 border-yellow-300 shadow-2xl shadow-red-500/50">
                <span className="text-2xl animate-spin">💨</span>
                <span>Blowing Active... Blow air towards your mic NOW! 🎂</span>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-4 w-full"
          >
            <div className="bg-gradient-to-r from-gold-accent/30 via-royal-pink/30 to-gold-accent/30 border-2 border-gold-accent p-6 rounded-2xl text-center backdrop-blur-md w-full shadow-2xl shadow-gold-accent/20">
              <h3 className="text-3xl font-serif font-bold text-gold-accent animate-bounce mb-2">
                🎉 Wish Granted! 🎂
              </h3>
              <div className="text-white text-lg font-sans whitespace-pre-wrap break-words break-all leading-relaxed text-left w-full mt-6 pt-6 border-t border-white/20">
                {name && <h2 className="text-3xl font-serif text-gold-accent mb-4">Dear {name},</h2>}
                {letterContent}
                
                <div className="mt-8 text-royal-pink italic font-serif text-right w-full">
                  <p className="text-xl">With lots of love,</p>
                  {senderName ? (
                    <p className="text-2xl font-bold">{senderName}</p>
                  ) : (
                    <p className="text-xl">Your {relationType === "Girlfriend" ? "Boyfriend" : "Friend"}</p>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBlown(false)}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-gold-accent font-bold text-sm rounded-full border border-gold-accent/40 transition-all shadow-md"
            >
              🔥 Light Candle Again
            </motion.button>
          </motion.div>
        )}
      </div>

      {micError && (
        <p className="text-xs text-red-400 mt-4 text-center bg-red-950/80 border border-red-500 px-4 py-2 rounded-xl max-w-md shadow-lg">
          ⚠️ {micError}
        </p>
      )}
    </section>
  );
}
