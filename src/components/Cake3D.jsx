"use client";
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, ContactShadows, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

// Flickering Flame Component
function Flame({ blown }) {
  const flameRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (!flameRef.current || blown) return;
    const t = clock.getElapsedTime() * 10;
    // Flickering scale animation
    const scaleX = 1 + Math.sin(t) * 0.15;
    const scaleY = 1 + Math.cos(t * 1.2) * 0.2;
    flameRef.current.scale.set(scaleX, scaleY, scaleX);
    if (lightRef.current) {
      lightRef.current.intensity = 4 + Math.sin(t * 2) * 1;
    }
  });

  if (blown) return null;

  return (
    <group position={[0, 2.05, -0.4]}>
      {/* Outer Glow */}
      <mesh ref={flameRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#ff7700" transparent opacity={0.85} />
      </mesh>
      {/* Inner Core */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#ffffcc" />
      </mesh>
      {/* Point light to illuminate cake brightly */}
      <pointLight ref={lightRef} color="#ffbb00" intensity={5} distance={8} decay={1.5} />
    </group>
  );
}

// Smoke when blown
function Smoke({ blown }) {
  const smokeRef = useRef();

  useFrame((_, delta) => {
    if (!smokeRef.current || !blown) return;
    smokeRef.current.position.y += delta * 1.0;
    smokeRef.current.scale.x += delta * 0.6;
    smokeRef.current.scale.z += delta * 0.6;
    if (smokeRef.current.material) {
      smokeRef.current.material.opacity = Math.max(0, smokeRef.current.material.opacity - delta * 0.4);
    }
  });

  if (!blown) return null;

  return (
    <mesh ref={smokeRef} position={[0, 2.05, -0.4]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color="#dddddd" transparent opacity={0.7} />
    </mesh>
  );
}

// Complete 3D Cake Model
function CakeModel({ blown, themeColor = "#D12260", photoUrl }) {
  return (
    <group position={[0, -1.1, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Cake Stand / Plate */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.15, 64]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[1.2, 1.5, 0.3, 32]} />
          <meshStandardMaterial color="#dddddd" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Bottom Cake Layer */}
        <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2, 2, 0.9, 64]} />
          <meshStandardMaterial color={themeColor} roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Middle Icing Layer */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[2.02, 2.02, 0.1, 64]} />
          <meshStandardMaterial color="#fffdd0" roughness={0.2} />
        </mesh>

        {/* Top Cake Layer */}
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.7, 64]} />
          <meshStandardMaterial color="#ff8899" roughness={0.3} />
        </mesh>

        {/* Top Cream Drips / Frosting */}
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[1.52, 1.52, 0.08, 64]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>

        {/* Decorative Cherries around top */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;
          return (
            <mesh key={i} position={[x, 1.1, z]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color="#ff0033" roughness={0.1} metalness={0.3} />
            </mesh>
          );
        })}

        {/* Standing Photo Frame Topper on the Cake */}
        {photoUrl && (
          <Html position={[0, 1.55, 0.3]} transform distanceFactor={5}>
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-gold-accent shadow-[0_0_25px_rgba(255,215,0,0.9)] overflow-hidden bg-midnight-blue flex items-center justify-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
              <img src={photoUrl} alt="Cake Topper" className="w-full h-full object-cover" />
            </div>
          </Html>
        )}

        {/* Thick, Highly Visible Candle (positioned slightly behind photo topper) */}
        <mesh position={[0, 1.45, -0.4]}>
          <cylinderGeometry args={[0.12, 0.12, 0.85, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        {/* Candle Wick */}
        <mesh position={[0, 1.9, -0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
          <meshBasicMaterial color="#111111" />
        </mesh>

        {/* Animated Flame */}
        <Flame blown={blown} />
        <Smoke blown={blown} />

        {/* Sparkles around cake */}
        <Sparkles count={50} scale={5} size={4} speed={0.5} opacity={0.8} color="#FFD700" />
      </Float>

      <ContactShadows position={[0, -1.8, 0]} opacity={0.7} scale={12} blur={2.5} far={5} />
    </group>
  );
}

export default function Cake3D({ themeColor = "#D12260", photoUrl }) {
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
        
        // Calculate average volume/amplitude
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
      <div className="text-center mb-6">
        <h2 className="text-4xl md:text-5xl font-serif text-gold-accent mb-3 drop-shadow-md">
          Make a Wish & Blow the Candle! 🎂
        </h2>
        <p className="text-gray-200 text-lg font-sans max-w-md mx-auto">
          Rotate the 3D birthday cake with your finger, make your special wish, and blow air into your microphone to extinguish the candle!
        </p>
      </div>

      {/* 3D Canvas Container - Increased height and pulled back camera so nothing is cut off */}
      <div className="w-full h-[480px] md:h-[560px] relative rounded-3xl overflow-hidden glassmorphism border-2 border-gold-accent/40 shadow-2xl bg-gradient-to-b from-white/10 via-black/50 to-black/80 mb-8 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0.8, 6.8], fov: 52 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={2.0} castShadow />
          <pointLight position={[0, 5, 0]} intensity={1.5} color="#ffffff" />
          
          <CakeModel blown={blown} themeColor={themeColor} photoUrl={photoUrl} />
          
          <OrbitControls 
            enablePan={false} 
            minDistance={4} 
            maxDistance={8} 
            maxPolarAngle={Math.PI / 2 + 0.05}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
        
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-gold-accent font-bold pointer-events-none border border-gold-accent/40 shadow-lg">
          👆 Drag to rotate 3D view
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
              <p className="text-white text-base font-sans font-medium">
                May all your dreams, happiness, and desires come true this year! ✨
              </p>
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
