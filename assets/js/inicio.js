/* =============================================================================
   inicio.js — interactividad exclusiva de la portada
   Las tarjetas de estilos vienen pre-renderizadas en el HTML. Este archivo solo
   actualiza el texto, filtra, guarda favoritas y copia al portapapeles.
   ============================================================================= */
(function () {
  "use strict";

  var raiz = document.querySelector("[data-lb-conversor]");
  if (!raiz || !window.LB) return;

  var entrada = raiz.querySelector("[data-lb-entrada]");
  var grid = raiz.querySelector("[data-lb-grid]");
  var contador = raiz.querySelector("[data-lb-contador]");
  var buscador = raiz.querySelector("[data-lb-buscar]");
  var botonLimpiar = raiz.querySelector("[data-lb-limpiar]");
  var botonTodo = raiz.querySelector("[data-lb-copiar-todo]");
  var botonMas = raiz.querySelector("[data-lb-mas]");
  var rango = raiz.querySelector("[data-lb-tamano]");
  var salidaRango = raiz.querySelector("[data-lb-tamano-valor]");
  var mezclas = raiz.querySelector("[data-lb-mezclas]");
  var chipFavs = raiz.querySelector("[data-lb-favoritas]");
  var cuentaFavs = raiz.querySelector("[data-lb-favs-cuenta]");
  var botonesFiltro = Array.prototype.slice.call(
    raiz.querySelectorAll("[data-lb-filtro]")
  );

  if (!entrada || !grid) return;

  var CLAVE_FAVS = "lb-favoritos";
  var CLAVE_TAMANO = "lb-tamano";
  var LIMITE = 60;

  var GRUPOS = {
    todas: "todas",
    cursivas: "cursivas",
    coquette: "aesthetic,decoradas",
    goticas: "goticas",
    freefire: "freefire",
    pequenas: "pequenas"
  };

  var favoritos = leerFavoritos();
  var filtro = "todas";
  var soloFavoritas = false;
  var visibles = LIMITE;
  var mezclasOn = false;

  /* ------------------------------ utilidades ----------------------------- */
  function todos(sel) { return Array.prototype.slice.call(raiz.querySelectorAll(sel)); }

  function leerFavoritos() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE_FAVS) || "[]");
      return Array.isArray(datos) ? datos : [];
    } catch (e) { return []; }
  }

  function guardarFavoritos() {
    try { localStorage.setItem(CLAVE_FAVS, JSON.stringify(favoritos)); } catch (e) {}
  }

  function esFavorito(id) { return favoritos.indexOf(id) !== -1; }

  function sinAcentos(texto) {
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(area);
    return Promise.resolve();
  }

  var brindis = null;
  function avisar(mensaje) {
    if (!brindis) {
      brindis = document.createElement("div");
      brindis.className = "lb-brindis";
      brindis.setAttribute("role", "status");
      brindis.setAttribute("aria-live", "polite");
      document.body.appendChild(brindis);
    }
    brindis.textContent = mensaje;
    brindis.classList.add("is-visible");
    clearTimeout(brindis._t);
    brindis._t = setTimeout(function () {
      brindis.classList.remove("is-visible");
    }, 1900);
  }

  /* ------------------------------- listas -------------------------------- */
  function listaBase() {
    var categoria = soloFavoritas ? "todas" : (GRUPOS[filtro] || "todas");
    var lista = window.LB.porCategoria(categoria);
    if (mezclasOn && window.LB.mixtos) {
      lista = window.LB.mixtos().concat(lista);
    }
    return lista;
  }

  function listaFiltrada() {
    var termino = buscador ? sinAcentos(buscador.value.trim()) : "";
    return listaBase().filter(function (estilo) {
      if (soloFavoritas && !esFavorito(estilo.id)) return false;
      if (!termino) return true;
      return sinAcentos(estilo.nombre).indexOf(termino) !== -1;
    });
  }

  function convertir(estilo, texto) {
    try { return estilo.fn(texto); } catch (e) { return texto; }
  }

  /* ------------------------------ contador ------------------------------- */
  function actualizarContador(total, mostrados) {
    if (!contador) return;
    var texto = entrada.value;
    var n = Array.from(texto).length;
    if (!texto.trim()) {
      contador.textContent = "0 caracteres · esperando tu texto";
      return;
    }
    var sufijo = soloFavoritas ? "favoritas" : "estilos";
    contador.textContent = n + " caracteres · " + mostrados + " de " + total + " " + sufijo;
  }

  function actualizarBotonMas(total, mostrados) {
    if (!botonMas) return;
    var restantes = total - mostrados;
    if (restantes <= 0 || !entrada.value.trim()) {
      botonMas.hidden = true;
      return;
    }
    botonMas.hidden = false;
    botonMas.textContent = "Ver " + Math.min(LIMITE, restantes) + " estilos más";
  }

  /* ------------------------------- tarjetas ------------------------------ */
  function crearTarjeta(estilo, indice, texto) {
    var tarjeta = document.createElement("article");
    tarjeta.className = "lb-tarjeta style-card";
    tarjeta.setAttribute("data-lb-id", estilo.id);
    tarjeta.setAttribute("data-style-id", estilo.id);
    tarjeta.setAttribute("data-style-name", estilo.nombre);
    tarjeta.setAttribute("data-category", estilo.cat.join(" "));
    tarjeta.setAttribute("data-default-text", texto);
    tarjeta.title = "Toca para copiar";
    if (esFavorito(estilo.id)) tarjeta.classList.add("is-favorita");

    var cabecera = document.createElement("div");
    cabecera.className = "lb-tarjeta-cabecera";

    if (indice === 0 && filtro === "todas" && !soloFavoritas && !buscador.value.trim()) {
      var insignia = document.createElement("span");
      insignia.className = "lb-tarjeta-insignia";
      insignia.textContent = "🔥 En tendencia";
      cabecera.appendChild(insignia);
    }

    var nombre = document.createElement("span");
    nombre.className = "lb-tarjeta-nombre style-name";
    nombre.textContent = estilo.nombre;
    cabecera.appendChild(nombre);

    var salida = document.createElement("p");
    salida.className = "lb-tarjeta-salida style-preview";
    salida.setAttribute("data-lb-salida", "");
    salida.setAttribute("data-default", convertir(estilo, texto));
    salida.setAttribute("data-default-text", convertir(estilo, texto));
    salida.lang = "es";
    salida.textContent = convertir(estilo, texto);

    var acciones = document.createElement("div");
    acciones.className = "lb-tarjeta-acciones";

    var favorito = document.createElement("button");
    favorito.type = "button";
    favorito.className = "lb-btn-favorito";
    favorito.setAttribute("data-lb-favorito", estilo.id);
    favorito.setAttribute("aria-pressed", esFavorito(estilo.id) ? "true" : "false");
    favorito.setAttribute("aria-label", (esFavorito(estilo.id) ? "Quitar " : "Guardar ") + estilo.nombre + (esFavorito(estilo.id) ? " de favoritas" : " en favoritas"));
    favorito.textContent = esFavorito(estilo.id) ? "♥" : "♡";

    var copiarBoton = document.createElement("button");
    copiarBoton.type = "button";
    copiarBoton.className = "lb-btn-copiar";
    copiarBoton.setAttribute("data-lb-copiar", "");
    copiarBoton.textContent = "Copiar";

    acciones.appendChild(favorito);
    acciones.appendChild(copiarBoton);
    tarjeta.appendChild(cabecera);
    tarjeta.appendChild(salida);
    tarjeta.appendChild(acciones);
    return tarjeta;
  }

  function render() {
    var lista = listaFiltrada();
    var texto = entrada.value;

    if (!texto.trim()) {
      var esperando = document.createElement("p");
      esperando.className = "lb-vacio";
      esperando.textContent = "Escribe tu texto arriba para ver todos los estilos al instante.";
      grid.textContent = "";
      grid.appendChild(esperando);
      actualizarContador(0, 0);
      if (botonMas) botonMas.hidden = true;
      return;
    }

    var trozo = lista.slice(0, visibles);

    var fragmento = document.createDocumentFragment();
    if (!trozo.length) {
      var vacio = document.createElement("p");
      vacio.className = "lb-vacio";
      vacio.textContent = soloFavoritas && !favoritos.length
        ? "Aún no tienes favoritas. Toca el corazón ♡ de cualquier tarjeta para guardarla aquí."
        : "No hay estilos que coincidan con tu búsqueda. Prueba con «cursiva», «gótica» o «burbuja».";
      fragmento.appendChild(vacio);
    } else {
      trozo.forEach(function (estilo, indice) {
        fragmento.appendChild(crearTarjeta(estilo, indice, texto));
      });
    }

    grid.textContent = "";
    grid.appendChild(fragmento);
    actualizarContador(lista.length, trozo.length);
    actualizarBotonMas(lista.length, trozo.length);
  }

  var pendiente = null;
  function programarRender() {
    if (pendiente) cancelAnimationFrame(pendiente);
    pendiente = requestAnimationFrame(function () {
      pendiente = null;
      visibles = LIMITE;
      render();
    });
  }

  /* ------------------------------ favoritas ------------------------------ */
  function pintarFavoritos() {
    todos("[data-lb-favorito]").forEach(function (boton) {
      var id = boton.getAttribute("data-lb-favorito");
      var activo = esFavorito(id);
      var nombre = boton.closest(".lb-tarjeta");
      nombre = nombre ? nombre.querySelector(".lb-tarjeta-nombre") : null;
      nombre = nombre ? nombre.textContent : "este estilo";
      boton.setAttribute("aria-pressed", activo ? "true" : "false");
      boton.setAttribute("aria-label", activo ? "Quitar " + nombre + " de favoritas" : "Guardar " + nombre + " en favoritas");
      boton.textContent = activo ? "♥" : "♡";
      var tarjeta = boton.closest(".lb-tarjeta");
      if (tarjeta) tarjeta.classList.toggle("is-favorita", activo);
    });
    if (cuentaFavs) cuentaFavs.textContent = favoritos.length;
    if (chipFavs) {
      chipFavs.classList.toggle("is-activo", soloFavoritas);
      chipFavs.setAttribute("aria-pressed", soloFavoritas ? "true" : "false");
    }
  }

  function alternarFavorito(id) {
    var i = favoritos.indexOf(id);
    if (i === -1) favoritos.push(id);
    else favoritos.splice(i, 1);
    guardarFavoritos();
    pintarFavoritos();
    if (soloFavoritas) render();
  }

  /* ------------------------------- copiar -------------------------------- */
  function copiarTarjeta(tarjeta) {
    var salida = tarjeta.querySelector("[data-lb-salida]");
    var boton = tarjeta.querySelector("[data-lb-copiar]");
    if (!salida) return;
    var texto = salida.textContent;

    copiar(texto).then(function () {
      tarjeta.classList.add("is-copiado");
      if (boton) {
        if (!boton._original) boton._original = boton.textContent;
        boton.textContent = "¡Copiado!";
        clearTimeout(boton._t);
        boton._t = setTimeout(function () {
          boton.textContent = boton._original;
          boton._original = null;
        }, 1500);
      }
      clearTimeout(tarjeta._t);
      tarjeta._t = setTimeout(function () {
        tarjeta.classList.remove("is-copiado");
      }, 1300);
      avisar("Copiado: " + texto);
    });
  }

  grid.addEventListener("click", function (ev) {
    var favorito = ev.target.closest("[data-lb-favorito]");
    if (favorito) {
      ev.preventDefault();
      ev.stopPropagation();
      alternarFavorito(favorito.getAttribute("data-lb-favorito"));
      return;
    }
    var tarjeta = ev.target.closest(".lb-tarjeta");
    if (tarjeta) copiarTarjeta(tarjeta);
  });

  /* ---------------------------- controles --------------------------------- */
  entrada.addEventListener("input", programarRender);

  if (buscador) {
    buscador.addEventListener("input", function () {
      visibles = LIMITE;
      programarRender();
    });
  }

  botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
      filtro = boton.getAttribute("data-lb-filtro") || "todas";
      soloFavoritas = false;
      visibles = LIMITE;
      botonesFiltro.forEach(function (otro) {
        var activo = otro === boton;
        otro.classList.toggle("is-activo", activo);
        otro.setAttribute("aria-pressed", activo ? "true" : "false");
      });
      if (chipFavs) {
        chipFavs.classList.remove("is-activo");
        chipFavs.setAttribute("aria-pressed", "false");
      }
      render();
    });
  });

  if (chipFavs) {
    chipFavs.addEventListener("click", function () {
      soloFavoritas = !soloFavoritas;
      visibles = LIMITE;
      botonesFiltro.forEach(function (boton) {
        boton.classList.remove("is-activo");
        boton.setAttribute("aria-pressed", "false");
      });
      pintarFavoritos();
      render();
    });
  }

  if (botonLimpiar) {
    botonLimpiar.addEventListener("click", function () {
      entrada.value = "";
      visibles = LIMITE;
      entrada.focus();
      render();
    });
  }

  if (botonTodo) {
    botonTodo.addEventListener("click", function () {
      var textos = todos("[data-lb-salida]").map(function (nodo) {
        return nodo.textContent;
      });
      if (!textos.length) {
        avisar("No hay estilos que copiar");
        return;
      }
      copiar(textos.join("\n")).then(function () {
        avisar("Todos los estilos copiados");
        botonTodo.textContent = "¡Copiado!";
        setTimeout(function () { botonTodo.textContent = "Copiar todo"; }, 1500);
      });
    });
  }

  if (botonMas) {
    botonMas.addEventListener("click", function () {
      visibles += LIMITE;
      render();
    });
  }

  if (mezclas) {
    mezclas.addEventListener("change", function () {
      mezclasOn = mezclas.checked;
      visibles = LIMITE;
      render();
    });
  }

  function aplicarTamano(px) {
    var valor = Math.min(44, Math.max(14, parseInt(px, 10) || 18));
    grid.style.setProperty("--lb-tamano", valor + "px");
    if (salidaRango) salidaRango.textContent = valor + "px";
    try { localStorage.setItem(CLAVE_TAMANO, String(valor)); } catch (e) {}
  }

  if (rango) {
    var guardado = 18;
    try { guardado = parseInt(localStorage.getItem(CLAVE_TAMANO), 10) || 18; } catch (e) {}
    rango.value = guardado;
    aplicarTamano(guardado);
    rango.addEventListener("input", function () { aplicarTamano(rango.value); });
  }

  /* ------------------- ejemplos de contenido (copiar) -------------------- */
  document.addEventListener("click", function (ev) {
    var ejemplo = ev.target.closest ? ev.target.closest("[data-lb-ejemplo]") : null;
    if (!ejemplo) return;
    var propio = ejemplo.getAttribute("data-lb-copiar-texto");
    var texto = propio || ejemplo.textContent;
    copiar(texto).then(function () {
      ejemplo.classList.add("is-copiado");
      clearTimeout(ejemplo._t);
      ejemplo._t = setTimeout(function () {
        ejemplo.classList.remove("is-copiado");
      }, 1200);
      avisar(propio ? "Abecedario copiado" : "Copiado: " + texto);
    });
  });

  /* ------------------------------ arranque ------------------------------- */
  pintarFavoritos();
  if (entrada.value.trim()) {
    var estaticas = todos(".lb-tarjeta").length;
    if (estaticas) visibles = estaticas;
    actualizarContador(window.LB.porCategoria("todas").length, estaticas || LIMITE);
    actualizarBotonMas(window.LB.porCategoria("todas").length, estaticas || LIMITE);
  } else {
    render();
  }
})();
