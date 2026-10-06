# 🚀 Guerra de Clicks en Vivo: JS vs C++

Una aplicación web multijugador interactiva en tiempo real construida para demostrar el poder de los **WebSockets**. Esta dinámica está diseñada para ser ejecutada en el salón de clases, donde todos los estudiantes pueden conectarse desde sus teléfonos celulares y competir en un "tira y afloja" virtual.

## 🎮 ¿De qué trata y cómo funciona?

Es una batalla campal de velocidad. Al ingresar a la página, los usuarios deben elegir su bando: **Team JavaScript** o **Team C++**. 

* **Mecánica:** Cada vez que un jugador presiona el botón de su equipo, empuja la barra central hacia su lado. 
* **Tiempo Real:** Gracias a Socket.io, cada clic se refleja instantáneamente en las pantallas de todos los usuarios conectados sin necesidad de recargar la página.
* **Persistencia:** Cuando un equipo empuja la barra hasta el 100% de su lado, gana la ronda. Las victorias se guardan de forma permanente en un archivo `victorias.json` en el servidor, por lo que el historial sobrevive incluso si se reinicia la aplicación.

## 🛠️ Tecnologías Utilizadas

* **Backend:** Node.js, Express.js
* **Comunicación en Tiempo Real:** Socket.io (WebSockets)
* **Frontend:** HTML5, CSS3, JavaScript Vanilla
* **Base de Datos:** Archivo local JSON (`victorias.json`)

---

## ⚙️ Cómo ejecutarlo en tu propia PC (Paso a Paso)

Si deseas probar el proyecto localmente antes de subirlo a la nube, sigue estos pasos:

### 1. Requisitos previos
Asegúrate de tener instalado **Node.js** en tu computadora. Puedes verificarlo abriendo una terminal (CMD o PowerShell) y escribiendo:
```bash
node -v
```

### 2. Preparar el proyecto
Abre la terminal en la carpeta donde tienes los archivos de tu proyecto y ejecuta el siguiente comando para inicializar tu archivo de configuración (si aún no lo tienes):
```bash
npm init -y
```

### 3. Instalar dependencias
Instala los módulos necesarios (Express para el servidor web y Socket.io para la conexión en tiempo real) ejecutando:
```bash
npm install express socket.io
```

### 4. Iniciar el Servidor
Levanta el servidor local ejecutando:
```bash
npm start
```
Verás un mensaje en la terminal diciendo: `🚀 Guerra Multijugador en puerto 3000`.

### 5. Jugar localmente
1. Abre tu navegador web favorito y entra a: `http://localhost:3000`
2. Para ver la magia de los WebSockets, **abre una segunda pestaña (o una ventana de incógnito)** en esa misma dirección.
3. Presiona los botones en una ventana y verás cómo la barra se mueve instantáneamente en la otra. 
