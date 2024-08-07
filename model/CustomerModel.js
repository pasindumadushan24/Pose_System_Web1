export default class CustomerModel {
    /**
     * @param {string} id - The unique identifier for the customer (e.g., C001).
     * @param {string} fname - The customer's first name.
     * @param {string} lname - The customer's last name.
     * @param {string} email - The customer's email address.
     * @param {string} phone - The customer's phone number.
     * @param {string} address - The customer's address.
     */
    constructor(id, fname, lname, email, phone, address) {
        this.id = id;
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}