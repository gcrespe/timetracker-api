const jwt = require('jsonwebtoken')

module.exports = {

    validateRegister: (req, res, next) => {

        if(!req.body.username || req.body.username.length < 3){
            return res.status(400).send({
                message: "Please enter a username with min 3 characters."
            }); 
        }

        if(!req.body.password || req.body.username.password < 6){
            return res.status(400).send({
                message: "Please enter a password with min 6 characters."
            })
        }

        if(!req.body.password_repeat || 
            req.body.password != req.body.password_repeat){
            return res.status(400).send({
                message: "Both passwords must match."
            })
        }
        next()
    },
    isLoggedIn: () => {},
};