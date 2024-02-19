const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String },
  refreshToken: { type: String },
  accountType: { type: String, required: true },
  positions: [{ type: Schema.Types.ObjectId, ref: "Position" }],
});

userSchema.pre("save", function (next) {
  this.refreshToken = jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      // thirty days
      expiresIn: 60 * 60 * 24 * 30,
    }
  );
  next();
});

module.exports = mongoose.model("User", userSchema);
