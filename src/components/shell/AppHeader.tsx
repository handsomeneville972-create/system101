import { MenuButton } from "@/components/shell/MenuButton";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b hairline bg-black/80 px-3 backdrop-blur md:hidden">
      <MenuButton />
    </header>
  );
}
