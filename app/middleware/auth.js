const passport = require("passport");
const passport_jwt = require("passport-jwt");
const userRepo = require("../modules/user/repositories/user.repository");

const Strategy = passport_jwt.Strategy;
const Ext_jwt = passport_jwt.ExtractJwt;

const strategy = new Strategy({
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: Ext_jwt.fromHeader("token")
},async(payload, done)=>{
    try {
        let user = await userRepo.userWithRole(payload.id);
        if(user && user.length){
            return done(null, user[0]);
        }
        return done(null, false);
    } catch (error) {
        console.error(error);
        done(error, false);
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
                if(error || !user) return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Authentication Failed"
                });
                req.user = user;
                next();
            } catch (error) {
                return res.status(500).send({
                    status: 500,
                    data: null,
                    message: error.message
                });
            }
        })(req,res,next);
    }
}

module.exports = new Authentication();