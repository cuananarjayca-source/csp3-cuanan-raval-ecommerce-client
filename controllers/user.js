const User = require("../models/User");
const { errorHandler } = require("../auth");
const bcrypt = require("bcryptjs");
const auth = require("../auth");

// USER LEVEL ACCESS
module.exports.registerUser = (req, res) => {
	const { firstName, lastName, email, password, mobileNo } = req.body;

	if (!firstName || firstName.trim() === "") {
		return res.status(400).send({ message: "First name is required" });
	}
	if (!lastName || lastName.trim() === "") {
		return res.status(400).send({ message: "Last name is required" });
	}
	if (!email.includes("@")) {
		return res.status(400).send({ message: "Invalid email format" });
	}
	if (password.length < 8) {
		return res.status(400).send({ message: "Password must be at least 8 characters" });
	}
	if (!mobileNo || mobileNo.length !== 11) {
		return res.status(400).send({ message: "Invalid mobile number must be 11 digits" });
	}

	return User.findOne({ email: req.body.email })
		.then((existingUser) => {
			if (existingUser) {
				return res.status(409).send({ message: "Email already registered" });
			}

			const newUser = new User({
				firstName,
				lastName,
				email,
				password: bcrypt.hashSync(password, 10),
				mobileNo,
				isAdmin: false
			});

			return newUser.save()
				.then((result) => res.status(201).send({ message: "User registered successfully!" }));
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.loginUser = (req, res) => {
	const { email, password } = req.body;

	if (!email.includes("@")) {
		return res.status(400).send({ message: "Invalid email format" });
	}

	return User.findOne({ email })
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "Email not found" });
			}
			if (!result.isActive) {
				return res.status(403).send({ message: "Account is deactivated. Please contact support." });
			}

			const isPasswordCorrect = bcrypt.compareSync(password, result.password);

			if (!isPasswordCorrect) {
				return res.status(401).send({ message: "Incorrect email or password" });
			}

			return res.status(200).send({
				message: "User logged in successfully",
				access: auth.createAccessToken(result)
			});
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.getProfile = (req, res) => {
	return User.findById(req.user.id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			if (!result.isActive) {
				return res.status(403).send({ message: "Account is deactivated. Please contact support." });
			}
			result.password = "";
			return res.status(200).send(result);
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.updateProfile = (req, res) => {
	const { firstName, lastName, mobileNo } = req.body;

	return User.findById(req.user.id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			if (!result.isActive) {
				return res.status(403).send({ message: "Account is deactivated. Please contact support." });
			}

			result.firstName = firstName;
			result.lastName = lastName;
			result.mobileNo = mobileNo;

			return result.save()
				.then((updated) => res.status(200).send({
					message: "User profile updated successfully",
					result: updated
				}));
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.updateEmail = (req, res) => {
	const { email } = req.body;

	if (!email.includes("@")) {
		return res.status(400).send({ message: "Incorrect email format" });
	}

	return User.findById(req.user.id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			if (!result.isActive) {
				return res.status(403).send({ message: "Account is deactivated. Please contact support." });
			}

			return User.findOne({ email })
				.then((existing) => {
					if (existing) {
						return res.status(409).send({ message: "Email already in use" });
					}

					result.email = email;

					return result.save()
						.then(() => res.status(200).send({ message: "Email updated successfully" }));
				});
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.updatePassword = (req, res) => {
	const { newPassword } = req.body;

	if (!newPassword || newPassword.length < 8) {
		return res.status(400).send({ message: "Password must be at least 8 characters" });
	}

	return User.findById(req.user.id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			if (!result.isActive) {
				return res.status(403).send({ message: "Account is deactivated. Please contact support." });
			}

			result.password = bcrypt.hashSync(newPassword, 10);

			return result.save()
				.then(() => res.status(200).send({ message: "Password reset successfully" }));
		})
		.catch((err) => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS
module.exports.getAllUsers = (req, res) => {
	return User.find()
		.then((result) => {
			if (result.length === 0) {
				return res.status(404).send({ message: "No users found" });
			}
			return res.status(200).send({
				message: "Users found",
				result
			});
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.getUserById = (req, res) => {
	return User.findById(req.params.id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "No user found" });
			}
			return res.status(200).send({
				message: "User found",
				result
			});
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.promoteUserToAdmin = (req, res) => {
	return User.findByIdAndUpdate(req.params.id,
		{ isAdmin: true },
		{ new: true }
	)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			return res.status(200).send({
				message: "User promoted to admin successfully",
				updatedUser: result
			});
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.demoteUserFromAdmin = (req, res) => {
	return User.findByIdAndUpdate(req.params.id,
		{ isAdmin: false },
		{ new: true }
	)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			return res.status(200).send({
				message: "Admin demoted to regular user successfully",
				user: result
			});
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.deactivateUserAsAdmin = (req, res) => {
	return User.findById(req.params.id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			if (!result.isActive) {
				return res.status(400).send({ message: "User is already deactivated" });
			}

			result.isActive = false;

			return result.save()
				.then(() => res.status(200).send({ message: "User profile deactivated" }));
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.activateUserAsAdmin = (req, res) => {
	return User.findById(req.params.id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ message: "User not found" });
			}
			if (result.isActive) {
				return res.status(400).send({ message: "User is already active" });
			}

			result.isActive = true;

			return result.save()
				.then(() => res.status(200).send({ message: "User profile reactivated" }));
		})
		.catch((err) => errorHandler(err, req, res));
};