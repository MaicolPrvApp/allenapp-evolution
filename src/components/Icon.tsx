// Icone a tratto, 20px, colore dal testo.
const P: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  users: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 3.6a3.5 3.5 0 0 1 0 6.8",
  clipboard: "M9 4h6v3H9zM9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3M8.5 12h7M8.5 16h5",
  dumbbell: "M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1",
  play: "M7 4.5v15l12-7.5z",
  book: "M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  plus: "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4",
  x: "M6 6l12 12M18 6 6 18",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M18 13l-6 6-6-6",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  back: "M15 18l-6-6 6-6",
  forward: "M9 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7",
  printer: "M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z",
  skip: "M5 4.5v15l10-7.5zM19 5v14",
  calendar: "M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v4M16 3v4",
  food: "M12 7c-1.5-2-6-2.5-7 1.5S6.5 20 9 20c1.3 0 1.8-.6 3-.6s1.7.6 3 .6c2.5 0 5-7.5 4-11.5S13.5 5 12 7M12 7c0-2 1-3.5 3-4",
  chat: "M4 5h16v11H9l-5 4z",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z",
  menu: "M5 12h.01M12 12h.01M19 12h.01",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
};

export function Icon({ name, size = 20 }: { name: keyof typeof P | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] ?? ""} fill={name === "play" ? "currentColor" : "none"} />
    </svg>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#121618" />
      <path d="M168 120v272" stroke="#ecf2f1" strokeWidth="56" strokeLinecap="round" />
      <path d="M352 120 214 256l138 136" fill="none" stroke="#2bc3ae" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="380" cy="256" r="34" fill="#2bc3ae" />
    </svg>
  );
}
