const express = require("express");
const userController = require("../controllers/user");
const { verify, verifyAdmin, isLoggedIn } = require("../auth");
const router = express.Router();
const passport = require('passport');


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


// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // This forces the Google login screen to appear
  })
);

// Call back route
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/users/failed',
    }),
    function (req, res) {
        res.redirect('/users/success')

    }
);

// Failed route if the authentication fails
router.get("/failed", (req, res) => {
    console.log('User is not authenticated');
    res.send("Failed")
})

// Success route if the authentication is successful
router.get("/success",isLoggedIn, (req, res) => {
    console.log('You are logged in');
    res.send(`Welcome ${req.user.displayName}`)
})

// Route that logs out the authenticated user  
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error while destroying session:', err);
        } else {
            req.logout(() => {
                console.log('You are logged out');
                res.redirect('/');
            });
        }
    });
});

module.exports = router;