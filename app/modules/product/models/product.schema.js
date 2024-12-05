const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {type: String, default: "", index: true},
    details: { type: String, default: "" },
    isDeleted: { type: Boolean, default: "false", index: true },
    status: { type: String, default: "Inactive", enum: [ "Active", "Inactive" ], index: true }
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("products", ProductSchema);