<style>
    /* --- Overlay General (Fondo oscuro detrás del modal) --- */
    .modal-overlay-custom {
        display: none; /* Oculto por defecto */
        position: fixed;
        z-index: 9999; /* Encima de todo */
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6); /* Fondo negro semitransparente */
        backdrop-filter: blur(3px); /* Efecto borroso moderno */
        align-items: center;
        justify-content: center;
    }

    /* --- Caja del Modal Genérica --- */
    .modal-box-custom {
        background-color: #fff;
        border-radius: 16px;
        padding: 30px;
        width: 90%;
        max-width: 420px; /* Ancho máximo */
        text-align: center;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: modalPopIn 0.3s ease-out;
    }

    @keyframes modalPopIn {
        0% { opacity: 0; transform: scale(0.9) translateY(20px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* --- Estilos Específicos del Modal de Vincular (el primero que hicimos) --- */
    .modal-box-vincular {
        border-top: 6px solid #007bff;
    }
    .pulse-nfc-icon {
        font-size: 4rem;
        color: #007bff;
        margin-bottom: 15px;
        animation: pulse 2s infinite;
    }
    .close-modal-btn {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 24px;
        cursor: pointer;
        color: #94a3b8;
        transition: color 0.2s;
    }
    .close-modal-btn:hover { color: #334155; }


    /* --- Estilos Específicos del Modal de Eliminar (el nuevo) --- */
    .modal-box-delete {
        border-top: 6px solid #ef4444; /* Borde rojo */
    }
    
    .delete-icon-container {
        width: 80px;
        height: 80px;
        background-color: #fef2f2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
    }
    .delete-icon-container i {
        font-size: 3rem;
        color: #ef4444;
    }

    .modal-title h3 {
        margin: 0 0 10px;
        color: #1e293b;
        font-size: 1.5rem;
    }

    .modal-body p {
        color: #64748b;
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 25px;
    }

    .modal-actions-row {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    /* Botones del modal */
    .btn-modal-base {
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
    }

    .btn-modal-cancel {
        background-color: #e2e8f0;
        color: #475569;
    }
    .btn-modal-cancel:hover { background-color: #cbd5e1; }

    .btn-modal-delete {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
    }
    .btn-modal-delete:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4);
    }

</style>

<div id="modalNfc" class="modal-nfc">
    <div class="modal-content-nfc">
        <span class="close-modal">&times;</span>
        <div class="pulse-nfc-icon">
            <i class="fa-solid fa-rss"></i>
        </div>
        <h3>Vinculando NFC</h3>
        <p>Acerque el llavero o tarjeta al lector...</p>
        
        <input type="text" id="nfcInput" style="position: absolute; opacity: 0; pointer-events: none;" autofocus>

        <div id="nfc-status-msg" style="margin-top: 20px; font-weight: bold; color: #555;">
            <small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>
        </div>
    </div>
</div>

<div id="deleteNfcModal" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-delete">
        <div class="delete-icon-container">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="modal-title">
            <h3>¿Estás seguro?</h3>
        </div>
        <div class="modal-body">
            <p>Esta acción eliminará permanentemente la tarjeta con UID <strong id="deleteNfcUidText" style="color: #ef4444; font-family: monospace;"></strong> de la base de datos.</p>
        </div>
        
        <div class="modal-actions-row">
            <button type="button" class="btn-modal-base btn-modal-cancel" id="btnCancelDeleteNfc">Cancelar</button>
            <button type="button" class="btn-modal-base btn-modal-delete" id="btnConfirmDeleteNfc">Sí, eliminar</button>
        </div>
    </div>
</div>

<div id="unlinkNfcModal" class="modal-overlay-custom">
    <div class="modal-box-custom" style="border-top: 6px solid #0b70f5;">
        <div class="delete-icon-container" style="background-color: #ebf2ff;">
            <i class="fa-solid fa-link-slash" style="color: #0b22f5;"></i>
        </div>
        <div class="modal-title">
            <h3>¿Desvincular tarjeta?</h3>
        </div>
        <div class="modal-body">
            <p>La tarjeta <strong id="unlinkNfcUidText" style="color: #0b78f5;"></strong> dejará de estar operativa pero se mantendrá en el sistema.</p>
        </div>
        <div class="modal-actions-row">
            <button type="button" class="btn-modal-base btn-modal-cancel" id="btnCancelUnlinkNfc">Cancelar</button>
            <button type="button" class="btn-modal-base btn-modal-delete btn-orange-shiny" id="btnConfirmUnlinkNfc" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color:white; border:none;">Desvincular</button>
        </div>
    </div>
</div>