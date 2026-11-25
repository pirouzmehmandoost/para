export const getSlugFromName = (name: string): string => {
  if (!name || typeof name !== 'string') return ''
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const toBlobUrl = (base: string | undefined, pathname: string): string => {
  if (typeof base !== 'string' || !base || !base.length) throw new Error('is not set.')
  return `${base.replace(/\/$/, '')}/${pathname.replace(/^\//, '')}`
}