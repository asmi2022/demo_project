const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    country: { type: String, default: "", index: true },
    state: { type: String, default: "", index: true },
    city: { type: String, default: "", index: true },
    pincode: { type: String, default: "", index: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" }
}, {
    versionKey: false
});

const ProductsSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, default: null, ref: "products" },
    price: { type: Number, default: 0 },
    itemPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: null }
}, {
    versionKey: false
});

const OrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, default: null, index: true, ref: "users" },
    orderNumber: { type: String, default: "", index: true },
    address: { type: AddressSchema, default: null },
    products: { type: [ProductsSchema], default: [] },
    totalPrice: { type: Number, default: 0, index: true },
    paymentMode: { type: String, default: "Online", enum: [ "Online", "COD", "Pay Later" ], index: true },
    paymentStatus: { type: String, default: "Pending", enum: [ "Pending", "Paid", "Failed", "Canceled", "Refunded" ], index: true },
    orderStatus: { type: String, default: "Pending", enum: [ "Pending", "Placed", "Canceled", "Delivered", "Shipped", "Dispatched", "Returned" ], index: true },
    refunded: { type: Boolean, default: false },
    refundedAmount: { type: Number, default: 0 }
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("orders", OrderSchema);