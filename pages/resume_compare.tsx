import Header from "tsconfig.json/components/Header`";
import ResumeAutomationPage from "./Automation/resumeAutomationPage";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <ResumeAutomationPage />
      </main>
    </>
  );
}
