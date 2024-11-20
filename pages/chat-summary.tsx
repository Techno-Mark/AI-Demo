import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Header from "tsconfig.json/components/Header`";

const messages = [
  {
    name: "Alice",
    message: "Hi! I'm starting to learn Python. Any tips?",
    timestamp: "10:00 AM",
  },
  {
    name: "Bob",
    message:
      "Absolutely! Start with understanding the basics: variables, data types, and control flow.",
    timestamp: "10:01 AM",
  },
  {
    name: "Charlie",
    message:
      "And don’t forget to practice! Websites like LeetCode and HackerRank are great for that.",
    timestamp: "10:02 AM",
  },
  {
    name: "Alice",
    message: "Thanks! I heard Python is good for chatbots. Is that true?",
    timestamp: "10:03 AM",
  },
  {
    name: "Bob",
    message:
      "Yes! Python has great libraries like ChatterBot and NLTK that can help you create chatbots easily.",
    timestamp: "10:04 AM",
  },
  {
    name: "Alice",
    message: "Can you give me an example of how to use ChatterBot?",
    timestamp: "10:05 AM",
  },
  {
    name: "Charlie",
    message:
      "Sure! First, you need to install it using `pip install chatterbot`.",
    timestamp: "10:06 AM",
  },
  {
    name: "Bob",
    message:
      "Then, you can create a simple chatbot like this:\n```python\nfrom chatterbot import ChatBot\nchatbot = ChatBot('MyBot')\n```\nYou can train it using conversations.",
    timestamp: "10:07 AM",
  },
  {
    name: "Alice",
    message: "That sounds cool! How do I train it?",
    timestamp: "10:08 AM",
  },
  {
    name: "Charlie",
    message:
      "You can provide it with a list of conversations or use pre-built datasets. Here's an example:\n```python\nfrom chatterbot.trainers import ChatterBotCorpusTrainer\ntrainer = ChatterBotCorpusTrainer(chatbot)\ntrainer.train('chatterbot.corpus.english')\n```",
    timestamp: "10:09 AM",
  },
  {
    name: "Alice",
    message: "Awesome! What if I want to create a more complex bot?",
    timestamp: "10:10 AM",
  },
  {
    name: "Bob",
    message:
      "For complex bots, you might want to integrate it with a web framework like Flask or Django.",
    timestamp: "10:11 AM",
  },
  {
    name: "Charlie",
    message:
      "You can also use APIs for more advanced features, like connecting to external services.",
    timestamp: "10:12 AM",
  },
  {
    name: "Alice",
    message: "Got it! How do I deploy my chatbot once it’s ready?",
    timestamp: "10:13 AM",
  },
  {
    name: "Bob",
    message:
      "You can deploy it on platforms like Heroku, AWS, or even using Docker containers.",
    timestamp: "10:14 AM",
  },
  {
    name: "Charlie",
    message: "Make sure to handle scaling and user authentication if needed.",
    timestamp: "10:15 AM",
  },
  {
    name: "Alice",
    message:
      "Thanks for all the tips! I'm excited to get started on my chatbot.",
    timestamp: "10:16 AM",
  },
  {
    name: "Bob",
    message:
      "You're welcome! Good luck, and feel free to ask if you have more questions.",
    timestamp: "10:17 AM",
  },
  {
    name: "Charlie",
    message: "Happy coding! Can't wait to see what you build.",
    timestamp: "10:18 AM",
  },
];

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleSummaryClick = async () => {
    setLoading(true);
    const apiKey = process.env.APIKEY;
    const apiBase = process.env.APIBASE;
    const apiVersion = process.env.APIVERSION;
    const deploymentName = process.env.DEPLOYMENTNAME;

    const prompt = `Summarize the following chat conversation:\n${messages
      .map((msg) => `${msg.name}: ${msg.message}`)
      .join("\n")}`;

    try {
      const response = await axios.post(
        `${apiBase}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
        {
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
        }
      );

      const summaryResponse = response.data.choices[0].message.content;
      setSummary(summaryResponse);
      setLoading(false);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary.");
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex-1 flex flex-col justify-start items-start p-4 pt-10">
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="h-96 p-4 overflow-y-auto scrollbar-hidden">
                <div className="flex flex-col space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.name === "Alice" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg max-w-xs ${
                          msg.name === "Alice" ? "bg-blue-500" : "bg-gray-500"
                        }`}
                      >
                        <p className="text-sm font-semibold">{msg.name}</p>
                        <p>{msg.message}</p>
                        <span className="text-xs">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center py-4 text-black">
              <button
                className={`bg-blue-800 text-white rounded-lg px-4 py-2 ${
                  loading ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={loading ? undefined : handleSummaryClick}
              >
                Summary
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center w-full">
            {summary && (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 dark:bg-gray-600 dark:border-gray-700 max-w-lg">
                <p className="text-base font-semibold">
                  <strong>Summary:</strong>
                </p>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
