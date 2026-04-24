import { Outlet } from "react-router-dom";
import Header from "./components/Header";
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-(--GreenLightHover)">
      <div className="hidden w-full md:block">
        <Header />
      </div>
      <main className="mx-auto w-full max-w-md flex-1 bg-(--GreenLight)">
        <Outlet />
      </main>
    </div>
  );
}
