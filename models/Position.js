const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positionSchema = new Schema({
  ticker: { type: String, required: true },
  lots: [{ type: Schema.Types.ObjectId, ref: "Lot" }],
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Position", positionSchema);
