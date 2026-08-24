import { useEffect, useState } from "react";
import { Maximize, Minimize } from "lucide-react";

export default function FullScreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  );

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Exit fullscreen error:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Try to enter fullscreen when component loads
    enterFullscreen();

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  return (
    <button
      onClick={isFullscreen ? exitFullscreen : enterFullscreen}
      className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition"
      title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
    >
      {isFullscreen ? (
        <Minimize className="w-5 h-5" />
      ) : (
        <Maximize className="w-5 h-5" />
      )}
    </button>
  );
}