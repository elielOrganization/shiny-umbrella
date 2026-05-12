<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'Shiny Umbrella'; ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/base.css">
    <link rel="stylesheet" href="../assets/css/layout.css">
    <link rel="stylesheet" href="../assets/css/components.css">
    <link rel="stylesheet" href="../assets/css/tables.css">
    <link rel="stylesheet" href="../assets/css/modals.css">
    <link rel="stylesheet" href="../assets/css/filters.css">
</head>
<body>
    <header class="top-header">
        SHINY UMBRELLA
    </header>

<!-- Modal global de consulta NFC -->
<div id="nfcLookupModal" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-vincular" style="max-width:380px;">
        <button class="close-modal-btn" onclick="document.getElementById('nfcLookupModal').classList.remove('show')">&times;</button>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
            <div style="width:32px;height:32px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;font-size:0.85rem;">
                <i class="fa-solid fa-rss"></i>
            </div>
            <div>
                <div style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Tarjeta detectada</div>
                <div style="font-family:monospace;font-weight:700;color:#1e293b;font-size:0.9rem;" id="nfcLookupUid"></div>
            </div>
        </div>
        <div id="nfcLookupBody"></div>
    </div>
</div>

<style>
.nfc-lookup-person {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 8px 0 4px;
}
.nfc-lookup-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.nfc-lookup-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
}
.nfc-lookup-name {
    font-weight: 700;
    font-size: 1rem;
    color: #1e293b;
}
.nfc-lookup-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
}
.nfc-lookup-badge-prof {
    background: #ede9fe;
    color: #6d28d9;
}
.nfc-lookup-badge-alum {
    background: #dbeafe;
    color: #1d4ed8;
}
.nfc-lookup-notfound {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ef4444;
    font-size: 0.9rem;
    padding: 8px 0 4px;
}
</style>

<script>
    const NFC_LOOKUP_URL = '<?php echo "../controllers/lookup_nfc.php"; ?>';
</script>
<script src="../assets/js/nfc_global.js"></script>