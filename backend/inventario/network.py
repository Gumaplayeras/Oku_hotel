import paramiko
import time

def reiniciar_switch(switch):
    ip = switch.ip
    marca = switch.marca

    if marca == "Ruckus":
        username = "super"
        password = "9Sistemes15"
    elif marca == "Aruba":
        username = "admin"
        password = "Estocolmo!1"
    else:
        return {"status": "error", "error": f"Marca '{marca}' no soportada para reinicio automático."}

    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(ip, username=username, password=password,
                       timeout=10, allow_agent=False, look_for_keys=False)

        channel = client.invoke_shell()
        time.sleep(1)

        # Descartar cualquier salida inicial
        if channel.recv_ready():
            channel.recv(9999)

        # Intentar entrar en modo enable
        channel.send("enable\n")
        time.sleep(1)
        if channel.recv_ready():
            channel.recv(9999)  # descartar salida del enable

        # Enviar el comando de reinicio
        channel.send("reload\n")
        time.sleep(2)

        start_time = time.time()
        while time.time() - start_time < 10:
            if channel.recv_ready():
                chunk = channel.recv(9999).decode('utf-8', errors='ignore')
                if "Continue" in chunk or "(y/n)" in chunk:
                    channel.send("y\n")
                    break
            time.sleep(0.1)

        time.sleep(2)  # esperar un poco tras confirmar el reinicio

        client.close()
        return {
            "status": "ok",
            "message": f"✅ Reinicio enviado correctamente al switch {switch.nombre} ({switch.ip})"
        }

    except Exception as e:
        return {
            "status": "error",
            "error": f"❌ Error al reiniciar el switch {switch.nombre} ({switch.ip}): {str(e)}"
        }