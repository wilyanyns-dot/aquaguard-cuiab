import { useState, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    navigate("/home");
  }, [navigate]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
};

export default Index;
