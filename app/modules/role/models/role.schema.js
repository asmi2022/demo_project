const mongoose = require("mongoose");
const Schema  = mongoose.Schema;

const RoleSchema = new Schema({
    type: { type: String, default: "backend", enum: [ "backend", "frontend" ], index: true },
    role: { type: String, default: "", index: true },
    display: { type: String, default: ""},
    isDeleted: { type: Boolean, default: false, index: true },
    status: { type: String, default: "Inactive", index: true, enum: ["Active", "Inactive"] }
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("roles", RoleSchema);