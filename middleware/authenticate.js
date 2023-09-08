const jwt = require("jsonwebtoken");
require("dotenv").config();


function authenticate (req, res, next) {
  /* extracts the token from request headers
  We will receive an Authorization header from user
  with every request to a protected endpoint
  which requires user authentication. 
  */
  let token = req.header("authorization");
  
  // Check if token exists
  if (!token) {
    return res.status(403).send({ message: "authorization denied", isAuthenticated: false });
  }

  token = token.split(" ")[1]; // If a token is found in the headers, it splits it to separate the "Bearer" prefix (commonly used with tokens) from the actual token value.
  
  // Verify token using jwt
  try {
    /* If the verification is successful, it returns the decoded payload of the JWT. 
    This will return the user id (user:{id: user_id}) which we 
    provided as payload while generating JWT token.
    If the token provided to jwt.verify(token, process.env.jwtSecret);
    is not valid, it will throw an error.*/
    const verify = jwt.verify(token, process.env.jwtSecret);

    /* takes the user information from the decoded JWT payload
    and assigns it to the req.user property of the request object.
    This is a common practice to store the authenticated user's information,
    making it accessible to other parts of the application downstream.
    */
    req.user = verify.user;

    next();
    
  } catch (err) {
    res.status(401).send({ message: "Token is not valid", isAuthenticated: false });
  }
};

module.exports = authenticate;  // we export it to use it inside user router