# Invitación digital · Ema cumple 9

Invitación interactiva (sobre → sello → carta). Solo HTML, CSS y JavaScript: sin servidor, sin base de datos, sin costo.

```
index.html     estructura
styles.css     estilos
script.js      comportamiento
config.js      ⭐ TODOS los datos editables (nombre, fecha, lugar, formulario…)
assets/img/    tus ilustraciones, recortadas y optimizadas (WebP)
assets/fonts/  tipografías locales
assets/og-image.jpg  vista previa al compartir por WhatsApp
```

## 1. Ver la invitación en tu computador
Abre una terminal en esta carpeta y ejecuta `python3 -m http.server 8000`; luego entra a http://localhost:8000.
(También funciona abriendo `index.html` con doble clic, pero el mapa y algunas vistas previas se comportan mejor con servidor.)

## 2. Editar los datos
Todo está en **`config.js`**: nombre, edad, fecha y hora, lugar, enlace de Maps, dresscode, mensaje e información adicional.
- El día de la semana se calcula solo.
- ⚠ **Revisar la fecha:** pediste "sábado 7 de octubre de 2026", pero el 7 de octubre de 2026 fue miércoles y ya pasó. El sábado día 7 más próximo es el **7 de noviembre de 2026**, que es lo que quedó en `fechaISO`. Si es otra, cámbiala.
- Zona horaria de Chile: `-03:00` (verano) o `-04:00` (invierno).
- Mapa: busca por `mapaBusqueda`. Para un pin exacto, en Google Maps usa Compartir → *Insertar un mapa*, copia solo la URL del `src="…"` y pégala en `mapaEmbedUrl`.

## 3. Confirmaciones (Google Forms → Google Sheets)
La invitación recoge nombre, asistencia, acompañantes y comentario, y abre tu formulario **ya rellenado**; el invitado solo toca *Enviar*. La confirmación real la da Google, por eso no se simula ningún "guardado".

1. En Google Forms crea un formulario con 4 preguntas:
   - **Nombre** (respuesta corta)
   - **Asistencia** (opción múltiple): `Sí, asistiré` / `No podré asistir`
   - **Acompañantes** (respuesta corta)
   - **Comentario** (párrafo, opcional)
2. Pestaña *Respuestas* → ícono de Sheets → *Crear hoja de cálculo*.
3. Menú ⋮ → **Obtener enlace rellenado previamente**. Responde con datos cualquiera y pulsa *Obtener enlace* → *Copiar enlace*.
4. Ese enlace tiene forma `…/viewform?usp=pp_url&entry.111=…&entry.222=…`. En `config.js`:
   - `formUrl`: la parte hasta `/viewform` (sin lo que sigue).
   - `campos`: pega cada `entry.XXXX` en su pregunta (nombre, asistencia, acompanantes, comentario).
   - `opciones`: deben ser **idénticas** a las opciones del Form.
5. Prueba: abre la invitación, confirma y revisa que el Form llegue completo y que la fila aparezca en la hoja.

Mientras `formUrl` esté vacío, la invitación avisa que falta configurarlo (no finge guardar).

## 4. Publicar en GitHub Pages
1. Crea un repositorio público en GitHub (por ejemplo `invitacion-ema`) y sube todo el contenido de esta carpeta.
2. *Settings → Pages → Build and deployment*: Source **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Tu dirección será `https://TU-USUARIO.github.io/invitacion-ema/`.
4. **Vista previa de WhatsApp:** en `index.html` reemplaza `TU-USUARIO` (y el nombre del repo si cambió) en la línea `og:image`. WhatsApp guarda la vista previa en caché: si la cambias después, comparte el enlace con `?v=2` al final.
5. La página incluye `noindex`, así que no aparece en buscadores, pero cualquiera con el enlace puede verla.

## 5. Cambiar ilustraciones
Los archivos están en `assets/img/`. Mantén los mismos nombres y la misma proporción (PNG/WebP con fondo transparente) para que las posiciones sigan funcionando. El nombre "Ema" del sello es parte de la imagen.

## 6. Accesibilidad y rendimiento
- Respeta *reducir movimiento* del dispositivo (la carta aparece sin animaciones).
- El sello es un botón: funciona con toque, clic y teclado.
- El formulario usa `<dialog>` nativo (Esc cierra, el foco queda dentro).
- Peso total de imágenes ≈ 0,9 MB (WebP); el sobre y el sello cargan primero y el resto se precarga mientras el invitado ve la portada.


## Flujo
Sobre (la solapa gira) → hoja 1: blonda con tu tarjeta rosa encima («Te invito a celebrar mi cumpleaños número 9») → «Toca para ver los detalles» → hoja 2: la misma blonda con cuándo y dónde, botón «Ver mapa» (despliega el mapa) y «Abrir en Maps», un papel rosado con el dress code asomando por detrás, y al final la cuenta regresiva y confirmar asistencia.



## Flujo
Sobre (la solapa gira; la carta sale un poco desenfocada y se enfoca al llegar) → frente de la carta (tu imagen con el texto ya acomodado + decoración encima) → «Toca para ver los detalles» → la carta gira y muestra la blonda con ¿Cuándo?, ¿Dónde? («Ver mapa» despliega el mapa dentro de una frutilla y recién ahí aparece «Abrir en Maps») y el código de vestimenta → «Confirmar asistencia» → al terminar aparece la cuenta regresiva.

## Imágenes del frente
El texto del frente (incluido el globo 9 y los corazones) vive dentro de `assets/img/tarjeta-frente.webp`. Si cambias algo de ese texto, reemplaza esa imagen (mismas proporciones). La decoración (frutillas, moño, flores, hojas) se acomoda en `styles.css` (clases `.f-…`).

## Fuente Best Swashed
Está en `assets/fonts/best-swashed.woff2` (convertida desde tu archivo, versión de uso personal). Si quieres cambiar de fuente, edita `--f-swash` en `styles.css`.

## Confirmaciones automáticas (Google Sheets + Apps Script)

Una página web no puede escribir directamente en un archivo Excel; lo que sí puede es enviar los datos a una hoja de Google Sheets, que se puede descargar como Excel cuando quieras (Archivo → Descargar → .xlsx).

1. Entra a Google Drive → **Nuevo → Subir archivo** y sube `confirmaciones-ema.xlsx`. Ábrelo y elige **Archivo → Guardar como hoja de cálculo de Google**.
2. En esa hoja: **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de `apps-script-confirmaciones.gs`. Guarda.
3. **Implementar → Nueva implementación → Aplicación web**. «Ejecutar como»: *Yo*. «Quién tiene acceso»: *Cualquier persona*. Implementar y autorizar los permisos.
4. Copia la **URL de la aplicación web** (termina en `/exec`) y pégala en `config.js`, en `rsvp.scriptUrl`.
5. Publica el sitio y prueba confirmando una vez: debe aparecer una fila en la hoja «Confirmaciones» y el «Resumen» se actualiza solo.

Notas: esa URL es pública (cualquiera que la tenga podría enviar datos); cada persona (invitado o acompañante) queda en su propia fila, y los acompañantes llevan en «Acompañante de» el nombre de quien los trae. La hoja ignora reintentos repetidos y, si alguien confirma otra vez con el mismo nombre, reemplaza su respuesta anterior. Si cambias el script, hay que crear una **nueva implementación** para que se aplique.
Si `scriptUrl` queda vacío, se usa la opción del formulario de Google (`formUrl`).
