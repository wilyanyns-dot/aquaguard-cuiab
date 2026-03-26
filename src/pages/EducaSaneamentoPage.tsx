import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gamepad2, Recycle, Eye, Trophy, Star, ChevronRight, RotateCw, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

// ===== GAME 1: Conector de Redes (Pipe Puzzle) =====
const GRID_SIZE = 4;
type PipeType = "straight" | "curve" | "cross" | "empty";
interface PipeCell { type: PipeType; rotation: number; correct: number; }

function createPuzzle(): PipeCell[][] {
  const grid: PipeCell[][] = [];
  const types: PipeType[] = ["straight", "curve", "straight", "curve", "straight", "cross", "curve", "straight", "straight", "curve", "straight", "curve", "curve", "straight", "curve", "straight"];
  const corrects = [0, 90, 0, 90, 90, 0, 180, 90, 0, 270, 0, 0, 90, 0, 90, 0];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: PipeCell[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const idx = r * GRID_SIZE + c;
      const startRotations = [90, 180, 270, 0];
      row.push({ type: types[idx], rotation: startRotations[idx % 4], correct: corrects[idx] });
    }
    grid.push(row);
  }
  return grid;
}

function PipeIcon({ type, rotation }: { type: PipeType; rotation: number }) {
  return (
    <div style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.3s" }} className="w-full h-full flex items-center justify-center">
      {type === "straight" && (
        <svg viewBox="0 0 40 40" className="w-8 h-8"><rect x="16" y="0" width="8" height="40" rx="2" fill="hsl(202,62%,55%)" /><rect x="14" y="0" width="2" height="40" fill="hsl(202,62%,45%)" /><rect x="24" y="0" width="2" height="40" fill="hsl(202,62%,45%)" /></svg>
      )}
      {type === "curve" && (
        <svg viewBox="0 0 40 40" className="w-8 h-8"><path d="M16 0 L16 16 Q16 24 24 24 L40 24" fill="none" stroke="hsl(202,62%,55%)" strokeWidth="8" /><path d="M14 0 L14 15 Q14 26 26 26 L40 26" fill="none" stroke="hsl(202,62%,45%)" strokeWidth="2" /></svg>
      )}
      {type === "cross" && (
        <svg viewBox="0 0 40 40" className="w-8 h-8"><rect x="16" y="0" width="8" height="40" rx="2" fill="hsl(202,62%,55%)" /><rect x="0" y="16" width="40" height="8" rx="2" fill="hsl(202,62%,55%)" /></svg>
      )}
    </div>
  );
}

const PipePuzzleGame = ({ onBack }: { onBack: () => void }) => {
  const [grid, setGrid] = useState(createPuzzle);
  const [won, setWon] = useState(false);
  const [level, setLevel] = useState(1);

  const rotatePipe = (r: number, c: number) => {
    if (won) return;
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    newGrid[r][c].rotation = (newGrid[r][c].rotation + 90) % 360;
    setGrid(newGrid);
    const allCorrect = newGrid.every((row) => row.every((cell) => cell.type === "empty" || cell.rotation % 360 === cell.correct));
    if (allCorrect) setWon(true);
  };

  const nextLevel = () => { setGrid(createPuzzle()); setWon(false); setLevel((l) => l + 1); };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Conector de Redes</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <p className="text-primary-foreground/70 text-xs font-body text-center">Fase {level} — Gire os canos para conectar a rede!</p>
      </div>
      <div className="px-5 mt-6">
        <div className="bg-card rounded-2xl shadow-card p-4 max-w-xs mx-auto">
          <div className="grid grid-cols-4 gap-1">
            {grid.map((row, r) => row.map((cell, c) => (
              <button key={`${r}-${c}`} onClick={() => rotatePipe(r, c)} className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors">
                <PipeIcon type={cell.type} rotation={cell.rotation} />
              </button>
            )))}
          </div>
        </div>
        <p className="text-center text-xs font-body text-cinza-medio mt-4">Toque nos canos para girá-los 90°</p>
      </div>
      <AnimatePresence>
        {won && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-card rounded-2xl shadow-card p-8 mx-6 text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <Trophy className="w-16 h-16 text-amarelo-alerta mx-auto mb-4" />
              <h2 className="font-display font-bold text-foreground text-xl mb-2">Parabéns! 🎉</h2>
              <p className="font-body text-sm text-cinza-medio mb-6">Você conectou toda a rede de saneamento!</p>
              <button onClick={nextLevel} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold">Próxima Fase <ChevronRight className="w-4 h-4 inline" /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== GAME 2: Estação de Triagem (Drag & Drop) =====
interface TrashItem { id: number; name: string; category: "Lixo" | "Óleo" | "Água Suja"; emoji: string; }
const trashItems: TrashItem[] = [
  { id: 1, name: "Garrafa PET", category: "Lixo", emoji: "🥤" },
  { id: 2, name: "Óleo de cozinha", category: "Óleo", emoji: "🫗" },
  { id: 3, name: "Água com sabão", category: "Água Suja", emoji: "🫧" },
  { id: 4, name: "Papel usado", category: "Lixo", emoji: "📄" },
  { id: 5, name: "Óleo de motor", category: "Óleo", emoji: "🛢️" },
  { id: 6, name: "Esgoto doméstico", category: "Água Suja", emoji: "🚿" },
  { id: 7, name: "Sacola plástica", category: "Lixo", emoji: "🛍️" },
  { id: 8, name: "Gordura de fritura", category: "Óleo", emoji: "🍳" },
  { id: 9, name: "Água de lavagem", category: "Água Suja", emoji: "🧹" },
];

const SortingGame = ({ onBack }: { onBack: () => void }) => {
  const [items, setItems] = useState(trashItems);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleDrop = (category: "Lixo" | "Óleo" | "Água Suja") => {
    if (dragging === null) return;
    const item = items.find((i) => i.id === dragging);
    if (!item) return;
    const correct = item.category === category;
    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      setItems((prev) => prev.filter((i) => i.id !== dragging));
      setFeedback({ correct: true, msg: `✅ ${item.name} classificado corretamente!` });
      if (newScore >= trashItems.length) setCompleted(true);
    } else {
      setFeedback({ correct: false, msg: `❌ ${item.name} não pertence a "${category}"` });
    }
    setDragging(null);
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Estação de Triagem</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <p className="text-primary-foreground/70 text-xs font-body text-center">Arraste cada item para a categoria correta! ({score}/{trashItems.length})</p>
      </div>
      <div className="px-5 mt-4 space-y-4">
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-xl text-sm font-body text-center ${feedback.correct ? "bg-verde-sucesso/10 text-verde-sucesso" : "bg-destructive/10 text-destructive"}`}>
            {feedback.msg}
          </motion.div>
        )}
        {/* Items */}
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <motion.button
              key={item.id}
              draggable
              onDragStart={() => setDragging(item.id)}
              onTouchStart={() => setDragging(item.id)}
              className={`px-3 py-2 rounded-xl bg-card shadow-card font-body text-xs flex items-center gap-1.5 ${dragging === item.id ? "ring-2 ring-primary scale-105" : ""} transition-all`}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <span className="text-lg">{item.emoji}</span> {item.name}
            </motion.button>
          ))}
        </div>
        {/* Drop zones */}
        <div className="grid grid-cols-3 gap-2">
          {(["Lixo", "Óleo", "Água Suja"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => handleDrop(cat)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(cat)}
              className="h-28 rounded-2xl border-2 border-dashed border-primary/30 bg-card flex flex-col items-center justify-center gap-2 hover:border-primary/60 transition-colors"
            >
              <span className="text-2xl">{cat === "Lixo" ? "🗑️" : cat === "Óleo" ? "🫗" : "💧"}</span>
              <span className="font-display font-semibold text-xs text-foreground">{cat}</span>
            </button>
          ))}
        </div>
        {dragging !== null && <p className="text-center text-xs font-body text-primary">Agora toque na categoria correta ☝️</p>}
      </div>
      <AnimatePresence>
        {completed && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="bg-card rounded-2xl shadow-card p-8 mx-6 text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <Star className="w-16 h-16 text-amarelo-alerta mx-auto mb-4" />
              <h2 className="font-display font-bold text-foreground text-xl mb-2">Excelente! 🎉</h2>
              <p className="font-body text-sm text-cinza-medio mb-2">Você classificou todos os itens!</p>
              <p className="font-body text-xs text-cinza-medio mb-6">O tratamento de esgoto separa sólidos, óleos e água contaminada em diferentes etapas antes de devolver a água limpa ao ambiente.</p>
              <button onClick={onBack} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold">Voltar ao Menu</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== GAME 3: Sentinela Ambiental (Caça-Erros) =====
interface EnvError { id: number; x: number; y: number; label: string; info: string; found: boolean; }
const envErrors: EnvError[] = [
  { id: 1, x: 15, y: 25, label: "Torneira aberta", info: "Torneiras pingando desperdiçam até 46 litros de água por dia!", found: false },
  { id: 2, x: 70, y: 20, label: "Lixo no rio", info: "O descarte incorreto de lixo contamina rios e prejudica o tratamento de água.", found: false },
  { id: 3, x: 40, y: 55, label: "Esgoto aberto", info: "Esgoto a céu aberto é foco de doenças e contamina o solo.", found: false },
  { id: 4, x: 80, y: 65, label: "Desmatamento", info: "O desmatamento das margens dos rios causa assoreamento e reduz a qualidade da água.", found: false },
  { id: 5, x: 25, y: 75, label: "Vazamento", info: "Vazamentos na rede podem desperdiçar milhares de litros diariamente.", found: false },
];

const SentinelGame = ({ onBack }: { onBack: () => void }) => {
  const [errors, setErrors] = useState(envErrors);
  const [selectedInfo, setSelectedInfo] = useState<EnvError | null>(null);
  const found = errors.filter((e) => e.found).length;
  const allFound = found === errors.length;

  const handleFind = (id: number) => {
    const err = errors.find((e) => e.id === id);
    if (!err || err.found) return;
    setErrors((prev) => prev.map((e) => e.id === id ? { ...e, found: true } : e));
    setSelectedInfo(err);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Sentinela Ambiental</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <p className="text-primary-foreground/70 text-xs font-body text-center">Encontre os {errors.length} problemas ambientais! ({found}/{errors.length})</p>
      </div>
      <div className="px-5 mt-4">
        {/* Scene */}
        <div className="relative bg-card rounded-2xl shadow-card overflow-hidden" style={{ aspectRatio: "4/3" }}>
          {/* Illustrated scene background */}
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <rect width="400" height="300" fill="hsl(195,60%,90%)" />
            <rect y="180" width="400" height="120" fill="hsl(122,30%,60%)" />
            <path d="M0 200 Q100 170 200 195 Q300 220 400 190 L400 300 L0 300Z" fill="hsl(122,30%,50%)" />
            <path d="M50 250 Q150 230 250 250 Q350 270 400 240 L400 300 L0 300Z" fill="hsl(202,50%,55%)" opacity="0.4" />
            <circle cx="320" cy="50" r="30" fill="hsl(45,100%,65%)" />
            <rect x="80" y="140" width="60" height="50" rx="3" fill="hsl(20,30%,60%)" />
            <polygon points="80,140 110,115 140,140" fill="hsl(0,40%,50%)" />
            <rect x="260" y="150" width="50" height="40" rx="3" fill="hsl(200,20%,70%)" />
            <polygon points="260,150 285,130 310,150" fill="hsl(200,20%,55%)" />
          </svg>
          {/* Error hotspots */}
          {errors.map((e) => (
            <button
              key={e.id}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all ${e.found ? "bg-verde-sucesso/80 scale-110" : "bg-destructive/20 hover:bg-destructive/40 animate-pulse"}`}
              style={{ left: `${e.x}%`, top: `${e.y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => handleFind(e.id)}
            >
              {e.found ? <CheckCircle className="w-5 h-5 text-primary-foreground" /> : <Eye className="w-5 h-5 text-destructive" />}
            </button>
          ))}
        </div>
        {/* Checklist */}
        <div className="mt-4 space-y-2">
          {errors.map((e) => (
            <div key={e.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${e.found ? "bg-verde-sucesso/10" : "bg-card shadow-card"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${e.found ? "bg-verde-sucesso" : "bg-muted"}`}>
                {e.found ? <CheckCircle className="w-4 h-4 text-primary-foreground" /> : <span className="text-xs text-cinza-claro">{e.id}</span>}
              </div>
              <span className={`font-body text-sm ${e.found ? "text-verde-sucesso line-through" : "text-foreground"}`}>{e.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Info panel */}
      <AnimatePresence>
        {selectedInfo && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInfo(null)}>
            <motion.div className="w-full bg-card rounded-t-3xl p-6" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground">✅ {selectedInfo.label}</h3>
                <button onClick={() => setSelectedInfo(null)}><X className="w-5 h-5 text-cinza-claro" /></button>
              </div>
              <p className="font-body text-sm text-cinza-medio">{selectedInfo.info}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {allFound && !selectedInfo && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="bg-card rounded-2xl shadow-card p-8 mx-6 text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <Trophy className="w-16 h-16 text-verde-sucesso mx-auto mb-4" />
              <h2 className="font-display font-bold text-foreground text-xl mb-2">Missão Completa! 🌍</h2>
              <p className="font-body text-sm text-cinza-medio mb-6">Você encontrou todos os problemas ambientais e aprendeu como cada um afeta o saneamento!</p>
              <button onClick={onBack} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold">Voltar ao Menu</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== MAIN PAGE =====
const EducaSaneamentoPage = () => {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<"menu" | "pipes" | "sorting" | "sentinel">("menu");

  if (activeGame === "pipes") return <PipePuzzleGame onBack={() => setActiveGame("menu")} />;
  if (activeGame === "sorting") return <SortingGame onBack={() => setActiveGame("menu")} />;
  if (activeGame === "sentinel") return <SentinelGame onBack={() => setActiveGame("menu")} />;

  const games = [
    { id: "pipes" as const, icon: Gamepad2, title: "Conector de Redes", desc: "Gire os canos e conecte toda a rede de saneamento", color: "from-primary to-secondary" },
    { id: "sorting" as const, icon: Recycle, title: "Estação de Triagem", desc: "Classifique os resíduos nas categorias corretas", color: "from-verde-sucesso to-secondary" },
    { id: "sentinel" as const, icon: Eye, title: "Sentinela Ambiental", desc: "Encontre os problemas ambientais na paisagem", color: "from-amarelo-alerta to-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Educa Saneamento</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <p className="text-primary-foreground/80 text-sm font-body text-center">Aprenda sobre saneamento através de jogos interativos!</p>
      </div>
      <div className="px-5 -mt-4 space-y-4">
        {games.map((game, i) => (
          <motion.button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className="w-full bg-card rounded-2xl shadow-card p-5 flex items-center gap-4 text-left hover:shadow-card-hover transition-shadow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center flex-shrink-0`}>
              <game.icon className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-foreground text-base mb-1">{game.title}</h3>
              <p className="font-body text-xs text-cinza-medio">{game.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-cinza-claro" />
          </motion.button>
        ))}

        {/* Tour Virtual card */}
        <motion.button
          onClick={() => navigate("/tour")}
          className="w-full bg-card rounded-2xl shadow-card p-5 flex items-center gap-4 text-left hover:shadow-card-hover transition-shadow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔭</span>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-base mb-1">Visita 360°</h3>
            <p className="font-body text-xs text-cinza-medio">Explore uma ETA e ETE virtualmente</p>
          </div>
          <ChevronRight className="w-5 h-5 text-cinza-claro" />
        </motion.button>
      </div>
    </div>
  );
};

export default EducaSaneamentoPage;
