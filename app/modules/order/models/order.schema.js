const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    pinCode: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" }
}, {
    timestamps: true, versionKey: false
});

const ItemSchema = new Schema({
    name: { type: String, default: "" },
    itemId: { type: Schema.Types.ObjectId, default: null, ref: "products" },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
}, {
    timestamps: true, versionKey: false 
});

const OrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, default: null, ref: "users", index: true },
    items: {type: [ItemSchema], default: []},
    deliveryAddress: { type: AddressSchema, default: null },
    orderId: { type: String, default: "", index: true },
    orderStatus: { type: String, default: "Pending", enum: [ "Pending", "Placed", "Dispatched", "Shipped", "Out For Delivery", "Delivered", "Canceled", "Delayed" ], index: true },
    paymentStatus: { type: String, default: "Pending", enum: [ "Pending", "Paid", "Failed", "Processing" ], index: true },
    totalAmount: { type: Number, default: 0, index: true }
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("orders", OrderSchema);