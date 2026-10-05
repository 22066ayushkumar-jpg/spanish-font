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

  function aplicar(mapa) {
    return function (texto) {
      var salida = "";
      var chars = Array.from(texto);
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i];
        salida += Object.prototype.hasOwnProperty.call(mapa, c) ? mapa[c] : c;
      }
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
  M.caligraficaNegrita = porRango(0x1d4d0, 0x1d4ea);
  M.gotica = porRango(0x1d504, 0x1d51e, null, {
    C: "\u212d", H: "\u210c", I: "\u2111", R: "\u211c", Z: "\u2128"
  });
  M.goticaNegrita = porRango(0x1d56c, 0x1d586);
  M.dobleTrazo = porRango(0x1d538, 0x1d552, 0x1d7d8, {
    C: "\u2102", H: "\u210d", N: "\u2115", P: "\u2119", Q: "\u211a",
    R: "\u211d", Z: "\u2124"
  });
  M.sans = porRango(0x1d5a0, 0x1d5ba, 0x1d7e2);
  M.sansNegrita = porRango(0x1d5d4, 0x1d5ee, 0x1d7ec);
  M.sansCursiva = porRango(0x1d608, 0x1d622, 0x1d7e2);
  M.sansCursivaNegrita = porRango(0x1d63c, 0x1d656, 0x1d7ec);
  M.mono = porRango(0x1d670, 0x1d68a, 0x1d7f6);
  M.circulo = porRango(0x24b6, 0x24d0, 0x2460, { 0: "\u24ea" });
  M.circuloNegro = porRango(0x1f150, 0x1f150, null, {});
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
    "abcdefghijklmnopqrstuvwxyz",
    "\u1d00\u0299\u1d04\u1d05\u1d07\ua730\u0262\u029c\u026a\u1d0a\u1d0b\u029f\u1d0d\u0274\u1d0f\u1d18\u01eb\u0280\ua731\u1d1b\u1d1c\u1d20\u1d21\u2093\u028f\u1d22"
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

  /* Tres mapas más del catálogo "clásico": mayúsculas angulares (Λ…),
     neón (ᗩᗷᑕ…) y código de símbolos (zodiaco + ajedrez + estrellas).
     Glifos Unicode estándar, técnica idéntica a los mapas de arriba. */
  M.angulares = porCadena(N52, "ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZ" + "ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZ");
  M.neon = porCadena(N52, "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ" + "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ");
  M.codigo = porCadena(N52, "♋♌♍♎♏♐♑♒♓♈♉♊♔♕♖♗♘♙♚♛♜♝♞♟✦✧" + "♋♌♍♎♏♐♑♒♓♈♉♊♔♕♖♗♘♙♚♛♜♝♞♟✦✧");

  /* Mezcla letra a letra: alterna alfabetos distintos dentro de un texto. */
  function mezclarTexto(texto, claves) {
    var salida = "";
    var chars = Array.from(String(texto).normalize("NFD"));
    var i = 0;
    for (var j = 0; j < chars.length; j++) {
      var c = chars[j];
      if (/\s/.test(c)) { salida += c; i++; continue; }
      var mapa = M[claves[i % claves.length]];
      salida += mapa && mapa[c] ? mapa[c] : c;
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
    { id: "caja-mayus", nombre: "Caja en mayúsculas", cat: ["caja", "comunes", "instagram", "facebook", "juegos", "discord"], fn: aplicar(M.cajaMayus) },
    { id: "caja-negra-mayus", nombre: "Caja negra mayúsculas", cat: ["caja", "negrita", "comunes", "instagram", "whatsapp", "discord"], fn: aplicar(M.cajaNegraMayus) },
    { id: "cursiva", nombre: "Cursiva", cat: ["cursiva", "comunes", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "chidas"], fn: aplicar(M.cursiva) },
    { id: "cursiva-negrita", nombre: "Cursiva negrita", cat: ["cursiva", "negrita", "comunes", "instagram", "whatsapp"], fn: aplicar(M.cursivaNegrita) },
    { id: "caligrafica", nombre: "Caligráfica", cat: ["cursiva", "decoradas", "bonitas", "instagram", "facebook"], fn: aplicar(M.caligrafica) },
    { id: "caligrafica-negrita", nombre: "Caligráfica negrita", cat: ["cursiva", "negrita", "decoradas", "bonitas"], fn: aplicar(M.caligraficaNegrita) },
    { id: "negrita", nombre: "Negrita", cat: ["negrita", "comunes", "instagram", "facebook", "whatsapp", "twitter"], fn: aplicar(M.negritaSerif) },
    { id: "sans-negrita", nombre: "Negrita sans", cat: ["negrita", "comunes", "twitter", "discord"], fn: aplicar(M.sansNegrita) },
    { id: "sans", nombre: "Sans", cat: ["comunes", "discord", "twitter"], fn: aplicar(M.sans) },
    { id: "sans-cursiva", nombre: "Sans cursiva", cat: ["cursiva", "comunes", "discord"], fn: aplicar(M.sansCursiva) },
    { id: "sans-cursiva-negrita", nombre: "Sans cursiva negrita", cat: ["cursiva", "negrita"], fn: aplicar(M.sansCursivaNegrita) },
    { id: "gotica", nombre: "Gótica", cat: ["goticas", "graffiti", "cholas", "juegos", "chidas", "instagram"], fn: aplicar(M.gotica) },
    { id: "gotica-negrita", nombre: "Gótica negrita", cat: ["goticas", "graffiti", "cholas", "juegos"], fn: aplicar(M.goticaNegrita) },
    { id: "doble-trazo", nombre: "Doble trazo", cat: ["comunes", "raras", "juegos", "discord"], fn: aplicar(M.dobleTrazo) },
    { id: "mono", nombre: "Monoespaciada", cat: ["comunes", "carpintero", "discord", "raras"], fn: aplicar(M.mono) },
    { id: "ancho-completo", nombre: "Ancho completo", cat: ["aesthetic", "raras", "juegos", "tiktok"], fn: aplicar(M.anchoCompleto) },
    { id: "circulo", nombre: "Burbuja", cat: ["burbuja", "bonitas", "instagram", "tiktok"], fn: aplicar(M.circulo) },
    { id: "circulo-negro", nombre: "Burbuja negra", cat: ["burbuja", "goticas", "juegos"], fn: aplicar(M.circuloNegro) },
    { id: "cuadro", nombre: "Caja simple", cat: ["caja", "juegos", "raras"], fn: aplicar(M.cuadro) },
    { id: "cuadro-negro", nombre: "Caja negra simple", cat: ["caja", "juegos", "goticas"], fn: aplicar(M.cuadroNegro) },
    { id: "versalitas", nombre: "Versalitas (pequeñas)", cat: ["pequena", "comunes", "aesthetic", "instagram"], fn: aplicar(M.versalitas) },
    { id: "superindice", nombre: "Superíndice (mini)", cat: ["pequena", "raras", "aesthetic"], fn: aplicar(M.superindice) },
    { id: "subindice", nombre: "Subíndice (mini)", cat: ["pequena", "raras"], fn: aplicar(M.subindice) },
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
    { id: "oriental", nombre: "Estilo oriental", cat: ["raras", "aesthetic", "tiktok", "juegos", "freefire", "chidas", "goticas"], fn: aplicar(M.oriental) },
    { id: "oriental-2", nombre: "Estilo oriental 2", cat: ["raras", "aesthetic", "tiktok", "juegos", "freefire", "chidas", "goticas"], fn: aplicar(M.oriental2) },
    { id: "moneda", nombre: "Letras de moneda", cat: ["raras", "feas", "juegos", "freefire", "chidas"], fn: aplicar(M.moneda) },
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
    { id: "caja-por-letra", nombre: "Caja por letra", cat: ["juegos", "freefire", "chidas", "caja", "raras", "comunes"], fn: function (t) { var s = "", cs = Array.from(t); for (var i = 0; i < cs.length; i++) { var c = cs[i]; s += /\s/.test(c) ? c : c + "\u20de"; } return s; } },

    /* --- Envoltorios tipo "premium" --- */
    { id: "estrellas-dobles", nombre: "Estrellas dobles ミ★", cat: ["decoradas", "bonitas", "instagram", "tiktok", "aesthetic", "comunes"], fn: bordear(["ミ★", "★彡"]) },
    { id: "cinta-floral", nombre: "Cinta floral", cat: ["decoradas", "bonitas", "aesthetic", "instagram", "facebook"], fn: bordear(["¸.·✩·.¸", "¸.·✩·.¸"]) },
    { id: "reina-corona", nombre: "Corona de reina", cat: ["decoradas", "bonitas", "instagram", "aesthetic"], fn: bordear(["╰•★★", "★★•╯"]) },

    /* --- Mezclas letra a letra --- */
    { id: "mezcla-1", nombre: "Mezcla clásica", cat: ["comunes", "bonitas", "decoradas", "aesthetic", "instagram", "facebook", "whatsapp", "twitter", "tiktok", "discord", "cursiva", "negrita", "juegos", "freefire", "chidas"], fn: function (t) { return mezclarTexto(t, ["cursiva", "sansCursiva", "mono", "dobleTrazo", "circulo"]); } },
    { id: "mezcla-2", nombre: "Mezcla gótica", cat: ["comunes", "goticas", "chidas", "juegos", "freefire", "graffiti", "cholas", "decoradas"], fn: function (t) { return mezclarTexto(t, ["gotica", "goticaNegrita", "caligrafica", "dobleTrazo"]); } },
    { id: "mezcla-3", nombre: "Mezcla gamer", cat: ["comunes", "juegos", "freefire", "chidas", "goticas", "discord"], fn: function (t) { return mezclarTexto(t, ["sansNegrita", "anchoCompleto", "mono", "negritaSerif"]); } },

    /* --- Alfabetos clásicos añadidos (angulares, neón, código) --- */
    { id: "angulares", nombre: "Mayúsculas angulares", cat: ["raras", "chidas", "juegos", "freefire", "goticas", "graffiti"], fn: aplicar(M.angulares) },
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
    { id: "mezcla-loca", nombre: "Mezcla loca", cat: ["comunes", "raras", "chidas", "juegos", "freefire", "aesthetic", "tiktok", "goticas"], fn: function (t) { return mezclarTexto(t, ["circulo", "moneda", "goticaNegrita", "oriental", "anchoCompleto", "neon", "armenio", "yi"]); } }
  ];

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

  var API = {
    estilos: ESTILOS,
    simbolos: SIMBOLOS,
    /* Devuelve los estilos de una categoría (o todos) */
    porCategoria: function (cat) {
      if (!cat || cat === "todas" || cat === "all") return ESTILOS.slice();
      var lista = String(cat).split(",").map(function (c) { return c.trim(); });
      return ESTILOS.filter(function (e) {
        for (var i = 0; i < lista.length; i++) {
          if (e.cat.indexOf(lista[i]) !== -1) return true;
        }
        return false;
      });
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