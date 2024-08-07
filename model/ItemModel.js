export default class ItemModel {
    /**
     * @param {string} item_id - The unique identifier for the item (e.g., I001).
     * @param {string} itemName - The name of the item.
     * @param {string} category - The category of the item (e.g., Dairy, Snacks).
     * @param {number} price - The price of the item.
     * @param {number} qtyInStock - The quantity currently in stock.
     * @param {string} description - A brief description of the item.
     */
    constructor(item_id, itemName, category, price, qtyInStock, description) {
        this.item_id = item_id;
        this.itemName = itemName;
        this.category = category;
        this.price = price;
        this.qtyInStock = qtyInStock;
        this.description = description;

    }
}