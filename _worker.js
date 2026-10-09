export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // If requesting a .html page (and not the root index.html)
    if (url.pathname.endsWith('.html') && url.pathname !== '/index.html') {
      // Fetch the clean asset internally (/juegos instead of /juegos.html)
      const cleanPath = url.pathname.slice(0, -5);
      const cleanUrl = new URL(cleanPath + url.search, url.origin);
      const assetResponse = await env.ASSETS.fetch(cleanUrl);

      // Serve the content directly so the browser stays on the .html URL
      if (assetResponse.status === 200) {
        return assetResponse;
      }
    }

    // Pass all other requests (homepage, CSS, JS, images, 404s) through normally
    return env.ASSETS.fetch(request);
  }
};
