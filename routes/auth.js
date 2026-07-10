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
      return res.status(400).json({ 
        success:false,
        message : "All field require" });
    }

    // check password matched with confirmPassword
    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password do not match" });
    }

    // checking if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success:false,
        message: "Email is already registered" });
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

    // jwt payload
    const payload = {
      user: {
        id: user.id,
      },
    };


    // generating token
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    console.log("Token:", token);

    //success token
    res.status(201).json({
      success: true,
      message: "Account created Successfully",
      token,
       user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
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
      return res.status(400).json({
        success : false,
        message : "Email and Password Required"
      });
    }

    //checking user is there or not if not there show error
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "No account found with this email." });
    }

    //checking password match with userpassword
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Incorrect Password" });
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
    res.status(200).json({
      success: true,
      message: "Welcome Back",
      token,
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        isAdmin:user.isAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success:false,
      message: "Intervel Server Error" });
  }
});


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
