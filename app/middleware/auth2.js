const passport = require("passport");
const passport_jwt = require("passport-jwt");
const userRepo = require("../modules/user/repositories/user.repository");

const Strategy = passport_jwt.Strategy;
const ext_jwt = passport_jwt.ExtractJwt;

const strategy = new Strategy({
    jwtFromRequest: ext_jwt.fromHeader("token"),
    secretOrKey: process.env.JWT_SECRET
}, async(payload, done)=>{
    try {
        let user  = await userRepo.userWithRole(payload.id);
        if(user && user.length){
            return done(null, user[0]);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
});

passport.use(strategy);

class Authentication {
    initialize = ()=>{
        return passport.initialize();
    }

    authenticate = async(req,res,next)=>{
        return await passport.authenticate("jwt", process.env.JWT_SECRET, (error, user)=>{
            try {
                if(error || !user){
                    req.flash("error", "Authentication failed");
                    return res.redirect(req.headers.referer);
                }
                req.user = user;
                next();
            } catch (error) {
                req.flash("error", error.message);
                return res.redirect(req.headers.referer);
            }
        })(req,res,next)
    }
}