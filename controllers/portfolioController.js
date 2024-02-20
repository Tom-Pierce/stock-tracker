const { body, validationResult } = require("express-validator");
const Position = require("../models/Position");
const User = require("../models/User");

exports.position_post = [
  body("ticker")
    .trim()
    // validate that the stock exists
    .custom(async (ticker) => {
      // return bool to avoid error being caught in trycatch block
      let isValid = false;
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.API_KEY}`,
          { method: "GET" }
        );
        const data = await res.json();
        if (data.d !== null) {
          isValid = true;
        }
      } catch (error) {
        throw new Error("Server error, please try again");
      }
      if (!isValid) {
        throw new Error("Please provide a valid stock ticker");
      }
      return true;
    })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.errors.map((error) => {
        return error.msg;
      });

      return res.status(400).send(errArr);
    }

    try {
      const position = new Position({ ticker: req.body.ticker });
      await position.save();

      await User.findByIdAndUpdate(req.user.id, {
        $push: { positions: position },
      });

      res.status(201).json({ message: "position created" });
    } catch (err) {
      return next(err);
    }
  },
];
