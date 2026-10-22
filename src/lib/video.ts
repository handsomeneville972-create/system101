export type VideoProvider = "youtube" | "vimeo";

export type ParsedVideo = {
  provider: VideoProvider;
  id: string;
  hash: string | null;
  url: string;
  embedUrl: string;
};

function youtube(id: string): ParsedVideo {
  return {
    provider: "youtube",
    id,
    hash: null,
    url: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
  };
}

export function parseVideoUrl(input: string): ParsedVideo | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const ytId = /^[A-Za-z0-9_-]{6,20}$/;

  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0] ?? "";
    return ytId.test(id) ? youtube(id) : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") {
      const id = u.searchParams.get("v") ?? "";
      return ytId.test(id) ? youtube(id) : null;
    }
    const m = u.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,20})/);
    return m ? youtube(m[1]) : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "video") parts.shift();
    const id = parts[0] ?? "";
    if (!/^\d{6,12}$/.test(id)) return null;
    const hashParam = u.searchParams.get("h");
    const hashFromPath = parts[1] && /^[A-Za-z0-9]+$/.test(parts[1]) ? parts[1] : null;
    const hash = hashParam ?? hashFromPath;
    return {
      provider: "vimeo",
      id,
      hash,
      url: `https://vimeo.com/${id}${hash ? `/${hash}` : ""}`,
      embedUrl: `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`,
    };
  }

  return null;
}

export function embedUrl(provider: string, id: string, hash: string | null): string | null {
  if (provider === "youtube" && /^[A-Za-z0-9_-]{6,20}$/.test(id)) {
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (provider === "vimeo" && /^\d{6,12}$/.test(id)) {
    return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
  }
  return null;
}

export function providerLabel(provider: string): string {
  return provider === "vimeo" ? "Vimeo" : "YouTube";
}
