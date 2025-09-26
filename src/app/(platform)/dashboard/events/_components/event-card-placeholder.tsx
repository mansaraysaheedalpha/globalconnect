// src/app/(platform)/events/_components/event-card-placeholder.tsx

// Add this CSS to your globals.css or a relevant CSS file
/*
@keyframes pulse-grid {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.15; }
}
*/

export const EventCardPlaceholder = () => {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: "hsl(222, 65%, 15%)", // primary-navy
        backgroundImage: `
          linear-gradient(hsla(var(--primary), 0.1) 1px, transparent 1px),
          linear-gradient(to right, hsla(var(--primary), 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "2rem 2rem",
        animation: "pulse-grid 5s ease-in-out infinite",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};
