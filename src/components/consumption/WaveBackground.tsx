const WaveBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(202 62% 45% / 0.15) 50%, hsl(190 50% 50% / 0.1) 100%)" }}>
    <svg className="absolute bottom-0 left-0 w-full opacity-20" viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ height: "200px" }}>
      <path className="animate-wave-slow" d="M0,120 C360,60 720,180 1440,100 L1440,200 L0,200Z" fill="hsl(var(--primary) / 0.4)" />
      <path className="animate-wave-medium" d="M0,140 C480,80 960,180 1440,120 L1440,200 L0,200Z" fill="hsl(var(--accent) / 0.3)" />
      <path className="animate-wave-fast" d="M0,160 C320,120 800,190 1440,140 L1440,200 L0,200Z" fill="hsl(var(--primary) / 0.2)" />
    </svg>
    <svg className="absolute top-0 left-0 w-full opacity-10 rotate-180" viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ height: "100px" }}>
      <path className="animate-wave-medium" d="M0,60 C360,20 720,80 1440,40 L1440,100 L0,100Z" fill="hsl(var(--primary) / 0.5)" />
    </svg>
  </div>
);

export default WaveBackground;
