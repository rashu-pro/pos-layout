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
    if(self.scrollTop()>$('header.header').height()){
        $('.sidebar-js').addClass('sidebar-top');
    }else{
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
    if($('#is-email').is(':checked') && !emailValidationRegex.test($('.email-address-field').val())){
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

// $(document).on('keyup', '.voucher-field-js', function (e) {
//     let self = $(this),
//         voucherField = self,
//         subtotal = parseFloat($('.subtotal-js').text()),
//         discountAmount = 0,
//         discountSign = '';
//
//     if (self.val() !== '') {
//         self.closest('.voucher-block').find('.warning-message').remove();
//     }
//
//     if(voucherField.data('type')==='solid'){
//         if(voucherField.val()==''){
//             errorLoad(self, 'Invalid discount!');
//         }
//
//         if(voucherField.val()<1){
//             errorLoad(self, 'Invalid discount!');
//         }
//
//         if(parseFloat(voucherField.val())>subtotal){
//             errorLoad(self, 'Invalid discount!');
//             e.preventDefault();
//             discountAmount = 0;
//             $('.discount-js').html(discountAmount);
//             $('.discount-amount-name-js').val(discountAmount);
//             calculateGrandTotal();
//             return false;
//         }
//         discountAmount = parseFloat(voucherField.val())? parseFloat(voucherField.val()): 0;
//     }else{
//         let object = couponCodes.find(obj=>obj.name===voucherField.val());
//         if(!object){
//             errorLoad(self, 'Wrong coupon code!');
//             return;
//         }
//         discountAmount = object.discount;
//         if(object.calculateMethod==='percentage'){
//             discountSign = '%';
//             discountAmount = (parseFloat(object.discount)*subtotal)/100;
//         }
//         $('.discount-code-name-js').val(object.discount);
//         $('.discount-note-js').html('<span class="currency">$</span><span>'+object.discount+'</span><span>'+discountSign+'</span>');
//     }
//
//     $('.discount-js').html(discountAmount);
//     $('.discount-amount-name-js').val(discountAmount);
//     calculateGrandTotal();
// });
//
//
//
// $(document).on('blur', '.voucher-field-js', function (e) {
//     let self = $(this);
//     if(self.val()==''){
//         self.closest('.voucher-block').find('.warning-message').remove();
//     }
// });

//=== COUPON APPLY BUTTON CLICK
$(document).on('click', '.btn-apply-voucher-js', function (e) {
    e.preventDefault();
    let self = $(this),
        voucherField = $('.voucher-field-js'),
        subtotal = parseFloat($('.subtotal-js').text()),
        discountAmount = 0,
        discountSign = '';

    if (subtotal < 1) {
        errorLoad(self, 'Add an item first!');
        return;
    }

    if (voucherField.val() === '') {
        voucherField.focus();
        return;
    }

    if (voucherField.data('type') === 'solid') {
        if (voucherField.val() < 1) {
            errorLoad(self, 'Invalid discount!');
            voucherField.val(0);
            discountAmount = parseFloat(voucherField.val());
            $('.discount-js').html(discountAmount);
            $('.discount-amount-name-js').val(discountAmount);
            calculateGrandTotal();
            return;
        }

        if (parseFloat(voucherField.val()) > subtotal) {
            errorLoad(self, 'Invalid discount!');
            voucherField.val(0);
            discountAmount = parseFloat(voucherField.val());
            $('.discount-js').html(discountAmount);
            $('.discount-amount-name-js').val(discountAmount);
            calculateGrandTotal();
            return;
        }
        discountAmount = parseFloat(voucherField.val());
    } else {
        let object = couponCodes.find(obj => obj.name === voucherField.val());
        if (!object) {
            errorLoad(self, 'Wrong coupon code!');
            return;
        }
        discountAmount = object.discount;
        if (object.calculateMethod === 'percentage') {
            discountSign = '%';
            discountAmount = (parseFloat(object.discount) * subtotal) / 100;
        }
        $('.discount-code-name-js').val(object.discount);
        $('.discount-note-js').html('<span class="currency">$</span><span>' + object.discount + '</span><span>' + discountSign + '</span>');
    }

    $('.discount-js').html(discountAmount);
    $('.discount-amount-name-js').val(discountAmount);
    calculateGrandTotal();
});


//======== KEYBOARD PLUGIN CALL
$(document).on('focus', '.vr-keyboard', function () {
    let self = $(this);
    self.keyboard({
        // *** choose layout ***
        layout       : 'custom',
        customLayout : { 'normal': ['1 2 3 4 5 6 7 8 9 0',
            'q w e r t y u i o p',
            'a s d f g h j k l',
            'z x c v b n m {b} {clear:clear}',
            '{c} @ {space} . @gmail .com {a}'
        ] },

        // allow jQuery position utility to reposition the keyboard on window resize
        reposition : true,

        // preview added above keyboard if true, original input/textarea used if false
        // always disabled for contenteditable elements
        usePreview : true,

        // if true, the keyboard will always be visible
        alwaysOpen : false,

        // give the preview initial focus when the keyboard becomes visible
        initialFocus : true,
        // Avoid focusing the input the keyboard is attached to
        noFocus : false,

        // if true, keyboard will remain open even if the input loses focus.
        stayOpen : false,

        // Prevents the keyboard from closing when the user clicks or
        // presses outside the keyboard. The `autoAccept` option must
        // also be set to true when this option is true or changes are lost
        userClosed : false,

        // if true, keyboard will not close if you press escape.
        ignoreEsc : false,

        // if true, keyboard will only closed on click event instead of mousedown or
        // touchstart. The user can scroll the page without closing the keyboard.
        closeByClickEvent : false,

        // *** change keyboard language & look ***
        display : {
            // \u2714 = check mark - same action as accept
            'a'      : '\u2714:Accept (Shift-Enter)',
            'accept' : 'Accept:Accept (Shift-Enter)',
            'alt'    : 'AltGr:Alternate Graphemes',
            // \u232b = outlined left arrow with x inside
            'b'      : '\u232b:Backspace',
            'bksp'   : 'Bksp:Backspace',
            // \u2716 = big X, close - same action as cancel
            'c'      : '\u2716:Cancel (Esc)',
            'cancel' : 'Cancel:Cancel (Esc)',
            // clear num pad
            'clear'  : 'C:Clear',
            'combo'  : '\u00f6:Toggle Combo Keys',
            // decimal point for num pad (optional);
            // change '.' to ',' for European format
            'dec'    : '.:Decimal',
            // down, then left arrow - enter symbol
            'e'      : '\u21b5:Enter',
            'empty'  : '\u00a0', // &nbsp;
            'enter'  : 'Enter:Enter',
            // \u2190 = left arrow (move caret)
            'left'   : '\u2190',
            // caps lock
            'lock'   : '\u21ea Lock:Caps Lock',
            'next'   : 'Next',
            'prev'   : 'Prev',
            // \u2192 = right arrow (move caret)
            'right'  : '\u2192',
            // \u21e7 = thick hollow up arrow
            's'      : '\u21e7:Shift',
            'shift'  : 'Shift:Shift',
            // \u00b1 = +/- sign for num pad
            'sign'   : '\u00b1:Change Sign',
            'space'  : '&nbsp;:Space',

            // \u21e5 = right arrow to bar; used since this virtual
            // keyboard works with one directional tabs
            't'      : '\u21e5:Tab',
            // \u21b9 is the true tab symbol (left & right arrows)
            'tab'    : '\u21e5 Tab:Tab',
            // replaced by an image
            'toggle' : ' ',

            // added to titles of keys
            // accept key status when acceptValid:true
            'valid': 'valid',
            'invalid': 'invalid',
            // combo key states
            'active': 'active',
            'disabled': 'disabled'
        },

        // Message added to the key title while hovering, if the mousewheel plugin exists
        wheelMessage : 'Use mousewheel to see other keys',

        css : {
            // input & preview
            input          : 'ui-widget-content ui-corner-all',
            // keyboard container
            container      : 'ui-widget-content ui-widget ui-corner-all ui-helper-clearfix',
            // keyboard container extra class (same as container, but separate)
            popup: '',
            // default state
            buttonDefault  : 'ui-state-default ui-corner-all',
            // hovered button
            buttonHover    : 'ui-state-hover',
            // Action keys (e.g. Accept, Cancel, Tab, etc); this replaces the "actionClass" option
            buttonAction   : 'ui-state-active',
            // Active keys (e.g. shift down, meta keyset active, combo keys active)
            buttonActive   : 'ui-state-active',
            // used when disabling the decimal button {dec}
            buttonDisabled : 'ui-state-disabled',
            // empty button class name {empty}
            buttonEmpty    : 'ui-keyboard-empty'
        },

        // *** Useability ***
        // Auto-accept content when clicking outside the keyboard (popup will close)
        autoAccept : true,
        // Auto-accept content even if the user presses escape
        // (only works if `autoAccept` is `true`)
        autoAcceptOnEsc : false,

        // Prevents direct input in the preview window when true
        lockInput : false,

        // Prevent keys not in the displayed keyboard from being typed in
        restrictInput : false,
        // Additional allowed characters while restrictInput is true
        restrictInclude : '', // e.g. 'a b foo \ud83d\ude38'

        // Check input against validate function, if valid the accept button
        // is clickable; if invalid, the accept button is disabled.
        acceptValid : true,
        // Auto-accept when input is valid; requires `acceptValid`
        // set `true` & validate callback
        autoAcceptOnValid : false,

        // if acceptValid is true & the validate function returns a false, this option
        // will cancel a keyboard close only after the accept button is pressed
        cancelClose : true,

        // Use tab to navigate between input fields
        tabNavigation : false,

        // press enter (shift-enter in textarea) to go to the next input field
        enterNavigation : true,
        // mod key options: 'ctrlKey', 'shiftKey', 'altKey', 'metaKey' (MAC only)
        // alt-enter to go to previous; shift-alt-enter to accept & go to previous
        enterMod : 'altKey',

        // if true, the next button will stop on the last keyboard input/textarea;
        // prev button stops at first
        // if false, the next button will wrap to target the first input/textarea;
        // prev will go to the last
        stopAtEnd : true,

        // Set this to append the keyboard immediately after the input/textarea it
        // is attached to. This option works best when the input container doesn't
        // have a set width and when the "tabNavigation" option is true
        appendLocally : false,

        // Append the keyboard to a desired element. This can be a jQuery selector
        // string or object
        appendTo : 'body',

        // If false, the shift key will remain active until the next key is (mouse)
        // clicked on; if true it will stay active until pressed again
        stickyShift : true,

        // caret placed at the end of any text when keyboard becomes visible
        caretToEnd : false,

        // Prevent pasting content into the area
        preventPaste : false,

        // caret stays this many pixels from the edge of the input
        // while scrolling left/right; use "c" or "center" to center
        // the caret while scrolling
        scrollAdjustment : 10,

        // Set the max number of characters allowed in the input, setting it to
        // false disables this option
        maxLength : false,

        // allow inserting characters @ caret when maxLength is set
        maxInsert : true,

        // Mouse repeat delay - when clicking/touching a virtual keyboard key, after
        // this delay the key will start repeating
        repeatDelay : 500,

        // Mouse repeat rate - after the repeatDelay, this is the rate (characters
        // per second) at which the key is repeated. Added to simulate holding down
        // a real keyboard key and having it repeat. I haven't calculated the upper
        // limit of this rate, but it is limited to how fast the javascript can
        // process the keys. And for me, in Firefox, it's around 20.
        repeatRate : 20,

        // resets the keyboard to the default keyset when visible
        resetDefault : false,

        // Event (namespaced) on the input to reveal the keyboard. To disable it,
        // just set it to an empty string ''.
        openOn : 'focus',

        // When the character is added to the input
        keyBinding : 'mousedown touchstart',

        // enable/disable mousewheel functionality
        // enabling still depends on the mousewheel plugin
        useWheel : true,

        // combos (emulate dead keys)
        // http://en.wikipedia.org/wiki/Keyboard_layout#US-International
        // if user inputs `a the script converts it to à, ^o becomes ô, etc.
        useCombos : true,

        // *** Methods ***
        // Callbacks - add code inside any of these callback functions as desired
        initialized   : function(e, keyboard, el) {},
        beforeVisible : function(e, keyboard, el) {
            $('body').addClass('vk-attached');
        },
        visible       : function(e, keyboard, el) {},
        beforeInsert  : function(e, keyboard, el, textToAdd) { return textToAdd; },
        change        : function(e, keyboard, el) {},
        beforeClose   : function(e, keyboard, el, accepted) {},
        accepted      : function(e, keyboard, el) {},
        canceled      : function(e, keyboard, el) {},
        restricted    : function(e, keyboard, el) {},
        hidden        : function(e, keyboard, el) {
            $('body').removeClass('vk-attached');
        },

        // called instead of base.switchInput
        switchInput : function(keyboard, goToNext, isAccepted) {},

        // used if you want to create a custom layout or modify the built-in keyboard
        // create : function(keyboard) { return keyboard.buildKeyboard(); },

        // build key callback (individual keys)
        buildKey : function( keyboard, data ) {
            return data;
        },

        // this callback is called just before the "beforeClose" to check the value
        // if the value is valid, return true and the keyboard will continue as it
        // should (close if not always open, etc)
        // if the value is not value, return false and the clear the keyboard value
        // ( like this "keyboard.$preview.val('');" ), if desired
        // The validate function is called after each input, the "isClosing" value
        // will be false; when the accept button is clicked, "isClosing" is true
        validate : function(keyboard, value, isClosing) {
            return true;
        }

    });

});

$(document).on('focus', '.vr-keyboard-num', function () {
    let self = $(this);
    self.keyboard({
        // *** choose layout ***
        layout       : 'custom',
        customLayout : { 'normal'  : ['7 8 9 {b}', '4 5 6 {clear}', '0 1 2 3', '{c} {a}']},

        // allow jQuery position utility to reposition the keyboard on window resize
        reposition : true,

        // preview added above keyboard if true, original input/textarea used if false
        // always disabled for contenteditable elements
        usePreview : true,

        // if true, the keyboard will always be visible
        alwaysOpen : false,

        // give the preview initial focus when the keyboard becomes visible
        initialFocus : true,
        // Avoid focusing the input the keyboard is attached to
        noFocus : false,

        // if true, keyboard will remain open even if the input loses focus.
        stayOpen : false,

        // Prevents the keyboard from closing when the user clicks or
        // presses outside the keyboard. The `autoAccept` option must
        // also be set to true when this option is true or changes are lost
        userClosed : false,

        // if true, keyboard will not close if you press escape.
        ignoreEsc : false,

        // if true, keyboard will only closed on click event instead of mousedown or
        // touchstart. The user can scroll the page without closing the keyboard.
        closeByClickEvent : false,

        // *** change keyboard language & look ***
        display : {
            // \u2714 = check mark - same action as accept
            'a'      : '\u2714:Accept (Shift-Enter)',
            'accept' : 'Accept:Accept (Shift-Enter)',
            'alt'    : 'AltGr:Alternate Graphemes',
            // \u232b = outlined left arrow with x inside
            'b'      : '\u232b:Backspace',
            'bksp'   : 'Bksp:Backspace',
            // \u2716 = big X, close - same action as cancel
            'c'      : '\u2716:Cancel (Esc)',
            'cancel' : 'Cancel:Cancel (Esc)',
            // clear num pad
            'clear'  : 'C:Clear',
            'combo'  : '\u00f6:Toggle Combo Keys',
            // decimal point for num pad (optional);
            // change '.' to ',' for European format
            'dec'    : '.:Decimal',
            // down, then left arrow - enter symbol
            'e'      : '\u21b5:Enter',
            'empty'  : '\u00a0', // &nbsp;
            'enter'  : 'Enter:Enter',
            // \u2190 = left arrow (move caret)
            'left'   : '\u2190',
            // caps lock
            'lock'   : '\u21ea Lock:Caps Lock',
            'next'   : 'Next',
            'prev'   : 'Prev',
            // \u2192 = right arrow (move caret)
            'right'  : '\u2192',
            // \u21e7 = thick hollow up arrow
            's'      : '\u21e7:Shift',
            'shift'  : 'Shift:Shift',
            // \u00b1 = +/- sign for num pad
            'sign'   : '\u00b1:Change Sign',
            'space'  : '&nbsp;:Space',

            // \u21e5 = right arrow to bar; used since this virtual
            // keyboard works with one directional tabs
            't'      : '\u21e5:Tab',
            // \u21b9 is the true tab symbol (left & right arrows)
            'tab'    : '\u21e5 Tab:Tab',
            // replaced by an image
            'toggle' : ' ',

            // added to titles of keys
            // accept key status when acceptValid:true
            'valid': 'valid',
            'invalid': 'invalid',
            // combo key states
            'active': 'active',
            'disabled': 'disabled'
        },

        // Message added to the key title while hovering, if the mousewheel plugin exists
        wheelMessage : 'Use mousewheel to see other keys',

        css : {
            // input & preview
            input          : 'ui-widget-content ui-corner-all',
            // keyboard container
            container      : 'ui-widget-content ui-widget ui-corner-all ui-helper-clearfix',
            // keyboard container extra class (same as container, but separate)
            popup: '',
            // default state
            buttonDefault  : 'ui-state-default ui-corner-all',
            // hovered button
            buttonHover    : 'ui-state-hover',
            // Action keys (e.g. Accept, Cancel, Tab, etc); this replaces the "actionClass" option
            buttonAction   : 'ui-state-active',
            // Active keys (e.g. shift down, meta keyset active, combo keys active)
            buttonActive   : 'ui-state-active',
            // used when disabling the decimal button {dec}
            buttonDisabled : 'ui-state-disabled',
            // empty button class name {empty}
            buttonEmpty    : 'ui-keyboard-empty'
        },

        // *** Useability ***
        // Auto-accept content when clicking outside the keyboard (popup will close)
        autoAccept: true,
        // Auto-accept content even if the user presses escape
        // (only works if `autoAccept` is `true`)
        autoAcceptOnEsc : false,

        // Prevents direct input in the preview window when true
        lockInput : false,

        // Prevent keys not in the displayed keyboard from being typed in
        restrictInput : false,
        // Additional allowed characters while restrictInput is true
        restrictInclude : '', // e.g. 'a b foo \ud83d\ude38'

        // Check input against validate function, if valid the accept button
        // is clickable; if invalid, the accept button is disabled.
        acceptValid : true,
        // Auto-accept when input is valid; requires `acceptValid`
        // set `true` & validate callback
        autoAcceptOnValid : false,

        // if acceptValid is true & the validate function returns a false, this option
        // will cancel a keyboard close only after the accept button is pressed
        cancelClose : true,

        // Use tab to navigate between input fields
        tabNavigation : false,

        // press enter (shift-enter in textarea) to go to the next input field
        enterNavigation : true,
        // mod key options: 'ctrlKey', 'shiftKey', 'altKey', 'metaKey' (MAC only)
        // alt-enter to go to previous; shift-alt-enter to accept & go to previous
        enterMod : 'altKey',

        // if true, the next button will stop on the last keyboard input/textarea;
        // prev button stops at first
        // if false, the next button will wrap to target the first input/textarea;
        // prev will go to the last
        stopAtEnd : true,

        // Set this to append the keyboard immediately after the input/textarea it
        // is attached to. This option works best when the input container doesn't
        // have a set width and when the "tabNavigation" option is true
        appendLocally : false,

        // Append the keyboard to a desired element. This can be a jQuery selector
        // string or object
        appendTo : 'body',

        // If false, the shift key will remain active until the next key is (mouse)
        // clicked on; if true it will stay active until pressed again
        stickyShift : true,

        // caret placed at the end of any text when keyboard becomes visible
        caretToEnd : false,

        // Prevent pasting content into the area
        preventPaste : false,

        // caret stays this many pixels from the edge of the input
        // while scrolling left/right; use "c" or "center" to center
        // the caret while scrolling
        scrollAdjustment : 10,

        // Set the max number of characters allowed in the input, setting it to
        // false disables this option
        maxLength : 16,

        // allow inserting characters @ caret when maxLength is set
        maxInsert : true,

        // Mouse repeat delay - when clicking/touching a virtual keyboard key, after
        // this delay the key will start repeating
        repeatDelay : 500,

        // Mouse repeat rate - after the repeatDelay, this is the rate (characters
        // per second) at which the key is repeated. Added to simulate holding down
        // a real keyboard key and having it repeat. I haven't calculated the upper
        // limit of this rate, but it is limited to how fast the javascript can
        // process the keys. And for me, in Firefox, it's around 20.
        repeatRate : 20,

        // resets the keyboard to the default keyset when visible
        resetDefault : false,

        // Event (namespaced) on the input to reveal the keyboard. To disable it,
        // just set it to an empty string ''.
        openOn : 'focus',

        // When the character is added to the input
        keyBinding : 'mousedown touchstart',

        // enable/disable mousewheel functionality
        // enabling still depends on the mousewheel plugin
        useWheel : true,

        // combos (emulate dead keys)
        // http://en.wikipedia.org/wiki/Keyboard_layout#US-International
        // if user inputs `a the script converts it to à, ^o becomes ô, etc.
        useCombos : true,

        // *** Methods ***
        // Callbacks - add code inside any of these callback functions as desired
        initialized   : function(e, keyboard, el) {},
        beforeVisible : function(e, keyboard, el) {
            $('body').addClass('vk-attached');
        },
        visible       : function(e, keyboard, el) {},
        beforeInsert  : function(e, keyboard, el, textToAdd) { return textToAdd; },
        change        : function(e, keyboard, el) {},
        beforeClose: function (e, keyboard, el, accepted) {
            if ($('.donation-details').css('display') == 'block') {
                let otherAmount = $('#other-amount-btn').val();
                $('#txtAmount').val(otherAmount);
            }
            el.focus();
        },
        accepted: function (e, keyboard, el) {},
        canceled: function (e, keyboard, el) {

        },
        restricted    : function(e, keyboard, el) {},
        hidden        : function(e, keyboard, el) {
            $('body').removeClass('vk-attached');
            if ($('.donation-details').css('display') == 'block') {
                var otherAmount =  $('#other-amount-btn').val();
                $('#txtAmount').val(otherAmount);
            }
        },

        // called instead of base.switchInput
        switchInput : function(keyboard, goToNext, isAccepted) {},

        // used if you want to create a custom layout or modify the built-in keyboard
        // create : function(keyboard) { return keyboard.buildKeyboard(); },

        // build key callback (individual keys)
        buildKey : function( keyboard, data ) {
            return data;
        },

        // this callback is called just before the "beforeClose" to check the value
        // if the value is valid, return true and the keyboard will continue as it
        // should (close if not always open, etc)
        // if the value is not value, return false and the clear the keyboard value
        // ( like this "keyboard.$preview.val('');" ), if desired
        // The validate function is called after each input, the "isClosing" value
        // will be false; when the accept button is clicked, "isClosing" is true
        validate: function (keyboard, value, isClosing) {
            if ($('.donation-details').css('display') == 'block') {
                let otherAmount = $('#other-amount-btn').val();
                $('#txtAmount').val(otherAmount);
            }
            return true;
        }

    });
});

$(document).on('focus', '.vr-keyboard-num-quantity', function () {
    let self = $(this);
    self.keyboard({
        // *** choose layout ***
        layout       : 'custom',
        customLayout : { 'normal'  : ['7 8 9 {b}', '4 5 6 {clear}', '0 1 2 3', '{c} {a}']},

        // allow jQuery position utility to reposition the keyboard on window resize
        reposition : true,

        // preview added above keyboard if true, original input/textarea used if false
        // always disabled for contenteditable elements
        usePreview : true,

        // if true, the keyboard will always be visible
        alwaysOpen : false,

        // give the preview initial focus when the keyboard becomes visible
        initialFocus : true,
        // Avoid focusing the input the keyboard is attached to
        noFocus : false,

        // if true, keyboard will remain open even if the input loses focus.
        stayOpen : false,

        // Prevents the keyboard from closing when the user clicks or
        // presses outside the keyboard. The `autoAccept` option must
        // also be set to true when this option is true or changes are lost
        userClosed : false,

        // if true, keyboard will not close if you press escape.
        ignoreEsc : false,

        // if true, keyboard will only closed on click event instead of mousedown or
        // touchstart. The user can scroll the page without closing the keyboard.
        closeByClickEvent : false,

        // *** change keyboard language & look ***
        display : {
            // \u2714 = check mark - same action as accept
            'a'      : '\u2714:Accept (Shift-Enter)',
            'accept' : 'Accept:Accept (Shift-Enter)',
            'alt'    : 'AltGr:Alternate Graphemes',
            // \u232b = outlined left arrow with x inside
            'b'      : '\u232b:Backspace',
            'bksp'   : 'Bksp:Backspace',
            // \u2716 = big X, close - same action as cancel
            'c'      : '\u2716:Cancel (Esc)',
            'cancel' : 'Cancel:Cancel (Esc)',
            // clear num pad
            'clear'  : 'C:Clear',
            'combo'  : '\u00f6:Toggle Combo Keys',
            // decimal point for num pad (optional);
            // change '.' to ',' for European format
            'dec'    : '.:Decimal',
            // down, then left arrow - enter symbol
            'e'      : '\u21b5:Enter',
            'empty'  : '\u00a0', // &nbsp;
            'enter'  : 'Enter:Enter',
            // \u2190 = left arrow (move caret)
            'left'   : '\u2190',
            // caps lock
            'lock'   : '\u21ea Lock:Caps Lock',
            'next'   : 'Next',
            'prev'   : 'Prev',
            // \u2192 = right arrow (move caret)
            'right'  : '\u2192',
            // \u21e7 = thick hollow up arrow
            's'      : '\u21e7:Shift',
            'shift'  : 'Shift:Shift',
            // \u00b1 = +/- sign for num pad
            'sign'   : '\u00b1:Change Sign',
            'space'  : '&nbsp;:Space',

            // \u21e5 = right arrow to bar; used since this virtual
            // keyboard works with one directional tabs
            't'      : '\u21e5:Tab',
            // \u21b9 is the true tab symbol (left & right arrows)
            'tab'    : '\u21e5 Tab:Tab',
            // replaced by an image
            'toggle' : ' ',

            // added to titles of keys
            // accept key status when acceptValid:true
            'valid': 'valid',
            'invalid': 'invalid',
            // combo key states
            'active': 'active',
            'disabled': 'disabled'
        },

        // Message added to the key title while hovering, if the mousewheel plugin exists
        wheelMessage : 'Use mousewheel to see other keys',

        css : {
            // input & preview
            input          : 'ui-widget-content ui-corner-all',
            // keyboard container
            container      : 'ui-widget-content ui-widget ui-corner-all ui-helper-clearfix',
            // keyboard container extra class (same as container, but separate)
            popup: '',
            // default state
            buttonDefault  : 'ui-state-default ui-corner-all',
            // hovered button
            buttonHover    : 'ui-state-hover',
            // Action keys (e.g. Accept, Cancel, Tab, etc); this replaces the "actionClass" option
            buttonAction   : 'ui-state-active',
            // Active keys (e.g. shift down, meta keyset active, combo keys active)
            buttonActive   : 'ui-state-active',
            // used when disabling the decimal button {dec}
            buttonDisabled : 'ui-state-disabled',
            // empty button class name {empty}
            buttonEmpty    : 'ui-keyboard-empty'
        },

        // *** Useability ***
        // Auto-accept content when clicking outside the keyboard (popup will close)
        autoAccept: true,
        // Auto-accept content even if the user presses escape
        // (only works if `autoAccept` is `true`)
        autoAcceptOnEsc : false,

        // Prevents direct input in the preview window when true
        lockInput : false,

        // Prevent keys not in the displayed keyboard from being typed in
        restrictInput : false,
        // Additional allowed characters while restrictInput is true
        restrictInclude : '', // e.g. 'a b foo \ud83d\ude38'

        // Check input against validate function, if valid the accept button
        // is clickable; if invalid, the accept button is disabled.
        acceptValid : true,
        // Auto-accept when input is valid; requires `acceptValid`
        // set `true` & validate callback
        autoAcceptOnValid : false,

        // if acceptValid is true & the validate function returns a false, this option
        // will cancel a keyboard close only after the accept button is pressed
        cancelClose : true,

        // Use tab to navigate between input fields
        tabNavigation : false,

        // press enter (shift-enter in textarea) to go to the next input field
        enterNavigation : true,
        // mod key options: 'ctrlKey', 'shiftKey', 'altKey', 'metaKey' (MAC only)
        // alt-enter to go to previous; shift-alt-enter to accept & go to previous
        enterMod : 'altKey',

        // if true, the next button will stop on the last keyboard input/textarea;
        // prev button stops at first
        // if false, the next button will wrap to target the first input/textarea;
        // prev will go to the last
        stopAtEnd : true,

        // Set this to append the keyboard immediately after the input/textarea it
        // is attached to. This option works best when the input container doesn't
        // have a set width and when the "tabNavigation" option is true
        appendLocally : false,

        // Append the keyboard to a desired element. This can be a jQuery selector
        // string or object
        appendTo : 'body',

        // If false, the shift key will remain active until the next key is (mouse)
        // clicked on; if true it will stay active until pressed again
        stickyShift : true,

        // caret placed at the end of any text when keyboard becomes visible
        caretToEnd : false,

        // Prevent pasting content into the area
        preventPaste : false,

        // caret stays this many pixels from the edge of the input
        // while scrolling left/right; use "c" or "center" to center
        // the caret while scrolling
        scrollAdjustment : 10,

        // Set the max number of characters allowed in the input, setting it to
        // false disables this option
        maxLength : 16,

        // allow inserting characters @ caret when maxLength is set
        maxInsert : true,

        // Mouse repeat delay - when clicking/touching a virtual keyboard key, after
        // this delay the key will start repeating
        repeatDelay : 500,

        // Mouse repeat rate - after the repeatDelay, this is the rate (characters
        // per second) at which the key is repeated. Added to simulate holding down
        // a real keyboard key and having it repeat. I haven't calculated the upper
        // limit of this rate, but it is limited to how fast the javascript can
        // process the keys. And for me, in Firefox, it's around 20.
        repeatRate : 20,

        // resets the keyboard to the default keyset when visible
        resetDefault : false,

        // Event (namespaced) on the input to reveal the keyboard. To disable it,
        // just set it to an empty string ''.
        openOn : 'focus',

        // When the character is added to the input
        keyBinding : 'mousedown touchstart',

        // enable/disable mousewheel functionality
        // enabling still depends on the mousewheel plugin
        useWheel : true,

        // combos (emulate dead keys)
        // http://en.wikipedia.org/wiki/Keyboard_layout#US-International
        // if user inputs `a the script converts it to à, ^o becomes ô, etc.
        useCombos : true,

        // *** Methods ***
        // Callbacks - add code inside any of these callback functions as desired
        initialized   : function(e, keyboard, el) {},
        beforeVisible : function(e, keyboard, el) {
            $('body').addClass('vk-attached');
        },
        visible       : function(e, keyboard, el) {},
        beforeInsert  : function(e, keyboard, el, textToAdd) { return textToAdd; },
        change        : function(e, keyboard, el) {},
        beforeClose: function (e, keyboard, el, accepted) {

        },
        accepted: function (e, keyboard, el) {
            console.log(el);

            let self = $(el);
            if (!parseFloat(keyboard.$preview.val()) > 0) {
                $(el).val(0);
                $(el).closest('.product-single').removeClass('active');
            }else{
                $(el).closest('.product-single').addClass('active');
            }
            addItemToCart(self, $('.cart-item-list'));
            calculateTotal();
            calculateGrandTotal();


        },
        canceled: function (e, keyboard, el) {

        },
        restricted    : function(e, keyboard, el) {},
        hidden        : function(e, keyboard, el) {
            $('body').removeClass('vk-attached');
        },

        // called instead of base.switchInput
        switchInput : function(keyboard, goToNext, isAccepted) {},

        // used if you want to create a custom layout or modify the built-in keyboard
        // create : function(keyboard) { return keyboard.buildKeyboard(); },

        // build key callback (individual keys)
        buildKey : function( keyboard, data ) {
            return data;
        },

        // this callback is called just before the "beforeClose" to check the value
        // if the value is valid, return true and the keyboard will continue as it
        // should (close if not always open, etc)
        // if the value is not value, return false and the clear the keyboard value
        // ( like this "keyboard.$preview.val('');" ), if desired
        // The validate function is called after each input, the "isClosing" value
        // will be false; when the accept button is clicked, "isClosing" is true
        validate: function (keyboard, value, isClosing) {

            return true;
        }

    });
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