// File: ItemController.js

import {item_db} from "../db/db.js";
import ItemModel from "../model/ItemModel.js"; // Import the fixed model

let selectedItemIndex = -1;

// Call initial functions
loadItemTable();
generateNextId();

// ---------------------------------------------
// Core Functions
// ---------------------------------------------

/**
 * Renders the item data from item_db into the HTML table.
 * @param {Array} [dataToLoad=item_db] - The array of items to render. Defaults to the full database.
 */
function loadItemTable(dataToLoad = item_db) {
    $('#item_table').empty();

    // Use the provided array or the full database
    dataToLoad.map((item) => {
        let data = `<tr>
                <td>${item.item_id}</td>
                <td>${item.itemName}</td>
                <td>${item.category}</td>
                <td>${item.price}</td>
                <td>${item.qtyInStock}</td>
                <td>${item.description}</td>
            </tr>`

        $('#item_table').append(data)
    });
}

/**
 * Generates the next sequential item ID and sets it to the input field.
 */
function generateNextId() {
    const nextId = 'I' + String(item_db.length + 1).padStart(3, '0');
    $('#item_id').val(nextId);
    selectedItemIndex = -1; // Reset selection on ID generation
}

/**
 * Clears all input fields and resets the ID/selection index.
 */
function clearForm() {
    generateNextId();
    $('#item_search').val("");
    $('#item_name').val("");
    $('#category').val("");
    $('#price').val("");
    $('#qty_in_stock').val("");
    $('#description').val("");
    selectedItemIndex = -1; // Ensure selection is reset
    loadItemTable(); // Always reset the table view to show all items
}

/**
 * Validates form inputs for non-empty fields and valid numbers.
 */
function isValidInput(itemName, category, price, qtyInStock, description) {
    if (itemName.trim() === '' || category.trim() === '' || description.trim() === ''){
        return false; // Check for empty strings
    }
    // Check if price and qtyInStock are valid positive numbers
    if (isNaN(price) || isNaN(qtyInStock) || price < 0 || qtyInStock < 0 || price.toString().trim() === '' || qtyInStock.toString().trim() === '') {
        return false;
    }
    return true;
}

/**
 * Loads item data into the form inputs for viewing/editing.
 */
function loadItemIntoForm(item, index) {
    $('#item_id').val(item.item_id);
    $('#item_name').val(item.itemName);
    $('#category').val(item.category);
    $('#price').val(item.price);
    $('#qty_in_stock').val(item.qtyInStock);
    $('#description').val(item.description);
    selectedItemIndex = index;
}


// ---------------------------------------------
// 🔎 LIVE SEARCH AND FILTER FUNCTION
// ---------------------------------------------

/**
 * Filters the item table based on the input in the search box.
 */
function filterItemTable() {
    const searchTerm = $('#item_search').val().trim().toLowerCase();

    if (searchTerm === '') {
        // If search term is empty, show all items
        loadItemTable();
        // Clear main form inputs, but preserve the current ID
        $('#item_name').val('');
        $('#category').val('');
        $('#price').val('');
        $('#qty_in_stock').val('');
        $('#description').val('');
        selectedItemIndex = -1;
        return;
    }

    // Find all items that contain the search term in their name (case-insensitive)
    const filteredItems = item_db.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm)
    );

    if (filteredItems.length > 0) {
        loadItemTable(filteredItems);
    } else {
        loadItemTable([]); // Show an empty table
    }
}


// ---------------------------------------------
// Event Handlers (CRUD Operations)
// ---------------------------------------------

// Save Item (CREATE)
$('#item_register').on('click', function () {
    let item_id = $('#item_id').val();
    let itemName = $('#item_name').val();
    let category = $('#category').val();
    let price = Number($('#price').val()); // Use Number() for better parsing
    let qtyInStock = Number($('#qty_in_stock').val());
    let description = $('#description').val();

    if (!isValidInput(itemName, category, price, qtyInStock, description)){
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Please enter valid inputs. All fields are required, and Price/Quantity must be valid non-negative numbers."
        });
        return;
    }

    // Use the ItemModel (optional, but good practice for consistency)
    let newItem = new ItemModel(item_id, itemName, category, price, qtyInStock, description);

    item_db.push(newItem);
    console.log(item_db);

    loadItemTable();

    Swal.fire({
        title: "Item Added successfully!",
        icon: "success",
        draggable: true
    });

    clearForm();
});

// Update Item (UPDATE)
$(`#item_update`).on('click',function (){
    let item_id = $('#item_id').val();
    let itemName = $('#item_name').val();
    let category = $('#category').val();
    let price = Number($('#price').val());
    let qtyInStock = Number($('#qty_in_stock').val());
    let description = $('#description').val();

    if (selectedItemIndex === -1) {
        Swal.fire({
            icon: "warning",
            title: "No item selected!",
            text: "Please select an item to update."
        });
        return;
    }

    if (!isValidInput(itemName, category, price, qtyInStock, description)){
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Please enter valid inputs. All fields are required, and Price/Quantity must be valid non-negative numbers."
        });
        return;
    }

    // Update the item in the database array
    item_db[selectedItemIndex] = new ItemModel(item_id, itemName, category, price, qtyInStock, description);

    loadItemTable();
    console.log(item_db);

    Swal.fire({
        title: "Item updated successfully!",
        icon: "success"
    });

    clearForm();
});

// Clear Form / Cancel Button
$(`#item_cancel`).on('click', function () {
    clearForm();
});

// Delete Item (DELETE)
$(`#item_delete`).on('click',function (){
    if(selectedItemIndex !== -1) {

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
                item_db.splice(selectedItemIndex, 1);
                loadItemTable();
                clearForm();

                Swal.fire({
                    title: "Deleted!",
                    text: "Item has been deleted successfully.",
                    icon: "success"
                });
            }
        });
    } else {
        Swal.fire({
            icon: "warning",
            title: "No Selection",
            text: "Please select an item to delete."
        });
    }
});

// Select a item by clicking on a table row (READ)
$('#item_table').on('click', 'tr', function () {
    selectedItemIndex = $(this).index();
    const selectedItem = item_db[selectedItemIndex];

    if (selectedItem) {
        loadItemIntoForm(selectedItem, selectedItemIndex);
    }
});


// ----------------- ⚡ LIVE SEARCH AND FORM LOAD IMPLEMENTATION ⚡ -----------------

// 1. Live Filtering on Key Up
$('#item_search').on('keyup', filterItemTable);

// 2. Button Click: Filters table AND loads the exact match into the form
$('#searchItemButton').on('click', function () {
    const searchTerm = $('#item_search').val().trim().toLowerCase();

    // 1. Filter the table based on the search term (partial match)
    filterItemTable();

    if (searchTerm === '') {
        clearForm(); // Reset form if search is empty
        return;
    }

    // 2. Try to find an EXACT match to load into the form
    const exactMatchIndex = item_db.findIndex(item =>
        item.itemName.toLowerCase() === searchTerm
    );

    if (exactMatchIndex !== -1) {
        // Exact match found: Load into form and show feedback
        const foundItem = item_db[exactMatchIndex];
        loadItemIntoForm(foundItem, exactMatchIndex);

        Swal.fire({
            icon: "success",
            title: "Item Found!",
            text: `Details for ${foundItem.itemName} loaded for editing.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    } else {
        // No exact match found, but the table is already filtered (if partial matches exist)
        Swal.fire({
            icon: "info",
            title: "Table Filtered",
            text: `No exact item name match found. Table filtered by "${searchTerm}".`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

        // Clear form data but keep the filtered view
        $('#item_name').val('');
        $('#category').val('');
        $('#price').val('');
        $('#qty_in_stock').val('');
        $('#description').val('');
        selectedItemIndex = -1;
    }
});
