// Generado por scripts/generate-scenes.js a partir de assets/scenes/*.svg. No editar a mano.
import type { SceneData } from '../parts/sceneTypes';

export const SCENE_DATA: Record<string, SceneData> = {
  "verano-dia": {
    "sky": [
      "#4FC3F7",
      "#C6EEFC"
    ],
    "layers": [
      {
        "anim": null,
        "xml": "<defs><linearGradient id=\"skyV\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#4FC3F7\"/><stop offset=\"1\" stop-color=\"#C6EEFC\"/></linearGradient></defs><rect width=\"390\" height=\"210\" fill=\"url(#skyV)\"/>"
      },
      {
        "anim": "spin",
        "xml": "<g><g stroke=\"#FFC21A\" stroke-width=\"5\" stroke-linecap=\"round\"><path d=\"M292 18V28M292 96V106M248 62H258M326 62H336M261 31L268 38M316 86L323 93M261 93L268 86M316 38L323 31\"/></g></g>",
        "box": [
          244,
          14,
          96,
          96
        ]
      },
      {
        "anim": null,
        "xml": "<circle cx=\"292\" cy=\"62\" r=\"27\" fill=\"#FFD84D\" stroke=\"#FFB800\" stroke-width=\"3\"/><rect x=\"275\" y=\"52\" width=\"15\" height=\"10\" rx=\"4\" fill=\"#1F2937\"/><rect x=\"294\" y=\"52\" width=\"15\" height=\"10\" rx=\"4\" fill=\"#1F2937\"/><path d=\"M290 56H294\" stroke=\"#1F2937\" stroke-width=\"2.500\"/><path d=\"M283 70Q292 79 301 70\" fill=\"none\" stroke=\"#B45309\" stroke-width=\"3\" stroke-linecap=\"round\"/>"
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M30 52Q30 40 42 40Q46 28 60 30Q72 24 80 38Q94 38 94 52Z\" fill=\"#FFFFFF\" opacity=\".95\"/></g>",
        "box": [
          26,
          24.2,
          72,
          31.8
        ]
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M168 36Q168 28 176 28Q180 20 190 22Q198 18 204 28Q214 28 214 36Z\" fill=\"#FFFFFF\" opacity=\".9\"/></g>",
        "box": [
          164,
          16.86,
          54,
          23.14
        ]
      },
      {
        "anim": "waveB",
        "xml": "<g><path d=\"M-60 172q15 -12 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V230H-60Z\" fill=\"#35B0EA\"/></g>",
        "box": [
          -64,
          162,
          518,
          72
        ]
      },
      {
        "anim": "waveA",
        "xml": "<g><path d=\"M-60 184q15 -12 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V230H-60Z\" fill=\"#82D6F5\"/><path d=\"M-60 184q15 -12 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"3\" stroke-linecap=\"round\"/></g>",
        "box": [
          -64,
          174,
          518,
          60
        ]
      },
      {
        "anim": null,
        "xml": "<defs><clipPath id=\"domeV\"><path d=\"M290 126Q296 80 336 76Q376 80 382 126Q368 116 359 126Q347 116 336 126Q325 116 313 126Q302 116 290 126Z\"/></clipPath></defs><path d=\"M0 204Q90 190 200 200T390 194V230H0Z\" fill=\"#FFEFC4\"/><path d=\"M330 206L338 120\" stroke=\"#8B5A2B\" stroke-width=\"4\" stroke-linecap=\"round\"/><g clip-path=\"url(#domeV)\"><rect x=\"280\" y=\"70\" width=\"110\" height=\"60\" fill=\"#FFFFFF\"/><path d=\"M336 70L280 130H313ZM336 70L336 130H359ZM336 70L382 130H395Z\" fill=\"#FF5A4F\"/></g><path d=\"M290 126Q296 80 336 76Q376 80 382 126Q368 116 359 126Q347 116 336 126Q325 116 313 126Q302 116 290 126Z\" fill=\"none\" stroke=\"#C93A30\" stroke-width=\"2\" stroke-linejoin=\"round\"/>"
      },
      {
        "anim": "bob",
        "xml": "<g><circle cx=\"296\" cy=\"200\" r=\"9\" fill=\"#FFFFFF\" stroke=\"#1F2937\" stroke-width=\"1.500\"/><path d=\"M296 191A9 9 0 0 1 305 200L296 200Z\" fill=\"#FF5A4F\"/><path d=\"M296 209A9 9 0 0 1 287 200L296 200Z\" fill=\"#2F80ED\"/></g>",
        "box": [
          283,
          187,
          26,
          26
        ]
      }
    ]
  },
  "verano-noche": {
    "sky": [
      "#1B1B4B",
      "#6A3F8F"
    ],
    "layers": [
      {
        "anim": null,
        "xml": "<defs><linearGradient id=\"skyVN\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1B1B4B\"/><stop offset=\"1\" stop-color=\"#6A3F8F\"/></linearGradient></defs><rect width=\"390\" height=\"210\" fill=\"url(#skyVN)\"/>"
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"40\" cy=\"34\" r=\"1.800\"/></g>",
        "box": [
          34.2,
          28.2,
          11.6,
          11.6
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"96\" cy=\"72\" r=\"1.500\"/></g>",
        "box": [
          90.5,
          66.5,
          11,
          11
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"150\" cy=\"30\" r=\"2\"/></g>",
        "box": [
          144,
          24,
          12,
          12
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"206\" cy=\"66\" r=\"1.500\"/></g>",
        "box": [
          200.5,
          60.5,
          11,
          11
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"236\" cy=\"26\" r=\"1.800\"/></g>",
        "box": [
          230.2,
          20.2,
          11.6,
          11.6
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"372\" cy=\"92\" r=\"1.600\"/></g>",
        "box": [
          366.4,
          86.4,
          11.2,
          11.2
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"126\" cy=\"108\" r=\"1.500\"/></g>",
        "box": [
          120.5,
          102.5,
          11,
          11
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFF2B8\"><circle cx=\"14\" cy=\"96\" r=\"1.600\"/></g>",
        "box": [
          8.4,
          90.4,
          11.2,
          11.2
        ]
      },
      {
        "anim": null,
        "xml": "<circle cx=\"292\" cy=\"60\" r=\"34\" fill=\"#FFF2B8\" opacity=\".12\"/><path d=\"M292 34A26 26 0 1 0 318 70A21 21 0 1 1 292 34Z\" fill=\"#FFF2B8\"/>"
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M30 56Q30 46 40 46Q44 36 56 38Q66 32 74 44Q86 44 86 56Z\" fill=\"#3A2F75\" opacity=\".85\"/></g>",
        "box": [
          26,
          32,
          64,
          28
        ]
      },
      {
        "anim": "waveB",
        "xml": "<g><path d=\"M-60 172q15 -12 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V230H-60Z\" fill=\"#2B3E9C\"/></g>",
        "box": [
          -64,
          162,
          518,
          72
        ]
      },
      {
        "anim": "waveA",
        "xml": "<g><path d=\"M-60 184q15 -12 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V230H-60Z\" fill=\"#3F5BD0\"/><path d=\"M-60 184q15 -12 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0\" fill=\"none\" stroke=\"#9FB4FF\" stroke-width=\"3\" stroke-linecap=\"round\" opacity=\".8\"/></g>",
        "box": [
          -64,
          174,
          518,
          60
        ]
      },
      {
        "anim": null,
        "xml": "<defs><clipPath id=\"domeVN\"><path d=\"M290 126Q296 80 336 76Q376 80 382 126Q368 116 359 126Q347 116 336 126Q325 116 313 126Q302 116 290 126Z\"/></clipPath></defs><path d=\"M0 204Q90 190 200 200T390 194V230H0Z\" fill=\"#1A1633\"/><path d=\"M330 206L338 120\" stroke=\"#6B4A2B\" stroke-width=\"4\" stroke-linecap=\"round\"/><g clip-path=\"url(#domeVN)\"><rect x=\"280\" y=\"70\" width=\"110\" height=\"60\" fill=\"#FFE9B0\"/><path d=\"M336 70L280 130H313ZM336 70L336 130H359ZM336 70L382 130H395Z\" fill=\"#FF8A3D\"/></g><path d=\"M290 126Q296 80 336 76Q376 80 382 126Q368 116 359 126Q347 116 336 126Q325 116 313 126Q302 116 290 126Z\" fill=\"none\" stroke=\"#C4621F\" stroke-width=\"2\" stroke-linejoin=\"round\"/><circle cx=\"296\" cy=\"200\" r=\"9\" fill=\"#E8E4F5\" stroke=\"#1F2937\" stroke-width=\"1.500\"/><path d=\"M296 191A9 9 0 0 1 305 200L296 200Z\" fill=\"#E0565B\"/><path d=\"M296 209A9 9 0 0 1 287 200L296 200Z\" fill=\"#3F6FD0\"/>"
      },
      {
        "anim": "twinkle",
        "xml": "<circle cx=\"236\" cy=\"198\" r=\"22\" fill=\"#FF8A3D\" opacity=\".22\"/>",
        "box": [
          210,
          172,
          52,
          52
        ]
      },
      {
        "anim": null,
        "xml": "<path d=\"M222 204L250 198M222 198L250 204\" stroke=\"#6B3E1B\" stroke-width=\"4\" stroke-linecap=\"round\"/>"
      },
      {
        "anim": "bob",
        "xml": "<g><path d=\"M236 196Q226 188 232 180Q234 186 238 184Q236 176 242 170Q244 180 248 184Q252 190 246 196Z\" fill=\"#FF8A3D\"/><path d=\"M237 196Q232 190 237 186Q239 190 241 188Q244 192 241 196Z\" fill=\"#FFD84D\"/></g>",
        "box": [
          225.75,
          166,
          27.85,
          34
        ]
      }
    ]
  },
  "entretiempo-dia": {
    "sky": [
      "#FFA94D",
      "#FFE2B5"
    ],
    "layers": [
      {
        "anim": null,
        "xml": "<defs><linearGradient id=\"skyO\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#FFA94D\"/><stop offset=\"1\" stop-color=\"#FFE2B5\"/></linearGradient></defs><rect width=\"390\" height=\"210\" fill=\"url(#skyO)\"/><circle cx=\"110\" cy=\"158\" r=\"46\" fill=\"#FFD27A\" opacity=\".9\"/>"
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M200 52Q200 42 210 42Q214 32 226 34Q236 28 244 40Q256 40 256 52Z\" fill=\"#FFF1DC\" opacity=\".9\"/></g>",
        "box": [
          196,
          28,
          64,
          28
        ]
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M30 80Q30 72 38 72Q42 64 52 66Q60 62 66 72Q76 72 76 80Z\" fill=\"#FFF1DC\" opacity=\".85\"/></g>",
        "box": [
          26,
          60.86,
          54,
          23.14
        ]
      },
      {
        "anim": null,
        "xml": "<path d=\"M0 156Q80 128 170 150T390 140V230H0Z\" fill=\"#F4A261\"/><path d=\"M0 176Q110 152 220 172T390 164V230H0Z\" fill=\"#E76F51\"/><path d=\"M0 204Q90 192 200 200T390 196V230H0Z\" fill=\"#FFE9CC\"/><rect x=\"316\" y=\"122\" width=\"11\" height=\"78\" rx=\"4\" fill=\"#8B4513\"/><circle cx=\"321\" cy=\"104\" r=\"26\" fill=\"#E8590C\"/><circle cx=\"298\" cy=\"118\" r=\"18\" fill=\"#F59E0B\"/><circle cx=\"346\" cy=\"116\" r=\"20\" fill=\"#D9480F\"/><circle cx=\"321\" cy=\"84\" r=\"18\" fill=\"#F59E0B\"/><circle cx=\"312\" cy=\"98\" r=\"5\" fill=\"#FFB347\" opacity=\".7\"/><ellipse cx=\"270\" cy=\"198\" rx=\"14\" ry=\"11\" fill=\"#FF8A1F\"/><path d=\"M262 198Q270 190 278 198M266 190Q262 198 266 206M274 190Q278 198 274 206\" fill=\"none\" stroke=\"#E56B00\" stroke-width=\"1.500\"/><path d=\"M270 188V183\" stroke=\"#2F7D32\" stroke-width=\"3\" stroke-linecap=\"round\"/>"
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(50 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#E8590C\"/></g></g>",
        "box": [
          46,
          -7.5,
          23,
          15
        ]
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(140 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#F59E0B\"/></g></g>",
        "box": [
          136,
          -7.5,
          23,
          15
        ]
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(220 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#C2410C\"/></g></g>",
        "box": [
          216,
          -7.5,
          23,
          15
        ]
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(270 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#D9480F\"/></g></g>",
        "box": [
          266,
          -7.5,
          23,
          15
        ]
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(350 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#F59E0B\"/></g></g>",
        "box": [
          346,
          -7.5,
          23,
          15
        ]
      }
    ]
  },
  "entretiempo-noche": {
    "sky": [
      "#1F1830",
      "#7A3A33"
    ],
    "layers": [
      {
        "anim": null,
        "xml": "<defs><linearGradient id=\"skyON\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1F1830\"/><stop offset=\"1\" stop-color=\"#7A3A33\"/></linearGradient></defs><rect width=\"390\" height=\"210\" fill=\"url(#skyON)\"/>"
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFE0B8\"><circle cx=\"30\" cy=\"30\" r=\"1.600\"/></g>",
        "box": [
          24.4,
          24.4,
          11.2,
          11.2
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFE0B8\"><circle cx=\"190\" cy=\"26\" r=\"1.800\"/></g>",
        "box": [
          184.2,
          20.2,
          11.6,
          11.6
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFE0B8\"><circle cx=\"250\" cy=\"70\" r=\"1.500\"/></g>",
        "box": [
          244.5,
          64.5,
          11,
          11
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFE0B8\"><circle cx=\"364\" cy=\"30\" r=\"1.600\"/></g>",
        "box": [
          358.4,
          24.4,
          11.2,
          11.2
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#FFE0B8\"><circle cx=\"58\" cy=\"92\" r=\"1.500\"/></g>",
        "box": [
          52.5,
          86.5,
          11,
          11
        ]
      },
      {
        "anim": null,
        "xml": "<circle cx=\"110\" cy=\"122\" r=\"52\" fill=\"#FFB347\" opacity=\".18\"/><circle cx=\"110\" cy=\"122\" r=\"40\" fill=\"#FFB347\"/><circle cx=\"96\" cy=\"112\" r=\"7\" fill=\"#F59E0B\" opacity=\".5\"/><circle cx=\"124\" cy=\"130\" r=\"9\" fill=\"#F59E0B\" opacity=\".45\"/><circle cx=\"112\" cy=\"140\" r=\"4\" fill=\"#F59E0B\" opacity=\".5\"/>"
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M70 40l8 -6 8 6 8 -6 8 6 -8 4z\" fill=\"#12091A\" transform=\"translate(120 20)\"/></g>",
        "box": [
          186,
          50,
          40,
          18
        ]
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M70 40l8 -6 8 6 8 -6 8 6 -8 4z\" fill=\"#12091A\" transform=\"translate(200 60) scale(.8)\"/></g>",
        "box": [
          252,
          83.2,
          33.6,
          16
        ]
      },
      {
        "anim": null,
        "xml": "<path d=\"M0 156Q80 130 170 152T390 142V230H0Z\" fill=\"#4A2430\"/><path d=\"M0 176Q110 154 220 174T390 166V230H0Z\" fill=\"#38202B\"/><path d=\"M0 204Q90 192 200 200T390 196V230H0Z\" fill=\"#1E1219\"/><rect x=\"316\" y=\"122\" width=\"11\" height=\"78\" rx=\"4\" fill=\"#5A3418\"/><circle cx=\"321\" cy=\"104\" r=\"26\" fill=\"#B8430E\"/><circle cx=\"298\" cy=\"118\" r=\"18\" fill=\"#C47A0B\"/><circle cx=\"346\" cy=\"116\" r=\"20\" fill=\"#9A3412\"/><circle cx=\"321\" cy=\"84\" r=\"18\" fill=\"#C47A0B\"/>"
      },
      {
        "anim": "twinkle",
        "xml": "<circle cx=\"270\" cy=\"198\" r=\"24\" fill=\"#FFB347\" opacity=\".25\"/>",
        "box": [
          242,
          170,
          56,
          56
        ]
      },
      {
        "anim": null,
        "xml": "<ellipse cx=\"270\" cy=\"198\" rx=\"14\" ry=\"11\" fill=\"#FF8A1F\"/><path d=\"M263 194L267 190L271 194ZM271 194L275 190L279 194Z\" fill=\"#FFF0A8\"/><path d=\"M263 201L266 204L269 201L272 204L275 201L278 204\" fill=\"none\" stroke=\"#FFF0A8\" stroke-width=\"1.500\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M270 188V183\" stroke=\"#2F7D32\" stroke-width=\"3\" stroke-linecap=\"round\"/>"
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(60 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#B8430E\"/></g></g>",
        "box": [
          56,
          -7.5,
          23,
          15
        ]
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(170 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#C47A0B\"/></g></g>",
        "box": [
          166,
          -7.5,
          23,
          15
        ]
      },
      {
        "anim": "fall",
        "xml": "<g transform=\"translate(290 0)\"><g><path d=\"M0 0Q8 -7 15 0Q8 7 0 0Z\" fill=\"#9A3412\"/></g></g>",
        "box": [
          286,
          -7.5,
          23,
          15
        ]
      }
    ]
  },
  "invierno-dia": {
    "sky": [
      "#8FCBEF",
      "#E4F3FB"
    ],
    "layers": [
      {
        "anim": null,
        "xml": "<defs><linearGradient id=\"skyI\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#8FCBEF\"/><stop offset=\"1\" stop-color=\"#E4F3FB\"/></linearGradient></defs><rect width=\"390\" height=\"210\" fill=\"url(#skyI)\"/><circle cx=\"296\" cy=\"52\" r=\"20\" fill=\"#FFF6C8\" opacity=\".9\"/>"
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M20 60Q20 50 30 50Q34 40 46 42Q56 36 64 48Q76 48 76 60Z\" fill=\"#FFFFFF\" opacity=\".95\"/></g>",
        "box": [
          16,
          36,
          64,
          28
        ]
      },
      {
        "anim": "drift",
        "xml": "<g><path d=\"M150 40Q150 32 158 32Q162 24 172 26Q180 22 186 32Q196 32 196 40Z\" fill=\"#FFFFFF\" opacity=\".9\"/></g>",
        "box": [
          146,
          20.86,
          54,
          23.14
        ]
      },
      {
        "anim": null,
        "xml": "<path d=\"M0 162Q90 136 190 158T390 148V230H0Z\" fill=\"#D7ECF8\"/><path d=\"M0 182Q110 160 220 178T390 170V230H0Z\" fill=\"#FFFFFF\"/><path d=\"M0 204Q90 192 200 200T390 196V230H0Z\" fill=\"#EAF5FC\"/><rect x=\"244\" y=\"176\" width=\"6\" height=\"22\" fill=\"#8B5A2B\"/><path d=\"M247 120L226 156H268ZM247 140L222 178H272Z\" fill=\"#2F7D5B\"/><path d=\"M247 120L238 134Q247 130 256 134ZM247 140L234 160Q247 155 260 160Z\" fill=\"#FFFFFF\"/><circle cx=\"345\" cy=\"184\" r=\"17\" fill=\"#FFFFFF\" stroke=\"#BFDDF0\" stroke-width=\"1.500\"/><circle cx=\"345\" cy=\"160\" r=\"13\" fill=\"#FFFFFF\" stroke=\"#BFDDF0\" stroke-width=\"1.500\"/><circle cx=\"345\" cy=\"140\" r=\"10\" fill=\"#FFFFFF\" stroke=\"#BFDDF0\" stroke-width=\"1.500\"/><circle cx=\"341\" cy=\"138\" r=\"1.600\" fill=\"#1F2937\"/><circle cx=\"349\" cy=\"138\" r=\"1.600\" fill=\"#1F2937\"/><path d=\"M345 141L356 143L345 145Z\" fill=\"#FF8A1F\"/><rect x=\"335\" y=\"147\" width=\"20\" height=\"5\" rx=\"2.500\" fill=\"#E63946\"/><path d=\"M351 150V162\" stroke=\"#E63946\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"345\" cy=\"164\" r=\"1.500\" fill=\"#1F2937\"/><circle cx=\"345\" cy=\"172\" r=\"1.500\" fill=\"#1F2937\"/><path d=\"M332 158L318 150M358 158L372 150\" stroke=\"#8B5A2B\" stroke-width=\"2.500\" stroke-linecap=\"round\"/><rect x=\"335\" y=\"129\" width=\"20\" height=\"4\" rx=\"2\" fill=\"#1F2937\"/><rect x=\"339\" y=\"119\" width=\"12\" height=\"11\" rx=\"2\" fill=\"#1F2937\"/>"
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(30 0)\"><g><circle r=\"3\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          23,
          -7,
          14,
          14
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(80 0)\"><g><circle r=\"2.500\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          73.5,
          -6.5,
          13,
          13
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(130 0)\"><g><circle r=\"3.500\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          122.5,
          -7.5,
          15,
          15
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(180 0)\"><g><circle r=\"2.500\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          173.5,
          -6.5,
          13,
          13
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(230 0)\"><g><circle r=\"3\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          223,
          -7,
          14,
          14
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(290 0)\"><g><circle r=\"3.500\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          282.5,
          -7.5,
          15,
          15
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(330 0)\"><g><circle r=\"2.500\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          323.5,
          -6.5,
          13,
          13
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(370 0)\"><g><circle r=\"3\" fill=\"#FFFFFF\"/></g></g>",
        "box": [
          363,
          -7,
          14,
          14
        ]
      }
    ]
  },
  "invierno-noche": {
    "sky": [
      "#0B1B3A",
      "#274B7A"
    ],
    "layers": [
      {
        "anim": null,
        "xml": "<defs><linearGradient id=\"skyIN\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#0B1B3A\"/><stop offset=\"1\" stop-color=\"#274B7A\"/></linearGradient></defs><rect width=\"390\" height=\"210\" fill=\"url(#skyIN)\"/>"
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#EAF4FF\"><circle cx=\"34\" cy=\"28\" r=\"1.800\"/></g>",
        "box": [
          28.2,
          22.2,
          11.6,
          11.6
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#EAF4FF\"><circle cx=\"140\" cy=\"56\" r=\"1.500\"/></g>",
        "box": [
          134.5,
          50.5,
          11,
          11
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#EAF4FF\"><circle cx=\"210\" cy=\"24\" r=\"2\"/></g>",
        "box": [
          204,
          18,
          12,
          12
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#EAF4FF\"><circle cx=\"260\" cy=\"84\" r=\"1.500\"/></g>",
        "box": [
          254.5,
          78.5,
          11,
          11
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#EAF4FF\"><circle cx=\"360\" cy=\"24\" r=\"1.700\"/></g>",
        "box": [
          354.3,
          18.3,
          11.4,
          11.4
        ]
      },
      {
        "anim": "twinkle",
        "xml": "<g fill=\"#EAF4FF\"><circle cx=\"20\" cy=\"88\" r=\"1.500\"/></g>",
        "box": [
          14.5,
          82.5,
          11,
          11
        ]
      },
      {
        "anim": "aurora",
        "xml": "<g><path d=\"M-20 60Q60 30 140 56T300 44T420 52V80Q340 66 270 78T130 82T-20 84Z\" fill=\"#3DDC97\" opacity=\".3\"/></g>",
        "box": [
          -24,
          22.81,
          448,
          66.39
        ]
      },
      {
        "anim": "aurora",
        "xml": "<g><path d=\"M-20 80Q80 56 160 76T320 66T420 76V96Q340 86 260 98T120 100T-20 102Z\" fill=\"#7C5CFF\" opacity=\".25\"/></g>",
        "box": [
          -24,
          49.14,
          448,
          59.4
        ]
      },
      {
        "anim": null,
        "xml": "<circle cx=\"80\" cy=\"50\" r=\"28\" fill=\"#F4F7FF\" opacity=\".12\"/><circle cx=\"80\" cy=\"50\" r=\"16\" fill=\"#F4F7FF\"/><circle cx=\"75\" cy=\"46\" r=\"3\" fill=\"#D5DEF0\"/><circle cx=\"85\" cy=\"55\" r=\"2\" fill=\"#D5DEF0\"/><path d=\"M0 162Q90 136 190 158T390 148V230H0Z\" fill=\"#5A86B3\"/><path d=\"M0 182Q110 160 220 178T390 170V230H0Z\" fill=\"#CFE2F3\"/><path d=\"M0 204Q90 192 200 200T390 196V230H0Z\" fill=\"#0E1C33\"/><rect x=\"244\" y=\"176\" width=\"6\" height=\"22\" fill=\"#4A3320\"/><path d=\"M247 120L226 156H268ZM247 140L222 178H272Z\" fill=\"#1F5A47\"/><path d=\"M247 120L238 134Q247 130 256 134ZM247 140L234 160Q247 155 260 160Z\" fill=\"#E8F2FA\"/><circle cx=\"345\" cy=\"184\" r=\"17\" fill=\"#E8F2FA\" stroke=\"#7FA6CC\" stroke-width=\"1.500\"/><circle cx=\"345\" cy=\"160\" r=\"13\" fill=\"#E8F2FA\" stroke=\"#7FA6CC\" stroke-width=\"1.500\"/><circle cx=\"345\" cy=\"140\" r=\"10\" fill=\"#E8F2FA\" stroke=\"#7FA6CC\" stroke-width=\"1.500\"/><circle cx=\"341\" cy=\"138\" r=\"1.600\" fill=\"#1F2937\"/><circle cx=\"349\" cy=\"138\" r=\"1.600\" fill=\"#1F2937\"/><path d=\"M345 141L356 143L345 145Z\" fill=\"#FF8A1F\"/><rect x=\"335\" y=\"147\" width=\"20\" height=\"5\" rx=\"2.500\" fill=\"#E63946\"/><path d=\"M351 150V162\" stroke=\"#E63946\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"345\" cy=\"164\" r=\"1.500\" fill=\"#1F2937\"/><circle cx=\"345\" cy=\"172\" r=\"1.500\" fill=\"#1F2937\"/><path d=\"M332 158L318 150M358 158L372 150\" stroke=\"#8B5A2B\" stroke-width=\"2.500\" stroke-linecap=\"round\"/><rect x=\"335\" y=\"129\" width=\"20\" height=\"4\" rx=\"2\" fill=\"#1F2937\"/><rect x=\"339\" y=\"119\" width=\"12\" height=\"11\" rx=\"2\" fill=\"#1F2937\"/>"
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(40 0)\"><g><circle r=\"3\" fill=\"#EAF4FF\"/></g></g>",
        "box": [
          33,
          -7,
          14,
          14
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(120 0)\"><g><circle r=\"2.500\" fill=\"#EAF4FF\"/></g></g>",
        "box": [
          113.5,
          -6.5,
          13,
          13
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(200 0)\"><g><circle r=\"3.500\" fill=\"#EAF4FF\"/></g></g>",
        "box": [
          192.5,
          -7.5,
          15,
          15
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(290 0)\"><g><circle r=\"2.500\" fill=\"#EAF4FF\"/></g></g>",
        "box": [
          283.5,
          -6.5,
          13,
          13
        ]
      },
      {
        "anim": "snow",
        "xml": "<g transform=\"translate(370 0)\"><g><circle r=\"3\" fill=\"#EAF4FF\"/></g></g>",
        "box": [
          363,
          -7,
          14,
          14
        ]
      }
    ]
  }
};
