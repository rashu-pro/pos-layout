/**
 * Created on 7/19/2022.
 */

const bodyOverlay = document.querySelector('.body-overlay-js');
const cartSidebar = document.querySelector('.sidebar-js');
const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const couponCodes = [
    { name: 'coupon', discount: '20', calculateMethod: 'percentage' },
    { name: 'discount', discount: '30', calculateMethod: 'percentage' },
    { name: 'voucher', discount: '50', calculateMethod: 'solid' }
];

let itemHolder = $('.cart-item-list');

//=== PRODUCTS LOAD ON DOCUMENT READY
let ticketCategorySelector = $('.ticket-category-js'),
    selectedOption = ticketCategorySelector.children(':selected'),
    itemCategory = selectedOption.attr('data-category');
$('.ticket-category-title-js').html(selectedOption.text());
loadProducts(itemCategory);
isProductSelected();

//=== ON SCROLL FUNCTION
$(window).on('scroll', function (e) {
    let self = $(this);
    if (self.scrollTop() > $('header.header').height()) {
        $('.sidebar-js').addClass('sidebar-top');
    } else {
        $('.sidebar-js').removeClass('sidebar-top');
    }

});

//=== ON TICKET CATEGORY CHANGE
$(document).on('change', '.ticket-category-js', function () {
    let self = $(this),
        selectedOption = self.children(':selected'),
        itemCategory = selectedOption.data('category');
    $('.ticket-category-title-js').html(selectedOption.text());
    loadProducts(itemCategory);
    isProductSelected();
});

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
    if (self.closest('.product-quantity').find('.item-quantity').val() < 1) {
        self.closest('.product-single').removeClass('active');
    }
    calculateTotal();
    calculateGrandTotal();
});

$(document).on('click', '.product-custom .btn-plus-js', function (e) {
    e.preventDefault();
    let self = $(this);
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

//=== CUSTOM PRODUCT ADD CLICK ACTION
$(document).on('click', '.btn-custom-product-add-js', function (e) {
    e.preventDefault();
    let self = $(this),
        parent = self.closest('.product-custom'),
        dataId = 'data-id-' + Math.floor(Math.random() * 90000) + 10000,
        itemName = parent.data('name'),
        itemPrice = parseFloat(parent.find('.product-custom-price-js').val()),
        itemQuantity = parseFloat(parent.find('.item-quantity').val()),
        itemTotalPrice = itemQuantity * itemPrice,
        totalField = 0,
        validField = 0;

    self.closest('.product-custom').find('.form-control').each(function (i, element) {
        if ($(element).val() !== '') {
            $(element).removeClass('invalid');
        } else {
            $(element).addClass('invalid');
        }
    });

    if (parent.find('.item-quantity').val() < 1) {
        parent.find('.item-quantity').addClass('invalid');
    }
    parent.find('.form-control.invalid').first().focus();
    parent.find('.warning-message').remove();
    parent.find('.form-control.invalid').first().after('<p class="warning-message text-danger">This field is required!</p>');

    if (parent.find('.form-control.invalid').length > 0) {
        return;
    }

    $('.loader-div').addClass('active');
    itemName = self.closest('.product-custom').find('.product-custom-name-js').val();

    addCustomItemToCart(self, dataId, null, itemName, null, itemQuantity, itemPrice, itemTotalPrice);
   // addCustomItemToCart(self, dataId, false, itemName, false, itemQuantity, itemPrice, itemTotalPrice);


    calculateTotal();
    calculateGrandTotal();
    $('.loader-div').removeClass('active');
});

//=== DONATION BUTTON CLICK ACTION
$(document).on('click', '.btn-donate-js', function (e) {
    e.preventDefault();
    let self = $(this),
        parent = self.closest('.product-custom'),
        dataId = 'data-id-donation',
        itemName = parent.data('name'),
        itemQuantity = false,
        itemPrice = false,
        itemTotalPrice = parent.find('.donation-amount-js').val();
    if (itemTotalPrice < 1) {
        parent.find('.form-control').first().focus();
        parent.find('.form-control').first().closest('.form-group').find('.warning-message').remove();
        parent.find('.form-control').first().after('<p class="warning-message text-danger">This field is required!</p>');
        return;
    }
    $('.loader-div').addClass('active');
    // addCustomItemToCart(self, dataId, false, itemName, itemQuantity, itemPrice, itemTotalPrice);
    // calculateTotal();
    $('.donation-tr').show();
    $('.donation-tr .item-name').html(itemName);
    $('.donation-tr .amount').html(itemTotalPrice);
    $('.donation-amount-name-js').val(itemTotalPrice);
    calculateGrandTotal();
    $('.loader-div').removeClass('active');
});

//=== DONATION REMOVE BUTTON CLICK ACTION
$(document).on('click', '.donation-remove-js', function (e) {
    let self = $(this);
    self.closest('.donation-tr').find('.amount').html(0);
    self.closest('.donation-tr').hide();
    $('.donation-amount-js').val(0);
    $('.donation-amount-name-js').val(0);
    calculateGrandTotal();
});

//=== IS EMAIL
$(document).on('change', '#is-email', function () {
    let self = $(this);
    if (self.is(':checked')) {
        isEmail(true);
    } else {
        isEmail(false);
    }
});

//=== ON EMAIL FIELD TYPE
$(document).on('keyup', '.email-address-field', function () {
    let self = $(this),
        parent = self.parent();
    if(!emailValidationRegex.test(self.val())){
        self.removeClass('valid');
        parent.find('.warning-message').remove();
        // parent.append('<p class="warning-message text-danger">Invalid email address!</p>');
        return;
    }
    parent.find('.warning-message').remove();
    self.removeClass('invalid');
    self.addClass('valid');
    $('.email-address-name-js').val(self.val());
});

function isEmail(status) {
    if (!status) {
        $('.email-address-name-js').val('');
        $('.form-group-email').find('.warning-message').remove();
        $('.form-group-email').hide();
        return;
    }
    $('.form-group-email').show();
    $('.email-address-field').focus();
}

//=== CHECKOUT BUTTON CLICK
$(document).on('click', '.btn-checkout-js', function (e) {
    e.preventDefault();

    //=== WHEN CART IS EMPTY
    if ($('.cart-item-list .cart-item').length < 1) {
        $('.empty-cart-notice').addClass('focused');
        setTimeout(function () {
            $('.empty-cart-notice').removeClass('focused');
        }, 200);
        return;
    }

    //=== WHEN EMAIL FIELD IS INVALID
    if($('#is-email').is(':checked') && !$('.email-address-field').hasClass('valid')){
        $('.email-address-field').focus();
        $('.email-address-field').parent().find('.warning-message').eq(0).remove();
        $('.email-address-field').parent().append('<p class="warning-message text-danger">Invalid email address!</p>');
        return;
    }


    $('#popup-swipe-card').show();
});

//=== POPUP ACTIONS
$(document).on('click', '.btn-close-popup-js', function (e) {
    e.preventDefault();
    $(this).closest('.popup-modal-js').hide();
    $('.loader-div').removeClass('active');
});

//=== ACTIONS AFTER CARD SWIPED
//$(document).on('click', '.swipe-image-wrapper', function (e) {
//    let self = $(this);
//    self.closest('.popup-modal-js').hide();
//    $('.loader-div').find('.loader-notice').remove();
//    $('.loader-div').append('<p class="loader-notice">Transaction is being processed...</p>');
//    $('.loader-div').addClass('active');
//});


//=== WHEN THE CARD IS VALID
//$(document).on('click', '.lds-spinner', function (e) {
//    $('.loader-div').find('.loader-notice').remove();
//    $('.loader-div').append('<p class="loader-notice text-success">Transaction has successfuly been completed.</p>');
//    setTimeout(function () {
//        $('.loader-div').removeClass('active');
//        location.reload(true);
//    },1000);
//});

//$(document).on('click', '.loader-notice', function (e) {
//    //HAVE TO ADD ALL ERRORS 
//    $('.loader-div').removeClass('active');
//    $('#popup-cc-error').show();
//});

//=== REGULAR PRODUCT ITEM QUANTITY CHANGE ACTION
$(document).on('keyup focus blur', '.product-single .item-quantity', function (e) {
    let self = $(this);
    if (!parseFloat(self.val()) > 0) {
        self.val(0);
        self.closest('.product-single').removeClass('active')
    }else{
        self.closest('.product-single').addClass('active')
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
    if (!parseFloat(self.val()) > 0) {
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
    if (fieldValue < 0) {
        self.val(0);
    }
});

$(document).on('keyup focus blur', '.form-group .form-control', function (e) {
    e.preventDefault();
    let self = $(this),
        fieldValue = self.val();
    if (fieldValue !== '') {
        self.closest('.form-group').find('.warning-message').remove();
    }
});

//=== ADDIN ITEM TO THE CART IF ANY ITEMS SELECTED ON DOCUMENT READY
$('.products-wrapper .product-single').each(function (i, element) {
    if ($(element).find('.item-quantity').val() > 0) {
        addItemToCart($(element).find('.item-quantity'), $('.cart-item-list'));
        calculateTotal();
        calculateGrandTotal();
        $(element).addClass('active');
    }
});

$(document).on('keyup', '.voucher-field-js', function (e) {
    let self = $(this),
        voucherField = self,
        subtotal = parseFloat($('.subtotal-js').text()),
        discountAmount = 0,
        discountSign = '';

    if (self.val() !== '') {
        self.closest('.voucher-block').find('.warning-message').remove();
    }

    if(voucherField.data('type')==='solid'){
        if(voucherField.val()==''){
            errorLoad(self, 'Invalid discount!');
        }

        if(voucherField.val()<1){
            errorLoad(self, 'Invalid discount!');
        }

        if(parseFloat(voucherField.val())>=subtotal){
            errorLoad(self, 'Invalid discount!');
            e.preventDefault();
            voucherField.val(0);
            discountAmount = 0;
            $('.discount-js').html(discountAmount);
            $('.discount-amount-name-js').val(discountAmount);
            calculateGrandTotal();
            return false;
        }
        discountAmount = parseFloat(voucherField.val())? parseFloat(voucherField.val()): 0;
    }else{
        let object = couponCodes.find(obj=>obj.name===voucherField.val());
        if(!object){
            errorLoad(self, 'Wrong coupon code!');
            return;
        }
        discountAmount = object.discount;
        if(object.calculateMethod==='percentage'){
            discountSign = '%';
            discountAmount = (parseFloat(object.discount)*subtotal)/100;
        }
        $('.discount-code-name-js').val(object.discount);
        $('.discount-note-js').html('<span class="currency">$</span><span>'+object.discount+'</span><span>'+discountSign+'</span>');
    }

    $('.discount-js').html(discountAmount);
    $('.discount-amount-name-js').val(discountAmount);
    calculateGrandTotal();
});

$(document).on('blur', '.voucher-field-js', function (e) {
    let self = $(this);
    if(self.val()==''){
        self.closest('.voucher-block').find('.warning-message').remove();
    }
});


//=== FUNCTIONS DEFINITION
function loadProducts(itemCategory) {
    $('.loader-div').addClass('active');
    let clonedSingleProduct = $('.single-product-to-clone .product-single-box').clone();
    itemListByCategory = itemList.filter(element => element.productCategory === itemCategory);
    $('.products-regular-wrapper-row-js').empty();
    for (let i = 0; i < itemListByCategory.length; i++) {
        let dataId = 'item-group-' + itemCategory + '-' + (i + 1),
            productCategoryKey = itemListByCategory[i].productCategory,
            productKey = itemListByCategory[i].key,
            productName = itemListByCategory[i].name,
            productPrice = itemListByCategory[i].price;
        clonedSingleProduct.find('.product-single').attr('data-category-key', productCategoryKey);
        clonedSingleProduct.find('.product-single').attr('data-name', productName);
        clonedSingleProduct.find('.product-single').attr('data-price', productPrice);
        clonedSingleProduct.find('.product-single').attr('data-id', dataId);
        clonedSingleProduct.find('.product-single').attr('data-key', productKey);
        clonedSingleProduct.find('.product-title').html(productName);
        clonedSingleProduct.find('.price-amount').html(productPrice);
        $('.products-regular-wrapper-row-js').append(clonedSingleProduct.clone());
    }
    $('.loader-div').removeClass('active');
}

function isProductSelected() {
    let addedItem = [];
    $('.cart-item-list .cart-item').each(function (i, element) {
        let dataId = $(element).data('id'),
            quantity = $(element).find('.item-quantity').val();
        addedItem.push({ dataId: dataId, quantity: quantity });
    });

    for (let i = 0; i < addedItem.length; i++) {
        $('.products-regular-wrapper-row-js .product-single-box .product-single[data-id=' + addedItem[i].dataId + ']').addClass('active');
        $('.products-regular-wrapper-row-js .product-single-box .product-single[data-id=' + addedItem[i].dataId + ']').find('.item-quantity').val(addedItem[i].quantity);
    }
}

function quantityIncreaseDecrease(self, action) {
    let qunatitySelector = self.closest('.product-quantity').find('.item-quantity'),
        quantitySelectorValue = parseInt(qunatitySelector.val());

    if (!quantitySelectorValue) {
        quantitySelectorValue = 0;
    }
    if (action === 'increase') {
        qunatitySelector.val(quantitySelectorValue + 1);
    }

    if (action === 'decrease') {
        if (quantitySelectorValue > 0) {
            qunatitySelector.val(quantitySelectorValue - 1);
        }
    }
}

function addItemToCart(self, itemHolder) {
    let itemName = self.closest('.product-single').data('name'),
        itemCategoryKey = self.closest('.product-single').data('category-key'),
        itemQuantity = parseFloat(self.closest('.product-single').find('.item-quantity').val()),
        pricePerItem = parseFloat(self.closest('.product-single').data('price')),
        priceTotal = itemQuantity * pricePerItem,
        dataId = self.closest('.product-single').data('id'),
        dataKey = self.closest('.product-single').data('key'),
        cartItemClone = $('.cart-item-to-clone .cart-item').clone();

    cartItemClone.attr('data-id', dataId);
    cartItemClone.attr('data-price', pricePerItem);
    cartItemClone.attr('data-quantity', itemQuantity);
    cartItemClone.addClass(dataId);
    cartItemClone.find('.item-title').html(itemName);
    cartItemClone.find('.item-quantity').val(itemQuantity);
    cartItemClone.find('.item-price').html(priceTotal);

    cartItemClone.find('.product-category-key').val(itemCategoryKey);
    cartItemClone.find('.product-key').val(dataKey);
    cartItemClone.find('.product-name').val(itemName);
    cartItemClone.find('.product-quantity').val(itemQuantity);
    cartItemClone.find('.product-unit-price').val(pricePerItem);
    cartItemClone.find('.product-price').val(priceTotal);

    //=== ADD/UPDATE ITEM INTO CART
    if ($('.cart-item-list .cart-item').hasClass(dataId)) {
        updateCartItem(dataId, itemQuantity, priceTotal);
    } else {
        $('.empty-cart-notice-wrapper').removeClass('active');
        itemHolder.append(cartItemClone);
    }
    focusingCartItem(dataId, itemHolder);

    //=== WHEN QUANTITY IS ZERO
    if (itemQuantity < 1) {
        itemHolder.find('.cart-item.' + dataId).remove();
    }

}

function addCustomItemToCart(self, dataId, dataKey, itemName, itemCategoryKey, itemQuantity, itemPrice, itemTotalPrice) {
    let cartItemClone = $('.cart-item-to-clone .cart-item').clone();
    cartItemClone.attr('data-id', dataId);
    cartItemClone.attr('data-price', itemPrice);
    cartItemClone.attr('data-quantity', itemQuantity);
    cartItemClone.addClass(dataId);
    cartItemClone.find('.item-title').html(itemName);
    cartItemClone.find('.item-quantity').val(itemQuantity);
    cartItemClone.find('.item-price').html(itemTotalPrice);
    if (!itemQuantity) {
        cartItemClone.find('.product-quantity').empty();
        cartItemClone.find('.price-holder .price').css('padding-left', 0);
        cartItemClone.attr('data-quantity', 1);
    }

    cartItemClone.find('.product-category-key').val(itemCategoryKey);
    cartItemClone.find('.product-key').val(dataKey);
    cartItemClone.find('.product-name').val(itemName);
    cartItemClone.find('.product-quantity').val(itemQuantity);
    cartItemClone.find('.product-unit-price').val(itemPrice);
    cartItemClone.find('.product-price').val(itemTotalPrice);

    //=== ADD/UPDATE ITEM INTO CART
    if ($('.cart-item-list .cart-item').hasClass(dataId)) {
        updateCartItem(dataId, itemQuantity, itemTotalPrice);
    } else {
        $('.empty-cart-notice-wrapper').removeClass('active');
        itemHolder.append(cartItemClone);
    }
    focusingCartItem(dataId, itemHolder);
    emptyCustomItemFields(self.closest('.product-custom'));
}

function emptyCustomItemFields(parent) {
    parent.find('.form-control').val('');
}

function focusingCartItem(dataId, itemHolder) {
    itemHolder.find('.cart-item.' + dataId).addClass('focused');
    setTimeout(function () {
        itemHolder.find('.cart-item.' + dataId).removeClass('focused');
    }, 400);
}

function updateProductQuantityOnCartItemChange(self, dataId, ticketQuantity) {
    $('.products-wrapper [data-id=' + dataId + ']').find('.item-quantity').val(ticketQuantity);
    $('.cart-item-list [data-id=' + dataId + ']').attr('data-quantity', ticketQuantity);
    if (!ticketQuantity < 1) return;
    self.closest('.cart-item').remove();
    $('.products-wrapper [data-id=' + dataId + ']').removeClass('active');
}

function cartIsEmpty() {
    //=== WHEN CART IS EMPTY
    if (!$('.cart-item-list .cart-item').length > 0) {
        $('.empty-cart-notice-wrapper').addClass('active');
    }
}

function updateCartItem(dataId, ticketQuantity, priceTotal) {
    let cartItemToUpdate = $('.cart-item-list .cart-item.' + dataId);
    cartItemToUpdate.find('.item-quantity').val(ticketQuantity);
    cartItemToUpdate.attr('data-quantity', ticketQuantity);
    cartItemToUpdate.find('.item-price').html(priceTotal);

    cartItemToUpdate.find('.product-quantity').val(ticketQuantity);
    cartItemToUpdate.find('.product-price').val(priceTotal);
}

function removeCartItem(self, dataId) {
    self.closest('.cart-item').remove();
    $('.products-wrapper [data-id=' + dataId + ']').find('.item-quantity').val('0');
    $('.products-wrapper [data-id=' + dataId + ']').removeClass('active');
}

function errorLoad(self, message) {
    self.closest('.voucher-block').find('.warning-message').remove();
    self.closest('.voucher-block').prepend('<p class="text-danger warning-message">' + message + '</p>');
    // self.closest('.voucher-block').find('.warning-message').remove();
}

function calculateTotal() {
    let total = 0,
        cartItems = 0;
    $('.cart-item-list .cart-item').each(function (i, element) {
        total = total + parseFloat($(element).find('.item-price').text());
        cartItems = cartItems + parseInt($(element).attr('data-quantity'));
    });
    $('.subtotal-js').html(total);

    cartIsEmpty();
    $('.cart-counter').html(cartItems);
    $('.cart-counter-js').html(cartItems);
    $('.cart-counter').addClass('bounce');
    setTimeout(function () {
        $('.cart-counter').removeClass('bounce');
    }, 1000);
}

function calculateGrandTotal() {
    let discount = parseFloat($('.discount-js').text()),
        total = parseFloat($('.subtotal-js').text()),
        donationAmount = parseFloat($('.donation-js').text());
    total = (total - discount) + donationAmount;
    if (total < 1) {
        total = 0;
    }
    $('.grand-total-js').html(total);
    //have to assign value of TotalAmount Field
    $('#txtAmount').val(total);
}

function cartToggle(isToggle) {
    if (isToggle) {
        bodyOverlay.style.display = 'block';
        cartSidebar.classList.add('opened');
    } else {
        bodyOverlay.style.display = 'none';
        cartSidebar.classList.remove('opened');
    }

}