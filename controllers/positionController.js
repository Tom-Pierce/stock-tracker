const { body, validationResult } = require("express-validator");
const Position = require("../models/Position");
const User = require("../models/User");

exports.positions_get = async (req, res, next) => {
  try {
    const positions = await Position.find({ user: req.user.id }).exec();

    const valuedPositions = await Promise.all(
      positions.map(async (position) => {
        const stockRes = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${position.ticker}&token=${process.env.API_KEY}`,
          { method: "GET" }
        );

        const stockData = await stockRes.json();

        return {
          ...position.toObject(),
          value: Math.round(stockData.c * position.quantity * 100) / 100,
          currentPrice: stockData.c,
        };
      })
    );

    res.status(200).json({ positions: valuedPositions });
  } catch (err) {
    return next(err);
  }
};

exports.position_get = async (req, res, next) => {
  req.params.ticker = req.params.ticker.toUpperCase();
  try {
    const position = await Position.findOne({
      user: req.user.id,
      ticker: req.params.ticker,
    }).exec();

    if (!position) {
      return res
        .status(404)
        .json({ message: "User does not have a position for that stock" });
    }

    const stockRes = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${req.params.ticker}&token=${process.env.API_KEY}`,
      { method: "GET" }
    );

    const stockData = await stockRes.json();

    res.status(200).send({
      position: {
        ...position.toObject(),
        value: Math.round(stockData.c * position.quantity * 100) / 100,
        currentPrice: stockData.c,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.position_post = [
  body("ticker")
    .trim()
    .isString()
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
    req.body.ticker = req.body.ticker.toUpperCase();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.errors.map((error) => {
        return error.msg;
      });

      return res.status(400).send(errArr);
    }

    try {
      const isDuplicate = await Position.findOne({
        user: req.user.id,
        ticker: req.body.ticker,
      }).exec();

      if (isDuplicate) {
        return res.status(409).json({
          message: "Cannot create duplicate positions of the same stock",
        });
      }

      const position = new Position({
        ticker: req.body.ticker,
        user: req.user.id,
      });
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
