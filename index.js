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
    if(req.headers['x-access-token']) {
        req.headers.token = req.headers['x-access-token'];
    }
    next();
});

const engine = require("ejs-locals");
app.engine("ejs", engine);
app.set("view-engine", "ejs");
app.set("views", __dirname + "/app/modules");

const named_router = require("route-label")(app);
app.locals.generate_url = (routeName, routeParam = {})=>{
    return named_router.urlFor(routeName, routeParam);
}

named_router.use('', require("./app/routes/admin/user.route"));
named_router.use("", require("./app/routes/admin/product.route"));
named_router.use("", "/api",  require("./app/routes/api/user.route"));
named_router.use("", require("./app/routes/admin/category.route"));
named_router.use("", require("./app/routes/admin/product.route"));
named_router.use("", "/api", require("./app/routes/api/cart.route"));
named_router.use("", "/api", require("./app/routes/api/order.route"));
named_router.use('', require("./app/routes/admin/transaction.route"));





app.use("/",(req, res, next) => {
    res.status(200).send({ status: 200 })
})


named_router.buildRouteTable();
console.log(named_router.getRouteTable());

app.listen(process.env.PORT, async()=>{
    await require("./app/config/database")();
    console.log("This server is running on http://127.0.0.1:" + process.env.PORT);
});