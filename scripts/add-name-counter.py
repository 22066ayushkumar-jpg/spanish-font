#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Inserta el contador de nombres en las páginas de nombres para Free Fire.

- Añade el bloque HTML justo debajo del generador (donde está el campo de
  texto), para que el número se lea mientras se escribe.
- Añade /assets/js/contador-nombres.js al final, después de app.js (así el
  generador ya ha puesto su texto de ejemplo cuando arranca el contador).

Idempotente: si la página ya tiene data-contador-nombres, no la toca.

Uso:  python3 scripts/add-name-counter.py
"""

import glob
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BLOQUE = """<section class="contador-nombres" data-contador-nombres aria-labelledby="cn-titulo">
  <div class="cn-cabecera">
    <h2 class="cn-titulo" id="cn-titulo">¿Cabe en Free Fire?</h2>
    <p class="cn-lectura"><strong data-cn-codigos>0</strong><span class="cn-de"> / 12</span></p>
  </div>
  <div class="cn-medidor" aria-hidden="true"><span class="cn-relleno" data-cn-relleno></span></div>
  <p class="cn-cifras"><span>Símbolos visibles: <b data-cn-visibles>0</b></span><span>Unidades internas: <b data-cn-unidades>0</b></span></p>
  <p class="cn-resumen" aria-live="polite" data-cn-resumen>Escribe un nombre arriba para ver cuánto ocupa.</p>
  <p class="cn-aviso" data-cn-aviso hidden></p>
  <details class="cn-detalle">
    <summary>Cuánto ocupa cada símbolo</summary>
    <table class="cn-tabla">
      <caption class="visually-hidden">Espacio que ocupa cada tipo de símbolo dentro del límite de 12 caracteres</caption>
      <thead>
        <tr><th scope="col">Símbolo</th><th scope="col">Cuenta como</th></tr>
      </thead>
      <tbody>
        <tr><td>Letra normal (A, b, ñ)</td><td>1</td></tr>
        <tr><td>Letra de estilo (𝔖, 𝗦, 𝒮)</td><td>1 · 2 internas</td></tr>
        <tr><td>Adorno de una pieza (☠ ✞ ♛ ⚡ ༒)</td><td>1</td></tr>
        <tr><td>Lazo o corchete (꧁ ꧂ 【 】)</td><td>1 cada uno</td></tr>
        <tr><td>Emoji (🔥 💀 🎮)</td><td>1 · 2 internas</td></tr>
        <tr><td>Espacio</td><td>1</td></tr>
        <tr><td>Acento combinado ( ´ ` ~ )</td><td>1 extra por letra</td></tr>
      </tbody>
    </table>
    <p class="cn-nota">El límite del juego son 12 caracteres, adornos incluidos. Un nombre de 9 letras con un adorno a cada lado ocupa 11; con dos, 13 y no entra. Las cifras «internas» son las que usa el móvil por dentro: las letras de estilo y los emoji ocupan dos, y por eso un nombre entra en una app y en otra no.</p>
  </details>
</section>
"""

SCRIPT_TAG = '<script defer src="/assets/js/contador-nombres.js"></script>'


def main():
    paginas = sorted(glob.glob(os.path.join(RAIZ, "nombres-*.html")))
    if not paginas:
        sys.exit("No encuentro páginas nombres-*.html")

    tocadas = 0
    for ruta in paginas:
        html = open(ruta, encoding="utf-8").read()
        nombre = os.path.basename(ruta)

        generador = re.search(
            r'<section class="generador".*?</section>', html, re.S
        )
        if not generador:
            print(f"! {nombre}: no encuentro el generador, se salta")
            continue

        # El bloque va DENTRO de la sección del generador, como último hijo:
        # app.js envuelve el generador en .generador-pegado al cargar, y así
        # el contador viaja con el campo de texto en vez de quedarse suelto
        # (si queda fuera, acaba pintándose por encima del textarea).
        #
        # Si ya existía, se borra primero para que una mejora del bloque
        # llegue a las páginas sin editarlas a mano.
        existente = re.search(
            r'\s*<section class="contador-nombres".*?</section>', html, re.S
        )
        if existente:
            html = html[: existente.start()] + html[existente.end():]
            generador = re.search(
                r'<section class="generador".*?</section>', html, re.S
            )

        cierre = generador.end() - len("</section>")
        html = html[:cierre] + "  " + BLOQUE.strip() + "\n" + html[cierre:]
        print(f"~ {nombre}" if existente else f"+ {nombre}")

        if "contador-nombres.js" not in html:
            html = html.replace(
                '<script defer src="/assets/js/app.js"></script>',
                '<script defer src="/assets/js/app.js"></script> ' + SCRIPT_TAG,
                1,
            )

        open(ruta, "w", encoding="utf-8").write(html)
        tocadas += 1

    print(f"\nContador insertado o actualizado en {tocadas} de {len(paginas)} páginas.")


if __name__ == "__main__":
    main()
