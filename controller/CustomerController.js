// File: CustomerController.js

import {customer_db} from "../db/db.js";
import CustomerModel from "../model/CustomerModel.js";

// Global variable for tracking the selected customer's index
let selectedCustomerIndex = -1;
let selectedCustomerId = null;

// --- Utility Functions for Validation ---
// Basic Email Regex: checks for 'text@text.domain'
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 🇱🇰 Sri Lankan Phone Regex: Matches 10 digits starting with '0'
const phoneRegex = /^0\d{9}$/;

function isValidEmail(email) {
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Clean input by removing spaces and hyphens before testing
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    return phoneRegex.test(cleanedPhone);
}
// ----------------------------------------

/**
 * Loads customer records into the HTML table.
 * @param {Array} [dataToLoad=customer_db] - The array of customers to render.
 */
function loadCustomerTable(dataToLoad = customer_db) {
    $('#customer_table').empty();

    dataToLoad.map((item) => {
        let data = `<tr>
                             <td>${item.id}</td>
                             <td>${item.fname}</td>
                             <td>${item.lname}</td>
                             <td>${item.email}</td>
                             <td>${item.phone}</td>
                             <td>${item.address}</td>
                           </tr>`

        $('#customer_table').append(data);
    });
}

/**
 * Generates the next sequential customer ID and sets it to the input field.
 */
function generateNextId() {
    const nextId = 'C' + String(customer_db.length + 1).padStart(3, '0');
    $('#customer_id').val(nextId);
}

/**
 * Loads customer data into the form inputs for viewing/editing.
 */
function loadCustomerIntoForm(customer, index) {
    $('#customer_id').val(customer.id);
    $('#first_name').val(customer.fname);
    $('#last_name').val(customer.lname);
    $('#email').val(customer.email);
    $('#phone').val(customer.phone);
    $('#address').val(customer.address);
    selectedCustomerIndex = index;
    selectedCustomerId = customer.id;
}

/**
 * Clears all form inputs, resets the selection index, and reloads the full table.
 */
function clearCustomerForm() {
    generateNextId();
    $(`#searchCustomer`).val("");
    $('#first_name').val("");
    $('#last_name').val("");
    $('#email').val("");
    $('#phone').val("");
    $('#address').val("");
    selectedCustomerIndex = -1; // Reset selection index
    selectedCustomerId = null; // Reset selection ID
    loadCustomerTable(); // Load all customers back into the table
}


// ---------------------------------------------
// 🔎 LIVE SEARCH AND FILTER FUNCTION
// ---------------------------------------------

/**
 * Filters the customer table based on the input in the search box by first name, last name, or ID.
 */
function filterCustomerTable() {
    const searchTerm = $('#searchCustomer').val().trim().toLowerCase();

    if (searchTerm === '') {
        loadCustomerTable();
        // Clear main form inputs, but preserve the current ID
        $('#first_name').val("");
        $('#last_name').val("");
        $('#email').val("");
        $('#phone').val("");
        $('#address').val("");
        selectedCustomerIndex = -1;
        selectedCustomerId = null;
        return;
    }

    // Find all customers that contain the search term in their first name, last name, or ID (case-insensitive)
    const filteredCustomers = customer_db.filter(customer =>
        customer.fname.toLowerCase().includes(searchTerm) ||
        customer.lname.toLowerCase().includes(searchTerm) ||
        customer.id.toLowerCase().includes(searchTerm)
    );

    if (filteredCustomers.length > 0) {
        loadCustomerTable(filteredCustomers);
    } else {
        loadCustomerTable([]); // Show an empty table
    }
}

// Initial load
loadCustomerTable();
generateNextId();


// ---------------------------------------------
// Event Handlers (CRUD Operations)
// ---------------------------------------------

// Save customer (CREATE)
$('#customer_save').on('click', function () {
    let id = $(`#customer_id`).val();
    let fname = $(`#first_name`).val().trim();
    let lname = $(`#last_name`).val().trim();
    let email = $(`#email`).val().trim();
    let phone = $(`#phone`).val().trim();
    let address = $(`#address`).val().trim();

    if (fname === '' || lname === '' || email === '' || phone === '' || address === '') {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Please fill in all fields..!"
        });
    } else if (!isValidEmail(email)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Email!",
            text: "Please enter a valid email address (e.g., user@domain.com)."
        });
    } else if (!isValidPhone(phone)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Phone Number!",
            text: "Please enter a valid 10-digit Sri Lankan phone number (e.g., 0771234567)."
        });
    } else {
        // Instantiate the CustomerModel class
        let newCustomer = new CustomerModel(id, fname, lname, email, phone, address);

        customer_db.push(newCustomer);
        console.log(customer_db);

        loadCustomerTable();

        Swal.fire({
            title: "Customer Added successfully..!",
            icon: "success",
            draggable: true
        });

        // Clear fields and generate next ID
        clearCustomerForm();
    }
});


// Update customer (UPDATE)
$('#customer_update').on('click', function () {
    let id = $('#customer_id').val();
    let fname = $('#first_name').val().trim();
    let lname = $('#last_name').val().trim();
    let email = $('#email').val().trim();
    let phone = $('#phone').val().trim();
    let address = $('#address').val().trim();

    if (selectedCustomerIndex === -1) {
        Swal.fire({
            icon: "warning",
            title: "No customer selected!",
            text: "Please select a customer to update."
        });
        return;
    }

    if (fname === '' || lname === '' || email === '' || phone === '' || address === '') {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Please fill in all fields..!"
        });
    } else if (!isValidEmail(email)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Email!",
            text: "Please enter a valid email address (e.g., user@domain.com)."
        });
    } else if (!isValidPhone(phone)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Phone Number!",
            text: "Please enter a valid 10-digit Sri Lankan phone number (e.g., 0771234567)."
        });
    } else {
        // Instantiate the CustomerModel class for the update
        customer_db[selectedCustomerIndex] = new CustomerModel(id, fname, lname, email, phone, address);

        loadCustomerTable();
        console.log(customer_db);

        Swal.fire({
            title: "Customer updated successfully..!",
            icon: "success"
        });

        // Clear fields and re-generate ID
        clearCustomerForm();
    }
});

//Reset form
$(`#customer_reset`).on('click', clearCustomerForm);

// Delete Customer (DELETE)
$('#customer_delete').on('click', function () {
    if (selectedCustomerIndex !== -1) {

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                customer_db.splice(selectedCustomerIndex, 1);
                loadCustomerTable();

                Swal.fire({
                    title: "Deleted!",
                    text: "Customer has been deleted successfully.",
                    icon: "success"
                });

                // Reset the form fields using the new function
                clearCustomerForm();
            }
        });

    } else {
        Swal.fire({
            icon: "warning",
            title: "No Selection",
            text: "Please select a customer to delete."
        });
    }
});


// Select a customer by clicking on a table row (READ)
$('#customer_table').on('click', 'tr', function () {
    // Find the index of the selected item in the *full* database
    // A more robust way would be to get the ID from the row:
    const selectedId = $(this).find('td:first').text();
    const indexInDB = customer_db.findIndex(customer => customer.id === selectedId);

    if (indexInDB !== -1) {
        const selectedCustomer = customer_db[indexInDB];
        loadCustomerIntoForm(selectedCustomer, indexInDB);
    }
});


$('#searchButton').on('click', function (e) {
    e.preventDefault();

    const searchTerm = $('#searchCustomer').val().trim(); // Get the search term

    // 1. Always filter the table first based on the current search term (partial match)
    filterCustomerTable();

    if (searchTerm === '') {
        clearCustomerForm(); // Reset form/table if search is empty
        return;
    }

    let exactMatchIndex = -1;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // A. Try to find an EXACT match by Email (as per the search box placeholder's primary intent)
    exactMatchIndex = customer_db.findIndex(customer =>
        customer.email.toLowerCase() === lowerCaseSearchTerm
    );

    // B. If no Email match, try to find an EXACT match by Customer ID
    if (exactMatchIndex === -1) {
        exactMatchIndex = customer_db.findIndex(customer =>
            customer.id.toLowerCase() === lowerCaseSearchTerm
        );
    }

    if (exactMatchIndex !== -1) {
        // Exact match found: Load into form and show feedback
        const foundCustomer = customer_db[exactMatchIndex];
        loadCustomerIntoForm(foundCustomer, exactMatchIndex); // Load data into form

        Swal.fire({
            icon: "success",
            title: "Customer Found!",
            text: `Details for ${foundCustomer.fname} loaded for editing.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

    } else {
        // No exact match found, but the table is already filtered by the call to filterCustomerTable()
        Swal.fire({
            icon: "info",
            title: "No Exact Match",
            text: `No exact customer ID or email match found. Table filtered by partial name/ID.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

        // Clear form data fields to prevent accidental edits, but keep the current generated ID.
        generateNextId();
        $('#first_name').val('');
        $('#last_name').val('');
        $('#email').val('');
        $('#phone').val('');
        $('#address').val('');
        selectedCustomerIndex = -1;
        selectedCustomerId = null;
    }
});
