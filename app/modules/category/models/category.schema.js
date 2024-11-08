const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paginate = require("mongoose-aggregate-paginate-v2");

const CategorySchema = new Schema({
    title: { type: String, default: "", index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    status: { type: String, default: "Inactive", enum: [ "Active", "Inactive" ], index: true },
    parentCat: { type: Schema.Types.ObjectId, default: null, ref: "categories", index: true }
}, {
    timestamps: true, versionKey: false
});

CategorySchema.plugin(paginate);

module.exports = mongoose.model("categories", CategorySchema);