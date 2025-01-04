const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, default: null, ref: "users", index: true },
    orderId: { type: Schema.Types.ObjectId, default: null, ref: "orders", index: true },
    amount: { type: Number, default: null, index: true },
    paymentMode: { type: String, default: "Online", enum: [ "Online", "COD"  ], index: true },
    transactionId: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    status: { type: String, default: "Pending", enum: [ "Pending", "Successful", "Failed", "Refunded" ], index: true },
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("transactions", TransactionSchema);