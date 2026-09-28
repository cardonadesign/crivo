/* eslint-disable @next/next/no-img-element */

/**
 * Logo do Crivo (desenho do Marlon): uma versão para cada tema. O CSS em globals.css
 * mostra .so-claro ou .so-escuro conforme o data-theme do <html>.
 */
export function Logo({ altura = 20 }: { altura?: number }) {
  const largura = Math.round(altura * (1889 / 541));
  return (
    <span className="inline-flex items-center" style={{ height: altura }}>
      <img src="/marca/crivo-claro.svg" alt="Crivo" width={largura} height={altura} className="so-claro" />
      <img src="/marca/crivo-escuro.svg" alt="Crivo" width={largura} height={altura} className="so-escuro" />
    </span>
  );
}
