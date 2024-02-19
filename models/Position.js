const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positionSchema = new Schema({
  lots: [{ type: ObjectId, ref: "Lot" }],
});

module.exports = mongoose.model("Position", positionSchema);
