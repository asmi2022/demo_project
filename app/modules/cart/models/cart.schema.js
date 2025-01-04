const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, default: null, ref: "users", index: true },
    productId: { type: Schema.Types.ObjectId, default: null, ref: "products", index: true },
    quantity: { type: Number, default: 1 }
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("carts", CartSchema);