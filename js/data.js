// ============================================================
// data.js — Capa de datos
//
// Implementa el REGISTRO Producto y el REGISTRO Vendedor
// como objetos literales JavaScript almacenados en arreglos.
//
// Conceptos aplicados:
//   - Registro: estructura de datos con campos heterogéneos
//     agrupados bajo una clave principal (id_producto, id_vendedor)
//   - Clave principal: entero autoincremental que garantiza
//     unicidad e independencia semántica del registro
//   - Búsqueda lineal: recorrido secuencial O(n) sobre el arreglo
//   - Bubble Sort: algoritmo de ordenamiento O(n²) con intercambio
//     de elementos adyacentes
//   - Persistencia en sesión: serialización/deserialización de
//     estructuras mediante JSON y sessionStorage
// ============================================================


// ------------------------------------------------------------
// CONTADORES AUTOINCREMENTALES
// Simulan secuencias de clave primaria de una base de datos.
// Se inicializan en N+1 donde N es la cantidad de registros
// de prueba precargados.
// ------------------------------------------------------------

let nextIdVendedor = 3;
let nextIdProducto = 7;


// ------------------------------------------------------------
// REGISTRO: Vendedor
//
// Campos:
//   id_vendedor  {entero}  — clave principal
//   nombre       {cadena}
//   email        {cadena}  — clave candidata (funcionalmente único)
//   telefono     {cadena}
// ------------------------------------------------------------

const vendedores = [
  { id_vendedor: 1, nombre: "Martina Ríos", email: "martina@mail.com", telefono: "3794-111222" },
  { id_vendedor: 2, nombre: "Lucas Pereyra", email: "lucas@mail.com", telefono: "3794-333444" }
];


// ------------------------------------------------------------
// REGISTRO: Producto
//
// Campos:
//   id_producto       {entero}  — clave principal
//   titulo            {cadena}
//   descripcion       {cadena}
//   precio            {real}
//   stock             {entero}
//   categoria         {cadena}
//   jugadores_min     {entero}
//   jugadores_max     {entero}
//   edad_minima       {entero}
//   imagen_url        {cadena}
//   id_vendedor       {entero}  — clave foránea → Vendedor
//   fecha_publicacion {cadena}  — formato ISO 8601
//   estado            {cadena}  — "disponible" | "agotado"
//
// Relación: Vendedor 1 ── N Producto
//   Un vendedor puede publicar múltiples productos.
//   Cada producto pertenece a exactamente un vendedor.
//   La vinculación se realiza mediante id_vendedor como campo
//   en el registro Producto (equivalente a clave foránea).
// ------------------------------------------------------------

const productos = [
  {
    id_producto: 1, titulo: "Catan",
    descripcion: "Juego de estrategia y comercio en una isla de recursos.",
    precio: 18500, stock: 4, categoria: "Estrategia",
    jugadores_min: 3, jugadores_max: 4, edad_minima: 10,
    imagen_url: "imagenes/catan.jpg", id_vendedor: 1,
    fecha_publicacion: "2025-01-10", estado: "disponible"
  },
  {
    id_producto: 2, titulo: "Ticket to Ride",
    descripcion: "Conecta ciudades del mundo con rutas ferroviarias.",
    precio: 21000, stock: 2, categoria: "Familiar",
    jugadores_min: 2, jugadores_max: 5, edad_minima: 8,
    imagen_url: "imagenes/ticket_to_ride.webp", id_vendedor: 1,
    fecha_publicacion: "2025-01-15", estado: "disponible"
  },
  {
    id_producto: 3, titulo: "Pandemic",
    descripcion: "Cooperativo donde los jugadores deben frenar enfermedades globales.",
    precio: 19000, stock: 0, categoria: "Cooperativo",
    jugadores_min: 2, jugadores_max: 4, edad_minima: 8,
    imagen_url: "imagenes/pandemic.webp", id_vendedor: 2,
    fecha_publicacion: "2025-02-01", estado: "agotado"
  },
  {
    id_producto: 4, titulo: "Dixit",
    descripcion: "Juego narrativo de cartas con ilustraciones surrealistas.",
    precio: 15500, stock: 6, categoria: "Familiar",
    jugadores_min: 3, jugadores_max: 6, edad_minima: 8,
    imagen_url: "imagenes/dixit.webp", id_vendedor: 2,
    fecha_publicacion: "2025-02-10", estado: "disponible"
  },
  {
    id_producto: 5, titulo: "Gloomhaven",
    descripcion: "Dungeon crawler cooperativo con campaña persistente.",
    precio: 54000, stock: 1, categoria: "RPG",
    jugadores_min: 1, jugadores_max: 4, edad_minima: 14,
    imagen_url: "imagenes/gloomhaven.webp", id_vendedor: 1,
    fecha_publicacion: "2025-03-05", estado: "disponible"
  },
  {
    id_producto: 6, titulo: "7 Wonders",
    descripcion: "Drafting de cartas para construir la civilización más poderosa.",
    precio: 17000, stock: 3, categoria: "Estrategia",
    jugadores_min: 2, jugadores_max: 7, edad_minima: 10,
    imagen_url: "imagenes/seven_wonders.webp", id_vendedor: 2,
    fecha_publicacion: "2025-03-20", estado: "disponible"
  }
];


// ------------------------------------------------------------
// PERSISTENCIA EN sessionStorage
//
// Serialización: conversión de la estructura en memoria
// (arreglo de objetos) a string JSON para almacenamiento.
// Deserialización: reconstrucción de la estructura desde
// el string JSON al cargar una nueva página.
//
// Alcance: los datos persisten mientras la pestaña esté
// abierta. Al cerrarla, sessionStorage se elimina y los
// arreglos vuelven a su estado inicial en la próxima sesión.
// ------------------------------------------------------------

function guardarEstado() {
  sessionStorage.setItem("productos", JSON.stringify(productos));
  sessionStorage.setItem("vendedores", JSON.stringify(vendedores));
  sessionStorage.setItem("nextIdProducto", String(nextIdProducto));
  sessionStorage.setItem("nextIdVendedor", String(nextIdVendedor));
}

function cargarEstado() {
  const productosGuardados = sessionStorage.getItem("productos");
  const vendedoresGuardados = sessionStorage.getItem("vendedores");
  const nextProd = sessionStorage.getItem("nextIdProducto");
  const nextVend = sessionStorage.getItem("nextIdVendedor");

  if (productosGuardados) {
    const parsed = JSON.parse(productosGuardados);
    // Se vacía y repuebla el arreglo original para no romper
    // referencias existentes en otras partes del código.
    productos.length = 0;
    for (let i = 0; i < parsed.length; i++) productos.push(parsed[i]);
  }
  if (vendedoresGuardados) {
    const parsed = JSON.parse(vendedoresGuardados);
    vendedores.length = 0;
    for (let i = 0; i < parsed.length; i++) vendedores.push(parsed[i]);
  }
  if (nextProd) nextIdProducto = parseInt(nextProd);
  if (nextVend) nextIdVendedor = parseInt(nextVend);
}

// Utilitario de desarrollo: resetea el estado al inicial.
// Uso desde consola: limpiarEstado(); location.reload();
function limpiarEstado() {
  sessionStorage.clear();
}


// ------------------------------------------------------------
// OPERACIONES SOBRE Vendedor
// ------------------------------------------------------------

// Búsqueda lineal por clave principal.
// Recorre el arreglo secuencialmente hasta encontrar el
// registro cuyo id_vendedor coincida con el parámetro.
// Retorna el registro encontrado o null si no existe.
// Complejidad: O(n)
function buscarVendedorPorId(id) {
  for (let i = 0; i < vendedores.length; i++) {
    if (vendedores[i].id_vendedor === id) return vendedores[i];
  }
  return null;
}

// Inserta un nuevo registro Vendedor con clave autoincremental.
function agregarVendedor(nombre, email, telefono) {
  const nuevo = {
    id_vendedor: nextIdVendedor++,
    nombre,
    email,
    telefono
  };
  vendedores.push(nuevo);
  return nuevo;
}


// ------------------------------------------------------------
// OPERACIONES SOBRE Producto
// ------------------------------------------------------------

// Búsqueda lineal por clave principal.
// Complejidad: O(n)
function buscarProductoPorId(id) {
  for (let i = 0; i < productos.length; i++) {
    if (productos[i].id_producto === id) return productos[i];
  }
  return null;
}

// Retorna el arreglo completo de productos.
function listarProductos() {
  return productos;
}

// Búsqueda lineal con filtro por campo categoria.
// Retorna un nuevo arreglo con los registros que coincidan.
// Complejidad: O(n)
function filtrarPorCategoria(categoria) {
  const resultado = [];
  for (let i = 0; i < productos.length; i++) {
    if (productos[i].categoria === categoria) resultado.push(productos[i]);
  }
  return resultado;
}

// Búsqueda lineal con filtro por subcadena en campo titulo.
// La comparación se normaliza a minúsculas para ser
// insensible a mayúsculas.
// Complejidad: O(n)
function buscarPorTitulo(texto) {
  const textoBuscado = texto.toLowerCase();
  const resultado = [];
  for (let i = 0; i < productos.length; i++) {
    if (productos[i].titulo.toLowerCase().includes(textoBuscado)) {
      resultado.push(productos[i]);
    }
  }
  return resultado;
}

// Ordenamiento por campo precio mediante Bubble Sort.
// Opera sobre una copia del arreglo para no mutar el original.
//
// Bubble Sort: compara pares de elementos adyacentes e
// intercambia su posición si están en el orden incorrecto.
// Cada pasada completa garantiza que el elemento de mayor
// (o menor) valor queda en su posición definitiva al final
// del subarreglo no ordenado.
//
// Complejidad temporal: O(n²) en caso promedio y peor caso.
// Complejidad espacial: O(n) por la copia del arreglo.
function ordenarPorPrecio(ascendente = true) {
  const copia = [...productos];
  for (let i = 0; i < copia.length - 1; i++) {
    for (let j = 0; j < copia.length - 1 - i; j++) {
      const condicion = ascendente
        ? copia[j].precio > copia[j + 1].precio
        : copia[j].precio < copia[j + 1].precio;
      if (condicion) {
        // Intercambio de registros adyacentes
        const temp = copia[j];
        copia[j] = copia[j + 1];
        copia[j + 1] = temp;
      }
    }
  }
  return copia;
}

// Inserta un nuevo registro Producto con clave autoincremental.
// El campo estado se deriva del stock inicial: si stock > 0
// el registro nace como "disponible", de lo contrario "agotado".
// Persiste el estado actualizado en sessionStorage.
function agregarProducto(titulo, descripcion, precio, stock, categoria,
  jugadores_min, jugadores_max, edad_minima,
  imagen_url, id_vendedor) {
  const nuevo = {
    id_producto: nextIdProducto++,
    titulo,
    descripcion,
    precio,
    stock,
    categoria,
    jugadores_min,
    jugadores_max,
    edad_minima,
    imagen_url,
    id_vendedor,
    fecha_publicacion: new Date().toISOString().split("T")[0],
    estado: stock > 0 ? "disponible" : "agotado"
  };
  productos.push(nuevo);
  guardarEstado();
  return nuevo;
}

// Decrementa el stock del registro Producto identificado por id.
// Valores de retorno:
//   null  — el registro no existe (id inválido)
//   false — stock insuficiente para satisfacer la cantidad
//   true  — operación exitosa; stock decrementado
// Si el stock resultante es 0, el campo estado se actualiza
// a "agotado" automáticamente.
// Persiste el estado actualizado en sessionStorage.
function actualizarStock(id_producto, cantidad) {
  const producto = buscarProductoPorId(id_producto);
  if (producto === null) return null;
  if (producto.stock < cantidad) return false;
  producto.stock -= cantidad;
  if (producto.stock === 0) producto.estado = "agotado";
  guardarEstado();
  return true;
}
