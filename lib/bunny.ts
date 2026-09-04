import crypto from 'crypto'

const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || ''
const TOKEN_KEY  = process.env.BUNNY_TOKEN_KEY || ''

/** Validade do token de reproducao, em segundos. */
const TTL = 60 * 60 * 4

/**
 * Gera a URL assinada do player Bunny Stream.
 * Formula oficial: SHA256(tokenKey + videoId + expires) em hexadecimal.
 */
export function urlPlayerAssinada(videoId: string): string {
  if (!LIBRARY_ID || !TOKEN_KEY) {
    throw new Error('BUNNY_LIBRARY_ID ou BUNNY_TOKEN_KEY ausentes no ambiente')
  }

  const expires = Math.floor(Date.now() / 1000) + TTL
  const token = crypto
    .createHash('sha256')
    .update(TOKEN_KEY + videoId + expires)
    .digest('hex')

  return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?token=${token}&expires=${expires}&autoplay=false`
}

export const bunnyConfigurado = Boolean(LIBRARY_ID && TOKEN_KEY)
