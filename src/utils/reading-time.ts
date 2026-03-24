/**
 * 计算中文文章的阅读时长（约 300 字/分钟）
 */
export function getReadingTime(content: string): string {
  const chars = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '').length;
  const minutes = Math.max(1, Math.ceil(chars / 300));
  return `${minutes} 分钟`;
}
