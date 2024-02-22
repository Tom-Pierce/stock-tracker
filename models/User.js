const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String },
  refreshToken: { type: String },
  accountType: { type: String, required: true },
});

userSchema.pre("save", function (next) {
  this.refreshToken = jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      // thirty days
      expiresIn: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
    }
  );
  next();
});

module.exports = mongoose.model("User", userSchema);
