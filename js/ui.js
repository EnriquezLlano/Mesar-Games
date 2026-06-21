// ============================================================
// ui.js — Capa de presentación
//
// Responsabilidad exclusiva: construir y manipular el DOM.
// Esta capa no contiene lógica de negocio ni accede
// directamente a los arreglos de datos. Recibe estructuras
// de datos ya procesadas desde app.js y las convierte
// en elementos HTML.
// ============================================================


// ------------------------------------------------------------
// CATÁLOGO — renderizado de tarjetas
// ------------------------------------------------------------

function formatearPrecio(precio) {
  return "$" + precio.toLocaleString("es-AR");
}

function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("tarjeta");
  if (producto.estado === "agotado") tarjeta.classList.add("tarjeta-agotada");

  const imagenHTML = producto.imagen_url
    ? `<img class="tarjeta-imagen" src="${producto.imagen_url}" alt="${producto.titulo}" />`
    : `<div class="tarjeta-imagen-placeholder">Sin imagen</div>`;

  tarjeta.innerHTML = `
    ${imagenHTML}
    <div class="tarjeta-cuerpo">
      <span class="tarjeta-categoria">${producto.categoria}</span>
      <h2 class="tarjeta-titulo">${producto.titulo}</h2>
      <p class="tarjeta-precio">${formatearPrecio(producto.precio)}</p>
    </div>
    <div class="tarjeta-pie">
      <span class="badge badge-${producto.estado}">${producto.estado}</span>
      <a href="detalle.html?id=${producto.id_producto}" class="btn btn-primario">
        Ver detalle
      </a>
    </div>
  `;

  return tarjeta;
}

function renderizarCatalogo(lista) {
  const grid = document.getElementById("catalogo-grid");
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = `
      <p style="color: var(--color-texto-suave); grid-column: 1/-1; font-style: italic;">
        No se encontraron productos.
      </p>`;
    return;
  }

  for (let i = 0; i < lista.length; i++) {
    grid.appendChild(crearTarjetaProducto(lista[i]));
  }
}


// ------------------------------------------------------------
// FORMULARIO DE PUBLICACIÓN
// ------------------------------------------------------------

function renderizarOpcionesVendedor() {
  const select = document.getElementById("campo-vendedor");
  if (!select) return;
  select.innerHTML = "";
  for (let i = 0; i < vendedores.length; i++) {
    const opcion = document.createElement("option");
    opcion.value = vendedores[i].id_vendedor;
    opcion.textContent = vendedores[i].nombre;
    select.appendChild(opcion);
  }
}

function mostrarError(idError, visible) {
  const el = document.getElementById(idError);
  if (!el) return;
  if (visible) {
    el.classList.add("visible");
  } else {
    el.classList.remove("visible");
  }
}

function limpiarFormulario() {
  const campos = ["campo-titulo", "campo-descripcion", "campo-precio",
    "campo-stock", "campo-categoria", "campo-jugadores-min",
    "campo-jugadores-max", "campo-edad", "campo-imagen"];
  for (let i = 0; i < campos.length; i++) {
    const el = document.getElementById(campos[i]);
    if (el) el.value = "";
  }
  const errores = ["error-titulo", "error-descripcion", "error-precio",
    "error-stock", "error-categoria", "error-jugadores"];
  for (let i = 0; i < errores.length; i++) {
    mostrarError(errores[i], false);
  }
}


// ------------------------------------------------------------
// DETALLE DE PRODUCTO
// ------------------------------------------------------------

function renderizarDetalle(producto, vendedor) {
  const contenedor = document.getElementById("detalle-contenedor");
  if (!contenedor) return;

  const imagenHTML = producto.imagen_url
    ? `<img class="detalle-imagen" src="${producto.imagen_url}" alt="${producto.titulo}" />`
    : `<div class="detalle-imagen-placeholder">Sin imagen</div>`;

  const botonDeshabilitado = producto.estado === "agotado" ? "disabled" : "";

  contenedor.innerHTML = `
    <a href="index.html" class="btn btn-secundario"
       style="display:inline-block; margin-bottom:1.5rem;">
      ← Volver al catálogo
    </a>
    <div class="detalle-contenedor">
      ${imagenHTML}
      <div class="detalle-info">
        <span class="detalle-categoria">${producto.categoria}</span>
        <h1 class="detalle-titulo">${producto.titulo}</h1>
        <p class="detalle-precio">${formatearPrecio(producto.precio)}</p>
        <p class="detalle-descripcion">${producto.descripcion}</p>
        <div class="detalle-meta">
          <p>Jugadores: <span>${producto.jugadores_min} – ${producto.jugadores_max}</span></p>
          <p>Edad mínima: <span>${producto.edad_minima} años</span></p>
          <p>Stock disponible: <span id="stock-actual">${producto.stock}</span></p>
          <p>Vendedor: <span>${vendedor ? vendedor.nombre : "Desconocido"}</span></p>
          <p>Publicado: <span>${producto.fecha_publicacion}</span></p>
        </div>
        <div class="detalle-acciones">
          <span class="badge badge-${producto.estado}">${producto.estado}</span>
          <button
            class="btn btn-primario"
            id="btn-comprar"
            data-id="${producto.id_producto}"
            ${botonDeshabilitado}
          >
            Comprar
          </button>
          <div class="mensaje-compra" id="mensaje-compra"></div>
        </div>
      </div>
    </div>
  `;
}

function actualizarUITrasCompra(nuevoStock, estado) {
  const stockEl = document.getElementById("stock-actual");
  const mensajeEl = document.getElementById("mensaje-compra");
  const btnComprar = document.getElementById("btn-comprar");

  if (stockEl) stockEl.textContent = nuevoStock;

  mensajeEl.className = "mensaje-compra exito";
  mensajeEl.textContent = "¡Compra realizada con éxito!";

  if (estado === "agotado") {
    btnComprar.disabled = true;
    const badgeEl = document.querySelector(".badge");
    if (badgeEl) {
      badgeEl.className = "badge badge-agotado";
      badgeEl.textContent = "agotado";
    }
  }
}

function mostrarErrorCompra(mensaje) {
  const mensajeEl = document.getElementById("mensaje-compra");
  mensajeEl.className = "mensaje-compra error";
  mensajeEl.textContent = mensaje;
}


// ------------------------------------------------------------
// NAVEGACIÓN — enlace activo
// ------------------------------------------------------------

// Marca el enlace de navegación correspondiente a la página
// actual. detalle.html se trata como dependiente del catálogo,
// por lo que marca "Catálogo" como activo.
function marcarEnlaceActivo() {
  const pagina = obtenerPaginaActual();
  const enlaces = document.querySelectorAll("nav a");
  for (let i = 0; i < enlaces.length; i++) {
    enlaces[i].classList.remove("activo");
    const href = enlaces[i].getAttribute("href");
    if ((pagina === "catalogo" || pagina === "detalle") && href.includes("index")) {
      enlaces[i].classList.add("activo");
    }
    if (pagina === "publicar" && href.includes("publicar")) {
      enlaces[i].classList.add("activo");
    }
  }
}