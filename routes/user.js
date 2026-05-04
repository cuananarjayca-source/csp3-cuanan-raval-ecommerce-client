const express = require("express");
const userController = require("../controllers/user");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();


// USER LEVEL ACCESS
router.post("/register", userController.registerUser);

router.post("/login",userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.patch("/update-profile", verify, userController.updateProfile);

router.patch("/update-email", verify, userController.updateEmail);

router.patch("/update-password", verify, userController.updatePassword);


// ADMIN LEVEL ACCESS
router.get("/show-all-users", verify, verifyAdmin, userController.getAllUsers);

router.get("/show-user/:id", verify, verifyAdmin, userController.getUserById);

router.patch("/:id/promote-admin", verify, verifyAdmin, userController.promoteUserToAdmin);

router.patch("/:id/demote-admin", verify, verifyAdmin, userController.demoteUserFromAdmin);

router.patch("/deactivate-user/:id", verify, verifyAdmin, userController.deactivateUserAsAdmin);

router.patch("/reactivate-user/:id", verify, verifyAdmin, userController.activateUserAsAdmin);


module.exports = router;