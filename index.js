const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");

//const path = require("path");

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 4500;

const adminRouter = require("./route/allroute");
//const router = require("./route/allroute");
//database connection mongo
require("./config/config").connect();

app.set("view engine", "ejs");
//app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
//routes
app.use("/", adminRouter);
//app.use(router);
//server initiated
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
