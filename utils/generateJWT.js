const jwt = require("jsonwebtoken");
require("dotenv").config(); //dotenv module access environment variables from .env file

function generateJWT(user_id) {
	const payload = {
		user: {
			id: user_id,
		},
	};
	return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "1h" });
}

module.exports = generateJWT; //we export this function to use it inside routes/user.js
