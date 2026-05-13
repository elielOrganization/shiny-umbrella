package com.example.appcode

import android.app.AlertDialog
import android.app.PendingIntent
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Bundle
import android.view.animation.Animation
import android.view.animation.RotateAnimation
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.appcode.databinding.ActivityMainBinding
import com.example.appcode.databinding.DialogLoadingBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {

    // Actualizado para incluir TRANSPORTE
    enum class ModoEscaneo { RECREO, TRANSPORTE, NINGUNO }

    private var modoActual = ModoEscaneo.NINGUNO
    private var nfcAdapter: NfcAdapter? = null
    private lateinit var pendingIntent: PendingIntent
    private var dialogNfc: AlertDialog? = null
    private var dialogLoading: AlertDialog? = null
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Animaciones de entrada para ambos botones
        setupAnimations()

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Botón RECREO
        binding.btnRecreo.setOnClickListener {
            ejecutarClickBoton(it) { prepararEscaneo(ModoEscaneo.RECREO) }
        }

        // Botón TRANSPORTE
        binding.btnTransporte.setOnClickListener {
            ejecutarClickBoton(it) { prepararEscaneo(ModoEscaneo.TRANSPORTE) }
        }
    }

    private fun setupAnimations() {
        val views = listOf(binding.btnRecreo, binding.btnTransporte)
        views.forEachIndexed { index, view ->
            view.alpha = 0f
            view.translationY = 50f
            view.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(800)
                .setStartDelay(300L + (index * 100))
                .start()
        }
    }

    private fun ejecutarClickBoton(view: android.view.View, accion: () -> Unit) {
        view.animate().scaleX(0.95f).scaleY(0.95f).setDuration(100).withEndAction {
            view.animate().scaleX(1f).scaleY(1f).setDuration(100).start()
            accion()
        }.start()
    }

    private fun prepararEscaneo(modo: ModoEscaneo) {
        val adapter = nfcAdapter
        if (adapter == null || !adapter.isEnabled) {
            Toast.makeText(this, "NFC no disponible o desactivado", Toast.LENGTH_SHORT).show()
            return
        }
        modoActual = modo
        mostrarDialogoNFC()
        habilitarNfcForeground()
    }

    private fun mostrarDialogoNFC() {
        if (dialogNfc?.isShowing == true) return
        val view = layoutInflater.inflate(R.layout.dialog_nfc, null)
        dialogNfc = AlertDialog.Builder(this)
            .setView(view)
            .setCancelable(true)
            .setOnCancelListener { resetEstadoEscaneo() }
            .create()
        dialogNfc?.window?.attributes?.windowAnimations = android.R.style.Animation_Dialog
        dialogNfc?.show()
        dialogNfc?.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    }

    private fun mostrarLoading() {
        val loadingBinding = DialogLoadingBinding.inflate(layoutInflater)
        val rotate = RotateAnimation(0f, 360f, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f).apply {
            duration = 1000
            repeatCount = Animation.INFINITE
        }
        loadingBinding.imgLoadingUmbrella.startAnimation(rotate)

        dialogLoading = AlertDialog.Builder(this)
            .setView(loadingBinding.root)
            .setCancelable(false)
            .create()
        dialogLoading?.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialogLoading?.show()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (modoActual == ModoEscaneo.NINGUNO) return

        val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
        tag?.let {
            val uid = tagIdToDecimal(it.id)
            dialogNfc?.dismiss()
            mostrarLoading()
            procesarLecturaNFC(uid)
        }
    }

    private fun procesarLecturaNFC(uidTag: String) {
        lifecycleScope.launch {
            val startTime = System.currentTimeMillis()

            // Determinamos el endpoint y el campo de búsqueda dinámicamente
            val endpoint = if (modoActual == ModoEscaneo.RECREO) "check_recreo" else "check_transporte"
            val campoPermiso = if (modoActual == ModoEscaneo.RECREO) "permiso_recreo" else "permiso_transporte"

            val resultado = realizarPeticionOdoo(uidTag, endpoint, campoPermiso)

            val elapsedTime = System.currentTimeMillis() - startTime
            if (elapsedTime < 1500) delay(1500 - elapsedTime)

            dialogLoading?.dismiss()

            val sdf = SimpleDateFormat("dd/MM/yyyy | HH:mm:ss", Locale.getDefault())
            val fechaHoraActual = sdf.format(Date())

            val servicioTexto = if (modoActual == ModoEscaneo.RECREO) "RECREO" else "TRANSPORTE"
            val estadoTexto = if (resultado == "true") "$servicioTexto ACEPTADO" else "$servicioTexto DENEGADO"

            binding.tvUltimoMovimiento.text = "$fechaHoraActual\n\nUID: $uidTag\n\n$estadoTexto"

            when (resultado) {
                "true" -> mostrarResultado(R.layout.dialog_success, uidTag)
                "false" -> mostrarResultado(R.layout.dialog_error, uidTag)
                else -> {
                    resetEstadoEscaneo()
                    Toast.makeText(this@MainActivity, "Error: $resultado", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private suspend fun realizarPeticionOdoo(uid: String, endpoint: String, campo: String): String = withContext(Dispatchers.IO) {

        val urlEndpoint = "http://10.102.7.196:8069/nfc/$endpoint"
        return@withContext try {
            val url = URL(urlEndpoint)
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            conn.connectTimeout = 5000
            conn.doOutput = true

            val jsonInputString = "{\"jsonrpc\": \"2.0\", \"params\": {\"uid\": \"$uid\"}}"
            conn.outputStream.use { it.write(jsonInputString.toByteArray(Charsets.UTF_8)) }

            if (conn.responseCode == 200) {
                val response = conn.inputStream.bufferedReader().use { it.readText() }

                if (response.contains("\"$campo\": true")) "true" else "false"
            } else {
                "Error ${conn.responseCode}"
            }
        } catch (e: Exception) {
            "Error de conexión"
        }
    }

    private fun mostrarResultado(layoutResId: Int, uidMostrada: String) {
        val view = layoutInflater.inflate(layoutResId, null)
        view.findViewById<TextView>(R.id.txt_uid_report)?.text = "ID : $uidMostrada"

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .setCancelable(true)
            .setOnDismissListener { resetEstadoEscaneo() }
            .create()
        dialog.window?.attributes?.windowAnimations = android.R.style.Animation_Dialog
        dialog.show()
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    }

    private fun resetEstadoEscaneo() {
        modoActual = ModoEscaneo.NINGUNO
        deshabilitarNfcForeground()
    }

    private fun habilitarNfcForeground() {
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
    }

    private fun deshabilitarNfcForeground() {
        try { nfcAdapter?.disableForegroundDispatch(this) } catch (e: Exception) { }
    }

    override fun onResume() {
        super.onResume()
        if (modoActual != ModoEscaneo.NINGUNO) habilitarNfcForeground()
    }

    override fun onPause() {
        super.onPause()
        deshabilitarNfcForeground()
    }

    private fun tagIdToDecimal(id: ByteArray?): String {
        if (id == null) return "S/N"
        var result: Long = 0
        val bytesToProcess = if (id.size > 4) 4 else id.size
        for (i in bytesToProcess - 1 downTo 0) {
            result = (result shl 8) or (id[i].toInt() and 0xFF).toLong()
        }
        return String.format("%010d", result)
    }
}