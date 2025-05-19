import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  const lastSpokenTimeRef = useRef<Date | null>(null);

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

    speakText("", new Date());
    speck("", new Date());
  };

  const handleOpen = () => {
    startSpeaking();
    speck("Please_step_back.mp3", new Date());
  };

  const speakText = (text: string, now: any) => {
    const synth = window.speechSynthesis;

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.cancel();
      synth.speak(utterance);
      lastSpokenTimeRef.current = now;
    };

    const voices = synth.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      synth.onvoiceschanged = () => {
        speak();
      };
    }
  };

  useEffect(() => {
    const now = new Date();

    const timeDiffInSeconds = lastSpokenTimeRef.current
      ? (now.getTime() - lastSpokenTimeRef.current.getTime()) / 1000
      : Infinity;

    let shouldSpeak = false;
    let text = "";

    text = "Please_step_back.mp3";
    shouldSpeak = true;

    if (shouldSpeak && timeDiffInSeconds > 5) {
      speck(text, now);
    }
  }, []);

  return (
    <main
      className="min-h-screen bg-black text-white flex items-center justify-center"
      onClick={handleOpen}
    >
      <p className="text-lg cursor-pointer">
        Tap anywhere to start speaking every 5 seconds...
      </p>
    </main>
  );
}
