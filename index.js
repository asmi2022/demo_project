const express = require("express");
const app  = express();
const body_parser = require("body-parser");
app.use(body_parser.urlencoded({extended: true}));
app.use(body_parser.json());
require("dotenv").config();
const Auth = require("./app/middleware/auth");
const cookie_parser = require("cookie-parser");

app.use(express.static("./public"));

const session = require("express-session");
app.use(session({
    resave: true,
    secret: "zxcvbnm",
    saveUninitialized: true
}));

app.use(cookie_parser());

app.use((req,res,next)=>{
    app.use(Auth.initialize);
    if(req.session && req.session.token){
        req.headers.token = req.session.token;
    }
    next();
});

const named_router = require("route-label")(app);
app.locals.generate_url = (routeName, routeParam = {})=>{
    return named_router.urlFor(routeName, routeParam);
}

named_router.use('', require("./app/routes/admin/user.route"));
named_router.buildRouteTable();

app.listen(process.env.PORT, async()=>{
    await require("./app/config/database")();
    console.log("This server is running on http://127.0.0.1:" + process.env.PORT);
});