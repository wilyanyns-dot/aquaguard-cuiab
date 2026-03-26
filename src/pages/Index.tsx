import { useState, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    if (user?.onboarded) {
      navigate("/home");
    } else {
      navigate("/onboarding");
    }
  }, [navigate, user]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
};

export default Index;
