const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lotSchema = new Schema({
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

lotSchema.virtual("value").get(() => {
  return this.quantity * this.price;
});

module.exports = mongoose.model("Lot", lotSchema);
