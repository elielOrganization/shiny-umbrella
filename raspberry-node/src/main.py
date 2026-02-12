# raspberry-node/src/main.py

import logging
import time

from client_odoo import send_uid_to_odoo
from reader import uid_stream

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s %(name)s: %(message)s",
)

logger = logging.getLogger("raspberry-main")


def main() -> None:
    logger.info("Iniciando simulación de nodo NFC (sin lector físico)...")

    for uid in uid_stream():
        logger.info("UID simulado leído: %s", uid)

        try:
            response = send_uid_to_odoo(uid)
            logger.info("Odoo respondió: %s", response)
        except Exception as exc:  # noqa: BLE001
            logger.error("Error al enviar el UID a Odoo: %s", exc)

        # Para la demo no spammear: espera 5 segundos entre lecturas simuladas
        time.sleep(5)


if __name__ == "__main__":
    main()
