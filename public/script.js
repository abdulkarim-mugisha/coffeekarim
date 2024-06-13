let DEMO_COFFEE_DATA;
const STORE_INFO = {

    "labodega": {
        "full_name": "La Bodega Coffee",
        "logo": "https://bodega.coffee/favicon.ico"
    },
    "coffeeshrub": {
        "full_name": "Coffee Shrub", 
        "logo": "https://www.coffeeshrub.com/media/wysiwyg/logo-coffee.png"
    },
    "genuineorigin": {
        "full_name": "Genuine Origin",
        "logo": "https://www.genuineorigin.com/favicon.ico"
    }
}

let cart = {
    cartItems: [],
    total: 0
}

let currentPage = 1;
const resultsPerPage = 8; // Adjust this value as needed


function generateCoffeeResultCard(coffeeInfo){
    let card = gen("div");
    card.classList.add("product-card");
    card.classList.add("dark-mode");

    let imgContainer = gen("div");
    imgContainer.classList.add("img-container");
    card.appendChild(imgContainer);
    let img = gen("img");
    img.src = coffeeInfo.image_url;
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    let cardBody = gen("div");
    let cardTitle = gen("h5");
    cardTitle.textContent = coffeeInfo.name;
    cardBody.appendChild(cardTitle);
    let cardPrice = gen("p");
    cardPrice.textContent = coffeeInfo.price;
    cardBody.appendChild(cardPrice);
    
    let cardStore = gen("div");
    cardStore.classList.add("store");
    let cardStorelogo = gen("img");
    cardStorelogo.classList.add("store-logo");
    cardStorelogo.src = STORE_INFO[coffeeInfo.importer].logo;
    cardStore.appendChild(cardStorelogo);
    let storeName = document.createTextNode(STORE_INFO[coffeeInfo.importer].full_name);
    cardStore.appendChild(storeName);
    cardBody.appendChild(cardStore);

    let quickView = gen("button");
    quickView.textContent = "Quick View";
    quickView.classList.add("quick-view-btn");
    cardBody.appendChild(quickView);
    
    card.appendChild(cardBody);

    card.addEventListener("click", (event) => {
    if (event.target === quickView) {
        displayCoffeeInfoSideBar(coffeeInfo);
    } else {
        displayCoffeeInfoFullView(coffeeInfo);
    }
    });
    return card;
}

// function displayResults(coffeeResults){
//     let results = qs("#results");
//     results.innerHTML = "";
//     coffeeResults.forEach(coffeeInfo => {
//         results.appendChild(generateCoffeeResultCard(coffeeInfo));
//     });
// }

const BASE_URL = "http://localhost:3000/";

function fetchCoffeeData() {
    let url = BASE_URL + "data";

    fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .then((coffeeData) => {
            DEMO_COFFEE_DATA = coffeeData;
            generateFilters(coffeeData);
            displayResults(coffeeData);
        })
        .catch(handleError);
}

function fetchCartItems(){
    let url = BASE_URL + "cart";
    fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .then((cartData) => {
            cart.cartItems = cartData;
            updateCartView();
        })
        .catch(handleError);
}

function handleError(error) {
    console.log("Error: " + error);
}


function displayResults(coffeeResults) {
    let results = qs("#results");

    results.innerHTML = "";
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedResults = coffeeResults.slice(start, end);

    paginatedResults.forEach(coffeeInfo => {
        results.appendChild(generateCoffeeResultCard(coffeeInfo));
    });

    displayPaginationControls(coffeeResults.length);
}

function displayPaginationControls(totalResults) {
    let paginationControls = qs("#pagination-controls");

    paginationControls.innerHTML = "";

    const totalPages = Math.ceil(totalResults / resultsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = gen('button');
        pageButton.innerText = i;
        pageButton.classList.add('pagination-button');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayResults(DEMO_COFFEE_DATA);
        });
        paginationControls.appendChild(pageButton);
    }
}


function displayCoffeeInfoFullView(coffeeInfo){
    switchView("product-view");
    // Fill the product view with detailed coffee info
    const productFullView = qs("#product-view");
    productFullView.innerHTML = "";

    const img = gen('img');
    img.src = coffeeInfo.image_url;
    img.alt = coffeeInfo.name;
    productFullView.appendChild(img);

    const productDetails = gen('div');
    productDetails.classList.add('product-details');

    const name = gen('h2');
    name.textContent = coffeeInfo.name;
    productDetails.appendChild(name);

    const importer = gen('p');
    importer.textContent = `Importer: ${STORE_INFO[coffeeInfo.importer].full_name}`;
    productDetails.appendChild(importer);

    const notes = gen('p');
    notes.textContent = `Notes: ${coffeeInfo.notes.slice(1, -1)}`;
    productDetails.appendChild(notes);

    const price = gen('p');
    price.textContent = `Price: ${coffeeInfo.price}`;
    productDetails.appendChild(price);

    const processMethod = gen('p');
    processMethod.textContent = `Process Method: ${coffeeInfo.process_method}`;
    productDetails.appendChild(processMethod);

    const cuppingScore = gen('p');
    cuppingScore.textContent = `Cupping Score: ${coffeeInfo.cupping_score}`;
    productDetails.appendChild(cuppingScore);

    const addToCartButton = gen('button');
    addToCartButton.textContent = 'Add to Cart';
    addToCartButton.addEventListener('click', () => {
        addToCart(coffeeInfo, 1);
    });
    productDetails.appendChild(addToCartButton);

    productFullView.appendChild(productDetails);
}

function displaySearchSuggestions(results) {
    const suggestionsContainer = qs("#suggestions");

    suggestionsContainer.innerHTML = "";

    results.forEach((coffeeInfo) => {
    let suggestion = gen("div");
    suggestion.textContent = `${coffeeInfo.name}`;

    suggestion.addEventListener("click", function () {
        qs("#search-input").value = "";
        qs("#search-input").placeholder = "Search for coffee...";
        suggestionsContainer.classList.add("hidden");
        suggestionsContainer.innerHTML = "";

        displayCoffeeInfoFullView(coffeeInfo);

    });

    suggestionsContainer.appendChild(suggestion);
    });

    if (results.length > 0) {
    suggestionsContainer.classList.remove("hidden");
    }
}



function displayCoffeeInfoSideBar(coffeeInfo){
    let info = qs("#selected-coffee-details");

    let img = qs("#selected-coffee-image");
    img.src = coffeeInfo.image_url;

    let name = qs("#selected-coffee-name");
    name.textContent = coffeeInfo.name;

    let store = qs("#selected-coffee-importer");
    store.textContent = STORE_INFO[coffeeInfo.importer].full_name;
    store.href = coffeeInfo.url;


    let notes = qs("#selected-coffee-notes");
    notes.textContent = coffeeInfo.notes.slice(1, -1);

    let price = qs("#selected-coffee-price");
    price.textContent = coffeeInfo.price + " per lb";

    let processMethod= qs("#selected-coffee-process-method");
    processMethod.textContent = `Process Method: ${coffeeInfo.process_method}`;

    let cuppingScore = qs("#selected-coffee-cupping-score");
    cuppingScore.textContent = "Cupping Score: " + coffeeInfo.cupping_score;

    qs("#results").classList.add("selected-view");
    info.classList.remove("hidden");

    qs("#selected-coffee-details button").addEventListener("click", () => {
        addToCart(coffeeInfo, 1);
    })

}

function addToCart(coffeeInfo, amount){
    let cartItem = {
        itemName: coffeeInfo.name,
        itemPrice: coffeeInfo.price,
        itemAmount: amount
    };


    fetch("http://localhost:3000/addToCart/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cartItem)
    }).then(response => {
        if (response.ok) {
            response.text().then(text => console.log(text));
        } else {
            response.text().then(text => console.error(text));
        }
    });
    updateCartView();
    showCartModal(coffeeInfo.name);
}

function updateCartView() {
    const cartItemsContainer = document.querySelector("#cart-items");
    cartItemsContainer.innerHTML = "";
    cart.total = 0;
    cart.cartItems.forEach((item, index) => {
        let cartItem = gen("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <p>${item.itemName}</p>
            <p>${item.itemPrice} x ${item.itemAmount}</p>
            <button class="remove-item" data-index="${index}">Remove</button>
        `;
        cart.total += parseFloat(item.itemPrice.replace("$", "")) * item.itemAmount;
        cartItemsContainer.appendChild(cartItem);
    });
    document.querySelector("#cart-total").textContent = cart.total.toFixed(2);

    // Add event listeners to remove buttons
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = event.target.getAttribute("data-index");
            removeFromCart(index);
        });
    });
}

function removeFromCart(index) {
    const item = cart.cartItems[index];
    fetch('/removeCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.itemName, price: item.itemPrice, amount: item.itemAmount })
    })
    .then(response => response.json())
    .then(response => {
        if (response.message === 'Item has been removed from cart!') {
            cart.cartItems.splice(index, 1);
            updateCartView();
        } else {
            alert(response.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function showCartModal(productName){
    const modal = document.querySelector("#cart-modal");
    modal.querySelector("h2").textContent = `${productName} was added to Cart`;
    modal.classList.remove("hidden");
    document.body.classList.add("no-scroll");
}

function init(){
    fetchCartItems();
    fetchCoffeeData();
    let closeSideBar = qs(".product-header .close");
    closeSideBar.addEventListener("click", () => {
        qs("#results").classList.remove("selected-view");

        qs("#selected-coffee-details").classList.add("hidden");
    })

    const filterItems = qsa('.filter');

    filterItems.forEach(item => {
    const header = item.querySelector('.filter-header');

    header.addEventListener('click', () => {
        item.classList.toggle('active');
    });
    });

    const modal = qs("#cart-modal");
    const cartButton = qs("#cart-button");
    const closeCartButton = qs("#cart-modal .close");

    cartButton.addEventListener("click", (event) => {
       fetchCartItems();
       switchView("cart-view");
       
    })

    closeCartButton.addEventListener("click", () => {
        modal.classList.add("hidden");
        document.body.classList.remove("no-scroll");
    });
  
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.classList.add("hidden");
            document.body.classList.remove("no-scroll");
        } else{
            qs("#suggestions").classList.add("hidden");
        }
    });

    const searchInput = qs("#search-input");

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        displaySearchSuggestions(fetchCoffeeBySearchQuery(query));
    });

    const homeLink = qs("header > a");
    homeLink.addEventListener("click", (event) => {
        event.preventDefault();
        switchView("browse-view");
    });
    const accountLink = document.querySelector("#account-link");
    const signUpLink = document.querySelector("#sign-up-link");
    const loginLink = document.querySelector("#login-link");

    const loginForm = document.querySelector("#login-form");
    const signUpForm = document.querySelector("#sign-up-form");
    const logoutButton = document.querySelector("#logout-button");
    const contactForm = document.querySelector("#contact-form");

    accountLink.addEventListener("click", (event) => {
        event.preventDefault();
        switchView("account-view");
    });

    signUpLink.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelector("#login-view").classList.add("hidden");
        document.querySelector("#sign-up-view").classList.remove("hidden");
    });

    loginLink.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelector("#sign-up-view").classList.add("hidden");
        document.querySelector("#login-view").classList.remove("hidden");
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = document.querySelector("#login-email").value;
        const password = document.querySelector("#login-password").value;
        
        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Logged in') {
                document.querySelector("#login-view").classList.add("hidden");
                document.querySelector("#account-info").classList.remove("hidden");
                document.querySelector("#user-email").textContent = `User Email: ${data.user.email}`;
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    signUpForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = qs("#sign-up-name").value;
        const email = document.querySelector("#sign-up-email").value;
        const password = document.querySelector("#sign-up-password").value;

        fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User created') {
                document.querySelector("#sign-up-view").classList.add("hidden");
                document.querySelector("#account-info").classList.remove("hidden");
                document.querySelector("#user-email").textContent = `User Email: ${data.user.email}`;
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    logoutButton.addEventListener("click", (event) => {
        event.preventDefault();

        fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Logged out') {
                document.querySelector("#account-info").classList.add("hidden");
                qs("#login-email").value= "";
                qs("#login-password").value = "";
                document.querySelector("#login-view").classList.remove("hidden");
            }
        })
        .catch(error => console.error('Error:', error));
    });

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = document.querySelector("#contact-name").value;
        const email = document.querySelector("#contact-email").value;
        const message = document.querySelector("#contact-message").value;
    
        fetch('/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Your information has been sent!") {
                alert(data.message);
                contactForm.reset();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('min-price').addEventListener('input', applyFilters);
    document.getElementById('max-price').addEventListener('input', applyFilters);
    document.getElementById('min-cupping-score').addEventListener('input', applyFilters);
    document.getElementById('max-cupping-score').addEventListener('input', applyFilters);
    document.querySelectorAll('input[name="process_methods"]').forEach(el => el.addEventListener('change', applyFilters));
    document.querySelectorAll('input[name="origins"]').forEach(el => el.addEventListener('change', applyFilters));
    document.querySelectorAll('input[name="importers"]').forEach(el => el.addEventListener('change', applyFilters));
    
} 


function generateFilters(data) {
    const prices = data.map(coffee => parseFloat(coffee.price.replace('$', '')));
    const cuppingScores = data.map(coffee => parseFloat(coffee.cupping_score));
    const processMethodsRaw = [...new Set(data.map(coffee => coffee.process_method))];
    let processMethods = [];
    processMethodsRaw.forEach(elt => {
        if (elt){
            processMethods.push(elt);
        }
    });
    const origins = [...new Set(data.map(coffee => coffee.origin))];
    const importers = [...new Set(data.map(coffee => coffee.importer))];

    // Set price and cupping score bounds
    document.getElementById('min-price').setAttribute('min', Math.min(...prices));
    document.getElementById('min-price').setAttribute('max', Math.max(...prices));
    document.getElementById('max-price').setAttribute('min', Math.min(...prices));
    document.getElementById('max-price').setAttribute('max', Math.max(...prices));
    
    document.getElementById('min-cupping-score').setAttribute('min', Math.min(...cuppingScores));
    document.getElementById('min-cupping-score').setAttribute('max', Math.max(...cuppingScores));
    document.getElementById('max-cupping-score').setAttribute('min', Math.min(...cuppingScores));
    document.getElementById('max-cupping-score').setAttribute('max', Math.max(...cuppingScores));

    // Generate process method filter options
    const processMethodFilter = document.getElementById('process-method-filter');
    processMethods.forEach(method => {
        const div = gen('div');
        const input = gen('input');
        input.type = 'checkbox';
        input.id = method;
        input.name = 'process_methods';
        input.value = method;
        const label = gen('label');
        label.htmlFor = method;
        label.textContent = method;
        div.appendChild(input);
        div.appendChild(label);
        processMethodFilter.appendChild(div);
    });

    // Generate origin filter options
    const originFilter = document.getElementById('origin-filter');
    origins.forEach(origin => {
        const div = gen('div');
        const input = gen('input');
        input.type = 'checkbox';
        input.id = origin;
        input.name = 'origins';
        input.value = origin;
        const label = gen('label');
        label.htmlFor = origin;
        label.textContent = origin;
        div.appendChild(input);
        div.appendChild(label);
        originFilter.appendChild(div);
    });

    // Generate importer filter options
    const importerFilter = document.getElementById('importer-filter');
    importers.forEach(importer => {
        const div = gen('div');
        const input = gen('input');
        input.type = 'checkbox';
        input.id = importer;
        input.name = 'importers';
        input.value = importer;
        const label = gen('label');
        label.htmlFor = importer;
        label.textContent = STORE_INFO[importer].full_name;
        div.appendChild(input);
        div.appendChild(label);
        importerFilter.appendChild(div);
    });
}

function applyFilters() {
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const minCuppingScore = document.getElementById('min-cupping-score').value;
    const maxCuppingScore = document.getElementById('max-cupping-score').value;
    const selectedProcessMethods = [...document.querySelectorAll('input[name="process_methods"]:checked')].map(el => el.value);
    const selectedOrigins = [...document.querySelectorAll('input[name="origins"]:checked')].map(el => el.value);
    const selectedImporters = [...document.querySelectorAll('input[name="importers"]:checked')].map(el => el.value);

    const filteredResults = DEMO_COFFEE_DATA.filter(coffee => {
        let matchesPrice = true;
        let matchesCuppingScore = true;
        let matchesProcessMethod = true;
        let matchesOrigin = true;
        let matchesImporter = true;

        if (minPrice !== '' && maxPrice !== '') {
            const price = parseFloat(coffee.price.replace('$', ''));
            matchesPrice = price >= minPrice && price <= maxPrice;
        }

        if (minCuppingScore !== '' && maxCuppingScore !== '') {
            const score = parseFloat(coffee.cupping_score);
            matchesCuppingScore = score >= minCuppingScore && score <= maxCuppingScore;
        }

        if (selectedProcessMethods.length > 0) {
            matchesProcessMethod = selectedProcessMethods.includes(coffee.process_method);
        }

        if (selectedOrigins.length > 0) {
            matchesOrigin = selectedOrigins.includes(coffee.origin);
        }

        if (selectedImporters.length > 0) {
            matchesImporter = selectedImporters.includes(coffee.importer);
        }

        return matchesPrice && matchesCuppingScore && matchesProcessMethod && matchesOrigin && matchesImporter;
    });

    displayResults(filteredResults);
}
function fetchCoffeeBySearchQuery(query) {
    let searchResults = DEMO_COFFEE_DATA.filter(coffee => 
        coffee.name.toLowerCase().includes(query) ||
        coffee.notes.toLowerCase().includes(query) ||
        coffee.origin.toLowerCase().includes(query)
    );
    return searchResults;
}

function switchView(view) {
    qs(`#${view}`).classList.remove("hidden");
    qsa("main > section").forEach(section => {
        if (section.id !== view) {
            section.classList.add("hidden");
        }
    })
}

init();
