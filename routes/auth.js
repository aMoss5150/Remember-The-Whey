const { User } = require('../db/models')


// create auth property on req.session passing in user info (id)
const loginUser = (req, res, user) => {
    req.session.auth = {
        userId: user.id
    };
};


// deletes user's auth, making no session avail (no data user is logged in)
const logoutUser = (req, res) => {
    delete req.session.auth;
}


// checks res.locals.authenticated to be true or redirect to login
const requireAuth = (req, res, next) => {
    if (!res.locals.authenticated) {
      return res.redirect('/users/log-in');
    }
    return next();
};




const restoreUser = async(req, res, next) => {
    console.log(req.session)

    //checks if a req.session.auth property exists (would have been made upon login())
    if(req.session.auth) {
        // if available extract userId ( user.id )
        const { userId } = req.session.auth;

        try {
            // looks for user based off extracted userID
            const user = await User.findByPk(userId)

            if(user) {
                // if user found, set res.locals values for authenticated, user
                // makes res.locals objects sent to as response have those values
                res.locals.authenticated = true;
                res.locals.user = user;
                next()
            }

        } catch (err) {
            // if user not found, error is pushed into next()
            res.locals.authenticated = false;
            next(err)

        }
    } else {
        // if no auth, just set authenicated to false and next() middleware
        res.locals.authenticated = false;
        next()
    }
}






module.exports = {
    loginUser,
    restoreUser,
    logoutUser,
    requireAuth
}
