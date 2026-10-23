"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "sys.sidebar.collapsed";
const MEDIA_QUERY = "(min-width: 768px)";

const listeners = new Set<() => void>();
let fallbackCollapsed = false;

function subscribeCollapsed(callback: () => void) {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getCollapsedSnapshot() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? fallbackCollapsed : stored === "1";
  } catch {
    return fallbackCollapsed;
  }
}

function getServerCollapsedSnapshot() {
  return false;
}

function subscribeMedia(callback: () => void) {
  const media = window.matchMedia(MEDIA_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(MEDIA_QUERY).matches;
}

function getServerDesktopSnapshot() {
  return true;
}

function subscribeHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

type SidebarContextValue = {
  collapsed: boolean;
  mounted: boolean;
  mobileOpen: boolean;
  isDesktop: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getServerCollapsedSnapshot,
  );
  const mounted = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const isDesktop = useSyncExternalStore(
    subscribeMedia,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    const next = !getCollapsedSnapshot();
    fallbackCollapsed = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {}
    listeners.forEach((listener) => listener());
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const media = window.matchMedia(MEDIA_QUERY);
    const onChange = () => {
      if (media.matches) setMobileOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      mounted,
      mobileOpen,
      isDesktop,
      toggleCollapsed,
      openMobile,
      closeMobile,
    }),
    [
      collapsed,
      mounted,
      mobileOpen,
      isDesktop,
      toggleCollapsed,
      openMobile,
      closeMobile,
    ],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const value = useContext(SidebarContext);
  if (!value) throw new Error("useSidebar must be used within SidebarProvider");
  return value;
}
