const express = require("express");
const router = express.Router();
const adminController = require("../controller/allcontroller");
const { restrictedArea } = require("../middlewares/userAuth");

router.get("/home", restrictedArea, adminController.getprofile);
router.get("/", adminController.getloginn);
router.get("/sign", adminController.getsignup);

//sign  in
router.post("/signup", adminController.signup);
//login
router.post("/login", adminController.login);

// router.post("/fetchmoviedata", adminController.fetchmovie);
router.get("/search", restrictedArea, adminController.search);

// add to cart
router.post("/addToCart", restrictedArea, adminController.addToCart);

// add to cart page
router.get("/addList", restrictedArea, adminController.addListPage);

// delete from add list
router.delete(
  "/delete/:movieId",
  restrictedArea,
  adminController.deleteFromList
);

//logout
router.get("/logoutLink", restrictedArea, adminController.logout);
module.exports = router;
