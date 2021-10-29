const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid')
const db = require("../lib/db.js");
const userMiddleware = require("../middleware/users.js");
const nodemailer = require("nodemailer")

router.post("/sign-up", userMiddleware.validateRegister, (req, res, next) => {

    db.query(`SELECT id FROM users WHERE LOWER(username) = LOWER(${req.body.username})`, (err, result) => {

        if(result && result.length) {
            return res.status(409).send({
                message: "This username is already in use." 
            });

        }else {

            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).send({
                        message: err
                    });

                }else {

                    db.query(`INSERT INTO users (id, username, email, password, registered) VALUES ('${uuid.v4()}',${db.escape(req.body.username)},${db.escape(req.body.email)},'${hash}', now());`, 

                    (err, result) => {

                        if(err){
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

router.post("/update-profile-info" , (req, res, next) => {

    //body: username, birthdate, gender, emailadress

    db.query(`UPDATE users SET 
                username = ${db.escape(req.body.newUsername)},
                birthdate = ${db.escape(req.body.birthdate)},
                email = ${db.escape(req.body.email)}
                WHERE username = ${db.escape(req.body.username)}`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            message: "Updated profile info"
        })

    })


})

router.post("/send-email-forgot-password", (req, res, next) => {


    var generatedPassword = generate6RandomNumbers();

    bcrypt.hash(generatedPassword, 10, (err, hash) => {

        if(err) {
            return res.status(500).send({
                message: err
            });

        }else {

            sendEmail(req.body.email, generatedPassword)
            .then((info) => {

                db.query(`UPDATE users SET password = '${hash}' WHERE email = ${db.escape(req.body.email)};`, (err, result) => {

                    if(err){
                        return res.status(400).send({
                            message: err
                        });
                    }
    
                    return res.status(200).send({
                        message: "Email sent"
                    });
                
                })

            }).catch((error) => {

                return res.status(400).send({
                        message: error
                    });
            
            })

        }
    })

})

async function sendEmail(email, password){

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'timetrackersp@gmail.com', // generated ethereal user
            pass: 'acb1def2', // generated ethereal password
        },
    });

    transporter.sendMail({
        from: '"Timetracker Support" <giuliano.crespe@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Geramos uma nova senha pra você", // Subject line
        text: `A sua nova senha é ${password}`, // plain text body
        html: `<b>A sua nova senha é ${password}</b>`, // html body

    }).then((info) => {
        return info;
    }).catch((error) => {
        return error;
    });

}

function generate6RandomNumbers() {

    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;

    for ( var i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;

}
module.exports = router;

