import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const speck = (file: string) => {
    const audio = new Audio(`/audio/${file}`);
    audio.play().catch((error) => {
      console.error("Audio play error:", error);
    });
  };

  const startSpeaking = () => {
    if (started) return;
    setStarted(true);

    speck("Hello");

    intervalRef.current = setInterval(() => {
      speck("Please_turn_to_the_side.mp3");
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
