/* =============================================================================
   navigation.js — MENÚ + PIE + AVISO DE COOKIES (ARCHIVO GENERADO)
   =============================================================================
   GENERADO AUTOMÁTICAMENTE por scripts/generar-estaticos.mjs en cada build.
   NO lo edites a mano: se regenera desde src/lib/estado.js (días publicados)
   y src/lib/navegacion.js (qué páginas van en el menú y en cada columna).

   Estado actual: 1 de 52 días publicados.
   Para publicar el día N:  npm run publicar -- N  (o edita DIAS_PUBLICADOS
   en src/lib/estado.js y ejecuta npm run build).

   Este archivo inyecta en TODAS las páginas:
     1. El menú principal  -> dentro de <nav class="nav-principal" data-nav-principal>
     2. Las columnas del pie -> dentro de <div class="pie-rejilla" data-nav-pie>
     3. El aviso de cookies -> dentro de <div class="banner-cookies" data-banner-cookies>
   Solo aparecen páginas ya publicadas: imposible enlazar a un 404.
   ============================================================================= */
(function () {
  "use strict";

  /* ============================= 1. MENÚ ================================== */
  /* Menú hamburguesa: se abre con el botón ☰ y muestra TODAS las páginas
     agrupadas por tema. El enlace a la portada se añade aparte (menuHTML). */
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
        { ruta: "/burbuja.html", etiqueta: "Letras burbuja" },
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
        { ruta: "/caja.html", etiqueta: "Letras en caja" },
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

  /* ============================= 2. PIE =================================== */
  /* Columna 1 — Redes sociales */
  var REDES = [
    { ruta: "https://x.com/Letrasbonitas14", etiqueta: "X (Twitter)", externa: true },
    { ruta: "https://www.pinterest.com/letrasbonitas88/_profile/_created/", etiqueta: "Pinterest", externa: true },
    { ruta: "https://www.quora.com/profile/Letras-Bonitas-12", etiqueta: "Quora", externa: true }
  ];

  /* Columna 2 — Estilos */
  var ESTILOS = [
  ];

  /* Columna 3 — Juegos y nombres */
  var JUEGOS = [
  ];

  /* Columna 4 — Información */
  var INFO = [
  ];

  /* ====================== 3. AVISO DE COOKIES ============================= */
    /* La política de cookies (/cookies.html) está publicada: el aviso
       enlaza a ella. */
    var COOKIES_POLITICA = "/cookies.html";

  /* ============================ Motor de render =========================== */

  function lista(items) {
    if (!items || !items.length) return "";
    var lis = "";
    for (var i = 0; i < items.length; i++) {
      var extra = items[i].externa
        ? ' target="_blank" rel="noopener"'
        : "";
      lis += '<li><a href="' + items[i].ruta + '"' + extra + ">" + items[i].etiqueta + "</a></li>";
    }
    return "<ul>" + lis + "</ul>";
  }

  function columna(titulo, items) {
    if (!items || !items.length) return "";
    return "<div><h4>" + titulo + "</h4>" + lista(items) + "</div>";
  }

  /* HTML del panel del menú hamburguesa: enlace a la portada + grupos */
  function menuHTML() {
    var html = '<a class="menu-inicio" href="/">Inicio</a><div class="menu-rejilla">';
    for (var i = 0; i < MENU.length; i++) {
      html +=
        '<div class="menu-grupo"><h4>' + MENU[i].titulo + "</h4>" +
        lista(MENU[i].paginas) + "</div>";
    }
    return html + "</div>";
  }

  function render() {
    /* 1) Menú principal */
    var nav = document.querySelector("[data-nav-principal]");
    if (nav) {
      nav.innerHTML = menuHTML();
    }

    /* 2) Pie de página */
    var pie = document.querySelector("[data-nav-pie]");
    if (pie) {
      pie.innerHTML =
        columna("Redes sociales", REDES) +
        columna("Estilos", ESTILOS) +
        columna("Juegos y nombres", JUEGOS) +
        columna("Información", INFO);
    }

    /* 3) Aviso de cookies */
    var banner = document.querySelector("[data-banner-cookies]");
    if (banner) {
      var politica =
        typeof COOKIES_POLITICA !== "undefined"
          ? ' Consulta nuestra <a href="' + COOKIES_POLITICA + '">política de cookies</a>.'
          : " Consulta nuestra política de cookies (disponible próximamente).";
      banner.innerHTML =
        "<p>Usamos cookies propias y de terceros para analizar el uso del sitio." +
        politica +
        "</p>" +
        '<button class="boton secundario" type="button" data-cookies-accion="rechazadas">Rechazar</button>' +
        '<button class="boton" type="button" data-cookies-accion="aceptadas">Aceptar</button>';
    }
  }

  /* El script se carga al final del <body>, así que los contenedores ya
     existen. Si por algún motivo no, reintentamos al DOMContentLoaded. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
