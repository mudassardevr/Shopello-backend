const express = require("express");

const Cart = require("../models/Cart");

const fetchuser = require("../middleware/fetchuser");

const router = express.Router();

/// ROUTE 1 : ADD TO CART

router.post("/add", fetchuser, async (req, res) => {
  try {
    const { ProductId, quantity } = req.body;
    // console.log(req.body)


    // check existing cart item
    const existingItem = await Cart.findOne({
      user: req.user.id,
      product: ProductId,
    });

    // if already exists → increase quantity
    if (existingItem) {
      existingItem.quantity += quantity || 1;

      await existingItem.save();

      return res.json({
        success: true,
        cart: existingItem,
      });
    }

    // create new cart item
    const cart = await Cart.create({
      user: req.user.id,
      product: ProductId,
      quantity: quantity || 1,
    });

     res.status(201).json({
      success: true,
      cart
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET USER CART
router.get("/" , fetchuser , async(req, res) => {

    try {
        
   
    const cartItem = await Cart.find({
        user: req.user.id,
    }).populate("product")

    res.json({
        success:true,
        cartItem
    })
     } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Server Error" });
        
    }
})

// REMOVE CART ITEM
router.delete("/:id" , fetchuser , async(req, res) => {

  try {
    
  
  const cartItem = await Cart.findById(req.params.id)

  if(!cartItem){
    return res.status(404).json({
      success:false,
      message: "Cart item not found"
    })
  }

  await cartItem.deleteOne();

  res.json({
    success: true,
    message:"Item removed"
  })

  } catch (error) {
    console.log(error.message);
    return res.status(500).json("Server error")
    
  }

})

module.exports = router;
