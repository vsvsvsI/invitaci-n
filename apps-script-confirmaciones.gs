/**
 * Recibe las confirmaciones de la invitación de Ema y las guarda en la hoja «Confirmaciones»:
 * una fila por persona. Los acompañantes quedan como invitados, con «Acompañante de» indicando quién los trae.
 * Pasos: ver README.md, sección «Confirmaciones automáticas».
 */
const HOJA = 'Confirmaciones';
const COLUMNAS = ['ID', 'Fecha', 'Nombre', 'Tipo', 'Acompañante de', 'Asistencia', 'Comentario'];
const N = COLUMNAS.length;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    const nombre = String(d.nombre || '').trim().slice(0, 80);
    if (!nombre) return salida({ ok: false, error: 'falta nombre' });
    const viene = d.asistencia === 'Sí';
    const asistencia = viene ? 'Sí' : 'No';
    const comentario = String(d.comentario || '').trim().slice(0, 300);
    const id = String(d.id || '').slice(0, 60);
    let acomp = Array.isArray(d.acompanantes) ? d.acompanantes : [];
    acomp = viene ? acomp.map(x => String(x || '').trim().slice(0, 80)).filter(Boolean).slice(0, 10) : [];

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(HOJA);
    if (!sh) { sh = ss.insertSheet(HOJA); sh.appendRow(COLUMNAS); }
    const n = sh.getLastRow();
    const datos = n > 1 ? sh.getRange(2, 1, n - 1, N).getValues() : [];

    if (id && datos.some(r => r[0] === id)) return salida({ ok: true, repetido: true });   // reintento: no duplicar

    // Si la misma persona ya había respondido, se borran sus filas anteriores (y las de sus acompañantes).
    const clave = nombre.toLowerCase();
    for (let i = datos.length - 1; i >= 0; i--) {
      const r = datos[i];
      const esSuya = (r[3] === 'Invitado' && String(r[2]).trim().toLowerCase() === clave) ||
                     (r[3] === 'Acompañante' && String(r[4]).trim().toLowerCase() === clave);
      if (esSuya) sh.deleteRow(i + 2);
    }

    const fecha = new Date();
    const filas = [[id, fecha, nombre, 'Invitado', '', asistencia, comentario]]
      .concat(acomp.map(a => [id, fecha, a, 'Acompañante', nombre, asistencia, '']));
    sh.getRange(sh.getLastRow() + 1, 1, filas.length, N).setValues(filas);
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() { return salida({ ok: true, mensaje: 'Servicio de confirmaciones activo' }); }

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
