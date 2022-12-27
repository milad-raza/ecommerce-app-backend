const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const Product = require("../models/Product");
const router = require("express").Router();

// CREATE_PRODUCT
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const saveProduct = await newProduct.save();
    res.status(200).json(saveProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE_PRODUCT
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body?.title,
        description: req.body?.description,
        image: req?.body?.image,
        price: req?.body?.price,
        color: req?.body?.color,
        categories: req?.body?.categories,
      },
      { new: true }
    );
    res.status(200).json(updateProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE_PRODUCT
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Product has been deleted!" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET_PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET_ALL_PRODUCTS
router.get("/", async (req, res) => {
  const queryForNew = req.query.new;
  const queryForCategory = req.query.category;
  try {
    let products;
    if (queryForNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(10);
    } else if (queryForCategory) {
      products = await Product.find({ categories: { $in: [queryForCategory] } })
        .sort({ createdAt: -1 })
        .limit(10);
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
