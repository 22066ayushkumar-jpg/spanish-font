/* Letras Bonitas — contador de caracteres para nombres de Free Fire
   Calcula en el navegador cuánto ocupa un nick. No envía nada a ningún
   servidor. Tres cifras distintas a propósito:

   - «caracteres»: lo que suele contar una app (puntos de código Unicode).
   - «símbolos visibles»: lo que ve el ojo (grupos de grafemas). Un emoji con
     modificador o una letra con acento combinado cuentan como uno.
   - «unidades internas»: .length de JavaScript. Los caracteres fuera del
     plano básico (𝟙, 𝔖, 🔥) ocupan dos aquí y uno en las otras dos cifras.
     Esta es la cifra que hace que un nombre «quepa» en un sitio y no en otro.
*/
(function () {
  "use strict";

  var LIMITE = 12;
  var AVISO_CERCA = 10;

  function puntosDeCodigo(texto) {
    return Array.from(texto).length;
  }

  function simbolosVisibles(texto) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      try {
        var segmentador = new Intl.Segmenter("es", { granularity: "grapheme" });
        var total = 0;
        var iterador = segmentador.segment(texto)[Symbol.iterator]();
        while (!iterador.next().done) total++;
        return total;
      } catch (e) {
        /* Navegador sin soporte completo: usamos la cuenta simple. */
      }
    }
    return puntosDeCodigo(texto);
  }

  function escribir(el, valor) {
    if (el) el.textContent = String(valor);
  }

  function montar(panel) {
    var entrada = document.querySelector("[data-entrada]") || document.querySelector("#texto");
    if (!entrada) return;

    var cifra = panel.querySelector("[data-cn-codigos]");
    var visibles = panel.querySelector("[data-cn-visibles]");
    var unidades = panel.querySelector("[data-cn-unidades]");
    var relleno = panel.querySelector("[data-cn-relleno]");
    var resumen = panel.querySelector("[data-cn-resumen]");
    var aviso = panel.querySelector("[data-cn-aviso]");

    function pintar() {
      var texto = entrada.value || "";
      var caracteres = puntosDeCodigo(texto);
      var glifos = simbolosVisibles(texto);
      var internas = texto.length;

      escribir(cifra, caracteres);
      escribir(visibles, glifos);
      escribir(unidades, internas);

      var proporcion = Math.min(caracteres / LIMITE, 1);
      if (relleno) relleno.style.width = (proporcion * 100).toFixed(1) + "%";

      panel.classList.remove("cn-ok", "cn-cerca", "cn-pasado");
      if (caracteres > LIMITE) panel.classList.add("cn-pasado");
      else if (caracteres >= AVISO_CERCA) panel.classList.add("cn-cerca");
      else panel.classList.add("cn-ok");

      if (resumen) {
        if (!texto.trim()) {
          resumen.textContent = "Escribe un nombre arriba para ver cuánto ocupa.";
        } else if (caracteres > LIMITE) {
          resumen.textContent =
            "Te pasas por " +
            (caracteres - LIMITE) +
            (caracteres - LIMITE === 1 ? " carácter." : " caracteres.") +
            " Quita adornos o acorta el nombre.";
        } else {
          resumen.textContent =
            "Cabe: te " +
            (caracteres === LIMITE ? "queda justo el límite." : "sobran " + (LIMITE - caracteres) + ".");
        }
      }

      if (aviso) {
        if (internas !== caracteres) {
          aviso.hidden = false;
          aviso.textContent =
            "Ojo: internamente son " +
            internas +
            " unidades, no " +
            caracteres +
            ". Las letras de estilo y los emoji ocupan dos. Algunas apps cuentan así, y por eso un nombre entra en un sitio y en otro no.";
        } else {
          aviso.hidden = true;
          aviso.textContent = "";
        }
      }
    }

    entrada.addEventListener("input", pintar);
    pintar();
  }

  function iniciar() {
    var paneles = document.querySelectorAll("[data-contador-nombres]");
    for (var i = 0; i < paneles.length; i++) montar(paneles[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
