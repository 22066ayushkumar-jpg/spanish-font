/* Pre-renderiza las tarjetas Unicode en el HTML estático.
   Uso: node scripts/prerender.mjs

   - Portada: 60 tarjetas con el texto "Letras Bonitas".
   - Páginas de generador: 40 tarjetas con el texto de ejemplo de cada página.
   El marcado generado imita exactamente el que crea app.js/inicio.js para
   que la hidratación no provoque saltos de maquetación. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const enginePath = path.join(root, "assets/js/fonts.js");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(enginePath, "utf8"), sandbox, { filename: enginePath });
const LB = sandbox.window.LB;
if (!LB || !Array.isArray(LB.estilos)) throw new Error("No se pudo cargar window.LB");

const PORTADA = 60;
const SUBPAGINA = 40;

function escText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escAttr(value) {
  return escText(value).replace(/"/g, "&quot;");
}

function decodeEntities(value) {
  return String(value).replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi, function (match, code) {
    if (code.charAt(0) === "#") {
      const hex = code.charAt(1).toLowerCase() === "x";
      const number = parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : match;
    }
    const mapa = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
    return Object.prototype.hasOwnProperty.call(mapa, code.toLowerCase()) ? mapa[code.toLowerCase()] : match;
  });
}

function salidaDe(estilo, texto) {
  try { return estilo.fn(texto); } catch (error) { return texto; }
}

function tarjetaGenerador(estilo, texto, indice) {
  const salida = salidaDe(estilo, texto);
  const nombre = estilo.nombre;
  const categorias = estilo.cat.join(" ");
  const tendencia = estilo.destacado && indice % 8 === 0;
  return [
    `<article class="tarjeta-fuente style-card" data-id="${escAttr(estilo.id)}" data-style-id="${escAttr(estilo.id)}" data-style-name="${escAttr(nombre)}" data-category="${escAttr(categorias)}" data-default-text="${escAttr(texto)}">`,
    `  <div class="tarjeta-texto">`,
    `    <div class="tarjeta-cabecera">`,
    tendencia ? `      <span class="tendencia">🔥 En tendencia</span>` : null,
    `      <span class="tarjeta-nombre style-name">${escText(nombre)}</span>`,
    `    </div>`,
    `    <div class="tarjeta-salida style-preview" data-default-text="${escAttr(salida)}">${escText(salida)}</div>`,
    `  </div>`,
    `  <div class="tarjeta-acciones">`,
    `    <button type="button" class="favorito" data-id="${escAttr(estilo.id)}" aria-pressed="false" aria-label="Guardar o quitar de favoritas: ${escAttr(nombre)}" title="Favorita">♡</button>`,
    `    <button type="button" class="copiar copy-btn" aria-label="Copiar estilo ${escAttr(nombre)}">Copiar</button>`,
    `  </div>`,
    `</article>`
  ].filter(Boolean).join("\n");
}

function tarjetaPortada(estilo, texto, indice) {
  const salida = salidaDe(estilo, texto);
  const nombre = estilo.nombre;
  const categorias = estilo.cat.join(" ");
  return [
    `<article class="lb-tarjeta style-card" data-lb-id="${escAttr(estilo.id)}" data-style-id="${escAttr(estilo.id)}" data-style-name="${escAttr(nombre)}" data-category="${escAttr(categorias)}" data-default-text="${escAttr(texto)}" title="Toca para copiar">`,
    `  <div class="lb-tarjeta-cabecera">${indice === 0 ? '<span class="lb-tarjeta-insignia">🔥 En tendencia</span>' : ""}<span class="lb-tarjeta-nombre style-name">${escText(nombre)}</span></div>`,
    `  <p class="lb-tarjeta-salida style-preview" data-lb-salida data-default="${escAttr(salida)}" data-default-text="${escAttr(salida)}" lang="es">${escText(salida)}</p>`,
    `  <div class="lb-tarjeta-acciones">`,
    `    <button class="lb-btn-favorito" type="button" data-lb-favorito="${escAttr(estilo.id)}" aria-pressed="false" aria-label="Guardar ${escAttr(nombre)} en favoritas">♡</button>`,
    `    <button class="lb-btn-copiar copy-btn" type="button" data-lb-copiar>Copiar</button>`,
    `  </div>`,
    `</article>`
  ].join("\n");
}

/* Sustituye el contenido interno del primer contenedor que coincide. */
function reemplazarContenedor(html, apertura, interior, etiqueta) {
  const match = apertura.exec(html);
  if (!match) throw new Error("No se encontró el contenedor " + etiqueta);
  const inicio = match.index + match[0].length;
  const cierre = /<\/?div\b[^>]*>/gi;
  cierre.lastIndex = inicio;
  let profundidad = 1;
  let token;
  while ((token = cierre.exec(html))) {
    if (token[0].charAt(1) === "/") {
      profundidad -= 1;
      if (profundidad === 0) {
        return html.slice(0, inicio) + interior + html.slice(token.index);
      }
    } else {
      profundidad += 1;
    }
  }
  throw new Error("Contenedor sin cierre: " + etiqueta);
}

function leerTexto(html, atributo) {
  const re = new RegExp("<textarea[^>]*" + atributo + "[^>]*>([\\s\\S]*?)<\\/textarea>");
  const match = html.match(re);
  return match ? decodeEntities(match[1]).trim() : "";
}

function contarCaracteres(texto) {
  return Array.from(texto).length;
}

/* ------------------------------ portada ------------------------------ */
const indexPath = path.join(root, "index.html");
let indexHtml = fs.readFileSync(indexPath, "utf8");
const textoPortada = leerTexto(indexHtml, "data-lb-entrada") || "Letras Bonitas";
const listaPortada = LB.porCategoria("todas").slice(0, PORTADA);
const tarjetasPortada = listaPortada
  .map(function (estilo, indice) { return tarjetaPortada(estilo, textoPortada, indice); })
  .join("\n");
indexHtml = reemplazarContenedor(
  indexHtml,
  /<div class="lb-grid-tarjetas"[^>]*data-lb-grid[^>]*>/,
  "\n" + tarjetasPortada + "\n        ",
  "data-lb-grid"
);
const totalPortada = LB.porCategoria("todas").length;
indexHtml = indexHtml.replace(
  /(<span class="lb-contador" data-lb-contador[^>]*>)[\s\S]*?(<\/span>)/,
  "$1" + contarCaracteres(textoPortada) + " caracteres · " + listaPortada.length + " de " + totalPortada + " estilos$2"
);
fs.writeFileSync(indexPath, indexHtml);
console.log("index.html → " + listaPortada.length + " tarjetas (" + totalPortada + " estilos)");

/* --------------------------- subpáginas ------------------------------ */
const paginas = fs.readdirSync(root).filter(function (archivo) {
  return /\.html$/i.test(archivo);
});
let procesadas = 0;

for (const archivo of paginas) {
  const ruta = path.join(root, archivo);
  let html = fs.readFileSync(ruta, "utf8");
  const seccion = html.match(/<section[^>]*data-generador="([^"]+)"[^>]*>/);
  if (!seccion || html.indexOf("data-resultados") === -1) continue;

  const categorias = seccion[1];
  const texto = leerTexto(html, "data-entrada") || "Letras Bonitas";
  const lista = LB.porCategoria(categorias);
  const cantidad = Math.min(SUBPAGINA, lista.length);
  const visibles = lista.slice(0, cantidad);
  const tarjetas = visibles
    .map(function (estilo, indice) { return tarjetaGenerador(estilo, texto, indice); })
    .join("\n");

  html = reemplazarContenedor(
    html,
    /<div class="resultados"[^>]*data-resultados[^>]*>/,
    "\n" + tarjetas + "\n",
    "data-resultados (" + archivo + ")"
  );

  /* El número inicial de tarjetas visibles debe coincidir con el HTML
     pre-renderizado para que al escribir no aparezca ni desaparezca nada. */
  html = html.replace(seccion[0], seccion[0].replace(/data-inicial="\d+"/, 'data-inicial="' + cantidad + '"'));

  const contador = contarCaracteres(texto) + " caracteres · " + cantidad + " de " + lista.length + " estilos";
  html = html.replace(
    /(<span class="contador" data-contador[^>]*>)[\s\S]*?(<\/span>)/,
    "$1" + contador + "$2"
  );

  fs.writeFileSync(ruta, html);
  procesadas += 1;
  console.log(archivo + " → " + cantidad + " tarjetas (" + lista.length + " estilos)");
}

/* ------------------- herramientas especiales ------------------------
   Mayúsculas/minúsculas, números a letras y japonés usan sus propios
   conversores. También se pre-renderizan para que su HTML inicial no
   dependa de JavaScript. */
function idDe(nombre) {
  return nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function tarjetaSimple(nombre, valor, prefijo, categoria) {
  return [
    `<article class="tarjeta-fuente style-card" data-style-id="${escAttr(prefijo + "-" + idDe(nombre))}" data-style-name="${escAttr(nombre)}" data-category="${escAttr(categoria)}">`,
    `  <div class="tarjeta-texto">`,
    `    <div class="tarjeta-cabecera"><span class="tarjeta-nombre style-name">${escText(nombre)}</span></div>`,
    `    <div class="tarjeta-salida style-preview">${escText(valor)}</div>`,
    `  </div>`,
    `  <div class="tarjeta-acciones"><button type="button" class="copiar copy-btn" aria-label="Copiar estilo ${escAttr(nombre)}">Copiar</button></div>`,
    `</article>`
  ].join("\n");
}

function modosCaja(texto) {
  const titulo = texto.toLowerCase().replace(/(^|\s|["'(¡¿-])([\p{L}])/gu, function (m, a, b) {
    return a + b.toUpperCase();
  });
  const frase = texto.toLowerCase().replace(/(^\s*|[.!?¡¿]\s+)([\p{L}])/gu, function (m, a, b) {
    return a + b.toUpperCase();
  });
  let alternada = "";
  let arriba = false;
  for (const c of texto) {
    if (/\s/.test(c)) { alternada += c; continue; }
    alternada += arriba ? c.toUpperCase() : c.toLowerCase();
    arriba = !arriba;
  }
  const modos = [
    ["MAYÚSCULAS", texto.toUpperCase()],
    ["minúsculas", texto.toLowerCase()],
    ["Tipo título", titulo],
    ["Tipo frase", frase],
    ["aLtErNaDa", alternada],
    ["Inversa de caja", Array.from(texto).map(function (c) {
      return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
    }).join("")],
    ["Sin acentos", texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")],
    ["Formato slug", texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")],
    ["Formato guion_bajo", texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")]
  ];
  return modos.map(function (m) { return tarjetaSimple(m[0], m[1], "caja", "herramientas caja mayusculas"); }).join("\n");
}

const UNIDADES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis",
  "veintisiete", "veintiocho", "veintinueve"];
const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
  "seiscientos", "setecientos", "ochocientos", "novecientos"];

function menorMil(n) {
  if (n === 0) return "";
  if (n === 100) return "cien";
  let texto = "";
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c) texto += CENTENAS[c];
  if (r) {
    if (texto) texto += " ";
    if (r < 30) texto += UNIDADES[r];
    else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      texto += DECENAS[d] + (u ? " y " + UNIDADES[u] : "");
    }
  }
  return texto;
}

function numeroALetras(n) {
  n = Math.trunc(Math.abs(n));
  if (n === 0) return "cero";
  const partes = [];
  const escalas = [
    { valor: 1e12, sing: "billón", plur: "billones" },
    { valor: 1e6, sing: "millón", plur: "millones" },
    { valor: 1e3, sing: "mil", plur: "mil" }
  ];
  let resto = n;
  escalas.forEach(function (e) {
    const cant = Math.floor(resto / e.valor);
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

function tarjetasNumero(texto) {
  const bruto = texto.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(bruto);
  if (isNaN(num)) return tarjetaSimple("En letras", "Escribe un número para verlo en letras.", "numero", "herramientas numeros letras");
  const entero = Math.trunc(Math.abs(num));
  const decimales = Math.round((Math.abs(num) - entero) * 100);
  const signo = num < 0 ? "menos " : "";
  const enLetras = signo + numeroALetras(entero);
  const filas = [
    ["En letras", enLetras],
    ["Con mayúscula inicial", enLetras.charAt(0).toUpperCase() + enLetras.slice(1)],
    ["Todo en mayúsculas", enLetras.toUpperCase()],
    ["Formato dinero (euros)", enLetras + " euros con " + (decimales ? numeroALetras(decimales) : "cero") + " céntimos"],
    ["Formato dinero (pesos)", enLetras + " pesos " + (decimales < 10 ? "0" + decimales : decimales) + "/100 M.N."],
    ["Ordinal aproximado", entero + ".º"],
    ["Con separadores", entero.toLocaleString("es-ES")]
  ];
  return filas.map(function (f) { return tarjetaSimple(f[0], f[1], "numero", "herramientas numeros letras"); }).join("\n");
}

const SILABAS = [
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
  const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let salida = "";
  let i = 0;
  while (i < t.length) {
    let encontrado = false;
    for (const fila of SILABAS) {
      if (t.substr(i, fila[0].length) === fila[0]) {
        salida += fila[indice];
        i += fila[0].length;
        encontrado = true;
        break;
      }
    }
    if (!encontrado) { salida += t[i]; i += 1; }
  }
  return salida;
}

function tarjetasJapones(texto, tipo) {
  const filas = [];
  if (tipo === "hiragana" || tipo === "ambos") {
    filas.push(["Hiragana ひらがな", aKana(texto, 1)]);
  }
  if (tipo === "katakana" || tipo === "ambos") {
    filas.push(["Katakana カタカナ", aKana(texto, 2)]);
  }
  filas.push(["Estilo japonés decorado", "『" + aKana(texto, 2) + "』"]);
  filas.push(["Con puntos japoneses", Array.from(aKana(texto, 2)).join("・")]);
  return filas.map(function (f) { return tarjetaSimple(f[0], f[1], "japones", "herramientas japones"); }).join("\n");
}

let herramientasProcesadas = 0;
for (const archivo of paginas) {
  const ruta = path.join(root, archivo);
  let html = fs.readFileSync(ruta, "utf8");
  if (/data-resultados-(caja|numeros|japones)/.test(html) === false) continue;
  const texto = leerTexto(html, "data-entrada");
  let interior = null;
  let etiqueta = "";
  let apertura = null;
  if (/data-resultados-caja/.test(html)) {
    interior = modosCaja(texto);
    etiqueta = "data-resultados-caja (" + archivo + ")";
    apertura = /<div class="resultados"[^>]*data-resultados-caja[^>]*>/;
  } else if (/data-resultados-numeros/.test(html)) {
    interior = tarjetasNumero(texto);
    etiqueta = "data-resultados-numeros (" + archivo + ")";
    apertura = /<div class="resultados"[^>]*data-resultados-numeros[^>]*>/;
  } else {
    const tipo = (html.match(/data-japones="([^"]+)"/) || [])[1] || "ambos";
    interior = tarjetasJapones(texto, tipo);
    etiqueta = "data-resultados-japones (" + archivo + ")";
    apertura = /<div class="resultados"[^>]*data-resultados-japones[^>]*>/;
  }
  html = reemplazarContenedor(html, apertura, "\n" + interior + "\n", etiqueta);
  fs.writeFileSync(ruta, html);
  herramientasProcesadas += 1;
  console.log(archivo + " → herramienta con tarjetas estáticas");
}

console.log("\nListo: " + (procesadas + 1) + " páginas de generador y " +
  herramientasProcesadas + " herramientas con tarjetas estáticas.");
