// Cached fetch helper to prevent duplicate API calls
export async function cachedFetch(
  url: string,
  options: RequestInit = {},
  cacheTime: number = 30000
): Promise<Response> {
  const cacheKey = `fetch_${url}_${JSON.stringify(options)}`;
  const cache = typeof window !== 'undefined' ? (window as any).__apiCache || {} : {};
  
  // Check cache
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < cacheTime) {
    // Return cached response
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Make request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Cache the result
      if (typeof window !== 'undefined') {
        if (!(window as any).__apiCache) {
          (window as any).__apiCache = {};
        }
        (window as any).__apiCache[cacheKey] = {
          data,
          timestamp: Date.now(),
        };
      }
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Clear specific cache entry
export function clearCacheEntry(url: string) {
  if (typeof window !== 'undefined') {
    const cache = (window as any).__apiCache || {};
    const keys = Object.keys(cache);
    keys.forEach(key => {
      if (key.includes(url)) {
        delete cache[key];
      }
    });
  }
}
