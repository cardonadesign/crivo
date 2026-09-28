import { ImageResponse } from "next/og";

export const alt = "Crivo: crítica de interface com prova";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraph() {
  const celulas = [0, 1, 2].flatMap((l) => [0, 1, 2].map((c) => ({ l, c })));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0e",
          color: "#ededef",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: 46, height: 46, gap: 4 }}>
            {celulas.map(({ l, c }) => (
              <div
                key={`${l}${c}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: l === 1 && c === 2 ? "#7b93ff" : "#ededef",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>Crivo</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2.5, maxWidth: 900 }}>
            Crítica de interface que mostra a prova.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#a8a8b2", maxWidth: 900, lineHeight: 1.35 }}>
            Quatro agentes revisam o print em paralelo. O que dá para medir é medido nos pixels.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 24 }}>
          <div style={{ display: "flex", padding: "8px 14px", borderRadius: 6, background: "#112a1c", color: "#5cc98d" }}>
            Confirmado 1,83:1
          </div>
          <div style={{ display: "flex", padding: "8px 14px", borderRadius: 6, background: "#2d1513", color: "#f97066" }}>
            A IA errou
          </div>
          <div style={{ display: "flex", padding: "8px 14px", borderRadius: 6, background: "#1b1b1f", color: "#a8a8b2" }}>
            Julgamento da IA
          </div>
        </div>
      </div>
    ),
    size,
  );
}
