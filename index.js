export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Homepage: serve index.html directly. Address bar STAYS https://letrasbonitas.fun/
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new URL("/index.html", request.url));
    }

    // All subpages (/juegos.html, /goticas.html, CSS, JS) stay on their exact URL
    return env.ASSETS.fetch(request);
  }
};
