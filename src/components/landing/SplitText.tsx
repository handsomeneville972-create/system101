export function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {Array.from(text).map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="landing-char"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          {character === " " ? "\u00A0" : character}
        </span>
      ))}
    </span>
  );
}
