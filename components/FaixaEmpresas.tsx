import Link from 'next/link'

export default function FaixaEmpresas() {
  return (
    <section className="px-4 pt-8">
      <div className="max-w-7xl mx-auto bg-brand-soft rounded-xl border border-brand-border px-5 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <span className="flex-none w-11 h-11 rounded-lg bg-brand-red text-white font-bold text-sm flex items-center justify-center">
          25%
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-brand-slate text-base sm:text-lg">
            Vai treinar uma equipe? Até 25% de desconto por vaga
          </p>
          <p className="text-brand-muted text-sm mt-1 leading-relaxed">
            A partir de 5 vagas o preço por pessoa cai. Pagamento único com nota
            fiscal no CNPJ, e você distribui as vagas pelo painel da empresa.
          </p>
        </div>
        <Link href="/empresas" className="btn-primary flex-none justify-center">
          Calcular o valor das vagas
        </Link>
      </div>
    </section>
  )
}
