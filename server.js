require('dotenv').config({
  path: require("path").resolve(__dirname, ".env"),
});
const express = require('express');
const cors = require('cors');
const connectToMongoDB = require("./config/db");

const app = express();

connectToMongoDB()


// middleware
app.use(cors());
app.use(express.json());

//test route 
app.get("/" , (req , res)=> {
    res.send("e-commerse is  running");
})

//routes
app.use("/api/auth" , require("./routes/auth"))
app.use("/api/product", require("./routes/product"))
app.use("/api/cart" , require("./routes/cart"))
app.use("/api/order" , require("./routes/order"))
app.use("/api/wishlist", require("./routes/wishlist"))

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> {
    console.log(`server is running ${PORT}`);
})