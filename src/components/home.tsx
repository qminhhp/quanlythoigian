import TaskManager from "@/components/tasks/TaskManager";
import { Header } from "./ui/header";

function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TaskManager />
      </div>
    </div>
  );
}

export default Home;
