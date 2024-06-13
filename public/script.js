"use strict";

(function() {

let COFFEE_DATA;
const BASE_URL = "http://localhost:3000/";
let currentPage = 1;
const resultsPerPage = 12;

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

/**
 * Fetches coffee data from the API.
 */
function fetchCoffeeData() {
    let url = BASE_URL + "data";

    fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .then((coffeeData) => {
            COFFEE_DATA = coffeeData;
            generateFilters(coffeeData);
            initFiltersAndSort();

            applyFiltersAndSort();
            displayResults(coffeeData);
        })
        .catch(handleError);
}

/**
 * Fetches cart items from the API.
 */
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

/**
 * Handles errors in requests to the API.
 * @param {Error} error - The error object.
 */
function handleError(error) {
    throw Error(`Error in request: ${error}`);
}


/**
 * Generates a coffee result card.
 * @param {Object} coffeeInfo - The coffee information.
 * @returns {HTMLElement} The coffee result card element.
 */
function generateCoffeeResultCard(coffeeInfo){
    let card = gen("div");
    card.classList.add("product-card");

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

/**
 * Displays the results of the coffee search.
 * @param {Array} coffeeResults - The array of coffee results.
 */
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

/**
 * Displays pagination controls.
 * @param {number} totalResults - The total number of results.
 */
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
            displayResults(COFFEE_DATA);
        });
        paginationControls.appendChild(pageButton);
    }
}

/**
 * Displays the coffee information for the selected coffee on a full page.
 * @param {Object} coffeeInfo - The coffee information.
 */
function displayCoffeeInfoFullView(coffeeInfo){
    switchView("product-view");
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
    price.textContent = `Price: ${coffeeInfo.price} per lb`;
    productDetails.appendChild(price);

    const processMethod = gen('p');
    processMethod.textContent = `Process Method: ${coffeeInfo.process_method}`;
    productDetails.appendChild(processMethod);

    const cuppingScore = gen('p');
    cuppingScore.textContent = `Cupping Score: ${coffeeInfo.cupping_score}`;
    productDetails.appendChild(cuppingScore);

    const addToCartButton = gen('button');
    addToCartButton.textContent = 'Add to Cart';
    addToCartButton.classList.add("button");
    addToCartButton.addEventListener('click', () => {
        addToCart(coffeeInfo, 1);
    });
    productDetails.appendChild(addToCartButton);

    productFullView.appendChild(productDetails);
}

/**
 * Displays clickable search suggestions when the user types in the search bar.
 * @param {Array} results - The search results.
 */
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


/**
 * Displays coffee information in a sidebar.
 * @param {Object} coffeeInfo - The coffee information.
 */
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

/**
 * Adds a coffee item to the cart.
 * @param {Object} coffeeInfo - The coffee information.
 * @param {number} amount - The amount of coffee to add.
 */
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
    }).then(checkStatus);
    updateCartView();
    showCartModal(coffeeInfo.name);
}

/**
 * Updates the cart view.
 */
function updateCartView() {
    const cartItemsContainer = qs("#cart-items");
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
    qs("#cart-total").textContent = cart.total.toFixed(2);

    // Add event listeners to remove buttons
    qsa(".remove-item").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = event.target.getAttribute("data-index");
            removeFromCart(index);
        });
    });
}

/**
 * Removes an item from the cart by index.
 * @param {number} index - The index of the item to remove.
 */
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
        }
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Shows a modal with a notification that the item was added to the cart.
 * @param {string} productName - The name of the product added to the cart.
 */
function showCartModal(productName){
    const modal = qs("#notification-modal");
    let notificationHeading = gen("h2");
    notificationHeading.textContent = `${productName} was added to Cart`;
    qs("#notification-message").innerHTML = "";
    qs("#notification-message").appendChild(notificationHeading);
    modal.classList.remove("hidden");
    document.body.classList.add("no-scroll");
}

/**
 * Initializes the quick view sidebar functionality.
 */
function initSidebar() {
    let closeSideBar = qs(".product-header .close");
    closeSideBar.addEventListener("click", () => {
        qs("#results").classList.remove("selected-view");
        qs("#selected-coffee-details").classList.add("hidden");
    });

    const filterItems = qsa('.filter');
    filterItems.forEach(item => {
        const header = item.querySelector('.filter-header');
        header.addEventListener('click', () => {
            let span = item.querySelector("span");
            item.classList.toggle('active');
            if (span.textContent === "+") {
                item.querySelector("span").innerHTML = "&minus;";
            } else {
                item.querySelector("span").innerHTML = "&plus;";
            }
        });
    });
}

/**
 * Initializes the search functionality.
 */
function initSearch() {
    const searchInput = qs("#search-input");
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        displaySearchSuggestions(fetchCoffeeBySearchQuery(query));
    });
}

/**
 * Initializes the navigation functionality.
 */
function initNavigation() {
    const homeLink = qs("header > a");
    homeLink.addEventListener("click", (event) => {
        event.preventDefault();
        switchView("browse-view");
    });
}

/**
 * Initializes the notification modal functionality.
 */
function initNotificationModal() {
    const modal = qs("#notification-modal");
    const cartButton = qs("#cart-button");
    const closeNotificationButton = qs("#notification-modal .close");

    cartButton.addEventListener("click", (event) => {
        fetchCartItems();
        switchView("cart-view");
    });

    closeNotificationButton.addEventListener("click", () => {
        modal.classList.add("hidden");
        document.body.classList.remove("no-scroll");
    });

    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.classList.add("hidden");
            document.body.classList.remove("no-scroll");
        } else {
            qs("#suggestions").classList.add("hidden");
        }
    });
}


/**
 * Initializes account management functionality.
 */
function initAccountManagement() {
    const accountLink = qs("#account-link");
    const signUpLink = qs("#sign-up-link");
    const loginLink = qs("#login-link");

    const loginForm = qs("#login-form");
    const signUpForm = qs("#sign-up-form");
    const logoutButton = qs("#logout-button");
    const contactForm = qs("#contact-form");

    accountLink.addEventListener("click", (event) => {
        event.preventDefault();
        switchView("account-view");
    });

    signUpLink.addEventListener("click", (event) => {
        event.preventDefault();
        qs("#login-view").classList.add("hidden");
        qs("#sign-up-view").classList.remove("hidden");
    });

    loginLink.addEventListener("click", (event) => {
        event.preventDefault();
        qs("#sign-up-view").classList.add("hidden");
        qs("#login-view").classList.remove("hidden");
    });

    loginForm.addEventListener("submit", handleLogin);
    signUpForm.addEventListener("submit", handleSignUp);
    logoutButton.addEventListener("click", handleLogout);
    contactForm.addEventListener("submit", handleContact);
}

/**
 * Initializes filter and sort functionality.
 */
function initFiltersAndSort() {
    qs('#min-price').addEventListener('input', applyFiltersAndSort);
    qs('#max-price').addEventListener('input', applyFiltersAndSort);
    qs('#min-cupping-score').addEventListener('input', applyFiltersAndSort);
    qs('#max-cupping-score').addEventListener('input', applyFiltersAndSort);
    qsa('input[name="process_methods"]').forEach(el => el.addEventListener('change', applyFiltersAndSort));
    qsa('input[name="origins"]').forEach(el => el.addEventListener('change', applyFiltersAndSort));
    qsa('input[name="importers"]').forEach(el => el.addEventListener('change', applyFiltersAndSort));
    qs('#sort').addEventListener('change', applyFiltersAndSort);
}

/**
 * Clears the cart by removing all items.
 */
function clearCart() {
    for (let i = 0; i < cart.cartItems.length; i++) {
        removeFromCart(0);
    }
}

/**
 * Initializes the checkout functionality.
 */
function initCheckout(){
    const checkoutButton = qs("#cart-view button");
    checkoutButton.addEventListener("click", async function(event) {
        clearCart();
        switchView("checkout-view");
    });

    const continueShoppingButton = qs("#checkout-view button");
    continueShoppingButton.addEventListener("click", (event) => {
        event.preventDefault();
        switchView("browse-view");
    });
}

/**
 * Initializes the contact form functionality.
 */
function initContactForm() {
    const contactLink = qs("#contact-link");
    contactLink.addEventListener("click", (event) => {
        event.preventDefault();
        switchView("contact-view");
    });
}

/**
 * Initializes the full web application JS logic.
 */
function init() {
    fetchCartItems();
    fetchCoffeeData();

    initSidebar();
    initSearch();
    initNavigation();
    initNotificationModal();
    initAccountManagement();
    initContactForm();

    initCheckout();
}

/**
 * Handles login form submission.
 * @param {Event} event - The event object.
 */
function handleLogin(event) {
    event.preventDefault();
    const email = qs("#login-email").value;
    const password = qs("#login-password").value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Logged in') {
            qs("#login-view").classList.add("hidden");
            qs("#account-info").classList.remove("hidden");
            qs("#user-email").textContent = `User Email: ${data.user.email}`;
        } else {
            qs("#login-form").reset();
        }
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Handles sign-up form submission.
 * @param {Event} event - The event object.
 */
function handleSignUp(event) {
    event.preventDefault();
    const name = qs("#sign-up-name").value;
    const email = qs("#sign-up-email").value;
    const password = qs("#sign-up-password").value;

    fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'User created') {
            qs("#sign-up-view").classList.add("hidden");
            qs("#account-info").classList.remove("hidden");
            qs("#user-email").textContent = `User Email: ${data.user.email}`;
        } 
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Handles logout functionality.
 * @param {Event} event - The event object.
 */
function handleLogout(event) {
    event.preventDefault();

    fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Logged out') {
            qs("#account-info").classList.add("hidden");
            qs("#login-email").value = "";
            qs("#login-password").value = "";
            qs("#login-view").classList.remove("hidden");
        }
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Handles contact form submission.
 * @param {Event} event - The event object.
 */
function handleContact(event) {
    event.preventDefault();
    const name = qs("#contact-name").value;
    const email = qs("#contact-email").value;
    const message = qs("#contact-message").value;

    fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Your information has been sent!") {
            contactForm.reset();
        } 
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Generates filters based on the coffee data.
 * @param {Array} data - The coffee data.
 */
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
    qs('#min-price').setAttribute('min', Math.min(...prices));
    qs('#min-price').setAttribute('max', Math.max(...prices));
    qs('#max-price').setAttribute('min', Math.min(...prices));
    qs('#max-price').setAttribute('max', Math.max(...prices));
    
    qs('#min-cupping-score').setAttribute('min', Math.min(...cuppingScores));
    qs('#min-cupping-score').setAttribute('max', Math.max(...cuppingScores));
    qs('#max-cupping-score').setAttribute('min', Math.min(...cuppingScores));
    qs('#max-cupping-score').setAttribute('max', Math.max(...cuppingScores));

    // Generate process method filter options
    const processMethodFilter = qs('#process-method-filter');
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
    const originFilter = qs('#origin-filter');
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
    const importerFilter = qs('#importer-filter');
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

/**
 * Applies filters and sorting to the coffee data.
 */
function applyFiltersAndSort() {
    const sortOption = qs('#sort').value;
    let filteredResults = applyFilters();

    switch(sortOption) {
        case 'a-to-z':
            filteredResults.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'z-to-a':
            filteredResults.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'low-to-high':
            filteredResults.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
            break;
        case 'high-to-low':
            filteredResults.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
            break;
        case 'cupping-score':
            filteredResults.sort((a, b) => parseFloat(b.cupping_score) - parseFloat(a.cupping_score));
            break;
        default:
            break;
    }

    displayResults(filteredResults);
}

/**
 * Applies filters to the coffee data.
 * @returns {Array} The filtered coffee data.
 */
function applyFilters() {
    const minPrice = qs('#min-price').value;
    const maxPrice = qs('#max-price').value;
    const minCuppingScore = qs('#min-cupping-score').value;
    const maxCuppingScore = qs('#max-cupping-score').value;
    const selectedProcessMethods = [...qsa('input[name="process_methods"]:checked')].map(el => el.value);
    const selectedOrigins = [...qsa('input[name="origins"]:checked')].map(el => el.value);
    const selectedImporters = [...qsa('input[name="importers"]:checked')].map(el => el.value);

    const filteredResults = COFFEE_DATA.filter(coffee => {
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

    return filteredResults;
}

/**
 * Fetches coffee data based on the search query.
 * @param {string} query - The search query.
 * @returns {Array} The search results.
 */
function fetchCoffeeBySearchQuery(query) {
    let searchResults = COFFEE_DATA.filter(coffee => 
        coffee.name.toLowerCase().includes(query) ||
        coffee.notes.toLowerCase().includes(query) ||
        coffee.origin.toLowerCase().includes(query)
    );
    return searchResults;
}

/**
 * Switches the view to the specified view.
 * @param {string} view - The ID of the view to switch to.
 */
function switchView(view) {
    qs(`#${view}`).classList.remove("hidden");
    qsa("main > section").forEach(section => {
        if (section.id !== view) {
            section.classList.add("hidden");
        }
    })
}

init();

})();