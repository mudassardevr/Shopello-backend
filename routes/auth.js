const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");

//ROUTER 1 : REGISTER API  ;- validation || confirm password || check if user exist ||hash password || create user || payload || generate token || success with token
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // VALIDATION
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All field require" });
    }

    // check password matched with confirmPassword
    if (password != confirmPassword) {
      return res.status(400).json({ error: "Password do not match" });
    }

    // checking if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "user already exist" });
    }

    //HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //creating user
    user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    console.log("User document:", user);

    // jwt payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    console.log("Payload:", payload);

    // generating token
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    console.log("Token:", token);

    //success token
    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Intervel Server Error" });
  }
});

// ROUTE 2: LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validation
    if (!email || !password) {
      return res.status(400).json({ error: "All Fields required " });
    }

    //checking user is there or not if not there show error
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid User Not Available" });
    }

    //checking password match with userpassword
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Invalid Credentails" });
    }

    //payload
    const payload = {
      user: {
        id: user.id,
        isAdmin : user.isAdmin
      },
    };

    //generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET , {expiresIn : "7d"});

    //success
    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Intervel Server Error" });
  }
});

// // GET LOGGED-IN USER
// router.get("/me", fetchuser, async (req, res) => {
//   try {
//     let user = await User.findById(req.user.id).select("-password");

//     res.json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Intervel Server Error" });
//   }
// });


// ROUTE 3 : Get User Profile
router.get("/profile", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;
