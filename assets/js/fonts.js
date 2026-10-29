/* Letras Bonitas — motor de conversión de letras
   JavaScript puro, sin dependencias. Expone window.LB */
(function (global) {
  "use strict";

  var MAYUS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var MINUS = "abcdefghijklmnopqrstuvwxyz";
  var NUM = "0123456789";

  /* Construye un mapa a partir de puntos de código base */
  function porRango(baseMayus, baseMinus, baseNum, excepciones) {
    var mapa = {};
    var i;
    if (baseMayus != null) {
      for (i = 0; i < 26; i++) mapa[MAYUS[i]] = cp(baseMayus + i);
    }
    if (baseMinus != null) {
      for (i = 0; i < 26; i++) mapa[MINUS[i]] = cp(baseMinus + i);
    }
    if (baseNum != null) {
      for (i = 0; i < 10; i++) mapa[NUM[i]] = cp(baseNum + i);
    }
    if (excepciones) {
      for (var k in excepciones) {
        if (Object.prototype.hasOwnProperty.call(excepciones, k)) mapa[k] = excepciones[k];
      }
    }
    return mapa;
  }

  function cp(n) {
    return String.fromCodePoint(n);
  }

  /* Construye un mapa desde dos cadenas alineadas */
  function porCadena(origen, destino) {
    var mapa = {};
    var oo = Array.from(origen);
    var dd = Array.from(destino);
    for (var i = 0; i < oo.length; i++) mapa[oo[i]] = dd[i];
    return mapa;
  }

  function tiene(mapa, clave) {
    return Object.prototype.hasOwnProperty.call(mapa, clave);
  }

  /* Convierte un carácter (posiblemente acentuado) con un mapa.
     Las letras acentuadas no existen en los alfabetos matemáticos: se
     convierten a letra base + acento combinante para que cursiva, negrita,
     gótica, etc. también afecten a á é í ó ú ü ñ. */
  function mapearCaracter(c, mapa) {
    if (tiene(mapa, c)) return mapa[c];
    var partes = Array.from(c.normalize("NFD"));
    if (partes.length < 2) return c;
    var base = partes[0];
    var marcas = partes.slice(1).join("");
    /* Chrome no posiciona bien ciertas marcas sobre algunos alfabetos
       matemáticos (el acento agudo sale como un cuadro). En ese caso se
       sustituye solo la letra acentuada por otra variante del mismo estilo
       que sí admite la marca; el resto de la palabra no cambia. */
    var rota = false;
    if (mapa.marcasRotas) {
      for (var i = 1; i < partes.length; i++) {
        if (mapa.marcasRotas.indexOf(partes[i]) !== -1) { rota = true; break; }
      }
    }
    if (rota && mapa.respaldo) {
      var alt = M[mapa.respaldo];
      if (alt && tiene(alt, base)) return alt[base] + marcas;
    }
    if (tiene(mapa, base)) return mapa[base] + marcas;
    return c;
  }

  function aplicar(mapa) {
    return function (texto) {
      var salida = "";
      var chars = Array.from(String(texto).normalize("NFC"));
      for (var i = 0; i < chars.length; i++) salida += mapearCaracter(chars[i], mapa);
      return salida;
    };
  }

  function combinando(marca) {
    return function (texto) {
      var salida = "";
      var chars = Array.from(texto);
      for (var i = 0; i < chars.length; i++) salida += chars[i] + marca;
      return salida;
    };
  }

  function envolver(izq, der, sep) {
    return function (texto) {
      var t = texto;
      if (sep) t = Array.from(texto).join(sep);
      return izq + t + der;
    };
  }

  function entreSimbolos(simbolo) {
    return function (texto) {
      return Array.from(texto).join(simbolo);
    };
  }

  /* Separa grafemas (no puntos de código) para no romper tildes ni emojis. */
  function grafemas(texto) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      var segmentador = new Intl.Segmenter("es", { granularity: "grapheme" });
      return Array.from(segmentador.segment(texto), function (s) { return s.segment; });
    }
    return Array.from(texto);
  }

  /* Convierte palabra a palabra y separa sus letras con `sep`; así las
     burbujas conservan aire sin perder los espacios entre palabras. */
  function entreLetras(mapa, sep) {
    return function (texto) {
      return String(texto).trim().split(/\s+/).map(function (palabra) {
        return grafemas(aplicar(mapa)(palabra)).join(sep);
      }).join("   ");
    };
  }

  /* ----------------- Mapas ----------------- */
  var M = {};

  M.negritaSerif = porRango(0x1d400, 0x1d41a, 0x1d7ce);
  M.cursiva = porRango(0x1d434, 0x1d44e, null, { h: "\u210e" });
  M.cursivaNegrita = porRango(0x1d468, 0x1d482, 0x1d7ce);
  M.caligrafica = porRango(0x1d49c, 0x1d4b6, null, {
    B: "\u212c", E: "\u2130", F: "\u2131", H: "\u210b", I: "\u2110",
    L: "\u2112", M: "\u2133", R: "\u211b",
    e: "\u212f", g: "\u210a", o: "\u2134"
  });
  M.caligraficaNegrita = porRango(0x1d4d0, 0x1d4ea, 0x1d7ce);
  M.gotica = porRango(0x1d504, 0x1d51e, null, {
    C: "\u212d", H: "\u210c", I: "\u2111", R: "\u211c", Z: "\u2128"
  });
  M.goticaNegrita = porRango(0x1d56c, 0x1d586, 0x1d7ce);
  M.dobleTrazo = porRango(0x1d538, 0x1d552, 0x1d7d8, {
    C: "\u2102", H: "\u210d", N: "\u2115", P: "\u2119", Q: "\u211a",
    R: "\u211d", Z: "\u2124"
  });
  M.sans = porRango(0x1d5a0, 0x1d5ba, 0x1d7e2);
  M.sansNegrita = porRango(0x1d5d4, 0x1d5ee, 0x1d7ec);
  M.sansCursiva = porRango(0x1d608, 0x1d622, 0x1d7e2);
  M.sansCursivaNegrita = porRango(0x1d63c, 0x1d656, 0x1d7ec);
  M.mono = porRango(0x1d670, 0x1d68a, 0x1d7f6);
  M.circulo = porRango(0x24b6, 0x24d0, null, {
    "0": "\u24ea", "1": "\u2460", "2": "\u2461", "3": "\u2462", "4": "\u2463",
    "5": "\u2464", "6": "\u2465", "7": "\u2466", "8": "\u2467", "9": "\u2468"
  });
  M.circuloNegro = porRango(0x1f150, 0x1f150, null, {
    "0": "\u24ff", "1": "\u2776", "2": "\u2777", "3": "\u2778", "4": "\u2779",
    "5": "\u277a", "6": "\u277b", "7": "\u277c", "8": "\u277d", "9": "\u277e"
  });
  M.cuadro = porRango(0x1f130, 0x1f130, null, {});
  M.cuadroNegro = porRango(0x1f170, 0x1f170, null, {});
  M.anchoCompleto = porRango(0xff21, 0xff41, 0xff10, { " ": "\u3000" });
  M.parentesis = porRango(0x1f110, 0x249c, null, {});

  // NUEVAS FUENTES EN CAJA
  M.cajaMayus = porCadena(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉"
  );
  M.cajaNegraMayus = porCadena(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉"
  );

  M.versalitas = porCadena(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "\u1d00\u0299\u1d04\u1d05\u1d07\ua730\u0262\u029c\u026a\u1d0a\u1d0b\u029f\u1d0d\u0274\u1d0f\u1d18\u01eb\u0280\ua731\u1d1b\u1d1c\u1d20\u1d21x\u028f\u1d22" +
      "\u1d00\u0299\u1d04\u1d05\u1d07\ua730\u0262\u029c\u026a\u1d0a\u1d0b\u029f\u1d0d\u0274\u1d0f\u1d18\u01eb\u0280\ua731\u1d1b\u1d1c\u1d20\u1d21x\u028f\u1d22"
  );

  M.superindice = porCadena(
    "abcdefghijklmnoprstuvwxyzABDEGHIJKLMNOPRTUVW0123456789+-=()",
    "\u1d43\u1d47\u1d9c\u1d48\u1d49\u1da0\u1d4d\u02b0\u2071\u02b2\u1d4f\u02e1\u1d50\u207f\u1d52\u1d56\u02b3\u02e2\u1d57\u1d58\u1d5b\u02b7\u02e3\u02b8\u1dbb\u1d2c\u1d2e\u1d30\u1d31\u1d33\u1d34\u1d35\u1d36\u1d37\u1d38\u1d39\u1d3a\u1d3c\u1d3e\u1d3f\u1d40\u1d41\u2c7d\u1d42\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079\u207a\u207b\u207c\u207d\u207e"
  );

  M.subindice = porCadena(
    "aehijklmnoprstuvx0123456789+-=()",
    "\u2090\u2091\u2095\u1d62\u2c7c\u2096\u2097\u2098\u2099\u2092\u209a\u1d63\u209b\u209c\u1d64\u1d65\u2093\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089\u208a\u208b\u208c\u208d\u208e"
  );

  M.squiggle = porCadena(
    "abcdefghijklmnopqrstuvwxyz",
    "\u0e04\u0e52\u03c2\u2202\u0454\u0166\u06b3\u0452\u1e2d\u05df\u05e0\u0aeb\u0e53\u0e13\u0585\u03c1\u09ac\u0433\u0455\u0167\u0446\u1d20\u0e0d\u04fe\u10e7\u0290"
  );

  M.squiggle2 = porCadena(
    "abcdefghijklmnopqrstuvwxyz",
    "\u0e4f\u0e40\u0188\u1e13\u0454\u0492\u06b6\u0452\u03b9\u04df\u043a\u217c\u0e53\u0e01\u0473\u03c1\u0642\u0433\u0455\u0e4f\u0446\u1d20\u0448\u04fe\u04af\u0290"
  );

  M.rusa = porCadena(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "\u0430\u0432\u0441\u0501\u0454\u0166\u0491\u043d\u0456\u0458\u043a\u043b\u043c\u0438\u043e\u0440\u0518\u0453\u0455\u0442\u04af\u0475\u0448\u0445\u0443\u0290" +
      "\u0414\u0411\u0426\u0503\u0404\u0492\u0413\u041d\u0406\u0408\u041a\u041b\u041c\u0418\u041e\u0420\u0510\u042f\u0405\u0413\u04ae\u0474\u0428\u0416\u0427\u0290"
  );

  M.griega = porCadena(
    "abcdefghijklmnopqrstuvwxyz",
    "\u03b1\u03b2\u03be\u03b4\u03b5\u03c6\u03b3\u03b7\u03b9\u03be\u03ba\u03bb\u03bc\u03bd\u03bf\u03c1\u03d5\u044f\u03c3\u03c4\u03c5\u03bd\u03c9\u03c7\u03b3\u03b6"
  );

  var FLIP = porCadena(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?'\"()[]{}<>&_;",
    "\u0250q\u0254p\u01dd\u025f\u0253\u0265\u1d09\u027e\u029e\u05df\u026fuodb\u0279s\u0287n\u028c\u028dx\u028ez" +
      "\u2c6f\u15fa\u0186p\u018e\u2132\u2141H\u0049\u017f\u029e\u02e5W\u04e0O\u0500\u038c\u1d1a S\u2534\u2229\u039bM X\u2144Z" +
      "0\u0196\u1105\u0190\u3123\u03db9\u312586" +
      "\u02d9'\u00a1\u00bf,\u201e)(][}{><\u214b\u203e\u061b"
  );

  /* --- Alfabetos "lookalike" extra (orientales, moneda, rizadas…).
     Son selecciones de glifos Unicode estándar, iguales en técnica a los
     mapas de arriba: cada letra A-Z/a-z se sustituye por su equivalente
     decorativo. N52 = 26 minúsculas + 26 mayúsculas. */
  var N52 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  M.oriental = porCadena(N52, "卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙" + "卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙");
  M.oriental2 = porCadena(N52, "ﾑ乃ᄃᗪ乇ｷᎶんﾉﾌズﾚﾶ刀ㄖᑭɊ尺丂ｲㄩ√山ﾒﾘ乙" + "ﾑ乃ᄃᗪ乇ｷᎶんﾉﾌズﾚﾶ刀ㄖᑭɊ尺丂ｲㄩ√山ﾒﾘ乙");
  M.moneda = porCadena(N52, "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ" + "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ");
  M.armenio = porCadena(N52, "ǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐ" + "ǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐ");
  M.rizada = porCadena(N52, "αɓ૮∂εƒɠɦเʝҡℓɱɳσρqɾรƭµѵωאყƶ" + "αɓ૮∂εƒɠɦเʝҡℓɱɳσρqɾรƭµѵωאყƶ");
  M.ondulada = porCadena(N52, "ค๒८ɗєԲ૭ҺɿʝқՆɱՈ૦ƿqՐς੮υ౮ω૪ע઼" + "ค๒८ɗєԲ૭ҺɿʝқՆɱՈ૦ƿqՐς੮υ౮ω૪ע઼");
  M.demonio = porCadena(N52, "åþ¢Ðê£ghïjklmñðþqr§†üvwx¥z" + "ÅÞ¢ÐÊ£GHÏJKLMÑÐÞQR§†ÜVWX¥Z");
  M.thai = porCadena(N52, "ค๒ƈɗєԲ૭ɦٱןкʅ๓ก๏ƿqɼรՇપ۷ฬซץչ" + "ค๒ƈɗєԲ૭ɦٱןкʅ๓ก๏ƿqɼรՇપ۷ฬซץչ");
  M.yi = porCadena(N52, "ꍏꌃꉓꀷꍟꎘꁅꃬꀤ꒚ꀘ꒒ꂵꂚꆂꉣꆰꋪꌗ꓄ꀎᐯꅐꇒꌦꏍ" + "ꍏꌃꉓꀷꍟꎘꁅꃬꀤ꒚ꀘ꒒ꂵꂚꆂꉣꆰꋪꌗ꓄ꀎᐯꅐꇒꌦꏍ");

  /* Alfabetos exóticos (etíope, georgiano, bengalí, hindi y Yi 2):
     los favoritos de los conversores de letras chidas. */
  M.etiope = porCadena(
    "abcdefghijklmn\u00f1opqrstuvwxyz\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc",
    "\u120d\u136a\u122d\u130b\u1279\u127b\u134f\u2db4\u130e\u1353\u12a1\u1228\u132e\u12ad\u12ad\u12d0\u12e8\u12d3\u12ea\u1290\u1355\u1371\u1205\u1220\u1238\u1203\u130a\u120d\u1279\u130e\u12d0\u1371\u134f"
  );

  M.georgiano = porCadena("abcdefghijklmnopqrstuvwxyz", "\u10d0\u10d1\u10e9\u10d3\u10d4\u10e4\u10d2\u10ee\u10d8\u10df\u10d9\u10da\u10db\u10dc\u10dd\u10de\u10e5\u10e0\u10e1\u10d7\u10e3\u10d5\u10ec\u10ed\u10e7\u10d6");

  M.bengali = porCadena("abcdefghijklmnopqrstuvwxyz", "\u0985\u09ac\u099a\u09a6\u098f\u09ab\u0997\u09b9\u0987\u099c\u0995\u09b2\u09ae\u09a8\u0993\u09aa\u098c\u09b0\u09b8\u09a4\u0989\u09ad\u09ce\u09fd\u09af\u09e1");

  M.hindi = porCadena("abcdefghijklmnopqrstuvwxyz", "\u0905\u092c\u091a\u0926\u090f\u092b\u0917\u0939\u0907\u091c\u0915\u0932\u092e\u0928\u0913\u092a\u0960\u0930\u0938\u0924\u0909\u0935\u0950\u0934\u092f\u0929");

  M.yi2 = porCadena("abcdefghijklmnopqrstuvwxyz", "\ua015\ua0f3\ua262\ua113\ua440\ua2af\ua23c\ua256\ua11b\ua41a\ua017\ua490\ua09a\ua2cd\ua2bf\ua04b\ua4b0\ua305\ua31a\ua4c4\ua48f\ua4a6\ua149\ua264\ua326\ua452");
  M.runas = porCadena("abcdefghijklmnopqrstuvwxyz", "\u16a8\u16d2\u16b3\u16de\u16d6\u16a0\u16b7\u16ba\u16c1\u16c3\u16b4\u16da\u16d7\u16be\u16df\u16c8\u16e2\u16b1\u16ca\u16cf\u16a2\u16a1\u16b9\u16ea\u16e6\u16c9");
  M.cingales = porCadena("abcdefghijklmnopqrstuvwxyz", "\u0d85\u0db6\u0da0\u0daf\u0d91\u0dc6\u0d9c\u0dc4\u0d89\u0da2\u0d9a\u0dbd\u0db8\u0db1\u0d94\u0db4\u0d9f\u0dbb\u0dc3\u0dad\u0d8b\u0dc0\u0dc5\u0d9e\u0dba\u0dc2");

  /* Tres mapas más del catálogo "clásico": mayúsculas angulares (Λ…),
     neón (ᗩᗷᑕ…) y código de símbolos (zodiaco + ajedrez + estrellas).
     Glifos Unicode estándar, técnica idéntica a los mapas de arriba. */
  M.angulares = porCadena(N52, "ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZ" + "ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZ");
  M.neon = porCadena(N52, "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ" + "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ");
  M.codigo = porCadena(N52, "♋♌♍♎♏♐♑♒♓♈♉♊♔♕♖♗♘♙♚♛♜♝♞♟✦✧" + "♋♌♍♎♏♐♑♒♓♈♉♊♔♕♖♗♘♙♚♛♜♝♞♟✦✧");

  /* --- Respaldo de acentos por alfabeto -------------------------------
     Algunos alfabetos matemáticos no tienen anclajes para ciertas marcas
     combinantes en Chrome (el acento agudo y el grave salen como cuadros).
     Para esos alfabetos, la letra acentuada se sustituye por otra variante
     del mismo estilo que sí admite la marca. El resto de la palabra
     conserva su alfabeto. */
  var ACENTOS_ROTOS = {
    negritaSerif: ["\u0301\u0300", "sansNegrita"],
    cursivaNegrita: ["\u0301\u0300", "cursiva"],
    caligrafica: ["\u0301\u0300", "cursiva"],
    caligraficaNegrita: ["\u0301\u0300", "cursiva"],
    gotica: ["\u0301\u0300", "sans"],
    goticaNegrita: ["\u0301\u0300", "sansNegrita"],
    sansCursiva: ["\u0301\u0300", "cursiva"],
    sansCursivaNegrita: ["\u0301\u0300", "sansNegrita"],
    anchoCompleto: ["\u0301\u0300\u0303\u0308", "sans"],
    circulo: ["\u0303\u0308", "sans"],
    circuloNegro: ["\u0303\u0308", "sansNegrita"],
    cuadro: ["\u0303\u0308", "sansNegrita"],
    cuadroNegro: ["\u0303\u0308", "sansNegrita"],
    parentesis: ["\u0303\u0308", "sans"],
    superindice: ["\u0301\u0300\u0303\u0308", "sans"],
    subindice: ["\u0301\u0300\u0303\u0308", "sans"]
  };
  for (var claveAcento in ACENTOS_ROTOS) {
    if (tiene(ACENTOS_ROTOS, claveAcento)) {
      M[claveAcento].marcasRotas = ACENTOS_ROTOS[claveAcento][0];
      M[claveAcento].respaldo = ACENTOS_ROTOS[claveAcento][1];
    }
  }
  M.cajaMayus.marcasRotas = "\u0301\u0300\u0303\u0308";
  M.cajaMayus.respaldo = "sans";
  M.cajaNegraMayus.marcasRotas = "\u0301\u0300\u0303\u0308";
  M.cajaNegraMayus.respaldo = "sansNegrita";
  ["oriental", "oriental2", "moneda", "armenio", "rizada", "ondulada",
    "demonio", "thai", "yi", "etiope", "georgiano", "bengali", "hindi",
    "yi2", "runas", "cingales", "angulares", "neon", "codigo",
    "squiggle", "squiggle2", "rusa", "griega"].forEach(function (clave) {
    M[clave].marcasRotas = "\u0301\u0300\u0303\u0308";
    M[clave].respaldo = "sans";
  });

  /* Mezcla letra a letra: alterna alfabetos distintos dentro de un texto. */
  function mezclarTexto(texto, claves) {
    var salida = "";
    var chars = Array.from(String(texto).normalize("NFC"));
    var i = 0;
    for (var j = 0; j < chars.length; j++) {
      var c = chars[j];
      if (/\s/.test(c)) { salida += c; continue; }
      var mapa = M[claves[i % claves.length]];
      salida += mapa ? mapearCaracter(c, mapa) : c;
      i++;
    }
    return salida;
  }

  /* Mezcla palabra a palabra: cada palabra se convierte con un alfabeto
     distinto y se une con un separador decorativo (p. ej. ☄ 🌙 ◆). */
  function mezclarPalabras(texto, claves, sep) {
    var palabras = String(texto).trim().split(/\s+/);
    return palabras.map(function (p) { return mezclarTexto(p, claves); }).join(" " + sep + " ");
  }

  var DECORACIONES = [
    ["\u2740", "\u2740"], ["\u2727", "\u2727"], ["\u273f", "\u273f"],
    ["\u2726", "\u2726"], ["\u25c8", "\u25c8"], ["\u2665", "\u2665"],
    ["\u0f3a", "\u0f3b"], ["\u2593\u2592\u2591", "\u2591\u2592\u2593"],
    ["\u00b0\u2022", "\u2022\u00b0"], ["\u25c9", "\u25c9"],
    ["\u2618", "\u2618"], ["\u2604", "\u2604"], ["\u2600", "\u2600"],
    ["\u265a", "\u265a"], ["\u2694", "\u2694"],
    ["\u2741", "\u2741"], ["\u273e", "\u273e"], ["\u2743", "\u2743"], ["\u274b", "\u274b"],
    ["\u2749", "\u2749"], ["\u2756", "\u2756"], ["\u269d", "\u269d"], ["\u2736", "\u2736"],
    ["\u2739", "\u2739"], ["\u273a", "\u273a"],
    ["꧁༺", "༻꧂"], ["ミ★", "★彡"], ["╰•★★", "★★•╯"], ["¸.·✩·.¸", "¸.·✩·.¸"],
    ["`✵•.¸,✵°✵.｡.✰", "✰.｡.✵°✵,¸.•✵´"], ["ıllıllı", "ıllıllı"],
    ["★·.·´¯`·.·★", "★·.·´¯`·.·★"],
    ["✿.｡.:* ☆:**:.", ".:**:☆*.:｡.✿"],
    ["¸„.-•~¹°”ˆ˜¨", "¨˜ˆ”°¹~•-.„¸"],
    ["(¯´•._.•", "•._.•´¯)"],
    ["×º°“˜`”°º×", "×º°“˜`”°º×"],
    ["•°¯`••", "••´¯°•"],
    ["••¤(`×[¤", "¤]×´)¤••"],
    ["¤¸¸.•´¯`•¸¸.•..>>", "<<..•.¸¸•´¯`•.¸¸¤"],
    ["➶➶➶➶➶", "➷➷➷➷➷"],
    ["↫↫↫↫↫", "↬↬↬↬↬"],
    ["·.¸¸.·♩♪♫", "♫♪♩·.¸¸.·"],
    ["¸¸♬·¯·♩¸¸♪·¯·♫¸¸", "¸¸♫·¯·♪¸¸♩·¯·♬¸¸"],
    ["▀▄▀▄▀▄", "▄▀▄▀▄▀"],
    ["╚»★«╝", "╚»★«╝"],
    ["๑۞๑,¸¸,ø¤º°`°๑۩", "๑۩ ,¸¸,ø¤º°`°๑۞๑"],
    ["°°°·.°·..·°¯°·._.·", "·._.·°¯°·.·° .·°°°"],
    ["«-(¯`v´¯)-«", "»-(¯`v´¯)-»"],
    ["-漫~*'¨¯¨'*·舞~", "~舞*'¨¯¨'*·~漫-"],
    ["(¯`·.¸¸.·´¯`·.¸¸.->", "<-.¸¸.·´¯`·.¸¸.·´¯)"],
    ["╰☆☆", "☆☆╮"],
    ["-·=»‡«=·-", "-·=»‡«=·-"],
    ["(¯`*•.¸,¤°´✿.｡.:*", "*.:｡.✿`°¤,¸.•*´¯)"],
    ["|!¤*'~``~'*¤!|", "|!¤*'~``~'*¤!|"],
    ["]|I{•------»", "«------•}I|["],
    ["`•.,¸¸,.•´¯", "¯`•.,¸¸,.•´"]
  ];

  var ZALGO_ARRIBA = ["\u030d", "\u030e", "\u0304", "\u0305", "\u033f", "\u0311", "\u0306", "\u0310", "\u0352", "\u0357", "\u0351", "\u0307", "\u0308", "\u030a", "\u0342", "\u0343"];
  var ZALGO_MEDIO = ["\u0315", "\u031b", "\u0340", "\u0341", "\u0358", "\u0321", "\u0322", "\u0327", "\u0328", "\u0334", "\u0335", "\u0336"];
  var ZALGO_ABAJO = ["\u0316", "\u0317", "\u0318", "\u0319", "\u031c", "\u031d", "\u031e", "\u031f", "\u0320", "\u0324", "\u0325", "\u0326", "\u0329", "\u032a", "\u032b"];

  function zalgo(intensidad) {
    return function (texto) {
      var chars = Array.from(texto);
      var salida = "";
      for (var i = 0; i < chars.length; i++) {
        salida += chars[i];
        if (chars[i] === " ") continue;
        for (var a = 0; a < intensidad; a++) {
          salida += ZALGO_ARRIBA[(i * 7 + a * 3) % ZALGO_ARRIBA.length];
          salida += ZALGO_ABAJO[(i * 5 + a * 2) % ZALGO_ABAJO.length];
          if (a % 2 === 0) salida += ZALGO_MEDIO[(i + a) % ZALGO_MEDIO.length];
        }
      }
      return salida;
    };
  }

  function invertir(texto) {
    return Array.from(texto).reverse().join("");
  }

  /* --- Ayudas para los estilos nuevos ---
     marcar(): añade una marca combinante (acento, raya, punto…) después de
     cada letra. Convierte el texto en una "fuente" con adornos, sin tocar
     los espacios. bordear(): envuelve el texto con un par de símbolos. */
  function marcar(marca) {
    return function (texto) {
      var salida = "";
      var chars = Array.from(texto);
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i];
        salida += c;
        if (/\s/.test(c)) continue;
        salida += marca;
      }
      return salida;
    };
  }

  function bordear(par) {
    return envolver(par[0] + " ", " " + par[1]);
  }

  /* Aplica un alfabeto y lo enmarca con un adorno: la base de las
     "fuentes premium" (cursiva romántica, gótica oscura, etc.). */
  function conAdorno(mapa, izq, der) {
    return function (texto) {
      return izq + " " + aplicar(mapa)(texto) + " " + der;
    };
  }

  /* --- Ayudas para los estilos de carpintero ---
     letro(): convierte a mayúsculas y aplica un alfabeto (aspecto de
     rótulo técnico). grabado(): aplica una marca combinante sobre el
     resultado de otro estilo (efecto de sierra, brocha, taladro…). */
  function letro(mapa) {
    return function (texto) {
      return aplicar(mapa)(String(texto).toUpperCase());
    };
  }
  function grabado(marca, base) {
    return function (texto) {
      return marcar(marca)(base(texto));
    };
  }

  /* ----------------- Catálogo de estilos -----------------
     categorias sirven para filtrar el generador en cada página. */
  var ESTILOS = [
    /* --- Estilos temáticos gamer (Free Fire, juegos) --- */
    { id: "espadas-gamer", nombre: "Espadas gamer ⚔", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\u2694", "\u2694"]) },
    { id: "mando-gamer", nombre: "Mando gamer 🎮", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83c\udfae", "\ud83c\udfae"]) },
    { id: "alien-gamer", nombre: "Alien 👾", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83d\udc7e", "\ud83d\udc7e"]) },
    { id: "calavera-gamer", nombre: "Calavera 💀", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83d\udc80", "\ud83d\udc80"]) },
    { id: "fantasma-gamer", nombre: "Fantasma 👻", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83d\udc7b", "\ud83d\udc7b"]) },
    { id: "diana-gamer", nombre: "Diana de tiro 🎯", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83c\udfaf", "\ud83c\udfaf"]) },
    { id: "trofeo-gamer", nombre: "Trofeo 🏆", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83c\udfc6", "\ud83c\udfc6"]) },
    { id: "ninja-gamer", nombre: "Ninja 🥷", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83e\udd77", "\ud83e\udd77"]) },
    { id: "zombi-gamer", nombre: "Zombi 🧟", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83e\udddf", "\ud83e\udddf"]) },
    { id: "rayo-gamer", nombre: "Rayo ⚡", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\u26a1", "\u26a1"]) },
    { id: "escudo-gamer", nombre: "Escudo 🛡", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83d\udee1\ufe0f", "\ud83d\udee1\ufe0f"]) },
    { id: "diamante-gamer", nombre: "Diamante 💎", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83d\udc8e", "\ud83d\udc8e"]) },
    { id: "corona-gamer", nombre: "Corona real 👑", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83d\udc51", "\ud83d\udc51"]) },
    { id: "arquero-gamer", nombre: "Arquero 🏹", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["\ud83c\udff9", "\ud83c\udff9"]) },
    { id: "sello-gamer", nombre: "Sello legendario ꧁༒☬", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["꧁༒☬", "☬༒꧂"]) },
    { id: "francotirador-gamer", nombre: "Francotirador ▄︻デ══━一", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: function (t) { return "▄︻デ══━一 " + t; } },
    
    // FUENTES COMUNES Y DE ESTILO
    { id: "caja-mayus", nombre: "Caja en mayúsculas", cat: ["caja", "comunes", "instagram", "facebook", "juegos", "discord", "chidas", "freefire"], fn: aplicar(M.cajaMayus) },
    { id: "caja-negra-mayus", nombre: "Caja negra mayúsculas", cat: ["caja", "negrita", "comunes", "instagram", "whatsapp", "discord", "juegos", "chidas", "freefire"], fn: aplicar(M.cajaNegraMayus) },
    { id: "cursiva", nombre: "Cursiva", cat: ["cursiva", "comunes", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "chidas", "juegos", "freefire"], fn: aplicar(M.cursiva) },
    { id: "cursiva-negrita", nombre: "Cursiva negrita", cat: ["cursiva", "negrita", "comunes", "instagram", "whatsapp", "chidas", "juegos", "freefire"], fn: aplicar(M.cursivaNegrita) },
    { id: "caligrafica", nombre: "Caligráfica", cat: ["cursiva", "decoradas", "bonitas", "instagram", "facebook", "chidas", "juegos", "freefire"], fn: aplicar(M.caligrafica) },
    { id: "caligrafica-negrita", nombre: "Caligráfica negrita", cat: ["cursiva", "negrita", "decoradas", "bonitas", "chidas", "juegos", "freefire"], fn: aplicar(M.caligraficaNegrita) },
    { id: "negrita", nombre: "Negrita", cat: ["negrita", "comunes", "instagram", "facebook", "whatsapp", "twitter", "carpintero", "chidas", "juegos"], fn: aplicar(M.negritaSerif) },
    { id: "sans-negrita", nombre: "Negrita sans", cat: ["negrita", "comunes", "twitter", "discord", "carpintero", "juegos", "chidas", "freefire"], fn: aplicar(M.sansNegrita) },
    { id: "sans", nombre: "Sans", cat: ["comunes", "discord", "twitter", "carpintero", "juegos", "chidas", "freefire"], fn: aplicar(M.sans) },
    { id: "sans-cursiva", nombre: "Sans cursiva", cat: ["cursiva", "comunes", "discord", "juegos", "chidas", "freefire"], fn: aplicar(M.sansCursiva) },
    { id: "sans-cursiva-negrita", nombre: "Sans cursiva negrita", cat: ["cursiva", "negrita", "comunes", "instagram", "chidas", "juegos", "freefire"], fn: aplicar(M.sansCursivaNegrita) },
    { id: "gotica", nombre: "Gótica", cat: ["goticas", "graffiti", "cholas", "juegos", "chidas", "instagram", "freefire"], fn: aplicar(M.gotica) },
    { id: "gotica-negrita", nombre: "Gótica negrita", cat: ["goticas", "graffiti", "cholas", "juegos", "chidas", "freefire"], fn: aplicar(M.goticaNegrita) },
    { id: "doble-trazo", nombre: "Doble trazo", cat: ["comunes", "raras", "juegos", "discord", "carpintero", "chidas", "freefire"], fn: aplicar(M.dobleTrazo) },
    { id: "mono", nombre: "Monoespaciada", cat: ["comunes", "carpintero", "discord", "raras", "juegos", "freefire", "chidas"], fn: aplicar(M.mono) },
    { id: "ancho-completo", nombre: "Ancho completo", cat: ["aesthetic", "raras", "juegos", "tiktok", "freefire", "chidas"], fn: aplicar(M.anchoCompleto) },
    { id: "circulo", nombre: "Burbuja", cat: ["burbuja", "bonitas", "instagram", "tiktok", "juegos", "chidas", "freefire"], fn: aplicar(M.circulo) },
    { id: "circulo-negro", nombre: "Burbuja negra (mayúsculas)", cat: ["burbuja", "goticas", "juegos", "freefire", "chidas"], fn: aplicar(M.circuloNegro) },
    { id: "cuadro", nombre: "Caja cuadrada (mayúsculas)", cat: ["juegos", "raras", "chidas", "freefire"], fn: aplicar(M.cuadro) },
    { id: "cuadro-negro", nombre: "Caja negra cuadrada (mayúsculas)", cat: ["juegos", "goticas", "chidas", "freefire"], fn: aplicar(M.cuadroNegro) },
    /* --- Diseños de caja: marcos, separadores y mezclas --- */
    { id: "caja-espaciada", nombre: "Caja espaciada 🄰 🄱", cat: ["caja", "bonitas", "instagram", "tiktok", "juegos", "chidas"], fn: entreLetras(M.cajaMayus, " ") },
    { id: "caja-negra-marco", nombre: "Caja negra con marco 【】", cat: ["caja", "negrita", "bonitas", "instagram", "tiktok", "chidas"], fn: conAdorno(M.cajaNegraMayus, "\u3010", "\u3011") },
    { id: "caja-corchetes", nombre: "Caja entre corchetes 〚〛", cat: ["caja", "comunes", "bonitas", "instagram", "chidas"], fn: conAdorno(M.cajaMayus, "\u301a", "\u301b") },
    { id: "caja-tabla", nombre: "Caja tipo tabla ┃", cat: ["caja", "raras", "juegos", "discord", "chidas"], fn: function (t) { return "\u2503 " + String(t).trim().split(/\s+/).map(function (p) { return grafemas(aplicar(M.cajaMayus)(p)).join("\u2503"); }).join(" \u2503 ") + " \u2503"; } },
    { id: "caja-bloques", nombre: "Caja de bloques ░▒▓", cat: ["caja", "raras", "goticas", "juegos", "chidas"], fn: conAdorno(M.cajaMayus, "\u2591\u2592\u2593", "\u2593\u2592\u2591") },
    { id: "caja-doble", nombre: "Caja doble 🄰🅰", cat: ["caja", "raras", "instagram", "juegos", "chidas"], fn: function (t) { return mezclarTexto(String(t).toUpperCase(), ["cajaMayus", "cajaNegraMayus"]); } },
    { id: "caja-rombos", nombre: "Caja con rombos ◇", cat: ["caja", "decoradas", "bonitas", "juegos", "chidas"], fn: function (t) { return "\u25c7 " + String(t).trim().split(/\s+/).map(function (p) { return grafemas(aplicar(M.cajaMayus)(p)).join("\u25c6"); }).join(" ") + " \u25c7"; } },
    { id: "caja-sello", nombre: "Caja sello ✦", cat: ["caja", "decoradas", "bonitas", "instagram", "tiktok", "chidas"], fn: conAdorno(M.cajaNegraMayus, "\u2726", "\u2726") },
    { id: "caja-negra-espaciada", nombre: "Caja negra espaciada 🅰 🅱", cat: ["caja", "negrita", "raras", "juegos", "chidas"], fn: entreLetras(M.cajaNegraMayus, " ") },
    { id: "caja-inicial", nombre: "Caja con inicial negra", cat: ["caja", "comunes", "bonitas", "instagram", "chidas", "juegos"], fn: function (t) { return String(t).trim().split(/\s+/).map(function (p) { var gs = grafemas(p), salida = ""; for (var i = 0; i < gs.length; i++) { var mapa = i === 0 ? M.cajaNegraMayus : M.cajaMayus; salida += mapearCaracter(gs[i], mapa); } return salida; }).join(" "); } },
    { id: "caja-elegante", nombre: "Caja elegante 「」", cat: ["caja", "bonitas", "comunes", "instagram", "chidas"], fn: conAdorno(M.cajaMayus, "\u300c", "\u300d") },
    { id: "versalitas", nombre: "Versalitas (pequeñas)", cat: ["pequena", "comunes", "aesthetic", "instagram", "carpintero", "juegos", "chidas"], fn: aplicar(M.versalitas) },
    { id: "superindice", nombre: "Superíndice (mini)", cat: ["pequena", "raras", "aesthetic", "carpintero", "juegos", "chidas"], fn: aplicar(M.superindice) },
    { id: "subindice", nombre: "Subíndice (mini)", cat: ["pequena", "raras", "carpintero", "juegos", "chidas"], fn: aplicar(M.subindice) },
    /* --- Fuentes premium: un alfabeto llamativo con un marco fino --- */
    { id: "parentesis-latinos", nombre: "Letras entre paréntesis ⒜", cat: ["burbuja", "raras", "comunes", "bonitas", "juegos", "discord", "chidas"], fn: aplicar(M.parentesis) },
    { id: "cursiva-romantica", nombre: "Cursiva romántica ❦", cat: ["cursiva", "bonitas", "decoradas", "aesthetic", "instagram", "tiktok", "chidas"], fn: conAdorno(M.cursiva, "\u2766", "\u2766") },
    { id: "cursiva-lunar", nombre: "Cursiva lunar ☾", cat: ["cursiva", "aesthetic", "bonitas", "decoradas", "tristes", "instagram", "tiktok", "chidas"], fn: conAdorno(M.cursiva, "\u263e", "\u263d") },
    { id: "cursiva-brillante", nombre: "Cursiva brillante ✧", cat: ["cursiva", "aesthetic", "bonitas", "decoradas", "instagram", "tiktok", "chidas"], fn: conAdorno(M.cursiva, "\u2727\u00b7\u02da", "\u02da\u00b7\u2727") },
    { id: "caligrafica-lujo", nombre: "Caligráfica de lujo ❖", cat: ["cursiva", "negrita", "bonitas", "decoradas", "instagram", "facebook", "chidas"], fn: conAdorno(M.caligraficaNegrita, "\u2756", "\u2756") },
    { id: "gotica-oscura", nombre: "Gótica oscura †", cat: ["goticas", "decoradas", "chidas", "juegos", "freefire", "graffiti", "cholas"], fn: conAdorno(M.goticaNegrita, "\u2020", "\u2020") },
    { id: "negrita-editorial", nombre: "Negrita editorial ✦", cat: ["negrita", "comunes", "bonitas", "instagram", "facebook", "whatsapp", "twitter", "chidas"], fn: conAdorno(M.negritaSerif, "\u2726", "\u2726") },
    { id: "sans-futurista", nombre: "Sans futurista ⟪⟫", cat: ["cursiva", "negrita", "juegos", "freefire", "discord", "chidas"], fn: conAdorno(M.sansCursivaNegrita, "\u27ea", "\u27eb") },
    { id: "burbuja-pastel", nombre: "Burbuja pastel ꒰꒱", cat: ["burbuja", "bonitas", "instagram", "tiktok", "chidas", "juegos"], fn: conAdorno(M.circulo, "\ua4f0", "\ua4f1") },
    { id: "burbuja-espaciada", nombre: "Burbuja espaciada ⓐ ⓑ", cat: ["burbuja", "bonitas", "instagram", "tiktok", "juegos", "chidas", "freefire"], fn: entreLetras(M.circulo, " ") },
    { id: "burbuja-doble", nombre: "Burbuja doble ⓐ🅐", cat: ["burbuja", "bonitas", "instagram", "tiktok", "juegos", "chidas", "freefire"], fn: function (t) { return mezclarTexto(t.toUpperCase(), ["circulo", "circuloNegro"]); } },
    { id: "burbuja-graffiti", nombre: "Burbuja graffiti 🄰", cat: ["burbuja", "bonitas", "instagram", "tiktok", "juegos", "chidas", "freefire", "graffiti"], fn: function (t) { return mezclarTexto(t.toUpperCase(), ["cuadro", "circuloNegro", "cuadroNegro", "circulo"]); } },
    { id: "burbuja-contorno", nombre: "Burbuja contorno 𝕓", cat: ["burbuja", "bonitas", "instagram", "tiktok", "juegos", "chidas", "freefire"], fn: entreLetras(M.dobleTrazo, " ") },
    { id: "burbuja-ancha", nombre: "Burbuja ancha Ｂ", cat: ["burbuja", "bonitas", "instagram", "tiktok", "juegos", "chidas", "freefire"], fn: entreLetras(M.anchoCompleto, " ") },
    { id: "burbuja-en-caja", nombre: "Burbuja en caja 🄰", cat: ["burbuja", "bonitas", "instagram", "tiktok", "juegos", "chidas", "freefire"], fn: entreLetras(M.cuadro, " ") },
    { id: "burbuja-espuma", nombre: "Burbuja espumosa 🫧", cat: ["burbuja", "bonitas", "instagram", "tiktok", "chidas", "juegos"], fn: conAdorno(M.circulo, "\ud83e\udee7", "\ud83e\udee7") },
    { id: "burbuja-destellos", nombre: "Burbuja destellos ✧", cat: ["burbuja", "bonitas", "instagram", "tiktok", "chidas", "juegos"], fn: conAdorno(M.circulo, "\u2727", "\u2727") },
    /* --- Burbuja cursiva: letras manuscritas dentro de pompas --- */
    { id: "burbuja-cursiva", nombre: "Burbuja cursiva 🫧", cat: ["burbuja", "cursiva", "bonitas", "instagram", "tiktok", "chidas"], fn: conAdorno(M.caligraficaNegrita, "\ud83e\udee7", "\ud83e\udee7") },
    { id: "burbuja-cursiva-espaciada", nombre: "Burbuja cursiva espaciada", cat: ["burbuja", "cursiva", "bonitas", "instagram", "tiktok", "chidas"], fn: function (t) { return "꒰ " + entreLetras(M.caligraficaNegrita, " ")(t) + " ꒱"; } },
    /* --- Burbuja diseñada: pompas con marcos y destellos --- */
    { id: "burbuja-diseno", nombre: "Burbuja diseño ✦", cat: ["burbuja", "decoradas", "bonitas", "instagram", "tiktok", "chidas"], fn: function (t) { return "\u2726 " + String(t).trim().split(/\s+/).map(function (p) { return grafemas(aplicar(M.circulo)(p)).join("\u2727"); }).join(" ") + " \u2726"; } },
    { id: "burbuja-floral", nombre: "Burbuja floral ❀", cat: ["burbuja", "decoradas", "bonitas", "instagram", "tiktok", "chidas"], fn: conAdorno(M.circulo, "\u2740", "\u2740") },
    { id: "burbuja-reina", nombre: "Burbuja reina ♛", cat: ["burbuja", "decoradas", "bonitas", "juegos", "chidas"], fn: conAdorno(M.circuloNegro, "\u265b", "\u265b") },
    { id: "doble-trazo-retro", nombre: "Doble trazo retro ░▒▓", cat: ["comunes", "raras", "juegos", "discord", "chidas", "goticas"], fn: conAdorno(M.dobleTrazo, "\u2591\u2592\u2593", "\u2593\u2592\u2591") },
    { id: "versalitas-elegantes", nombre: "Versalitas elegantes ❀", cat: ["pequena", "comunes", "aesthetic", "bonitas", "instagram", "chidas"], fn: conAdorno(M.versalitas, "\u2740", "\u2740") },
    { id: "squiggle", nombre: "Squiggle", cat: ["squiggle", "raras", "chidas", "juegos"], fn: aplicar(M.squiggle) },
    { id: "squiggle-2", nombre: "Squiggle doble", cat: ["squiggle", "raras", "feas"], fn: aplicar(M.squiggle2) },
    { id: "rusa", nombre: "Estilo ruso", cat: ["raras", "feas", "juegos", "graffiti"], fn: aplicar(M.rusa) },
    { id: "griega", nombre: "Estilo griego", cat: ["raras", "juegos", "chidas"], fn: aplicar(M.griega) },
    { id: "carpintero", nombre: "Carpintero (mayúsculas rectas)", cat: ["carpintero", "caja", "comunes"], fn: function (t) { return aplicar(M.mono)(t.toUpperCase()); } },
    { id: "tachado", nombre: "Tachado", cat: ["raras", "tristes", "feas", "comunes"], fn: combinando("\u0336") },
    { id: "subrayado", nombre: "Subrayado", cat: ["raras", "comunes"], fn: combinando("\u0332") },
    { id: "rayo", nombre: "Rayado ondulado", cat: ["raras", "feas", "glitch"], fn: combinando("\u0347") },
    { id: "invertido", nombre: "Al revés", cat: ["raras", "feas", "juegos"], fn: function (t) { return invertir(aplicar(FLIP)(t.toLowerCase())); } },
    { id: "espejo", nombre: "Espejo", cat: ["raras", "glitch"], fn: invertir },
    { id: "glitch-suave", nombre: "Glitch suave", cat: ["glitch", "tristes", "goticas"], fn: zalgo(1) },
    { id: "glitch", nombre: "Glitch medio", cat: ["glitch", "raras", "feas"], fn: zalgo(2) },
    { id: "glitch-extremo", nombre: "Glitch extremo", cat: ["glitch", "feas", "raras"], fn: zalgo(4) },
    { id: "puntos", nombre: "Separado con puntos", cat: ["aesthetic", "decoradas", "tiktok"], fn: entreSimbolos("\u00b7") },
    { id: "estrellas", nombre: "Separado con estrellas", cat: ["decoradas", "bonitas", "aesthetic"], fn: entreSimbolos("\u2727") },
    { id: "corazones", nombre: "Separado con corazones", cat: ["decoradas", "bonitas", "instagram"], fn: entreSimbolos("\u2665") },
    { id: "flores", nombre: "Separado con flores", cat: ["decoradas", "bonitas"], fn: entreSimbolos("\u273f") },
    { id: "triste-1", nombre: "Triste con lágrimas", cat: ["tristes", "decoradas"], fn: envolver("\ua4ff\u0361\u035c\ua4ff ", " \u0295\u2022\u0361\u035c\u2022\u0294") },
    { id: "triste-2", nombre: "Corazón roto", cat: ["tristes", "decoradas"], fn: envolver("\ud83d\udc94 ", " \ud83d\udc94") },
    { id: "chola-1", nombre: "Chola clásica", cat: ["cholas", "graffiti", "decoradas"], fn: function (t) { return "\u2620 " + aplicar(M.gotica)(t) + " \u2620"; } },
    { id: "chola-2", nombre: "Chola con rosas", cat: ["cholas", "decoradas", "bonitas"], fn: function (t) { return "\ud83c\udf39 " + aplicar(M.caligrafica)(t) + " \ud83c\udf39"; } },
    { id: "graffiti-1", nombre: "Graffiti spray", cat: ["graffiti", "chidas", "juegos"], fn: function (t) { return "\u2591\u2592\u2593 " + aplicar(M.goticaNegrita)(t.toUpperCase()) + " \u2593\u2592\u2591"; } },
    { id: "graffiti-2", nombre: "Graffiti tag", cat: ["graffiti", "chidas"], fn: function (t) { return "\u00bb\u00bb " + aplicar(M.squiggle)(t) + " \u00ab\u00ab"; } },
    { id: "aesthetic-1", nombre: "Aesthetic nube", cat: ["aesthetic", "bonitas", "tiktok"], fn: function (t) { return "\u2601\ufe0f " + aplicar(M.anchoCompleto)(t) + " \u2601\ufe0f"; } },
    { id: "aesthetic-2", nombre: "Aesthetic estelar", cat: ["aesthetic", "bonitas", "instagram"], fn: function (t) { return "\u2727\u00b7\u02da " + aplicar(M.versalitas)(t) + " \u02da\u00b7\u2727"; } },
    { id: "kawaii", nombre: "Kawaii", cat: ["bonitas", "emoticonos", "decoradas"], fn: envolver("(\u02c6\u035c\u02c6) ", " \u2661") },
    { id: "fuego", nombre: "Fuego gamer", cat: ["juegos", "chidas", "freefire"], fn: function (t) { return "\ud83d\udd25 " + aplicar(M.sansNegrita)(t.toUpperCase()) + " \ud83d\udd25"; } },
    { id: "corona", nombre: "Corona", cat: ["juegos", "freefire", "decoradas"], fn: function (t) { return "\u265b " + aplicar(M.gotica)(t) + " \u265b"; } },
    { id: "clan", nombre: "Etiqueta de clan", cat: ["juegos", "freefire"], fn: function (t) { return "\u3010" + aplicar(M.sansNegrita)(t.toUpperCase()) + "\u3011"; } },
    { id: "flechas", nombre: "Flechas gamer", cat: ["juegos", "freefire", "chidas"], fn: envolver("\u27a4\u27a4 ", " \u27a4\u27a4") },
    { id: "invisible", nombre: "Texto invisible", cat: ["invisible"], fn: function (t) { return "\u3164".repeat(Math.max(1, Array.from(t).length || 1)); } },
    { id: "espacio-invisible", nombre: "Espacio en blanco (Hangul)", cat: ["invisible"], fn: function () { return "\u3164\u3164\u3164"; } },

    /* --- Fuentes con marcas combinantes (acentos, rayas, puntos) --- */
    { id: "acento-agudo", nombre: "Con acentos agudos", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0301") },
    { id: "acento-grave", nombre: "Con acento grave", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0300") },
    { id: "acento-circunflejo", nombre: "Con circunflejo", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0302") },
    { id: "macron", nombre: "Con raya encima (macrón)", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0304") },
    { id: "tilde-cada-letra", nombre: "Con tilde en cada letra", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0303") },
    { id: "punto-encima", nombre: "Con punto encima", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0307") },
    { id: "punto-debajo", nombre: "Con punto debajo", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0323") },
    { id: "dieresis", nombre: "Con diéresis (dos puntos)", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0308") },
    { id: "subrayado-doble", nombre: "Subrayado doble", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0333") },
    { id: "linea-encima", nombre: "Línea encima", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u0305") },

    /* --- Envoltorios con signos de puntuación y corchetes --- */
    { id: "corchetes-japoneses", nombre: "Corchetes japoneses 〔〕", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u3014", "\u3015"]) },
    { id: "corchetes-dobles", nombre: "Corchetes dobles 〖〗", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u3016", "\u3017"]) },
    { id: "parentesis-dobles", nombre: "Paréntesis dobles 〘〙", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u3018", "\u3019"]) },
    { id: "comillas-japonesas", nombre: "Comillas japonesas 『』", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u300e", "\u300f"]) },
    { id: "comillas-japonesas-simples", nombre: "Comillas simples 「」", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u300c", "\u300d"]) },
    { id: "parentesis-gruesos", nombre: "Paréntesis gruesos ⸨⸩", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u2e28", "\u2e29"]) },
    { id: "llaves-blancas", nombre: "Llaves blancas ⦃⦄", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u2983", "\u2984"]) },
    { id: "parentesis-blancos", nombre: "Paréntesis blancos ⦅⦆", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u2985", "\u2986"]) },
    { id: "corchetes-gruesos", nombre: "Corchetes gruesos ⟦⟧", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u27e6", "\u27e7"]) },
    { id: "titulo-japones", nombre: "Título japonés 《》", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: bordear(["\u300a", "\u300b"]) },

    /* --- Separadores entre letras --- */
    { id: "sep-estrellas-rellenas", nombre: "Separado con ★", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u2605") },
    { id: "sep-estrellas-huecas", nombre: "Separado con ☆", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u2606") },
    { id: "sep-puntos-gruesos", nombre: "Separado con ●", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u25cf") },
    { id: "sep-circulos", nombre: "Separado con ○", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u25cb") },
    { id: "sep-diamantes", nombre: "Separado con ◆", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u25c6") },
    { id: "sep-diamantes-huecos", nombre: "Separado con ◇", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u25c7") },
    { id: "sep-tildes", nombre: "Separado con ~", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("~") },
    { id: "sep-guiones", nombre: "Separado con -", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("-") },
    { id: "sep-guiones-bajos", nombre: "Separado con _", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("_") },
    { id: "sep-iguales", nombre: "Separado con =", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("=") },
    { id: "sep-por", nombre: "Separado con ×", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u00d7") },
    { id: "sep-punto-japones", nombre: "Separado con ・", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita"], fn: entreSimbolos("\u30fb") },

    /* --- Adornos temáticos (redes, aesthetic, emoticonos, tristes) --- */
    { id: "flor-cerezo", nombre: "Flor de cerezo 🌸", cat: ["emoticonos", "bonitas", "decoradas", "aesthetic", "instagram", "tiktok", "comunes"], fn: bordear(["\ud83c\udf38", "\ud83c\udf38"]) },
    { id: "destellos", nombre: "Destellos ✨", cat: ["emoticonos", "bonitas", "decoradas", "aesthetic", "instagram", "tiktok", "comunes"], fn: bordear(["\u2728", "\u2728"]) },
    { id: "luna", nombre: "Luna 🌙", cat: ["aesthetic", "bonitas", "decoradas", "tristes", "goticas", "comunes"], fn: bordear(["\ud83c\udf19", "\ud83c\udf19"]) },
    { id: "estrella-fugaz", nombre: "Estrella fugaz 💫", cat: ["aesthetic", "bonitas", "decoradas", "instagram", "tiktok", "comunes"], fn: bordear(["\ud83d\udcab", "\ud83d\udcab"]) },
    { id: "sol", nombre: "Sol 🌞", cat: ["bonitas", "decoradas", "aesthetic", "tiktok", "comunes"], fn: bordear(["\ud83c\udf1e", "\ud83c\udf1e"]) },
    { id: "corazon-morado", nombre: "Corazón morado 💜", cat: ["bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "comunes"], fn: bordear(["\ud83d\udc9c", "\ud83d\udc9c"]) },
    { id: "corazon-brillante", nombre: "Corazón brillante 💖", cat: ["bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "comunes"], fn: bordear(["\ud83d\udc96", "\ud83d\udc96"]) },
    { id: "corazon-negro", nombre: "Corazón negro 🖤", cat: ["goticas", "tristes", "glitch", "decoradas", "comunes", "freefire", "juegos", "chidas"], fn: bordear(["\ud83d\udda4", "\ud83d\udda4"]) },
    { id: "arcoiris", nombre: "Arcoíris 🌈", cat: ["aesthetic", "bonitas", "instagram", "tiktok", "comunes"], fn: bordear(["\ud83c\udf08", "\ud83c\udf08"]) },
    { id: "pata", nombre: "Huellitas 🐾", cat: ["emoticonos", "bonitas", "decoradas", "aesthetic", "comunes"], fn: bordear(["\ud83d\udc3e", "\ud83d\udc3e"]) },
    { id: "gato", nombre: "Carita felina 😺", cat: ["emoticonos", "bonitas", "comunes"], fn: bordear(["\ud83d\ude3a", "\ud83d\ude3a"]) },
    { id: "notas-musicales", nombre: "Notas musicales 🎶", cat: ["emoticonos", "tiktok", "aesthetic", "bonitas", "comunes"], fn: bordear(["\ud83c\udfb6", "\ud83c\udfb6"]) },
    { id: "lluvia", nombre: "Lluvia 🌧", cat: ["tristes", "glitch", "goticas", "freefire", "juegos", "chidas", "comunes"], fn: bordear(["\ud83c\udf27\ufe0f", "\ud83c\udf27\ufe0f"]) },
    { id: "lagrima", nombre: "Lágrima 💧", cat: ["tristes", "freefire", "juegos", "chidas", "comunes"], fn: bordear(["\ud83d\udca7", "\ud83d\udca7"]) },

    /* --- Alfabetos lookalike extra --- */
    { id: "oriental", nombre: "Estilo oriental", cat: ["raras", "aesthetic", "tiktok", "juegos", "freefire", "chidas", "goticas", "carpintero"], fn: aplicar(M.oriental) },
    { id: "oriental-2", nombre: "Estilo oriental 2", cat: ["raras", "aesthetic", "tiktok", "juegos", "freefire", "chidas", "goticas"], fn: aplicar(M.oriental2) },
    { id: "moneda", nombre: "Letras de moneda", cat: ["raras", "feas", "juegos", "freefire", "chidas", "carpintero"], fn: aplicar(M.moneda) },
    { id: "armenio", nombre: "Estilo armenio", cat: ["raras", "squiggle", "feas", "goticas", "chidas", "juegos", "freefire"], fn: aplicar(M.armenio) },
    { id: "rizadas", nombre: "Letras rizadas", cat: ["raras", "feas", "squiggle", "chidas", "juegos", "freefire", "goticas"], fn: aplicar(M.rizada) },
    { id: "onduladas", nombre: "Letras onduladas", cat: ["squiggle", "raras", "feas", "aesthetic", "tiktok", "juegos", "freefire"], fn: aplicar(M.ondulada) },
    { id: "demonico", nombre: "Estilo demoníaco", cat: ["feas", "raras", "goticas", "glitch", "juegos", "freefire", "chidas"], fn: aplicar(M.demonio) },
    { id: "thai", nombre: "Estilo tailandés", cat: ["squiggle", "raras", "feas", "aesthetic", "tiktok"], fn: aplicar(M.thai) },
    { id: "yi", nombre: "Estilo Yi", cat: ["raras", "feas", "chidas", "juegos", "freefire", "goticas"], fn: aplicar(M.yi) },

    /* --- Efectos de marca combinante extra --- */
    { id: "anillo-encima", nombre: "Con anillo encima", cat: ["comunes", "cursiva", "negrita", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "juegos", "chidas", "freefire"], fn: marcar("\u030a") },
    { id: "barra-oblicua", nombre: "Tachado diagonal", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas", "goticas"], fn: marcar("\u0338") },
    { id: "ondulado-tachado", nombre: "Tachado ondulado", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas", "goticas"], fn: marcar("\u0334") },
    { id: "x-encima", nombre: "Con X encima", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas"], fn: marcar("\u033d") },
    { id: "puente", nombre: "Con puente debajo", cat: ["raras", "comunes", "juegos", "chidas"], fn: marcar("\u032a") },
    { id: "teclas", nombre: "Estilo teclado (keycap)", cat: ["juegos", "freefire", "chidas", "raras", "comunes", "discord"], fn: function (t) { var s = "", cs = Array.from(t); for (var i = 0; i < cs.length; i++) { var c = cs[i]; s += /\s/.test(c) ? c : c + "\u20e3"; } return s; } },
    { id: "caja-por-letra", nombre: "Caja por letra", cat: ["juegos", "freefire", "chidas", "caja", "raras", "comunes", "carpintero"], fn: function (t) { var s = "", cs = Array.from(t); for (var i = 0; i < cs.length; i++) { var c = cs[i]; s += /\s/.test(c) ? c : c + "\u20de"; } return s; } },

    /* --- Envoltorios tipo "premium" --- */
    { id: "estrellas-dobles", nombre: "Estrellas dobles ミ★", cat: ["decoradas", "bonitas", "instagram", "tiktok", "aesthetic", "comunes"], fn: bordear(["ミ★", "★彡"]) },
    { id: "cinta-floral", nombre: "Cinta floral", cat: ["decoradas", "bonitas", "aesthetic", "instagram", "facebook"], fn: bordear(["¸.·✩·.¸", "¸.·✩·.¸"]) },
    { id: "reina-corona", nombre: "Corona de reina", cat: ["decoradas", "bonitas", "instagram", "aesthetic"], fn: bordear(["╰•★★", "★★•╯"]) },

    /* --- Mezclas letra a letra --- */
    { id: "mezcla-1", nombre: "Mezcla clásica", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita", "juegos", "freefire", "chidas"], fn: function (t) { return mezclarTexto(t, ["cursiva", "sansCursiva", "mono", "dobleTrazo", "circulo"]); } },
    { id: "mezcla-2", nombre: "Mezcla gótica", cat: ["comunes", "goticas", "chidas", "juegos", "freefire", "graffiti", "cholas", "decoradas"], fn: function (t) { return mezclarTexto(t, ["gotica", "goticaNegrita", "caligrafica", "dobleTrazo"]); } },
    { id: "mezcla-3", nombre: "Mezcla gamer", cat: ["comunes", "juegos", "freefire", "chidas", "goticas", "discord"], fn: function (t) { return mezclarTexto(t, ["sansNegrita", "anchoCompleto", "mono", "negritaSerif"]); } },

    /* --- Alfabetos clásicos añadidos (angulares, neón, código) --- */
    { id: "angulares", nombre: "Mayúsculas angulares", cat: ["raras", "chidas", "juegos", "freefire", "goticas", "graffiti", "carpintero"], fn: aplicar(M.angulares) },
    { id: "neon", nombre: "Estilo neón", cat: ["raras", "aesthetic", "tiktok", "juegos", "freefire", "chidas", "goticas"], fn: aplicar(M.neon) },
    { id: "codigo-simbolos", nombre: "Código de símbolos", cat: ["raras", "feas", "chidas", "juegos", "freefire", "goticas", "glitch"], fn: aplicar(M.codigo) },

    /* --- Marcas combinantes adicionales (una tras cada letra) --- */
    { id: "marca-plus-debajo", nombre: "Con signo + debajo", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas", "goticas", "glitch"], fn: marcar("\u031f") },
    { id: "marca-asterisco-debajo", nombre: "Con asterisco debajo", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas", "goticas", "glitch"], fn: marcar("\u0359") },
    { id: "marca-gaviota", nombre: "Con gaviota debajo", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas", "goticas"], fn: marcar("\u033c") },
    { id: "marca-puente-invertido", nombre: "Con puente invertido", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas", "goticas"], fn: marcar("\u033a") },
    { id: "marca-tilde-vertical", nombre: "Con tilde vertical", cat: ["raras", "feas", "comunes", "juegos", "freefire", "chidas", "goticas", "glitch"], fn: marcar("\u033e") },
    { id: "marca-cruz-doble", nombre: "Con cruz arriba y abajo", cat: ["raras", "feas", "goticas", "glitch", "juegos", "freefire", "chidas"], fn: marcar("\u033d\u0353") },
    { id: "marca-chispas", nombre: "Con chispas encima", cat: ["raras", "feas", "glitch", "goticas", "juegos", "freefire", "chidas"], fn: marcar("\u0489") },
    { id: "marca-flechas-debajo", nombre: "Con doble flecha debajo", cat: ["raras", "feas", "glitch", "juegos", "freefire", "chidas", "comunes"], fn: marcar("\u0362") },

    /* --- ESTILOS DE CARPINTERO ---------------------------------------
       Trazo recto, mayúsculas de taller, marcos de plano y efectos de
       obra. Todos llevan la categoría "carpintero" y solo se muestran
       en la página de letras de carpintero. */
    { id: "esquinas-tecnicas", nombre: "Esquinas técnicas", cat: ["carpintero"], fn: function (t) { return bordear(["\u2308", "\u2309"])(letro(M.mono)(t)); } },
    { id: "base-tecnica", nombre: "Cota inferior", cat: ["carpintero"], fn: function (t) { return bordear(["\u230a", "\u230b"])(letro(M.mono)(t)); } },
    { id: "moldura-alta", nombre: "Moldura superior", cat: ["carpintero"], fn: function (t) { return bordear(["\u23a1", "\u23a4"])(letro(M.mono)(t)); } },
    { id: "moldura-baja", nombre: "Moldura inferior", cat: ["carpintero"], fn: function (t) { return bordear(["\u23a3", "\u23a6"])(letro(M.mono)(t)); } },
    { id: "esquinas-finas", nombre: "Esquinas finas", cat: ["carpintero"], fn: function (t) { return bordear(["\u231c", "\u231d"])(letro(M.mono)(t)); } },
    { id: "arranque-fino", nombre: "Apoyo fino", cat: ["carpintero"], fn: function (t) { return bordear(["\u231e", "\u231f"])(letro(M.mono)(t)); } },
    { id: "corchetes-obreros", nombre: "Corchetes obreros", cat: ["carpintero"], fn: function (t) { return bordear(["\u27e6", "\u27e7"])(letro(M.mono)(t)); } },
    { id: "corchetes-huecos", nombre: "Corchetes calados", cat: ["carpintero"], fn: function (t) { return bordear(["\u301a", "\u301b"])(letro(M.mono)(t)); } },
    { id: "comillas-taller", nombre: "Comillas de taller", cat: ["carpintero"], fn: function (t) { return bordear(["\u300e", "\u300f"])(letro(M.mono)(t)); } },
    { id: "entre-corchetes", nombre: "Entre corchetes", cat: ["carpintero"], fn: function (t) { return bordear(["[", "]"])(letro(M.mono)(t)); } },
    { id: "faja-gruesa", nombre: "Faja gruesa", cat: ["carpintero"], fn: function (t) { return bordear(["\u3010", "\u3011"])(letro(M.sansNegrita)(t)); } },
    { id: "entre-angulos", nombre: "Entre ángulos", cat: ["carpintero"], fn: function (t) { return bordear(["\u27e8", "\u27e9"])(letro(M.mono)(t)); } },
    { id: "bloques-laterales", nombre: "Bloques laterales", cat: ["carpintero"], fn: function (t) { return bordear(["\u2590", "\u258c"])(letro(M.sansNegrita)(t)); } },
    { id: "esquinas-macizas", nombre: "Esquinas macizas", cat: ["carpintero"], fn: function (t) { return bordear(["\u2599", "\u259f"])(letro(M.sansNegrita)(t)); } },
    { id: "cornisas", nombre: "Cornisas", cat: ["carpintero"], fn: function (t) { return bordear(["\u259b", "\u259c"])(letro(M.sansNegrita)(t)); } },
    { id: "doble-canto", nombre: "Marco de doble canto", cat: ["carpintero"], fn: function (t) { return bordear(["\u2554", "\u2557"])(letro(M.sansNegrita)(t)); } },
    { id: "bancada-doble", nombre: "Bancada doble", cat: ["carpintero"], fn: function (t) { return bordear(["\u255a", "\u255d"])(letro(M.sansNegrita)(t)); } },
    { id: "punta-superior", nombre: "Punta superior", cat: ["carpintero"], fn: function (t) { return bordear(["\u25e4", "\u25e5"])(letro(M.sansNegrita)(t)); } },
    { id: "punta-inferior", nombre: "Punta inferior", cat: ["carpintero"], fn: function (t) { return bordear(["\u25e3", "\u25e2"])(letro(M.sansNegrita)(t)); } },
    { id: "trama-diagonal", nombre: "Trama diagonal", cat: ["carpintero"], fn: function (t) { return bordear(["\u259a", "\u259e"])(letro(M.mono)(t)); } },
    { id: "montantes", nombre: "Con montantes", cat: ["carpintero"], fn: function (t) { return bordear(["\u2524", "\u251c"])(letro(M.mono)(t)); } },
    { id: "travesanos", nombre: "Con travesaños", cat: ["carpintero"], fn: function (t) { return bordear(["\u25ac", "\u25ac"])(letro(M.mono)(t)); } },
    { id: "vigas-base", nombre: "Vigas de base", cat: ["carpintero"], fn: function (t) { return bordear(["\u2584", "\u2584"])(letro(M.sansNegrita)(t)); } },
    { id: "friso-clasico", nombre: "Friso clásico", cat: ["carpintero"], fn: function (t) { return bordear(["\u2308", "\u2309"])(letro(M.negritaSerif)(t)); } },
    { id: "taladrado", nombre: "Perforado por letra", cat: ["carpintero"], fn: grabado("\u0323", letro(M.mono)) },
    { id: "rotulo-plano", nombre: "Rótulo de plano", cat: ["carpintero"], fn: letro(M.sansNegrita) },
    { id: "mayus-obra", nombre: "Mayúsculas de obra", cat: ["carpintero"], fn: letro(M.sans) },
    { id: "doble-trazo-plano", nombre: "Doble trazo de plano", cat: ["carpintero"], fn: letro(M.dobleTrazo) },
    { id: "talla-serif", nombre: "Talla derecha", cat: ["carpintero"], fn: letro(M.negritaSerif) },
    { id: "linea-fondo", nombre: "Con línea de fondo", cat: ["carpintero"], fn: grabado("\u0332", letro(M.mono)) },
    { id: "brocha-gruesa", nombre: "Brocha gruesa", cat: ["carpintero"], fn: grabado("\u0332", letro(M.sansNegrita)) },
    { id: "huella-brocha", nombre: "Huella de brocha", cat: ["carpintero"], fn: grabado("\u0332", letro(M.sans)) },
    { id: "doble-huella", nombre: "Doble huella", cat: ["carpintero"], fn: grabado("\u0333", letro(M.sansNegrita)) },
    { id: "nivel-superior", nombre: "Nivel superior", cat: ["carpintero"], fn: grabado("\u0305", letro(M.mono)) },
    { id: "gabinete-nivel", nombre: "Gabinete con nivel", cat: ["carpintero"], fn: grabado("\u0305", letro(M.negritaSerif)) },
    { id: "marco-total", nombre: "Con marco y fondo", cat: ["carpintero"], fn: grabado("\u0305\u0332", letro(M.mono)) },
    { id: "corte-diagonal", nombre: "Con corte diagonal", cat: ["carpintero"], fn: grabado("\u0338", letro(M.mono)) },
    { id: "marcas-montaje", nombre: "Marcas de montaje", cat: ["carpintero"], fn: grabado("\u033d", letro(M.sans)) },
    { id: "doble-raya-base", nombre: "Raya gruesa al pie", cat: ["carpintero"], fn: grabado("\u0332\u0332", letro(M.sansNegrita)) },
    { id: "puntos-mira", nombre: "Puntos de mira", cat: ["carpintero"], fn: grabado("\u0307", letro(M.sans)) },
    { id: "rasante", nombre: "Con rasante", cat: ["carpintero"], fn: grabado("\u0331", letro(M.sans)) },
    { id: "pedestal", nombre: "Con pedestal", cat: ["carpintero"], fn: grabado("\u032a", letro(M.sans)) },
    { id: "remaches-base", nombre: "Con remaches de base", cat: ["carpintero"], fn: grabado("\u0325", letro(M.mono)) },
    { id: "remaches-top", nombre: "Con remaches", cat: ["carpintero"], fn: grabado("\u030a", letro(M.negritaSerif)) },
    { id: "cortes-hilo", nombre: "Con cortes al hilo", cat: ["carpintero"], fn: grabado("\u0335", letro(M.mono)) },
    { id: "punteado-tecnico", nombre: "Punteado técnico", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u00b7")(letro(M.mono)(t)); } },
    { id: "puntos-gordos", nombre: "Con puntos gordos", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2022")(letro(M.mono)(t)); } },
    { id: "barrotes", nombre: "Con barrotes", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2503")(letro(M.mono)(t)); } },
    { id: "tabiques", nombre: "Con tabiques", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2502")(letro(M.mono)(t)); } },
    { id: "clavado", nombre: "Clavado por letra", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u30fb")(letro(M.mono)(t)); } },
    { id: "guias-sueltas", nombre: "Con líneas guía", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2500")(letro(M.mono)(t)); } },
    { id: "nivel-doble", nombre: "Con nivel doble", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2550")(letro(M.mono)(t)); } },
    { id: "cruces-obreras", nombre: "Con cruces de obra", cat: ["carpintero"], fn: function (t) { return entreSimbolos("+")(letro(M.sansNegrita)(t)); } },
    { id: "escuadras", nombre: "Con escuadras", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u25aa")(letro(M.sansNegrita)(t)); } },
    { id: "remates-calados", nombre: "Con diamantes calados", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u25c8")(letro(M.mono)(t)); } },
    { id: "cortes-sierra", nombre: "Con cortes de sierra", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\uff0f")(letro(M.mono)(t)); } },
    { id: "zanjas", nombre: "Con zanjas", cat: ["carpintero"], fn: function (t) { return entreSimbolos("_")(letro(M.mono)(t)); } },
    { id: "guiones-medida", nombre: "Con guiones de medida", cat: ["carpintero"], fn: function (t) { return entreSimbolos("-")(letro(M.mono)(t)); } },
    { id: "remates-estelares", nombre: "Con remates estelares", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2726")(letro(M.sansNegrita)(t)); } },
    { id: "picos", nombre: "Con picos", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u25b2")(letro(M.mono)(t)); } },
    { id: "interlineado-abierto", nombre: "Letra espaciada", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u3000")(letro(M.mono)(t)); } },
    { id: "letra-elevada", nombre: "Letra de nota", cat: ["carpintero"], fn: function (t) { return letro(M.superindice)(t); } },
    { id: "cartelon", nombre: "Cartelón", cat: ["carpintero"], fn: letro(M.circuloNegro) },
    { id: "talla-grabada", nombre: "Talla con surco", cat: ["carpintero"], fn: grabado("\u0332", letro(M.negritaSerif)) },
    { id: "casco-obra", nombre: "Casco de obra", cat: ["carpintero"], fn: function (t) { return bordear(["\ud83d\udee0\ufe0f", "\ud83d\udee0\ufe0f"])(letro(M.sansNegrita)(t)); } },
    { id: "tuerca-giratoria", nombre: "Con tuerca", cat: ["carpintero"], fn: function (t) { return bordear(["\u2699", "\u2699"])(letro(M.mono)(t)); } },
    { id: "escuadra-digital", nombre: "Con escuadra digital", cat: ["carpintero"], fn: function (t) { return bordear(["\ud83d\udcd0", "\ud83d\udcd0"])(letro(M.mono)(t)); } },
    { id: "entre-tablas", nombre: "Entre tablas", cat: ["carpintero"], fn: function (t) { return bordear(["\ud83e\udeb5", "\ud83e\udeb5"])(letro(M.sansNegrita)(t)); } },
    { id: "grafito-tecnico", nombre: "Con grafito técnico", cat: ["carpintero"], fn: function (t) { return bordear(["\u270f", "\u270f"])(letro(M.mono)(t)); } },
    { id: "teclas-obra", nombre: "Teclas de obra", cat: ["carpintero"], fn: function (t) { var s = "", cs = Array.from(letro(M.sans)(t)); for (var i = 0; i < cs.length; i++) { var c = cs[i]; s += /\s/.test(c) ? c : c + "\u20e3"; } return s; } },
    { id: "rotulado-punteado", nombre: "Rótulo punteado", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u00b7")(letro(M.sansNegrita)(t)); } },
    { id: "guiones-obrero", nombre: "Guiones de obra", cat: ["carpintero"], fn: function (t) { return entreSimbolos("-")(letro(M.sansNegrita)(t)); } },
    { id: "doble-punteado", nombre: "Doble trazo punteado", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u00b7")(letro(M.dobleTrazo)(t)); } },
    { id: "barrotes-serif", nombre: "Serif con barrotes", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2503")(letro(M.negritaSerif)(t)); } },
    { id: "dientes-sierra", nombre: "Dientes de sierra", cat: ["carpintero"], fn: grabado("\u032d", letro(M.mono)) },
    { id: "faros", nombre: "Con faros", cat: ["carpintero"], fn: function (t) { return bordear(["\u25d8", "\u25d8"])(letro(M.mono)(t)); } },
    { id: "viejo-cartel", nombre: "Letra antigua de taller", cat: ["carpintero"], fn: letro(M.goticaNegrita) },
    { id: "caja-barrote", nombre: "Caja en barrote", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2503")(aplicar(M.cajaNegraMayus)(t.toUpperCase())); } },
    { id: "caja-escuadras", nombre: "Caja con escuadras", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u25aa")(aplicar(M.cajaMayus)(t.toUpperCase())); } },
    { id: "casillas-punteadas", nombre: "Casillas punteadas", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u00b7")(aplicar(M.cuadroNegro)(t.toUpperCase())); } },
    { id: "pilotes", nombre: "Con pilotes", cat: ["carpintero"], fn: grabado("\u033b", letro(M.mono)) },
    { id: "capitel", nombre: "Con capitel", cat: ["carpintero"], fn: grabado("\u033a", letro(M.sans)) },
    { id: "chispas-pie", nombre: "Con chispas al pie", cat: ["carpintero"], fn: grabado("\u0359", letro(M.sans)) },
    { id: "cortes-opuestos", nombre: "Cortes enfrentados", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\uff3c")(letro(M.mono)(t)); } },
    { id: "rieles", nombre: "Con rieles", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2594")(letro(M.mono)(t)); } },
    { id: "serif-punteada", nombre: "Serif punteada", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u00b7")(letro(M.negritaSerif)(t)); } },
    { id: "cortes-a-filo", nombre: "Cortes al filo", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\uff0f")(letro(M.sansNegrita)(t)); } },
    { id: "listones-anchos", nombre: "Con listones anchos", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2630")(letro(M.mono)(t)); } },
    { id: "cruces-anchas", nombre: "Cruces de grandor", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\uff0b")(letro(M.mono)(t)); } },
    { id: "estrellas-linieras", nombre: "Con estrellas al hilo", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2729")(letro(M.mono)(t)); } },
    { id: "tornillos-vivos", nombre: "Con tornillos", cat: ["carpintero"], fn: function (t) { return bordear(["\u2692", "\u2692"])(letro(M.mono)(t)); } },
    { id: "montaje-doble", nombre: "Con montaje doble", cat: ["carpintero"], fn: function (t) { return entreSimbolos("\u2016")(letro(M.mono)(t)); } },
    { id: "doble-surco", nombre: "Con doble surco", cat: ["carpintero"], fn: grabado("\u0333", letro(M.negritaSerif)) },
    { id: "guia-doblada", nombre: "Con guía doblada", cat: ["carpintero"], fn: grabado("\u0333", letro(M.mono)) },
    { id: "cotas-amplias", nombre: "Con cotas amplias", cat: ["carpintero"], fn: function (t) { return bordear(["\uff1c", "\uff1e"])(letro(M.mono)(t)); } },

    /* --- Estilos chidos nuevos (inspirados en los conversores de moda) ---
       Alfabetos exóticos, mezclas editoriales letra a letra y envoltorios
       aesthetic. Todos entran en la categoría "chidas". */
    { id: "etiope", nombre: "Estilo etíope", cat: ["chidas", "raras", "instagram", "tiktok", "comunes"], fn: aplicar(M.etiope) },
    { id: "georgiano", nombre: "Estilo georgiano", cat: ["chidas", "raras", "instagram", "comunes"], fn: aplicar(M.georgiano) },
    { id: "bengali", nombre: "Estilo bengalí", cat: ["chidas", "raras", "aesthetic", "tiktok"], fn: aplicar(M.bengali) },
    { id: "hindi", nombre: "Estilo hindi", cat: ["chidas", "raras", "aesthetic"], fn: aplicar(M.hindi) },
    { id: "yi-2", nombre: "Estilo Yi 2", cat: ["chidas", "raras", "juegos", "freefire"], fn: aplicar(M.yi2) },
    { id: "flecha-punteada", nombre: "Flecha punteada", cat: ["chidas", "aesthetic", "instagram", "tiktok"], fn: function (t) { return "\u02da\u208a\u00b7\u27b5 " + entreSimbolos("\u00b7")(aplicar(M.cursiva)(t)) + " \u27b4\u00b7\u208a\u02da"; } },
    { id: "mezcla-editorial", nombre: "Mezcla editorial", cat: ["chidas", "comunes", "instagram", "tiktok", "bonitas"], fn: function (t) { return mezclarTexto(t, ["sansNegrita", "sansCursivaNegrita", "cursivaNegrita", "sansCursiva"]); } },
    { id: "mezcla-astro", nombre: "Mezcla astro", cat: ["chidas", "juegos", "freefire", "raras"], fn: function (t) { return mezclarTexto(t, ["neon", "mono", "sansNegrita"]); } },
    { id: "humo-aesthetic", nombre: "Humo aesthetic", cat: ["chidas", "aesthetic", "tiktok", "instagram", "bonitas"], fn: function (t) { return "\u2230\u2727 " + mezclarTexto(t, ["anchoCompleto", "sansCursiva", "sans"]) + " \u2727\u2230"; } },
    { id: "pegatina-mixta", nombre: "Pegatina mixta", cat: ["chidas", "juegos", "discord", "freefire"], fn: function (t) { var palabras = String(t).trim().split(/\s+/), salida = []; for (var i = 0; i < palabras.length; i++) { var cs = Array.from(palabras[i]), linea = ""; for (var j = 0; j < cs.length; j++) { var c = cs[j]; if (j === 0) { var up = c.toUpperCase(); linea += M.cajaNegraMayus[up] ? M.cajaNegraMayus[up] : c; } else { linea += M.sansCursivaNegrita[c] ? M.sansCursivaNegrita[c] : c; } } salida.push(linea); } return salida.join(" "); } },
    { id: "mezcla-caja-burbuja", nombre: "Caja y burbuja", cat: ["chidas", "juegos", "comunes", "burbuja"], fn: function (t) { return mezclarTexto(t, ["cajaMayus", "circulo"]); } },
    { id: "triple-trazo", nombre: "Trazos cruzados", cat: ["chidas", "graffiti", "raras"], fn: marcar("\u0336\u0333") },

    /* --- Segunda hornada de estilos chidos: runas vikingas, cingalés,
       mezclas caóticas (babel, matrix) y efectos de teclado. --- */
    { id: "runas", nombre: "Runas vikingas", cat: ["chidas", "juegos", "freefire", "raras"], fn: aplicar(M.runas) },
    { id: "cingales", nombre: "Estilo cingalés", cat: ["chidas", "raras", "aesthetic"], fn: aplicar(M.cingales) },
    { id: "babel", nombre: "Torre de Babel", cat: ["chidas", "raras", "instagram", "tiktok"], fn: function (t) { return mezclarTexto(t, ["etiope", "georgiano", "yi", "rusa", "griega"]); } },
    { id: "matrix", nombre: "Lluvia matrix", cat: ["chidas", "juegos", "freefire", "glitch"], fn: function (t) { return mezclarTexto(t, ["mono", "oriental"]); } },
    { id: "pixelado", nombre: "Pixelado retro", cat: ["chidas", "juegos", "discord"], fn: function (t) { return "\u2593\u2592\u2591 " + aplicar(M.mono)(t) + " \u2591\u2592\u2593"; } },
    { id: "terminal", nombre: "Modo terminal", cat: ["chidas", "discord", "juegos"], fn: function (t) { return ">_ " + aplicar(M.mono)(t) + " \u258c"; } },
    { id: "eco-griego", nombre: "Eco griego", cat: ["chidas", "raras", "instagram"], fn: function (t) { return mezclarTexto(t, ["griega", "sansNegrita"]); } },
    { id: "mezcla-mayhem", nombre: "Mezcla mayhem", cat: ["chidas", "juegos", "freefire"], fn: function (t) { return mezclarTexto(t, ["goticaNegrita", "neon", "mono", "cajaMayus"]); } },
    { id: "mezcla-vibrato", nombre: "Mezcla vibrato", cat: ["chidas", "aesthetic", "tiktok"], fn: function (t) { return mezclarTexto(t, ["sans", "subindice"]); } },
    { id: "flecha-arriba", nombre: "Flechas al aire", cat: ["chidas", "raras", "graffiti"], fn: marcar("\u20d7") },
    { id: "doble-subrayado", nombre: "Doble subrayado", cat: ["chidas", "comunes", "instagram"], fn: marcar("\u0333") },
    { id: "tachado-punteado", nombre: "Tachado punteado", cat: ["chidas", "raras", "discord"], fn: marcar("\u0335") },

    /* --- Diseños clásicos (van al principio de la lista) --- */
    { id: "barra-poder", nombre: "Barra de poder ▁▂▃", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["▁▂▄▅▆▇█", "█▇▆▅▄▂▁"]) },
    { id: "sello-divino", nombre: "Sello divino ꧁ད", cat: ["freefire", "juegos", "goticas", "chidas", "graffiti", "cholas"], fn: bordear(["꧁༒༻☬ད", "ཌ☬༺༒꧂"]) },
    { id: "marco-musical", nombre: "Marco musical ♪ღ", cat: ["decoradas", "bonitas", "aesthetic", "tiktok", "instagram", "emoticonos", "comunes"], fn: bordear(["♪ღ♪*•.¸¸.•*¨¨*•.♪", "♪ღ♪*•.¸¸.•*¨¨*•.♪ღ♪"]) },

    /* --- Adornos con emojis y caritas (van al final de la lista) --- */
    { id: "corazon-doble", nombre: "Corazones dobles 💕", cat: ["emoticonos", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "tiktok", "comunes"], fn: bordear(["\ud83d\udc95", "\ud83d\udc95"]) },
    { id: "corazon-latiendo", nombre: "Corazón latiendo 💗", cat: ["emoticonos", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "tiktok", "comunes"], fn: bordear(["\ud83d\udc97", "\ud83d\udc97"]) },
    { id: "flecha-amor", nombre: "Flecha de amor 💘", cat: ["emoticonos", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "tiktok", "comunes"], fn: bordear(["\ud83d\udc98", "\ud83d\udc98"]) },
    { id: "fiesta", nombre: "Fiesta 🎉", cat: ["emoticonos", "bonitas", "decoradas", "comunes", "instagram", "tiktok"], fn: bordear(["\ud83c\udf89", "\ud83c\udf89"]) },
    { id: "rosa-triste", nombre: "Rosa marchita 🥀", cat: ["tristes", "goticas", "glitch", "decoradas", "comunes"], fn: bordear(["\ud83e\udd40", "\ud83e\udd40"]) },
    { id: "abrazo-kawaii", nombre: "Abrazo kawaii", cat: ["emoticonos", "bonitas", "decoradas", "aesthetic", "tristes", "comunes", "instagram", "tiktok"], fn: bordear(["(づ｡◕‿‿◕｡)づ", "٩(˘◡˘)۶"]) },
    { id: "gesto-amor", nombre: "Corazón de lado ♥╣", cat: ["emoticonos", "bonitas", "tristes", "goticas", "comunes"], fn: bordear(["♥╣[-_-]╠♥", "♥╣[-_-]╠♥"]) },
    { id: "sueno", nombre: "Gesto de amor ☞", cat: ["emoticonos", "bonitas", "tristes", "aesthetic", "comunes"], fn: bordear(["(☝◞‸◟)☞", "☜(◞‸◟☝)"]) },

    /* --- Mezcla caótica letra a letra --- */
    { id: "mezcla-loca", nombre: "Mezcla loca", cat: ["comunes", "raras", "chidas", "juegos", "freefire", "aesthetic", "tiktok", "goticas"], fn: function (t) { return mezclarTexto(t, ["circulo", "moneda", "goticaNegrita", "oriental", "anchoCompleto", "neon", "armenio", "yi"]); } },

    /* --- Estilos decorados de la portada (marcos y gamer) --- */
    { id: "alas-gamer", nombre: "Alas Reales Gamer", cat: ["freefire", "juegos", "goticas", "chidas", "decoradas"], fn: bordear(["\ua9c1\u0f3a", "\u0f3b\ua9c2"]) },
    { id: "corona-rey-gamer", nombre: "Corona Rey Gamer", cat: ["freefire", "juegos", "negrita", "decoradas", "chidas"], fn: bordear(["\u265b\u4e97", "\u4e97\u265b"]) },
    { id: "flores-primavera", nombre: "Flores Primavera", cat: ["decoradas", "aesthetic", "bonitas", "instagram"], fn: conAdorno(M.caligrafica, "\u273f", "\u273f") },
    { id: "corazones-romanticos", nombre: "Corazones Románticos", cat: ["decoradas", "cursiva", "instagram", "whatsapp", "bonitas"], fn: conAdorno(M.caligrafica, "\u2661", "\u2661") }
  ];

  /* --- Letras enmarcadas: 8 marcos × 8 alfabetos = 64 combinaciones ---
     Cada letra va dentro de su propio marco, palabra por palabra. */
  var MARCOS_CAJA = [
    { id: "corchetes", nombre: "Corchetes", izq: "[", der: "]" },
    { id: "corchetes-angulares", nombre: "Corchetes angulares", izq: "\u27e6", der: "\u27e7" },
    { id: "corchetes-curvos", nombre: "Corchetes curvos", izq: "\u29fc", der: "\u29fd" },
    { id: "corchetes-altos", nombre: "Corchetes altos", izq: "\ua70d", der: "\ua709" },
    { id: "corchetes-dobles", nombre: "Corchetes dobles", izq: "\u298f", der: "\u298e" },
    { id: "corchetes-cruzados", nombre: "Corchetes cruzados", izq: "\u2991", der: "\u2992" },
    { id: "cuadros", nombre: "Cuadros", izq: "\u3010", der: "\u3011" },
    { id: "cuadros-dobles", nombre: "Cuadros dobles", izq: "\u300e", der: "\u300f" }
  ];
  var ALFABETOS_CAJA = [
    { id: "normal", nombre: "Normal", mapa: null },
    { id: "fraktur", nombre: "Fraktur", mapa: M.gotica },
    { id: "cursiva-negrita", nombre: "Cursiva Negrita", mapa: M.caligraficaNegrita },
    { id: "doble-trazo", nombre: "Doble Trazo", mapa: M.dobleTrazo },
    { id: "sans-negrita", nombre: "Sans Negrita", mapa: M.sansNegrita },
    { id: "serif-negrita", nombre: "Serif Negrita", mapa: M.negritaSerif },
    { id: "monoespaciada", nombre: "Monoespaciada", mapa: M.mono },
    { id: "versalitas", nombre: "Versalitas", mapa: M.versalitas }
  ];
  function enmarcarLetras(izq, der, mapa) {
    var convertir = mapa ? aplicar(mapa) : function (t) { return t; };
    return function (texto) {
      return String(texto).trim().split(/\s+/).map(function (palabra) {
        return grafemas(convertir(palabra)).map(function (letra) {
          return izq + letra + der;
        }).join("");
      }).join(" ");
    };
  }
  MARCOS_CAJA.forEach(function (marco) {
    ALFABETOS_CAJA.forEach(function (alfabeto) {
      ESTILOS.push({
        id: "marco-" + marco.id + "-" + alfabeto.id,
        nombre: marco.nombre + " " + alfabeto.nombre,
        cat: ["caja", "decoradas", "raras", "bonitas", "chidas"],
        fn: enmarcarLetras(marco.izq, marco.der, alfabeto.mapa)
      });
    });
  });

  /* --- Nombres descriptivos en español para la interfaz ---
     El id interno no cambia: solo se mejora la etiqueta visible de las
     tarjetas, la búsqueda y los datos estructurados. */
  var NOMBRES_ES = {
    "cursiva": "Cursiva Itálica Clásica",
    "cursiva-negrita": "Cursiva Negrita Clásica",
    "caligrafica": "Cursiva Manuscrita Fina",
    "caligrafica-negrita": "Cursiva Elegante",
    "gotica": "Gótica Clásica",
    "gotica-negrita": "Gótica Negrita Medieval",
    "negrita": "Negrita Clásica",
    "sans-negrita": "Negrita Moderna",
    "sans": "Letras Modernas",
    "sans-cursiva": "Cursiva Moderna Limpia",
    "sans-cursiva-negrita": "Negrita Cursiva Moderna",
    "doble-trazo": "Doble Trazo (Pizarra)",
    "mono": "Monoespaciada (Máquina de Escribir)",
    "ancho-completo": "Ancho Completo (Vaporwave)",
    "circulo": "Letras Burbuja Claras",
    "circulo-negro": "Letras Burbuja Negras",
    "cuadro": "Cuadrados Blancos",
    "cuadro-negro": "Cuadrados Negros Invertidos",
    "versalitas": "Versalitas (Letras Pequeñas)",
    "superindice": "Superíndice Diminuto",
    "subindice": "Subíndice Pequeño",
    "parentesis-latinos": "Entre Paréntesis",
    "cursiva-romantica": "Cursiva Romántica",
    "cursiva-lunar": "Estética Lunar",
    "cursiva-brillante": "Destellos Estéticos",
    "caligrafica-lujo": "Caligráfica de Lujo",
    "gotica-oscura": "Gótica Oscura",
    "negrita-editorial": "Negrita Editorial",
    "sans-futurista": "Letras Futuristas",
    "burbuja-pastel": "Marco Aesthetic Kawaii",
    "burbuja-espaciada": "Burbuja Espaciada",
    "burbuja-doble": "Burbuja Doble",
    "burbuja-graffiti": "Burbuja Graffiti",
    "burbuja-contorno": "Burbuja Contorno",
    "burbuja-ancha": "Burbuja Ancha",
    "burbuja-en-caja": "Burbuja en Caja",
    "burbuja-espuma": "Burbuja Espumosa",
    "burbuja-destellos": "Burbuja Destellos",
    "burbuja-cursiva": "Burbuja Cursiva Elegante",
    "burbuja-cursiva-espaciada": "Burbuja Cursiva Espaciada",
    "burbuja-diseno": "Burbuja Diseño con Destellos",
    "burbuja-floral": "Burbuja Floral",
    "burbuja-reina": "Burbuja Reina",
    "doble-trazo-retro": "Doble Trazo Retro",
    "versalitas-elegantes": "Versalitas Elegantes",
    "squiggle": "Estilo Mágico",
    "squiggle-2": "Estilo Mágico Doble",
    "rusa": "Estilo Ruso",
    "griega": "Letras Griegas Estéticas",
    "tachado": "Texto Tachado",
    "subrayado": "Texto Subrayado",
    "subrayado-doble": "Texto Doble Subrayado",
    "invertido": "Letras al Revés (Invertidas)",
    "espejo": "Letras en Espejo",
    "glitch-suave": "Efecto Zalgo Suave",
    "glitch": "Efecto Zalgo Medio",
    "glitch-extremo": "Efecto Zalgo Extremo",
    "chola-1": "Estilo Cholo Urbano",
    "chola-2": "Chola con Rosas",
    "oriental": "Estilo Japonés / Asiático",
    "oriental-2": "Estilo Asiático 2",
    "runas": "Runas Nórdicas Antiguas",
    "moneda": "Letras Chidas Callejeras",
    "sello-gamer": "Clan Gamer Free Fire",
    "francotirador-gamer": "Francotirador Pro",
    "corona-gamer": "Corona Gamer",
    "espadas-gamer": "Espadas Gamer",
    "estrellas-dobles": "Estrellas Dobles Gamer",
    "barrotes-serif": "Clásica con Barrotes",
    "serif-punteada": "Clásica Punteada",
    "sello-divino": "Sello Divino Gamer",
    "barra-poder": "Barra de Poder Gamer",
    "marco-musical": "Marco Musical",
    "carpintero": "Carpintero (Mayúsculas Rectas)",
    "caja-mayus": "Caja en Mayúsculas",
    "caja-negra-mayus": "Caja Negra en Mayúsculas",
    "cuadro": "Caja Cuadrada",
    "cuadro-negro": "Caja Cuadrada Negra",
    "caja-espaciada": "Caja Espaciada",
    "caja-negra-marco": "Caja Negra con Marco",
    "caja-corchetes": "Caja entre Corchetes",
    "caja-tabla": "Caja Tipo Tabla",
    "caja-bloques": "Caja de Bloques",
    "caja-doble": "Caja Doble",
    "caja-rombos": "Caja con Rombos",
    "caja-sello": "Caja Sello",
    "caja-negra-espaciada": "Caja Negra Espaciada",
    "caja-inicial": "Caja con Inicial Negra",
    "caja-elegante": "Caja Elegante",
    "caja-por-letra": "Caja Letra a Letra",
    "neon": "Estilo Neón",
    "codigo-simbolos": "Código de Símbolos",
    "etiope": "Estilo Etíope",
    "georgiano": "Estilo Georgiano",
    "bengali": "Estilo Bengalí",
    "hindi": "Estilo Hindi",
    "yi": "Estilo Yi",
    "yi-2": "Estilo Yi 2",
    "cingales": "Estilo Cingalés",
    "armenio": "Estilo Armenio",
    "rizadas": "Letras Rizadas",
    "onduladas": "Letras Onduladas",
    "demonico": "Estilo Demoníaco",
    "thai": "Estilo Tailandés"
  };
  for (var n = 0; n < ESTILOS.length; n++) {
    if (Object.prototype.hasOwnProperty.call(NOMBRES_ES, ESTILOS[n].id)) {
      ESTILOS[n].nombre = NOMBRES_ES[ESTILOS[n].id];
    }
  }

  /* --- Etiquetas de categoría canónicas ---
     Las páginas usan tanto el singular histórico ("cursiva") como el
     plural nuevo ("cursivas"). Se añaden ambos para que los filtros,
     las tarjetas estáticas y los datos estructurados coincidan. */
  var PARES_CATEGORIA = [
    ["cursiva", "cursivas"],
    ["gotica", "goticas"],
    ["negrita", "negritas"],
    ["pequena", "pequenas"],
    ["chola", "cholas"],
    ["decorada", "decoradas"]
  ];
  ESTILOS.forEach(function (estilo) {
    var extra = [];
    PARES_CATEGORIA.forEach(function (par) {
      var tieneUno = estilo.cat.indexOf(par[0]) !== -1;
      var tieneOtro = estilo.cat.indexOf(par[1]) !== -1;
      if (tieneUno && !tieneOtro) extra.push(par[1]);
      if (tieneOtro && !tieneUno) extra.push(par[0]);
    });
    if (estilo.cat.indexOf("freefire") !== -1 || estilo.cat.indexOf("juegos") !== -1) {
      if (estilo.cat.indexOf("gamer") === -1) extra.push("gamer");
    }
    if (extra.length) estilo.cat = estilo.cat.concat(extra);
  });

  /* Decoraciones dinámicas: se añaden como estilos extra */
  DECORACIONES.forEach(function (par, i) {
    ESTILOS.push({
      id: "deco-" + i,
      nombre: "Decorada " + (i + 1),
      cat: ["decoradas", "bonitas", "chidas", "instagram"],
      fn: envolver(par[0] + " ", " " + par[1])
    });
  });

  /* =====================================================================
     ORDEN DE PRESENTACIÓN DE LOS ESTILOS
     ---------------------------------------------------------------------
     Orden que se muestra en el generador:
       1. DISEÑOS  — marcos, corchetes, cajas, sellos, separadores y las
                     "Decorada N" (van primero: son lo más vistoso).
       2. FUENTES  — alfabetos, acentos y demás letras.
       3. EMOJIS   — estilos que envuelven el texto con emojis
                     (🎮 💀 🌸 🖤 …), al final de la lista.
     La reordenación se hace una sola vez aquí; búsqueda, categorías y
     paginación siguen funcionando igual (solo cambia el orden).
     ===================================================================== */
  var DISENOS = [
    /* Los marcos de carpintero abren la página de letras de carpintero:
       son el look más llamativo de ese generador. En el resto de las
       páginas no aparecen, así que la lista global no cambia. */
    "esquinas-tecnicas", "esquinas-macizas", "bloques-laterales",
    "doble-canto", "cornisas", "travesanos", "faja-gruesa", "bancada-doble",
    "corchetes-obreros", "vigas-base", "base-tecnica", "entre-tablas",
    "moldura-alta", "moldura-baja", "punta-superior", "punta-inferior",
    "espadas-gamer", "rayo-gamer", "sello-gamer", "francotirador-gamer",
    "corchetes-japoneses", "corchetes-dobles", "parentesis-dobles",
    "comillas-japonesas", "comillas-japonesas-simples", "parentesis-gruesos",
    "llaves-blancas", "parentesis-blancos", "corchetes-gruesos", "titulo-japones",
    "sep-estrellas-rellenas", "sep-estrellas-huecas", "sep-puntos-gruesos",
    "sep-circulos", "sep-diamantes", "sep-diamantes-huecos", "sep-tildes",
    "sep-guiones", "sep-guiones-bajos", "sep-iguales", "sep-por", "sep-punto-japones",
    "estrellas-dobles", "cinta-floral", "reina-corona", "teclas", "caja-por-letra", "barra-poder", "sello-divino", "marco-musical"
  ];
  var EMOJIS = [
    "mando-gamer", "alien-gamer", "calavera-gamer", "fantasma-gamer",
    "diana-gamer", "trofeo-gamer", "ninja-gamer", "zombi-gamer",
    "escudo-gamer", "diamante-gamer", "corona-gamer", "arquero-gamer",
    "flor-cerezo", "destellos", "luna", "estrella-fugaz", "sol",
    "corazon-morado", "corazon-brillante", "corazon-negro", "arcoiris",
    "pata", "gato", "notas-musicales", "lluvia", "lagrima",
    "fuego", "chola-2", "triste-2", "aesthetic-1", "corazon-doble", "corazon-latiendo", "flecha-amor",
    "fiesta", "rosa-triste", "abrazo-kawaii", "gesto-amor", "sueno"
  ];
  function esDiseno(e) {
    return DISENOS.indexOf(e.id) !== -1 || e.id.indexOf("deco-") === 0;
  }
  function esEmoji(e) {
    return EMOJIS.indexOf(e.id) !== -1;
  }
  (function ordenarEstilos() {
    var disenos = [], fuentes = [], emojis = [];
    for (var i = 0; i < ESTILOS.length; i++) {
      var e = ESTILOS[i];
      if (esDiseno(e)) disenos.push(e);
      else if (esEmoji(e)) emojis.push(e);
      else fuentes.push(e);
    }
    // Sustituye el contenido de ESTILOS por: diseños + fuentes + emojis.
    ESTILOS.splice.apply(ESTILOS, [0, ESTILOS.length].concat(disenos, fuentes, emojis));
  })();

  /* --- “En tendencia”: los estilos más llamativos de cada familia. ---------
     Cada estilo marcado (destacado = true) muestra la etiqueta 🔥 Tendencia
     en la interfaz y se coloca AL PRINCIPIO de su lista. La lista de abajo
     es la curaduría; en cada página solo destacan los que existen en esa
     categoría. Añadir/quitar ids aquí es la única edición necesaria. */
  var DESTACADOS = [
    /* Estrellas de la página de carpintero (🔥). Como estos estilos solo
       existen en la categoría "carpintero", colocarlos al principio aquí
       solo reordena esa página: el resto del sitio queda igual. */
    "rotulo-plano", "brocha-gruesa", "esquinas-tecnicas", "esquinas-macizas",
    "taladrado", "barrotes", "nivel-superior", "cartelon",
    "mayus-obra", "doble-trazo-plano", "clavado", "entre-tablas",
    /* Estrella de las letras chidas: el etíope que va de moda */
    "etiope", "runas", "babel", "matrix", "flecha-punteada", "mezcla-editorial", "georgiano",
    // Marcos y diseños estrella
    "sello-gamer", "francotirador-gamer", "barra-poder", "espadas-gamer",
    "sello-divino", "marco-musical", "reina-corona", "cinta-floral",
    "estrellas-dobles", "corchetes-japoneses", "deco-1", "deco-2", "deco-3",
    // Alfabetos insignia
    "caja-mayus", "caja-negra-mayus", // <-- AÑADIDAS A TENDENCIAS
    "cursiva", "cursiva-negrita", "caligrafica", "gotica", "gotica-negrita",
    "negrita", "sans-negrita", "caligrafica-negrita", "doble-trazo", "mono",
    "ancho-completo", "versalitas", "superindice", "subindice",
    "circulo", "circulo-negro", "cuadro", "cuadro-negro", "carpintero",
    "rusa", "griega", "moneda", "neon", "codigo",
    "squiggle", "squiggle-2", "glitch-suave", "glitch",
    "invisible", "espacio-invisible"
  ];
  (function ordenarDestacados() {
    var top = [];
    var resto = [];
    for (var i = 0; i < ESTILOS.length; i++) {
      var e = ESTILOS[i];
      if (DESTACADOS.indexOf(e.id) !== -1) {
        e.destacado = true;
        top.push(e);
      } else {
        e.destacado = false;
        resto.push(e);
      }
    }
    // Dentro del bloque destacado se respeta el orden de DESTACADOS.
    top.sort(function (a, b) {
      return DESTACADOS.indexOf(a.id) - DESTACADOS.indexOf(b.id);
    });
    ESTILOS.splice.apply(ESTILOS, [0, ESTILOS.length].concat(top, resto));
  })();

  var SIMBOLOS = {
    aesthetic: ["\u2727", "\u2726", "\u00b7", "\u02da", "\u25e6", "\u273f", "\u2740", "\u2741", "\u274b", "\u2765", "\u2764", "\u273e", "\u2739", "\u273d", "\u2735", "\u2734", "\u2733", "\u272a", "\u2729", "\u2606", "\u2605", "\u25cf", "\u25cb", "\u25c6", "\u25c7", "\u25b2", "\u25bc", "\u2661", "\u2665", "\u266a", "\u266b", "\u2669", "\u267e", "\u2698", "\u2618", "\u269c", "\u2698", "\u274a", "\u2748", "\u2749", "\u2741", "\u274c", "\u263e", "\u263d", "\u22c6", "\u2736", "\u272d"],
    corazones: ["\u2665", "\u2661", "\u2764", "\u2763", "\u2765", "\u2766", "\u2767", "\ud83d\udc95", "\ud83d\udc96", "\ud83d\udc97", "\ud83d\udc93", "\ud83d\udc9e", "\ud83d\udc9f", "\ud83d\udc94", "\ud83e\udde1", "\ud83d\udc9b", "\ud83d\udc9a", "\ud83d\udc99", "\ud83d\udc9c", "\ud83e\udd0d", "\ud83d\udc98", "\ud83d\udc9d", "\ud83d\udc9f", "\ud83e\udde1"],
    flechas: ["\u2190", "\u2191", "\u2192", "\u2193", "\u2194", "\u21d2", "\u21d0", "\u27a4", "\u279c", "\u279e", "\u27b2", "\u21b0", "\u21b1", "\u21ba", "\u21bb", "\u2937", "\u2936", "\u2b05", "\u27a1", "\u2b06", "\u2b07"],
    juegos: ["\u2694", "\u2620", "\u265b", "\u265a", "\u26a1", "\u2764", "\u272a", "\u2735", "\u25c8", "\u2591", "\u2592", "\u2593", "\u3010", "\u3011", "\u30fb", "\uff9f", "\u2726", "\u2727", "\ud83d\udd25", "\ud83d\udc80", "\ud83c\udfae", "\ud83d\udc7e", "\ud83c\udfc6", "\ud83c\udfaf", "\ud83d\udd79", "\u26a1", "\ud83d\udc8e", "\ud83d\udee1\ufe0f"],
    kaomoji: ["(\u256f\u00b0\u25a1\u00b0)\u256f\ufe35 \u253b\u2501\u253b", "\u00af\\_(\u30c4)_/\u00af", "(\u3065\uffe3 \u00b3\uffe3)\u3065", "(\u25d5\u203f\u25d5)", "(\u256f\u2312\u25bd\u2312)\u256f", "\u0295\u2022\u1d25\u2022\u0294", "(\u3063\u25d4\u203f\u25d4)\u3063", "(\u2565\ufe4f\u2565)", "\u0295\u2022\u0361\u035c\u2022\u0294", "( \u0361\u00b0 \u035c\u0296 \u0361\u00b0)", "(\u2571\u2267\u2200\u2266)\u2571", "\u030c(\u00b0\u30ee\u00b0\u030c)", "(\uff89\u25d5\u30ee\u25d5)\uff89", "(\u2299_\u2299)", "( \u2022_\u2022)", "\u3064\u25d5_\u25d5\u3064", "(\u00b4\uff65\u03c9\uff65`)", "\u0295\u02d8\u25e1\u02d8\u0294", "(\uff89\u2267\u2207\u2266)\uff89", "\u2299\ufe4f\u2299", "(ᵔ◡ᵔ)", "ʕ•ᴥ•ʔ", "٩(◕‿◕)۶", "(づ｡◕‿‿◕｡)づ", "ヽ(•‿•)ノ", "(￣ω￣)", "ヘ(^_^ヘ)", "ᕦ(ò_óˇ)ᕤ", "(*˘︶˘*).｡.:*♡", "ヽ(=^･ω･^=)丿"],
    tristes: ["\u2639", "\ud83d\ude22", "\ud83d\ude2d", "\ud83d\udc94", "\ud83e\udd0d", "(\u2565\ufe4f\u2565)", "\u0ca5_\u0ca5", "(\u00b4\u2022\u3145\u2022`)", "\uff08\uff9f\u30fc\uff9f\uff09", "\u1552\u15dc\u1557", "\u2022\u203f\u2022", "\u0295\u2022\u0361\u035c\u2022\u0294", "T_T", "ಥ_ಥ", "(╥﹏╥)", "(´;ω;｀)", "｡･ﾟﾟ*(>д<)*ﾟﾟ･｡", "｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡"]
  };

  /* --- Estilos mixtos (opción “🎲 Estilos mixtos” del generador) ----------
     Combina alfabetos letra a letra o palabra a palabra, con o sin
     separadores decorativos. No viven en el catálogo normal: solo aparecen
     cuando el usuario activa la opción en la interfaz (app.js). */
  var MIXES = [
    { id: "mix-galaxia", nombre: "🎲 Mezcla galaxia ☄", fn: function (t) { return mezclarPalabras(t, ["sansCursiva", "dobleTrazo", "goticaNegrita"], "\u2604"); } },
    { id: "mix-nube", nombre: "🎲 Mezcla nube 🌙", fn: function (t) { return mezclarPalabras(t, ["caligrafica", "sans", "gotica"], "🌙"); } },
    { id: "mix-diamante", nombre: "🎲 Mezcla diamante ◆", fn: function (t) { return mezclarPalabras(t, ["dobleTrazo", "sansNegrita", "mono"], "\u25c6"); } },
    { id: "mix-nieve", nombre: "🎲 Mezcla nieve ❄", fn: function (t) { return mezclarPalabras(t, ["cursiva", "sansCursiva", "gotica"], "❄"); } },
    { id: "mix-corazon", nombre: "🎲 Mezcla corazón 💜", fn: function (t) { return mezclarPalabras(t, ["caligraficaNegrita", "rizada", "sansCursiva"], "💜"); } },
    { id: "mix-rey", nombre: "🎲 Mezcla real ♕", fn: function (t) { return mezclarPalabras(t, ["goticaNegrita", "caligrafica", "dobleTrazo"], "♕"); } },
    { id: "mix-arte", nombre: "🎲 Mezcla arte 🎨", fn: function (t) { return mezclarPalabras(t, ["sans", "cursiva", "caligrafica"], "🎨"); } },
    { id: "mix-infinito", nombre: "🎲 Mezcla infinito ♾", fn: function (t) { return mezclarPalabras(t, ["dobleTrazo", "cursivaNegrita", "sans"], "♾"); } },
    { id: "mix-oceano", nombre: "🎲 Mezcla océano 🌊", fn: function (t) { return mezclarPalabras(t, ["cursiva", "mono", "sansCursiva"], "🌊"); } },
    { id: "mix-fuego", nombre: "🎲 Mezcla fuego 🔱", fn: function (t) { return mezclarPalabras(t, ["gotica", "sansNegrita", "dobleTrazo"], "🔱"); } },
    { id: "mix-estrella", nombre: "🎲 Mezcla estrella ✵", fn: function (t) { return mezclarPalabras(t, ["caligrafica", "goticaNegrita", "mono"], "\u2735"); } },
    { id: "mix-flor", nombre: "🎲 Mezcla flor ❂", fn: function (t) { return mezclarPalabras(t, ["rizada", "dobleTrazo", "sansCursiva"], "\u2742"); } },
    { id: "mix-arcoiris", nombre: "🎲 Arcoíris de letras 🌈", fn: function (t) { return mezclarTexto(t, ["cursiva", "sans", "gotica", "dobleTrazo", "mono", "caligrafica"]); } },
    { id: "mix-cebra", nombre: "🎲 Cebra de letras", fn: function (t) { return mezclarTexto(t, ["sansNegrita", "sans"]); } },
    { id: "mix-doble-vida", nombre: "🎲 Doble vida", fn: function (t) { return mezclarTexto(t, ["dobleTrazo", "anchoCompleto"]); } },
    { id: "mix-cursti-tech", nombre: "🎲 Cursi-tech", fn: function (t) { return mezclarTexto(t, ["cursiva", "mono"]); } },
    { id: "mix-mistico", nombre: "🎲 Místico", fn: function (t) { return mezclarTexto(t, ["gotica", "rusa"]); } },
    { id: "mix-oriental", nombre: "🎲 Oriental mix", fn: function (t) { return mezclarTexto(t, ["oriental", "thai", "moneda"]); } },
    { id: "mix-gamer", nombre: "🎲 Mix gamer 🎮", fn: function (t) { return mezclarTexto(t, ["mono", "goticaNegrita", "sansNegrita"]); } },
    { id: "mix-neon", nombre: "🎲 Neón de noche", fn: function (t) { return mezclarTexto(t, ["neon", "sansNegrita"]); } },
    { id: "mix-minis", nombre: "🎲 Mini mix", fn: function (t) { return mezclarTexto(t, ["superindice", "subindice"]); } },
    { id: "mix-punk", nombre: "🎲 Burbuja punk", fn: function (t) { return mezclarTexto(t, ["circulo", "circuloNegro", "cuadroNegro"]); } },
    { id: "mix-corazones", nombre: "🎲 Corazones al centro ♥", fn: function (t) { return mezclarPalabras(t, ["sans", "cursiva"], "♥"); } },
    { id: "mix-leyenda", nombre: "🎲 Leyenda mixta", fn: function (t) { return "꧁༒☬ " + mezclarTexto(t, ["gotica", "dobleTrazo"]) + " ☬༒꧂"; } }
  ];

  /* --- Portada: orden curado de las fuentes que deben abrir cada página.
     Antes las páginas generales empezaban con marcos y adornos; ahora las
     primeras tarjetas son alfabetos de verdad. La página de carpintero
     conserva su propia curaduría. */
  var FUENTES_PORTADA = [
    /* Primer bloque: 60 estilos diversos que se pre-renderizan en la
       portada (cursivas, góticas, negritas, burbujas, decoradas, gamer,
       aesthetic, pequeñas, símbolos y efectos). */
    "cursiva", "caligrafica-negrita", "caligrafica", "cursiva-negrita",
    "gotica", "gotica-negrita", "negrita", "sans-negrita",
    "sans-cursiva-negrita", "sans-cursiva", "doble-trazo", "versalitas",
    "superindice", "subindice", "mono", "ancho-completo",
    "circulo", "circulo-negro", "cuadro", "cuadro-negro",
    "burbuja-pastel", "corazones-romanticos", "cursiva-brillante", "cursiva-lunar",
    "burbuja-cursiva", "burbuja-cursiva-espaciada", "burbuja-diseno",
    "burbuja-floral", "burbuja-reina", "flores-primavera", "sello-gamer", "alas-gamer", "corona-rey-gamer",
    "francotirador-gamer", "chola-1", "moneda", "oriental",
    "runas", "squiggle", "griega", "subrayado",
    "subrayado-doble", "tachado", "invertido", "parentesis-latinos",
    "glitch-suave", "gotica-oscura", "negrita-editorial", "caligrafica-lujo",
    "burbuja-espaciada", "burbuja-doble", "burbuja-graffiti", "burbuja-contorno",
    "burbuja-ancha", "burbuja-en-caja", "burbuja-espuma", "burbuja-destellos",
    "versalitas-elegantes", "doble-trazo-retro", "rusa", "neon",
    "codigo-simbolos", "armenio", "etiope", "cingales",
    /* Resto del catálogo curado. */
    "sans", "sans-futurista", "squiggle-2", "carpintero",
    "cursiva-romantica", "oriental-2", "rizadas", "onduladas",
    "demonico", "thai", "yi", "georgiano",
    "bengali", "hindi", "yi-2"
  ];

  function priorizarFuentes(lista) {
    var orden = {};
    var i;
    for (i = 0; i < FUENTES_PORTADA.length; i++) orden[FUENTES_PORTADA[i]] = i;
    var portada = [];
    var resto = [];
    for (i = 0; i < lista.length; i++) {
      if (Object.prototype.hasOwnProperty.call(orden, lista[i].id)) portada.push(lista[i]);
      else resto.push(lista[i]);
    }
    portada.sort(function (a, b) { return orden[a.id] - orden[b.id]; });
    return portada.concat(resto);
  }

  var API = {
    estilos: ESTILOS,
    simbolos: SIMBOLOS,
    /* Devuelve los estilos de una categoría (o todos) */
    porCategoria: function (cat) {
      var todas = !cat || cat === "todas" || cat === "all";
      var lista = todas ? [] : String(cat).split(",").map(function (c) { return c.trim(); });
      var resultado = todas ? ESTILOS.slice() : ESTILOS.filter(function (e) {
        for (var i = 0; i < lista.length; i++) {
          if (e.cat.indexOf(lista[i]) !== -1) return true;
        }
        return false;
      });
      if (lista.indexOf("carpintero") === -1) resultado = priorizarFuentes(resultado);
      return resultado;
    },
    /* Devuelve los estilos mixtos (opción “🎲 Estilos mixtos”) */
    mixtos: function () { return MIXES.slice(); },
    convertir: function (id, texto) {
      for (var i = 0; i < ESTILOS.length; i++) {
        if (ESTILOS[i].id === id) return ESTILOS[i].fn(texto);
      }
      return texto;
    }
  };

  global.LB = API;
})(window);