import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  backfillHistory,
  dateKey,
  getConsumption,
  getGoal,
  getHourly,
  loadGoals,
  loadHistory,
  saveGoals,
  saveHistory,
  setCreatedAt,
} from "@/lib/consumption";

export interface UserData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  matricula: string;
  bancoPreferencial: string;
  onboarded: boolean;
}

interface UserContextType {
  user: UserData | null;
  setUser: (u: UserData) => void;
  consumptionHistory: Record<string, number>;
  generateConsumption: (cep: string) => void;
  goals: Record<string, number>;
  setGoalForDate: (key: string, goal: number) => void;
  getGoalForDate: (key: string) => number;
  getConsumptionForDate: (key: string) => number;
  getHourlyForDate: (key: string) => { hour: string; value: number }[];
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  consumptionHistory: {},
  generateConsumption: () => {},
  goals: {},
  setGoalForDate: () => {},
  getGoalForDate: () => 0,
  getConsumptionForDate: () => 0,
  getHourlyForDate: () => [],
});

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(() => {
    const saved = localStorage.getItem("saneamento-user");
    if (saved) { try { return JSON.parse(saved); } catch { return null; } }
    return null;
  });
  const [consumptionHistory, setConsumptionHistory] = useState<Record<string, number>>(() => loadHistory());
  const [goals, setGoals] = useState<Record<string, number>>(() => loadGoals());

  // Retroactive fill for skipped days + removal of any future record
  useEffect(() => {
    if (Object.keys(consumptionHistory).length === 0) return;
    const filled = backfillHistory(consumptionHistory);
    if (JSON.stringify(filled) !== JSON.stringify(consumptionHistory)) {
      setConsumptionHistory(filled);
      saveHistory(filled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setUser = (u: UserData) => {
    setUserState(u);
    localStorage.setItem("saneamento-user", JSON.stringify(u));
  };

  const generateConsumption = (cep: string) => {
    const seed = cep.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = seededRandom(seed);
    const history: Record<string, number> = {};
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      history[dateKey(d)] = Math.round(150 + rng() * 150);
    }
    const start = new Date(today);
    start.setDate(start.getDate() - 365);
    setCreatedAt(dateKey(start));
    setConsumptionHistory(history);
    saveHistory(history);
  };

  const setGoalForDate = (key: string, goal: number) => {
    const next = { ...goals, [key]: goal };
    setGoals(next);
    saveGoals(next);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        consumptionHistory,
        generateConsumption,
        goals,
        setGoalForDate,
        getGoalForDate: (key: string) => getGoal(key, goals),
        getConsumptionForDate: (key: string) => getConsumption(key, consumptionHistory),
        getHourlyForDate: (key: string) => getHourly(key, consumptionHistory),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
