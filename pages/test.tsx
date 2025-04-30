import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const speakText = (text: string) => {
    const synth = window.speechSynthesis;

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.cancel();
      synth.speak(utterance);
    };

    const voices = synth.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      // Wait for voices to load on iOS
      synth.onvoiceschanged = () => {
        speak();
      };
    }
  };

  const startSpeaking = () => {
    if (started) return;
    setStarted(true);

    speakText("Hello");

    intervalRef.current = setInterval(() => {
      speakText("Hello");
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
