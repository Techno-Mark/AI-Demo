import Header from "tsconfig.json/components/Header`";
import Bot from "../components/chatbotBI/Bot";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <Bot />
      </main>
    </>
  );
}
