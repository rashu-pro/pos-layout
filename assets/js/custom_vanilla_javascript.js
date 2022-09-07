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
    itemCloned = document.querySelector("[data-type='cloneable']").cloneNode(true),
    itemWrapper = document.getElementById('product-wrapper'),
    cartItems = addedItem(document.querySelectorAll('.cart-item-list .cart-item'));

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









/**
 * FUNCTIONS DEFINITION
 * ----------------------------------------------
 */

/**
 * enable loader div
 */
function loaderDivEnable() {
    document.getElementById('loader-div').classList.add('active');
}

/**
 * disable loader div
 */
function loaderDivDisable() {
    document.getElementById('loader-div').classList.remove('active');
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

    //=== append item the item wrapper
    for(let i=0; i<itemList.length; i++){
        let dataId = `item-group-${itemCategory}-${i+1}`,
            itemKey = itemList[i].key,
            itemName = itemList[i].name,
            itemPrice = itemList[i].price;
        makeItemReadyToAppend(dataId, itemKey, itemName, itemPrice);
        itemWrapper.appendChild(itemCloned.cloneNode(true));
    }

    //=== pass active class to the item which is added into cart
    activeSelectedItem('product-single', addedItem(cartItems));
    loaderDivDisable();
}

/**
 *
 * @param dataId
 * @param itemKey
 * @param itemName
 * @param itemPrice
 * @return {Node} itemdiv
 */
function makeItemReadyToAppend(dataId, itemKey, itemName, itemPrice){
    itemCloned.querySelector('.product-single').setAttribute('data-category', itemCategory);
    itemCloned.querySelector('.product-single').setAttribute('data-name', itemName);
    itemCloned.querySelector('.product-single').setAttribute('data-price', itemPrice);
    itemCloned.querySelector('.product-single').setAttribute('data-key', itemKey);
    itemCloned.querySelector('.product-single').setAttribute('data-id', dataId);
    itemCloned.querySelector('.product-title').innerText = itemName;
    itemCloned.querySelector('.product-title').innerText = itemPrice;
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