import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (src: string) => {
    if (!audioRef.current) return;

    audioRef.current.src = `/audio/${src}`;
    audioRef.current.load();
    audioRef.current.play().catch((err) => {
      console.error("Audio play error:", err);
    });
  };

  const startSpeaking = () => {
    if (started) return;
    setStarted(true);

    // First message
    playAudio("Hello.mp3");

    // Then speak every 5 seconds
    intervalRef.current = setInterval(() => {
      playAudio("Please_step_back.mp3");
    }, 5000);
  };

  useEffect(() => {
    // Create <audio> tag once and append to DOM
    const audio = document.createElement("audio");
    audioRef.current = audio;
    audio.setAttribute("playsinline", "true"); // Required for iOS
    document.body.appendChild(audio);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) document.body.removeChild(audioRef.current);
    };
  }, []);

  return (
    <main
      className="min-h-screen bg-black text-white flex items-center justify-center"
      onClick={startSpeaking}
      onTouchStart={startSpeaking} // ensure iOS picks it up
    >
      <p className="text-lg cursor-pointer">
        Tap anywhere to start speaking every 5 seconds...
      </p>
    </main>
  );
}
