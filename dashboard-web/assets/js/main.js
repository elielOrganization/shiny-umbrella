// assets/js/main.js

const CURSOS_ORDEN  = ['1º ESO', '2º ESO', '3º ESO', '4º ESO', '1º BACH', '2º BACH'];
const CURSOS_LABELS = { '1º ESO':'1ºE', '2º ESO':'2ºE', '3º ESO':'3ºE', '4º ESO':'4ºE', '1º BACH':'1ºB', '2º BACH':'2ºB' };

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [resAlumnos, resProfes] = await Promise.all([
            fetch(GLOBALS.URL_GET_ALUMNOS).then(r => r.json()),
            fetch(GLOBALS.URL_GET_PROFESORES).then(r => r.json())
        ]);

        const alumnos = resAlumnos.result?.alumnos   || [];
        const profes  = resProfes.result?.profesores || [];

        actualizarStats(alumnos, profes);
        renderizarGrafico(alumnos);

    } catch (e) {
        console.error('Error cargando stats:', e);
    }

    cargarLogs();
});

window.switchLogsTab = function (btn) {
    document.querySelectorAll('.logs-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
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
        const res  = await fetch(GLOBALS.URL_GET_LOGS + '?tipo=' + tipo).then(r => r.json());
        const logs = res.result?.logs || res.result || [];

        if (!logs.length) {
            body.innerHTML = '<div style="padding:30px;text-align:center;color:#6b7280;">No hay registros recientes.</div>';
            return;
        }

        body.innerHTML = logs.map(log => {
            const esEntrada = (log.tipo || '').toLowerCase().includes('entrada') ||
                              (log.tipo || '').toLowerCase().includes('in');
            const badge = esEntrada
                ? `<span class="log-badge log-entrada"><i class="fa-solid fa-arrow-right-to-bracket"></i> Entrada</span>`
                : `<span class="log-badge log-salida"><i class="fa-solid fa-arrow-right-from-bracket"></i> Salida</span>`;

            const hora = log.hora || log.timestamp || log.fecha || '—';
            const horaFormateada = formatearHora(hora);

            return `
            <div class="table-row table-grid-logs">
                <div class="text-gray" style="font-size:0.82rem;">${horaFormateada}</div>
                <div class="student-name">${log.nombre || log.persona || '—'}</div>
                <div>
                    <span class="uid-label"><i class="fa-solid fa-rss"></i>${log.uid || '—'}</span>
                </div>
                <div class="text-center">${badge}</div>
            </div>`;
        }).join('');

    } catch (e) {
        body.innerHTML = '<div style="padding:20px;text-align:center;color:#ef4444;">Error al cargar registros.</div>';
    }
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
    document.getElementById('statConNfc').textContent  = conNfc;
    document.getElementById('statSinNfc').textContent  = alumnos.length - conNfc;
    document.getElementById('statProfes').textContent  = profes.length;
}

function renderizarGrafico(alumnos) {
    const conteo = {};
    CURSOS_ORDEN.forEach(c => conteo[c] = 0);

    alumnos.forEach(a => {
        const g     = (a.grupo_clase || '').trim();
        const curso = CURSOS_ORDEN.find(c => g.startsWith(c));
        if (curso) conteo[curso]++;
    });

    const max    = Math.max(...Object.values(conteo), 1);
    const chart  = document.getElementById('courseChart');

    chart.innerHTML = CURSOS_ORDEN.map(curso => {
        const pct = Math.round((conteo[curso] / max) * 100);
        return `
        <div class="bar-group">
            <div style="font-size:0.75rem;font-weight:700;color:#374151;margin-bottom:6px;">${conteo[curso]}</div>
            <div class="bar-track">
                <div class="bar-fill" style="height:${pct}%"></div>
            </div>
            <span class="bar-label">${CURSOS_LABELS[curso]}</span>
        </div>`;
    }).join('');
}

