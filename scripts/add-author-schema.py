#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Añade autoría y fecha a todas las páginas (señales E-E-A-T).

Qué hace, por cada página de la raíz:
  1. Inserta la línea de autoría debajo de la entradilla del hero, si no
     existe ya. En las páginas legales solo pone la fecha.
  2. Añade "author" y "dateModified" al nodo de página del JSON-LD
     (WebApplication o WebPage), sin tocar el resto del grafo.

Idempotente: si la página ya tiene línea de autoría y ya tiene "author" en
el JSON-LD, no la duplica.

Uso:  python3 scripts/add-author-schema.py [--fecha AAAA-MM-DD]
"""

import argparse
import glob
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTOR_PAGINA = "/autor/equipo-letras-bonitas.html"
AUTOR_NOMBRE = "Equipo Letras Bonitas"

# Páginas donde una firma de autor no aporta y basta con la fecha
SOLO_FECHA = {
    "aviso-legal.html",
    "cookies.html",
    "privacy-policy.html",
    "contacto.html",
}

MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]


def fecha_larga(iso):
    a, m, d = (int(x) for x in iso.split("-"))
    return f"{d} de {MESES[m - 1]} de {a}"


def inyectar_autor(html, nombre_archivo, iso):
    if "autor-linea" in html:
        return html, False

    if nombre_archivo in SOLO_FECHA:
        linea = (
            f'<p class="autor-linea">Última actualización: '
            f"{fecha_larga(iso)}</p>"
        )
    else:
        linea = (
            f'<p class="autor-linea">Por '
            f'<a href="{AUTOR_PAGINA}">{AUTOR_NOMBRE}</a> · '
            f"Actualizado el {fecha_larga(iso)}</p>"
        )

    patron = re.compile(r'(<p class="entradilla">.*?</p>)', re.S)
    if not patron.search(html):
        return html, False
    return patron.sub(lambda m: m.group(1) + linea, html, count=1), True


def inyectar_schema(html, iso):
    patron = re.compile(
        r'<script type="application/ld\+json">(.*?)</script>', re.S
    )
    m = patron.search(html)
    if not m:
        return html, False

    try:
        datos = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        print(f"  ! JSON-LD inválido: {e}")
        return html, False

    nodos = datos.get("@graph", [datos])
    tocado = False
    for nodo in nodos:
        if nodo.get("@type") not in ("WebApplication", "WebPage"):
            continue
        if "author" in nodo:
            return html, False
        nodo["author"] = {
            "@type": "Person",
            "name": AUTOR_NOMBRE,
            "url": "https://letrasbonitas.fun" + AUTOR_PAGINA,
        }
        nodo["dateModified"] = iso
        tocado = True

    if not tocado:
        return html, False

    nuevo = json.dumps(datos, ensure_ascii=False, separators=(",", ":"))
    return html[: m.start(1)] + nuevo + html[m.end(1):], True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fecha", default="2026-10-23")
    args = ap.parse_args()

    autor = 0
    schema = 0
    saltadas = []

    for ruta in sorted(glob.glob(os.path.join(RAIZ, "*.html"))):
        nombre = os.path.basename(ruta)
        if nombre.startswith("googled"):
            continue  # archivo de verificación de Google
        html = open(ruta, encoding="utf-8").read()
        original = html

        html, ok_autor = inyectar_autor(html, nombre, args.fecha)
        html, ok_schema = inyectar_schema(html, args.fecha)

        if html != original:
            open(ruta, "w", encoding="utf-8").write(html)
        if ok_autor:
            autor += 1
        if ok_schema:
            schema += 1
        if not ok_autor and not ok_schema:
            saltadas.append(nombre)

    print(f"Línea de autoría añadida: {autor} páginas")
    print(f"JSON-LD actualizado: {schema} páginas")
    if saltadas:
        print(f"Sin cambios: {len(saltadas)} -> {', '.join(saltadas[:6])}")


if __name__ == "__main__":
    main()
