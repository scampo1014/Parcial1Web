/**
 * --------------------------------------------------
 * 
 *                    Constantes
 * 
 * --------------------------------------------------
 */

//Constantes de Ubicacion
const productList = document.querySelector('.product-list');
const productListOuter = document.querySelector('.product-list-outer');
const categoryName = document.querySelector('.product-category');
const categories = document.querySelector('.categories');
const cartCount = document.querySelector('.cart-count');
const cart = document.querySelector('.shopping-cart');
const modal = document.querySelector('.modal');

//Constantes del Carrito
let cartItemID = 1;
let qtytotal = 0;

//Hacer que todo corra
eventListeners();
updateMiniCartInfo();

/**
 * --------------------------------------------------
 * 
 *                    EventListeners
 * 
 * --------------------------------------------------
 */

function eventListeners(){
    window.addEventListener('DOMContentLoaded', () => {
        active = categories.querySelector('.active');
        loadJSON(active);
        loadCart();
    })

    //Agregar a Carrito
    productList.addEventListener('click', purchaseProduct);

    //Confirmar Pedido
    productListOuter.addEventListener('click', confirmOrder);

    //Cambiar categoria
    categories.addEventListener('click', changeJSON);

    //Cargar informacion del carrito
    cart.addEventListener('click', loadCartContent);

    //Cancelar Pedido
    modal.addEventListener('click', cancelOrder)
}

/**
 * --------------------------------------------------
 * 
 *                   JSON y ProductDisplay
 * 
 * --------------------------------------------------
 */

//Cargar el JSON
function loadJSON(active){
    fetch('https://gist.githubusercontent.com/josejbocanegra/9a28c356416badb8f9173daf36d1460b/raw/5ea84b9d43ff494fcbf5c5186544a18b42812f09/restaurant.json')
    .then(response => response.json())
    .then(data => {

        //console.log(active.textContent);
        
        //Filtrar por categoria - notar que Burguer es la active por default
        const filtered = data.find(c => c.name === active.textContent);

        //console.log(filtered);

        categoryName.innerHTML = filtered.name;

        //Crear uno por uno los cards con los productos
        let html = '';
        filtered.products.forEach(product => {
            //console.log(product);

            realPrice = (Math.round(parseFloat(product.price) * 100) / 100).toFixed(2);;

            html += `
                <div class="col-10 col-md-3 card px-3 product-item">
                    <div class="row justify-contents-center pt-3">
                        <img src="${product.image}" class="product-image img-fluid" alt="link">
                    </div>
                    <div class="row justify-contents-center text-center">
                        <div class="col-12">
                            <h3 class="product-name">${product.name}</h3>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <p>${product.description}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <p class="product-price"><strong>$${realPrice}</strong></p>
                        </div>
                    </div>
                    <div class="row justify-contents-center text-center pb-3">
                        <div class="col-12">
                            <button type="button" class="btn btn-purchase btn-warning">Add to Cart</button>
                        </div>
                    </div>
                </div>    
            `;
        });
        productList.innerHTML = html;
    })
    .catch(error => {
        alert('Error')
    })
}

//Cambiar de Categoria
function changeJSON(e) {
    if(e.target.classList.contains('nav-link')){
        loadJSON(e.target)
    }
}

/**
 * --------------------------------------------------
 * 
 *               Comprar Productos
 * 
 * --------------------------------------------------
 */

//Comprar Producto o Modificar su cantidad
function purchaseProduct(e) {
    //console.log(e.target);
    if(e.target.classList.contains('btn-purchase')){
        let product = e.target.parentElement.parentElement.parentElement;
        getProductInfo(product)
    }
    if(e.target.classList.contains('btn-add')){
        let product = e.target.parentElement.parentElement;
        changeProductInLocalStorage(product, 1)
    }
    if(e.target.classList.contains('btn-subtract')){
        let product = e.target.parentElement.parentElement;
        changeProductInLocalStorage(product, -1)
    }
}

//Crear el JSON de la informacion del producto para el pedido
function getProductInfo(product){
    let productInfo = {
        id: cartItemID,
        qty: 1,
        name: product.querySelector('.product-name').textContent,
        price: product.querySelector('.product-price').textContent
    }
    cartItemID++;
    qtytotal++;
    //console.log(productInfo);
    saveProductInLocalStorage(productInfo);
}

/**
 * --------------------------------------------------
 * 
 *               Local Storage
 * 
 * --------------------------------------------------
 */

//Guardar el producto en local storage
function saveProductInLocalStorage(item) {
    let products = getProductFromLocalStorage();

    if(products.find(p => p.name === item.name)){
        product = products.find(p => p.name === item.name);
        product.qty++;
        cartItemID--;
    }
    else {
        products.push(item);
    }
    localStorage.setItem('products', JSON.stringify(products));
    updateMiniCartInfo();
}

//Cambiar Producto en Local Storage
function changeProductInLocalStorage(item, val) {
    let products = getProductFromLocalStorage();
    let nam = item.querySelector('.product-name-small').textContent;

    if(products.find(p => p.name === nam)){
        product = products.find(p => p.name === nam);
        product.qty += val;
        cartItemID--;
    }
    localStorage.setItem('products', JSON.stringify(products));
    loadCartContent();
}

//Cargar lista de productos de Local Storage
function getProductFromLocalStorage() {
    return localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];
}

/**
 * --------------------------------------------------
 * 
 *            Confirmar/Cancelar Pedido
 * 
 * --------------------------------------------------
 */

function confirmOrder(e) {
    if(e.target.classList.contains('btn-confirm')){
        let products = getProductFromLocalStorage();
        console.log({products});
    }
}

function cancelOrder(e) {
    if(e.target.classList.contains('btn-cancel-order')){
        localStorage.setItem('products', JSON.stringify([]));
        loadCartContent();
        qtytotal = 0;
        updateMiniCartInfo();
    }
}

/**
 * --------------------------------------------------
 * 
 *               Funciones del Carrito
 * 
 * --------------------------------------------------
 */

//Carga inicial de carrito persistente
function loadCart() {
    let products = getProductFromLocalStorage();
    if(products.length < 1){
        cartItemID = 1;
        qtytotal = 0;
    }
    else {
        cartItemID = products[products.length - 1].id;
        cartItemID++;

        qtytotal = products.reduce((acc, product) => {
            return acc += product.qty;
        }, 0);
    }
    //console.log(cartItemID);
}

//Desplegar la informacion del carrito
function loadCartContent() {
    let products = getProductFromLocalStorage();

    var table = document.createElement("table");
    table.classList.add("table");
    table.classList.add("table-striped")
    var thead = document.createElement("thead");
    thead.innerHTML = `
                    <tr>
                        <th class="d-none d-sm-block" scope="col">Item</th>
                        <th class="d-none d-sm-block" scope="col">Qty.</th>
                        <th class="d-none d-sm-block" scope="col">Description</th>
                        <th class="d-none d-sm-block" scope="col">Unit Price</th>
                        <th class="d-none d-sm-block" scope="col">Amount</th>
                        <th class="d-none d-sm-block" scope="col">Modify</th>
                    </tr>
                    `;
    table.appendChild(thead);
    var tbody = document.createElement("tbody");
    
    let thtml='';
    products.forEach(product =>{
        var amt = (Math.round(parseFloat(product.qty*product.price.substr(1)) * 100) / 100).toFixed(2);
        thtml +=`
                <tr>
                    <td class="d-none d-sm-block">${product.id}</td>
                    <td>${product.qty}</td>
                    <td class="product-name-small">${product.name}</td>
                    <td class="d-none d-sm-block">${product.price}</td>
                    <td class="d-none d-sm-block">$${amt}</td>
                    <td>
                        <button type="button" class="btn btn-add btn-warning">+</button>
                        <button type="button" class="btn btn-subtract btn-warning">-</button>
                    </td>
                </tr>
                `;
    });
    tbody.innerHTML = thtml;
    table.appendChild(tbody);

    
    var orderFinal = document.createElement("div");
    orderFinal.classList.add("row");
    orderFinal.innerHTML = `
                            <div class="col-12 col-md-8">
                                <p class="total-cart">Total: $0.00</p>
                            </div>
                            <div class="col-6 col-md-2">
                                <button type="button" class="btn btn-cancel btn-danger" data-toggle="modal" data-target="#cancelModal">Cancel</button>
                            </div>
                            <div class="col-6 col-md-2">
                                <button type="button" class="btn btn-confirm btn-success">Confirm Order</button>
                            </div>
                            `; 

    categoryName.innerHTML = 'ORDER DETAIL';
    productList.innerHTML = '';
    productList.appendChild(table);

    if(productList.parentElement.childElementCount > 3) {
        productList.parentElement.removeChild(productList.parentElement.lastChild);
    }
    productList.parentElement.appendChild(orderFinal);

    updateCartInfo(products);
}

//Actualizar carrito en la pagina principal
function updateMiniCartInfo(){
    let count = qtytotal;
    count += ' items';
    cartCount.textContent = count;
}

//Actualizar carrito en su propia pagina
function updateCartInfo(products) {
    let total = products.reduce((acc, product) => {
        let price = parseFloat(product.price.substr(1));
        return acc += price*product.qty;
    }, 0);
    //console.log(total);
    totalCart = document.querySelector('.total-cart');
    totalCart.innerHTML = '<strong> Total: $' + (Math.round(parseFloat(total) * 100) / 100).toFixed(2) + '</strong>';
}