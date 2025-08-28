const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  templates,
  enviarPlantillaWhatsApp,
  enviarPlantillaErrorGenerico,
  enviarMensajeTexto,
  enviarPayload,
  sendOrderPdf,
} = require("./whatsappTemplates");

const { generateOrderPdf } = require("./pdfgenerator");

// Aliases para mayor claridad
const sendTemplateMessage = enviarPlantillaWhatsApp;
const sendTextMessage = enviarMensajeTexto;

async function handleIncomingMessage(payload) {

  // Log de la solicitud entrante para depuración
  fs.appendFileSync(
    "debug_post_log.txt",
    `${new Date().toISOString()} - POST Request: ${JSON.stringify(payload)}\n`
  );

  // Validación básica de la estructura del payload
  const firstEntry = payload.entry?.[0];
  const firstChange = firstEntry?.changes?.[0];
  const firstMessage = firstChange?.value?.messages?.[0];

  if (!firstMessage) {
    //console.log("Payload sin mensajes válidos");
    return;
  }

  const message = firstMessage;
  console.log("\n⇨ ⇨ ⇨ ⇨ Mensaje recibido:", message, "\n");

  if (!message.type) return;
  const palabrasClaveSaludo = [
    "hola", "ola", "holaa", "holaaa", "ola k ase", "ola ke ase",
    "buenos días", "buen dia", "buenos dias", "buenos dias!", "bndias", "wenos dias", "wen dia", "b dia",
    "buenas tardes", "buenas tardez", "bnas tardes", "wenas tardes", "bna tarde", "bna tardecita",
    "buenas noches", "buenas nochess", "buenas nochs", "wenas nochs", "bna noche", "bns noches",
    "qué tal", "q tal", "k tal", "ke tal", "k onda", "ke onda", "q onda",
    "saludos", "sludos", "saludoss", "saluditos", "saludines",
    "qué hay", "k hay", "ke hay", "q hay", "k ai",
    "hey", "ei", "ey", "heyy", "eey", "eyy",
    "holi", "holis", "oli", "olis", "holiwis", "holiwiss",
    "hola a todos", "ola a todos", "holaa a todos", "holaaa a to2", "ola a to2", "ola a tdos",
    "hello", "helo", "jello", "holo", "hello!",
    "hi", "hai", "jai", "hii", "hiii",
  ];
  const from = message.from;

  const contact = firstChange?.value?.contacts?.[0];
  const name = contact?.profile?.name || "Sin nombre";

  const userglobal = {};
  const cartglobal = {};
  const methodsglobal = {};

  if (message.type === "text") {
    const body = message.text?.body?.toLowerCase() || "";
    if (palabrasClaveSaludo.some(p => body.includes(p))) {

      await enviarPlantillaMisce({
        from,
        templateName: "saludo_inicio",
        url: `http://localhost/Store/APIs/store_name.php?type=store`,
      });

    } else {
      await sendTextMessage(from, "*habla bien que no entiendo lo que me dices, ok?*");
    }

  } else if (message.type === "button" && message.button?.payload) {
    const btnPayload = message.button.payload.toLowerCase();
    const btnText = message.button?.text || "";

    if (btnPayload === "buy") {
      await enviarPlantillaDesdeAPIIMAGEN({
        from,
        templateName: "category_desc",
        url: "http://localhost/Store/APIs/category.php",
      });

    } else if (btnPayload.startsWith("btn_payload_") && btnText.toLowerCase() === ("show")) {
      const categoryId = btnPayload.split("_")[2];

      await enviarPlantillaDesdeAPIIMAGEN({
        from,
        templateName: "producto_desc",
        url: `http://localhost/Store/APIs/products-categ.php?id_category=${categoryId}`,
      });

    } else if (btnPayload.startsWith("btn_payload_") && btnText.toLowerCase() === ("add to cart")) {
      const prodId = btnPayload.split("_")[2];

      if (!userglobal[from]) {
        const dataGlobalU = await user_global(from);
        userglobal[from] = dataGlobalU && Object.keys(dataGlobalU).length > 0 ? dataGlobalU : null;
      } else {
      }
      const userd = userglobal[from]
      if (!userd) {
        setTimeout(() => {
          sendTextMessage(from, "_*Searching account....*_");
        }, 1000);

        setTimeout(() => {
          enviarPlantillaWhatsApp(from, "create_acc");
        }, 2000);
      }
      else {
        await add_cart({
          from,
          from,
          userId: userglobal[from].id,
          prodId,
          url: `http://localhost/Store/APIs/cart-user.php`,
        });
      }






    } else if (btnPayload.startsWith("btn_payload_") && btnText.toLowerCase() === ("show all cart")) {
      const userIdd = btnPayload.split("_")[2];

      await enviarPlantillaDesdeAPICart({
        from,
        templateName: "producto_cart_desc",
        url: `http://localhost/Store/APIs/cart-user.php?id_user=${userIdd}`,
      });

    } else if (btnPayload.startsWith("btn_payload_") && btnText.toLowerCase() === ("delete of cart")) {
      const id_product = btnPayload.split("_")[2];

      if (!userglobal[from]) {
        const dataGlobalU = await user_global(from);
        userglobal[from] = dataGlobalU && Object.keys(dataGlobalU).length > 0 ? dataGlobalU : null;
      }

      console.log("Eliminando producto:", id_product, "para usuario:", userglobal[from].id);

      await delete_prod_cart({
        from,
        userId: userglobal[from].id,
        productId: id_product,
        url: `http://localhost/Store/APIs/cart-user.php?id_user=${userglobal[from].id}&id_product=${id_product}`,
      });

    } else if (btnPayload.startsWith("btn_payload_") && btnText.toLowerCase() === ("choose")) {
      const id = btnPayload.split("_")[2];

      if (!userglobal[from]) {
        const dataGlobalU = await user_global(from);
        userglobal[from] = dataGlobalU && Object.keys(dataGlobalU).length > 0 ? dataGlobalU : null;
      }
      const userId = userglobal[from].id;
      const userall = userglobal[from];

      if (!methodsglobal[id]) {
        methodsglobal[id] = await methods_global(id);
      }
      const methodAll = methodsglobal[id];

      if (!cartglobal[userId]) {
        const dataGlobalC = await cart_global(userId);
        cartglobal[userId] = dataGlobalC.length > 0 ? dataGlobalC : [];
      }

      const cartAll = cartglobal[userId];
      let totalGeneral = 0;

      const carritos = {};
      cartAll.forEach(item => {
        if (!carritos[item.cart_id]) carritos[item.cart_id] = [];
        carritos[item.cart_id].push(item);
      });

      Object.keys(carritos).forEach((cartId) => {
        const items = carritos[cartId];
        let totalCarrito = 0;

        items.forEach(producto => {
          const subtotal = producto.price * producto.amount;
          totalCarrito += subtotal;
        });
        totalGeneral += totalCarrito;
      });

      /*
      await enviarPlantillaDesdeAPI({
        from,
        templateName: "cart_totall",
        url: `http://localhost/Store/APIs/total-user.php?id_user=${userglobal[from].id}`,
      });
      */

      await create_payments({
        from,
        userdata: userall,
        methoddata: methodAll,
        cartdata: cartAll,
        cartTotal: totalGeneral,
        id_user: userId,
        id_method: id,
        url: `http://localhost/Store/APIs/carts-user.php`,
      });

    } else if (btnPayload === "cart") {

      if (!userglobal[from]) {
        const dataGlobalU = await user_global(from);
        userglobal[from] = dataGlobalU && Object.keys(dataGlobalU).length > 0 ? dataGlobalU : null;
      }

      if (!userglobal[from]) {
        await verify_user({
          from,
          url: `http://localhost/Store/APIs/user.php?phone=${from}`,
        });
      } else {
        await enviarPlantillaMisce({
          from,
          templateName: "account",
          url: `http://localhost/Store/APIs/user.php?phone=${from}`,
        });

      }

    } else if (btnPayload === "create") {
      await create_user({
        from,
        name,
        url: `http://localhost/Store/APIs/user.php`,
      });

    } else if (btnPayload === "buy cart") {

      if (!userglobal[from]) {
        const dataGlobalU = await user_global(from);
        userglobal[from] = dataGlobalU && Object.keys(dataGlobalU).length > 0 ? dataGlobalU : null;
      }
      /*
      await enviarPlantillaDesdeAPI({
        from,
        templateName: "cart_totall",
        url: `http://localhost/Store/APIs/total-user.php?id_user=${userglobal[from].id}`,
      });
      */

      await enviarPlantillaDesdeAPIIMAGEN({
        from,
        templateName: "method",
        url: `http://localhost/Store/APIs/methods.php?type=method`,
      });

    } else if (btnPayload === "yes") {
      await sendTemplateMessage(from, "inicio");

    } else if (btnPayload === "no") {
      await sendTextMessage(from, "¡Thanks for visiting us!");

    } else if (btnPayload === "back") {
      await sendTemplateMessage(from, "inicio");

    }
  }
}

async function enviarPlantillaDesdeAPIIMAGEN({ from, url, templateName }) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    //console.log("API Response full:", data);

    if (!data || data.length === 0) {
      await sendTextMessage(from, "_*Content not available right now*_");
      await enviarPlantillaWhatsApp(from, "return");
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("API response is not an array or is empty");
    }
    await sendTextMessage(from, "_*Choose one of the options below*_");

    for (const item of data) {
      const imageUrl = item.image || item.imagen || null;

      const bodyParams = [];


      for (const [key, value] of Object.entries(item)) {
        if (key.toLowerCase() === "image" || key.toLowerCase() === "imagen") continue;
        const textValue = value != null ? String(value) : "";
        bodyParams.push({ type: "text", text: textValue });
      }

      //
      const id = item.id ? String(item.id) : null;
      const buttonPayload = id ? `btn_payload_${id}` : null;

      item.id = id;
      const components = [];

      if (imageUrl) {
        components.push({
          type: "header",
          parameters: [{ type: "image", image: { link: imageUrl } }],
        });
      }

      if (bodyParams.length > 0) {
        components.push({
          type: "body",
          parameters: bodyParams,
        });
      }

      //
      if (buttonPayload) {
        components.push({
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [
            {
              type: "payload",
              payload: buttonPayload,
            },
          ],
        });
        console.log("\n----------------- ID del boton: ", buttonPayload, " -----------------");
      }

      await enviarPayload(from, templateName, components);
    }

  } catch (error) {
    console.error("Error enviando plantillas múltiples:", error.message);
    await sendTextMessage(from, "_*Content not available right now*_");
    await enviarPlantillaWhatsApp(from, "return");
  }
  setTimeout(() => {
    enviarPlantillaWhatsApp(from, "return");
  }, 1500);
}

async function enviarPlantillaDesdeAPICart({ from, url, templateName }) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    //console.log("API Response full:", data);

    if (!data || data.length === 0) {
      await sendTextMessage(from, "_*No items found in the cart*_");
      await enviarPlantillaWhatsApp(from, "return");
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("API response is not an array or is empty");
    }
    await sendTextMessage(from, "_*Products in the cart:*_");

    for (const item of data) {
      const imageUrl = item.image || item.imagen || null;

      const bodyParams = [];


      for (const [key, value] of Object.entries(item)) {
        if (key.toLowerCase() === "image" || key.toLowerCase() === "imagen") continue;
        const textValue = value != null ? String(value) : "";
        bodyParams.push({ type: "text", text: textValue });
      }

      //
      const id = item.id ? String(item.id) : null;
      const buttonPayload = id ? `btn_payload_${id}` : null;

      item.id = id;
      const components = [];

      if (imageUrl) {
        components.push({
          type: "header",
          parameters: [{ type: "image", image: { link: imageUrl } }],
        });
      }

      if (bodyParams.length > 0) {
        components.push({
          type: "body",
          parameters: bodyParams,
        });
      }

      //
      if (buttonPayload) {
        components.push({
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [
            {
              type: "payload",
              payload: buttonPayload,
            },
          ],
        });
        console.log("\n----------------- ID del boton: ", buttonPayload, " -----------------");
      }

      await enviarPayload(from, templateName, components);
    }

  } catch (error) {
    console.error("Error enviando plantillas múltiples:", error.message);
    await sendTextMessage(from, "_*Content not available right now*_");
    await enviarPlantillaWhatsApp(from, "return");
  }
  setTimeout(() => {
    enviarPlantillaWhatsApp(from, "cart_buy");
  }, 1000);
}

async function enviarPlantillaMisce({ from, url, templateName }) {

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    //console.log("API Response full:", data);

    if (!data || data.length === 0) {
      await sendTextMessage(from, "_*Content not available right now*_");
      await enviarPlantillaWhatsApp(from, "return");
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("API response is not an array or is empty");
    }

    for (const item of data) {
      const imageUrl = item.image || item.imagen || null;

      const bodyParams = [];


      for (const [key, value] of Object.entries(item)) {
        if (key.toLowerCase() === "image" || key.toLowerCase() === "imagen") continue;
        const textValue = value != null ? String(value) : "";
        bodyParams.push({ type: "text", text: textValue });
      }

      //
      const id = item.id ? String(item.id) : null;
      const buttonPayload = id ? `btn_payload_${id}` : null;

      item.id = id;
      const components = [];

      if (imageUrl) {
        components.push({
          type: "header",
          parameters: [{ type: "image", image: { link: imageUrl } }],
        });
      }

      if (bodyParams.length > 0) {
        components.push({
          type: "body",
          parameters: bodyParams,
        });
      }

      //
      if (buttonPayload) {
        components.push({
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [
            {
              type: "payload",
              payload: buttonPayload,
            },
          ],
        });
        console.log("\n----------------- ID del boton: ", buttonPayload, " -----------------");
      }

      await enviarPayload(from, templateName, components);
    }

  } catch (error) {
    console.error("Error enviando plantillas múltiples:", error.message);
    await sendTextMessage(from, "_*Content not available right now*_");
    await enviarPlantillaWhatsApp(from, "return");
  }
}

async function verify_user({ from, url }) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();

    if (!data || data.length === 0) {
      await enviarPlantillaWhatsApp(from, "create_acc");
      return;
    } else {
      await enviarPlantillaMisce({
        from,
        templateName: "account",
        url: `http://localhost/Store/APIs/user.php?phone=${from}`,
      });
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("API response is not an array or is empty");
    }

  } catch (error) {
    console.error("Error enviando plantillas múltiples:", error.message);
    await sendTextMessage(from, "_*Content not available right now*_");
    await enviarPlantillaWhatsApp(from, "return");
  }
}

async function create_user({ from, name, url }) {
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: from, name: name })
    });

    const contenido = await respuesta.text();

    let datos;
    try {
      datos = JSON.parse(contenido);
    } catch (error) {
      console.error("Respuesta no es JSON válido:", contenido);
      return;
    }

    if (!Array.isArray(datos) || datos.length === 0) {
      console.warn("PHP devolvió un array vacío o inválido:", datos);
      return;
    }

    await sendTextMessage(from, "*Account created!*");

    setTimeout(() => {
      sendTextMessage(from, "_*Searching account....*_");
    }, 1000);

    setTimeout(() => {
      verify_user({
        from,
        url: `http://localhost/Store/APIs/user.php?phone=${from}`,
      });
    }, 2000);


  } catch (error) {
    console.error("Error enviando plantillas:", error);
  }
}

async function create_payments({ from, userdata, methoddata, cartdata, cartTotal, id_user, id_method, url }) {
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_user: id_user, id_method: id_method })
    });

    const contenido = await respuesta.text();

    let datos;
    try {
      datos = JSON.parse(contenido);
    } catch (error) {
      console.error("Respuesta no es JSON válido:", contenido);
      return;
    }

    if (!Array.isArray(datos) || datos.length === 0) {
      await sendTextMessage(from, "*Payment created!*");

      // Datos usuario y carrito
      const user = userdata;
      const cart = cartdata;
      const method = methoddata;
      const ttcart = cartTotal;

      // Generar PDF
      const { publicUrl } = generateOrderPdf(user, cart, method, ttcart, id_method);

      // Enviar PDF
      await sendOrderPdf(from, publicUrl);

    }



  } catch (error) {
    console.error("Error enviando plantillas:", error);
  }
}

async function add_cart({ from, prodId, userId, url }) {
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_user: userId, id_product: prodId })
    });

    const contenido = await respuesta.text();

    let datos;
    try {
      datos = JSON.parse(contenido);
    } catch (error) {
      console.error("Respuesta no es JSON válido:", contenido);
      return;
    }

    if (!Array.isArray(datos) || datos.length === 0) {
      console.warn("PHP devolvió un array vacío o inválido:", datos);
      return;
    }

    await sendTextMessage(from, "*Added to cart!*");

    setTimeout(() => {
      enviarPlantillaDesdeAPIIMAGEN({
        from,
        templateName: "category_desc",
        url: "http://localhost/Store/APIs/category.php",
      });
    }, 1000);


  } catch (error) {
    console.error("🚨 Error enviando plantillas:", error);
  }
}

async function user_global(from) {
  try {
    const response = await fetch(`http://localhost/Store/APIs/user.php?phone=${from}`);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();

    // Si es un array y tiene al menos un usuario, regresamos el primero
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return {};
  } catch (error) {
    console.error("Error buscando usuario:", error);
    return {};
  }
}

async function cart_global(userid) {
  try {
    const response = await fetch(`http://localhost/Store/APIs/carts-user.php?id_user=${userid}`);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();

    // Si es un array, regresamos todo el array
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }

    return []; // en vez de {} devolvemos un array vacío
  } catch (error) {
    console.error("Error buscando usuario:", error);
    return [];
  }
}

async function methods_global(id) {
  try {
    const response = await fetch(`http://localhost/Store/APIs/pdf-method.php?type=method&id=${id}`);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();

    // Tomamos solo el primer elemento del array
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; // <-- solo el primer registro
    }

    return null; // si no hay nada
  } catch (error) {
    console.error("Error buscando método:", error);
    return null;
  }
}

async function delete_prod_cart({ from, userId, productId, url }) {
  try {
    const respuesta = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: new URLSearchParams({
        id_user: userId,
        id_product: productId,
      }),
    });

    if (!data || data.length === 0) {
      await sendTextMessage(from, "_*Content not available right now*_");
      await enviarPlantillaWhatsApp(from, "return");
      return;
    }


    const contenido = await respuesta.text();
    console.log("🗑 Respuesta DELETE:", contenido);


    let datos;
    try {
      datos = JSON.parse(contenido);
    } catch (error) {
      console.error("❌ Respuesta DELETE no es JSON válido:", contenido);
      return;
    }

    if (datos.success) {
      await sendTextMessage(from, "*Product removed!*");
    } else {
      await sendTextMessage(from, "_*Try again later*_");
    }

    if (!contenido || contenido.length === 0) {
      await sendTextMessage(from, "_*No items found in the cart*_");
      await enviarPlantillaWhatsApp(from, "return");
      return;
    } else {
      setTimeout(() => {
        sendTextMessage(from, "_*Showing Products again....*_");
      }, 1000);

      setTimeout(() => {
        enviarPlantillaDesdeAPICart({
          from,
          templateName: "producto_cart_desc",
          url: `http://localhost/Store/APIs/cart-user.php?id_user=${userId}`,
        });
      }, 2000);

    }

  } catch (error) {
    console.error("🚨 Error eliminando producto del carrito:", error);
    await sendTextMessage(from, "_*Error al procesar tu solicitud*_");
  }
}



module.exports = handleIncomingMessage;
