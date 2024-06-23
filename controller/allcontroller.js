const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/admin");
const axios = require("axios");
const { render } = require("ejs");
// Controller for the Supervisor Dashboard
exports.getprofile = async (req, res) => {
  res.render("profile", {
    movies: [],
    error:
      "Explore movies easily..... Search for favorites and add them to your playlist. Enjoy browsing!",
  });
};
exports.getloginn = async (req, res) => {
  res.render("login");
};
exports.getsignup = async (req, res) => {
  res.render("signin");
};

//signin activity
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Exist",
      });
    }
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "error in hashing password",
      });
    }
    const user = await Admin.create({
      username,
      email,
      password: hashPassword,
    });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registered",
    });
  }
};

//login activity
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Admin.findOne({ email });
    if (!user) {
      return res.render("error404");
    }
    const payload = {
      email: user.email,
      id: user._id,
      username: user.username,
    };
    if (await bcrypt.compare(password, user.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (Date.now() >= decodedToken.exp * 1000) {
        // Token is expired, redirect to login page
        return res.redirect("/home");
      }
      user = user.toObject();
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      // console.log(token);
      res.cookie("token", token, options);
      return res.redirect("/home");
    } else {
      return res.render("error404");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "login failure",
    });
  }
};

//fetching movie
exports.search = async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).send("Title is required");
  }
  const key = process.env.OMDB_API_KEY;
  const response = await axios.get(
    `http://www.omdbapi.com/?s=${title}&apikey=${key}`
  );
  // console.log(response.data);
  if (response.data && response.data.Search) {
    const movies = response.data.Search;
    res.render("profile", { movies });
  } else {
    res.render("profile", { movies: [], error: "not Found" }); // Sending an empty array to indicate no movies found
  }
};

// add to cart
exports.addToCart = async (req, res) => {
  try {
    const { title, img } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await Admin.findById(userId);
    const existingCartItem = user.cart.find((item) => item.title === title);

    if (existingCartItem) {
      console.log("already h");
    } else {
      user.cart.push({ title: title, img: img });
    }
    await user.save();
    res.json({ message: "Movie added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// add to list page
exports.addListPage = async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const user = await Admin.findById(userId);

  // const movies = await User.findById(userId).select("cart.movie");
  const cartWithMovies = [];
  for (const cartItem of user.cart) {
    // Assuming each cart item has `title` and `img` fields for movie details
    cartWithMovies.push({
      _id:cartItem._id,
      title: cartItem.title,
      img: cartItem.img,
    });
  }
  res.render("addToList", { user, cartWithMovies });
};
exports.deleteFromList = async (req, res) => {
  try {
    const { movieId } = req.params;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await Admin.findById(userId);

    user.cart = user.cart.filter(
      (cartItem) => cartItem._id.toString() !== movieId
    );

    await user.save();
    res.send({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).send({
      error: "An error occurred while deleting the movie from the cart",
    });
  }
};

// logout
exports.logout = (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie("token");
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "logout failure",
    });
  }
};
