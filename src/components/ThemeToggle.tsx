import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={`transition-transform hover:scale-110 ${className}`}>
      {theme === "light" ? (
        <Sun className="w-5 h-5" strokeWidth={1.5} />
      ) : (
        <Moon className="w-5 h-5" strokeWidth={1.5} />
      )}
    </button>
  );
};

export default ThemeToggle;
