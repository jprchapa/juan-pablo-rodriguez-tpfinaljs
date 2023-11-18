document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductosDesdeJSON()
    mostrarCarritoEnHTML()
    totalCarrito()
    botonAgregar()
})

const contenedorProductos = document.querySelector("#contenedor-productos")
let carrito = JSON.parse(localStorage.getItem("carrito")) || []

// Event listener filtro de productos
const dropdownMenu = document.querySelector('.dropdown-menu')
dropdownMenu.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
        const tipo = e.target.getAttribute('data-tipo')
        mostrarStock(tipo)
    }
})

// Cargar productos desde JSON 
async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch('./productos.json')
        const productosJSON = await response.json()
        productos = productosJSON
        mostrarStock()
        botonAgregar()
    } catch (error) {
        console.error('Error al cargar productos desde el JSON:', error)
    }
}

// Mostrar stock de productos 
function mostrarStock(filtro = null) {
    contenedorProductos.innerHTML = ''

    productos.forEach(producto => {
        if (!filtro || filtro === 'todos' || producto.tipo.toLowerCase() === filtro) {
            const div = document.createElement("div")
            div.classList.add("producto")
            div.innerHTML = `
                <img class="producto-imagen" src="${producto.imagen}" alt="${producto.nombre}">
                <div class="producto-nombre"><h2 >${producto.nombre}</h2></div>                               
                <p class="precio">$${producto.precio}</p>
                <button class="agregar-carrito" id="${producto.id}">Agregar al Carrito</button>
            `
            contenedorProductos.append(div)
        }
    })

    botonAgregar()
}

// Event listener para agregar productos al carrito
function botonAgregar() {
    const botonesAgregar = document.querySelectorAll(".agregar-carrito")
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito)
    })
}

// Función para agregar productos al carrito
function agregarAlCarrito(e) {
    const idboton = e.currentTarget.id
    const productoEncontrado = productos.find(producto => producto.id === idboton)
    const productoEnCarrito = carrito.find(item => item.id === productoEncontrado.id)

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++
    } else {
        productoEncontrado.cantidad = 1
        carrito.push(productoEncontrado)
    }

    mostrarCarritoEnHTML()
    totalCarrito()
    actualizarResumenCompra()

    localStorage.setItem("carrito", JSON.stringify(carrito))

    const Toast = Swal.mixin({
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer
            toast.onmouseleave = Swal.resumeTimer
        }
    })
    Toast.fire({
        icon: "success",
        title: "Producto agregado al carrito"
    })
}

// Función total del carrito
function totalCarrito() {
    let totalCarrito = carrito.reduce((acumulador, producto) => acumulador + (producto.precio * producto.cantidad), 0)
    console.log('Total del carrito:', totalCarrito)
}

// Función mostrar los productos en el carrito 
function mostrarCarritoEnHTML() {
    const listaProductosCarrito = document.querySelector('#lista-carrito')
    listaProductosCarrito.innerHTML = ''

    let total = 0

    for (let producto of carrito) {
        const itemCarrito = document.createElement('li')
        itemCarrito.innerHTML =

            `<div class="item-carrito">
                <img class="producto-imagen-carrito" src="${producto.imagen}" alt="Nombre del Producto">
                <div class="contenido-carrito">
                    <p class="producto-carrito">${producto.nombre}</p>
                    <p class="precio-carrito">$ ${producto.precio}</p>
                    <p class="unidades-carrito">Unidades: ${producto.cantidad}</p>
                    <p class="total-producto-carrito">Total: $${producto.precio * producto.cantidad}</p>         
                    <button class="eliminar-producto" data-id="${producto.id}">Eliminar</button>
                </div>
            </div>`

        listaProductosCarrito.appendChild(itemCarrito)

        total += producto.precio * producto.cantidad
    }

    const totalCarritoEnHTML = document.querySelector("#total-carrito")
    totalCarritoEnHTML.innerHTML = total
    const botonesEliminar = document.querySelectorAll(".eliminar-producto")
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarProducto)
    })
}

// Función eliminar productos del carrito
function eliminarProducto(e) {
    const idProducto = e.target.dataset.id
    const productoEnCarrito = carrito.find(item => item.id === idProducto)

    if (productoEnCarrito) {
        if (productoEnCarrito.cantidad > 1) {
            productoEnCarrito.cantidad--
        } else {
            carrito = carrito.filter(producto => producto.id !== idProducto)
        }
    }

    localStorage.setItem("carrito", JSON.stringify(carrito))
    mostrarCarritoEnHTML()
    totalCarrito()
    actualizarResumenCompra()

    const Toast = Swal.mixin({
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer
            toast.onmouseleave = Swal.resumeTimer
        }
    })
    Toast.fire({
        icon: "error",
        title: "Producto eliminado del carrito"
    })
}

// Event listener para vaciar el carrito
const btnVaciarCarrito = document.getElementById('vaciar-carrito')
btnVaciarCarrito.addEventListener('click', vaciarCarrito)

// Función vaciar el carrito
function vaciarCarrito() {
    if (carrito.length > 0) {
        Swal.fire({
            title: "Deseas vaciar el carrito?",
            text: "Se eliminaran todos los productos!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#008000",
            confirmButtonText: "Sí, eliminalos!",
            cancelButtonText: "No, quiero seguir comprando!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "El carrito se ha vaciado!",
                    text: "Se eliminaron todos los productos del carrito.",
                    icon: "success"
                })
                carrito = []
                localStorage.removeItem('carrito')

                mostrarCarritoEnHTML()
                totalCarrito()
                actualizarResumenCompra()
            }
        })
    } else {
        console.log('El carrito está vacío.')
    }
}

// Función actualizar resumen de compra
function actualizarResumenCompra() {
    const cantidadProductosResumen = document.getElementById('cantidad-productos-resumen')
    const totalCarritoResumen = document.getElementById('total-carrito-resumen')

    const cantidadProductos = carrito.reduce((total, producto) => total + producto.cantidad, 0)
    const totalCompra = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0)

    cantidadProductosResumen.textContent = cantidadProductos
    totalCarritoResumen.textContent = totalCompra
}

// Event listener para finalizar la compra
const btnFinalizarCompra = document.getElementById('finalizar-compra-btn')
btnFinalizarCompra.addEventListener('click', finalizarCompra)

// Función finalizar la compra
function finalizarCompra() {
    if (carrito.length === 0) {
        Swal.fire({
            icon: "info",
            title: "No tiene productos en el carrito",
            showConfirmButton: false,
            timer: 1500
        })
        return
    }

    Swal.fire({
        title: "¿Deseas finalizar tu compra?",
        text: "No podrás revertir esto",
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#008000",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, finalizar compra"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Compra finalizada",
                text: "Gracias por tu compra",
                icon: "success"
            })

            carrito = []
            mostrarCarritoEnHTML()
            totalCarrito()
            actualizarResumenCompra()
            localStorage.removeItem("carrito")
        }
    })
}


