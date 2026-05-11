import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/common/Header";
export default function Layout() {
  const { pathname } = useLocation();
  const hideHeader = pathname === "/login";
  return (
    <div className="flex min-h-screen flex-col bg-(--GreenLightHover)">
      {!hideHeader && (
        <div className="hidden w-full md:block">
          <Header />
        </div>
      )}
      <main className="mx-auto w-full max-w-md flex-1 bg-(--GreenLight)">
        <Outlet />
      </main>
    </div>
  );
}
