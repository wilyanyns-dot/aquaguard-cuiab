import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

const defaultUser: UserData = {
  nome: "", email: "", cpf: "", telefone: "", cep: "", endereco: "", numero: "", matricula: "", bancoPreferencial: "", onboarded: false,
};

const UserContext = createContext<UserContextType>({
  user: null, setUser: () => {}, consumptionHistory: {}, generateConsumption: () => {},
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
  const [consumptionHistory, setConsumptionHistory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("saneamento-consumption");
    if (saved) { try { return JSON.parse(saved); } catch { return {}; } }
    return {};
  });

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
      const key = d.toISOString().split("T")[0];
      history[key] = Math.round(150 + rng() * 150);
    }
    setConsumptionHistory(history);
    localStorage.setItem("saneamento-consumption", JSON.stringify(history));
  };

  return (
    <UserContext.Provider value={{ user, setUser, consumptionHistory, generateConsumption }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
