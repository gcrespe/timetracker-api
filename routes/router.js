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

router.post("/projects/newProject", (req, res, next) => {
    db.query(`INSERT INTO projects (id, name, description, participant, totalTasks, remainingTasks, dueDate) VALUES ('${uuid.v4()}', ${db.escape(req.body.name)}, ${db.escape(req.body.description)}, ${db.escape(req.body.participant)}, 0, 0, ${db.escape(req.body.dueDate)});`, 
        (err, result) => {

                if(err){

                    if(err.message.errno == 1062)
                    return res.status(400).send({
                        message: "Você já criou esse projeto"
                    });

                    return res.status(400).send({
                        message: err
                    });
                }

                return res.status(200).send({
                    message: "Inserted project"
                });
        }
    )
})

router.get("/projects/projects", (req, res, next) => {

    db.query(`SELECT * FROM projects WHERE LOWER(participant) = LOWER('${req.query.participant}');`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            projects: result
        })

    })
})


router.post("/tasks/newTask", (req, res, next) => {
    db.query(`INSERT INTO tasks (id, username, project, title, dueDate, description, priority, status, startTime) VALUES ('${uuid.v4()}', ${db.escape(req.body.username)}, ${db.escape(req.body.project)}, ${db.escape(req.body.title)}, ${db.escape(req.body.dueDate)}, ${db.escape(req.body.description)}, ${db.escape(req.body.priority)}, ${db.escape(req.body.status)}, now());`, 
        (err, result) => {

                if(err){

                    if(err.message.errno == 1062)
                    return res.status(400).send({
                        message: "Você já criou essa tarefa"
                    });

                    return res.status(400).send({
                        message: err
                    });
                }

                // db.query(`SELECT totalTasks, remainingTasks FROM projects WHERE participant = '${db.escape(req.body.username)}' AND name = '${db.escape(req.body.project)}''`, (err, result) => {
                    
                //     console.log(result);
                //     db.query(`UPDATE projects SET totalTasks = ${db.escape(result.totalTasks) + 1} WHERE participant = '${db.escape(req.body.username)} AND name = '${db.escape(req.body.project)}''`)
                //     db.query(`UPDATE projects SET remainingTasks = ${db.escape(result.remainingTasks) + 1} WHERE participant = '${db.escape(req.body.username)} AND name = '${db.escape(req.body.project)}''`)

                // })

                return res.status(200).send({
                    message: "Tarefa criada!"
                });
        }
    )
})

router.get("/tasks/tasks", (req, res, next) => {

    db.query(`SELECT * FROM tasks WHERE LOWER(username) = LOWER('${req.body.username}');`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            tasks: result
        })

    })
})

module.exports = router