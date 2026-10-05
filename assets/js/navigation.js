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
  var MENU = [
    { ruta: "/", etiqueta: "Inicio" }, /* DÍA 1 — portada: siempre activa. */

  ];

  /* ============================= 2. PIE =================================== */
  /* Columna 1 — Redes sociales */
  var REDES = [
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
    /* La política de cookies (/cookies.html, día 51) aún no está publicada:
     el banner se muestra sin enlace hasta entonces. */

  /* ============================ Motor de render =========================== */

  function lista(items) {
    if (!items || !items.length) return "";
    var lis = "";
    for (var i = 0; i < items.length; i++) {
      lis += '<li><a href="' + items[i].ruta + '">' + items[i].etiqueta + "</a></li>";
    }
    return "<ul>" + lis + "</ul>";
  }

  function columna(titulo, items) {
    if (!items || !items.length) return "";
    return "<div><h4>" + titulo + "</h4>" + lista(items) + "</div>";
  }

  function render() {
    /* 1) Menú principal */
    var nav = document.querySelector("[data-nav-principal]");
    if (nav) {
      nav.innerHTML = lista(MENU);
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
