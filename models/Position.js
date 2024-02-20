const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positionSchema = new Schema({
  ticker: { type: String, required: true },
  lots: [
    {
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      _id: false,
    },
  ],
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

positionSchema
  .path("lots")
  .schema.virtual("value")
  .get(function () {
    return this.quantity * this.price;
  });

positionSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Position", positionSchema);
