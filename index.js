export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // Homepage: fetch /index.html internally so browser URL stays https://letrasbonitas.fun/
      if (url.pathname === "/" || url.pathname === "") {
        const homeUrl = new URL("/index.html", request.url);
        return await env.ASSETS.fetch(new Request(homeUrl.toString(), request));
      }

      // Old bubble page renamed: permanent redirect keeps backlinks and rankings
      if (url.pathname === "/burbuja.html") {
        const destino = new URL("/letras-burbuja.html", url);
        destino.search = url.search;
        return Response.redirect(destino.toString(), 301);
      }

      // All subpages (/juegos.html, CSS, JS, images) served directly with extensions intact
      return await env.ASSETS.fetch(request);
    } catch (err) {
      return new Response("Server Error: " + err.message, { status: 500 });
    }
  }
};
