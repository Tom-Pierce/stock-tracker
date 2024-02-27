const { body, validationResult } = require("express-validator");
const Position = require("../models/Position");

exports.lot_post = [
  body("quantity")
    .trim()
    .isInt()
    .withMessage("Quantity must be whole number")
    // must be positive
    .custom((value) => {
      if (value <= 0) throw new Error("Quantity must be greater than 0");
      return true;
    })
    .escape(),
  body("price")
    .trim()
    .isNumeric()
    .withMessage("Price must be numeric")
    .custom((value) => {
      if (value <= 0) throw new Error("Quantity must be greater than 0");
      return true;
    })
    .escape(),
  async (req, res, next) => {
    req.params.ticker = req.params.ticker.toUpperCase();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.errors.map((error) => {
        return error.msg;
      });
      return res.status(400).send(errArr);
    }
    const lot = {
      quantity: req.body.quantity,
      price: req.body.price,
    };

    const position = await Position.findOneAndUpdate(
      {
        user: req.user.id,
        ticker: req.params.ticker,
      },
      { $push: { lots: lot } },
      { new: true }
    );

    if (position === null) {
      return res
        .status(400)
        .json({ message: "User does not have a position with that stock" });
    }
    res.status(201).json({ message: "Lot added to position", position });
  },
];

exports.lot_delete = async (req, res, next) => {
  req.params.ticker = req.params.ticker.toUpperCase();

  try {
    const position = await Position.findOneAndUpdate(
      {
        user: req.user.id,
        ticker: req.params.ticker,
      },
      { $pull: { lots: { _id: req.params.lotId } } },
      { new: true }
    );

    if (position === null) {
      return res.status(404).json({ message: "position not found" });
    }
    res.status(200).json({ message: "lot removed", position });
  } catch (error) {
    console.error(error);
  }
};
