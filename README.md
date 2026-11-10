# WhatsApp E-Commerce Chatbot

Bot de comercio electrónico automatizado para **WhatsApp** utilizando la **WhatsApp Cloud API** (Meta Graph API) y **Node.js con Express**. Permite a los clientes explorar categorías, ver catálogos de productos con imágenes, administrar su carrito de compras, registrarse, seleccionar métodos de pago y recibir automáticamente un ticket o comprobante de compra en formato PDF directamente en su chat.

---

## Características Principales

- **Flujo Conversacional Interactivo**:
  - Reconocimiento de saludos y respuestas contextuales con mensajes y botones interactivos de WhatsApp.
- **Catálogo de Productos y Categorías**:
  - Consulta dinámica de categorías y productos con imágenes, descripciones y precios desde la base de datos.
- **Gestión de Carrito de Compras**:
  - Agregar productos al carrito.
  - Ver el detalle de los productos y cálculo de subtotales y totales.
  - Eliminación de ítems del carrito.
- **Gestión de Usuarios**:
  - Detección y validación de clientes por número telefónico.
  - Registro automático o creación de cuentas desde el chat.
- **Procesamiento de Pedidos y Métodos de Pago**:
  - Selección de opciones de pago configuradas en el sistema.
- **Generación de Comprobantes PDF**:
  - Creación dinámica de tickets/recibos en PDF usando `pdfkit`.
  - Envío automático del documento PDF al usuario a través de WhatsApp.
- **Sistema de Logs y Diagnóstico**:
  - Registro de eventos de webhooks, peticiones entrantes y depuración en `logs/api_log.txt` y `debug_post_log.txt`.

---

## Tecnologías Utilizadas

- **Runtime & Servidor**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **API WhatsApp**: [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) (Meta Graph API `v23.0`)
- **Peticiones HTTP**: [Axios](https://axios-http.com/)
- **Generación de PDFs**: [PDFKit](https://pdfkit.org/)
- **Backend de Tienda**: PHP (APIs REST)
- **Base de Datos**: MySQL / MariaDB
- **Variables de Entorno**: [Dotenv](https://github.com/motdotla/dotenv)

---

## ⚙️ Requisitos Previos

1. **Node.js** (versión 16.x o superior) y **npm**.
2. **Cuenta de Desarrollador en Meta**:
   - Crear una aplicación de tipo Negocios (Business) en [Meta for Developers](https://developers.facebook.com/).
   - Configurar el producto de **WhatsApp**.
   - Obtener:
     - `ACCESS_TOKEN` (Token de acceso temporal o permanente del sistema).
     - `PHONE_NUMBER_ID` (Identificador del número de teléfono de WhatsApp).
     - Configurar un `VERIFY_TOKEN` personalizado.
     - Construir las platillas de respuesta.
3. **Servidor con soporte PHP y MySQL** (ej. XAMPP, AlwaysData, cPanel o similar) para alojar la carpeta `Store/`.
4. **Túnel o dominio público HTTPS**:
   - Meta requiere HTTPS para el Webhook (puedes usar [ngrok](https://ngrok.com/) para pruebas locales o servicios como Render/Railway en producción).

---

## Configuración e Instalación

### Instalar dependencias

```bash
npm install
```

### Configurar la base de datos y backend PHP

1. Importa el archivo `Store/store.sql` o `db` en tu servidor MySQL.
2. Configura los parámetros de conexión en [Store/global.php](file:///c:/Chatbot/Store/global.php) o [Store/conexion.php](file:///c:/Chatbot/Store/conexion.php) (host, usuario, contraseña y base de datos).
3. Asegúrate de que las APIs de `Store/APIs/` sean accesibles vía HTTP/HTTPS.

### Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en el archivo de ejemplo:

```env
# Token personalizado para la verificación del Webhook en Meta
VERIFY_TOKEN=tu_token_de_verificacion_aqui

# Puerto de escucha del servidor Express
PORT=3001

# Token de acceso de WhatsApp Cloud API (Graph API)
ACCESS_TOKEN=tu_meta_access_token_aqui

# Identificador del número de teléfono de WhatsApp Business
PHONE_NUMBER_ID=tu_phone_number_id_aqui

# URL pública donde está desplegado el servidor Express (para servir los PDFs)
PUBLIC_BASE_URL=https://tu-dominio-express.com

# URL base donde están alojadas las APIs de la tienda (carpeta Store/APIs)
PUBLIC_DB_URL=https://tu-dominio-php.com/
```

---

## Ejecución del Proyecto

### Iniciar el servidor

```bash
npm start
```

El servidor iniciará escuchando en el puerto configurado.

---

## Configuración del Webhook en Meta

1. Dirígete a la consola de **Meta for Developers** > Tu App > **WhatsApp** > **Configuración**.
2. En la sección **Webhook**, haz clic en **Editar**:
   - **URL de devolución de llamada**: `https://tu-dominio-publico.com/webhook`
   - **Token de verificación**: El mismo valor asignado en `VERIFY_TOKEN` en tu archivo `.env`.
3. Haz clic en **Verificar y guardar**.
4. En los campos del Webhook, suscríbete al menos al evento `messages`.

---

## Flujo de Navegación del Chatbot

1. **Saludo**: El usuario envía un saludo (ej. *"Hola"*, *"Buenos días"*).
2. **Menú de Inicio**: El bot responde con la plantilla `saludo_inicio` y opciones interactivas.
3. **Catálogo de Categorías**:
   - Al seleccionar *"Buy"*, se consultan las categorías de la tienda y se muestran con su imagen y botón para ver productos.
4. **Productos**:
   - Al pulsar *"Show"* en una categoría, se despliegan los productos asociados.
   - Cada producto cuenta con botón *"Add to cart"*.
5. **Carrito de Compras**:
   - Al agregar productos, se valida la cuenta del usuario.
   - Si no existe, se solicita crearla (`create_acc`).
   - El usuario puede consultar su carrito (`show all cart`) o eliminar productos (`delete of cart`).
6. **Checkout y Pago**:
   - Al confirmar el pedido (`buy cart`), se presentan los métodos de pago.
   - Tras elegir el método de pago (`choose`), se calcula el total, se registra el pago en la base de datos y se genera el recibo en PDF.
7. **Entrega del Recibo**:
   - El bot envía el PDF directamente en la conversación de WhatsApp con las instrucciones finales.
---