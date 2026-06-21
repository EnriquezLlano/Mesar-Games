// ============================================================
// app.js — Capa de lógica de negocio y eventos
//
// Responsabilidad: orquestar las interacciones entre la capa
// de datos (data.js) y la capa de presentación (ui.js).
// Registra event listeners y contiene la lógica de negocio
// que no pertenece ni a los datos ni al DOM.
//
// Arquitectura de tres capas aplicada:
//   data.js  → estructuras de datos y operaciones sobre registros
//   ui.js    → construcción y manipulación del DOM
//   app.js   → lógica de negocio, eventos, coordinación
// ============================================================


// ------------------------------------------------------------
// UTILIDADES
// ------------------------------------------------------------

// Detecta la vista activa mediante la ruta del documento.
// Retorna: "catalogo" | "detalle" | "publicar"
function obtenerPaginaActual() {
  const ruta = window.location.pathname;
  if (ruta.includes("publicar")) return "publicar";
  if (ruta.includes("detalle")) return "detalle";
  return "catalogo";
}


// ------------------------------------------------------------
// CATÁLOGO
// ------------------------------------------------------------

// Aplica los filtros y ordenamiento activos sobre el arreglo
// de productos y retorna la lista resultante.
//
// El filtrado es secuencial y compuesto:
//   1. Búsqueda lineal por texto sobre el arreglo completo
//   2. Filtro por categoría sobre el resultado anterior
//   3. Bubble Sort por precio sobre el resultado anterior
//
// La composición secuencial garantiza que todos los criterios
// activos se aplican simultáneamente sobre el mismo conjunto.
function obtenerListaFiltrada() {
  const textoBusqueda = document.getElementById("input-busqueda").value;
  const categoria = document.getElementById("select-categoria").value;
  const orden = document.getElementById("select-orden").value;

  let lista = listarProductos();

  if (textoBusqueda.trim() !== "") {
    lista = buscarPorTitulo(textoBusqueda);
  }

  if (categoria !== "") {
    const resultado = [];
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].categoria === categoria) resultado.push(lista[i]);
    }
    lista = resultado;
  }

  // Bubble Sort sobre la lista ya filtrada.
  // Se reimplementa aquí (en lugar de reutilizar ordenarPorPrecio
  // de data.js) porque debe operar sobre la lista filtrada,
  // no sobre el arreglo global productos[].
  if (orden === "asc" || orden === "desc") {
    const ascendente = orden === "asc";
    const copia = [...lista];
    for (let i = 0; i < copia.length - 1; i++) {
      for (let j = 0; j < copia.length - 1 - i; j++) {
        const condicion = ascendente
          ? copia[j].precio > copia[j + 1].precio
          : copia[j].precio < copia[j + 1].precio;
        if (condicion) {
          const temp = copia[j];
          copia[j] = copia[j + 1];
          copia[j + 1] = temp;
        }
      }
    }
    lista = copia;
  }

  return lista;
}

function iniciarCatalogo() {
  renderizarCatalogo(listarProductos());

  document.getElementById("input-busqueda")
    .addEventListener("input", function () {
      renderizarCatalogo(obtenerListaFiltrada());
    });

  document.getElementById("select-categoria")
    .addEventListener("change", function () {
      renderizarCatalogo(obtenerListaFiltrada());
    });

  document.getElementById("select-orden")
    .addEventListener("change", function () {
      renderizarCatalogo(obtenerListaFiltrada());
    });
}


// ------------------------------------------------------------
// DETALLE Y COMPRA
// ------------------------------------------------------------

function iniciarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const idRaw = params.get("id");
  const id = parseInt(idRaw);

  const contenedor = document.getElementById("detalle-contenedor");

  if (!idRaw || isNaN(id)) {
    contenedor.innerHTML = `
      <p style="color: var(--color-error); margin-bottom: 1rem;">
        URL inválida. No se especificó un producto.
      </p>
      <a href="index.html" class="btn btn-secundario">← Volver al catálogo</a>
    `;
    return;
  }

  const producto = buscarProductoPorId(id);

  if (!producto) {
    contenedor.innerHTML = `
      <p style="color: var(--color-error); margin-bottom: 1rem;">
        Producto no encontrado.
      </p>
      <a href="index.html" class="btn btn-secundario">← Volver al catálogo</a>
    `;
    return;
  }

  const vendedor = buscarVendedorPorId(producto.id_vendedor);
  renderizarDetalle(producto, vendedor);

  // Bandera de bloqueo: previene decrementos múltiples por
  // clicks rápidos sucesivos antes de que la UI se actualice.
  let comprando = false;

  document.getElementById("btn-comprar")
    .addEventListener("click", function () {
      if (comprando) return;
      comprando = true;

      // Limpiar feedback previo antes de procesar la operación
      const mensajeEl = document.getElementById("mensaje-compra");
      mensajeEl.className = "mensaje-compra";
      mensajeEl.textContent = "";

      // actualizarStock retorna:
      //   null  → id inválido
      //   false → stock insuficiente
      //   true  → operación exitosa
      const resultado = actualizarStock(id, 1);

      if (resultado === true) {
        const productoActualizado = buscarProductoPorId(id);
        actualizarUITrasCompra(
          productoActualizado.stock,
          productoActualizado.estado
        );
        // Si quedan unidades, liberar el bloqueo para permitir
        // compras sucesivas de unidades adicionales
        if (productoActualizado.estado !== "agotado") comprando = false;
      } else if (resultado === false) {
        mostrarErrorCompra("Stock insuficiente.");
        comprando = false;
      } else {
        mostrarErrorCompra("Error: producto no encontrado.");
        comprando = false;
      }
    });
}


// ------------------------------------------------------------
// PUBLICACIÓN
// ------------------------------------------------------------

function validarFormulario() {
  let valido = true;

  const titulo = document.getElementById("campo-titulo").value.trim();
  mostrarError("error-titulo", titulo === "");
  if (titulo === "") valido = false;

  const descripcion = document.getElementById("campo-descripcion").value.trim();
  mostrarError("error-descripcion", descripcion === "");
  if (descripcion === "") valido = false;

  const precio = parseFloat(document.getElementById("campo-precio").value);
  mostrarError("error-precio", isNaN(precio) || precio <= 0);
  if (isNaN(precio) || precio <= 0) valido = false;

  const stock = parseInt(document.getElementById("campo-stock").value);
  mostrarError("error-stock", isNaN(stock) || stock <= 0);
  if (isNaN(stock) || stock <= 0) valido = false;

  const categoria = document.getElementById("campo-categoria").value;
  mostrarError("error-categoria", categoria === "");
  if (categoria === "") valido = false;

  const jugMin = parseInt(document.getElementById("campo-jugadores-min").value);
  const jugMax = parseInt(document.getElementById("campo-jugadores-max").value);
  const jugadoresInvalidos = isNaN(jugMin) || isNaN(jugMax) || jugMin < 1 || jugMax < jugMin;
  mostrarError("error-jugadores", jugadoresInvalidos);
  if (jugadoresInvalidos) valido = false;

  return valido;
}

function iniciarPublicacion() {
  renderizarOpcionesVendedor();

  // Limpiar el error de cada campo en tiempo real,
  // al momento en que el usuario lo corrige
  const camposConError = [
    { campoId: "campo-titulo", errorId: "error-titulo" },
    { campoId: "campo-descripcion", errorId: "error-descripcion" },
    { campoId: "campo-precio", errorId: "error-precio" },
    { campoId: "campo-stock", errorId: "error-stock" },
    { campoId: "campo-categoria", errorId: "error-categoria" },
    { campoId: "campo-jugadores-min", errorId: "error-jugadores" },
    { campoId: "campo-jugadores-max", errorId: "error-jugadores" }
  ];

  for (let i = 0; i < camposConError.length; i++) {
    const el = document.getElementById(camposConError[i].campoId);
    if (!el) continue;
    const errorId = camposConError[i].errorId;
    el.addEventListener("input", function () { mostrarError(errorId, false); });
    el.addEventListener("change", function () { mostrarError(errorId, false); });
  }

  document.getElementById("btn-publicar")
    .addEventListener("click", function () {
      if (!validarFormulario()) return;

      const id_vendedor = parseInt(document.getElementById("campo-vendedor").value);
      const titulo = document.getElementById("campo-titulo").value.trim();
      const descripcion = document.getElementById("campo-descripcion").value.trim();
      const precio = parseFloat(document.getElementById("campo-precio").value);
      const stock = parseInt(document.getElementById("campo-stock").value);
      const categoria = document.getElementById("campo-categoria").value;
      const jugMin = parseInt(document.getElementById("campo-jugadores-min").value);
      const jugMax = parseInt(document.getElementById("campo-jugadores-max").value);
      const edad = parseInt(document.getElementById("campo-edad").value) || 0;
      const imagen = document.getElementById("campo-imagen").value.trim();

      agregarProducto(titulo, descripcion, precio, stock, categoria,
        jugMin, jugMax, edad, imagen, id_vendedor);

      const btn = document.getElementById("btn-publicar");
      btn.textContent = "¡Publicado!";
      btn.disabled = true;

      setTimeout(function () {
        window.location.href = "index.html";
      }, 800);
    });
}


// ------------------------------------------------------------
// PUNTO DE ENTRADA
//
// DOMContentLoaded garantiza que el DOM esté completamente
// construido antes de registrar cualquier event listener
// o manipular elementos HTML.
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  cargarEstado();       // deserializar datos desde sessionStorage
  marcarEnlaceActivo(); // resaltar enlace de navegación activo
  const pagina = obtenerPaginaActual();
  if (pagina === "catalogo") iniciarCatalogo();
  if (pagina === "detalle") iniciarDetalle();
  if (pagina === "publicar") iniciarPublicacion();
});