/** URL für eine Datei in einem privaten Bucket (über die signierende API-Route /api/storage/<bucket>). */
export function storageFileUrl(bucket: 'portfolio' | 'media' | 'kita-docs', path: string): string {
  return `/api/storage/${bucket}?path=${encodeURIComponent(path)}`
}

/** URL für eine Datei im privaten Bucket "portfolio". */
export function portfolioFileUrl(path: string): string {
  return storageFileUrl('portfolio', path)
}
