// lib/simulador/engine.ts
//
// Ciclo de varredura (análogo ao scan de um CLP):
//   1. Agrupa terminais interligados por fios em "nets" (union-find).
//   2. Injeta as fases da fonte nas nets correspondentes.
//   3. Propaga potencial através de todo contato fechado, até estabilizar.
//   4. Detecta curto: net que recebe duas fontes distintas sem carga no meio.
//   5. Avalia cargas: há d.d.p. entre os dois bornes? -> energiza.
//   6. Atualiza contatos das bobinas e repete até o estado congelar.
//
// O selo (retenção) emerge naturalmente do passo 6: K1 fecha 13/14, que
// realimenta a própria bobina, e na iteração seguinte o estado se mantém
// mesmo com a botoeira solta.

import { BIBLIOTECA, FASES } from './library';
import type {
  Circuito, Componente, Falha, Fonte, Resultado, Terminal,
} from './types';

const chave = (t: Terminal) => `${t.comp}.${t.borne}`;

class UnionFind {
  private pai = new Map<string, string>();
  add(k: string) { if (!this.pai.has(k)) this.pai.set(k, k); }
  find(k: string): string {
    this.add(k);
    let r = k;
    while (this.pai.get(r) !== r) r = this.pai.get(r)!;
    while (this.pai.get(k) !== r) { const p = this.pai.get(k)!; this.pai.set(k, r); k = p; }
    return r;
  }
  union(a: string, b: string) { this.pai.set(this.find(a), this.find(b)); }
}

export class Simulador {
  private uf = new UnionFind();
  private netDe = new Map<string, number>();
  private grau = new Map<string, number>();
  private comps = new Map<string, Componente>();

  constructor(private circuito: Circuito) {
    this.montarNets();
  }

  private montarNets() {
    for (const c of this.circuito.componentes) {
      this.comps.set(c.id, c);
      const def = BIBLIOTECA[c.tipo];
      if (!def) throw new Error(`Tipo de componente desconhecido: ${c.tipo}`);
      for (const b of def.bornes(c)) {
        const k = chave({ comp: c.id, borne: b });
        this.uf.add(k);
        this.grau.set(k, 0);
      }
    }
    for (const f of this.circuito.fios) {
      const a = chave(f.de), b = chave(f.para);
      this.uf.union(a, b);
      this.grau.set(a, (this.grau.get(a) ?? 0) + 1);
      this.grau.set(b, (this.grau.get(b) ?? 0) + 1);
    }
    // Numeração estável das nets
    let n = 0;
    const raizes = new Map<string, number>();
    for (const k of Array.from(this.grau.keys())) {
      const r = this.uf.find(k);
      if (!raizes.has(r)) raizes.set(r, n++);
      this.netDe.set(k, raizes.get(r)!);
    }
  }

  net(comp: string, borne: string): number {
    const k = chave({ comp, borne });
    const n = this.netDe.get(k);
    if (n === undefined) throw new Error(`Borne inexistente: ${k}`);
    return n;
  }

  /** Dois bornes estao no mesmo no eletrico? Usado para conferir aterramento. */
  mesmaNet(compA: string, borneA: string, compB: string, borneB: string): boolean {
    return this.net(compA, borneA) === this.net(compB, borneB);
  }

  private ativo = (id: string): boolean => {
    const c = this.comps.get(id);
    if (!c) return false;
    return BIBLIOTECA[c.tipo].saidaAtiva?.(c) ?? false;
  };

  /** Propaga fases por todos os contatos fechados até estabilizar. */
  private propagar(): Map<number, Set<Fonte>> {
    const pot = new Map<number, Set<Fonte>>();
    const em = (n: number) => {
      if (!pot.has(n)) pot.set(n, new Set());
      return pot.get(n)!;
    };

    for (const c of this.circuito.componentes) {
      if (c.tipo !== 'fonte') continue;
      for (const b of BIBLIOTECA.fonte.bornes(c)) {
        if (FASES.includes(b as Fonte)) em(this.net(c.id, b)).add(b as Fonte);
      }
    }

    let mudou = true, guarda = 0;
    while (mudou && guarda++ < 200) {
      mudou = false;
      for (const c of this.circuito.componentes) {
        for (const ct of BIBLIOTECA[c.tipo].contatos(c, this.ativo)) {
          if (!ct.fechado) continue;
          const na = this.net(c.id, ct.a), nb = this.net(c.id, ct.b);
          const sa = em(na), sb = em(nb);
          for (const f of Array.from(sa)) if (!sb.has(f)) { sb.add(f); mudou = true; }
          for (const f of Array.from(sb)) if (!sa.has(f)) { sa.add(f); mudou = true; }
        }
      }
    }
    return pot;
  }

  private temDDP(pot: Map<number, Set<Fonte>>, na: number, nb: number): boolean {
    const a = pot.get(na), b = pot.get(nb);
    if (!a?.size || !b?.size) return false;
    for (const fa of Array.from(a)) for (const fb of Array.from(b)) if (fa !== fb) return true;
    return false;
  }

  /** Executa a varredura completa e devolve o estado elétrico do circuito. */
  run(): Resultado {
    const falhas: Falha[] = [];
    let pot = new Map<number, Set<Fonte>>();
    let energizados = new Set<string>();
    let it = 0;

    for (; it < 50; it++) {
      pot = this.propagar();

      // --- curto-circuito: duas fontes na mesma net, sem carga entre elas
      const curtas = Array.from(pot.entries()).filter((e) => e[1].size > 1).map((e) => e[0]);
      if (curtas.length) {
        const disjuntores = this.circuito.componentes.filter(
          (c) => c.tipo === 'disjuntor' && c.estado.ligado && !c.estado.atuado,
        );
        const desarmados: string[] = [];
        for (const d of disjuntores) {
          const saidas = BIBLIOTECA.disjuntor
            .bornes(d)
            .filter((b) => Number(b) % 2 === 0)
            .map((b) => this.net(d.id, b));
          if (saidas.some((n) => curtas.includes(n))) {
            d.estado.atuado = true;
            desarmados.push(d.id);
          }
        }
        // Fusivel a montante do curto queima e NAO rearma.
        const fusiveis = this.circuito.componentes.filter(
          (c) => c.tipo === 'fusivel' && !c.estado.queimado,
        );
        for (const f of fusiveis) {
          const saidas = BIBLIOTECA.fusivel
            .bornes(f)
            .filter((b) => Number(b) % 2 === 0)
            .map((b) => this.net(f.id, b));
          if (saidas.some((n) => curtas.includes(n))) {
            f.estado.queimado = true;
            desarmados.push(f.id);
          }
        }

        falhas.push({
          tipo: 'curto_circuito',
          componentes: desarmados,
          mensagem: desarmados.length
            ? `Curto-circuito. Atuou a protecao: ${desarmados.join(', ')}.`
            : 'Curto-circuito sem proteção a montante.',
        });
        if (desarmados.length) continue; // re-propaga já desarmado
      }

      // --- cargas
      const novos = new Set<string>();
      for (const c of this.circuito.componentes) {
        for (const g of BIBLIOTECA[c.tipo].cargas(c)) {
          if (this.temDDP(pot, this.net(c.id, g.a), this.net(c.id, g.b))) {
            novos.add(c.id);
          }
        }
      }

      // --- atualiza bobinas (contator energiza/desenergiza na hora)
      let mudou = false;
      for (const c of this.circuito.componentes) {
        if (c.tipo !== 'contator' && c.tipo !== 'bobina') continue;
        const on = novos.has(c.id);
        if (!!c.estado.energizado !== on) { c.estado.energizado = on; mudou = true; }
      }
      for (const c of this.circuito.componentes) {
        if (c.tipo !== 'temporizador') continue;
        const on = novos.has(c.id);
        if (!!c.estado.alimentado !== on) {
          c.estado.alimentado = on;
          if (!on) { c.estado.decorrido = 0; c.estado.saida = false; }
          mudou = true;
        }
      }

      energizados = novos;
      if (!mudou) break;
    }

    // --- bornes de carga sem fio: erro de montagem
    for (const c of this.circuito.componentes) {
      for (const g of BIBLIOTECA[c.tipo].cargas(c)) {
        for (const b of [g.a, g.b]) {
          if ((this.grau.get(chave({ comp: c.id, borne: b })) ?? 0) === 0) {
            falhas.push({
              tipo: 'sem_retorno',
              componentes: [c.id],
              mensagem: `${c.id}: borne ${b} não está conectado.`,
            });
          }
        }
      }
    }

    return { potenciais: pot, energizados, falhas, iteracoes: it + 1 };
  }

  /** Avança o tempo para os temporizadores. Chamar a cada frame do canvas. */
  tick(dtMs: number): void {
    for (const c of this.circuito.componentes) {
      if (c.tipo !== 'temporizador' || !c.estado.alimentado) continue;
      c.estado.decorrido = (c.estado.decorrido ?? 0) + dtMs;
      const modo = c.config.modo ?? 'on_delay';
      const t = (c.config.tempo ?? 5) * 1000;
      if (modo === 'on_delay') c.estado.saida = c.estado.decorrido >= t;
    }
  }

  // ---- ações do aluno na interface -------------------------------------
  pressionar(id: string) { this.set(id, { pressionado: true }); }
  soltar(id: string) { this.set(id, { pressionado: false }); }
  ligarDisjuntor(id: string) { this.set(id, { ligado: true, atuado: false }); }
  desligarDisjuntor(id: string) { this.set(id, { ligado: false }); }
  atuarTermico(id: string) { this.set(id, { atuado: true }); }
  rearmarTermico(id: string) { this.set(id, { atuado: false }); }
  nivelAlto(id: string) { this.set(id, { nivel_alto: true }); }
  nivelBaixo(id: string) { this.set(id, { nivel_alto: false }); }
  selecionar(id: string, posicao: number) { this.set(id, { posicao }); }
  trocarFusivel(id: string) { this.set(id, { queimado: false }); }
  travarEmergencia(id: string) { this.set(id, { travado: true }); }
  destravarEmergencia(id: string) { this.set(id, { travado: false }); }

  private set(id: string, patch: Record<string, any>) {
    const c = this.comps.get(id);
    if (!c) throw new Error(`Componente inexistente: ${id}`);
    Object.assign(c.estado, patch);
  }
}
