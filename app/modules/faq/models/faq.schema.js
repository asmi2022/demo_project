const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const faqSchema = new Schema({
    question: { type: String, default: "", index: true },
    answer: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false, index: true },
    status: { type: String, default: "Inactive", enum: [ "Active" , "Inactive" ], index: true }
}, {
    timestamps: true, versionKey: false
});

module.exports = mongoose.model("faqs", faqSchema);