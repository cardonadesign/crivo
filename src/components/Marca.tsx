/** Marca do Crivo: uma peneira 3×3 com uma célula destacada, o que passou pela verificação. */
export function Marca({ size = 20 }: { size?: number }) {
  const celulas = [0, 1, 2].flatMap((l) => [0, 1, 2].map((c) => ({ l, c })));
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      {celulas.map(({ l, c }) => (
        <rect
          key={`${l}${c}`}
          x={1 + c * 6.5}
          y={1 + l * 6.5}
          width={5}
          height={5}
          rx={1}
          fill={l === 1 && c === 2 ? "var(--acento)" : "currentColor"}
          opacity={l === 1 && c === 2 ? 1 : 0.9}
        />
      ))}
    </svg>
  );
}
