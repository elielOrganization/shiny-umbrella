<?php
/**
 * logger.php — Log ligero a fichero para depuración.
 * Uso: odoo_log('login', 'mensaje', $contexto_opcional);
 * Fichero: logs/odoo.log  (se crea automáticamente)
 */

define('LOG_FILE', __DIR__ . '/../logs/odoo.log');
define('LOG_MAX_BYTES', 512 * 1024); // rotar al llegar a 512 KB

function odoo_log(string $tag, string $msg, mixed $context = null): void
{
    $dir = dirname(LOG_FILE);
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    // Rotar si el fichero es demasiado grande
    if (file_exists(LOG_FILE) && filesize(LOG_FILE) > LOG_MAX_BYTES) {
        rename(LOG_FILE, LOG_FILE . '.bak');
    }

    $ts      = date('Y-m-d H:i:s');
    $ctx     = $context !== null ? ' | ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
    $line    = "[{$ts}] [{$tag}] {$msg}{$ctx}" . PHP_EOL;

    file_put_contents(LOG_FILE, $line, FILE_APPEND | LOCK_EX);
}
