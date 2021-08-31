const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid')
const db = require("../lib/db.js");
const userMiddleware = require("../middleware/users.js");

router.post("/sign-up", userMiddleware.validateRegister, (req, res, next) => {

    db.query(`SELECT id FROM users WHERE LOWER(username) = LOWER(${req.body.username})`, (err, result) => {

        if(result && result.length) {
            return res.status(409).send({
                message: "This username is already in use." 
            });

        }else {

            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    throw err
                    return res.status(500).send({
                        message: err
                    });

                }else {

                    db.query(`INSERT INTO users (id, username, password, registered) VALUES ('${uuid.v4()}',${db.escape(req.body.username)},'${hash}', now());`, 

                    (err, result) => {

                        if(err){
                            throw err;
                            return res.status(400).send({
                                message: err
                            });
                        }

                        return res.status(201).send({
                            message: "Registered"
                        });
                    })
                }
            })
        }
    })
})

router.post("/login", (req, res, next) => {
    db.query(`SELECT * FROM users WHERE username = ${db.escape(req.body.username)};`, (err, result) => {

        if(err){
            throw err
            return res.status(400).send({
                message: err
            });
        } 

        if(!result.length) {
            return res.status(400).send({
                message: "Username or password incorrect"
            });
        }

        bcrypt.compare(
            req.body.password, 
            result[0]['password'], (bErr, bResult) => {

                if(bErr) {
                    throw bErr
                    return res.status(400).send({
                        message: "Username or password incorrect"
                    })
                }

                if(bResult){
                    const token = jwt.sign(
                        {
                            username: result[0].usename,
                            userId: result[0].id
                        }, "SECRETKEY", 
                        {expiresIn: "7d"}
                    )
                    
                    db.query(`UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`)

                    return res.status(200).send({
                        message: "Logged in",
                        token,
                        user: result[0]
                    })
                };

                            
                return res.status(401).send({
                    message: "Usrname or password incorrect"
                })

            }
        )
    })
})

module.exports = router