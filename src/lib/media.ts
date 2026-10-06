/**
 * Turns a podcast episode link into something the page can play.
 * Supported: YouTube, Spotify, SoundCloud, Apple Podcasts, and direct audio files.
 * Anything else falls back to a plain "listen" link.
 */
export type MediaKind = 'youtube' | 'spotify' | 'soundcloud' | 'apple' | 'audio' | 'link'

export function mediaKind(raw: string): { kind: MediaKind; embed?: string } {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return { kind: 'link' }
  }
  const host = u.hostname.replace(/^www\.|^m\./, '')

  if (host === 'youtu.be' || host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    const id = host === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v') ?? u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1]
    // privacy-enhanced embed: no cookies until the visitor presses play
    return id && /^[\w-]{6,}$/.test(id) ? { kind: 'youtube', embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0` } : { kind: 'link' }
  }
  if (host === 'open.spotify.com') {
    const m = u.pathname.match(/^\/(?:intl-[\w-]+\/)?(episode|show)\/([A-Za-z0-9]+)/)
    return m ? { kind: 'spotify', embed: `https://open.spotify.com/embed/${m[1]}/${m[2]}` } : { kind: 'link' }
  }
  if (host === 'soundcloud.com' || host === 'on.soundcloud.com') {
    return { kind: 'soundcloud', embed: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&color=%23ffc93c&visual=false&show_comments=false` }
  }
  if (host === 'podcasts.apple.com') {
    return { kind: 'apple', embed: `https://embed.podcasts.apple.com${u.pathname}${u.search}` }
  }
  if (/\.(mp3|m4a|aac|ogg|oga|wav|opus)$/i.test(u.pathname)) return { kind: 'audio' }
  return { kind: 'link' }
}
