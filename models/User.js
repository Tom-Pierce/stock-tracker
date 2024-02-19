const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String },
  accountType: { type: String, required: true },
  positions: [{ type: Schema.Types.ObjectId, ref: "Position" }],
});

module.exports = mongoose.model("User", userSchema);
