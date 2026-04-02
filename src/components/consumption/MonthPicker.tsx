import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dayNamesShort = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

interface MonthPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const MonthPicker = ({ selectedDate, onSelectDate }: MonthPickerProps) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  const visibleLabel = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const handleOpen = () => {
    setViewMonth(selectedDate.getMonth());
    setViewYear(selectedDate.getFullYear());
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();
    const grid: { day: number; currentMonth: boolean; date: Date }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push({ day: prevDays - i, currentMonth: false, date: new Date(viewYear, viewMonth - 1, prevDays - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({ day: i, currentMonth: true, date: new Date(viewYear, viewMonth, i) });
    }
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({ day: i, currentMonth: false, date: new Date(viewYear, viewMonth + 1, i) });
    }
    return grid;
  }, [viewMonth, viewYear]);

  const selectDay = (date: Date) => {
    onSelectDate(date);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="mx-auto block text-center mb-3 px-4 py-1.5 rounded-full bg-card/40 backdrop-blur-md border border-border/30 active:scale-95 transition-transform"
      >
        <span className="text-xs font-display font-semibold text-primary flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> {visibleLabel}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-card/90 backdrop-blur-xl border border-border/30 rounded-2xl shadow-card-hover p-5 mx-5 w-full max-w-sm"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-card/50 flex items-center justify-center active:scale-90 transition-transform">
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <span className="font-display font-bold text-foreground">{monthNames[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-card/50 flex items-center justify-center active:scale-90 transition-transform">
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNamesShort.map(d => (
                  <span key={d} className="text-[9px] font-display font-semibold text-muted-foreground text-center">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cd, i) => {
                  const isSelected = cd.date.toDateString() === selectedDate.toDateString();
                  const isToday = cd.date.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => selectDay(cd.date)}
                      className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-display transition-all ${
                        !cd.currentMonth ? "opacity-20" : ""
                      } ${
                        isSelected ? "bg-primary text-primary-foreground shadow-sm" :
                        isToday ? "bg-primary/15 text-primary" :
                        "text-foreground hover:bg-card/50"
                      }`}
                    >
                      {cd.day}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setOpen(false)} className="w-full mt-4 py-2.5 rounded-full border border-border/30 text-foreground font-display font-medium text-sm bg-card/30 backdrop-blur-sm">
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MonthPicker;
