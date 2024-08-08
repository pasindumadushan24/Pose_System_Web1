// File: controller/CustomerController.js

import { customer_db } from "../db/db.js";
import CustomerModel from "../model/CustomerModel.js";
import { loadCustomerIds } from "./OrderController.js"; // Import the function from OrderController

let selectedCustomerIndex = -1;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^0\d{9}$/;

function isValidEmail(email) { return emailRegex.test(email); }
function isValidPhone(phone) { return phoneRegex.test(phone.replace(/[\s-]/g, '')); }

export function loadCustomerTable(dataToLoad = customer_db) {
    $('#customer_table').empty();
    dataToLoad.map(item => {
        $('#customer_table').append(`
            <tr>
                <td>${item.id}</td>
                <td>${item.fname}</td>
                <td>${item.lname}</td>
                <td>${item.email}</td>
                <td>${item.phone}</td>
                <td>${item.address}</td>
            </tr>
        `);
    });
}

function generateNextId() {
    $('#customer_id').val('C' + String(customer_db.length + 1).padStart(3, '0'));
}

function loadCustomerIntoForm(customer, index) {
    $('#customer_id').val(customer.id);
    $('#first_name').val(customer.fname);
    $('#last_name').val(customer.lname);
    $('#email').val(customer.email);
    $('#phone').val(customer.phone);
    $('#address').val(customer.address);
    selectedCustomerIndex = index;
}

function clearCustomerForm() {
    generateNextId();
    $('#searchCustomer').val('');
    $('#first_name, #last_name, #email, #phone, #address').val('');
    selectedCustomerIndex = -1;
    loadCustomerTable();
}

export function filterCustomerTable() {
    const searchTerm = $('#searchCustomer').val().trim().toLowerCase();
    if (!searchTerm) { loadCustomerTable(); return; }

    const filtered = customer_db.filter(c =>
        c.fname.toLowerCase().includes(searchTerm) ||
        c.lname.toLowerCase().includes(searchTerm) ||
        c.id.toLowerCase().includes(searchTerm)
    );
    loadCustomerTable(filtered);
}

// ------------------- Event Handlers -------------------

$('#customer_save').on('click', function () {
    const id = $('#customer_id').val();
    const fname = $('#first_name').val().trim();
    const lname = $('#last_name').val().trim();
    const email = $('#email').val().trim();
    const phone = $('#phone').val().trim();
    const address = $('#address').val().trim();

    if (!fname || !lname || !email || !phone || !address) {
        Swal.fire({ icon: "error", title: "Error!", text: "Please fill in all fields..!" });
        return;
    }
    if (!isValidEmail(email)) { Swal.fire({ icon: "error", title: "Invalid Email!", text: "Enter valid email." }); return; }
    if (!isValidPhone(phone)) { Swal.fire({ icon: "error", title: "Invalid Phone!", text: "Enter valid phone number." }); return; }

    const newCustomer = new CustomerModel(id, fname, lname, email, phone, address);
    customer_db.push(newCustomer);

    loadCustomerTable();
    Swal.fire({ title: "Customer Added!", icon: "success" });

    clearCustomerForm();

    // 🔹 Update Order Form dropdown
    if (typeof loadCustomerIds === 'function') loadCustomerIds();
});

$('#customer_update').on('click', function () {
    if (selectedCustomerIndex === -1) { Swal.fire({ icon: "warning", title: "No selection!" }); return; }

    const id = $('#customer_id').val();
    const fname = $('#first_name').val().trim();
    const lname = $('#last_name').val().trim();
    const email = $('#email').val().trim();
    const phone = $('#phone').val().trim();
    const address = $('#address').val().trim();

    customer_db[selectedCustomerIndex] = new CustomerModel(id, fname, lname, email, phone, address);
    loadCustomerTable();
    Swal.fire({ title: "Customer Updated!", icon: "success" });

    clearCustomerForm();
    if (typeof loadCustomerIds === 'function') loadCustomerIds();
});

$('#customer_delete').on('click', function () {
    if (selectedCustomerIndex === -1) { Swal.fire({ icon: "warning", title: "Select customer!" }); return; }
    Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true
    }).then(result => {
        if (result.isConfirmed) {
            customer_db.splice(selectedCustomerIndex, 1);
            loadCustomerTable();
            Swal.fire({ title: "Deleted!", icon: "success" });
            clearCustomerForm();
            if (typeof loadCustomerIds === 'function') loadCustomerIds();
        }
    });
});

$('#customer_reset').on('click', clearCustomerForm);

$('#customer_table').on('click', 'tr', function () {
    const selectedId = $(this).find('td:first').text();
    const index = customer_db.findIndex(c => c.id === selectedId);
    if (index !== -1) loadCustomerIntoForm(customer_db[index], index);
});

$('#searchCustomer').on('keyup', filterCustomerTable);

$(document).ready(function () {
    generateNextId();
    loadCustomerTable();
});
