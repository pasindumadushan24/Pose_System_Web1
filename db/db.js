// Database Arrays (Consistent with Model properties)
export const customer_db = [
    { id: 'C001', fname: 'Pasindu', lname: 'Madushan', email: 'pasindu24hh@gmail.com', phone: '0763445366', address: 'Bandaragama' },
    { id: 'C002', fname: 'Ashan', lname: 'Peris', email: 'ashan@gmail.com', phone: '0745567888', address: 'Piliyandala' }
];

export const item_db = [
    { item_id: 'I001', itemName: 'Brake Pad', category: 'car', price: 2500, qtyInStock: 10, description: 'Nissan car' },
    { item_id: 'I002', itemName: 'Brake Osher', category: 'lorry', price: 450, qtyInStock: 20, description: 'Isuzu lorry' }
];

export const order_db = []; // This will store instances of OrderModel