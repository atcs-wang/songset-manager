const DEBUG = true;

//set up the server
const express = require( "express" );
const logger = require("morgan");
const path = require("path");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const { userRouter, loadUser, fakeLoadUser } = require("./routes/user.js");
const dotenv = require('dotenv');
dotenv.config();
const userApi = require("./db/user_api.js")
const app = express();
const port = 3000;

// Configure Express to use EJS
app.set( "views",  path.join(__dirname , "views"));
app.set( "view engine", "ejs" );
 
// Configure Express to parse URL-encoded POST request bodies (forms)
app.use( express.urlencoded({ extended: false }) );

app.post('*', (req, res, next) => {
    if (DEBUG) console.log(`POST ${req.url} \n\t ${JSON.stringify(req.body)}`);
    next();
})

// define middleware that logs all incoming requests
app.use(logger("dev"));

// define middleware that serves static resources in the public directory
app.use(express.static(path.join(__dirname, 'public') ));

//Configure auth 
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// define middleware that adds useful auth0-sourced information to the res object
// and references database for user information (nickname, privilege)
// If user does not yet exist in database, create the user in the database 
app.use(loadUser);


//DEBUG test
// app.use(fakeLoadUser(process.env.MOCK_USER_ID));



// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render('index');
} );

// app.use("/user", requiresAuth(), userRouter);
app.use("/user", userRouter);

let bandRouter = require("./routes/band.js");
app.use("/band", bandRouter); 

// let songsRouter = require("./routes/songs.js");
// app.use("/songs", requiresAuth(), songsRouter);

// let setsRouter = require("./routes/sets.js");
// app.use("/sets", requiresAuth(), setsRouter);


// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );
