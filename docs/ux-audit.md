# Auditoría UX/UI de Placard (Pilchapp)

Fecha: 2026-11-17. Hecha por el agente ux-ui, solo revisión de código (sin dispositivo).
Las medidas en pt salen de sumar los estilos del código; lo que depende del render real se marca "a verificar en dispositivo".
Los contrastes se calcularon con los hex de los tokens.

---

## 0. Inventario de rutas, pantallas y modales

| Ruta / disparador | Pantalla o componente real |
|---|---|
| `src/app/_layout.tsx` | Stack raíz con `Stack.Protected` (con o sin sesión) |
| `src/app/(auth)/login.tsx` | `SignInScreen` (mascota `MascotAvatar` + `AuthScaffold` + `AuthTextField`) |
| `src/app/(auth)/registro.tsx` | `SignUpScreen` (+ estado interno `CheckYourEmail`, + `SexPicker`) |
| `src/app/(tabs)/_layout.tsx` | Tab bar (Pilchapp, Outfits, Inspiración, Guardados) + `FloatingThemeToggle` |
| `src/app/(tabs)/index.tsx` | `PlacardScreen` ("Mi Pilchapp": `SeasonScene`, `SeasonFilter`, `CategoryFilter`, `GarmentCard`, `AddGarmentCard`) |
| `src/app/(tabs)/outfits.tsx` | `OutfitsScreen` (`OutfitDeck`, `StyleCarousel`, `StyleDetailCard`, `StyleVariantsSection`) |
| `src/app/(tabs)/inspiracion.tsx` | `InspirationScreen` (`ReferenteFilter`, `DestacadoCard`, `ReferenteRow`) |
| `src/app/(tabs)/guardados.tsx` | `SavedOutfitsScreen` (`SavedFilters`, `SavedOutfitCard`, `SavedEmptyState`, `UndoToast`) |
| `src/app/add-garment.tsx` (modal) | `AddGarmentScreen` → `GarmentForm` |
| `src/app/garment/[id].tsx` (modal) | `EditGarmentScreen` → `GarmentForm` + "Borrar prenda" |
| `src/app/inspiracion/[id].tsx` | `ReferenteDetailScreen` (`ReferenteLooks` con visor a pantalla completa, `ReferenteGarmentGrid`) |
| `src/app/perfil.tsx` | `ProfileScreen` (`IdentityCard` con edición inline, `WardrobeSummary`, `StylePreferencesCard`, `PillSwitch`) |
| Hoja "Por qué combinan" | `OutfitExplanationModal`, se abre desde el mazo (botón i) y desde Guardados (tocar la tarjeta) |
| Alertas del sistema | `confirmDestructive` (cerrar sesión, eliminar cuenta, borrar prenda) y Alert "Olvidé mi contraseña" |
| Código sin usar | `src/presentation/screens/ComingSoonScreen.tsx`: no lo importa nadie |

---

## 1. Las 5 mejoras de mayor impacto

1. **Outfits en un iPhone chico o mediano: los botones y la ayuda quedan bajo la tab bar y el toggle.** El mazo tiene alto fijo (`CARD_HEIGHT 372 + SHOE_EXTRA 30 + STACK_PEEK 28` más márgenes de 24 y 22). Arriba suman el subtítulo y el rótulo "Outfits según combinación de color", que en 375 pt pasan a 2 líneas cada uno. En un 375×667 la carta termina en y≈619, justo donde empieza la tab bar (618), y los botones Otra idea / Guardar / Por qué quedan enteros debajo del pliegue. En un 393×852 la ayuda ("Deslizá a la derecha…", 2 líneas) cae en y≈743–787 y la tab bar empieza en 769: se ve cortada. Además el toggle flotante (x 329–377, y 705–753) le tapa el borde derecho.
2. **Estados vacíos sin acción**: Outfits ("Todavía no hay combinaciones"), Pilchapp con filtros (sin "Ver todo"), Inspiración con un filtro sin resultados (pantalla en blanco) y Variantes ("Todavía no tenés prendas de este estilo.").
3. **Agregar una prenda queda al final de la grilla** (`PlacardScreen.tsx:138`). Con 30 prendas hay que scrollear todo el placard.
4. **Zonas táctiles chicas en el formulario de prenda**: `SegmentedControl` 28 pt; "Usar" de la IA y "Cancelar" ≈36–38 pt; botón de `StateMessage` ("Reintentar") 40 pt.
5. **Textos que confunden o llevan a callejones sin salida**: "Olvidé mi contraseña" abre un aviso de "no disponible"; el login dice "Placard" y el resto "Pilchapp"; cerrar sesión dice que los datos "siguen guardados en este teléfono" (están en la nube); controles de "próximamente" (compartir, marca de agua, "Ciudad y clima"); faltan confirmaciones al descartar un formulario con datos.

---

## 2. Detalle por pantalla

### Login (`SignInScreen`) y Registro (`SignUpScreen`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| "Olvidé mi contraseña" abre un Alert que dice que no está disponible | Callejón sin salida en el momento de más frustración | Corto plazo: ocultar el link. Después: `resetPasswordForEmail` de Supabase (gratis) | Media | Chico / Medio | ajuste (ocultar) o feature | `SignInScreen.tsx:46` · `AuthScaffold` |
| Título "Iniciá sesión en Placard" cuando la app se llama Pilchapp | Marca inconsistente | "Iniciá sesión en Pilchapp" | Media | Chico | ajuste | `SignInScreen.tsx:38` |
| Campos con radio 8 y borde `swatchBorder` | Restos del diseño viejo | `AuthTextField.box` y `notice` a radio 14 | Baja | Chico | ajuste | `AuthTextField.tsx:103` · `AuthScaffold.tsx` |
| Aviso "Falta configurar Supabase…" es jerga | Solo lo ve el dev | Dejarlo así | Baja | – | – | `AuthScaffold.tsx` |
| Mascota, teclado, "Entrando…", errores con `accessibilityRole="alert"`, ojo de 44 pt, "Revisá tu correo" | – | **Está bien** | – | – | – | – |

### Pilchapp / inicio (`PlacardScreen`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| "Agregar prenda" va siempre al final de la grilla | Hay que scrollear todo | Botón "+" en el encabezado, o la tarjeta como primer ítem | Alta | Chico / Medio | diseño | `PlacardScreen.tsx:138` · `AddGarmentCard` |
| En 375×667 el encabezado ocupa casi la mitad (`SEASONS_TOP = 188`) | Se ven ~1,7 filas | `SEASONS_TOP` proporcional al alto | Media | Medio | diseño | `PlacardScreen.tsx:76, 207` |
| Vacío con filtros sin botón | El usuario no sabe salir del filtro | `actionLabel="Ver todo"` | Alta | Chico | ajuste | `PlacardScreen.tsx:180-185` · `StateMessage` |
| Placard vacío: la tarjeta dice "Agregar prenda / Subir más" | No tiene sentido con 0 prendas | "Subí tu primera prenda" + línea "Cargá tus prendas y te armamos outfits" | Media | Chico | ajuste | `AddGarmentCard.tsx:39` · `PlacardScreen` |
| Íconos outline también cuando la tab está activa | El activo depende solo del color | Variante rellena cuando `focused` | Baja | Chico | ajuste | `src/app/(tabs)/_layout.tsx:11-14` |
| Círculo de Verano elegido de día: `#FFD84D` sobre `#FFEFC4` = 1,21:1 | El elegido se distingue solo por ícono y texto | Borde más oscuro (design-system) | Baja | Chico | colores → design-system | `seasonThemes.ts:85` |
| Filtros, zonas táctiles, carga, error, `paddingBottom` 92 | – | **Está bien** | – | – | – | – |

### Carga y edición de prenda (`AddGarmentScreen`, `EditGarmentScreen`, `GarmentForm`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| `SegmentedControl` mide 28 pt | Se erra el toque | Segmento 40 + padding 2 = 44 | Alta | Chico | ajuste | `SegmentedControl.tsx:40` |
| "Usar" de sugerencias ≈36 pt | Acción clave de la IA | `minHeight: 44` | Media | Chico | ajuste | `GarmentForm.tsx:445, 563, 583, 604, 632, 658, 682, 703, 729` |
| "Cancelar" ≈38 pt | Zona chica | `sideSlot` con `minHeight: 44` | Media | Chico | ajuste | `GarmentForm.tsx:416, 775-776` |
| Cancelar (o bajar el modal) descarta todo sin preguntar | Se pierde lo cargado | Confirmar si hay cambios; para el gesto, `usePreventRemove` | Media | Medio | ajuste | `GarmentForm.tsx:416` · `AddGarmentScreen.tsx:46` · `EditGarmentScreen.tsx:167` |
| "Guardar prenda" solo al final de un formulario largo | Mucho scroll | Barra inferior fija o "Guardar" en el topBar | Media | Medio | diseño | `GarmentForm.tsx:419-422, 757-765` |
| Grupo "Clima" vs. hint "épocas" vs. Perfil "Ciudad y clima" | Confunde | "Época del año" | Baja | Chico | ajuste | `GarmentForm.tsx:571` |
| Estilo "iOS Settings" frente a tarjetas cálidas | Parece otra app | Unificar radios y bordes | Baja | Medio | diseño | `GarmentForm.tsx:823`, `FormGroup`, `SeasonPicker`, `CutPicker` |
| Permiso de cámara denegado sin botón | Usuario trabado | "Abrir Ajustes" con `Linking.openSettings()` | Baja | Chico | ajuste | `usePhotoPicker.ts:27` |
| `CheckerboardBackground` usa `#E3E3E8` | Resto del diseño viejo | Tokens | Baja | Chico | colores → design-system | `CheckerboardBackground.tsx:7-8` |
| Posible hueco arriba en el modal (`paddingTop: Math.max(insets.top, 12)`) | Espacio vacío | A verificar en dispositivo | Baja | Chico | ajuste | `GarmentForm.tsx:411` |
| Borrar con confirmación, carga, "notFound" con Volver, errores de IA con reintento | – | **Está bien** | – | – | – | `EditGarmentScreen.tsx` |

### Outfits: mazo por color (`OutfitsScreen` + `OutfitDeck`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| La ayuda se corta (2 líneas, cae sobre la tab bar y bajo el toggle) | No se entiende el gesto | Ayuda en una línea; `stage.marginTop` 24→12, `marginBottom` 22→14 | Alta | Chico | ajuste | `OutfitDeck.tsx:339-341, 375, 449` |
| En 375×667 los botones quedan bajo el pliegue | No se ven sin scrollear | Escalar la carta según el alto | Alta | Medio | diseño | `OutfitDeck.tsx:29-31, 389-432` |
| Subtítulo largo y poco exacto | Ocupa alto | "Ideas para combinar tu ropa" | Media | Chico | ajuste | `OutfitsScreen.tsx:136-138` |
| Rótulos "Outfits según…" redundantes | Empujan el mazo | "Por color" / "Por estilo" | Media | Chico | ajuste | `OutfitsScreen.tsx:161-163, 213` |
| Vacío sin botón | Callejón sin salida | `actionLabel="Cargá más prendas"` + detalle corto | Alta | Chico | ajuste | `OutfitsScreen.tsx:152-157` |
| Contador en `tokens.primary`: 3,77:1 noche / 4,45:1 día | Cuesta leerlo | `tokens.accent` | Media | Chico | colores → design-system | `OutfitsScreen.tsx:169-170` |
| `faceBottom` alto fijo 140 | Con texto grande se recorta la paleta | `minHeight` | Baja | Chico | ajuste | `OutfitDeck.tsx:432` |
| Contador de guardados no tocable | Oportunidad perdida | `Pressable` → `/guardados` | Baja | Chico | ajuste | `OutfitsScreen.tsx:164-171` |
| Botones 60/72/60, sellos, "Viste todas las ideas", carga y error | – | **Está bien** | – | – | – | – |

### Outfits: por estilo, detalle y variantes
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| Descripción con `numberOfLines={2}`: Y2K y Techwear al límite | Se corta la frase | `numberOfLines={3}` + `minHeight: 51` | Media | Chico | ajuste | `StyleCarousel.tsx:60, 137` |
| "Tenés 12 prendas · 2 de 3 tipos" en 1 línea | Puede cortarse | "12 prendas · 2 de 3 tipos" | Baja | Chico | ajuste | `StyleCarousel.tsx:32, 66` |
| Variantes vacías sin acción | Callejón sin salida | Botón "Cargá una prenda" | Media | Chico | ajuste | `StyleVariantsSection.tsx:108-111` |
| Filas "Te falta" sin acción | No se puede actuar | Fila tocable → `/add-garment` | Baja | Chico | ajuste | `StyleDetailCard.tsx:158-184` |
| Lista de prendas en 1 línea | Resumen | Opcional `numberOfLines={2}` | Baja | Chico | ajuste | `StyleDetailCard.tsx:37` |
| Corazón de variante, "Ver las N mejores", anillo | – | **Está bien** | – | – | – | – |

### Hoja "Por qué combinan" (`OutfitExplanationModal`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| El fondo tocable es accesible con label "Cerrar" | Tres "cerrar" en VoiceOver | `accessible={false}` | Baja | Chico | ajuste | `OutfitExplanationModal.tsx:25` |
| Variante "Incompleto" muestra "N% match" | Contradice la tarjeta | Mostrar "Incompleto" | Baja | Chico | ajuste | `OutfitExplanationModal` · `savedOutfitView.ts:73-87` |
| X, "Entendido", scroll, aviso "Ya no combina" | – | **Está bien** | – | – | – | – |

### Inspiración (`InspirationScreen`, `DestacadoCard`, `ReferenteRow`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| Filtro sin referentes deja la pantalla vacía | Parece rota | `StateMessage` "No hay referentes de este estilo" + "Ver todos" | Alta | Chico | ajuste | `InspirationScreen.tsx:94-128` |
| Etiqueta de destacado sin foto ≈3,4:1 | Se lee mal | Token de etiqueta | Baja | Chico | colores → design-system | `DestacadoCard.tsx:147-154` |
| Toggle puede tapar el marcador de la última fila | Leve | Aceptable (padding 104) | Baja | – | – | `ReferenteRow` |
| Chips, carrusel, error, marcadores | – | **Está bien** | – | – | – | – |

### Ficha del referente (`ReferenteDetailScreen`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| `ActivityIndicator` sin color | Inconsistente | `color={colors.textMuted}` | Baja | Chico | ajuste | `ReferenteDetailScreen.tsx:63` |
| "No encontramos este referente" sin botón | Leve | "Volver a Inspiración" | Baja | Chico | ajuste | `ReferenteDetailScreen.tsx:72` |
| Celdas "Te falta" sin acción | Oportunidad de cargar | Tocables → `/add-garment` | Baja | Chico | ajuste | `ReferenteGarmentGrid.tsx:332-348` |
| "Atrás", CTA fijo, visor, aviso | – | **Está bien** | – | – | – | – |

### Guardados (`SavedOutfitsScreen`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| Botón de compartir deshabilitado en cada tarjeta | Control muerto | Ocultarlo | Media | Chico | ajuste | `SavedOutfitCard.tsx:399-409` |
| UndoToast de noche 3,85:1 y hex sueltos | La acción se lee mal | Tokens | Media | Chico | colores → design-system | `UndoToast.tsx:6-7` |
| "Por color"/"Por estilo" con letra grande | Pueden cortarse | A verificar en dispositivo | Baja | Chico | ajuste | `SavedFilters.tsx:283-291, 317` |
| Quitar con "Deshacer", toast, vacíos con "Ir a Outfits", corazón, error | – | **Está bien** | – | – | – | – |

### Perfil (`ProfileScreen`)
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| Cerrar sesión: "siguen guardados en este teléfono" | Información incorrecta | "…quedan guardados en tu cuenta." | Media | Chico | ajuste | `ProfileScreen.tsx:64-68` |
| "Compartir / Marca en historias" y "Ciudad y clima · Próximamente" | Parecen funciones rotas | Ocultar Compartir | Baja | Chico | ajuste | `ProfileScreen.tsx:135-150` · `StylePreferencesCard.tsx:136-142` |
| Labels del toggle inconsistentes (claro/oscuro vs Día/Noche) | VoiceOver dice cosas distintas | Unificar Día/Noche | Baja | Chico | ajuste | `FloatingThemeToggle.tsx:25` · `ThemeToggle.tsx:405` |
| Avatar con hex literales | Fuera de tokens | Tokens | Baja | Chico | colores → design-system | `Avatar.tsx:36, 48` |
| Volver, toggle, chips, confirmaciones, error | – | **Está bien** | – | – | – | – |

### Transversal
| Problema | Por qué importa | Cambio propuesto | Prioridad | Esfuerzo | Tipo | Archivo · componente |
|---|---|---|---|---|---|---|
| Botón de `StateMessage` 40 pt | Es el "Reintentar" de toda la app | `height: 44`, `borderRadius: 22` | Alta | Chico | ajuste | `StateMessage.tsx:33` |
| Toggle flotante con rgba y `#000000` literales | Fuera de tokens | Tokens | Baja | Chico | colores → design-system | `FloatingThemeToggle.tsx:11, 45` |
| `ComingSoonScreen` sin usar | Código muerto | Borrarlo | Baja | Chico | ajuste | `ComingSoonScreen.tsx` |
| Sin azul iOS ni `#000` de fondo; toggle respeta safe area; contrastes del test pasan | – | **Está bien** | – | – | – | – |

---

## 3. Quick wins

1. Zonas táctiles de 44 pt: `StateMessage`, `SegmentedControl`, `sideSlot` y "Usar" de `GarmentForm`.
2. Estados vacíos con acción: Outfits ("Cargá más prendas"), Pilchapp con filtros ("Ver todo"), Inspiración ("Ver todos"), Variantes ("Cargá una prenda").
3. Ayuda de Outfits: "Deslizá → para guardar, ← para otra idea"; márgenes del mazo 12/14; subtítulo "Ideas para combinar tu ropa"; rótulos "Por color"/"Por estilo".
4. Textos: cerrar sesión ("quedan guardados en tu cuenta"), "Época del año", StyleCarousel (3 líneas, contador corto), toggle Día/Noche, "Iniciá sesión en Pilchapp".
5. Controles muertos: ocultar compartir en Guardados y "Olvidé mi contraseña".
6. Confirmar descarte al cancelar la ficha de prenda con cambios.
7. Accesibilidad menor: fondo de la hoja `accessible={false}`, color del `ActivityIndicator`, borrar `ComingSoonScreen`.

**Para design-system (colores):** contador de Outfits con `accent`; UndoToast con tokens; etiqueta de `DestacadoCard`; borde del círculo activo de Verano; literales de `FloatingThemeToggle`, `Avatar`, `CheckerboardBackground`.

---

## 4. Cambios de diseño (necesitan mockup)

1. **Mazo adaptable al alto de pantalla**: carta ≈320 pt si la pantalla mide < 700 pt, misma carta con calzado debajo.
2. **Acceso fijo a "Agregar prenda"**: "+" en el encabezado de Pilchapp, o la tarjeta primera en la grilla.
3. **Encabezado de Pilchapp más compacto en iPhone chico** (`SEASONS_TOP` proporcional).
4. **Guardar siempre visible en la ficha de prenda** (barra inferior fija o topBar).
5. **Formulario de prenda con el lenguaje visual cálido** (tarjetas radio 16–20, rótulos en `accent`).
6. **Recuperar contraseña de verdad** con Supabase (definir el deep link).

---

## Prueba manual para lo "a verificar"
1. Outfits: ¿la ayuda se ve entera o la tapa la tab bar / el toggle?
2. iPhone chico o zoom: ¿se ven los tres botones del mazo sin scrollear?
3. "Outfits según estilo": ¿Y2K y Techwear terminan en "…"?
4. Texto grande: ¿se corta la paleta de la carta? ¿Entran "Por color"/"Por estilo" en Guardados?
5. "Nueva prenda": ¿hay un hueco grande arriba de "Cancelar"?
6. Pilchapp, Verano de día: ¿se nota el círculo elegido?
