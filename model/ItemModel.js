
export default class ItemModel {
    constructor(item_id, itemName, category, price, qtyInStock, description) {
        this.item_id = item_id;
        this.itemName = itemName;
        this.category = category;
        this.price = price;
        this.qtyInStock = qtyInStock;
        this.description = description;
    }
}
