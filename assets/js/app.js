/* Letras Bonitas — interfaz del generador (JavaScript puro) */
(function () {
  "use strict";

  /* ---------------- utilidades ---------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var brindis;
  function avisar(mensaje) {
    if (!brindis) {
      brindis = document.createElement("div");
      brindis.className = "brindis";
      document.body.appendChild(brindis);
    }
    brindis.textContent = mensaje;
    brindis.classList.add("visible");
    clearTimeout(brindis._t);
    brindis._t = setTimeout(function () { brindis.classList.remove("visible"); }, 1600);
  }

  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto);
    }
    var area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (e) { /* nada */ }
    document.body.removeChild(area);
    return Promise.resolve();
  }

  /* ---------------- menú móvil ---------------- */
  function iniciarMenu() {
    var boton = $(".menu-boton");
    var nav = $(".nav-principal");
    if (!boton || !nav) return;
    boton.addEventListener("click", function () {
      var abierto = nav.classList.toggle("abierto");
      boton.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
    // marca el enlace activo
    var ruta = location.pathname.replace(/index\.html$/, "");
    $$(".nav-principal a, .pie a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href === ruta) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------------- cabecera ocultable ----------------
     Al bajar, la cabecera se oculta (más espacio para leer resultados);
     al subir o al volver a la parte superior reaparece. Con histéresis
     para que no parpadee, y respeta el menú móvil abierto. */
  function iniciarCabeceraOcultable() {
    var cab = document.querySelector(".cabecera");
    if (!cab) return;
    var nav = document.querySelector(".nav-principal");
    var umbral = 120;
    var ultimoY = window.scrollY;
    function actualizar() {
      var y = window.scrollY;
      var oculta;
      if (y <= umbral) {
        oculta = false;                     // en la parte superior: siempre visible
      } else if (y > ultimoY + 4) {
        oculta = true;                      // bajando
      } else if (y < ultimoY - 4) {
        oculta = false;                     // subiendo
      } else {
        oculta = cab.classList.contains("oculta");
      }
      // Si el menú móvil está abierto, no escondemos la cabecera.
      if (nav && nav.classList.contains("abierto")) oculta = false;
      ultimoY = y;
      cab.classList.toggle("oculta", oculta);
      document.body.classList.toggle("cabecera-oculta", oculta);
    }
    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
  }

  /* ---------------- botón “volver arriba” ---------------- */
  function iniciarBotonArriba() {
    var boton = document.querySelector("[data-arriba]");
    if (!boton) return;
    function actualizar() {
      boton.classList.toggle("visible", window.scrollY > 400);
    }
    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
    boton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- generador ----------------
     Marcas 🔥 Tendencia (curar en fonts.js → DESTACADOS), corazón de
     favoritas con persistencia (localStorage) y una vista “Solo favoritas”. */
  var CLAVE_FAVS = "lb-favoritos";
  var CLAVE_TAMANO = "lb-tamano";
  function leerFavs() {
    try { return JSON.parse(localStorage.getItem(CLAVE_FAVS) || "[]") || []; }
    catch (e) { return []; }
  }
  function guardarFavs(lista) {
    try { localStorage.setItem(CLAVE_FAVS, JSON.stringify(lista)); } catch (e) { /* modo privado */ }
  }

  function iniciarGenerador() {
    var raiz = $("[data-generador]");
    if (!raiz || !window.LB) return;

    var entrada = $("[data-entrada]", raiz);
    var salida = $("[data-resultados]");
    var contador = $("[data-contador]", raiz);
    var buscador = $("[data-buscar]", raiz);
    var botonMas = $("[data-mas]");
    var categorias = raiz.getAttribute("data-generador") || "todas";
    var ejemplo = raiz.getAttribute("data-ejemplo") || "Letras Bonitas";

    /* Catálogo base de la página. Si el usuario activa “🎲 Estilos mixtos”
       se le añaden encima los estilos de mezcla (ver fonts.js → MIXES). */
    var baseTodos = window.LB.porCategoria(categorias);
    var mezclasOn = false;
    function listaTodos() {
      if (!mezclasOn || !window.LB.mixtos) return baseTodos;
      /* Los estilos mixtos van AL PRINCIPIO: al activar la opción el
         usuario ve de inmediato las combinaciones nuevas. */
      return window.LB.mixtos().concat(baseTodos);
    }
    var visibles = parseInt(raiz.getAttribute("data-inicial") || "18", 10);
    var favoritos = leerFavs();
    var modo = "todas"; // "todas" | "favoritas"

    /* Barra “Todas / ❤ Favoritas” insertada entre el generador y resultados */
    var barra = document.createElement("div");
    barra.className = "barra-favoritos";
    barra.innerHTML =
      '<button type="button" class="chip" data-modo="todas">✨ Todas</button>' +
      '<button type="button" class="chip" data-modo="favoritas">❤ Favoritas' +
      ' <span class="chip-cuenta" data-cuenta-favs>0</span></button>' +
      '<p class="ayuda-favoritas">Toca el corazón ♡ de una letra para guardarla aquí.</p>';
    if (salida && salida.parentNode) {
      salida.parentNode.insertBefore(barra, salida);
    }
    var chipCuenta = $("[data-cuenta-favs]", barra);

    /* ---- Controles extra: deslizador de tamaño + estilos mixtos --------
       Se inyectan aquí (no en el HTML de cada página) para que funcionen
       en TODAS las páginas del generador con una sola edición. El tamaño
       se aplica con la variable CSS --tamano-resultado (style.css), así
       las tarjetas se redimensionan al instante sin reconstruirlas. */
    function tamanoGuardado() {
      /* Tamaño por defecto: 18px (lo pidió el usuario). El deslizador
         permite subirlo hasta 44px o bajarlo a 14px. */
      var t = 18;
      try { t = parseInt(localStorage.getItem(CLAVE_TAMANO), 10); } catch (e) {}
      if (!t || isNaN(t)) t = 18;
      return Math.min(44, Math.max(14, t));
    }
    var controles = document.createElement("div");
    controles.className = "controles-extra";
    controles.innerHTML =
      '<label class="control-tamano">🔠 Tamaño de letra' +
      ' <input type="range" min="14" max="44" step="1" value="' + tamanoGuardado() +
      '" data-tamano aria-label="Tamaño de las letras">' +
      ' <span data-tamano-valor></span></label>' +
      '<label class="conmutador" title="Añade estilos que combinan varios alfabetos">' +
      ' <input type="checkbox" data-mezclas> 🎲 Estilos mixtos</label>';
    var barraControles = $(".generador-barra", raiz);
    if (barraControles && barraControles.parentNode) {
      barraControles.parentNode.insertBefore(controles, barraControles.nextSibling);
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
      /* La opción de estilos mixtos SIEMPRE empieza desmarcada en cada
         carga de página: no se recuerda entre visitas (así nunca aparece
         activada por sorpresa). El usuario la marca cuando la quiere. */
      casillaMezclas.checked = false;
      mezclasOn = false;
      casillaMezclas.addEventListener("change", function () {
        mezclasOn = this.checked;
        visibles = 18;
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

    /* Refresca corazones y contador sin reconstruir las tarjetas. */
    function actualizarFavsUI() {
      $$(".favorito", salida).forEach(function (b) {
        var activo = esFavorito(b.getAttribute("data-id"));
        b.classList.toggle("activo", activo);
        b.textContent = activo ? "♥" : "♡";
        b.setAttribute("aria-pressed", activo ? "true" : "false");
      });
      $$(".tarjeta-fuente", salida).forEach(function (c) {
        var id = c.getAttribute("data-id");
        c.classList.toggle("es-favorita", id && esFavorito(id));
      });
      if (chipCuenta) chipCuenta.textContent = contarEnPagina();
      if (modo === "favoritas") pintar();
    }

    function textoActual() {
      var t = entrada.value;
      return t && t.trim().length ? t : ejemplo;
    }

    function pintar() {
      var texto = textoActual();
      var filtro = buscador ? buscador.value.trim().toLowerCase() : "";
      var lista = listaTodos().filter(function (e) {
        var coincideFiltro = !filtro || e.nombre.toLowerCase().indexOf(filtro) !== -1;
        if (modo === "favoritas") return coincideFiltro && esFavorito(e.id);
        return coincideFiltro;
      });
      var trozo = lista.slice(0, visibles);

      salida.innerHTML = "";
      if (!trozo.length) {
        var vacio = document.createElement("p");
        vacio.className = "aviso-vacio";
        vacio.textContent =
          modo === "favoritas" && !favoritos.length
            ? "Aún no tienes favoritas. Toca el corazón ♡ de cualquier letra para guardarla aquí."
            : "No hay estilos que coincidan con tu búsqueda.";
        salida.appendChild(vacio);
        if (botonMas) botonMas.style.display = "none";
      }

      trozo.forEach(function (estilo) {
        var resultado;
        try { resultado = estilo.fn(texto); } catch (e) { resultado = texto; }

        var tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-fuente";
        tarjeta.setAttribute("data-id", estilo.id);
        if (esFavorito(estilo.id)) tarjeta.classList.add("es-favorita");

        var cont = document.createElement("div");
        cont.className = "tarjeta-texto";

        var cabecera = document.createElement("div");
        cabecera.className = "tarjeta-cabecera";

        var nombre = document.createElement("span");
        nombre.className = "tarjeta-nombre";
        nombre.textContent = estilo.nombre;

        if (estilo.destacado) {
          var marca = document.createElement("span");
          marca.className = "tendencia";
          marca.textContent = "🔥 En tendencia";
          cabecera.appendChild(marca);
        }
        cabecera.appendChild(nombre);

        var valor = document.createElement("div");
        valor.className = "tarjeta-salida";
        valor.textContent = resultado;

        cont.appendChild(cabecera);
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
        favoritoBtn.addEventListener("click", function () { toggleFavorito(estilo.id); });

        var boton = document.createElement("button");
        boton.type = "button";
        boton.className = "copiar";
        boton.textContent = "Copiar";
        boton.addEventListener("click", function () {
          copiar(resultado).then(function () {
            boton.textContent = "¡Copiado!";
            boton.classList.add("copiado");
            avisar("Texto copiado al portapapeles");
            setTimeout(function () {
              boton.textContent = "Copiar";
              boton.classList.remove("copiado");
            }, 1500);
          });
        });

        acciones.appendChild(favoritoBtn);
        acciones.appendChild(boton);
        tarjeta.appendChild(cont);
        tarjeta.appendChild(acciones);
        salida.appendChild(tarjeta);
      });

      if (contador) {
        if (modo === "favoritas") {
          contador.textContent = entrada.value.length + " caracteres · " +
            lista.length + (lista.length === 1 ? " favorita" : " favoritas");
        } else {
          contador.textContent = entrada.value.length + " caracteres · " +
            Math.min(visibles, lista.length) + " de " + lista.length + " estilos";
        }
      }
      if (botonMas) {
        botonMas.style.display = modo === "favoritas" || visibles >= lista.length ? "none" : "inline-block";
      }
    }

    entrada.addEventListener("input", pintar);
    if (buscador) buscador.addEventListener("input", function () { visibles = 18; pintar(); });
    if (botonMas) botonMas.addEventListener("click", function () { visibles += 18; pintar(); });

    $$(".chip", barra).forEach(function (chip) {
      chip.addEventListener("click", function () {
        modo = chip.getAttribute("data-modo");
        visibles = 18;
        $$(".chip", barra).forEach(function (c) {
          c.classList.toggle("activo", c === chip);
        });
        pintar();
      });
    });

    var limpiar = $("[data-limpiar]", raiz);
    if (limpiar) {
      limpiar.addEventListener("click", function () {
        entrada.value = "";
        entrada.focus();
        pintar();
      });
    }

    var copiarTodo = $("[data-copiar-todo]", raiz);
    if (copiarTodo) {
      copiarTodo.addEventListener("click", function () {
        var textos = $$(".tarjeta-salida", salida).map(function (n) { return n.textContent; });
        copiar(textos.join("\n")).then(function () { avisar("Todos los estilos copiados"); });
      });
    }

    /* Texto flotante (position: sticky): SOLO el textarea se fija debajo de
       la cabecera mientras haces scroll por los resultados. El buscador, los
       botones y la barra de favoritas siguen su curso normal, así la barra
       flotante es fina y no roba media pantalla en móvil. Sin sacar nada del
       flujo (cero saltos, cero parpadeos; suave de forma nativa).

       Se envuelven juntos campo + generador + barra de favoritas + resultados
       + botón “Ver más”: el sticky solo viaja dentro de esa envoltura, así
       que suelta justo al terminar los resultados y NUNCA tapa el contenido
       final de la página (FAQ, pie…). */
    function hacerPegajoso() {
      if (!raiz || !salida || !raiz.parentNode) return;
      if (salida.parentNode && salida.parentNode.className.indexOf("generador-pegado") !== -1) return;
      var envoltura = document.createElement("div");
      envoltura.className = "generador-pegado";
      salida.parentNode.insertBefore(envoltura, salida);

      /* El textarea vive en su propia caja sticky: solo él flota. */
      var campo = document.createElement("div");
      campo.className = "campo-pegado";
      envoltura.appendChild(campo);

      envoltura.appendChild(raiz);
      if (barra && barra.parentNode) envoltura.appendChild(barra);
      envoltura.appendChild(salida);
      if (botonMas && botonMas.parentNode) envoltura.appendChild(botonMas.parentNode);

      campo.appendChild(entrada);
    }

    pintar();
    actualizarFavsUI();
    $$(".chip", barra)[0] && $$(".chip", barra)[0].classList.add("activo");
    hacerPegajoso();
  }

  /* ---------------- rejillas de símbolos ---------------- */
  function iniciarSimbolos() {
    $$("[data-simbolos]").forEach(function (caja) {
      var grupo = caja.getAttribute("data-simbolos");
      var lista = (window.LB && window.LB.simbolos[grupo]) || [];
      lista.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = s;
        b.title = "Copiar " + s;
        b.addEventListener("click", function () {
          copiar(s).then(function () { avisar("Copiado: " + s); });
        });
        caja.appendChild(b);
      });
    });
  }

  /* ---------------- copiar elementos sueltos ---------------- */
  function iniciarCopiables() {
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("[data-copiar]") : null;
      if (!b) return;
      var texto = b.getAttribute("data-copiar") || b.textContent;
      copiar(texto).then(function () {
        avisar("Copiado: " + texto.slice(0, 24));
      });
    });
  }

  /* ---------------- conversor de mayúsculas ---------------- */
  function iniciarConversorCaja() {
    var caja = $("[data-conversor-caja]");
    if (!caja) return;
    var entrada = $("[data-entrada]", caja);
    var salida = $("[data-resultados-caja]");

    function titulo(t) {
      return t.toLowerCase().replace(/(^|\s|["'(¡¿-])([\p{L}])/gu, function (m, a, b) {
        return a + b.toUpperCase();
      });
    }
    function frase(t) {
      var s = t.toLowerCase();
      return s.replace(/(^\s*|[.!?¡¿]\s+)([\p{L}])/gu, function (m, a, b) { return a + b.toUpperCase(); });
    }
    function alternada(t) {
      var out = "", up = false;
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
      { nombre: "Tipo Título", fn: titulo },
      { nombre: "Tipo frase", fn: frase },
      { nombre: "aLtErNaDa", fn: alternada },
      { nombre: "Inversa de caja", fn: function (t) {
        return Array.from(t).map(function (c) {
          return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
        }).join("");
      } },
      { nombre: "Sin acentos", fn: function (t) { return t.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } },
      { nombre: "guiones-medios (slug)", fn: function (t) {
        return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      } },
      { nombre: "guion_bajo", fn: function (t) {
        return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      } }
    ];

    function pintar() {
      var texto = entrada.value.trim() ? entrada.value : "Escribe tu texto aquí";
      salida.innerHTML = "";
      modos.forEach(function (m) {
        var r = m.fn(texto);
        var tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-fuente";
        tarjeta.innerHTML = '<div class="tarjeta-texto"><span class="tarjeta-nombre"></span>' +
          '<div class="tarjeta-salida"></div></div>';
        $(".tarjeta-nombre", tarjeta).textContent = m.nombre;
        $(".tarjeta-salida", tarjeta).textContent = r;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "copiar";
        b.textContent = "Copiar";
        b.addEventListener("click", function () {
          copiar(r).then(function () { avisar("Texto copiado"); });
        });
        tarjeta.appendChild(b);
        salida.appendChild(tarjeta);
      });
    }
    entrada.addEventListener("input", pintar);
    pintar();
  }

  /* ---------------- números a letras ---------------- */
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
        var d = Math.floor(r / 10), u = r % 10;
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

    function pintar() {
      var bruto = entrada.value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
      var num = parseFloat(bruto);
      salida.innerHTML = "";
      if (isNaN(num)) {
        salida.innerHTML = '<p class="aviso-vacio">Escribe un número para verlo en letras.</p>';
        return;
      }
      var entero = Math.trunc(Math.abs(num));
      var decimales = Math.round((Math.abs(num) - entero) * 100);
      var signo = num < 0 ? "menos " : "";
      var enLetras = signo + numeroALetras(entero);
      var resultados = [
        { nombre: "En letras", valor: enLetras },
        { nombre: "Con mayúscula inicial", valor: enLetras.charAt(0).toUpperCase() + enLetras.slice(1) },
        { nombre: "TODO EN MAYÚSCULAS", valor: enLetras.toUpperCase() },
        { nombre: "Formato dinero (euros)", valor: enLetras + " euros con " +
            (decimales ? numeroALetras(decimales) : "cero") + " céntimos" },
        { nombre: "Formato dinero (pesos)", valor: enLetras + " pesos " +
            (decimales < 10 ? "0" + decimales : decimales) + "/100 M.N." },
        { nombre: "Ordinal aproximado", valor: entero + ".º" },
        { nombre: "Con separadores", valor: entero.toLocaleString("es-ES") }
      ];
      resultados.forEach(function (r) {
        var tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-fuente";
        tarjeta.innerHTML = '<div class="tarjeta-texto"><span class="tarjeta-nombre"></span>' +
          '<div class="tarjeta-salida"></div></div>';
        $(".tarjeta-nombre", tarjeta).textContent = r.nombre;
        $(".tarjeta-salida", tarjeta).textContent = r.valor;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "copiar";
        b.textContent = "Copiar";
        b.addEventListener("click", function () {
          copiar(r.valor).then(function () { avisar("Texto copiado"); });
        });
        tarjeta.appendChild(b);
        salida.appendChild(tarjeta);
      });
    }
    entrada.addEventListener("input", pintar);
    pintar();
  }

  /* ---------------- japonés (hiragana / katakana) ---------------- */
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
    var tipo = caja.getAttribute("data-japones"); // hiragana | katakana | ambos
    var entrada = $("[data-entrada]", caja);
    var salida = $("[data-resultados-japones]");

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

      salida.innerHTML = "";
      filas.forEach(function (r) {
        var tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-fuente";
        tarjeta.innerHTML = '<div class="tarjeta-texto"><span class="tarjeta-nombre"></span>' +
          '<div class="tarjeta-salida"></div></div>';
        $(".tarjeta-nombre", tarjeta).textContent = r.nombre;
        $(".tarjeta-salida", tarjeta).textContent = r.valor;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "copiar";
        b.textContent = "Copiar";
        b.addEventListener("click", function () {
          copiar(r.valor).then(function () { avisar("Texto copiado"); });
        });
        tarjeta.appendChild(b);
        salida.appendChild(tarjeta);
      });
    }
    entrada.addEventListener("input", pintar);
    pintar();
  }

  /* ---------------- banner de cookies ---------------- */
  function iniciarCookies() {
    var banner = $("[data-banner-cookies]");
    if (!banner) return;
    var clave = "lb-cookies-aceptadas";
    try {
      if (localStorage.getItem(clave)) return;
    } catch (e) { return; }
    banner.classList.add("visible");
    $$("[data-cookies-accion]", banner).forEach(function (b) {
      b.addEventListener("click", function () {
        try { localStorage.setItem(clave, b.getAttribute("data-cookies-accion")); } catch (e) {}
        banner.classList.remove("visible");
      });
    });
  }

  /* ---------------- formulario de contacto ---------------- */
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
      window.location.href = "mailto:hola@letrasbonitas.fun?subject=" + asunto + "&body=" + cuerpo;
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
