// File: controller/OrderController.js

import {item_db, order_db, customer_db} from "../db/db.js";
import OrderModel from "../model/OrderModel.js"; // ***FIXED: Imported as 'OrderModel' (uppercase M)***

// --- Global State & Utility Functions ---

let cart = [];

// --- Initialization ---

$(document).ready(function () {
    loadCustomerIds();
    loadItemIds();
    generateNextId();
    setTodayDate();
    updateGrandTotal();
    attachCartDeleteHandler();
    attachCancelOrderHandler();
    loadOrderHistoryTable(); // Load history on page load
});

// --- Utility Functions ---

function loadCustomerIds() {
    $('#cust_id').empty().append('<option selected disabled>Select Customer ID</option>');
    customer_db.forEach(customer => {
        $('#cust_id').append(`<option value="${customer.id}">${customer.id}</option>`);
    });
    $('#cust_id').off('change').on('change', function () {
        const selectedId = $(this).val();
        const customer = customer_db.find(c => c.id === selectedId);
        $('#name').val(customer ? customer.fname + ' ' + customer.lname : '');
        $('#address2').val(customer ? customer.address : '');
    });
}


function loadItemIds() {
    $('#item_id2').empty().append('<option selected disabled>Select Item ID</option>');
    item_db.forEach(item => {
        // Only show items that are in stock
        if (item.qtyInStock > 0) {
            $('#item_id2').append(`<option value="${item.item_id}">${item.item_id}</option>`);
        }
    });
    $('#item_id2').off('change').on('change', function () {
        const selectedId = $(this).val();
        const item = item_db.find(i => i.item_id === selectedId);
        $('#item_name2').val(item ? item.itemName : '');
        $('#price2').val(item ? item.price.toFixed(2) : '');
        $('#qty_on_hand').val(item ? item.qtyInStock : '');
    });
}

function generateNextId() {
    const nextId = 'OD' + String(order_db.length + 1).padStart(3, '0');
    $('#order_id').val(nextId);
}

function setTodayDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    $('#date').val(formattedDate);
}

function updateGrandTotal() {
    let grandTotal = 0;
    cart.forEach(item => {
        grandTotal += item.total;
    });
    $('#order_total').val(grandTotal.toFixed(2));
}

// Order Summary Table (Cart)
function loadOrderTable() {
    $('#order_table').empty();
    cart.forEach((item, index) => {
        $('#order_table').append(`
            <tr>
                <td class="text-center">${item.item_id}</td>
                <td class="text-center">${item.item_name}</td>
                <td class="text-center">${item.price.toFixed(2)}</td>
                <td class="text-center">${item.orderQty}</td>
                <td class="text-center">${item.total.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm delete-item" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
    updateGrandTotal();
}

/**
 * Resets the order form.
 * @param {boolean} restoreStock - If true, stock in the DB is restored for items in the cart (used for CANCEL). If false, stock is NOT restored (used for PLACE ORDER).
 */
function resetOrderForm(restoreStock = true) {
    // 1. Restore stock to inventory for items in the current cart ONLY IF restoreStock is true
    if (restoreStock) {
        cart.forEach(item => {
            const itemInDB = item_db.find(i => i.item_id === item.item_id);
            if (itemInDB) {
                itemInDB.qtyInStock += item.orderQty; // **STOCK RESTORED** (on Cancel/Delete)
            }
        });
    }

    // 2. Clear cart and reset UI
    cart = [];
    loadOrderTable();
    generateNextId();
    setTodayDate();

    // Clear fields
    $('#cust_id').val('Select Customer ID');
    $('#name').val('');
    $('#address2').val('');
    $('#item_id2').val('Select Item ID');
    $('#item_name2').val('');
    $('#price2').val('');
    $('#qty_on_hand').val('');
    $('#order_qty').val('');

    // Reload item IDs to reflect restored stock (if done) or just reflect general state
    loadItemIds();
    loadOrderHistoryTable();
}


// Order History Function
function loadOrderHistoryTable() {
    $('#order_history_table').empty();

    if (order_db.length === 0) {
        $('#order_history_table').append(`
            <tr>
                <td colspan="7" class="text-center text-muted">No orders found in history.</td>
            </tr>
        `);
        return;
    }

    // The order database structure is line-item based, so we just iterate over it
    order_db.forEach(order => {
        const lineTotal = order.price * order.orderQty;

        $('#order_history_table').append(`
            <tr>
                <td class="text-center fw-bold">${order.order_id}</td>
                <td class="text-center">${order.item_id}</td>
                <td>${order.item_name}</td>
                <td class="text-center">${order.cust_id}</td>
                <td>${order.cust_name}</td>
                <td class="text-center">${order.orderQty}</td>
                <td class="text-end text-success fw-bold">${lineTotal.toFixed(2)}</td>
            </tr>
        `);
    });
}


// --- Event Handlers ---

// Handler for deleting items from the cart and restoring stock
function attachCartDeleteHandler() {
    $('#order_table').off('click', '.delete-item').on('click', '.delete-item', function() {
        const indexToDelete = $(this).data('index');
        const itemToDelete = cart[indexToDelete];

        Swal.fire({
            title: 'Remove Item?',
            text: `Remove ${itemToDelete.item_name} from the cart? Stock will be restored.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const itemInDB = item_db.find(i => i.item_id === itemToDelete.item_id);
                if (itemInDB) {
                    itemInDB.qtyInStock += itemToDelete.orderQty; // **STOCK RESTORED**
                }
                cart.splice(indexToDelete, 1);
                loadOrderTable();
                loadItemIds(); // Reload to update available stock count
                Swal.fire('Removed!', 'Item has been removed from cart.', 'success');
            }
        });
    });
}


$('#add_items').on('click', function () {
    let item_id = $('#item_id2').val();
    let item_name = $('#item_name2').val();
    let price = parseFloat($('#price2').val());
    let orderQty = parseInt($('#order_qty').val());

    if (!item_id || isNaN(orderQty) || orderQty <= 0) {
        Swal.fire({icon: "error", title: "Error!", text: "Please select an item and enter a valid order quantity (> 0)."});
        return;
    }

    const itemInDB = item_db.find(i => i.item_id === item_id);

    if (!itemInDB || orderQty > itemInDB.qtyInStock) { // Added !itemInDB check for safety
        Swal.fire({icon: "error", title: "Error!", text: `Not enough stock available! Only ${itemInDB ? itemInDB.qtyInStock : 0} in stock.`});
        return;
    }

    const total = price * orderQty;
    const existingCartItem = cart.find(item => item.item_id === item_id);

    // Update Inventory Stock (Decrease)
    itemInDB.qtyInStock -= orderQty; // **STOCK DECREASED**

    // Update Cart
    if (existingCartItem) {
        existingCartItem.orderQty += orderQty;
        existingCartItem.total += total;
    } else {
        cart.push({item_id, item_name, price, orderQty, total});
    }

    loadOrderTable();

    // Clear item selection fields
    $('#item_id2').val('Select Item ID');
    $('#item_name2').val('');
    $('#price2').val('');
    $('#qty_on_hand').val('');
    $('#order_qty').val('');

    // Reload item IDs to reflect the stock change (i.e., hide items that are now out of stock)
    loadItemIds();
});


$('#place_order').on('click', function () {
    const order_id = $('#order_id').val();
    const date = $('#date').val();
    const cust_id = $('#cust_id').val();
    const cust_name = $('#name').val();
    const address = $('#address2').val();

    if (!cust_id || cust_id === "Select Customer ID" || cart.length === 0) {
        Swal.fire({icon: "error", title: "Error!", text: "Please select a customer and add items to the cart to place an order."});
        return;
    }

    // Save Order to Database (each item in the cart becomes an OrderModel instance)
    cart.forEach(cartItem => {
        const newOrder = new OrderModel( // ***Used correct 'OrderModel' class name***
            order_id, date, cust_id, cust_name, address,
            cartItem.item_id, cartItem.item_name, cartItem.price,
            cartItem.orderQty
        );
        order_db.push(newOrder);
    });

    // Success Notification and UI Reset
    Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: `Order ${order_id} has been successfully placed for ${cust_name}.`,
        confirmButtonText: 'OK'
    }).then(() => {
        // Now call the modified reset function, setting restoreStock to false
        resetOrderForm(false);
    });
});


// Handler for cancelling the full order and restoring all stock
function attachCancelOrderHandler() {
    $('#cancel_order').on('click', function() {
        if (cart.length > 0) {
            Swal.fire({
                title: 'Are you sure?',
                text: "All items in the cart will be cleared and stock restored!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, cancel it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    resetOrderForm(true); // This call restores the stock!
                    Swal.fire('Cancelled!', 'The current order has been cancelled and stock restored.', 'success');
                }
            });
        } else {
            Swal.fire('Info', 'The cart is already empty.', 'info');
        }
    });
}

// Handler to refresh the history table when the sidebar button is clicked
$('#order_history_button').on('click', function() {
    loadOrderHistoryTable();
});