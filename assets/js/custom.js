/**
 * Created by rashu on 7/19/2022.
 */

const cartToggler = document.querySelector('.cart-toggler-js');
const cartClose = document.querySelector('.cart-close-js');
const bodyOverlay = document.querySelector('.body-overlay-js');
const cartSidebar = document.querySelector('.sidebar-js');

cartToggler.addEventListener('click', function () {
    cartToggle(true);
});
bodyOverlay.addEventListener('click', function () {
    cartToggle(false);
});
cartClose.addEventListener('click', function () {
    cartToggle(false);
});

function cartToggle(isToggle){
    if(isToggle){
        bodyOverlay.style.display = 'block';
        cartSidebar.classList.add('opened');
    }else{
        bodyOverlay.style.display = 'none';
        cartSidebar.classList.remove('opened');
    }

}