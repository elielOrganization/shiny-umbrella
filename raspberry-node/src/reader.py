# raspberry-node/src/reader.py

import random
import string
from typing import Generator


def generate_fake_uid() -> str:
    """
    Genera un UID hexadecimal simulado, similar a lo que daría un lector NFC.
    Ejemplo: '04A1B2C3D4'
    """
    length = random.choice([8, 10])  # longitudes típicas
    return "".join(random.choice("0123456789ABCDEF") for _ in range(length))


def uid_stream() -> Generator[str, None, None]:
    """
    Simula un flujo infinito de lecturas de tarjetas.

    En producción, aquí iría la integración real con el lector NFC
    (bloqueando hasta que alguien acerque una tarjeta).
    """
    while True:
        yield generate_fake_uid()
