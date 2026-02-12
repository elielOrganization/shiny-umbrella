# raspberry-node/src/client_odoo.py

import json
import logging
from typing import Any, Dict

import requests
import config

logger = logging.getLogger(__name__)


def send_uid_to_odoo(uid: str) -> Dict[str, Any]:
    """
    Envía un UID simulado/real a Odoo y devuelve la respuesta JSON.
    Lanza excepción si hay error de red o de respuesta.
    """
    url = config.ODOO_URL.rstrip("/") + config.NFC_ENDPOINT

    payload = {
        "uid": uid,
        "device_id": config.DEVICE_ID,
    }

    headers = {
        "Content-Type": "application/json",
    }

    # Auth opcional por token
    if config.API_TOKEN:
        headers["Authorization"] = f"Bearer {config.API_TOKEN}"

    logger.info("Enviando UID %s a %s", uid, url)

    resp = requests.post(
        url,
        data=json.dumps(payload),
        headers=headers,
        timeout=config.REQUEST_TIMEOUT,
    )
    resp.raise_for_status()

    try:
        data = resp.json()
    except ValueError as exc:
        logger.error("Respuesta de Odoo no es JSON válido: %s", resp.text)
        raise exc

    logger.info("Respuesta de Odoo: %s", data)
    return data
