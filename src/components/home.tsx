import TaskManager from "./tasks/TaskManager";
import { Header } from "./ui/header";

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TaskManager />
    </div>
  );
}

export default Home;
