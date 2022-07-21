/**
 * Created by rashu on 7/19/2022.
 */

const cartToggler = document.querySelector('.cart-toggler-js');
const cartClose = document.querySelector('.cart-close-js');
const bodyOverlay = document.querySelector('.body-overlay-js');
const cartSidebar = document.querySelector('.sidebar-js');

let btnIncrease = $('.btn-plus-js'),
    btnDecrease = $('.btn-minus-js'),
    itemHolder = $('.cart-item-list');


//=== CLICK ACTIONS
$(document).on('click', '.cart-toggler-js', function () {
    cartToggle(true);
});
$(document).on('click', '.body-overlay-js', function () {
    cartToggle(false);
});
$(document).on('click', '.cart-close-js', function () {
    cartToggle(false);
});

btnIncrease.on('click', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'increase');
    addItemToCart(self, $('.cart-item-list'));
    self.closest('.product-single').addClass('active');
    calculateTotal();
});

btnDecrease.on('click', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'decrease');
    addItemToCart(self, $('.cart-item-list'));
    if(self.closest('.product-quantity').find('.item-quantity').val()<1){
        self.closest('.product-single').removeClass('active');
    }
    calculateTotal();
});

$(document).on('click', '.cart-item .btn-plus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'increase');
    let dataId = self.closest('.cart-item').data('id'),
        ticketQuantity = parseInt(self.closest('.product-quantity').find('.item-quantity').val()),
        pricePerItem = parseInt(self.closest('.cart-item').data('price')),
        priceTotal = ticketQuantity * pricePerItem;
    updateCartItem(dataId, ticketQuantity, priceTotal);
    focusingCartItem(dataId, itemHolder);
    updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity);
    calculateTotal();
});

$(document).on('click', '.cart-item .btn-minus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'decrease');
    let dataId = self.closest('.cart-item').data('id'),
        ticketQuantity = parseInt(self.closest('.product-quantity').find('.item-quantity').val()),
        pricePerItem = parseInt(self.closest('.cart-item').data('price')),
        priceTotal = ticketQuantity * pricePerItem;
    updateCartItem(dataId, ticketQuantity, priceTotal);
    focusingCartItem(dataId, itemHolder);
    updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity);
    calculateTotal();
});

$(document).on('click', '.cart-remove-js', function (e) {
    e.preventDefault();
    let self = $(this),
        dataId = self.closest('.cart-item').data('id');
    removeCartItem(self, dataId);
    calculateTotal();
});

$(document).on('click', '.btn-search-toggler', function (e) {
    e.preventDefault();
    let self = $(this);
    self.toggleClass('toggled');
    $('.search-wrapper-dropdown-js').toggleClass('active');
});

$(document).on('keyup focus blur', '.product-single .item-quantity', function (e) {
    let self = $(this);
    if(!parseInt(self.val())>0){
        self.val(0);
    }
    addItemToCart(self, $('.cart-item-list'));
    calculateTotal();
});

$(document).on('keyup focus blur', '.cart-item-list .cart-item .item-quantity', function (e) {
    let self = $(this),
        dataId = self.closest('.cart-item').data('id'),
        ticketQuantity = parseInt(self.val()),
        pricePerItem = parseInt(self.closest('.cart-item').data('price')),
        priceTotal = ticketQuantity * pricePerItem;
    updateCartItem(dataId, ticketQuantity, priceTotal);
    if(!parseInt(self.val())>0){
        self.val(0);
    }
    updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity);
    calculateTotal();
});

$('.products-wrapper .product-single').each(function (i, element) {
    if($(element).find('.item-quantity').val()>0){
        addItemToCart($(element).find('.item-quantity'), $('.cart-item-list'));
        calculateTotal();
        $(element).addClass('active');
    }
});



//=== FUNCTIONS DEFINITION
function quantityIncreaseDecrease(self, action){
    let qunatitySelector = self.closest('.product-quantity').find('.item-quantity'),
        quantitySelectorValue = parseInt(qunatitySelector.val());
    if(action==='increase'){
        qunatitySelector.val(quantitySelectorValue + 1);
    }

    if(action==='decrease'){
        if(quantitySelectorValue>0){
            qunatitySelector.val(quantitySelectorValue - 1);
        }
    }
}

function addItemToCart(self, itemHolder){
    let ticketName = self.closest('.product-single').data('name'),
        ticketQuantity = parseInt(self.closest('.product-single').find('.item-quantity').val()),
        pricePerItem = parseInt(self.closest('.product-single').data('price')),
        priceTotal = ticketQuantity * pricePerItem,
        dataId = self.closest('.product-single').data('id'),
        cartItemClone = $('.cart-item-to-clone .cart-item').clone();

    cartItemClone.attr('data-id',dataId);
    cartItemClone.attr('data-price', pricePerItem);
    cartItemClone.addClass(dataId);
    cartItemClone.find('.item-title').html(ticketName);
    cartItemClone.find('.item-quantity').val(ticketQuantity);
    cartItemClone.find('.item-price').html(priceTotal);

    //=== ADD/UPDATE ITEM INTO CART
    if($('.cart-item-list .cart-item').hasClass(dataId)) {
        updateCartItem(dataId, ticketQuantity, priceTotal);
    }else{
        $('.empty-cart-notice-wrapper').removeClass('active');
        itemHolder.append(cartItemClone);
    }
    focusingCartItem(dataId, itemHolder);

    //=== WHEN QUANTITY IS ZERO
    if(ticketQuantity<1){
        itemHolder.find('.cart-item.'+dataId).remove();
    }

}

function focusingCartItem(dataId, itemHolder){
    itemHolder.find('.cart-item.'+dataId).addClass('focused');
    setTimeout(function () {
        itemHolder.find('.cart-item.'+dataId).removeClass('focused');
    },400);
}

function updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity){
    $('.products-wrapper [data-id='+dataId+']').find('.item-quantity').val(ticketQuantity);
    if(!ticketQuantity<1) return;
    self.closest('.cart-item').remove();
    $('.products-wrapper [data-id='+dataId+']').removeClass('active');
}

function cartIsEmpty(){
    //=== WHEN CART IS EMPTY
    if(!$('.cart-item-list .cart-item').length>0){
        $('.empty-cart-notice-wrapper').addClass('active');
    }
}

function updateCartItem(dataId, ticketQuantity, priceTotal){
    $('.cart-item-list .cart-item.'+dataId).find('.item-quantity').val(ticketQuantity);
    $('.cart-item-list .cart-item.'+dataId).find('.item-price').html(priceTotal);
}

function removeCartItem(self, dataId){
    self.closest('.cart-item').remove();
    $('.products-wrapper [data-id='+dataId+']').find('.item-quantity').val('0');
    $('.products-wrapper [data-id='+dataId+']').removeClass('active');
}

function calculateTotal(){
    let total = 0,
        cartItems = 0;
    $('.cart-item-list .cart-item').each(function (i, element) {
        total = total + parseInt($(element).find('.item-price').text());
        cartItems = cartItems + parseInt($(element).find('.item-quantity').val());
    });
    $('.grand-total-js').html(total);
    cartIsEmpty();

    $('.cart-counter').html(cartItems);
    $('.cart-counter').addClass('bounce');
    setTimeout(function () {
        $('.cart-counter').removeClass('bounce');
    },1000);
}

function cartToggle(isToggle){
    if(isToggle){
        bodyOverlay.style.display = 'block';
        cartSidebar.classList.add('opened');
    }else{
        bodyOverlay.style.display = 'none';
        cartSidebar.classList.remove('opened');
    }

}