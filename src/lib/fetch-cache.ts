// Simple cache for API responses to prevent duplicate requests
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();

export async function fetchWithCache(
  url: string,
  options: RequestInit = {},
  cacheTime: number = 30000
): Promise<any> {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cacheTime) {
    return cached.data;
  }
  
  // Make request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    // If request fails, return cached data if available (even if expired)
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}

export function clearCache(url?: string) {
  if (url) {
    const keys = Array.from(cache.keys());
    keys.forEach(key => {
      if (key.startsWith(url)) {
        cache.delete(key);
      }
    });
  } else {
    cache.clear();
  }
}
