import './styles.css';
import '@fortawesome/fontawesome-free/css/all.css';

import request from 'oc-request';


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

var xhrProto = XMLHttpRequest.prototype,
    origOpen = xhrProto.open;

xhrProto.open = function (method, url) {
    this._url = url;
    return origOpen.apply(this, arguments);
};

window.addEventListener('load', function() {
    // mobile menu button
    let mobile_menu_button = document.querySelector('#mobileMenuLink');
    if (mobile_menu_button) {
	mobile_menu_button.addEventListener('click', (e) => {
	    if (e.preventDefault) e.preventDefault();
	    let mobile_menu_container = document.querySelector("#mobileNav");
	    mobile_menu_container.classList.toggle('hide-nav')
	    return false;
	});
    }

    // contact form
    let contact_form = document.querySelector("#contact-form");
    if (contact_form) {
	contact_form.addEventListener("submit", (e) => {
     	    if (e.preventDefault) e.preventDefault();
	    let name = e.target.querySelector("input[name=name]").value;
	    let email = e.target.querySelector("input[name=email]").value;
	    let msg = e.target.querySelector("textarea").value;
	    let statusbox = document.querySelector("#contact-status");

	    if (msg.length == 0) {
		statusbox.innerHTML = '<p class="text-red-600">Please enter a message to send</p>';
	    }
	    let xhr = new XMLHttpRequest();
	    xhr.addEventListener('load', (e) => {
		if (xhr.status >= 200 && xhr.status < 300) {
		    statusbox.innerHTML = '<p class="text-green-600">Your message has been sent<p>';
		} else {
		    statusbox.innerHTML = '<p class="text-red-600">Your message failed to send. Please contact the administrator.</p>';
		}
	    });
	    xhr.open('POST', '/tanline/contact-form');
	    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	    xhr.send(JSON.stringify({
		name: name,
		email: email,
		message: msg
	    }));
     	    return false;
	});
    }

    // add products to cart
    let product_panels = document.querySelectorAll('.product-panel');
    product_panels.forEach((panel) => {
	panel.addEventListener('click', function (e) {
	    e.preventDefault();
	    if (e.target.dataset.action=='add-to-cart') {
		let itemid = panel.dataset.itemid;
		let product_id = e.target.dataset.productid;
		let properties = panel.querySelectorAll('select.property-option');
		let property_ids = [];
		properties.forEach((property) => {
		    property_ids.push(property.value);
		});
		
		let quantity = panel.querySelector('input[type=number]').value;
		let data = {
		    basket: [{
			product_id: product_id,
			quantity: quantity,
			properties: property_ids
		    }]
		};
		request.sendData('Basket::onAdd', {
		    data: data,
		    update: {
			'basket/basket-pill': '#basket-pill-wrapper'
		    }
		});
	    }
	    return false;
	});
    });

    // cart interaction
    let basket_item_wrapper = document.querySelector('#basket-item-wrapper');
    if (basket_item_wrapper) {
	// handles updating of quantities
	basket_item_wrapper.addEventListener('change', function (e) {
	    e.preventDefault();
	    if (e.target.classList.contains('basket-update')) {
		let basket_item_id = e.target.dataset.basketitemid;
		let quantity = e.target.value;
		let data = {
		    basket: [
			{ 'basket_item_id': basket_item_id, 'quantity': quantity}
		    ]
		};
		request.sendData('Basket::onUpdate', {
		    data: data,
		    update: {
			'basket/basket-item-list': '#basket-item-wrapper',
			'basket/basket-pill': '#basket-pill-wrapper',
			'basket/basket-checkout-button': '#basket-checkout-button'
		    }
		});
	    }
	    return false;
	});

	basket_item_wrapper.addEventListener('click', function (e) {
	    e.preventDefault();
	    if (e.target.classList.contains('basket-delete')) {
		request.sendData('Basket::onRemove', {
		    data: {
			basket: [ e.target.dataset.basketitemid ]
		    },
		    update: {
			'basket/basket-item-list': '#basket-item-wrapper',
			'basket/basket-pill': '#basket-pill-wrapper',
			'basket/basket-checkout-button': '#basket-checkout-button'
		    }
		});
	    }
	    return false;
	});
    }

    // checkout experience
    let getEmail = document.querySelector("#get-email");
    if (getEmail) {
	getEmail.addEventListener('input', function (e) {
	    e.preventDefault();
	    if (e.target.matches('input[type=email]')) {
		let btn = getEmail.querySelector('button');
		if (e.target.value.length > 0) {
		    if (validateEmail(e.target.value)) {
			btn.disabled = false;
		    }
		}
		else {
		    btn.disabled = true;
		}
	    }
	    return false;
	});
	getEmail.addEventListener('click', function (e) {
	    e.preventDefault();
	    if (e.target.matches('.edit-button')) {
		getEmail.querySelector('form').classList.remove('hidden');
		document.querySelector('.edit-button').classList.add('hidden');
		document.querySelector('#get-shipping .card-body').classList.add('hidden');
		document.querySelector('#get-payment .card-body').classList.add('hidden');
		getEmail.querySelector('.result').innerHTML = '';
	    }
	    else if (e.target.matches('button')) {
		// hide the form
		getEmail.querySelector('form').classList.add('hidden');
		// get the values
		let email = getEmail.querySelector('#email').value;
		getEmail.querySelector('.result').innerHTML = `${email}`;
		getEmail.querySelector('.edit-button').classList.remove('hidden');
		// move to the shipping form
		document.querySelector('#get-shipping .card-body').classList.remove('hidden');
	    }
	    return false;
	});
    }

    let getShipping = document.querySelector('#get-shipping');
    if (getShipping) {
	getShipping.addEventListener('input', function(e) {
	    e.preventDefault();
	    let addressee = getShipping.querySelector("#addressee").value;
	    let street = getShipping.querySelector("#street").value;
	    let city = getShipping.querySelector("#city").value;
	    let state = getShipping.querySelector("#state").value;
	    let zip = getShipping.querySelector("#zip").value;
	    let phone = getShipping.querySelector('#phone').value;
	    // let shipping = getShipping.querySelector('#shipping-type').value;
	    if (addressee.length > 0 && street.length > 0
		&& city.length > 0 && zip.length > 0 && state.length > 0
		&& phone.length > 0 // && shipping > 0
	       ) {
		getShipping.querySelector('button').disabled = false;
	    } else {
		getShipping.querySelector('button').disabled = true;
	    }

	    if (e.target.matches('#shipping-type')) {
		request.sendData('Cart::onSetShippingType', {
		    data: { 'shipping_type_id': e.target.value },
		    /*
		    success: function(response) {
			console.log(response);
		    },
		    */
		    update: {
			'cart/cart-item-summary': '.order-summary > .card-body'
		    }
		});
	    }

	    return false;
	});
	getShipping.addEventListener('click', function(e) {
	    e.preventDefault();
	    if (e.target.matches('.edit-button')) {
		getShipping.querySelector('form').classList.remove('hidden');
		getShipping.querySelector('.edit-button').classList.add('hidden');
		getShipping.querySelector('.result').innerHTML = '';
		document.querySelector('#get-payment .card-body').classList.add('hidden');
	    }
	    else if (e.target.matches('button')) {
		let addressee = getShipping.querySelector("#addressee").value;
		let street = getShipping.querySelector("#street").value;
		let city = getShipping.querySelector("#city").value;
		let state = getShipping.querySelector("#state").value;
		let zip = getShipping.querySelector("#zip").value;
		let phone = getShipping.querySelector('#phone').value;
		let email = document.querySelector('#email').value;
		//let shipping = getShipping.querySelector('#shipping-type').value;
		let result=`<div>${addressee}</div>`
		    + `<div>${street}</div>`
		    + `<div>${city}, ${state}, ${zip}</div>`
		    + `<div>${phone}</div>`;
		getShipping.querySelector('.result').innerHTML = result;
		getShipping.querySelector('form').classList.add('hidden');
		getShipping.querySelector('.edit-button').classList.remove('hidden');
		document.querySelector('#get-payment .card-body').classList.remove('hidden');
		let totalPrice = document.querySelector('.order-summary .total-amount').innerHTML;

		// create the paypal button
		//console.log('make button!');
		document.querySelector('#paypal-button-container').innerHTML = '';
		paypal.Buttons({
		    style: {
			shape: 'rect',
			color: 'blue',
			layout: 'vertical',
			label: 'paypal',
			
		    },
		    createOrder: function(data, actions) {
			// disable button?
			//document.querySelector('#get-payment').disabled = true;
			return actions.order.create({
			    purchase_units: [{
				amount: {
				    value:totalPrice 
				}
			    }]
			});
		    },
		    onApprove: function(data, actions) {
			//console.log(data);
			//console.log(actions);
			return actions.order.capture().then(function(details) {
			    let data = {
				order: {
				    payment_method_id: 0,
				    //'shipping_type_id': shipping,
				    //'shipping_price': document.querySelector('.order-summary .shipping-amount').innerHTML,
				    email: email,
				    phone: phone,
				    shipping_address: {
					addressee,
					street,
					city,
					state,
					postcode: zip
				    },
				},
			    };
			    request.sendData('Order::onCreate', {
				data: data,
				update: {},
				success: function() {
				    window.location = '/thank-you';
				}
			    });

			});
		    }
		}).render('#paypal-button-container');

	    }
	    return false;
	});
    }

});

