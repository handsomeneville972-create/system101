import { Youtube, Music2, MessagesSquare, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t hairline mt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
        <p>0.01%SYSTEM · Grow</p>
        <div className="flex items-center gap-4">
          <a href="https://youtube.com" aria-label="YouTube" className="hover:text-white">
            <Youtube size={18} />
          </a>
          <a href="https://tiktok.com" aria-label="TikTok" className="hover:text-white">
            <Music2 size={18} />
          </a>
          <a href="https://discord.com" aria-label="Discord" className="hover:text-white">
            <MessagesSquare size={18} />
          </a>
          <a href="https://reddit.com" aria-label="Reddit" className="hover:text-white">
            <Globe size={18} />
          </a>
        </div>
        <div className="flex gap-4">
          <a href="/apps" className="hover:text-white">Apps</a>
          <a href="/decourse" className="hover:text-white">De-Course</a>
          <a href="/settings" className="hover:text-white">Settings</a>
        </div>
      </div>
    </footer>
  );
}
