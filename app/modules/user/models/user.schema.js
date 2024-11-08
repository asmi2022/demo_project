const mongoose = require("mongoose");
const Schema  = mongoose.Schema;
const paginate = require("mongoose-aggregate-paginate-v2");

const UserSchema = new Schema({
    role: { type: Schema.Types.ObjectId, default: null, ref: "roles", index: true },
    profilePic: { type: String, default: "" },
    name: { type: String, default: "", index: true },
    email: { type: String, default: "", index: true },
    password: { type: String, default: ""},
    otp: { type: String, default: "" },
    exp_otp: { type: Date, default: null },
    status: { type: String, default: "Inactive", enum: ["Active", "Inactive"], index: true },
    isDeleted: { type: Boolean, default: false, index: true }
}, {
    timestamps: true, versionKey: false
});

UserSchema.plugin(paginate);

module.exports = mongoose.model("users", UserSchema);