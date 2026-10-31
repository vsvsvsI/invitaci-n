/* =====================================================================
   CONFIGURACIÓN DE LA INVITACIÓN
   Todo lo que cambia de una fiesta a otra está aquí.
   No hace falta tocar index.html, styles.css ni script.js.
   ===================================================================== */
window.INVITACION = {

  /* ---- Cumpleañera ---- */
  nombre: "Ema",
  edad: 9,

  /* ---- Fecha y hora ----
     Formato: AAAA-MM-DDTHH:MM:00 + diferencia horaria de Chile.
       · Horario de verano de Chile (aprox. sept–abril): -03:00
       · Horario de invierno de Chile (aprox. abril–sept): -04:00
     El día de la semana ("Jueves", etc.) se calcula solo a partir de la fecha.

     ⚠ REVISAR: se indicó "sábado 7 de octubre de 2026", pero el 7 de octubre de 2026 fue
       miércoles y ya pasó. El sábado día 7 más próximo es el 7 de NOVIEMBRE de 2026,
       y es el que está puesto aquí. Si es otra fecha, cámbiala. */
  fechaISO: "2026-11-07T16:00:00-03:00",
  zonaHoraria: "America/Santiago",
  mostrarAnio: true,             // true => "Sábado 7 de noviembre de 2026"

  /* ---- Lugar ---- */
  lugar: {
    nombre: "Bloom Haus",
    direccion: "Los Magnolios, Parcela 2A, Lote 3",
    sector: "Lo Mardones, La Palma, Quillota",

    // Botón "Abrir en Google Maps" (el enlace que compartió Google).
    enlaceMaps: "https://share.google/qaoqOU2xSVRlUHrdH",

    // OPCIONAL: enlace de Apple Maps para quienes abren con iPhone
    // (en Apple Maps: Compartir > Copiar enlace). Si queda vacío, se usa el de arriba.
    enlaceApple: "",

    // Mapa incrustado: se busca por este texto.
    mapaBusqueda: "Bloom Haus, Los Magnolios, Lo Mardones, La Palma, Quillota, Chile",

    // OPCIONAL y más exacto: en Google Maps > Compartir > "Insertar un mapa",
    // copia SOLO la dirección que está dentro de src="..." y pégala aquí.
    // Si lo completas, se usa en lugar de la búsqueda de arriba.
    mapaEmbedUrl: "",

    // MEJOR OPCIÓN para celulares: coordenadas del lugar. Con ellas el mapa se mueve con UN dedo
    // (el mapa de Google incrustado siempre pide dos dedos). Cómo obtenerlas: en Google Maps,
    // mantén presionado el lugar exacto y copia los dos números que aparecen arriba, ej. -32.8123, -71.2345
    lat: null,
    lng: null
  },

  /* ---- Textos de la invitación ---- */
  dresscodeEtiqueta: "Código de vestimenta",
  dresscode: "Rosado o verde",
  mensaje: "Te esperamos",
  infoAdicional: "",             // opcional. Si queda vacío, no se muestra.

  /* ---- Portada (sobre cerrado). {nombre} se reemplaza solo ---- */
  portadaTitulo: "{nombre} te ha enviado una carta",
  portadaPista: "Toca el sello para abrirla",

  /* ---- Confirmación de asistencia (RSVP) con Google Forms ----
     Instrucciones paso a paso en README.md (sección "Confirmaciones"). */
  rsvp: {
    // OPCIÓN A (recomendada): envío automático a una planilla de Google Sheets.
    // Pega aquí la URL de la «aplicación web» de Apps Script (ver README, sección «Confirmaciones»).
    scriptUrl: "",

    // OPCIÓN B (si scriptUrl está vacío): abrir un Google Form con las respuestas ya rellenadas.
    // Enlace del formulario terminado en /viewform
    // Ej.: "https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform"
    formUrl: "https://script.google.com/macros/s/AKfycbxLRnNLY3uEZLoF6-22AO5DN9nND6jjw3VM4t7aqlgBaJ6GVQnwZKUOBGyzt0qrwLS_Ew/exec",

    // Identificadores de cada pregunta ("entry.123456789").
    // Se obtienen con "Obtener enlace rellenado previamente" en Google Forms.
    campos: {
      nombre: "",
      asistencia: "",
      acompanantes: "",
      comentario: ""
    },

    // Textos EXACTOS de las opciones de la pregunta de asistencia en el Form.
    opciones: {
      si: "Sí, asistiré",
      no: "No podré asistir"
    },

    maxAcompanantes: 4           // máximo que se puede elegir (sin contar al invitado)
  }
};
