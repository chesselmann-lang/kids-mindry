/** URL für eine Datei im privaten Bucket "portfolio" (über die signierende API-Route). */
export function portfolioFileUrl(path: string): string {
  return `/api/storage/portfolio?path=${encodeURIComponent(path)}`
}
