const express = require("express");

const Order = require("../models/Order");
const Cart = require("../models/Cart");

const fetchuser = require("../middleware/fetchuser");
const admin = require("../middleware/admin");

const router = express.Router();

// ROUTE 1:  PLACE ORDER
router.post("/place", fetchuser, async (req, res) => {
  try {
    // get cart items
    const cartItems = await Cart.find({
      user: req.user.id,
    }).populate("product");

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    //create order items
    const items = cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    // calculate total
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // create order
    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
    });

    // clear cart
    await Cart.deleteMany({
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// ROUTER 2 : GET USER ORDERS
router.get("/", fetchuser, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

//ROUTE 1 Admin : admin get all order see
router.get("/all", fetchuser, admin, async (req, res) => {
  try {
    
 
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders,
  });

   } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error" });
    
  }
});

//ROUTE 2 Admin : admin put  update order status
router.put('/:id', fetchuser, admin, async(req, res) => {

  try {
    
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status
    },
    {
      returnDocument: "after"
    }
  );
  
  res.json({
    success:true,
    order
  })
  } catch (error) {
      console.log(error.message);
    res.status(500).json({ error: "Server Error" });
    
  }

})
module.exports = router;
