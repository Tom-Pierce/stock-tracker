const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positionSchema = new Schema({
  lots: [{ type: Schema.Types.ObjectId, ref: "Lot" }],
});

module.exports = mongoose.model("Position", positionSchema);
