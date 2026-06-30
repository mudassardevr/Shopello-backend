const express = require("express");

const Product = require("../models/Product");
const upload = require("../middleware/upload");

// Admin middleware & Cloudinary
const fetchuser = require("../middleware/fetchuser");
const admin = require("../middleware/admin");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const router = express.Router();


//ROUTE 1: combineing too add
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce-products",
      },
      (error, result) => {
        if (error) {
          console.dir(error, { depth: null });

          return reject(error);
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

router.post(
  "/add",
  fetchuser,
  admin,
  upload.array("images", 5),
  async (req, res) => {
    try {
      let imageUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer);
          imageUrls.push(result.secure_url);
        }
      } else if (req.body.imageUrls) {
        imageUrls = req.body.imageUrls
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean);
      }

      if (imageUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please upload images or provide image URLs.",
        });
      }

      const product = await Product.create({
        title: req.body.title,
        description: req.body.description,
        image: imageUrls,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
      });

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const product = await Product.find();

    res.json({
      success: true,
      product,
    });
  } catch (error) {
   
    res.status(500).json({ error: "Server Error" });
  }
});

//ROUTE search :
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    const products = await Product.find({
      $or: [
        {
          title: {
            $regex: q,
            $options: "i",
          },
        },
        {
          category: {
            $regex: q,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

//ROUTE : CATEGORY PRODUCTS
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: {
        $regex: req.params.category,
        $options: "i",
      },
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// ROUTE 2 :GET SINGLE PRODUCT DETAILS BY CLICK
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// ROUTE 3 :UPDATE PRODUCT
router.put("/:id", fetchuser, admin, async (req, res) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!updateProduct) {
      return res.status(404).json({ error: "PRODUCT NOT FOUND" });
    }

    res.json({
      success: true,
      updateProduct,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

//ROUTE 4 : DELETE PRODUCT
router.delete("/:id", fetchuser, admin, async (req, res) => {
  try {
    const deleteProduct = await Product.findByIdAndDelete(
      req.params.id,
      req.body,
    );

    if (!deleteProduct) {
      return res.status(404).json({ error: "product not found" });
    }

    res.json({
      success: true,
      message: "product delete",
      deleteProduct,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
