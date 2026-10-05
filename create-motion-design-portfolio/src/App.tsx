import { useState } from "react";
import ReelPlayer from "./components/ReelPlayer";
import Loader from "./components/Loader";
import { Cursor, Grain } from "./components/Overlays";

export default function App() {
  const [started, setStarted] = useState(false);
  const [gone, setGone] = useState(false);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#070707] text-[#EDE9DF]">
      <ReelPlayer started={started} />
      <Grain />
      <Cursor />
      {!gone && (
        <Loader
          onStart={() => setStarted(true)}
          onExited={() => setGone(true)}
        />
      )}
    </div>
  );
}
