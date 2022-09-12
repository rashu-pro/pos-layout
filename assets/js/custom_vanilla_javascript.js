/**
 * Created by rashu on 9/6/2022.
 */

const BODY_OVERLAY = document.querySelector('.body-overlay-js');
const CART_SIDEBAR = document.querySelector('.sidebar-js');
const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUPON_CODES = [
    { name: 'coupon', discount: '20', calculateMethod: 'percentage' },
    { name: 'discount', discount: '30', calculateMethod: 'percentage' },
    { name: 'voucher', discount: '50', calculateMethod: 'solid' }
];

let itemHolder = document.querySelector('.cart-item-list'),
    itemToCloneSelector = document.querySelector(".product-single-box[data-type='cloneable']"),
    itemWrapper = document.getElementById('product-wrapper'),
    cartItems = addedItem(document.querySelectorAll('.cart-item-list .cart-item')),
    itemCloned = '';

if(itemToCloneSelector && itemToCloneSelector.nodeType === Node.ELEMENT_NODE){
    itemCloned = itemToCloneSelector.cloneNode(true);
}

/**
 * PRODUCTS LOAD ON DOCUMENT READY
 *------------------------------
 */
let itemCategorySelector = document.getElementById('item-category'),
    selectedItemCategory = itemCategorySelector.options[itemCategorySelector.selectedIndex],
    itemCategory = selectedItemCategory.getAttribute('data-category');

//=== UPDATE CATEGORY TITLE
writeItemCategoryTitle(document.getElementById('item-category-title'));

//=== LOAD ITEMS IN THE PRODUCT WRAPPER
loadItems(itemCategory, itemWrapper, itemCloned);

//=== ON SCROLL FUNCTION
window.addEventListener("scroll",()=>{
    if(document.documentElement.scrollTop > document.querySelector('header.header').clientHeight){
        document.querySelector('.sidebar-js').classList.add('sidebar-top');
    }else{
        document.querySelector('.sidebar-js').classList.remove('sidebar-top');
    }
});

//=== ON ITEM CATEGORY CHANGE
itemCategorySelector.addEventListener('change', function () {
    let selectedItemCategory = this.options[itemCategorySelector.selectedIndex],
        itemCategory = selectedItemCategory.getAttribute('data-category');
    loadItems(itemCategory, itemWrapper, itemCloned);
});

/**
 * CLICK ACTIONS
 *------------------------------
 */
//=== TOGGLE(OPEN) MOBILE CART ON CART ICON CLICK
document.querySelector('.cart-toggler-js').addEventListener('click', (event)=>{
    cartToggle(true);
});

//=== TOGGLE(CLOSE) MOBILE CART ON OVERLAY CLICK
document.querySelector('.body-overlay-js').addEventListener('click', (event)=>{
    cartToggle(false);
});

//=== TOGGLE(CLOSE) CART ON CLOSE ICON CLICK
document.querySelector('.cart-close-js').addEventListener('click', (event)=>{
    cartToggle(false);
});

//=== ITEM ADD/REMOVE TO CART
document.addEventListener('click', function (event) {
    if(event.target && event.target.matches('.product-single .btn-quantity-js') || event.target.matches('.product-single .btn-quantity-js img')){
        event.preventDefault();
        let self = event.target;
        if(event.target.nodeName==='IMG'){
            self = event.target.parentNode;
        }
        let currentQuantity = parseInt(self.closest('.product-quantity').querySelector('.item-quantity').value),
            calculationMethod = self.getAttribute('data-method'),
            quantity = quantityCalculation(currentQuantity, calculationMethod),
            itemName = self.closest('.product-single').getAttribute('data-name'),
            itemCategoryKey = self.closest('.product-single').getAttribute('data-category-key'),
            itemUnitPrice = self.closest('.product-single').getAttribute('data-price'),
            dataId = self.closest('.product-single').getAttribute('data-id'),
            dataKey = self.closest('.product-single').getAttribute('data-key'),
            cartItemDivCloned = document.querySelector('.cart-item[data-type=cloneable]').cloneNode(true);

        //=== update quantity value in DOM at quantity button click
        self.closest('.product-quantity').querySelector('.item-quantity').value = quantity;

        let cartItem = makeCartItemReadyToAppend(cartItemDivCloned, dataId, itemUnitPrice, quantity, itemName, itemCategoryKey, dataKey);
        addItemIntoCart(self, itemHolder, cartItem, dataId, quantity, itemUnitPrice);
        isCartEmpty(document.querySelectorAll('.cart-item-list .cart-item'));

        let currentProductSelector = self.closest('.product-single');
        isProductActive(currentProductSelector, quantity);

        cartSummary();
    }
});

//=== CUSTOM PRODUCT QUANTITY VALUE UPDATE ON QUANTITY BUTTON CLICK
document.addEventListener('click', function (event) {
    if(event.target && event.target.matches('.product-custom .btn-quantity-custom-js') || event.target.matches('.product-custom .btn-quantity-custom-js img')){
        event.preventDefault();
        let self = event.target;
        if(event.target.nodeName==='IMG'){
            self = event.target.parentNode;
        }
        self.closest('.product-custom').querySelector('.item-quantity').value = quantityCalculation(self.closest('.product-custom').querySelector('.item-quantity').value, self.getAttribute('data-method'));
    }

});

//=== ITEM QUANTITY UPDATE ON QUANTITY BUTTON CLICK ON CART ITEM
document.addEventListener('click', function (event) {
    if(event.target && event.target.matches('.cart-item .btn-quantity-js') || event.target.matches('.cart-item .btn-quantity-js img')){
        event.preventDefault();
        let self = event.target;
        if(event.target.nodeName==='IMG'){
            self = event.target.parentNode;
        }
        let dataId = self.closest('.cart-item').getAttribute('data-id'),
            quantity = quantityCalculation(self.closest('.cart-item').querySelector('.item-quantity').value, self.getAttribute('data-method')),
            itemUnitPrice = self.closest('.cart-item').getAttribute('data-price'),
            currentProductSelector = document.querySelector('.product-single[data-id='+dataId+']');
        self.closest('.cart-item').querySelector('.item-quantity').value = quantity;
        currentProductSelector.querySelector('.item-quantity').value = quantity;
        isProductActive(currentProductSelector, quantity);
        if(quantity>0){
            updateCartItem(self.closest('.cart-item'), dataId, quantity, itemUnitPrice);
        }

        if(quantity<1){
            self.closest('.cart-item').remove();
        }
        isCartEmpty(document.querySelectorAll('.cart-item-list .cart-item'));
        cartSummary();
    }
});

//=== REMOVING CART ITEM ON CLOSE ICON CLICK
document.addEventListener('click', function (event) {
    if(event.target && event.target.matches('.cart-remove-js') || event.target.matches('.cart-remove-js *')){
        event.preventDefault();
        let self = event.target;
        if(event.target.nodeName==='IMG'){
            self = event.target.parentNode;
        }
        let dataId = self.closest('.cart-item').getAttribute('data-id'),
            quantity = 0;
        removeCartItem(self, dataId, quantity);
        cartSummary();
    }
});

//=== CUSTOM PRODUCT ADD CLICK ACTION
document.addEventListener('click', function (event) {
    if(event.target && event.target.matches('.btn-custom-product-add-js') || event.target.matches('.btn-custom-product-add-js *')){
        event.preventDefault();
        let self = event.target;
        if(event.target.nodeName==='IMG'){
            self = event.target.parentNode;
        }

        let dataId = 'data-id-' + Math.floor(Math.random() * 90000) + 10000;
    }
});











/**
 * FUNCTIONS DEFINITION
 * ----------------------------------------------
 */

/**
 *
 * enable loader div
 */
function loaderDivEnable() {
    document.getElementById('loader-div').classList.add('active');
}

/**
 *
 * disable loader div
 */
function loaderDivDisable() {
    document.getElementById('loader-div').classList.remove('active');
}

/**
 *
 * @param elementSelector
 * @return {boolean} - check whether selector is a valid DOM element
 */
function isElementNode(elementSelector){
    return elementSelector.nodeType === Node.ELEMENT_NODE;
}

/**
 *
 * @param itemCategorySelector
 * @return item category title
 */
function getItemCategoryTitle(itemCategorySelector) {
    return itemCategorySelector.options[itemCategorySelector.selectedIndex].text;
}

/**
 *
 * @param selectorToWrite
 * @sideeffects write the item title to the seletor
 */
function writeItemCategoryTitle(selectorToWrite){
    selectorToWrite.innerText = getItemCategoryTitle(document.getElementById('item-category'));
}

/**
 *
 * @param itemCategory
 * @param itemWrapper
 * @param itemCloned
 * @nosideeffects load items into the product wrapper
 */
function loadItems(itemCategory, itemWrapper, itemCloned) {
    loaderDivEnable();
    if(!itemCategory){
        alert('No category given to fetch items!');
        loaderDivDisable();
        return;
    }

    let itemList = itemListByCategory(ITEM_LIST, itemCategory); // fetch item list
    if(itemList.length<1){
        alert('No items has been found by the category given!');
        loaderDivDisable();
        return;
    }

    //=== clear product wrapper div
    while(itemWrapper.hasChildNodes()){
        itemWrapper.removeChild(itemWrapper.firstChild);
    }

    //=== when no item div has been found to clone
    if(!itemCloned){
        console.error('no item has been found to clone! [There should be a html product-single div present to clone]');
        loaderDivDisable();
        return;
    }

    //=== append item the item wrapper
    for(let i=0; i<itemList.length; i++){
        let dataId = `item-group-${itemCategory}-${i+1}`,
            itemKey = itemList[i].key,
            itemName = itemList[i].name,
            itemPrice = itemList[i].price;
        makeItemReadyToAppend(itemCloned, dataId, itemKey, itemName, itemPrice);
        itemWrapper.appendChild(itemCloned.cloneNode(true));
    }

    //=== pass active class to the item which is added into cart
    activeSelectedItem('product-single', addedItem(cartItems));
    loaderDivDisable();
}

/**
 *
 * @param itemCloned
 * @param dataId
 * @param itemKey
 * @param itemName
 * @param itemPrice
 * @return {Node} itemdiv
 */
function makeItemReadyToAppend(itemCloned, dataId, itemKey, itemName, itemPrice){
    if(!itemCloned){
        console.log('item has not been found!')
        return;
    }
    itemCloned.querySelector('.product-single').setAttribute('data-category', itemCategory);
    itemCloned.querySelector('.product-single').setAttribute('data-name', itemName);
    itemCloned.querySelector('.product-single').setAttribute('data-price', itemPrice);
    itemCloned.querySelector('.product-single').setAttribute('data-key', itemKey);
    itemCloned.querySelector('.product-single').setAttribute('data-id', dataId);
    itemCloned.querySelector('.product-title').innerText = itemName;
    itemCloned.querySelector('.product-price .price-amount').innerText = itemPrice;
    return itemCloned;
}

/**
 *
 * @param itemList
 * @param itemCategory
 * @return an filtered array from the given array
 */
function itemListByCategory(itemList, itemCategory){
    return itemList.filter(itemList => itemList.itemCategory === itemCategory);
}

/**
 *
 * @param addedItemSelector
 * @return {Array} an array consists of added item into cart
 */
function addedItem(addedItemSelector){
    let addedItems = [];
    for(let item of addedItemSelector){
        let dataId = item.getAttribute('data-id'),
            quantity = item.querySelector('.item-quantity').value;
        addedItem.push({
            dataId: dataId,
            quantity: quantity
        })
    }
    return addedItems;
}

/**
 *
 * @param itemElementClass
 * @param addedItems
 * @sideffects make added item active in the products wrapper
 */
function activeSelectedItem(itemElementClass, addedItems) {
    for(let addedItem in addedItems){
        let addedItemSelector = `.${itemElementClass}[data-id=${addedItem.dataId}]`;
        document.querySelector(addedItemSelector).classList.add('active');
        document.querySelector(addedItemSelector).querySelector('.item-quantity').value = addedItem.quantity;
    }
}

/**
 *
 * @param isToggle
 * @sideffects toggle cart window for mobile
 */
function cartToggle(isToggle) {
    if (isToggle) {
        BODY_OVERLAY.style.display = 'block';
        CART_SIDEBAR.classList.add('opened');
    } else {
        BODY_OVERLAY.style.display = 'none';
        CART_SIDEBAR.classList.remove('opened');
    }
}

/**
 *
 * @param currentQuantity
 * @param calculationMethod
 * @return {Number|*} - quantity after calculation
 */
function quantityCalculation(currentQuantity, calculationMethod){
    currentQuantity = parseInt(currentQuantity);
    if (!currentQuantity) {
        currentQuantity = 0;
    }
    if (calculationMethod === 'stepup') {
        currentQuantity = currentQuantity + 1;
    }

    if (calculationMethod === 'stepdown') {
        if (currentQuantity > 0) {
            currentQuantity = currentQuantity - 1;
        }
    }
    return currentQuantity;
}

/**
 *
 * @param cartItem
 * @param dataId
 * @param itemUnitPrice
 * @param quantity
 * @param itemName
 * @param itemCategoryKey
 * @param dataKey
 * @return {*} - cart item html
 */
function makeCartItemReadyToAppend(cartItem, dataId, itemUnitPrice, quantity, itemName, itemCategoryKey, dataKey){
    if(!cartItem){
        console.log('No cart item html string has been found!');
        return;
    }
    cartItem.classList.add(dataId);
    cartItem.setAttribute('data-id', dataId);
    cartItem.setAttribute('data-price', itemUnitPrice);
    cartItem.setAttribute('data-quantity', quantity);
    cartItem.querySelector('.item-title').innerHTML = itemName;
    cartItem.querySelector('.item-quantity').value = quantity;
    cartItem.querySelector('.item-price').innerHTML = parseInt(quantity)*parseInt(itemUnitPrice);

    cartItem.querySelector('.product-category-key').innerHTML = itemCategoryKey;
    cartItem.querySelector('.product-key').value = dataKey;
    cartItem.querySelector('.product-name').value = itemName;
    cartItem.querySelector('.product-quantity').value = quantity;
    cartItem.querySelector('.product-unit-price').value = itemUnitPrice;
    cartItem.querySelector('.product-price').value = parseInt(quantity)*parseInt(itemUnitPrice);
    return cartItem;
}

/**
 *
 * @param self
 * @param cartItemHolder
 * @param cartItem
 * @param dataId
 * @param quantity
 * @param itemUnitPrice
 * @effects adds item into cart
 */
function addItemIntoCart(self, cartItemHolder, cartItem, dataId, quantity, itemUnitPrice){
    if(!isElementNode(cartItem)){
        console.error('No item has been found to add into cart!');
        return;
    }

    let cartItemSelector = document.querySelector('.cart-item-list .cart-item[data-id='+dataId+']');
    //=== when quantity is zero
    if(quantity<1){
        if(cartItemSelector){
            cartItemSelector.remove();
        }
        return;
    }

    if(cartItemSelector){
        updateCartItem(cartItemSelector, dataId, quantity, itemUnitPrice);
    }else{
        document.querySelector('.empty-cart-notice-wrapper').classList.remove('active');
        cartItemHolder.append(cartItem);
    }
    focusingCartItem(cartItemSelector);
    if(self.closest('.product-custom')){
        emptyCustomItemFields(self.closest('.product-custom'));
    }

}

/**
 *
 * @param cartItems
 * @effects when there is no item in cart, empty cart icon will be visible
 */
function isCartEmpty(cartItems){
    if(cartItems.length<1){
        document.querySelector('.empty-cart-notice-wrapper').classList.add('active');
    }
}

/**
 *
 * @param cartItemToUpdate
 * @param dataId
 * @param quantity
 * @param itemUnitPrice
 * @effects update cart item when item is already been added
 */
function updateCartItem(cartItemToUpdate, dataId, quantity, itemUnitPrice) {
    cartItemToUpdate.querySelector('.item-quantity').value = quantity;
    cartItemToUpdate.querySelector('.item-price').innerHTML = quantity*itemUnitPrice;
    cartItemToUpdate.setAttribute('data-quantity', quantity);
    cartItemToUpdate.querySelector('.product-quantity').value = quantity;
    cartItemToUpdate.querySelector('.product-price').value = quantity*itemUnitPrice;
}

/**
 *
 * @param elementSelector
 * @effects focuses cart item when its being added
 */
function focusingCartItem(elementSelector) {
    if(!elementSelector){
        return;
    }
    elementSelector.classList.add('focused');
    setTimeout(function () {
        elementSelector.classList.remove('focused');
    },400)
}

/**
 *
 * @param parent
 * @effects empty custom fields after adding custom product into cart
 */
function emptyCustomItemFields(parent){
    let fields = parent.querySelectorAll('.form-control');
    fields.forEach(field=>{
        field.value = '';
    })
}

/**
 *
 * @param cartItemSelector
 * @return {number} - cart subtotal
 */
function calculateCartSubtotal(cartItemSelector){
    if(!cartItemSelector){
        console.error('No cart item found!');
        return;
    }
    let subtotal = 0;
    cartItemSelector.forEach(cartItem=>{
        subtotal += parseFloat(cartItem.querySelector('.item-price').innerText);
    });
    return subtotal;
}

/**
 *
 * @param taxableAmount
 * @param taxPercentage
 * @return {number} - tax amount
 */
function calculateTax(taxableAmount, taxPercentage){
    if(taxableAmount<=0) return;
    return (taxPercentage*taxableAmount)/100;
}

/**
 *
 * @param extraParamRows
 * @return {Array} - extra parameters to calculate grand total, like: tax, discount, donation etcetera.
 */
function extraParams(extraParamRows){
    let extraParams = [];
    if(extraParamRows.length<1) return;

    extraParamRows.forEach(param=>{
        extraParams.push({
            'paramValue': parseFloat(param.querySelector('.amount').innerText),
            'calculationMethod': param.getAttribute('data-method')
        });
    });
    return extraParams;
}

/**
 *
 * @param subtotal
 * @param extraParams
 * @return {number} - total amount of the cart
 */
function calculateGrandTotal(subtotal, extraParams) {
    let calculateSign = '+',
        calculationString = '',
        grandTotal = subtotal;
    if(extraParams.length<1){
        return grandTotal;
    }
    extraParams.forEach(param=>{
        if(param.calculationMethod==='addition'){
            calculateSign = '+';
            calculationString += `${grandTotal}${calculateSign}${param.paramValue}`;
            grandTotal +=param.paramValue;
            calculationString += `=${grandTotal}`;
        }

        if(param.calculationMethod==='subtraction'){
            calculateSign = '-';
            calculationString += `\n${grandTotal}${calculateSign}${param.paramValue}`;
            grandTotal -= param.paramValue;
            calculationString += `=${grandTotal}`;
        }
    });
    return grandTotal;
}

/**
 *
 * @param subtotal
 * @param grandTotal
 * @param subtotalSelector
 * @param grandTotalSelector
 * @effects populate subtotal and grandtotal into the DOM
 */
function populateCartSummaryData(subtotal, grandTotal, subtotalSelector, grandTotalSelector){
    if(!Number.isInteger(subtotal)) subtotal = subtotal.toFixed(2);
    if(!Number.isInteger(grandTotal)) grandTotal = grandTotal.toFixed(2);
    subtotalSelector.innerText = subtotal;
    grandTotalSelector.innerText = grandTotal;
}

/**
 *
 * @param currentProductSelector
 * @param quantity
 * @effects 'active' class will be toggled on current item on item list
 */
function isProductActive(currentProductSelector, quantity) {
    if(quantity<1){
        currentProductSelector.classList.remove('active');
        return;
    }
    currentProductSelector.classList.add('active');
}

/**
 * ALL THE CART SUMMARY RELATED FUNCTIONALITY HAS BEEN DONE HERE
 */
function cartSummary(){
    let cartItemSelectors = document.querySelectorAll('.cart-item-list .cart-item');
    let subtotal = parseFloat(calculateCartSubtotal(cartItemSelectors));

    let taxableAmount = subtotal;
    let taxElementSelector = document.querySelector('.tax-amount-js.tax-enable');
    if(taxElementSelector){
        taxElementSelector.setAttribute('data-taxableamount', taxableAmount);
        taxableAmount<=0?taxElementSelector.innerHTML = 0:taxElementSelector.innerHTML = calculateTax(taxableAmount, parseInt(taxElementSelector.getAttribute('data-taxpercentage')));
    }

    let extraParamRows = document.querySelectorAll('.cart-summary .extra-param-row.param-enable');
    let extraParam = extraParams(extraParamRows);

    let total = calculateGrandTotal(subtotal, extraParam);
    let subtotalSelector = document.querySelector('.subtotal-js');
    let grandTotalSelector = document.querySelector('.grand-total-js');
    populateCartSummaryData(subtotal, total, subtotalSelector, grandTotalSelector);
}

/**
 *
 * @param self
 * @param dataId
 * @param quantity
 * @effect remove cart item from the cart
 */
function removeCartItem(self, dataId, quantity) {
    self.closest('.cart-item').querySelector('.item-quantity').value = quantity;
    document.querySelector('.product-single[data-id='+dataId+']').querySelector('.item-quantity').value = quantity;
    isProductActive(document.querySelector('.product-single[data-id='+dataId+']'), quantity);
    document.querySelector('.cart-item-list .cart-item').remove();
}