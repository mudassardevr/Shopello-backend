const jwt = require("jsonwebtoken");

const fetchuser = (req, res, next) => {

  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({   success: false, message: "Access denied" });
  }

  try {
     // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);


     // save user info
    req.user = decoded.user;
    next();

  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = fetchuser;
