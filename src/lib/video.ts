/** Converte un link YouTube/Vimeo nell'indirizzo da incorporare; null se non riconosciuto */
import { isFramed } from "../components/ui";

export function embedUrl(url: string): string | null {
  if (!url || isFramed) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}
