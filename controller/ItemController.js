import { item_db } from "../db/db.js";
import ItemModel from "../model/ItemModel.js";

let selectedItemIndex = -1;


// Load item table
export function loadItemTable(dataToLoad = item_db) {
    $('#item_table').empty();
    dataToLoad.forEach((item, index) => {
        $('#item_table').append(`
            <tr>
                <td>${item.item_id}</td>
                <td>${item.itemName}</td>
                <td>${item.category}</td>
                <td>${item.price}</td>
                <td>${item.qtyInStock}</td>
                <td>${item.description}</td>
            </tr>
        `);
    });
}

// Generate next ID
function generateNextId() {
    $('#item_id').val('I' + String(item_db.length + 1).padStart(3, 0));
    selectedItemIndex = -1;
}

// Clear form
function clearForm() {
    generateNextId();
    $('#item_search').val('');
    $('#item_name, #category, #price, #qty_in_stock, #description').val('');
    selectedItemIndex = -1;
    loadItemTable();
}

// input  eka Validate karanawa
function isValidInput(itemName, category, price, qtyInStock, description) {
    if (!itemName.trim() || !category.trim() || !description.trim()) return false;
    if (isNaN(price) || isNaN(qtyInStock) || price < 0 || qtyInStock < 0) return false;
    return true;
}

// Load item
function loadItemIntoForm(item, index) {
    $('#item_id').val(item.item_id);
    $('#item_name').val(item.itemName);
    $('#category').val(item.category);
    $('#price').val(item.price);
    $('#qty_in_stock').val(item.qtyInStock);
    $('#description').val(item.description);
    selectedItemIndex = index;
}

//  item table thoranawa
function filterItemTable() {
    const searchTerm = $('#item_search').val().trim().toLowerCase();
    if (!searchTerm) {
        clearForm();
        return;
    }

    const filtered = item_db.filter(i => i.itemName.toLowerCase().includes(searchTerm));
    loadItemTable(filtered);
}

// ----------------- CRUD -----------------

// CREATE
$('#item_register').on('click', function () {
    const item_id = $('#item_id').val();
    const itemName = $('#item_name').val();
    const category = $('#category').val();
    const price = Number($('#price').val());
    const qtyInStock = Number($('#qty_in_stock').val());
    const description = $('#description').val();

    if (!isValidInput(itemName, category, price, qtyInStock, description)) {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Invalid input. All fields required, numbers must be valid.' });
        return;
    }

    item_db.push(new ItemModel(item_id, itemName, category, price, qtyInStock, description));
    loadItemTable();
    Swal.fire({ icon: 'success', title: 'Item Added!' });


    import("../controller/OrderController.js").then(module => {
        module.loadItemIds();
    });

    clearForm();
});

// UPDATE
$('#item_update').on('click', function () {
    if (selectedItemIndex === -1) { Swal.fire({ icon: 'warning', title: 'Select an item!' }); return; }

    const item_id = $('#item_id').val();
    const itemName = $('#item_name').val();
    const category = $('#category').val();
    const price = Number($('#price').val());
    const qtyInStock = Number($('#qty_in_stock').val());
    const description = $('#description').val();

    if (!isValidInput(itemName, category, price, qtyInStock, description)) {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Invalid input.' });
        return;
    }

    item_db[selectedItemIndex] = new ItemModel(item_id, itemName, category, price, qtyInStock, description);
    loadItemTable();
    Swal.fire({ icon: 'success', title: 'Item Updated!' });

    import("../controller/OrderController.js").then(module => {
        module.loadItemIds();
    });

    clearForm();
});

// DELETE
$('#item_delete').on('click', function () {
    if (selectedItemIndex === -1) { Swal.fire({ icon: 'warning', title: 'Select an item!' }); return; }

    Swal.fire({
        title: 'Are you sure?',
        text: 'You cannot undo this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then(result => {
        if (result.isConfirmed) {
            item_db.splice(selectedItemIndex, 1);
            loadItemTable();
            Swal.fire({ icon: 'success', title: 'Item Deleted!' });

            import("../controller/OrderController.js").then(module => {
                module.loadItemIds();
            });

            clearForm();
        }
    });
});

// READ - select item from table
$('#item_table').on('click', 'tr', function () {
    const index = $(this).index();
    if (item_db[index]) loadItemIntoForm(item_db[index], index);
});

// Search
$('#item_search').on('keyup', filterItemTable);
$('#searchItemButton').on('click', filterItemTable);

// CLEAR
$('#item_cancel').on('click', clearForm);


$(document).ready(function () {
    generateNextId();
    loadItemTable();
});
