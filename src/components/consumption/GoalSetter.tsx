import { useState } from "react";
import { Target } from "lucide-react";

interface GoalSetterProps {
  goal: number;
  onSetGoal: (goal: number) => void;
}

const GoalSetter = ({ goal, onSetGoal }: GoalSetterProps) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(goal));

  const confirm = () => {
    const val = Number(inputVal);
    onSetGoal(val > 0 ? val : 50);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-border/30 rounded-full px-3 py-1.5">
        <Target className="w-3 h-3 text-primary" />
        <input
          type="number"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && confirm()}
          className="w-14 bg-transparent text-xs font-display text-foreground outline-none text-center"
          autoFocus
        />
        <span className="text-xs text-muted-foreground">L</span>
        <button onClick={confirm} className="text-[10px] text-primary font-semibold">OK</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setInputVal(String(goal)); setEditing(true); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/40 backdrop-blur-md border border-border/30 text-xs font-display text-muted-foreground hover:text-primary transition-colors"
    >
      <Target className="w-3 h-3" />
      Meta: {goal}L/dia
    </button>
  );
};

export default GoalSetter;
