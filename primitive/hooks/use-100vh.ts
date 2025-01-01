import { debounce } from "lodash";
import { useEffect, useState } from "react";

export function use100vh() {
  const [fullscreen, setFullScreen] = useState<number>();

  useEffect(() => {
    setFullScreen(window.innerHeight);
    const handleResize = debounce(() => setFullScreen(window.innerHeight), 300);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    fullscreen,
  };
}
