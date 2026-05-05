import { useEffect, useState } from "react";

export default function Duck() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 3);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="h-[39px] w-[28px] bg-no-repeat"
      style={{
        backgroundImage: "url('/duck.png')",
        backgroundPosition: `-${frame * 28}px 0px`,
        backgroundSize: "84px 39px",
      }}
    />
  );
}
