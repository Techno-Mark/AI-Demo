import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  const lastSpokenTimeRef = useRef<Date | null>(null);

  const speck = (file: string) => {
    const now = new Date();
    const audio = new Audio(`/audio/${file}`);
    audio.play().catch((error) => {
      console.error("Audio play error:", error);
    });
    lastSpokenTimeRef.current = now;
  };

  const startSpeaking = () => {
    const now = new Date();
    if (started) return;
    setStarted(true);

    speck("Hello");
    lastSpokenTimeRef.current = now;
  };

  useEffect(() => {
    const now = new Date();

    const timeDiffInSeconds = lastSpokenTimeRef.current
      ? (now.getTime() - lastSpokenTimeRef.current.getTime()) / 1000
      : Infinity;
    if (timeDiffInSeconds > 5) {
      speck("Please_turn_to_the_side.mp3");
    }
  }, [lastSpokenTimeRef]);

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
