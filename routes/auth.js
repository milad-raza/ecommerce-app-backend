const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { userValidation } = require("../middlewares/validator");

// REGISTER
router.post("/register", async (req, res) => {
  const error = userValidation(req.body);
  if (error.error) {
    return res
      .status(400)
      .send({ error: true, message: error.error.details[0].message });
  }

  const userNameExist = await User.findOne({ username: req.body.username });
  const emailExist = await User.findOne({ email: req.body.email });
  if (userNameExist || emailExist) {
    return res
      .status(400)
      .send({ error: true, message: "User Already Exist." });
  }

  const newUser = new User({
    username: req.body?.username,
    email: req.body?.email,
    password: CryptoJS.AES.encrypt(
      req.body?.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    const { password, ...others } = savedUser._doc;
    res.status(200).json({ ...others });

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json({ error: "Username or password is wrong!" });

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body?.password &&
      res.status(401).json({ error: "Username or password is wrong!" });

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

module.exports = router;
