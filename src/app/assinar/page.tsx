import { notFound, redirect } from "next/navigation";

import { FormularioAssinatura } from "@/components/assinatura/formulario-assinatura";
import { MolduraAssinatura } from "@/components/assinatura/moldura";
import { listarPlanosPublicos } from "@/lib/planos-publicos";

export const dynamic = "force-dynamic";

export default async function AssinarPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string; modo?: string; ciclo?: string; nome?: string; email?: string; telefone?: string }>;
}) {
  const params = await searchParams;
  const modo = params.modo === "pago" ? "pago" : params.modo === "gratuito" ? "gratuito" : null;
  const ciclo = params.ciclo === "anual" ? "anual" : "mensal";
  const catalogo = await listarPlanosPublicos();
  const planos = catalogo?.planos ?? null;
  const plano = planos?.find((item) => item.codigo === params.plano);
  const precoAnual = Number(plano?.precoAnual);
  if (!planos || !modo || !plano || plano.precoMensal <= 0) notFound();
  if (modo === "pago" && ciclo === "anual" && !(precoAnual > 0)) notFound();

  if (modo === "gratuito") {
    const destino = new URLSearchParams({ teste: plano.codigo });
    if (params.nome) destino.set("nome", params.nome);
    if (params.email) destino.set("email", params.email);
    if (params.telefone) destino.set("telefone", params.telefone);
    redirect(`/?${destino.toString()}`);
  }

  const preco = modo === "pago" && ciclo === "anual" ? precoAnual : plano.precoMensal;

  return (
    <MolduraAssinatura larga>
      <FormularioAssinatura
        plano={plano.codigo}
        nomePlano={plano.nome}
        preco={preco}
        modo={modo}
        ciclo={ciclo}
        adicionais={catalogo?.adicionais ?? {}}
        planos={planos.filter((item) => item.precoMensal > 0)}
        iniciais={{
          adminNome: params.nome,
          adminEmail: params.email,
          telefone: params.telefone,
        }}
      />
    </MolduraAssinatura>
  );
}
