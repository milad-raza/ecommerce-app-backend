const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const router = require("express").Router();

//UPDATE_USER
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body?.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username: req.body?.username,
        email: req.body?.email,
        password: req.body?.password,
      },
      { new: true }
    );
    const { password, ...others } = updateUser._doc;
    res.status(200).json({ ...others });
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE_USER
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User has been deleted!" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET_USER_STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET_USER
router.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others });
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET_ALL_USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const queryForNew = req.query.new;
  try {
    const users = queryForNew
      ? await User.find().sort({ _id: -1 }).limit(10)
      : await User.find();

    const filteredUsers = users.map((data) => {
      let { password, ...others } = data?._doc;
      return others;
    });

    res.status(200).json(filteredUsers);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
