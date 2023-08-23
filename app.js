//set up the server
const express = require( "express" );
const logger = require("morgan");
const path = require("path");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const userRouter= require("./routes/user.js");
const { loadUser, fakeLoadUser } = require('./middleware/user.js');
const dotenv = require('dotenv');
dotenv.config();
const helmet = require("helmet");

const app = express();
const port = process.env.PORT || 3000;

// Configure Express to use EJS
app.set( "views",  path.join(__dirname , "views"));
app.set( "view engine", "ejs" );

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", 
        "cdnjs.cloudflare.com", 
        "cdn.jsdelivr.net", 
        "'unsafe-eval'"], //This is necessary to use ejs as a front-end library. Eventually, it should be patched out.
      },
    },
  }));

// Configure Express to parse URL-encoded POST request bodies (forms)
app.use( express.urlencoded({ extended: false }) );

if (process.env.NODE_ENV != 'production') {
    app.post('*', (req, res, next) => {
        console.log(`POST ${req.url} \n\t ${JSON.stringify(req.body)}`);
        next();
    })
}

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
    if (!req.user) {
        res.render('index');
    } else {
        res.redirect('/band/list');
    }
} );

// Everything but the home page requires authentication
app.use(requiresAuth());

app.use("/user", userRouter);

//Hands anything with 
let bandRouter = require("./routes/band.js");
app.use("/band", bandRouter); 

let songRouter = require("./routes/song.js");
bandRouter.use(["/:band_id/song", "/:band_id/songs"], songRouter);

let setlistRouter = require("./routes/setlist.js");
bandRouter.use(["/:band_id/setlist", "/:band_id/setlists"], setlistRouter);


// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );
