/** Igual à conta da API: o desconto é arredondado em centavos. */
export function valorComDesconto(valor: number, percentual: number) {
  const centavos = Math.round(valor * 100);
  const desconto = Math.round((centavos * percentual) / 100);
  return (centavos - desconto) / 100;
}

export function normalizarCodigoCupom(bruto: string) {
  return bruto.trim().toUpperCase().replace(/\s+/g, "");
}
