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
        renderizarTabla(alumnos);
        configurarBuscador();

    } catch (e) {
        console.error('Error cargando dashboard:', e);
        document.getElementById('mainTableLoader').innerHTML =
            '<p style="color:#ef4444;padding:20px;">Error de sincronización con Odoo.</p>';
    }
});

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

function renderizarTabla(alumnos) {
    const body = document.getElementById('mainTableBody');

    if (!alumnos.length) {
        body.innerHTML = '<div style="padding:30px;text-align:center;color:#6b7280;">No hay alumnos registrados.</div>';
        return;
    }

    const sorted = [...alumnos].sort((a, b) => {
        const ga = a.grupo_clase || '';
        const gb = b.grupo_clase || '';
        if (ga !== gb) return ga.localeCompare(gb);
        return (a.apellido || '').localeCompare(b.apellido || '');
    });

    let html = '';
    sorted.forEach(alumno => {
        const tieneNfc  = alumno.uid && alumno.uid !== '';
        const nombreKey = `${alumno.nombre || ''} ${alumno.apellido || ''}`.toLowerCase();

        html += `
        <div class="table-row table-grid-main" data-nombre="${nombreKey}">
            <div class="student-name">${alumno.apellido || ''}, ${alumno.nombre || ''}</div>
            <div class="text-gray">${alumno.grupo_clase || 'S/G'}</div>
            <div>
                ${tieneNfc
                    ? `<span class="uid-label"><i class="fa-solid fa-rss"></i>${alumno.uid}</span>`
                    : `<span style="color:#9ca3af;font-size:0.8rem;font-style:italic;">Sin tarjeta</span>`
                }
            </div>
            <div class="bool-cell campo-calculado">
                <label class="switch">
                    <input type="checkbox" ${alumno.permiso_recreo ? 'checked' : ''} disabled>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="bool-cell campo-calculado">
                <label class="switch">
                    <input type="checkbox" ${alumno.permiso_salida ? 'checked' : ''} disabled>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="bool-cell">
                <label class="switch">
                    <input type="checkbox" ${alumno.permiso_transporte ? 'checked' : ''}
                        data-dni="${alumno.dni}" data-field="permiso_transporte">
                    <span class="slider round"></span>
                </label>
            </div>
        </div>`;
    });

    body.innerHTML = html;

    body.querySelectorAll('input[data-field="permiso_transporte"]').forEach(chk => {
        chk.addEventListener('change', async function () {
            const dni   = this.dataset.dni;
            const valor = this.checked;
            try {
                await fetch(GLOBALS.URL_UPDATE_TRANSPORTE, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ dni, valor })
                });
            } catch (e) {
                this.checked = !valor;
            }
        });
    });
}

function configurarBuscador() {
    document.getElementById('mainSearch')?.addEventListener('input', function () {
        const q = this.value.toLowerCase();
        document.querySelectorAll('#mainTableBody .table-row').forEach(row => {
            row.style.display = (row.dataset.nombre || '').includes(q) ? '' : 'none';
        });
    });
}
