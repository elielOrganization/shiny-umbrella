# Registro de asistencia NFC · Proyecto Intermodular DAM

[![Made with Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)](https://www.python.org/)
[![Android](https://img.shields.io/badge/Android-App-green?logo=android)](https://developer.android.com/)
[![Odoo](https://img.shields.io/badge/Odoo-ERP-purple)](https://www.odoo.com/)
[![Dashboard](https://img.shields.io/badge/Dashboard-PHP%20(provisional)-lightblue)]()
[![Status](https://img.shields.io/badge/status-en%20desarrollo-orange)]()
[![License](https://img.shields.io/badge/license-Pending-lightgrey)]()

Proyecto intermodular de **desarrollo** de un sistema de registro electrónico de asistencia basado en NFC, con lector conectado a Raspberry Pi, backend de gestión en Odoo y clientes para docentes y administración.

---

## Objetivo del proyecto

- Sustituir el control de asistencia en papel por un sistema digital.  
- Utilizar un lector NFC conectado a una Raspberry Pi para leer el UID de tarjetas o tags.  
- Enviar los fichajes a un servidor Odoo, donde se almacenan y explotan los datos.  
- Proporcionar interfaces para docentes (app Android) y administración (dashboard web).

---

## Tecnologías previstas

- **Raspberry node**: Raspberry Pi + Python para la lectura NFC y envío de datos.  
- **Backend**: Odoo como ERP y base de datos (modelos de tarjetas y fichajes, API propia).  
- **App Android**: Kotlin/Java o Flutter para la consulta de asistencia en tiempo real.  
- **Dashboard web**: implementación provisional en **PHP** (posible cambio futuro a otro stack).

---

## Estructura de carpetas actual

```text
SHINY-UMBRELLA/
├── .github/
│
├── android-app/
│
├── dashboard-web/        # implementación prevista en PHP (provisional)
│
├── docs/
│
├── Odoo/
│
├── raspberry-node/
│   └── src/
│       ├── client_odoo.py
│       ├── config.py
│       ├── main.py
│       └── reader.py
│
├── .gitignore
├── CONTRIBUTING.md
└── README.md
