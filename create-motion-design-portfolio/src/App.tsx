import CLDPage from "./pages/CLDPage";
import ReelPage from "./ReelPage";

/**
 * The extracted CLD experience is the primary page. Keep the original five-act
 * reel available at /reel so the source animation is still easy to revisit.
 */
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/reel" ? <ReelPage /> : <CLDPage />;
}
