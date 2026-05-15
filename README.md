# Sistema de Registro de Asistencia NFC

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Odoo](https://img.shields.io/badge/Odoo-18-purple?logo=odoo&logoColor=white)](https://www.odoo.com/)
[![Android](https://img.shields.io/badge/Android-8.0%2B-green?logo=android&logoColor=white)](https://developer.android.com/)
[![Kotlin](https://img.shields.io/badge/Kotlin-nativa-blueviolet?logo=kotlin&logoColor=white)](https://kotlinlang.org/)
[![PHP](https://img.shields.io/badge/Dashboard-PHP%208.x-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/estado-completado-brightgreen)]()

Sistema completo de registro de asistencia y control de acceso para centros educativos basado en tecnología NFC, desarrollado sobre Odoo 18 como plataforma. Proyecto Intermodular DAM — Equipo **M_DEV** · 2026.

---

## ¿Qué hace este sistema?

Los alumnos y profesores acercan su tarjeta o llavero NFC a un lector. En menos de 200 ms el fichaje queda registrado en la base de datos y es visible desde el panel de administración. Sin aplicaciones que instalar, sin contraseñas que recordar, sin pase de lista manual.

- **Alumnos** → lector USB HID conectado a un equipo con la app HTML. Selección manual de entrada/salida al inicio del turno.
- **Profesores** → lector USB HID con app HTML propia. El sistema alterna entrada/salida automáticamente (auto-toggle con reset diario).
- **Android** → tablet o móvil con NFC integrado para control de permisos de recreo y transporte.
- **Administración** → dashboard web PHP con gestión completa de alumnos, profesores, tarjetas y estadísticas.

---

## Componentes del sistema

```
shiny-umbrella/
│
├── Odoo/                            # Backend principal
│   ├── addons/attendance_nfc/       # Módulo personalizado Odoo 18
│   │   ├── models/                  # 5 modelos → 5 tablas PostgreSQL
│   │   │   ├── nfc_card.py          # nfc.card · tarjetas NFC
│   │   │   ├── alumno.py            # nfc.alumno · permisos calculados por edad
│   │   │   ├── profesor.py          # nfc.profesor · estado activo/baja
│   │   │   ├── fichaje_alumno.py    # nfc.fichaje.alumno
│   │   │   └── fichaje_profesor.py  # nfc.fichaje.profesor · auto-toggle
│   │   ├── controllers/             # 5 archivos · 22 endpoints JSON-RPC
│   │   │   ├── auth.py              # login · logout · session/info
│   │   │   ├── lector.py            # tarjetas · fichajes · permisos
│   │   │   ├── crud_alumno.py       # get · create · import · transporte
│   │   │   ├── crud_profesor.py     # get · create · import · estado
│   │   │   └── crud_generico.py     # assign · update · delete persona
│   │   ├── views/views.xml          # Vistas list/form y menús Odoo
│   │   ├── security/                # Permisos CRUD por modelo
│   │   └── demo/demo.xml            # Datos de demostración
│   ├── config/odoo.conf             # Configuración del servidor Odoo
│   ├── Dockerfile                   # Imagen personalizada Odoo 18
│   ├── docker-compose.prod.yml      # Entorno producción · puerto 8069
│   ├── docker-compose.test.yml      # Entorno test aislado · puerto 8070
│   └── test_manual.py               # Script de 30 pruebas automatizadas
│
├── dashboard-web/                   # Panel de administración (PHP 8.x)
│   ├── config/
│   │   ├── odoo.php                 # IP y puerto del servidor Odoo ← configurar aquí
│   │   └── logger.php               # Registro de peticiones a la API
│   ├── controllers/                 # 20 controladores PHP (uno por acción)
│   ├── views/                       # Vistas: main, alumnado, profesores, vinculación
│   ├── includes/                    # auth, header, sidebar, modales
│   └── index.php                    # Punto de entrada
│
├── Alumnos/app_html/                # App del lector NFC de alumnos
│   ├── index.html                   # Interfaz con selección entrada/salida
│   ├── app.js                       # Captura UID del lector HID · normalización
│   ├── styles.css
│   └── abrir.bat                    # Abre Chrome/Edge directamente
│
├── Profesores/app_html/             # App del lector NFC de profesores
│   ├── index.html                   # Interfaz con auto-toggle servidor
│   ├── app.js                       # Misma lógica HID · sin selección manual
│   ├── styles.css
│   ├── abrir.bat
│   └── MANUAL_TECNICO.txt           # Instrucciones de configuración del lector
│
├── android-app/AppCode/             # Aplicación Android (Kotlin · Android 8.0+)
│   └── app/                         # Control de permisos recreo y transporte
│
├── ejemplos_csv/                    # Plantillas de importación masiva
│   ├── alumnos_ejemplo.csv          # nombre, apellido, dni, fecha_nacimiento, grupo_clase
│   └── profesores_ejemplo.csv       # nombre, apellido, dni, departamento
│
└── docs/                            # Diagramas y documentación
```

---

## Puesta en marcha rápida

### Requisitos previos

- Docker Engine 20.x o superior
- Docker Compose v2
- Git
- Puerto `8069` libre (Odoo) y `5050` libre (pgAdmin)
- Red local entre el servidor y los equipos con lectores NFC

### 1 — Clonar el repositorio

```bash
git clone https://github.com/elielDev09/shiny-umbrella.git
cd shiny-umbrella/Odoo
```

### 2 — Arrancar el entorno de producción

```bash
docker compose -f docker-compose.prod.yml up -d
```

La primera vez descarga las imágenes y arranca Odoo + PostgreSQL + pgAdmin. Puede tardar 2-5 minutos.

| Servicio | URL |
|---|---|
| Odoo 18 | `http://IP_SERVIDOR:8069` |
| pgAdmin 4 | `http://IP_SERVIDOR:5050` |

### 3 — Instalar el módulo attendance_nfc

1. Acceder a Odoo → **Configuración → Activar modo desarrollador**
2. **Aplicaciones → Actualizar lista → buscar "Attendance NFC" → Instalar**

El módulo crea automáticamente las 5 tablas en PostgreSQL y los menús en Odoo.

### 4 — Configurar el dashboard web

Editar `dashboard-web/config/odoo.php`:

```php
$ODOO_IP   = "IP_DEL_SERVIDOR";
$ODOO_PORT = "8069";
```

Servir la carpeta `dashboard-web/` con cualquier servidor PHP 8.x (Apache, Nginx, PHP built-in).

### 5 — Configurar las apps de los lectores NFC

En `Alumnos/app_html/app.js` y `Profesores/app_html/app.js`:

```js
const SERVER_IP = "IP_DEL_SERVIDOR";
```

Para abrir la app en el equipo con el lector conectado, hacer doble clic en `abrir.bat`. Abre Chrome o Edge automáticamente.

### 6 — Configurar la app Android

En `android-app/AppCode/app/src/main/.../MainActivity.kt`:

```kotlin
private const val SERVER_IP = "IP_DEL_SERVIDOR"
```

Compilar con Android Studio y desplegar en el dispositivo (Android 8.0 o superior con NFC).

---

## API — Endpoints del módulo

Todas las peticiones son `HTTP POST` con `Content-Type: application/json` usando el protocolo **JSON-RPC 2.0** estándar de Odoo. URL base: `http://IP_SERVIDOR:8069`.

Los endpoints marcados con `*` requieren sesión activa (cookie `session_id`).

### Autenticación

| Ruta | Parámetros | Descripción |
|---|---|---|
| `/nfc/login` | `login`, `password` | Inicia sesión. Devuelve cookie `session_id`. |
| `/nfc/logout` `*` | — | Cierra la sesión activa. |
| `/nfc/session/info` `*` | — | Comprueba si la sesión sigue activa. |

### Lector / Hardware (públicos)

| Ruta | Parámetros | Descripción |
|---|---|---|
| `/nfc/registrar_tarjeta` | `uid` | Registra una nueva tarjeta como libre. |
| `/nfc/get_cards` | — | Lista todas las tarjetas y su estado. |
| `/nfc/delete_card` | `uid` | Elimina una tarjeta (desvincula antes si está activa). |
| `/nfc/unassign_card` | `uid` | Desvincula una tarjeta sin eliminarla. |
| `/nfc/check_recreo` | `uid` | Verifica permiso de recreo del alumno. |
| `/nfc/check_transporte` | `uid` | Verifica permiso de transporte del alumno. |
| `/nfc/registrar_fichaje_alumno` | `uid`, `tipo` (`entrada`\|`salida`) | Registra un fichaje de alumno. |
| `/nfc/registrar_fichaje_profesor` | `uid` | Registra un fichaje de profesor (auto-toggle entrada/salida). |
| `/nfc/get_fichajes_alumnos` | — | Historial de fichajes de alumnos. |
| `/nfc/get_fichajes_profesores` | — | Historial de fichajes de profesores. |

### Gestión de alumnos `*`

| Ruta | Descripción |
|---|---|
| `/nfc/get_alumnos` | Lista todos los alumnos con sus permisos. |
| `/nfc/create_alumno` | Crea un alumno. Los permisos por edad se calculan automáticamente. |
| `/nfc/import_alumnos` | Importación masiva desde CSV. Actualiza si el DNI ya existe. |
| `/nfc/update_transporte` | Activa/desactiva el permiso de transporte de un alumno. |

### Gestión de profesores `*`

| Ruta | Descripción |
|---|---|
| `/nfc/get_profesores` | Lista todos los profesores. |
| `/nfc/create_profesor` | Crea un profesor con estado `activo` por defecto. |
| `/nfc/import_profesores` | Importación masiva desde CSV. |
| `/nfc/update_estado_profesor` | Cambia el estado a `activo` o `baja`. |

### Operaciones genéricas `*`

| Ruta | Descripción |
|---|---|
| `/nfc/assign_card` | Vincula una tarjeta libre a un alumno o profesor por DNI. |
| `/nfc/update_persona` | Actualiza campos de un alumno o profesor. |
| `/nfc/delete_persona` | Elimina un alumno o profesor (cascade sobre fichajes y tarjeta). |

---

## Entorno de test aislado

Para ejecutar pruebas sin tocar producción:

```bash
# Levantar entorno de test (puerto 8070, BD NFC_Test, sin volumen persistente)
docker compose -f docker-compose.test.yml up -d

# Instalar dependencias (solo la primera vez)
pip install requests

# Ejecutar los 30 tests
python test_manual.py

# Al terminar
docker compose -f docker-compose.test.yml down
```

El script `test_manual.py` cubre: autenticación, CRUD de alumnos y profesores, registro y asignación de tarjetas, fichajes (incluyendo auto-toggle y casos denegados), historial y limpieza. Resultado esperado: `30 OK, 0 FAIL`.

---

## Cómo funciona la normalización del UID

Los lectores NFC pueden emitir el UID en hexadecimal, en decimal o con el orden de bytes invertido (little-endian), dependiendo del modelo. Todas las apps (HTML y Android) incluyen una función `normalizarUID()` que convierte cualquier formato al decimal de 10 dígitos que espera el servidor. Si la tarjeta llega en formato incorrecto, abrir las DevTools del navegador (`F12 → Consola`) para ver el UID raw que emite el lector.

---

## Lógica de alternancia — Fichaje de profesores

Cuando un profesor ficha, el módulo determina automáticamente si es entrada o salida:

1. Busca todos los fichajes del profesor con `fecha_hora::date = hoy`.
2. Si no hay ninguno → **ENTRADA** (primer fichaje del día).
3. Si hay alguno → toma el último por `fecha_hora DESC`.
4. Si el último fue ENTRADA → **SALIDA**.
5. Si el último fue SALIDA → **ENTRADA**.
6. Inserta el registro y devuelve la respuesta.

El reset diario es automático: al cambiar de día la búsqueda devuelve 0 resultados y el ciclo vuelve a ENTRADA. No hay ningún cron ni proceso programado.

---

## Hardware compatible

| Componente | Especificación |
|---|---|
| Lector NFC USB | Modo HID/teclado. Emite UID vía keystrokes. Compatible con cualquier OS sin drivers. |
| Tarjetas / llaveros | MIFARE Classic 1K. UID único de fábrica. Pasivo (sin batería). |
| App Android | Cualquier dispositivo Android 8.0+ con chip NFC integrado. |

---

## Equipo M_DEV

| Rol | Nombre |
|---|---|
| Jefe de Proyecto | Eliel Besay Pérez Martín |
| Desarrollador | Víctor |
| Diseñador | Marcos |
| Secretario | Diego |

---

## Licencia

Proyecto académico — Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM) · Consejería de Educación · 2026.
