/* =============================================================================
   app.js — interacción de Letras Bonitas
   Menú, cabecera, generador, favoritas, conversores, cookies y contacto.
   JavaScript puro, sin dependencias. Todo se ejecuta en el navegador.
   ============================================================================= */
(function () {
  "use strict";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* Categorías que se muestran como chips encima de los resultados. */
  var TIRA_CATEGORIAS = [
    { ruta: "/", etiqueta: "Todos" },
    { ruta: "/instagram.html", etiqueta: "Instagram" },
    { ruta: "/juegos.html", etiqueta: "Juegos" },
    { ruta: "/nombres-para-free-fire.html", etiqueta: "Free Fire" },
    { ruta: "/cursiva.html", etiqueta: "Cursiva" },
    { ruta: "/facebook.html", etiqueta: "Facebook" },
    { ruta: "/decoradas.html", etiqueta: "Decoradas" },
    { ruta: "/discord.html", etiqueta: "Discord" },
    { ruta: "/twitter.html", etiqueta: "Twitter" },
    { ruta: "/tiktok.html", etiqueta: "TikTok" },
    { ruta: "/whatsapp.html", etiqueta: "WhatsApp" },
    { ruta: "/negrita.html", etiqueta: "Negrita" },
    { ruta: "/chidas.html", etiqueta: "Chidas" },
    { ruta: "/glitch.html", etiqueta: "Glitch" }
  ];

  function crearTiraCategorias() {
    var nav = document.createElement("nav");
    nav.className = "tira-categorias";
    nav.setAttribute("aria-label", "Categorías de letras");
    var actual = document.body.getAttribute("data-ruta") || "/";
    TIRA_CATEGORIAS.forEach(function (c) {
      var a = document.createElement("a");
      a.className = "chip";
      a.href = c.ruta;
      a.textContent = c.etiqueta;
      if (c.ruta === actual) {
        a.classList.add("activo");
        a.setAttribute("aria-current", "page");
      }
      nav.appendChild(a);
    });
    return nav;
  }

  /* ------------------------------ avisos ------------------------------ */
  var brindis;
  function avisar(mensaje) {
    if (!brindis) {
      brindis = document.createElement("div");
      brindis.className = "brindis";
      brindis.setAttribute("role", "status");
      brindis.setAttribute("aria-live", "polite");
      document.body.appendChild(brindis);
    }
    brindis.textContent = mensaje;
    brindis.classList.add("visible");
    clearTimeout(brindis._t);
    brindis._t = setTimeout(function () {
      brindis.classList.remove("visible");
    }, 1900);
  }

  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(function () {
        return copiarClasico(texto);
      });
    }
    return copiarClasico(texto);
  }

  function copiarClasico(texto) {
    var area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (e) { /* sin permiso */ }
    document.body.removeChild(area);
    return Promise.resolve();
  }

  function marcarCopiado(boton, texto) {
    if (!boton) return;
    if (!boton._textoOriginal) boton._textoOriginal = boton.textContent;
    boton.textContent = "¡Copiado!";
    boton.classList.add("copiado");
    clearTimeout(boton._t);
    boton._t = setTimeout(function () {
      boton.textContent = boton._textoOriginal;
      boton.classList.remove("copiado");
      boton._textoOriginal = null;
    }, 1800);
    avisar(texto || "Copiado al portapapeles");
  }

  /* ------------------------------ menú ------------------------------- */
  function iniciarMenu() {
    var boton = $(".menu-boton");
    var nav = $(".nav-principal");
    if (!boton || !nav) return;

    if (!nav.id) nav.id = "menu-principal";
    boton.setAttribute("aria-controls", nav.id);

    function abrir() {
      nav.classList.add("abierto");
      boton.setAttribute("aria-expanded", "true");
      boton.setAttribute("aria-label", "Cerrar menú");
      document.body.classList.add("menu-abierto");
    }
    function cerrar() {
      nav.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
      document.body.classList.remove("menu-abierto");
    }
    function conmutar() {
      if (nav.classList.contains("abierto")) cerrar();
      else abrir();
    }

    boton.addEventListener("click", conmutar);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && nav.classList.contains("abierto")) {
        cerrar();
        boton.focus();
      }
    });

    document.addEventListener("click", function (ev) {
      if (!nav.classList.contains("abierto")) return;
      if (nav.contains(ev.target) || boton.contains(ev.target)) return;
      cerrar();
    });

    nav.addEventListener("click", function (ev) {
      if (ev.target.closest && ev.target.closest("a")) cerrar();
    });
  }

  /* ---------------------- cabecera que se oculta --------------------- */
  function iniciarCabeceraOcultable() {
    var cab = document.querySelector(".cabecera");
    if (!cab) return;
    var nav = document.querySelector(".nav-principal");
    var umbral = 140;
    var ultimoY = window.scrollY;

    function actualizar() {
      var y = window.scrollY;
      var oculta;
      if (y <= umbral) oculta = false;
      else if (y > ultimoY + 5) oculta = true;
      else if (y < ultimoY - 5) oculta = false;
      else oculta = cab.classList.contains("oculta");

      if (nav && nav.classList.contains("abierto")) oculta = false;
      ultimoY = y;
      cab.classList.toggle("oculta", oculta);
      document.body.classList.toggle("cabecera-oculta", oculta);
    }

    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
  }

  /* --------------------------- volver arriba -------------------------- */
  function iniciarBotonArriba() {
    var boton = document.querySelector("[data-arriba]");
    if (!boton) return;
    function actualizar() {
      boton.classList.toggle("visible", window.scrollY > 560);
    }
    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
    boton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----------------------------- generador ---------------------------- */
  var CLAVE_FAVS = "lb-favoritos";
  var CLAVE_TAMANO = "lb-tamano";

  function leerFavs() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE_FAVS) || "[]");
      return Array.isArray(datos) ? datos : [];
    } catch (e) { return []; }
  }
  function guardarFavs(lista) {
    try { localStorage.setItem(CLAVE_FAVS, JSON.stringify(lista)); } catch (e) { /* privado */ }
  }

  function crearBotonCopiar(etiqueta, texto, alCopiar, sinEvento) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "copiar copy-btn";
    b.textContent = "Copiar";
    b.setAttribute("aria-label", "Copiar estilo " + etiqueta);
    if (!sinEvento) {
      b.addEventListener("click", function () {
        copiar(texto).then(function () {
          marcarCopiado(b, "Texto copiado al portapapeles");
          if (alCopiar) alCopiar();
        });
      });
    }
    return b;
  }

  function idDeNombre(nombre) {
    return nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function crearTarjetaSimple(nombre, valor, prefijo, categoria) {
    var tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-fuente style-card";
    tarjeta.setAttribute("data-style-name", nombre);
    if (prefijo) {
      tarjeta.setAttribute("data-style-id", prefijo + "-" + idDeNombre(nombre));
      tarjeta.setAttribute("data-category", categoria || "");
    }

    var texto = document.createElement("div");
    texto.className = "tarjeta-texto";

    var cab = document.createElement("div");
    cab.className = "tarjeta-cabecera";
    var nombreEl = document.createElement("span");
    nombreEl.className = "tarjeta-nombre style-name";
    nombreEl.textContent = nombre;
    cab.appendChild(nombreEl);

    var salida = document.createElement("div");
    salida.className = "tarjeta-salida style-preview";
    salida.textContent = valor;

    texto.appendChild(cab);
    texto.appendChild(salida);

    var acciones = document.createElement("div");
    acciones.className = "tarjeta-acciones";
    acciones.appendChild(crearBotonCopiar(nombre, valor, null, true));

    tarjeta.appendChild(texto);
    tarjeta.appendChild(acciones);
    return tarjeta;
  }

  /* Copiar con delegación: sirve tanto para las tarjetas creadas al vuelo
     como para las que llegan pre-renderizadas en el HTML. */
  function iniciarCopiaDelegada(salida) {
    salida.addEventListener("click", function (ev) {
      var boton = ev.target.closest ? ev.target.closest(".copiar") : null;
      if (!boton || !salida.contains(boton)) return;
      var tarjeta = boton.closest(".tarjeta-fuente");
      var valor = tarjeta ? tarjeta.querySelector(".tarjeta-salida") : null;
      if (!valor) return;
      copiar(valor.textContent).then(function () {
        marcarCopiado(boton, "Texto copiado al portapapeles");
      });
    });
  }

  function iniciarGenerador() {
    var raiz = $("[data-generador]");
    if (!raiz || !window.LB) return;

    var entrada = $("[data-entrada]", raiz);
    var salida = $("[data-resultados]");
    var contador = $("[data-contador]", raiz);
    var contadorLargo = null;
    var contadorCorto = null;
    if (contador) {
      contadorLargo = document.createElement("span");
      contadorLargo.className = "contador-largo";
      contadorCorto = document.createElement("span");
      contadorCorto.className = "contador-corto";
      contadorCorto.setAttribute("aria-hidden", "true");
      contador.textContent = "";
      contador.appendChild(contadorLargo);
      contador.appendChild(contadorCorto);
    }
    function marcarContador(largo, corto) {
      if (!contador) return;
      contador.setAttribute("role", "status");
      contador.setAttribute("aria-live", "polite");
      contador.setAttribute("aria-label", largo);
      contadorLargo.textContent = largo;
      contadorCorto.textContent = corto;
    }
    var buscador = $("[data-buscar]", raiz);
    var botonMas = $("[data-mas]");
    if (!entrada || !salida) return;

    var categorias = raiz.getAttribute("data-generador") || "todas";
    var baseTodos = window.LB.porCategoria(categorias);
    var mezclasOn = false;
    var visiblesIniciales = parseInt(raiz.getAttribute("data-inicial") || "18", 10);
    var visibles = visiblesIniciales;
    var favoritos = leerFavs();
    var modo = "todas";

    function listaTodos() {
      if (!mezclasOn || !window.LB.mixtos) return baseTodos;
      return window.LB.mixtos().concat(baseTodos);
    }

    /* ---------- cabecera del campo + sugerencias ---------- */
    var etiquetaCampo = document.createElement("div");
    etiquetaCampo.className = "campo-etiqueta";
    etiquetaCampo.innerHTML =
      "<strong>Tu texto</strong><span>Se convierte mientras escribes</span>";

    var sugerencias = document.createElement("div");
    sugerencias.className = "sugerencias";
    sugerencias.setAttribute("role", "group");
    sugerencias.setAttribute("aria-label", "Prueba con");
    sugerencias.innerHTML = "<span>Prueba con</span>";
    ["Ana", "Amor", "Familia", "Free Fire"].forEach(function (palabra) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = palabra;
      b.addEventListener("click", function () {
        entrada.value = palabra;
        entrada.focus();
        programarPintar();
      });
      sugerencias.appendChild(b);
    });
    etiquetaCampo.appendChild(sugerencias);

    var barraHerramientas = $(".generador-barra", raiz);

    /* ---------- tira de categorías + favoritas ---------- */
    var chipCuenta = null;

    function crearFilaCategorias() {
      var fila = document.createElement("div");
      fila.className = "fila-categorias";
      fila.appendChild(crearTiraCategorias());

      var fav = document.createElement("button");
      fav.type = "button";
      fav.className = "chip chip-favoritas";
      fav.setAttribute("aria-pressed", "false");
      fav.innerHTML =
        '♥ Favoritas <span class="chip-cuenta" data-cuenta-favs>0</span>';
      fav.addEventListener("click", function () {
        modo = modo === "favoritas" ? "todas" : "favoritas";
        visibles = visiblesIniciales;
        var activo = modo === "favoritas";
        fav.classList.toggle("activo", activo);
        fav.setAttribute("aria-pressed", activo ? "true" : "false");
        pintar();
      });
      fila.appendChild(fav);
      chipCuenta = $("[data-cuenta-favs]", fila);
      return fila;
    }

    /* ---------- tamaño de letra + estilos mixtos ---------- */
    function tamanoGuardado() {
      var t = 18;
      try { t = parseInt(localStorage.getItem(CLAVE_TAMANO), 10); } catch (e) {}
      if (!t || isNaN(t)) t = 18;
      return Math.min(44, Math.max(14, t));
    }

    var controles = document.createElement("div");
    controles.className = "controles-extra";
    controles.innerHTML =
      '<label class="control-tamano"><span class="control-texto">Tamaño de letra</span>' +
      ' <input type="range" min="14" max="44" step="1" value="' + tamanoGuardado() +
      '" data-tamano aria-label="Tamaño de las letras">' +
      ' <span data-tamano-valor></span></label>' +
      '<label class="conmutador" title="Añade estilos que combinan varios alfabetos">' +
      ' <input type="checkbox" data-mezclas> 🎲 Estilos mixtos</label>';
    if (barraHerramientas && barraHerramientas.parentNode) {
      barraHerramientas.parentNode.insertBefore(controles, barraHerramientas.nextSibling);
    }

    var deslizador = $("[data-tamano]", controles);
    var etiquetaTamano = $("[data-tamano-valor]", controles);
    function aplicarTamano(px) {
      document.documentElement.style.setProperty("--tamano-resultado", px + "px");
      if (etiquetaTamano) etiquetaTamano.textContent = px + "px";
      try { localStorage.setItem(CLAVE_TAMANO, String(px)); } catch (e) {}
    }
    if (deslizador) {
      aplicarTamano(deslizador.value);
      deslizador.addEventListener("input", function () { aplicarTamano(this.value); });
    }

    var casillaMezclas = $("[data-mezclas]", controles);
    if (casillaMezclas) {
      casillaMezclas.checked = false;
      mezclasOn = false;
      casillaMezclas.addEventListener("change", function () {
        mezclasOn = this.checked;
        visibles = visiblesIniciales;
        pintar();
      });
    }

    function esFavorito(id) { return favoritos.indexOf(id) !== -1; }

    function contarEnPagina() {
      return listaTodos().filter(function (e) { return esFavorito(e.id); }).length;
    }

    function toggleFavorito(id) {
      var i = favoritos.indexOf(id);
      if (i === -1) favoritos.push(id);
      else favoritos.splice(i, 1);
      guardarFavs(favoritos);
      actualizarFavsUI();
    }

    function actualizarFavsUI() {
      $$(".favorito", salida).forEach(function (b) {
        var activo = esFavorito(b.getAttribute("data-id"));
        b.classList.toggle("activo", activo);
        b.textContent = activo ? "♥" : "♡";
        b.setAttribute("aria-pressed", activo ? "true" : "false");
      });
      $$(".tarjeta-fuente", salida).forEach(function (c) {
        var id = c.getAttribute("data-id");
        c.classList.toggle("es-favorita", !!id && esFavorito(id));
      });
      if (chipCuenta) chipCuenta.textContent = contarEnPagina();
      if (modo === "favoritas") pintar();
    }

    function textoActual() {
      return entrada.value;
    }

    function sinAcentos(s) {
      return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function pintar() {
      var texto = textoActual();

      if (!texto.trim()) {
        var vacio = document.createElement("p");
        vacio.className = "aviso-vacio";
        vacio.textContent =
          "Escribe un nombre, una frase o un nick arriba y aquí aparecerán todos los estilos.";
        salida.innerHTML = "";
        salida.appendChild(vacio);
        if (contador) marcarContador("0 caracteres · esperando tu texto", "0");
        if (botonMas) botonMas.style.display = "none";
        return;
      }

      var filtro = buscador ? sinAcentos(buscador.value.trim().toLowerCase()) : "";
      var lista = listaTodos().filter(function (e) {
        var coincide = !filtro || sinAcentos(e.nombre.toLowerCase()).indexOf(filtro) !== -1;
        if (modo === "favoritas") return coincide && esFavorito(e.id);
        return coincide;
      });
      var trozo = lista.slice(0, visibles);

      var fragmento = document.createDocumentFragment();

      if (!trozo.length) {
        var vacio = document.createElement("p");
        vacio.className = "aviso-vacio";
        vacio.textContent =
          modo === "favoritas" && !favoritos.length
            ? "Aún no tienes favoritas. Toca el corazón ♡ de cualquier letra para guardarla aquí."
            : "No hay estilos que coincidan con tu búsqueda. Prueba con «cursiva», «gótica» o «burbuja».";
        fragmento.appendChild(vacio);
        if (botonMas) botonMas.style.display = "none";
      }

      trozo.forEach(function (estilo, indice) {
        var resultado;
        try { resultado = estilo.fn(texto); } catch (e) { resultado = texto; }

        var tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-fuente style-card";
        tarjeta.setAttribute("data-id", estilo.id);
        tarjeta.setAttribute("data-style-id", estilo.id);
        tarjeta.setAttribute("data-style-name", estilo.nombre);
        tarjeta.setAttribute("data-category", estilo.cat.join(" "));
        tarjeta.setAttribute("data-default-text", texto);
        if (esFavorito(estilo.id)) tarjeta.classList.add("es-favorita");

        var cont = document.createElement("div");
        cont.className = "tarjeta-texto";

        var cab = document.createElement("div");
        cab.className = "tarjeta-cabecera";

        if (estilo.destacado && indice % 8 === 0) {
          var marca = document.createElement("span");
          marca.className = "tendencia";
          marca.textContent = "🔥 En tendencia";
          cab.appendChild(marca);
        }

        var nombre = document.createElement("span");
        nombre.className = "tarjeta-nombre style-name";
        nombre.textContent = estilo.nombre;
        cab.appendChild(nombre);

        var valor = document.createElement("div");
        valor.className = "tarjeta-salida style-preview";
        valor.setAttribute("data-default-text", resultado);
        valor.textContent = resultado;

        cont.appendChild(cab);
        cont.appendChild(valor);

        var acciones = document.createElement("div");
        acciones.className = "tarjeta-acciones";

        var favoritoBtn = document.createElement("button");
        favoritoBtn.type = "button";
        favoritoBtn.className = "favorito";
        favoritoBtn.setAttribute("data-id", estilo.id);
        favoritoBtn.setAttribute("aria-pressed", esFavorito(estilo.id) ? "true" : "false");
        favoritoBtn.setAttribute("aria-label", "Guardar o quitar de favoritas: " + estilo.nombre);
        favoritoBtn.title = "Favorita";
        favoritoBtn.textContent = esFavorito(estilo.id) ? "♥" : "♡";
        if (esFavorito(estilo.id)) favoritoBtn.classList.add("activo");

        acciones.appendChild(favoritoBtn);
        acciones.appendChild(crearBotonCopiar(estilo.nombre, resultado, null, true));
        tarjeta.appendChild(cont);
        tarjeta.appendChild(acciones);
        fragmento.appendChild(tarjeta);
      });

      salida.innerHTML = "";
      salida.appendChild(fragmento);

      if (contador) {
        var nCaracteres = Array.from(entrada.value).length;
        if (modo === "favoritas") {
          marcarContador(
            nCaracteres + " caracteres · " + lista.length +
              (lista.length === 1 ? " favorita" : " favoritas"),
            nCaracteres + "/" + lista.length
          );
        } else {
          marcarContador(
            nCaracteres + " caracteres · " +
              Math.min(visibles, lista.length) + " de " + lista.length + " estilos",
            nCaracteres + "/" + lista.length
          );
        }
      }

      if (botonMas) {
        var restantes = lista.length - trozo.length;
        if (modo === "favoritas" || restantes <= 0) {
          botonMas.style.display = "none";
        } else {
          botonMas.style.display = "inline-flex";
          botonMas.textContent = "Ver " + Math.min(18, restantes) + " estilos más";
          botonMas.classList.add("boton-mas");
        }
      }
    }

    /* ---------- hidratación de las tarjetas pre-renderizadas ----------
       El HTML estático ya trae las tarjetas convertidas. En lugar de
       vaciar el contenedor al cargar, se conserva y solo se conectan los
       botones mediante delegación de eventos. Al escribir, pintar() vuelve
       a generar las tarjetas con el texto del usuario. */
    salida.addEventListener("click", function (ev) {
      var objetivo = ev.target;
      if (!objetivo || !objetivo.closest) return;

      var favorito = objetivo.closest(".favorito");
      if (favorito && salida.contains(favorito)) {
        ev.preventDefault();
        toggleFavorito(favorito.getAttribute("data-id"));
        return;
      }

      var boton = objetivo.closest(".copiar");
      if (!boton || !salida.contains(boton)) return;
      var tarjeta = boton.closest(".tarjeta-fuente");
      var valor = tarjeta ? tarjeta.querySelector(".tarjeta-salida") : null;
      if (!valor) return;
      copiar(valor.textContent).then(function () {
        marcarCopiado(boton, "Texto copiado al portapapeles");
      });
    });

    function hidratarEstaticas() {
      $$(".tarjeta-fuente", salida).forEach(function (tarjeta) {
        var id = tarjeta.getAttribute("data-id") || tarjeta.getAttribute("data-style-id");
        if (id) {
          tarjeta.setAttribute("data-id", id);
          tarjeta.setAttribute("data-style-id", id);
        }
        var nombre = tarjeta.querySelector(".tarjeta-nombre");
        if (nombre) nombre.classList.add("style-name");
        var valor = tarjeta.querySelector(".tarjeta-salida");
        if (valor) valor.classList.add("style-preview");
      });
    }

    function actualizarContadorEstatico() {
      var total = listaTodos().length;
      var mostrados = $$(".tarjeta-fuente", salida).length;
      var nCaracteres = Array.from(entrada.value).length;
      if (contador) {
        marcarContador(
          nCaracteres + " caracteres · " + mostrados + " de " + total + " estilos",
          nCaracteres + "/" + total
        );
      }
      if (botonMas) {
        var restantes = total - mostrados;
        if (restantes <= 0) {
          botonMas.style.display = "none";
        } else {
          botonMas.style.display = "inline-flex";
          botonMas.textContent = "Ver " + Math.min(18, restantes) + " estilos más";
          botonMas.classList.add("boton-mas");
        }
      }
    }

    var pendiente = null;
    function programarPintar() {
      if (pendiente) cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(function () {
        pendiente = null;
        pintar();
      });
    }

    entrada.addEventListener("input", programarPintar);
    if (buscador) {
      buscador.addEventListener("input", function () {
        visibles = visiblesIniciales;
        programarPintar();
      });
    }
    if (botonMas) {
      botonMas.addEventListener("click", function () {
        visibles += 18;
        pintar();
      });
    }

    var limpiar = $("[data-limpiar]", raiz);
    if (limpiar) {
      limpiar.addEventListener("click", function () {
        entrada.value = "";
        visibles = visiblesIniciales;
        entrada.focus();
        pintar();
      });
    }

    var copiarTodo = $("[data-copiar-todo]", raiz);
    if (copiarTodo) {
      copiarTodo.addEventListener("click", function () {
        var textos = $$(".tarjeta-salida", salida).map(function (n) {
          return n.textContent;
        });
        if (!textos.length) {
          avisar("No hay estilos que copiar");
          return;
        }
        copiar(textos.join("\n")).then(function () {
          marcarCopiado(copiarTodo, "Todos los estilos copiados");
        });
      });
    }

    /* ---------- campo flotante al hacer scroll ---------- */
    function hacerPegajoso() {
      if (!raiz || !raiz.parentNode) return;
      if (raiz.parentNode.classList.contains("generador-pegado")) return;

      var chips = document.querySelector(".chips-paginas");
      if (chips) chips.remove();

      var envoltura = document.createElement("div");
      envoltura.className = "generador-pegado";
      raiz.parentNode.insertBefore(envoltura, raiz);

      envoltura.appendChild(etiquetaCampo);

      var campo = document.createElement("div");
      campo.className = "campo-pegado";
      campo.appendChild(entrada);
      envoltura.appendChild(campo);

      envoltura.appendChild(raiz);
      envoltura.appendChild(crearFilaCategorias());
      envoltura.appendChild(salida);

      var pMas = botonMas ? botonMas.parentNode : null;
      if (pMas) {
        pMas.classList.add("centrado");
        pMas.removeAttribute("style");
        envoltura.appendChild(pMas);
      }
    }

    if ($$(".tarjeta-fuente", salida).length) {
      hidratarEstaticas();
      actualizarContadorEstatico();
    } else {
      pintar();
    }
    actualizarFavsUI();
    hacerPegajoso();
  }

  /* ------------------------ rejillas de símbolos ---------------------- */
  function iniciarSimbolos() {
    $$("[data-simbolos]").forEach(function (caja) {
      var grupo = caja.getAttribute("data-simbolos");
      var lista = (window.LB && window.LB.simbolos[grupo]) || [];
      lista.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = s;
        b.title = "Copiar " + s;
        b.setAttribute("aria-label", "Copiar símbolo " + s);
        b.addEventListener("click", function () {
          copiar(s).then(function () {
            b.classList.add("copiado");
            setTimeout(function () { b.classList.remove("copiado"); }, 900);
            avisar("Copiado: " + s);
          });
        });
        caja.appendChild(b);
      });
    });
  }

  /* --------------------- copiar elementos sueltos --------------------- */
  function iniciarCopiables() {
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("[data-copiar]") : null;
      if (!b) return;
      var texto = b.getAttribute("data-copiar") || b.textContent;
      copiar(texto).then(function () {
        marcarCopiado(b, "Copiado: " + texto.slice(0, 24));
      });
    });

    $$(".lista-nombres").forEach(function (lista) {
      lista.addEventListener("click", function (ev) {
        if (ev.target.closest("button")) return;
        var boton = ev.target.closest("li") && ev.target.closest("li").querySelector("[data-copiar]");
        if (boton) boton.click();
      });
    });
  }

  /* ------------------- conversor mayúsculas/minúsculas ---------------- */
  function iniciarConversorCaja() {
    var caja = $("[data-conversor-caja]");
    if (!caja) return;
    var entrada = $("[data-entrada]", caja);
    var salida = $("[data-resultados-caja]");
    if (!entrada || !salida) return;

    function titulo(t) {
      return t.toLowerCase().replace(/(^|\s|["'(¡¿-])([\p{L}])/gu, function (m, a, b) {
        return a + b.toUpperCase();
      });
    }
    function frase(t) {
      return t.toLowerCase().replace(/(^\s*|[.!?¡¿]\s+)([\p{L}])/gu, function (m, a, b) {
        return a + b.toUpperCase();
      });
    }
    function alternada(t) {
      var out = "";
      var up = false;
      Array.from(t).forEach(function (c) {
        if (/\s/.test(c)) { out += c; return; }
        out += up ? c.toUpperCase() : c.toLowerCase();
        up = !up;
      });
      return out;
    }

    var modos = [
      { nombre: "MAYÚSCULAS", fn: function (t) { return t.toUpperCase(); } },
      { nombre: "minúsculas", fn: function (t) { return t.toLowerCase(); } },
      { nombre: "Tipo título", fn: titulo },
      { nombre: "Tipo frase", fn: frase },
      { nombre: "aLtErNaDa", fn: alternada },
      { nombre: "Inversa de caja", fn: function (t) {
        return Array.from(t).map(function (c) {
          return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
        }).join("");
      } },
      { nombre: "Sin acentos", fn: function (t) {
        return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      } },
      { nombre: "Formato slug", fn: function (t) {
        return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      } },
      { nombre: "Formato guion_bajo", fn: function (t) {
        return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      } }
    ];

    function pintar() {
      var texto = entrada.value.trim() ? entrada.value : "Escribe tu texto aquí";
      var fragmento = document.createDocumentFragment();
      modos.forEach(function (m) {
        fragmento.appendChild(crearTarjetaSimple(m.nombre, m.fn(texto), "caja", "herramientas caja mayusculas"));
      });
      salida.innerHTML = "";
      salida.appendChild(fragmento);
    }

    entrada.addEventListener("input", pintar);
    iniciarCopiaDelegada(salida);
    if (!salida.querySelector(".tarjeta-fuente")) pintar();
  }

  /* -------------------------- números a letras ----------------------- */
  var UNIDADES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis",
    "veintisiete", "veintiocho", "veintinueve"];
  var DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  var CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
    "seiscientos", "setecientos", "ochocientos", "novecientos"];

  function menorMil(n) {
    if (n === 0) return "";
    if (n === 100) return "cien";
    var texto = "";
    var c = Math.floor(n / 100);
    var r = n % 100;
    if (c) texto += CENTENAS[c];
    if (r) {
      if (texto) texto += " ";
      if (r < 30) texto += UNIDADES[r];
      else {
        var d = Math.floor(r / 10);
        var u = r % 10;
        texto += DECENAS[d] + (u ? " y " + UNIDADES[u] : "");
      }
    }
    return texto;
  }

  function numeroALetras(n) {
    n = Math.trunc(Math.abs(n));
    if (n === 0) return "cero";
    var partes = [];
    var escalas = [
      { valor: 1e12, sing: "billón", plur: "billones" },
      { valor: 1e6, sing: "millón", plur: "millones" },
      { valor: 1e3, sing: "mil", plur: "mil" }
    ];
    var resto = n;
    escalas.forEach(function (e) {
      var cant = Math.floor(resto / e.valor);
      if (cant > 0) {
        resto = resto % e.valor;
        if (e.valor === 1e3) {
          partes.push((cant === 1 ? "" : menorMil(cant) + " ") + "mil");
        } else {
          partes.push((cant === 1 ? "un " : menorMil(cant) + " ") + (cant === 1 ? e.sing : e.plur));
        }
      }
    });
    if (resto > 0) partes.push(menorMil(resto));
    return partes.join(" ").replace(/\s+/g, " ").trim();
  }

  function iniciarNumeros() {
    var caja = $("[data-numeros]");
    if (!caja) return;
    var entrada = $("[data-entrada]", caja);
    var salida = $("[data-resultados-numeros]");
    if (!entrada || !salida) return;

    function pintar() {
      var bruto = entrada.value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
      var num = parseFloat(bruto);
      salida.innerHTML = "";
      if (isNaN(num)) {
        var aviso = document.createElement("p");
        aviso.className = "aviso-vacio";
        aviso.textContent = "Escribe un número para verlo en letras.";
        salida.appendChild(aviso);
        return;
      }
      var entero = Math.trunc(Math.abs(num));
      var decimales = Math.round((Math.abs(num) - entero) * 100);
      var signo = num < 0 ? "menos " : "";
      var enLetras = signo + numeroALetras(entero);
      var resultados = [
        { nombre: "En letras", valor: enLetras },
        { nombre: "Con mayúscula inicial", valor: enLetras.charAt(0).toUpperCase() + enLetras.slice(1) },
        { nombre: "Todo en mayúsculas", valor: enLetras.toUpperCase() },
        { nombre: "Formato dinero (euros)", valor: enLetras + " euros con " +
            (decimales ? numeroALetras(decimales) : "cero") + " céntimos" },
        { nombre: "Formato dinero (pesos)", valor: enLetras + " pesos " +
            (decimales < 10 ? "0" + decimales : decimales) + "/100 M.N." },
        { nombre: "Ordinal aproximado", valor: entero + ".º" },
        { nombre: "Con separadores", valor: entero.toLocaleString("es-ES") }
      ];
      var fragmento = document.createDocumentFragment();
      resultados.forEach(function (r) {
        fragmento.appendChild(crearTarjetaSimple(r.nombre, r.valor, "numero", "herramientas numeros letras"));
      });
      salida.appendChild(fragmento);
    }

    entrada.addEventListener("input", pintar);
    iniciarCopiaDelegada(salida);
    if (!salida.querySelector(".tarjeta-fuente")) pintar();
  }

  /* --------------------- japonés (hiragana/katakana) ------------------ */
  var SILABAS = [
    ["cha", "ちゃ", "チャ"], ["chi", "ち", "チ"], ["cho", "ちょ", "チョ"], ["chu", "ちゅ", "チュ"],
    ["sha", "しゃ", "シャ"], ["shi", "し", "シ"], ["sho", "しょ", "ショ"], ["shu", "しゅ", "シュ"],
    ["tsu", "つ", "ツ"], ["kya", "きゃ", "キャ"], ["kyo", "きょ", "キョ"], ["kyu", "きゅ", "キュ"],
    ["rya", "りゃ", "リャ"], ["ryo", "りょ", "リョ"], ["ryu", "りゅ", "リュ"],
    ["gua", "ぐあ", "グア"], ["gue", "げ", "ゲ"], ["gui", "ぎ", "ギ"],
    ["que", "け", "ケ"], ["qui", "き", "キ"],
    ["ka", "か", "カ"], ["ki", "き", "キ"], ["ku", "く", "ク"], ["ke", "け", "ケ"], ["ko", "こ", "コ"],
    ["sa", "さ", "サ"], ["su", "す", "ス"], ["se", "せ", "セ"], ["so", "そ", "ソ"],
    ["ta", "た", "タ"], ["te", "て", "テ"], ["to", "と", "ト"],
    ["na", "な", "ナ"], ["ni", "に", "ニ"], ["nu", "ぬ", "ヌ"], ["ne", "ね", "ネ"], ["no", "の", "ノ"],
    ["ha", "は", "ハ"], ["hi", "ひ", "ヒ"], ["fu", "ふ", "フ"], ["he", "へ", "ヘ"], ["ho", "ほ", "ホ"],
    ["ma", "ま", "マ"], ["mi", "み", "ミ"], ["mu", "む", "ム"], ["me", "め", "メ"], ["mo", "も", "モ"],
    ["ya", "や", "ヤ"], ["yu", "ゆ", "ユ"], ["yo", "よ", "ヨ"],
    ["ra", "ら", "ラ"], ["ri", "り", "リ"], ["ru", "る", "ル"], ["re", "れ", "レ"], ["ro", "ろ", "ロ"],
    ["la", "ら", "ラ"], ["li", "り", "リ"], ["lu", "る", "ル"], ["le", "れ", "レ"], ["lo", "ろ", "ロ"],
    ["wa", "わ", "ワ"], ["wo", "を", "ヲ"],
    ["ga", "が", "ガ"], ["gu", "ぐ", "グ"], ["go", "ご", "ゴ"],
    ["za", "ざ", "ザ"], ["zu", "ず", "ズ"], ["ze", "ぜ", "ゼ"], ["zo", "ぞ", "ゾ"],
    ["da", "だ", "ダ"], ["de", "で", "デ"], ["do", "ど", "ド"],
    ["ba", "ば", "バ"], ["bi", "び", "ビ"], ["bu", "ぶ", "ブ"], ["be", "べ", "ベ"], ["bo", "ぼ", "ボ"],
    ["pa", "ぱ", "パ"], ["pi", "ぴ", "ピ"], ["pu", "ぷ", "プ"], ["pe", "ぺ", "ペ"], ["po", "ぽ", "ポ"],
    ["va", "ば", "バ"], ["vi", "び", "ビ"], ["vu", "ぶ", "ブ"], ["ve", "べ", "ベ"], ["vo", "ぼ", "ボ"],
    ["ja", "は", "ハ"], ["ji", "じ", "ジ"], ["ju", "ふ", "フ"], ["je", "へ", "ヘ"], ["jo", "ほ", "ホ"],
    ["ca", "か", "カ"], ["cu", "く", "ク"], ["co", "こ", "コ"], ["ce", "せ", "セ"], ["ci", "し", "シ"],
    ["a", "あ", "ア"], ["i", "い", "イ"], ["u", "う", "ウ"], ["e", "え", "エ"], ["o", "お", "オ"],
    ["n", "ん", "ン"], ["m", "ん", "ン"], ["s", "す", "ス"], ["r", "る", "ル"], ["l", "る", "ル"],
    ["t", "と", "ト"], ["d", "ど", "ド"], ["k", "く", "ク"], ["p", "ぷ", "プ"], ["b", "ぶ", "ブ"],
    ["g", "ぐ", "グ"], ["f", "ふ", "フ"], ["y", "い", "イ"], ["z", "ず", "ズ"], ["x", "くす", "クス"],
    ["h", "は", "ハ"], ["c", "く", "ク"], ["q", "く", "ク"], ["w", "う", "ウ"], ["v", "ぶ", "ブ"],
    ["j", "じ", "ジ"], [" ", "　", "・"]
  ];

  function aKana(texto, indice) {
    var t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    var salida = "";
    var i = 0;
    while (i < t.length) {
      var encontrado = false;
      for (var s = 0; s < SILABAS.length; s++) {
        var syl = SILABAS[s][0];
        if (t.substr(i, syl.length) === syl) {
          salida += SILABAS[s][indice];
          i += syl.length;
          encontrado = true;
          break;
        }
      }
      if (!encontrado) { salida += t[i]; i += 1; }
    }
    return salida;
  }

  function iniciarJapones() {
    var caja = $("[data-japones]");
    if (!caja) return;
    var tipo = caja.getAttribute("data-japones");
    var entrada = $("[data-entrada]", caja);
    var salida = $("[data-resultados-japones]");
    if (!entrada || !salida) return;

    function pintar() {
      var texto = entrada.value.trim() ? entrada.value : "Maria";
      var filas = [];
      if (tipo === "hiragana" || tipo === "ambos") {
        filas.push({ nombre: "Hiragana ひらがな", valor: aKana(texto, 1) });
      }
      if (tipo === "katakana" || tipo === "ambos") {
        filas.push({ nombre: "Katakana カタカナ", valor: aKana(texto, 2) });
      }
      filas.push({ nombre: "Estilo japonés decorado", valor: "『" + aKana(texto, 2) + "』" });
      filas.push({ nombre: "Con puntos japoneses", valor: aKana(texto, 2).split("").join("・") });

      var fragmento = document.createDocumentFragment();
      filas.forEach(function (r) {
        fragmento.appendChild(crearTarjetaSimple(r.nombre, r.valor, "japones", "herramientas japones"));
      });
      salida.innerHTML = "";
      salida.appendChild(fragmento);
    }

    entrada.addEventListener("input", pintar);
    iniciarCopiaDelegada(salida);
    if (!salida.querySelector(".tarjeta-fuente")) pintar();
  }

  /* ----------------------------- cookies ----------------------------- */
  function iniciarCookies() {
    var banner = $("[data-banner-cookies]");
    if (!banner) return;
    var clave = "lb-cookies-aceptadas";
    var guardado = null;
    try { guardado = localStorage.getItem(clave); } catch (e) { return; }
    if (guardado) return;

    banner.classList.add("visible");
    $$("[data-cookies-accion]", banner).forEach(function (b) {
      b.addEventListener("click", function () {
        try { localStorage.setItem(clave, b.getAttribute("data-cookies-accion")); } catch (e) {}
        banner.classList.remove("visible");
      });
    });
  }

  /* ----------------------------- contacto ---------------------------- */
  function iniciarContacto() {
    var form = $("[data-contacto]");
    if (!form) return;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var datos = new FormData(form);
      var asunto = encodeURIComponent("Contacto web: " + (datos.get("asunto") || ""));
      var cuerpo = encodeURIComponent(
        "Nombre: " + (datos.get("nombre") || "") + "\n" +
        "Correo: " + (datos.get("correo") || "") + "\n\n" +
        (datos.get("mensaje") || "")
      );
      window.location.href = "mailto:letrasbonitas88@gmail.com?subject=" + asunto + "&body=" + cuerpo;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    iniciarMenu();
    iniciarCabeceraOcultable();
    iniciarBotonArriba();
    iniciarGenerador();
    iniciarSimbolos();
    iniciarCopiables();
    iniciarConversorCaja();
    iniciarNumeros();
    iniciarJapones();
    iniciarCookies();
    iniciarContacto();
  });
})();
