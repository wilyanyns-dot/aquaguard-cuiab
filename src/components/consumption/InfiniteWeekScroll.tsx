import { useRef, useEffect, useMemo, useState, useCallback } from "react";

const dayNamesShort = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

interface InfiniteWeekScrollProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function generateDatesAround(center: Date, range: number): Date[] {
  const dates: Date[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const InfiniteWeekScroll = ({ selectedDate, onSelectDate }: InfiniteWeekScrollProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [centerDate, setCenterDate] = useState(new Date(selectedDate));
  const isScrollingRef = useRef(false);
  const lastExpandRef = useRef(0);

  const dates = useMemo(() => generateDatesAround(centerDate, 45), [centerDate]);

  // Scroll to selected date on mount and when selectedDate changes externally
  useEffect(() => {
    if (!scrollRef.current || isScrollingRef.current) return;
    const idx = dates.findIndex(d => d.toDateString() === selectedDate.toDateString());
    if (idx >= 0) {
      const el = scrollRef.current.children[idx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDate, dates]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const now = Date.now();
    if (now - lastExpandRef.current < 300) return;

    if (scrollLeft < 80) {
      lastExpandRef.current = now;
      isScrollingRef.current = true;
      const newCenter = new Date(centerDate);
      newCenter.setDate(newCenter.getDate() - 30);
      setCenterDate(newCenter);
      setTimeout(() => { isScrollingRef.current = false; }, 100);
    } else if (scrollLeft > scrollWidth - clientWidth - 80) {
      lastExpandRef.current = now;
      isScrollingRef.current = true;
      const newCenter = new Date(centerDate);
      newCenter.setDate(newCenter.getDate() + 30);
      setCenterDate(newCenter);
      setTimeout(() => { isScrollingRef.current = false; }, 100);
    }
  }, [centerDate]);

  const handleSelect = (d: Date) => {
    onSelectDate(new Date(d));
  };

  return (
    <div className="relative mb-5">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {dates.map((d) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <button
              key={d.toISOString()}
              onClick={() => handleSelect(d)}
              className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl flex-shrink-0 snap-center transition-all duration-200 ${
                isSelected
                  ? "bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-card-hover scale-105"
                  : isToday
                  ? "bg-card/50 backdrop-blur-md border border-primary/30"
                  : "bg-card/20 backdrop-blur-sm border border-border/20"
              }`}
            >
              <span className={`text-[9px] font-display font-semibold ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {dayNamesShort[d.getDay()]}
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-primary-foreground/20" : ""}`}>
                <p className={`text-sm font-display font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>{d.getDate()}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteWeekScroll;
