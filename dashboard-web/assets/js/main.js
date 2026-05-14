// assets/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [resAlumnos, resProfes, resLogsProf, resLogsAlum] = await Promise.all([
            apiFetch(GLOBALS.URL_GET_ALUMNOS).then(r => r.json()),
            apiFetch(GLOBALS.URL_GET_PROFESORES).then(r => r.json()),
            apiFetch(GLOBALS.URL_GET_LOGS + '?tipo=profesor').then(r => r.json()),
            apiFetch(GLOBALS.URL_GET_LOGS + '?tipo=alumno').then(r => r.json())
        ]);

        const alumnos    = resAlumnos.result?.alumnos   || [];
        const profes     = resProfes.result?.profesores || [];
        const logsProf   = resLogsProf.result?.fichajes || [];
        const logsAlum   = resLogsAlum.result?.fichajes || [];

        actualizarStats(alumnos, profes);
        renderizarGrafico([...logsProf, ...logsAlum]);

    } catch (e) {
        console.error('Error cargando stats:', e);
    }

    cargarLogs();
});

const LOGS_POR_PAGINA = 10;
let logsCache = [];
let logsPagina = 1;

window.switchLogsTab = function (btn) {
    document.querySelectorAll('.logs-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    logsPagina = 1;
    cargarLogs(btn.dataset.tipo);
};

window.cargarLogs = async function (tipo) {
    if (!tipo) {
        const active = document.querySelector('.logs-tab.active');
        tipo = active ? active.dataset.tipo : 'profesor';
    }

    const body   = document.getElementById('logsTableBody');
    const loader = document.getElementById('logsLoader');
    if (loader) loader.style.display = '';

    try {
        const res  = await apiFetch(GLOBALS.URL_GET_LOGS + '?tipo=' + tipo).then(r => r.json());
        logsCache  = res.result?.fichajes || res.result?.logs || res.result || [];
        logsPagina = 1;
        renderizarLogs();
    } catch (e) {
        body.innerHTML = '<div style="padding:20px;text-align:center;color:#ef4444;">Error al cargar registros.</div>';
    }
};

function limpiarNombre(nombre) {
    return (nombre || '—').replace(/\s*\(.*?\)\s*/g, '').trim() || '—';
}

function renderizarLogs() {
    const body      = document.getElementById('logsTableBody');
    const total     = logsCache.length;
    const totalPags = Math.ceil(total / LOGS_POR_PAGINA);
    const inicio    = (logsPagina - 1) * LOGS_POR_PAGINA;
    const pagina    = logsCache.slice(inicio, inicio + LOGS_POR_PAGINA);

    if (!total) {
        body.innerHTML = '<div style="padding:30px;text-align:center;color:#6b7280;">No hay registros recientes.</div>';
        return;
    }

    const filas = pagina.map(log => {
        const movimiento = (log.tipo_movimiento || log.tipo || '').toLowerCase();
        const esEntrada  = movimiento.includes('entrada') || movimiento.includes('in');

        let badge;
        if (esEntrada) {
            badge = `<span class="log-badge log-entrada"><i class="fa-solid fa-arrow-right-to-bracket"></i> Entrada</span>`;
        } else {
            badge = `<span class="log-badge log-salida"><i class="fa-solid fa-arrow-right-from-bracket"></i> Salida</span>`;
        }

        const hora           = log.fecha_hora || log.hora || log.timestamp || log.fecha || '—';
        const horaFormateada = formatearHora(hora);
        const nombre         = limpiarNombre(log.display_name_sujeto || log.nombre || log.persona);
        const uid            = log.uid_usado || log.uid || '—';

        return `
        <div class="table-row table-grid-logs">
            <div class="text-gray" style="font-size:0.82rem;">${horaFormateada}</div>
            <div class="student-name">${nombre}</div>
            <div><span class="uid-label"><i class="fa-solid fa-rss"></i>${uid}</span></div>
            <div class="text-center">${badge}</div>
        </div>`;
    }).join('');

    const paginacion = totalPags > 1 ? `
        <div class="logs-pagination">
            <button class="logs-page-btn" onclick="cambiarPaginaLogs(-1)" ${logsPagina === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="logs-page-info">${logsPagina} / ${totalPags}</span>
            <button class="logs-page-btn" onclick="cambiarPaginaLogs(1)" ${logsPagina === totalPags ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>` : '';

    body.innerHTML = filas + paginacion;
}

window.cambiarPaginaLogs = function (dir) {
    const totalPags = Math.ceil(logsCache.length / LOGS_POR_PAGINA);
    const body = document.getElementById('logsTableBody');

    body.style.transition = 'opacity 0.12s ease, transform 0.12s ease';
    body.style.opacity    = '0';
    body.style.transform  = 'scale(0.97)';

    setTimeout(() => {
        logsPagina = Math.max(1, Math.min(totalPags, logsPagina + dir));
        renderizarLogs();
        body.style.transition = 'none';
        body.style.transform  = 'scale(1.02)';
        body.style.opacity    = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            body.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
            body.style.opacity    = '1';
            body.style.transform  = 'scale(1)';
        }));
    }, 120);
};

function formatearHora(valor) {
    if (!valor) return '—';
    const d = new Date(valor);
    if (isNaN(d)) return valor;
    return d.toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}

function actualizarStats(alumnos, profes) {
    const conNfc = alumnos.filter(a => a.uid && a.uid !== '').length;
    document.getElementById('statAlumnos').textContent = alumnos.length;
    document.getElementById('statProfes').textContent  = profes.length;
}

function semanaActual() {
    const hoy = new Date();
    const dow  = hoy.getDay(); // 0=Dom … 6=Sáb
    const diff = (dow === 0) ? -6 : 1 - dow; // retroceder hasta el lunes
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diff);
    lunes.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        return d;
    });
}

function renderizarGrafico(logs) {
    const DIAS_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dias        = semanaActual();
    const conteo      = Array(7).fill(0);

    // Mostrar rango en el header: "12 May — 18 May"
    const fmt = d => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const rangeEl = document.getElementById('chartRangeLabel');
    if (rangeEl) rangeEl.textContent = `${fmt(dias[0])} — ${fmt(dias[6])}`;

    // Contar solo entradas de la semana actual agrupadas por día
    const soloEntradas = logs.filter(log => {
        const mov = (log.tipo_movimiento || log.tipo || '').toLowerCase();
        return mov.includes('entrada') || mov.includes('in');
    });

    soloEntradas.forEach(log => {
        const fecha = log.fecha_hora || log.hora || log.timestamp || '';
        if (!fecha) return;
        const d = new Date(fecha);
        if (isNaN(d)) return;
        dias.forEach((diaRef, i) => {
            const inicio = new Date(diaRef); inicio.setHours(0,  0,  0,   0);
            const fin    = new Date(diaRef); fin.setHours(23, 59, 59, 999);
            if (d >= inicio && d <= fin) conteo[i]++;
        });
    });

    const max   = Math.max(...conteo, 1);
    const hoy   = new Date();
    const chart = document.getElementById('courseChart');

    chart.innerHTML = dias.map((dia, i) => {
        const pct      = Math.round((conteo[i] / max) * 100);
        const esHoy    = dia.toDateString() === hoy.toDateString();
        const colorFill = esHoy ? '#3b82f6' : '#93c5fd';
        const colorText = esHoy ? '#1d4ed8' : '#374151';
        return `
        <div class="bar-group">
            <div style="font-size:0.75rem;font-weight:700;color:${colorText};margin-bottom:6px;">${conteo[i]}</div>
            <div class="bar-track">
                <div class="bar-fill" style="height:${pct}%;background:${colorFill};"></div>
            </div>
            <span class="bar-label" style="${esHoy ? 'color:#3b82f6;font-weight:700;' : ''}">${DIAS_LABELS[i]}</span>
        </div>`;
    }).join('');
}

