// IMPORTS
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");

// Google OAuth
const passport = require('passport');
const session = require('express-session');
require('./passport');

// ROUTE IMPORTS
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const paymentRoutes = require("./routes/payment");
const reviewRoutes = require("./routes/review");
const stockRoutes = require("./routes/stock");
const cors = require("cors");

// APP INITIALIZATION 
const app = express();

//DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_STRING);
let db = mongoose.connection;
db.on("error", (err) => console.error("Connection error:", err));
db.once("open", () => console.log("Now connected to MongoDB Atlas."));

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// ROUTES
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/review", reviewRoutes);
app.use("/stocks", stockRoutes);



// SERVER START
if(require.main === module) {
	app.listen(process.env.PORT, () => console.log(`Server running at port ${process.env.PORT}`));
}

module.exports = {app, mongoose};