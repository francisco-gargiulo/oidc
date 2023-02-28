const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Create an express app
const app = express();

// Set up the middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the client information
const REDIRECT_URI = "http://localhost:3000/callback";

// Define the user information
const user = {
  id: "user-id",
  email: "user@example.com",
  password: "password",
};

// Define the authorization codes
const authorizationCodes = {};

// Generate a key pair for signing ID tokens
const keyPair = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Define the authorization endpoint
app.get("/authorize", (req, res) => {
  const responseType = req.query.response_type;
  const clientID = req.query.client_id;
  const redirectURI = req.query.redirect_uri;
  const scope = req.query.scope;

  // Validate the request parameters
  if (responseType !== "code") {
    return res.status(400).send("Invalid response_type");
  }
  if (clientID !== "client-id") {
    return res.status(400).send("Invalid client_id");
  }
  if (redirectURI !== REDIRECT_URI) {
    return res.status(400).send("Invalid redirect_uri");
  }
  if (scope !== "openid email") {
    return res.status(400).send("Invalid scope");
  }

  // Redirect the user to the login page
  const loginURL = `http://localhost:3000/login?response_type=${responseType}&client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scope}`;
  res.redirect(loginURL);
});

// Define the login page
app.get("/login", (req, res) => {
  const responseType = req.query.response_type;
  const clientID = req.query.client_id;
  const redirectURI = req.query.redirect_uri;
  const scope = req.query.scope;

  // Render the login form
  res.send(`
      <html>
        <body>
          <form action="/login" method="post">
            <label>
              Email:
              <input type="text" name="email" />
            </label>
            <br />
            <label>
              Password:
              <input type="password" name="password" />
            </label>
            <br />
            <input type="hidden" name="response_type" value="${responseType}" />
            <input type="hidden" name="client_id" value="${clientID}" />
            <input type="hidden" name="redirect_uri" value="${redirectURI}" />
            <input type="hidden" name="scope" value="${scope}" />
            <input type="submit" value="Log in" />
          </form>
        </body>
      </html>
    `);
});

// Handle the login request
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const responseType = req.body.response_type;
  const clientID = req.body.client_id;
  const redirectURI = req.body.redirect_uri;
  const scope = req.body.scope;

  // Authenticate the user
  if (email !== user.email || password !== user.password) {
    return res.status(401).send("Invalid credentials");
  }

  // Generate an authorization code
  const authorizationCode = crypto.randomBytes(16).toString("hex");

  // Store the authorization code for later use
  authorizationCodes[authorizationCode] = {
    clientID: "client-id",
  };

  // Redirect the user to the client
  const redirectURL = `${redirectURI}?code=${authorizationCode}&state=${req.query.state}`;
  res.redirect(redirectURL);
});

// Define the login endpoint
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Authenticate the user
  if (email !== user.email || password !== user.password) {
    return res.status(401).send("Invalid credentials");
  }

  // Generate an authorization code
  const authorizationCode = crypto.randomBytes(16).toString("hex");

  // Store the authorization code for later use
  authorizationCodes[authorizationCode] = {
    clientID: "client-id",
  };

  // Redirect the user to the client
  res.redirect(
    `${REDIRECT_URI}?code=${authorizationCode}&state=${req.query.state}`
  );
});

// Define the token endpoint
app.post("/token", (req, res) => {
  const grantType = req.body.grant_type;
  const clientID = req.body.client_id;
  const clientSecret = req.body.client_secret;
  const code = req.body.code;
  const redirectURI = req.body.redirect_uri;

  // Validate the request parameters
  if (grantType !== "authorization_code") {
    return res.status(400).send("Invalid grant_type");
  }

  if (clientID !== "client-id") {
    return res.status(400).send("Invalid client_id");
  }

  if (clientSecret !== "client-secret") {
    return res.status(400).send("Invalid client_secret");
  }

  if (redirectURI !== REDIRECT_URI) {
    return res.status(400).send("Invalid redirect_uri");
  }

  // Validate the authorization code
  const authorizationCode = authorizationCodes[code];
  if (!authorizationCode) {
    return res.status(400).send("Invalid code");
  }

  // Generate an access token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      aud: clientID,
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    keyPair.privateKey,
    { algorithm: "RS256" }
  );

  // Generate an ID token
  const idToken = jwt.sign(
    {
      iss: "http://localhost:3000",
      sub: user.id,
      aud: clientID,
      exp: Math.floor(Date.now() / 1000) + 60,
      email: user.email,
    },
    keyPair.privateKey,
    { algorithm: "RS256" }
  );

  // Send the response
  res.json({
    access_token: accessToken,
    token_type: "Bearer",
    id_token: idToken,
    expires_in: 60,
  });
});

// Define the userinfo endpoint
app.get("/userinfo", (req, res) => {
  // Check the access token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Missing Authorization header");
  }

  const [tokenType, accessToken] = authHeader.split(" ");
  if (tokenType !== "Bearer") {
    return res.status(401).send("Invalid token type");
  }

  // Return the user information
  jwt.verify(accessToken, keyPair.publicKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid access token");
    }

    const { email, sub: id } = decoded;
    res.json({
      email,
      id,
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
