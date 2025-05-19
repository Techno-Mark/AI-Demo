import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  const lastSpokenTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const speck = (file: string, now: any) => {
    const audio = new Audio(`/audio/${file}`);
    audio.play().catch((error) => {
      console.error("Audio play error:", error);
    });
    lastSpokenTimeRef.current = now;
  };
  
  const startSpeaking = () => {
    if (started) return;
    setStarted(true);
    const now = new Date();

    speck("Hello", now);

    intervalRef.current = setInterval(() => {
      speck("Please_step_back.mp3", now);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <main
      className="min-h-screen bg-black text-white flex items-center justify-center"
      onClick={startSpeaking}
    >
      <p className="text-lg cursor-pointer">
        Tap anywhere to start speaking every 5 seconds...
      </p>
    </main>
  );
}
