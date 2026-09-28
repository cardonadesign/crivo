import { ImageResponse } from "next/og";

export const alt = "Crivo: crítica de interface com prova";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Logo do Crivo para fundo escuro (mesmo desenho de /public/marca/crivo-escuro.svg), embutida
// como data URI porque a imagem é gerada no servidor.
const LOGO = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSI2MCA4MCAxODg5IDU0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI2MCIgeT0iODAiIHdpZHRoPSIxNjciIGhlaWdodD0iMTY3IiByeD0iODMuNSIgZmlsbD0iIzI3NDdEOCIvPjxyZWN0IHg9IjI0NyIgeT0iODAiIHdpZHRoPSIxNjYiIGhlaWdodD0iMTY3IiByeD0iODMiIGZpbGw9IiMyNzQ3RDgiLz48cmVjdCB4PSI0MzMiIHk9IjgwIiB3aWR0aD0iMTY3IiBoZWlnaHQ9IjE2NyIgcng9IjgzLjUiIGZpbGw9IiM1RUJGRDAiLz48cmVjdCB4PSI2MCIgeT0iMjY3IiB3aWR0aD0iMTY3IiBoZWlnaHQ9IjE2NyIgcng9IjgzLjUiIGZpbGw9IiMyNzQ3RDgiLz48cmVjdCB4PSIyNDciIHk9IjI2NyIgd2lkdGg9IjE2NiIgaGVpZ2h0PSIxNjciIHJ4PSI4MyIgZmlsbD0iI0IxOTZGNyIvPjxyZWN0IHg9IjQzMyIgeT0iMjY3IiB3aWR0aD0iMTY3IiBoZWlnaHQ9IjE2NyIgcng9IjgzLjUiIGZpbGw9IiNGNEEwNjgiLz48cmVjdCB4PSI2MCIgeT0iNDU0IiB3aWR0aD0iMTY3IiBoZWlnaHQ9IjE2NyIgcng9IjgzLjUiIGZpbGw9IiMyNzQ3RDgiLz48cmVjdCB4PSIyNDciIHk9IjQ1NCIgd2lkdGg9IjE2NiIgaGVpZ2h0PSIxNjciIHJ4PSI4MyIgZmlsbD0iIzI3NDdEOCIvPjxyZWN0IHg9IjQzMyIgeT0iNDU0IiB3aWR0aD0iMTY3IiBoZWlnaHQ9IjE2NyIgcng9IjgzLjUiIGZpbGw9IiNFNDc4QUUiLz48cGF0aCBkPSJNMTgwOS4yMiA1MzkuMTA2QzE3ODEuMTIgNTM5LjEwNiAxNzU2LjYzIDUzMy4yODIgMTczNS43MyA1MjEuNjMzQzE3MTQuODMgNTA5LjY0MiAxNjk4LjU1IDQ5Mi44NTQgMTY4Ni45IDQ3MS4yNjlDMTY3NS4yNiA0NDkuNjg1IDE2NjkuNDMgNDI0LjMzMiAxNjY5LjQzIDM5NS4yMUMxNjY5LjQzIDM2Ni4wODkgMTY3NS4yNiAzNDAuOTA3IDE2ODYuOSAzMTkuNjY1QzE2OTguNTUgMjk4LjA4MSAxNzE0LjgzIDI4MS4yOTMgMTczNS43MyAyNjkuMzAyQzE3NTYuNjMgMjU3LjMxMSAxNzgxLjEyIDI1MS4zMTUgMTgwOS4yMiAyNTEuMzE1QzE4MzcuMzEgMjUxLjMxNSAxODYxLjgxIDI1Ny4zMTEgMTg4Mi43MSAyNjkuMzAyQzE5MDMuNiAyODEuMjkzIDE5MTkuODggMjk4LjA4MSAxOTMxLjUzIDMxOS42NjVDMTk0My4xOCAzNDAuOTA3IDE5NDkgMzY2LjA4OSAxOTQ5IDM5NS4yMUMxOTQ5IDQyNC4zMzIgMTk0My4xOCA0NDkuNjg1IDE5MzEuNTMgNDcxLjI2OUMxOTE5Ljg4IDQ5Mi44NTQgMTkwMy42IDUwOS42NDIgMTg4Mi43MSA1MjEuNjMzQzE4NjEuODEgNTMzLjI4MiAxODM3LjMxIDUzOS4xMDYgMTgwOS4yMiA1MzkuMTA2Wk0xODA5LjIyIDQ4MC4wMDZDMTgyOC40IDQ4MC4wMDYgMTg0My4zMSA0NzIuNjQgMTg1My45MyA0NTcuOTA4QzE4NjQuNTUgNDQyLjgzMyAxODY5Ljg2IDQyMS45MzQgMTg2OS44NiAzOTUuMjFDMTg2OS44NiAzNjguNDg3IDE4NjQuNTUgMzQ3Ljc1OSAxODUzLjkzIDMzMy4wMjdDMTg0My4zMSAzMTcuOTUyIDE4MjguNCAzMTAuNDE1IDE4MDkuMjIgMzEwLjQxNUMxNzkwLjAzIDMxMC40MTUgMTc3NS4xMyAzMTcuOTUyIDE3NjQuNTEgMzMzLjAyN0MxNzUzLjg4IDM0Ny43NTkgMTc0OC41NyAzNjguNDg3IDE3NDguNTcgMzk1LjIxQzE3NDguNTcgNDIxLjkzNCAxNzUzLjg4IDQ0Mi44MzMgMTc2NC41MSA0NTcuOTA4QzE3NzUuMTMgNDcyLjY0IDE3OTAuMDMgNDgwLjAwNiAxODA5LjIyIDQ4MC4wMDZaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0xNDg5LjAyIDUzMi45MzlMMTM4OC4yOSAyNTcuNDgySDE0NjguOThMMTUzNC4yNCA0NTUuMzM4TDE1OTkgMjU3LjQ4MkgxNjc5LjY4TDE1NzguNDQgNTMyLjkzOUgxNDg5LjAyWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMTI5Ny42IDUzMi45MzlWMjU3LjQ4MkgxMzc0LjY4VjUzMi45MzlIMTI5Ny42Wk0xMjk2LjA1IDIyMy41NjRWMTYxLjg5NEgxMzc1LjcxVjIyMy41NjRIMTI5Ni4wNVoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTExMTcuNTMgNTMyLjkzOVYyNTcuNDgySDExOTAuNUwxMTkzLjA3IDMzNy42NTJMMTE4Ny40MiAzMzYuMTFDMTE5MS44NyAzMDguMzU5IDExOTkuNzUgMjg4LjMxNyAxMjExLjA2IDI3NS45ODNDMTIyMi4zNiAyNjMuNjQ5IDEyMzcuOTUgMjU3LjQ4MiAxMjU3LjgyIDI1Ny40ODJIMTI4My4wMVYzMjEuMjA3SDEyNTcuODJDMTI0My40MyAzMjEuMjA3IDEyMzEuNjEgMzIzLjA5MSAxMjIyLjM2IDMyNi44NkMxMjEzLjExIDMzMC42MjkgMTIwNi4wOSAzMzYuNjI0IDEyMDEuMjkgMzQ0Ljg0N0MxMTk2Ljg0IDM1My4wNyAxMTk0LjYxIDM2NC4yMDQgMTE5NC42MSAzNzguMjUxVjUzMi45MzlIMTExNy41M1oiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTkyOS4xMzMgNTQxLjE2MUM4OTUuOSA1NDEuMTYxIDg2Ni4yNjQgNTMzLjYyNCA4NDAuMjI2IDUxOC41NDlDODE0LjUzIDUwMy40NzUgNzk0LjMxNiA0ODEuNzE5IDc3OS41ODQgNDUzLjI4MkM3NjUuMTk1IDQyNC44NDYgNzU4IDM5MC43NTYgNzU4IDM1MS4wMTRDNzU4IDMxMi4yOTkgNzY1LjAyMyAyNzguNzI0IDc3OS4wNyAyNTAuMjg3Qzc5My4xMTcgMjIxLjUwOCA4MTMuMTYgMTk5LjIzOCA4MzkuMTk4IDE4My40NzhDODY1LjIzNiAxNjcuNzE4IDg5NS43MjkgMTU5LjgzOSA5MzAuNjc1IDE1OS44MzlDOTc4LjI5NyAxNTkuODM5IDEwMTUuMyAxNzEuNjU4IDEwNDEuNjggMTk1LjI5OEMxMDY4LjQgMjE4LjU5NiAxMDg1LjUzIDI1MiAxMDkzLjA3IDI5NS41MTFMMTAxMS44NyAyOTguNTk1QzEwMDcuNzYgMjc1LjY0IDk5OC44NTQgMjU3LjgyNCA5ODUuMTQ5IDI0NS4xNDhDOTcxLjQ0NSAyMzIuMTI5IDk1My4yODcgMjI1LjYxOSA5MzAuNjc1IDIyNS42MTlDOTExLjE0NiAyMjUuNjE5IDg5NC41MjkgMjMwLjc1OCA4ODAuODI1IDI0MS4wMzdDODY3LjEyMSAyNTEuMzE1IDg1Ni42NzEgMjY1Ljg3NiA4NDkuNDc2IDI4NC43MTlDODQyLjI4MiAzMDMuNTYzIDgzOC42ODQgMzI1LjY2MSA4MzguNjg0IDM1MS4wMTRDODM4LjY4NCAzNzYuNzEgODQyLjI4MiAzOTguOTc5IDg0OS40NzYgNDE3LjgyM0M4NTcuMDE0IDQzNi4zMjMgODY3LjYzNSA0NTAuNTQyIDg4MS4zMzkgNDYwLjQ3N0M4OTUuMDQzIDQ3MC40MTMgOTExLjMxNyA0NzUuMzgxIDkzMC4xNjEgNDc1LjM4MUM5NTQuODI4IDQ3NS4zODEgOTczLjg0MyA0NjguNTI5IDk4Ny4yMDUgNDU0LjgyNEMxMDAwLjkxIDQ0MC43NzcgMTAwOS40NyA0MjEuNDIgMTAxMi45IDM5Ni43NTJMMTA5NC42MSAzOTkuODM2QzEwODkuODIgNDI5LjY0MyAxMDgwLjM5IDQ1NC45OTYgMTA2Ni4zNSA0NzUuODk1QzEwNTIuMyA0OTYuNzk0IDEwMzMuOCA1MTIuODk2IDEwMTAuODQgNTI0LjIwMkM5ODguMjMzIDUzNS41MDggOTYwLjk5NSA1NDEuMTYxIDkyOS4xMzMgNTQxLjE2MVoiIGZpbGw9IndoaXRlIi8+PC9zdmc+";

export default function OpenGraph() {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Crivo" width={252} height={72} />

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
