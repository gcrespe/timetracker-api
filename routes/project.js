const express = require('express');
const router = express.Router();
const uuid = require('uuid')
const db = require("../lib/db.js");

router.post("/newProject", (req, res, next) => {
    db.query(`INSERT INTO projects (id, name, description, participant, totalTasks, remainingTasks, dueDate, category, color) VALUES ('${uuid.v4()}', ${db.escape(req.body.name)}, ${db.escape(req.body.description)}, ${db.escape(req.body.participant)}, 0, 0, ${db.escape(req.body.dueDate)}, ${db.escape(req.body.category)}, ${db.escape(req.body.color)});`, 
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

router.get("/projects", (req, res, next) => {

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

router.get("/projects-dates", (req, res, next) => {

    db.query(`SELECT dueDate FROM projects WHERE participant = ${db.escape(req.query.username)};`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            result
        })

    })

})

router.post("/get-tasks-status", (req, res, next) => {

    db.query(`SELECT count(title) as totalTasks FROM tasks WHERE username = ${db.escape(req.body.username)} AND project = ${db.escape(req.body.project)}`, (err, result) => {
                            

        if(err){
            return res.status(400).send({
                message: err
            });
        }

        var totalTasks = result[0].totalTasks;

        db.query(`SELECT count(title) as doneTasks FROM tasks WHERE username = ${db.escape(req.body.username)} AND project = ${db.escape(req.body.project)} AND status = 'DONE'`, (err, resultado) => {
                            

            if(err){
                return res.status(400).send({
                    message: err
                });
            }
    
            var doneTasks = resultado[0].doneTasks;
    
            return res.status(200).send({
                totalTasks,
                doneTasks,
                remainingTasks: totalTasks - doneTasks
            })
    
        })

    })

})

module.exports = router;

