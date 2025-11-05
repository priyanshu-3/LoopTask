// Simple in-memory cache for API requests
const cache = new Map<string, { data: any; timestamp: number; expiresIn: number }>();

export function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.expiresIn) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData(key: string, data: any, expiresIn: number = 30000) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresIn,
  });
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
