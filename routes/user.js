const express = require("express");
const bcrypt = require("bcrypt"); //hash password before saving it to DB
const fs = require("fs"); // fs is node's inbuilt file system module used to manage files

const usersDb = require("../database/db.json"); //import existing data from db.json file
const authenticate = require("../middleware/authenticate");
const generateJWT = require("../utils/generateJWT");
const router = express.Router();

// user registration / sign-up
router.post("/sign-up", async (req, res) => {
	const { name, email, password } = req.body;

	try {
		const user = await usersDb.filter((user) => user.email === email);

		if (user.length > 0) {
			return res.status(400).json({ error: "User already exist!" });
		}

		const salt = await bcrypt.genSalt(10);
		const bcryptPassword = await bcrypt.hash(password, salt);
		let newUser = {
			id: usersDb.length,
			name: name,
			email: email,
			password: bcryptPassword,
		};
		usersDb.push(newUser);
		// we save the updated array to db.json by using fs module of node
		await fs.writeFileSync("./database/db.json", JSON.stringify(usersDb));

		/* Once the user registration is done successfully,
    generate a jsonwebtoken and send it back to user.
    This token will be used for accessing other resources
    to verify identity of the user.*/
		const jwtToken = generateJWT(newUser.id);

		return res.status(201).send({ jwtToken: jwtToken, isAuthenticated: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// user sign-in / login
router.post("/sign-in", async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await usersDb.filter((user) => user.email === email);
		if (user.length === 0) {
			return res
				.status(401)
				.json({ error: "Invalid Credential", isAuthenticated: false });
		}

		/* if the user exist, compare the password provided by user
    with the hashed password we stored during user registration
		*/
		const isValidPassword = await bcrypt.compare(password, user[0].password);
		if (!isValidPassword) {
			return res
				.status(401)
				.json({ error: "Invalid Credential", isAuthenticated: false });
		}

		/* if the password matches with hashed password
    then generate a new token and send it back to user
    */
		const jwtToken = generateJWT(user[0].id);
		return res.status(200).send({ jwtToken, isAuthenticated: true });
	} catch (error) {
		console.error(error.message);
		res.status(500).send({ error: error.message });
	}
});

// user authorization
router.post("/auth", authenticate, (req, res) => {
	/* 	'authenticate' is a custom we will use
	in all the endpoints which we want to protect
	to verify user identity before sending back the requested resources.
 */
	try {
		res.status(200).send({ isAuthenticated: true });
	} catch (error) {
		console.error(error.message);
		res.status(500).send({ error: error.message, isAuthenticated: false });
	}
});

module.exports = router; // export this router to implement it in server.js file
