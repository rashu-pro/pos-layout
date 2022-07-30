/**
 * Created on 7/19/2022.
 */

const bodyOverlay = document.querySelector('.body-overlay-js');
const cartSidebar = document.querySelector('.sidebar-js');

let itemHolder = $('.cart-item-list');

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

$(document).on('click', '.product-single .btn-plus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'increase');
    addItemToCart(self, $('.cart-item-list'));
    self.closest('.product-single').addClass('active');
    calculateTotal();
    calculateGrandTotal();
});

$(document).on('click', '.product-single .btn-minus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'decrease');
    addItemToCart(self, $('.cart-item-list'));
    if(self.closest('.product-quantity').find('.item-quantity').val()<1){
        self.closest('.product-single').removeClass('active');
    }
    calculateTotal();
    calculateGrandTotal();
});

$(document).on('click', '.product-custom .btn-plus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    console.log('clicked');
    quantityIncreaseDecrease(self, 'increase');
});

$(document).on('click', '.product-custom .btn-minus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'decrease');
});

$(document).on('click', '.cart-item .btn-plus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'increase');
    let dataId = self.closest('.cart-item').data('id'),
        ticketQuantity = parseFloat(self.closest('.product-quantity').find('.item-quantity').val()),
        pricePerItem = parseFloat(self.closest('.cart-item').data('price')),
        priceTotal = ticketQuantity * pricePerItem;
    updateCartItem(dataId, ticketQuantity, priceTotal);
    focusingCartItem(dataId, itemHolder);
    updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity);
    calculateTotal();
    calculateGrandTotal();
});

$(document).on('click', '.cart-item .btn-minus-js', function (e) {
    e.preventDefault();
    let self = $(this);
    quantityIncreaseDecrease(self, 'decrease');
    let dataId = self.closest('.cart-item').data('id'),
        ticketQuantity = parseFloat(self.closest('.product-quantity').find('.item-quantity').val()),
        pricePerItem = parseFloat(self.closest('.cart-item').data('price')),
        priceTotal = ticketQuantity * pricePerItem;
    updateCartItem(dataId, ticketQuantity, priceTotal);
    focusingCartItem(dataId, itemHolder);
    updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity);
    calculateTotal();
    calculateGrandTotal();
});

$(document).on('click', '.cart-remove-js', function (e) {
    e.preventDefault();
    let self = $(this),
        dataId = self.closest('.cart-item').data('id');
    removeCartItem(self, dataId);
    calculateTotal();
    calculateGrandTotal();
});

$(document).on('click', '.btn-search-toggler', function (e) {
    e.preventDefault();
    let self = $(this);
    self.toggleClass('toggled');
    $('.search-wrapper-dropdown-js').toggleClass('active');
});

$(document).on('click', '.btn-custom-product-add-js', function (e) {
    e.preventDefault();
    let self = $(this),
        parent = self.closest('.product-custom'),
        dataId = 'data-id-'+Math.floor(Math.random()*90000) + 10000,
        itemName = parent.data('name'),
        itemQuantity = parseFloat(parent.find('.product-custom-price-js').val()),
        itemPrice = parseFloat(parent.find('.item-quantity').val()),
        itemTotalPrice = itemQuantity * itemPrice,
        totalField = 0,
        validField = 0;

    self.closest('.product-custom').find('.form-control').each(function (i, element) {
        if($(element).val()!==''){
            $(element).removeClass('invalid');
        }else{
            $(element).addClass('invalid');
        }
    });

    if(parent.find('.item-quantity').val()<1){
        parent.find('.item-quantity').addClass('invalid');
    }
    parent.find('.form-control.invalid').first().focus();
    parent.find('.warning-message').remove();
    parent.find('.form-control.invalid').first().after('<p class="warning-message text-danger">This field is required!</p>');

    if(parent.find('.form-control.invalid').length>0){
        return;
    }

    $('.loader-div').addClass('active');
    itemName = self.closest('.product-custom').find('.product-custom-name-js').val();

    addCustomItemToCart(self, dataId, itemName, itemQuantity, itemPrice, itemTotalPrice);
    calculateTotal();
    calculateGrandTotal();
    $('.loader-div').removeClass('active');
});

$(document).on('click', '.btn-donate-js', function (e) {
    e.preventDefault();
    let self = $(this),
        parent = self.closest('.product-custom'),
        dataId = 'data-id-'+Math.floor(Math.random()*90000) + 10000,
        itemName = parent.data('name'),
        itemQuantity = false,
        itemPrice = false,
        itemTotalPrice = parent.find('.donation-amount-js').val();
    if(itemTotalPrice<1){
        parent.find('.form-control').first().focus();
        parent.find('.form-control').first().closest('.form-group').find('.warning-message').remove();
        parent.find('.form-control').first().after('<p class="warning-message text-danger">This field is required!</p>');
        return;
    }
    $('.loader-div').addClass('active');
    addCustomItemToCart(self, dataId, itemName, itemQuantity, itemPrice, itemTotalPrice);
    calculateTotal();
    calculateGrandTotal();
    $('.loader-div').removeClass('active');
});

//=== COUPON APPLY BUTTON CLICK
$(document).on('click', '.btn-apply-voucher-js', function (e) {
    e.preventDefault();
    let self = $(this),
        voucherField = $('.voucher-field-js'),
        subtotal = parseFloat($('.subtotal-js').text()),
        discountAmount = 0,
        discountSign = '',
        couponCodes = [
            {name:'coupon', discount:'20', calculateMethod:'percentage'},
            {name:'discount', discount:'30', calculateMethod:'percentage'},
            {name:'voucher', discount:'50', calculateMethod:'solid'}
            ];
    if(voucherField.val()===''){
        voucherField.focus();
        return;
    }
    let object = couponCodes.find(obj=>obj.name===voucherField.val())
    if(!object){
        console.log('not found!');
        return;
    }
    console.log(object);
    discountAmount = object.discount;
    if(object.calculateMethod==='percentage'){
        discountSign = '%';
        console.log('discount amount',parseFloat(object.discount));
        console.log('subtotal', subtotal);
        discountAmount = (parseFloat(object.discount)*subtotal)/100;
    }
    $('.discount-note-js').html('<span class="currency">$</span><span>'+object.discount+'</span><span>'+discountSign+'</span>');
    $('.discount-js').html(discountAmount);
    calculateGrandTotal();
});

//=== CHECKOUT BUTTON CLICK
$(document).on('click', '.btn-checkout-js', function (e) {
    e.preventDefault();
    if(parseInt($('.grand-total-js').text()<1)) return;
    $('.loader-div').addClass('active');
    setTimeout(function () {
        $('.loader-div').removeClass('active');
    },2000);

});

//=== REGULAR PRODUCT ITEM QUANTITY CHANGE ACTION
$(document).on('keyup focus blur', '.product-single .item-quantity', function (e) {
    let self = $(this);
    if(!parseFloat(self.val())>0){
        self.val(0);
    }
    addItemToCart(self, $('.cart-item-list'));
    calculateTotal();
    calculateGrandTotal();
});

//=== CART ITEM ITEM QUANTITY CHANGE ACTION
$(document).on('keyup focus blur', '.cart-item-list .cart-item .item-quantity', function (e) {
    let self = $(this),
        dataId = self.closest('.cart-item').data('id'),
        ticketQuantity = parseFloat(self.val()),
        pricePerItem = parseFloat(self.closest('.cart-item').data('price')),
        priceTotal = ticketQuantity * pricePerItem;
    updateCartItem(dataId, ticketQuantity, priceTotal);
    if(!parseFloat(self.val())>0){
        self.val(0);
    }
    updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity);
    calculateTotal();
    calculateGrandTotal();
});

$(document).on('blur', '.product-custom-name-js', function () {
    let self = $(this),
        fieldValue = self.val();
    self.closest('.product-custom').attr('data-name', fieldValue);
    self.closest('.product-custom').attr('data-id', fieldValue);
});

$(document).on('blur', '.product-custom-price-js', function () {
    let self = $(this),
        fieldValue = self.val();
    self.closest('.product-custom').attr('data-price', fieldValue);
});

$(document).on('keyup blur', '.product-custom-price-js', function () {
    let self = $(this),
        fieldValue = self.val();
    if(fieldValue<0){
        self.val(0);
    }
});

$(document).on('keyup focus blur', '.form-group .form-control', function (e) {
    e.preventDefault();
    let self = $(this),
        fieldValue = self.val();
    if(fieldValue!==''){
        self.closest('.form-group').find('.warning-message').remove();
    }
});

$('.products-wrapper .product-single').each(function (i, element) {
    if($(element).find('.item-quantity').val()>0){
        addItemToCart($(element).find('.item-quantity'), $('.cart-item-list'));
        calculateTotal();
        calculateGrandTotal();
        $(element).addClass('active');
    }
});



//=== FUNCTIONS DEFINITION
function quantityIncreaseDecrease(self, action){
    let qunatitySelector = self.closest('.product-quantity').find('.item-quantity'),
        quantitySelectorValue = parseInt(qunatitySelector.val());

    if(!quantitySelectorValue){
        quantitySelectorValue = 0;
    }
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
        ticketQuantity = parseFloat(self.closest('.product-single').find('.item-quantity').val()),
        pricePerItem = parseFloat(self.closest('.product-single').data('price')),
        priceTotal = ticketQuantity * pricePerItem,
        dataId = self.closest('.product-single').data('id'),
        cartItemClone = $('.cart-item-to-clone .cart-item').clone();

    cartItemClone.attr('data-id',dataId);
    cartItemClone.attr('data-price', pricePerItem);
    cartItemClone.attr('data-quantity', ticketQuantity);
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

function addCustomItemToCart(self, dataId, itemName, itemQuantity, itemPrice, itemTotalPrice) {
    let cartItemClone = $('.cart-item-to-clone .cart-item').clone();
    cartItemClone.attr('data-id',dataId);
    cartItemClone.attr('data-price', itemPrice);
    cartItemClone.attr('data-quantity', itemQuantity);
    cartItemClone.addClass(dataId);
    cartItemClone.find('.item-title').html(itemName);
    cartItemClone.find('.item-quantity').val(itemQuantity);
    cartItemClone.find('.item-price').html(itemTotalPrice);
    if(!itemQuantity){
        cartItemClone.find('.product-quantity').empty();
        cartItemClone.find('.price-holder .price').css('padding-left',0);
        cartItemClone.attr('data-quantity', 1);
    }

    //=== ADD/UPDATE ITEM INTO CART
    if($('.cart-item-list .cart-item').hasClass(dataId)) {
        updateCartItem(dataId, itemQuantity, itemTotalPrice);
    }else{
        $('.empty-cart-notice-wrapper').removeClass('active');
        itemHolder.append(cartItemClone);
    }
    focusingCartItem(dataId, itemHolder);
    emptyCustomItemFields(self.closest('.product-custom'));
}

function emptyCustomItemFields(parent){
    parent.find('.form-control').val('');
}

function focusingCartItem(dataId, itemHolder){
    itemHolder.find('.cart-item.'+dataId).addClass('focused');
    setTimeout(function () {
        itemHolder.find('.cart-item.'+dataId).removeClass('focused');
    },400);
}

function updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity){
    $('.products-wrapper [data-id='+dataId+']').find('.item-quantity').val(ticketQuantity);
    $('.cart-item-list [data-id='+dataId+']').attr('data-quantity', ticketQuantity);
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
    $('.cart-item-list .cart-item.'+dataId).attr('data-quantity', ticketQuantity);
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
        total = total + parseFloat($(element).find('.item-price').text());
        cartItems = cartItems + parseInt($(element).attr('data-quantity'));
    });
    $('.subtotal-js').html(total);

    cartIsEmpty();
    $('.cart-counter').html(cartItems);
    $('.cart-counter').addClass('bounce');
    setTimeout(function () {
        $('.cart-counter').removeClass('bounce');
    },1000);
}

function calculateGrandTotal(){
    let discount = parseFloat($('.discount-js').text()),
        total = parseFloat($('.subtotal-js').text());
    total = total - discount;
    if(total<1){
        total = 0;
    }
    $('.grand-total-js').html(total);
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