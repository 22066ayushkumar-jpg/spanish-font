/* =============================================================================
   navigation.js — cabecera, menú, descubrimiento, pie y aviso de cookies
   Renderiza los bloques compartidos de todas las páginas. JavaScript puro.
   ============================================================================= */
(function () {
  "use strict";

  var MENU = [
    {
      titulo: "Redes sociales",
      paginas: [
        { ruta: "/instagram.html", etiqueta: "Letras para Instagram" },
        { ruta: "/tiktok.html", etiqueta: "Letras para TikTok" },
        { ruta: "/whatsapp.html", etiqueta: "Letras para WhatsApp" },
        { ruta: "/facebook.html", etiqueta: "Letras para Facebook" },
        { ruta: "/twitter.html", etiqueta: "Letras para Twitter (X)" },
        { ruta: "/discord.html", etiqueta: "Letras para Discord" }
      ]
    },
    {
      titulo: "Estilos de letras",
      paginas: [
        { ruta: "/cursiva.html", etiqueta: "Letras cursivas" },
        { ruta: "/goticas.html", etiqueta: "Letras góticas" },
        { ruta: "/letras-burbuja.html", etiqueta: "Letras burbuja" },
        { ruta: "/decoradas.html", etiqueta: "Letras decoradas" },
        { ruta: "/negrita.html", etiqueta: "Letras en negrita" },
        { ruta: "/pequena.html", etiqueta: "Letras pequeñas" },
        { ruta: "/chidas.html", etiqueta: "Letras chidas" },
        { ruta: "/comunes.html", etiqueta: "Letras comunes" },
        { ruta: "/raras.html", etiqueta: "Letras raras" },
        { ruta: "/feas.html", etiqueta: "Letras feas" },
        { ruta: "/glitch.html", etiqueta: "Letras glitch" },
        { ruta: "/graffiti.html", etiqueta: "Letras graffiti" },
        { ruta: "/squiggle.html", etiqueta: "Letras squiggle" },
        { ruta: "/tristes.html", etiqueta: "Letras tristes" },
        { ruta: "/letras-en-caja.html", etiqueta: "Letras en caja" },
        { ruta: "/carpintero.html", etiqueta: "Letras de carpintero" },
        { ruta: "/invisible.html", etiqueta: "Texto invisible" }
      ]
    },
    {
      titulo: "Free Fire y juegos",
      paginas: [
        { ruta: "/juegos.html", etiqueta: "Letras para juegos" },
        { ruta: "/nombres-para-free-fire.html", etiqueta: "Nombres para Free Fire" },
        { ruta: "/nombres-chidos-free-fire.html", etiqueta: "Nombres chidos para Free Fire" },
        { ruta: "/nombres-chistosos-free-fire.html", etiqueta: "Nombres chistosos para Free Fire" },
        { ruta: "/nombres-clanes-free-fire.html", etiqueta: "Nombres de clanes para Free Fire" },
        { ruta: "/nombres-animales-free-fire.html", etiqueta: "Nombres de animales para Free Fire" },
        { ruta: "/nombres-dioses-aztecas-free-fire.html", etiqueta: "Nombres de dioses aztecas para Free Fire" },
        { ruta: "/nombres-free-fire-insanos.html", etiqueta: "Nombres insanos para Free Fire" },
        { ruta: "/nombres-free-fire-miedo.html", etiqueta: "Nombres de miedo para Free Fire" },
        { ruta: "/nombres-heroicos-free-fire.html", etiqueta: "Nombres heroicos para Free Fire" },
        { ruta: "/nombres-sad-free-fire.html", etiqueta: "Nombres sad para Free Fire" },
        { ruta: "/nombres-verificado-free-fire.html", etiqueta: "Nombres verificados para Free Fire" },
        { ruta: "/nombres-veteranos-free-fire.html", etiqueta: "Nombres de veteranos para Free Fire" }
      ]
    },
    {
      titulo: "Herramientas y símbolos",
      paginas: [
        { ruta: "/simbolos-aesthetic.html", etiqueta: "Símbolos aesthetic" },
        { ruta: "/emoticonos.html", etiqueta: "Emoticonos de texto" },
        { ruta: "/kaomoji.html", etiqueta: "Kaomoji" },
        { ruta: "/letras-japonesas.html", etiqueta: "Letras japonesas" },
        { ruta: "/hiragana.html", etiqueta: "Hiragana" },
        { ruta: "/katakana.html", etiqueta: "Katakana" },
        { ruta: "/kanji.html", etiqueta: "Kanji" },
        { ruta: "/numeros-en-letras.html", etiqueta: "Números en letras" },
        { ruta: "/mayusculas-a-minusculas.html", etiqueta: "Convertir mayúsculas a minúsculas" }
      ]
    },
    {
      titulo: "Información",
      paginas: [
        { ruta: "/acerca-de-nosotros.html", etiqueta: "Acerca de nosotros" },
        { ruta: "/contacto.html", etiqueta: "Contacto" },
        { ruta: "/cookies.html", etiqueta: "Política de cookies" },
        { ruta: "/aviso-legal.html", etiqueta: "Aviso legal" },
        { ruta: "/privacy-policy.html", etiqueta: "Política de privacidad" }
      ]
    }
  ];

  var RAPIDA = [
    { ruta: "/cursiva.html", etiqueta: "Cursiva" },
    { ruta: "/goticas.html", etiqueta: "Góticas" },
    { ruta: "/instagram.html", etiqueta: "Instagram" },
    { ruta: "/nombres-para-free-fire.html", etiqueta: "Free Fire" },
    { ruta: "/simbolos-aesthetic.html", etiqueta: "Símbolos" }
  ];

  var REDES = [
    {
      ruta: "https://x.com/Letrasbonitas14",
      etiqueta: "X / Twitter",
      externa: true
    },
    {
      ruta: "https://www.pinterest.com/letrasbonitas88/_profile/_created/",
      etiqueta: "Pinterest",
      externa: true
    },
    {
      ruta: "https://www.quora.com/profile/Letras-Bonitas-12",
      etiqueta: "Quora",
      externa: true
    }
  ];

  var PIE_COLUMNAS = [
    {
      titulo: "Estilos populares",
      enlaces: [
        { ruta: "/cursiva.html", etiqueta: "Letras cursivas" },
        { ruta: "/goticas.html", etiqueta: "Letras góticas" },
        { ruta: "/letras-burbuja.html", etiqueta: "Letras burbuja" },
        { ruta: "/decoradas.html", etiqueta: "Letras decoradas" },
        { ruta: "/chidas.html", etiqueta: "Letras chidas" },
        { ruta: "/pequena.html", etiqueta: "Letras pequeñas" }
      ]
    },
    {
      titulo: "Juegos y nombres",
      enlaces: [
        { ruta: "/nombres-para-free-fire.html", etiqueta: "Nombres para Free Fire" },
        { ruta: "/nombres-chidos-free-fire.html", etiqueta: "Nombres chidos" },
        { ruta: "/nombres-clanes-free-fire.html", etiqueta: "Nombres de clanes" },
        { ruta: "/nombres-verificado-free-fire.html", etiqueta: "Nombres verificados" },
        { ruta: "/juegos.html", etiqueta: "Letras para juegos" },
        { ruta: "/nombres-free-fire-miedo.html", etiqueta: "Nombres de miedo" }
      ]
    },
    {
      titulo: "Herramientas",
      enlaces: [
        { ruta: "/simbolos-aesthetic.html", etiqueta: "Símbolos aesthetic" },
        { ruta: "/kaomoji.html", etiqueta: "Kaomoji" },
        { ruta: "/hiragana.html", etiqueta: "Hiragana" },
        { ruta: "/katakana.html", etiqueta: "Katakana" },
        { ruta: "/numeros-en-letras.html", etiqueta: "Números en letras" },
        { ruta: "/mayusculas-a-minusculas.html", etiqueta: "Mayúsculas a minúsculas" }
      ]
    },
    {
      titulo: "Letras Bonitas",
      enlaces: [
        { ruta: "/acerca-de-nosotros.html", etiqueta: "Acerca de nosotros" },
        { ruta: "/contacto.html", etiqueta: "Contacto" },
        { ruta: "/cookies.html", etiqueta: "Política de cookies" },
        { ruta: "/aviso-legal.html", etiqueta: "Aviso legal" },
        { ruta: "/privacy-policy.html", etiqueta: "Privacidad" }
      ]
    }
  ];

  var CATEGORIAS = [
    {
      titulo: "Redes sociales",
      clase: "cat-rosa",
      icono: "📱",
      desc: "Destaca en tu bio, estados y comentarios.",
      enlaces: [
        { ruta: "/instagram.html", etiqueta: "Instagram" },
        { ruta: "/tiktok.html", etiqueta: "TikTok" },
        { ruta: "/whatsapp.html", etiqueta: "WhatsApp" },
        { ruta: "/discord.html", etiqueta: "Discord" },
        { ruta: "/facebook.html", etiqueta: "Facebook" },
        { ruta: "/twitter.html", etiqueta: "Twitter (X)" }
      ]
    },
    {
      titulo: "Juegos y Free Fire",
      clase: "cat-oro",
      icono: "🎮",
      desc: "Nicks con símbolos, clanes y nombres que se recuerdan.",
      enlaces: [
        { ruta: "/nombres-para-free-fire.html", etiqueta: "Nombres para Free Fire" },
        { ruta: "/nombres-chidos-free-fire.html", etiqueta: "Nombres chidos" },
        { ruta: "/nombres-clanes-free-fire.html", etiqueta: "Clanes" },
        { ruta: "/nombres-free-fire-miedo.html", etiqueta: "Nombres de miedo" },
        { ruta: "/juegos.html", etiqueta: "Letras para juegos" },
        { ruta: "/nombres-verificado-free-fire.html", etiqueta: "Verificados" }
      ]
    },
    {
      titulo: "Estilos de letras",
      clase: "cat-lila",
      icono: "Aa",
      desc: "Cursiva, gótica, burbuja y mucho más para cada ocasión.",
      enlaces: [
        { ruta: "/cursiva.html", etiqueta: "Cursivas" },
        { ruta: "/goticas.html", etiqueta: "Góticas" },
        { ruta: "/letras-burbuja.html", etiqueta: "Burbuja" },
        { ruta: "/decoradas.html", etiqueta: "Decoradas" },
        { ruta: "/chidas.html", etiqueta: "Chidas" },
        { ruta: "/pequena.html", etiqueta: "Pequeñas" }
      ]
    },
    {
      titulo: "Herramientas",
      clase: "cat-verde",
      icono: "✎",
      desc: "Símbolos, emoticonos y conversores listos para usar.",
      enlaces: [
        { ruta: "/simbolos-aesthetic.html", etiqueta: "Símbolos aesthetic" },
        { ruta: "/kaomoji.html", etiqueta: "Kaomoji" },
        { ruta: "/emoticonos.html", etiqueta: "Emoticonos" },
        { ruta: "/hiragana.html", etiqueta: "Hiragana" },
        { ruta: "/numeros-en-letras.html", etiqueta: "Números en letras" },
        { ruta: "/mayusculas-a-minusculas.html", etiqueta: "Mayúsculas a minúsculas" }
      ]
    }
  ];

  var PASOS = [
    {
      numero: "01",
      titulo: "Escribe tu texto",
      texto: "Tu nombre, una frase o el nick que quieras transformar. Acentos, eñes y emojis incluidos."
    },
    {
      numero: "02",
      titulo: "Elige tu estilo",
      texto: "Verás cientos de versiones al instante. Filtra con el buscador y ajusta el tamaño de letra."
    },
    {
      numero: "03",
      titulo: "Copia y pega",
      texto: "Pulsa Copiar en tu favorita y pégala en Instagram, WhatsApp, TikTok o Free Fire."
    }
  ];

  /* ---------------------------- utilidades ---------------------------- */
  function rutaActual() {
    var ruta = location.pathname.replace(/index\.html$/, "");
    return ruta === "" ? "/" : ruta;
  }

  function esActual(ruta) {
    var actual = rutaActual();
    if (ruta === "/") return actual === "/";
    return actual === ruta;
  }

  function enlaces(items) {
    var html = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var externo = it.externa ? ' target="_blank" rel="noopener"' : "";
      var actual = !it.externa && esActual(it.ruta) ? ' aria-current="page"' : "";
      html += '<li><a href="' + it.ruta + '"' + externo + actual + ">" + it.etiqueta + "</a></li>";
    }
    return html;
  }

  /* ------------------------------ menú ------------------------------ */
  function pintarNavRapida() {
    var nav = document.querySelector("[data-nav-rapida]");
    if (!nav) return;
    var html = "";
    for (var i = 0; i < RAPIDA.length; i++) {
      html += '<a href="' + RAPIDA[i].ruta + '"' +
        (esActual(RAPIDA[i].ruta) ? ' aria-current="page"' : "") + ">" +
        RAPIDA[i].etiqueta + "</a>";
    }
    nav.innerHTML = html;
  }

  function pintarMenu() {
    var nav = document.querySelector("[data-nav-principal]");
    if (!nav) return;
    var html = '<a class="menu-inicio" href="/"' +
      (rutaActual() === "/" ? ' aria-current="page"' : "") +
      ">✦ Inicio</a><div class=\"menu-rejilla\">";
    for (var i = 0; i < MENU.length; i++) {
      html +=
        '<div class="menu-grupo"><h4>' + MENU[i].titulo + "</h4><ul>" +
        enlaces(MENU[i].paginas) + "</ul></div>";
    }
    nav.innerHTML = html + "</div>";
  }

  /* ----------------------------- pie ------------------------------- */
  function pintarPie() {
    var pie = document.querySelector("[data-pie]");
    if (!pie) return;

    var redes = "";
    for (var i = 0; i < REDES.length; i++) {
      redes += '<a href="' + REDES[i].ruta + '" target="_blank" rel="noopener">' +
        REDES[i].etiqueta + " ↗</a>";
    }

    var columnas = "";
    for (var j = 0; j < PIE_COLUMNAS.length; j++) {
      columnas += '<div><h3>' + PIE_COLUMNAS[j].titulo + "</h3><ul>" +
        enlaces(PIE_COLUMNAS[j].enlaces) + "</ul></div>";
    }

    pie.innerHTML =
      '<div class="pie-cabecera">' +
        '<div class="pie-marca">' +
          '<a class="logo" href="/">' +
            '<span class="logo-icono" aria-hidden="true">Aa</span>' +
            '<span class="logo-texto">Letras <em>Bonitas</em></span>' +
          "</a>" +
          "<p>El generador de letras bonitas en español para copiar y pegar. " +
          "Más de 300 estilos gratis en tu navegador, sin registros y sin límites.</p>" +
        "</div>" +
        '<div class="pie-redes">' + redes + "</div>" +
      "</div>" +
      '<div class="pie-rejilla">' + columnas + "</div>" +
      '<p class="pie-legal">© ' + new Date().getFullYear() +
      " Letras Bonitas · Generador de letras y fuentes bonitas para copiar y pegar en " +
      "Instagram, TikTok, WhatsApp y redes sociales.</p>";
  }

  /* --------------------- explorador (banda final) ------------------ */
  function pintarExplorador() {
    var caja = document.querySelector("[data-explorador]");
    if (!caja) return;

    var grupos = "";
    for (var i = 0; i < MENU.length; i++) {
      grupos +=
        '<div class="explorador-grupo"><h3>' + MENU[i].titulo + "</h3><ul>" +
        enlaces(MENU[i].paginas) + "</ul></div>";
    }

    caja.innerHTML =
      '<div class="contenedor">' +
        '<div class="seccion-cabecera">' +
          "<div><p class=\"etiqueta\">Sigue explorando</p>" +
          '<h2 id="explorador-titulo">Todo el catálogo de letras</h2></div>' +
          '<p>52 páginas de estilos, símbolos y nombres listos para copiar.</p>' +
        "</div>" +
        '<div class="explorador-rejilla">' + grupos + "</div>" +
      "</div>";
  }

  /* ------------------- categorías y pasos (inicio) ------------------ */
  function pintarCategorias() {
    var caja = document.querySelector("[data-categorias]");
    if (!caja) return;

    var html = "";
    for (var i = 0; i < CATEGORIAS.length; i++) {
      var c = CATEGORIAS[i];
      var links = "";
      for (var j = 0; j < c.enlaces.length; j++) {
        links += '<a href="' + c.enlaces[j].ruta + '">' + c.enlaces[j].etiqueta + "</a>";
      }
      html +=
        '<article class="categoria-tarjeta">' +
          '<span class="categoria-icono ' + c.clase + '" aria-hidden="true">' + c.icono + "</span>" +
          "<h3>" + c.titulo + "</h3>" +
          "<p>" + c.desc + "</p>" +
          '<div class="categoria-enlaces">' + links + "</div>" +
        "</article>";
    }

    caja.innerHTML =
      '<div class="contenedor">' +
        '<div class="seccion-cabecera">' +
          "<div><p class=\"etiqueta\">Encuentra lo tuyo</p>" +
          "<h2>Explora por categoría</h2></div>" +
          '<p>Elige dónde vas a usar tus letras.</p>' +
        "</div>" +
        '<div class="categorias-rejilla">' + html + "</div>" +
      "</div>";
  }

  function pintarPasos() {
    var caja = document.querySelector("[data-pasos]");
    if (!caja) return;
    var html = "";
    for (var i = 0; i < PASOS.length; i++) {
      html +=
        '<article class="paso">' +
          '<span class="paso-numero" aria-hidden="true">' + PASOS[i].numero + "</span>" +
          "<h3>" + PASOS[i].titulo + "</h3>" +
          "<p>" + PASOS[i].texto + "</p>" +
        "</article>";
    }
    caja.innerHTML =
      '<div class="contenedor">' +
        '<div class="seccion-cabecera">' +
          "<div><p class=\"etiqueta\">Así de fácil</p>" +
          "<h2>Cómo funciona</h2></div>" +
          '<p>Sin instalar nada. En tres pasos.</p>' +
        "</div>" +
        '<div class="pasos-rejilla">' + html + "</div>" +
      "</div>";
  }

  /* ---------------------------- cookies ---------------------------- */
  function pintarCookies() {
    var banner = document.querySelector("[data-banner-cookies]");
    if (!banner) return;
    banner.innerHTML =
      "<p>Usamos cookies propias y de terceros para analizar el uso del sitio. " +
      'Consulta nuestra <a href="/cookies.html">política de cookies</a>.</p>' +
      '<button class="boton secundario" type="button" data-cookies-accion="rechazadas">Rechazar</button>' +
      '<button class="boton" type="button" data-cookies-accion="aceptadas">Aceptar</button>';
  }

  function render() {
    pintarNavRapida();
    pintarMenu();
    pintarPie();
    pintarExplorador();
    pintarCategorias();
    pintarPasos();
    pintarCookies();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
