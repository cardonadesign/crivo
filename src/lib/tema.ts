// Tema: "sistema" segue o sistema operacional; "claro" e "escuro" são escolhas manuais.
// O tema efetivo vira data-theme="light" | "dark" no <html>.

export type PreferenciaTema = "sistema" | "claro" | "escuro";

export const CHAVE_TEMA = "crivo:tema";
export const EVENTO_TEMA = "crivo:tema-mudou";

/**
 * Script inline para o <head>: aplica o tema antes da primeira pintura (sem piscar)
 * e acompanha a troca do sistema enquanto a preferência for "sistema".
 */
export const SCRIPT_TEMA = `(function(){
  var pref = "sistema";
  try { pref = localStorage.getItem("${CHAVE_TEMA}") || "sistema"; } catch (e) {}
  var m = window.matchMedia("(prefers-color-scheme: dark)");
  function aplicar(){
    var efetivo = pref === "sistema" ? (m.matches ? "dark" : "light") : (pref === "escuro" ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", efetivo);
  }
  aplicar();
  m.addEventListener("change", function(){
    try { pref = localStorage.getItem("${CHAVE_TEMA}") || "sistema"; } catch (e) {}
    if (pref === "sistema") aplicar();
  });
})();`;

export function lerPreferencia(): PreferenciaTema {
  try {
    const v = localStorage.getItem(CHAVE_TEMA);
    return v === "claro" || v === "escuro" ? v : "sistema";
  } catch {
    return "sistema";
  }
}

export function aplicarPreferencia(pref: PreferenciaTema) {
  try {
    if (pref === "sistema") localStorage.removeItem(CHAVE_TEMA);
    else localStorage.setItem(CHAVE_TEMA, pref);
  } catch {}
  const escuro = pref === "escuro" || (pref === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", escuro ? "dark" : "light");
  window.dispatchEvent(new Event(EVENTO_TEMA));
}
