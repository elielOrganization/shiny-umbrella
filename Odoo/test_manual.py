import sys
import time
import requests

# URL del entorno de test (docker-compose.test.yml). No tocar el de prod (8069).
BASE_URL       = "http://localhost:8070"
ADMIN_LOGIN    = "admin"
ADMIN_PASSWORD = "admin"

# Datos de prueba fijos. El alumno nace en 2015 para que sea menor de 18
# y así permiso_salida y permiso_recreo sean False — necesario para testear
# los casos de denegación sin tener que configurar nada extra.
ALUMNO_DNI = "12345678T"
PROFE_DNI  = "87654321Z"
UID_ALUMNO = "0000000001"  # 10 dígitos: pasan la constraint del modelo nfc.card
UID_PROFE  = "0000000002"

ok_count   = 0
fail_count = 0


def post(session, path, params):
    """Envía una petición JSON-RPC 2.0 al endpoint indicado y devuelve el result.
    Lanza RuntimeError si Odoo devuelve un error a nivel de protocolo."""
    payload = {"jsonrpc": "2.0", "method": "call", "id": 1, "params": params}
    r = session.post(f"{BASE_URL}{path}", json=payload, timeout=10)
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        raise RuntimeError(data["error"].get("data", {}).get("message", str(data["error"])))
    return data.get("result", {})


def ok(label):
    global ok_count
    ok_count += 1
    print(f"  [OK]   {label}")


def fail(label, detail=""):
    global fail_count
    fail_count += 1
    print(f"  [FAIL] {label}" + (f" — {detail}" if detail else ""))


def section(title):
    print(f"\n=== {title} ===")


def wait_for_server():
    """Espera hasta 3 minutos a que el servidor Odoo responda.
    En el primer arranque tarda porque tiene que crear la BD e instalar el módulo."""
    print("Esperando al servidor Odoo", end="", flush=True)
    for _ in range(90):
        try:
            requests.get(f"{BASE_URL}/web", timeout=3)
            print(" listo.\n")
            return
        except Exception:
            print(".", end="", flush=True)
            time.sleep(2)
    print("\nEl servidor no respondió. ¿Está levantado con docker-compose.test.yml?")
    sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────

wait_for_server()
s = requests.Session()  # La sesión mantiene la cookie entre llamadas autenticadas


def pre_cleanup(session):
    """Borra en silencio cualquier dato de prueba que haya quedado de una
    ejecución anterior fallida. Así el script siempre parte de un estado limpio
    sin necesidad de bajar y subir el contenedor."""
    try:
        post(session, "/nfc/login", {"login": ADMIN_LOGIN, "password": ADMIN_PASSWORD})
        for uid in [UID_ALUMNO, UID_PROFE]:
            # Primero desasignar (la tarjeta activa no se puede borrar directamente)
            try: post(session, "/nfc/unassign_card", {"uid": uid})
            except Exception: pass
            try: post(session, "/nfc/delete_card", {"uid": uid})
            except Exception: pass
        for dni in [ALUMNO_DNI, PROFE_DNI]:
            try: post(session, "/nfc/delete_persona", {"dni": dni})
            except Exception: pass
        post(session, "/nfc/logout", {})
    except Exception:
        pass


pre_cleanup(s)

# ── AUTH ──────────────────────────────────────────────────────────────────────
section("AUTH")

# Comprueba que el endpoint de login devuelve status:ok con credenciales válidas
# y que la cookie de sesión queda guardada en la sesión de requests.
try:
    r = post(s, "/nfc/login", {"login": ADMIN_LOGIN, "password": ADMIN_PASSWORD})
    if r.get("status") == "ok":
        ok("login correcto")
    else:
        fail("login correcto", r.get("message", r))
except Exception as e:
    fail("login correcto", str(e))

# Comprueba que el servidor rechaza credenciales incorrectas con status:error.
# Si esto fallase, cualquiera podría entrar sin contraseña.
try:
    r = post(s, "/nfc/login", {"login": "admin", "password": "wrongpassword"})
    if r.get("status") == "error":
        ok("login incorrecto rechazado")
    else:
        fail("login incorrecto rechazado", "debería devolver status:error")
except Exception as e:
    fail("login incorrecto rechazado", str(e))

# Comprueba que /nfc/session/info reconoce la sesión activa tras el login.
# El frontend usa este endpoint para saber si el usuario sigue logueado.
try:
    r = post(s, "/nfc/session/info", {})
    if r.get("status") == "ok":
        ok("session info activa")
    else:
        fail("session info activa", r)
except Exception as e:
    fail("session info activa", str(e))

# ── ALUMNOS ───────────────────────────────────────────────────────────────────
section("ALUMNOS")

# Crea un alumno de prueba menor de 18 años (nacido en 2015).
# Al ser menor, permiso_salida y permiso_recreo serán False automáticamente,
# lo que nos permite testear los casos de denegación más adelante.
try:
    r = post(s, "/nfc/create_alumno", {
        "nombre": "Test", "apellido": "Alumno", "dni": ALUMNO_DNI,
        "fecha_nacimiento": "2015-06-15", "grupo_clase": "1A"
    })
    if r.get("status") == "ok":
        ok("crear alumno")
    else:
        fail("crear alumno", r.get("message"))
except Exception as e:
    fail("crear alumno", str(e))

# Intenta crear otro alumno con el mismo DNI. El modelo tiene un constraint
# unique en el campo dni, por lo que debe devolver status:error.
# Verifica que la BD no permite PKs duplicadas a nivel de aplicación.
try:
    r = post(s, "/nfc/create_alumno", {
        "nombre": "Dup", "apellido": "Alumno", "dni": ALUMNO_DNI,
        "fecha_nacimiento": "2015-06-15", "grupo_clase": "1A"
    })
    if r.get("status") == "error":
        ok("DNI alumno duplicado rechazado")
    else:
        fail("DNI alumno duplicado rechazado", "debería devolver status:error")
except Exception as e:
    fail("DNI alumno duplicado rechazado", str(e))

# Obtiene la lista completa de alumnos y comprueba que el alumno recién creado
# aparece en ella. Verifica que la escritura en BD y la lectura son consistentes.
try:
    r = post(s, "/nfc/get_alumnos", {})
    if any(a["dni"] == ALUMNO_DNI for a in r.get("alumnos", [])):
        ok("get_alumnos lista")
    else:
        fail("get_alumnos lista", "alumno de prueba no aparece")
except Exception as e:
    fail("get_alumnos lista", str(e))

# ── PROFESORES ────────────────────────────────────────────────────────────────
section("PROFESORES")

# Crea un profesor de prueba con DNI único. Mismo patrón que con alumnos.
try:
    r = post(s, "/nfc/create_profesor", {
        "nombre": "Test", "apellido": "Profesor",
        "dni": PROFE_DNI, "departamento": "Pruebas"
    })
    if r.get("status") == "ok":
        ok("crear profesor")
    else:
        fail("crear profesor", r.get("message"))
except Exception as e:
    fail("crear profesor", str(e))

# Intenta crear un segundo profesor con el mismo DNI.
# Verifica el constraint unique del modelo nfc.profesor.
try:
    r = post(s, "/nfc/create_profesor", {
        "nombre": "Dup", "apellido": "Profesor",
        "dni": PROFE_DNI, "departamento": "Pruebas"
    })
    if r.get("status") == "error":
        ok("DNI profesor duplicado rechazado")
    else:
        fail("DNI profesor duplicado rechazado", "debería devolver status:error")
except Exception as e:
    fail("DNI profesor duplicado rechazado", str(e))

# Comprueba que el profesor aparece en el listado tras crearlo.
try:
    r = post(s, "/nfc/get_profesores", {})
    if any(p["dni"] == PROFE_DNI for p in r.get("profesores", [])):
        ok("get_profesores lista")
    else:
        fail("get_profesores lista", "profesor de prueba no aparece")
except Exception as e:
    fail("get_profesores lista", str(e))

# ── TARJETAS NFC ──────────────────────────────────────────────────────────────
section("TARJETAS NFC")

# Registra la tarjeta del alumno. Cuando el lector físico detecta una tarjeta
# nueva, llama a este endpoint para darla de alta en el sistema como inactiva.
try:
    r = post(s, "/nfc/registrar_tarjeta", {"uid": UID_ALUMNO})
    if r.get("status") == "ok":
        ok("registrar tarjeta alumno")
    else:
        fail("registrar tarjeta alumno", r.get("message"))
except Exception as e:
    fail("registrar tarjeta alumno", str(e))

# Intenta registrar la misma tarjeta dos veces. El UID tiene un constraint
# unique en nfc.card, por lo que el segundo intento debe fallar.
try:
    r = post(s, "/nfc/registrar_tarjeta", {"uid": UID_ALUMNO})
    if r.get("status") == "error":
        ok("UID duplicado rechazado")
    else:
        fail("UID duplicado rechazado", "debería devolver status:error")
except Exception as e:
    fail("UID duplicado rechazado", str(e))

# Obtiene todas las tarjetas registradas y verifica que la tarjeta del alumno
# está en el listado con su UID correcto.
try:
    r = post(s, "/nfc/get_cards", {})
    if any(c["uid"] == UID_ALUMNO for c in r.get("cards", [])):
        ok("get_cards lista")
    else:
        fail("get_cards lista", "tarjeta no aparece")
except Exception as e:
    fail("get_cards lista", str(e))

# Registra también la tarjeta del profesor, que se usará en los tests de fichaje.
try:
    r = post(s, "/nfc/registrar_tarjeta", {"uid": UID_PROFE})
    if r.get("status") == "ok":
        ok("registrar tarjeta profesor")
    else:
        fail("registrar tarjeta profesor", r.get("message"))
except Exception as e:
    fail("registrar tarjeta profesor", str(e))

# ── ASIGNACIÓN ────────────────────────────────────────────────────────────────
section("ASIGNACIÓN")

# Vincula la tarjeta al alumno por su DNI. El sistema busca primero en profesores
# y luego en alumnos, activa la tarjeta y guarda el UID en el registro del alumno.
try:
    r = post(s, "/nfc/assign_card", {"uid": UID_ALUMNO, "dni": ALUMNO_DNI})
    if r.get("status") == "ok":
        ok("asignar tarjeta a alumno")
    else:
        fail("asignar tarjeta a alumno", r.get("message"))
except Exception as e:
    fail("asignar tarjeta a alumno", str(e))

# Intenta asignar la misma tarjeta (ya activa y vinculada) a otra persona.
# El sistema debe rechazarlo para evitar que una tarjeta tenga dos dueños.
try:
    r = post(s, "/nfc/assign_card", {"uid": UID_ALUMNO, "dni": PROFE_DNI})
    if r.get("status") == "error":
        ok("tarjeta ya asignada rechazada")
    else:
        fail("tarjeta ya asignada rechazada", "debería devolver status:error")
except Exception as e:
    fail("tarjeta ya asignada rechazada", str(e))

# Vincula la segunda tarjeta al profesor. A partir de aquí ambas tarjetas
# están activas y asociadas a su persona correspondiente.
try:
    r = post(s, "/nfc/assign_card", {"uid": UID_PROFE, "dni": PROFE_DNI})
    if r.get("status") == "ok":
        ok("asignar tarjeta a profesor")
    else:
        fail("asignar tarjeta a profesor", r.get("message"))
except Exception as e:
    fail("asignar tarjeta a profesor", str(e))

# ── LECTOR ────────────────────────────────────────────────────────────────────
section("LECTOR")

# Simula que la app Android acerca una tarjeta al lector de recreo.
# Comprueba que el endpoint devuelve el campo permiso_recreo (puede ser True o False,
# lo importante es que el endpoint responde y reconoce la tarjeta).
try:
    r = post(s, "/nfc/check_recreo", {"uid": UID_ALUMNO})
    if "permiso_recreo" in r:
        ok("check_recreo responde")
    else:
        fail("check_recreo responde", r)
except Exception as e:
    fail("check_recreo responde", str(e))

# Igual que check_recreo pero para el lector de transporte escolar.
try:
    r = post(s, "/nfc/check_transporte", {"uid": UID_ALUMNO})
    if "permiso_transporte" in r:
        ok("check_transporte responde")
    else:
        fail("check_transporte responde", r)
except Exception as e:
    fail("check_transporte responde", str(e))

# Registra una entrada del alumno. La entrada siempre está permitida
# independientemente de la edad o permisos del alumno.
try:
    r = post(s, "/nfc/registrar_fichaje_alumno", {"uid": UID_ALUMNO, "tipo": "entrada"})
    if r.get("status") == "ok":
        ok("fichaje alumno entrada")
    else:
        fail("fichaje alumno entrada", r.get("message", r))
except Exception as e:
    fail("fichaje alumno entrada", str(e))

# Intenta registrar una salida del alumno. Como nació en 2015 es menor de 18,
# permiso_salida=False, así que el servidor debe devolver status:denegado.
# Verifica que la lógica de permisos funciona correctamente.
try:
    r = post(s, "/nfc/registrar_fichaje_alumno", {"uid": UID_ALUMNO, "tipo": "salida"})
    if r.get("status") == "denegado":
        ok("fichaje alumno salida sin permiso denegada")
    else:
        fail("fichaje alumno salida sin permiso denegada", r)
except Exception as e:
    fail("fichaje alumno salida sin permiso denegada", str(e))

# Intenta fichar con un UID que no existe en el sistema.
# El servidor debe rechazarlo (status distinto de ok) en lugar de crear
# un fichaje huérfano o lanzar una excepción interna.
try:
    r = post(s, "/nfc/registrar_fichaje_alumno", {"uid": "9999999999", "tipo": "entrada"})
    if r.get("status") != "ok":
        ok("fichaje UID desconocido rechazado")
    else:
        fail("fichaje UID desconocido rechazado", "debería fallar con UID inexistente")
except Exception as e:
    fail("fichaje UID desconocido rechazado", str(e))

# Registra el primer fichaje del profesor. El sistema determina automáticamente
# que es una entrada porque no hay ningún fichaje previo hoy para este profesor.
try:
    r = post(s, "/nfc/registrar_fichaje_profesor", {"uid": UID_PROFE})
    if r.get("status") == "ok" and r.get("movimiento") == "entrada":
        ok("fichaje profesor → entrada")
    else:
        fail("fichaje profesor → entrada", r)
except Exception as e:
    fail("fichaje profesor → entrada", str(e))

# Registra el segundo fichaje del mismo profesor el mismo día.
# El sistema alterna automáticamente: como el último fichaje fue entrada,
# este debe ser salida. Verifica la lógica de auto-toggle diario.
try:
    r = post(s, "/nfc/registrar_fichaje_profesor", {"uid": UID_PROFE})
    if r.get("status") == "ok" and r.get("movimiento") == "salida":
        ok("fichaje profesor auto-toggle → salida")
    else:
        fail("fichaje profesor auto-toggle → salida", r)
except Exception as e:
    fail("fichaje profesor auto-toggle → salida", str(e))

# ── GET FICHAJES ──────────────────────────────────────────────────────────────
section("GET FICHAJES")

# Comprueba que el historial de fichajes de alumnos devuelve al menos
# el fichaje de entrada que se registró justo antes.
try:
    r = post(s, "/nfc/get_fichajes_alumnos", {})
    if r.get("status") == "ok" and len(r.get("fichajes", [])) >= 1:
        ok("get_fichajes_alumnos")
    else:
        fail("get_fichajes_alumnos", r)
except Exception as e:
    fail("get_fichajes_alumnos", str(e))

# Igual para profesores: deben aparecer los dos fichajes (entrada y salida)
# registrados en la sección anterior.
try:
    r = post(s, "/nfc/get_fichajes_profesores", {})
    if r.get("status") == "ok" and len(r.get("fichajes", [])) >= 1:
        ok("get_fichajes_profesores")
    else:
        fail("get_fichajes_profesores", r)
except Exception as e:
    fail("get_fichajes_profesores", str(e))

# ── LIMPIEZA ──────────────────────────────────────────────────────────────────
section("LIMPIEZA")

# Para cada tarjeta: primero se desasigna (pasa a inactiva y se desvincula
# de la persona) y luego se elimina. El orden importa: delete_card falla
# si la tarjeta sigue activa y asignada.
for uid, label in [(UID_ALUMNO, "tarjeta alumno"), (UID_PROFE, "tarjeta profesor")]:
    try:
        post(s, "/nfc/unassign_card", {"uid": uid})
    except Exception:
        pass
    try:
        r = post(s, "/nfc/delete_card", {"uid": uid})
        if r.get("status") == "ok":
            ok(f"borrar {label}")
        else:
            fail(f"borrar {label}", r.get("message"))
    except Exception as e:
        fail(f"borrar {label}", str(e))

# Elimina las personas de prueba. El borrado de alumno/profesor
# hace cascade y elimina también sus fichajes asociados.
for dni, label in [(ALUMNO_DNI, "alumno prueba"), (PROFE_DNI, "profesor prueba")]:
    try:
        r = post(s, "/nfc/delete_persona", {"dni": dni})
        if r.get("status") == "ok":
            ok(f"borrar {label}")
        else:
            fail(f"borrar {label}", r.get("message"))
    except Exception as e:
        fail(f"borrar {label}", str(e))

# Cierra la sesión del administrador.
try:
    r = post(s, "/nfc/logout", {})
    if r.get("status") == "ok":
        ok("logout")
    else:
        fail("logout", r)
except Exception as e:
    fail("logout", str(e))

# ── Resultado ─────────────────────────────────────────────────────────────────
total = ok_count + fail_count
print(f"\nTests completados: {ok_count} OK, {fail_count} FAIL de {total}\n")
if fail_count > 0:
    sys.exit(1)
