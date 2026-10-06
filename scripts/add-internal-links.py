#!/usr/bin/env python3
"""
Enlazado interno estilo "barra de chips" (como la competencia).

- Páginas CON generador (46): una barra de chips desplazable con enlaces a
  las otras 50 páginas, insertada ENTRE el generador (campo de texto) y la
  caja de resultados — justo debajo del campo de escribir.
- Páginas informativas SIN generador (5): bloque de píldoras al final del
  contenido, como último hijo de <div class="contenedor">.

Idempotente: elimina el bloque anterior (marcado con "enlaces-paginas" o la
barra "chips-paginas") antes de insertar, así se puede re-ejecutar.
"""

import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# (ruta, etiqueta) — orden curado: plataformas, Free Fire, estilos,
# símbolos, japonés, herramientas e información
PAGINAS = [
    ("/", "Inicio"),
    ("/instagram.html", "Letras para Instagram"),
    ("/tiktok.html", "Letras para TikTok"),
    ("/whatsapp.html", "Letras para WhatsApp"),
    ("/facebook.html", "Letras para Facebook"),
    ("/twitter.html", "Letras para Twitter (X)"),
    ("/discord.html", "Letras para Discord"),
    ("/juegos.html", "Letras para juegos"),
    ("/nombres-para-free-fire.html", "Nombres para Free Fire"),
    ("/nombres-chidos-free-fire.html", "Nombres chidos para Free Fire"),
    ("/nombres-chistosos-free-fire.html", "Nombres chistosos para Free Fire"),
    ("/nombres-clanes-free-fire.html", "Nombres de clanes para Free Fire"),
    ("/nombres-animales-free-fire.html", "Nombres de animales para Free Fire"),
    ("/nombres-dioses-aztecas-free-fire.html", "Nombres de dioses aztecas para Free Fire"),
    ("/nombres-free-fire-insanos.html", "Nombres insanos para Free Fire"),
    ("/nombres-free-fire-miedo.html", "Nombres de miedo para Free Fire"),
    ("/nombres-heroicos-free-fire.html", "Nombres heroicos para Free Fire"),
    ("/nombres-sad-free-fire.html", "Nombres sad para Free Fire"),
    ("/nombres-verificado-free-fire.html", "Nombres verificados para Free Fire"),
    ("/nombres-veteranos-free-fire.html", "Nombres de veteranos para Free Fire"),
    ("/cursiva.html", "Letras cursivas"),
    ("/goticas.html", "Letras góticas"),
    ("/burbuja.html", "Letras burbuja"),
    ("/decoradas.html", "Letras decoradas"),
    ("/negrita.html", "Letras en negrita"),
    ("/pequena.html", "Letras pequeñas"),
    ("/chidas.html", "Letras chidas"),
    ("/comunes.html", "Letras comunes"),
    ("/raras.html", "Letras raras"),
    ("/feas.html", "Letras feas"),
    ("/glitch.html", "Letras glitch"),
    ("/graffiti.html", "Letras graffiti"),
    ("/squiggle.html", "Letras squiggle"),
    ("/tristes.html", "Letras tristes"),
    ("/caja.html", "Letras en caja"),
    ("/carpintero.html", "Letras de carpintero"),
    ("/invisible.html", "Texto invisible"),
    ("/simbolos-aesthetic.html", "Símbolos aesthetic"),
    ("/emoticonos.html", "Emoticonos de texto"),
    ("/kaomoji.html", "Kaomoji"),
    ("/letras-japonesas.html", "Letras japonesas"),
    ("/hiragana.html", "Hiragana"),
    ("/katakana.html", "Katakana"),
    ("/kanji.html", "Kanji"),
    ("/numeros-en-letras.html", "Números en letras"),
    ("/mayusculas-a-minusculas.html", "Convertir mayúsculas a minúsculas"),
    ("/acerca-de-nosotros.html", "Acerca de nosotros"),
    ("/contacto.html", "Contacto"),
    ("/cookies.html", "Política de cookies"),
    ("/aviso-legal.html", "Aviso legal"),
    ("/privacy-policy.html", "Política de privacidad"),
]

TITULO = "Explora todas las páginas de Letras Bonitas"


def enlaces(ruta_actual: str) -> str:
    return "\n".join(
        f'      <li><a href="{ruta}">{etiqueta}</a></li>'
        for ruta, etiqueta in PAGINAS
        if ruta != ruta_actual
    )


def barra_chips(ruta_actual: str) -> str:
    ases = "\n".join(
        f'  <a href="{ruta}">{etiqueta}</a>'
        for ruta, etiqueta in PAGINAS
        if ruta != ruta_actual
    )
    return (
        f'<nav class="chips-paginas" aria-label="{TITULO}">\n'
        f'{ases}\n'
        f'</nav>'
    )


def limpiar(html: str) -> str:
    """Quita cualquier versión anterior del enlazado interno."""
    # bloque de píldoras suelto (dentro de .seccion de páginas con generador)
    html = re.sub(
        r'[ \t]*<section class="bloque enlaces-paginas">.*?</section>\n?',
        "", html, flags=re.DOTALL,
    )
    # envoltorio <div class="seccion"> vacío (páginas informativas)
    html = re.sub(
        r'[ \t]*<div class="seccion">[ \t\n]*</div>\n?', "", html
    )
    # barra de chips de una ejecución anterior
    html = re.sub(
        r'[ \t]*<nav class="chips-paginas".*?</nav>\n?', "", html, flags=re.DOTALL
    )
    return html


def main() -> None:
    for ruta, _ in PAGINAS:
        archivo = RAIZ / ("index.html" if ruta == "/" else ruta.lstrip("/"))
        html = limpiar(archivo.read_text(encoding="utf-8"))

        if 'data-entrada' in html:
            # Barra de chips ENTRE el generador y la caja de resultados:
            # ancla = cierre de <section class="generador"> seguido del div
            # de resultados (único en cada página con generador).
            m = re.search(
                r'</section>(\s*)(<div class="resultados" data-resultados)', html
            )
            assert m, f"{archivo.name}: no se encontró el ancla del generador"
            html = (
                html[: m.start()]
                + f'</section>\n      {barra_chips(ruta)}\n'
                + html[m.end() - len(m.group(2)) :]
            )
            sitio = "chips bajo el campo de texto"
        else:
            # Página informativa: bloque de píldoras al final del contenido,
            # como último hijo de <div class="contenedor">
            assert html.count("</main>") == 1, f"{archivo.name}: </main> ambiguo"
            cierre_contenedor = html.rfind("</div>", 0, html.find("</main>"))
            bloque = (
                f'<section class="bloque enlaces-paginas">\n'
                f'        <h2>{TITULO}</h2>\n'
                f'        <ul class="enlaces-relacionados">\n'
                f'{enlaces(ruta)}\n'
                f'        </ul>\n'
                f'      </section>'
            )
            envoltorio = f'\n  <div class="seccion">\n      {bloque}\n    </div>\n  '
            html = html[:cierre_contenedor] + envoltorio + html[cierre_contenedor:]
            sitio = "píldoras al final del contenido"

        archivo.write_text(html, encoding="utf-8")
        print(f"✓ {ruta} ({sitio})")

    print(f"\nListo: {len(PAGINAS)} páginas, {len(PAGINAS) - 1} enlaces cada una.")


if __name__ == "__main__":
    main()
