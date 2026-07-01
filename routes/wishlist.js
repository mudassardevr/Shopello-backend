const express = require("express");

const Wishlist = require("../models/Wishlist");

const fetchuser = require("../middleware/fetchuser");
// const Product = require('../models/Product');

const router = express.Router();

///ROUTE 1 : add wishlist
router.post("/add", fetchuser, async (req, res) => {
    console.log("req.user =", req.user);
  try {


    const { productId } = req.body;

    const exist = await Wishlist.findOne({
      user: req.user.id,
      product: productId,
    });

    if(exist) {
      return res.json({
        success: false,
        message: "Already In Wishlist",
      });
    }

    const wishlistItem = await Wishlist.create({
      user: req.user.id,
      product: productId,
    });

    res.json({
      success: true,
      wishlistItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ROUTE 2: getting all wishlist
router.get("/", fetchuser, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user.id,
    }).populate("product");

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ROUTE 3 : Delete wishlist
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Removed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
