const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positionSchema = new Schema(
  {
    ticker: { type: String, required: true },
    lots: [
      {
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        _id: false,
      },
    ],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { toObject: { virtuals: true, getters: true } }
);

// cost of each seperate lot
positionSchema
  .path("lots")
  .schema.virtual("cost")
  .get(function () {
    return Math.round(this.quantity * this.price * 100) / 100;
  });

// cost of position
positionSchema.virtual("cost").get(function () {
  let totalCost = 0;
  this.lots.forEach((lot) => {
    totalCost += Math.round(lot.quantity * lot.price * 100) / 100;
  });
  return totalCost;
});

// total shares of a position
positionSchema.virtual("quantity").get(function () {
  let quantity = 0;
  this.lots.forEach((lot) => {
    quantity += lot.quantity;
  });
  return quantity;
});

module.exports = mongoose.model("Position", positionSchema);
