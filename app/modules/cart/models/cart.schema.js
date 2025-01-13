const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, default: null, index: true, ref: "users" },
    productId: { type: Schema.Types.ObjectId, default: null, index: true, ref: "products" },
    quantity: { type: Number, default: 1 }
}, { 
    timestamps: true, versionKey: false
})

module.exports = mongoose.model("carts", CartSchema);