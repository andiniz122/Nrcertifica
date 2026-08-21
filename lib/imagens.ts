import fs from 'node:fs'
import path from 'node:path'

/**
 * Fotos opcionais do site. Enquanto o arquivo nao existir em `public/`, os
 * componentes caem no visual vetorial — nada de imagem quebrada em producao.
 *
 * Para publicar uma foto, basta commitar o arquivo com o nome esperado:
 *   public/cursos/nr10.jpg      public/cursos/nr10sep.jpg
 *   public/cursos/nr35.jpg      public/cursos/nr12.jpg
 *   public/cursos/nr06.jpg      public/hero/hero.jpg
 * Extensoes aceitas: .jpg, .jpeg, .png, .webp (nessa ordem de preferencia).
 */

const PASTA_PUBLIC = path.join(process.cwd(), 'public')
const EXTENSOES = ['jpg', 'jpeg', 'png', 'webp'] as const

/** Slug do arquivo de foto a partir do `nr` do curso ("NR-10 SEP" -> "nr10sep"). */
export function slugFoto(nr: string): string {
  return nr.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function primeiroExistente(dir: string, base: string): string | null {
  for (const ext of EXTENSOES) {
    const relativo = `${dir}/${base}.${ext}`
    if (fs.existsSync(path.join(PASTA_PUBLIC, relativo))) return `/${relativo}`
  }
  return null
}

/** Foto do curso, ou null quando ainda nao foi adicionada. */
export function fotoCurso(nr: string): string | null {
  return primeiroExistente('cursos', slugFoto(nr))
}

/** Foto do hero da home, ou null para usar a ilustracao vetorial. */
export function fotoHero(): string | null {
  return primeiroExistente('hero', 'hero')
}
