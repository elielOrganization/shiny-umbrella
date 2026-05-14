package com.example.appcode

import android.app.AlertDialog
import android.app.PendingIntent
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Bundle
import android.text.Spannable
import android.text.SpannableStringBuilder
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.appcode.databinding.ActivityMainBinding
import com.example.appcode.databinding.DialogLoadingBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {

    enum class ModoEscaneo(val endpoint: String, val campo: String, val label: String) {
        RECREO("check_recreo", "permiso_recreo", "RECREO"),
        TRANSPORTE("check_transporte", "permiso_transporte", "TRANSPORTE"),
        NINGUNO("", "", "")
    }

    companion object {
        private const val SERVER_IP = "10.102.6.212"
    }

    data class ResultadoOdoo(
        val permiso: String,
        val nombreCompleto: String
    )

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

        setupAnimations()

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        binding.btnRecreo.setOnClickListener {
            ejecutarClickBoton(it) { prepararEscaneo(ModoEscaneo.RECREO) }
        }

        binding.btnTransporte.setOnClickListener {
            ejecutarClickBoton(it) { prepararEscaneo(ModoEscaneo.TRANSPORTE) }
        }
    }

    private fun setupAnimations() {
        binding.logoUmbrella.apply {
            scaleX = 0f
            scaleY = 0f
            alpha = 0f
            animate()
                .scaleX(1f).scaleY(1f).alpha(1f)
                .setDuration(600)
                .setInterpolator(OvershootInterpolator(1.5f))
                .withEndAction { startLogoPulse() }
                .start()
        }

        binding.header.apply {
            alpha = 0f
            translationY = -20f
            animate()
                .alpha(1f).translationY(0f)
                .setDuration(500)
                .setStartDelay(250)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }

        listOf(binding.btnRecreo, binding.btnTransporte).forEachIndexed { index, view ->
            view.alpha = 0f
            view.translationY = 90f
            view.animate()
                .alpha(1f).translationY(0f)
                .setDuration(550)
                .setStartDelay(350L + (index * 130))
                .setInterpolator(DecelerateInterpolator(1.8f))
                .start()
        }

        binding.cardMovement.apply {
            alpha = 0f
            translationY = 40f
            animate()
                .alpha(1f).translationY(0f)
                .setDuration(450)
                .setStartDelay(650)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }
    }

    private fun startLogoPulse() {
        binding.logoUmbrella.animate()
            .scaleX(1.06f).scaleY(1.06f)
            .setDuration(1000)
            .setInterpolator(AccelerateDecelerateInterpolator())
            .withEndAction {
                binding.logoUmbrella.animate()
                    .scaleX(1f).scaleY(1f)
                    .setDuration(1000)
                    .setInterpolator(AccelerateDecelerateInterpolator())
                    .withEndAction { startLogoPulse() }
                    .start()
            }
            .start()
    }

    private fun ejecutarClickBoton(view: android.view.View, accion: () -> Unit) {
        view.animate().scaleX(0.96f).scaleY(0.96f).setDuration(100).withEndAction {
            view.animate().scaleX(1f).scaleY(1f).setDuration(150)
                .setInterpolator(OvershootInterpolator(2f)).start()
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
        dialogNfc?.window?.attributes?.windowAnimations = R.style.DialogAnimation
        dialogNfc?.show()
        dialogNfc?.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    }

    private fun mostrarLoading() {
        val loadingBinding = DialogLoadingBinding.inflate(layoutInflater)
        dialogLoading = AlertDialog.Builder(this)
            .setView(loadingBinding.root)
            .setCancelable(false)
            .create()
        dialogLoading?.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialogLoading?.window?.attributes?.windowAnimations = R.style.DialogAnimation
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
            val resultado = realizarPeticionOdoo(uidTag, modoActual.endpoint, modoActual.campo)

            val elapsed = System.currentTimeMillis() - startTime
            if (elapsed < 1500) delay(1500 - elapsed)

            dialogLoading?.dismiss()

            val fechaHora = SimpleDateFormat("dd/MM/yyyy | HH:mm:ss", Locale.getDefault()).format(Date())
            val estadoTexto = if (resultado.permiso == "true") "✓ ${modoActual.label} ACEPTADO" else "✗ ${modoActual.label} DENEGADO"
            val colorEstado = if (resultado.permiso == "true")
                ContextCompat.getColor(this@MainActivity, R.color.umbrella_green)
            else
                ContextCompat.getColor(this@MainActivity, R.color.umbrella_red)

            val nombreMostrar = resultado.nombreCompleto.ifBlank { "Alumno desconocido" }
            val textoBase = "$fechaHora\n$nombreMostrar\n\n"
            val fullText  = textoBase + estadoTexto
            val spannable = SpannableStringBuilder(fullText)
            spannable.setSpan(ForegroundColorSpan(colorEstado), textoBase.length, fullText.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            spannable.setSpan(StyleSpan(Typeface.BOLD), textoBase.length, fullText.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            binding.tvUltimoMovimiento.text = spannable

            when (resultado.permiso) {
                "true"  -> mostrarResultado(R.layout.dialog_success, nombreMostrar)
                "false" -> mostrarResultado(R.layout.dialog_error, nombreMostrar)
                else    -> {
                    resetEstadoEscaneo()
                    Toast.makeText(this@MainActivity, "Error: ${resultado.permiso}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private suspend fun realizarPeticionOdoo(uid: String, endpoint: String, campo: String): ResultadoOdoo = withContext(Dispatchers.IO) {
        return@withContext try {
            val conn = URL("http://$SERVER_IP:8069/nfc/$endpoint").openConnection() as HttpURLConnection
            conn.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                connectTimeout = 5000
                doOutput = true
            }
            conn.outputStream.use { it.write("{\"jsonrpc\":\"2.0\",\"params\":{\"uid\":\"$uid\"}}".toByteArray(Charsets.UTF_8)) }

            if (conn.responseCode == 200) {
                val result = JSONObject(conn.inputStream.bufferedReader().use { it.readText() }).optJSONObject("result")
                    ?: return@withContext ResultadoOdoo("Error de respuesta", "")
                val permiso = if (result.optBoolean(campo)) "true" else "false"
                val nombre  = "${result.optString("nombre", "")} ${result.optString("apellido", "")}".trim()
                ResultadoOdoo(permiso, nombre)
            } else {
                ResultadoOdoo("Error ${conn.responseCode}", "")
            }
        } catch (e: Exception) {
            ResultadoOdoo("Error de conexión", "")
        }
    }

    private fun mostrarResultado(layoutResId: Int, nombreAlumno: String) {
        val view = layoutInflater.inflate(layoutResId, null)
        view.findViewById<TextView>(R.id.txt_uid_report)?.text = nombreAlumno

        val imgView = view.findViewById<ImageView>(R.id.img_success_icon)
            ?: view.findViewById<ImageView>(R.id.img_error_icon)

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .setCancelable(true)
            .setOnDismissListener { resetEstadoEscaneo() }
            .create()
        dialog.window?.attributes?.windowAnimations = R.style.DialogAnimation
        dialog.show()
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        imgView?.apply {
            scaleX = 0f
            scaleY = 0f
            alpha = 0f
            animate()
                .scaleX(1f).scaleY(1f).alpha(1f)
                .setDuration(550)
                .setStartDelay(150)
                .setInterpolator(OvershootInterpolator(2.5f))
                .withEndAction {
                    animate()
                        .scaleX(1.08f).scaleY(1.08f)
                        .setDuration(180)
                        .setInterpolator(AccelerateDecelerateInterpolator())
                        .withEndAction {
                            animate()
                                .scaleX(1f).scaleY(1f)
                                .setDuration(180)
                                .setInterpolator(AccelerateDecelerateInterpolator())
                                .start()
                        }.start()
                }.start()
        }
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
        var result = 0L
        for (i in (minOf(id.size, 4) - 1) downTo 0) {
            result = (result shl 8) or (id[i].toInt() and 0xFF).toLong()
        }
        return "%010d".format(result)
    }
}
