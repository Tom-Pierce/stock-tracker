const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");

exports.local_signup = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    // Checks if email is taken
    .custom(async (value) => {
      const user = await User.findOne({ email: value }).exec();
      if (user) throw new Error("Email is already in use");
      return true;
    })
    .escape(),

  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    // Checks if password fits the minimum requirements
    .custom((value) => {
      const hasUppercase = /[A-Z]/.test(value);
      if (!hasUppercase) {
        throw new Error("Password must contain an uppercase letter");
      }
      return true;
    })
    .custom((value) => {
      const hasNumber = /\d/.test(value);

      if (!hasNumber) {
        throw new Error("Password must contain a number");
      }

      return true;
    })
    // Checks if passwords match
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords don't match");
      } else {
        return true;
      }
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

    // Hash password and create user
    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return err;
        }

        const user = new User({
          email: req.body.email,
          password: hashedPassword,
          accountType: "local",
        });

        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.ACCESS_TOKEN_MAX_AGE,
        });

        res
          .cookie("jwt", token, {
            withCredentials: true,
            httpOnly: true,
            maxAge: process.env.ACCESS_TOKEN_MAX_AGE * 1000,
          })
          .cookie("refreshToken", user.refreshToken, {
            withCredentials: true,
            httpOnly: true,
            maxAge: process.env.REFRESH_TOKEN_MAX_AGE * 1000,
          })
          .status(201)
          .json({ message: "user created" });
      });
    } catch (error) {
      return next(error);
    }
  },
];

exports.local_login = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send(info);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_MAX_AGE,
    });

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        // thirty days
        expiresIn: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
      }
    );

    user.refreshToken = refreshToken;

    await User.findByIdAndUpdate(user._id, {
      $set: { refreshToken: refreshToken },
    });

    res
      .cookie("jwt", token, {
        withCredentials: true,
        httpOnly: true,
        maxAge: process.env.ACCESS_TOKEN_MAX_AGE * 1000,
      })
      .cookie("refreshToken", user.refreshToken, {
        withCredentials: true,
        httpOnly: true,
        // thirty days
        maxAge: process.env.REFRESH_TOKEN_MAX_AGE * 1000,
      })

      .sendStatus(200);
  })(req, res, next);
};

exports.local_logout = async (req, res, next) => {
  // remove refreshToken from user and add to invalidatedRefreshTokens
  const userRefreshToken = await User.findById(req.user.id, "refreshToken");

  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      $push: { invalidatedRefreshTokens: userRefreshToken.refreshToken },
      $set: { refreshToken: "" },
    },
    { new: true }
  ).exec();

  if (user === null) {
    return res
      .status(500)
      .json({ message: "logout unsuccessful, please try again" });
  } else {
    res.status(200).json({ message: "succesfully logged out" });
  }
};

exports.refreshToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      try {
        if (err) {
          return res.status(401).json({
            message: "Authentication failed: Invalid token",
          });
        }
        const user = await User.findById(decoded._id);
        if (!user || user.refreshToken !== refreshToken) {
          throw new Error("Authentication failed: Invalid token");
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.ACCESS_TOKEN_MAX_AGE,
        });

        res
          .cookie("jwt", token, {
            withCredentials: true,
            httpOnly: true,
            maxAge: process.env.ACCESS_TOKEN_MAX_AGE * 1000,
          })
          .sendStatus(200);
      } catch (err) {
        return res.status(401).json({
          message: "Authentication failed: Invalid token",
        });
      }
    }
  );
};
