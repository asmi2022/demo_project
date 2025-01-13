const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, default: null, ref: "users", index: true },
    orderId: { type: Schema.Types.ObjectId, default: null, ref: "orders", index: true },
    transactionId: { type: String, default: "", index: true },
    amount: { type: Number, default: 0, index: true },
    paymentMode: { type: String, default: "Online", enum: [ "Online", "COD", "Pay Later" ], index: true },
    paymentMethod: { type: String, default: "" },
    paymentStatus: { type: String, default: "Pending", enum: [ "Pending", "Paid", "Failed", "Canceled", "Refunded" ], index: true }
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("transactions", TransactionSchema);