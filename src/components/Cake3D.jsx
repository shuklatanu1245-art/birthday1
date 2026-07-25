"use client";
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Flickering Flame Component
function Flame({ blown }) {
  const flameRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (!flameRef.current || blown) return;
    const t = clock.getElapsedTime() * 10;
    // Flickering scale animation
    const scaleX = 1 + Math.sin(t) * 0.1;
    const scaleY = 1 + Math.cos(t * 1.2) * 0.15;
    flameRef.current.scale.set(scaleX, scaleY, scaleX);
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(t * 2) * 0.5;
    }
  });

  if (blown) return null;

  return (
    <group position={[0, 1.7, 0]}>
      {/* Outer Glow */}
      <mesh ref={flameRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.8} />
      </mesh>
      {/* Inner Core */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffaa" />
      </mesh>
      {/* Point light to illuminate cake */}
      <pointLight ref={lightRef} color="#ffaa00" intensity={3} distance={6} decay={2} />
    </group>
  );
}

// Smoke when blown
function Smoke({ blown }) {
  const smokeRef = useRef();
  const [opacity, setOpacity] = useState(0.8);

  useFrame((_, delta) => {
    if (!smokeRef.current || !blown) return;
    smokeRef.current.position.y += delta * 0.8;
    smokeRef.current.scale.x += delta * 0.5;
    smokeRef.current.scale.z += delta * 0.5;
    if (smokeRef.current.material) {
      smokeRef.current.material.opacity = Math.max(0, smokeRef.current.material.opacity - delta * 0.4);
    }
  });

  if (!blown) return null;

  return (
    <mesh ref={smokeRef} position={[0, 1.7, 0]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#cccccc" transparent opacity={0.6} />
    </mesh>
  );
}

// Complete 3D Cake Model
function CakeModel({ blown, themeColor = "#D12260" }) {
  return (
    <group position={[0, -0.5, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Cake Stand / Plate */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.15, 64]} />
          <meshStandardMaterial color="#eeeeee" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[1.2, 1.5, 0.3, 32]} />
          <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Bottom Cake Layer */}
        <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2, 2, 0.9, 64]} />
          <meshStandardMaterial color={themeColor} roughness={0.4} />
        </mesh>

        {/* Middle Icing Layer */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[2.02, 2.02, 0.1, 64]} />
          <meshStandardMaterial color="#fffdd0" roughness={0.3} />
        </mesh>

        {/* Top Cake Layer */}
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.7, 64]} />
          <meshStandardMaterial color="#ff99a8" roughness={0.4} />
        </mesh>

        {/* Top Cream Drips / Frosting */}
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[1.52, 1.52, 0.08, 64]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>

        {/* Decorative Cherries/Balls around top */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;
          return (
            <mesh key={i} position={[x, 1.1, z]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#ff0033" roughness={0.1} metalness={0.2} />
            </mesh>
          );
        })}

        {/* Candle */}
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 32]} />
          <meshStandardMaterial color="#33ccff" roughness={0.3} />
        </mesh>
        {/* Candle Wick */}
        <mesh position={[0, 1.72, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 16]} />
          <meshBasicMaterial color="#222222" />
        </mesh>

        {/* Animated Flame */}
        <Flame blown={blown} />
        <Smoke blown={blown} />

        {/* Sparkles around cake */}
        <Sparkles count={40} scale={4} size={3} speed={0.4} opacity={0.7} color="#FFD700" />
      </Float>

      <ContactShadows position={[0, -1.05, 0]} opacity={0.6} scale={10} blur={2} far={4} />
    </group>
  );
}

export default function Cake3D({ themeColor = "#D12260" }) {
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
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff0a54', '#ff477e', '#ff7096', '#FFD700', '#00f5d4']
    });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 80,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 80,
        origin: { x: 1 },
      });
    }, 400);
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
        
        // Calculate average volume/amplitude
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold for blowing into mic (usually causes high low-frequency noise / high average amplitude > 45)
        if (average > 45) {
          handleBlow();
        } else {
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        }
      };

      checkVolume();
    } catch (err) {
      console.error("Microphone access denied:", err);
      setMicError("Mic access denied or unavailable. Please tap the button below to blow!");
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
      <div className="text-center mb-6">
        <h2 className="text-4xl md:text-5xl font-serif text-gold-accent mb-3 drop-shadow-md">
          Make a Wish & Blow the Candle! 🎂
        </h2>
        <p className="text-gray-300 text-lg font-sans max-w-md mx-auto">
          Rotate the 3D birthday cake, close your eyes, make your special birthday wish, and blow out the candle!
        </p>
      </div>

      {/* 3D Canvas Container */}
      <div className="w-full h-[400px] md:h-[480px] relative rounded-3xl overflow-hidden glassmorphism border border-white/20 shadow-2xl bg-gradient-to-b from-white/5 to-black/40 mb-8 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <CakeModel blown={blown} themeColor={themeColor} />
          
          <OrbitControls 
            enablePan={false} 
            minDistance={3} 
            maxDistance={7} 
            maxPolarAngle={Math.PI / 2 + 0.1}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
        
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-gray-300 pointer-events-none border border-white/10">
          👆 Drag to rotate view
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        {!blown ? (
          <>
            {!micActive ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startMic}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-royal-pink to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-bold rounded-full shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 border border-pink-400/50 transition-all"
              >
                <span className="text-xl">🎙️</span>
                <span>Blow Into Mic</span>
              </motion.button>
            ) : (
              <div className="w-full sm:w-auto px-6 py-3 bg-red-600/80 animate-pulse text-white font-bold rounded-full flex items-center justify-center space-x-2 border border-red-400">
                <span className="text-xl">💨</span>
                <span>Blowing... Blow towards mic now!</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBlow}
              className="w-full sm:w-auto px-6 py-3 bg-gold-accent hover:bg-white text-midnight-blue font-bold rounded-full shadow-lg shadow-gold-accent/30 flex items-center justify-center space-x-2 transition-all"
            >
              <span className="text-xl">👆</span>
              <span>Tap to Blow Candle</span>
            </motion.button>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-4 w-full"
          >
            <div className="bg-gradient-to-r from-gold-accent/20 via-royal-pink/20 to-gold-accent/20 border border-gold-accent p-4 rounded-2xl text-center backdrop-blur-md w-full">
              <h3 className="text-2xl font-serif font-bold text-gold-accent animate-bounce mb-1">
                🎉 Wish Granted! 🎂
              </h3>
              <p className="text-white text-sm">
                May all your dreams and wishes come true this year!
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBlown(false)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-full border border-white/20 transition-all"
            >
              🔥 Light Candle Again
            </motion.button>
          </motion.div>
        )}
      </div>

      {micError && (
        <p className="text-xs text-red-400 mt-3 text-center bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-lg max-w-sm">
          {micError}
        </p>
      )}
    </section>
  );
}
