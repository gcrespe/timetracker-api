const express = require('express');
const router = express.Router();
const uuid = require('uuid')
const db = require("../lib/db.js");

router.post("/newTask", (req, res, next) => {
    db.query(`INSERT INTO tasks (id, username, project, title, dueDate, description, priority, status) VALUES ('${uuid.v4()}', ${db.escape(req.body.username)}, ${db.escape(req.body.project)}, ${db.escape(req.body.title)}, ${db.escape(req.body.dueDate)}, ${db.escape(req.body.description)}, ${db.escape(req.body.priority)}, ${db.escape(req.body.status)});`, 

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

            return res.status(200).send({
                message: "Tarefa criada!"
            });
    })

})

router.post("/tasks", (req, res, next) => {

    db.query(`SELECT * FROM tasks WHERE LOWER(username) = LOWER('${req.body.username}');`, (err, tasks) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            tasks
        })

    })
})


router.delete("/deleteTask" , (req, res, next) => {

    db.query(`DELETE FROM tasks WHERE id = '${req.body.username}';`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            message: "Tasks deleted"
        })

    })


})

router.post("/assign", (req,res,next) => {

    db.query(`SELECT * FROM tasks WHERE LOWER(username) = LOWER('${req.body.username}') AND status = 'ONGOING';`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        if(result && result.length) {
            return res.status(409).send({
                message: "Você já tem uma tarefa em andamento." 
            });
        }
        else {

            db.query(`UPDATE tasks SET status = 'ONGOING' WHERE id = '${req.body.id}'`, (err, result) => {

                if(err){
                    return res.status(400).send({
                        message: err
                    });
                }
                
                return res.status(200).send({
                    message: "Task assigned"
                })


            })

        }
    })

})

router.post("/cancel-assignment", ( req , res, next ) => {

    db.query(`SELECT * FROM tasks WHERE LOWER(username) = LOWER('${req.body.username}') AND status = 'ONGOING';`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        if(result && result.length) {

            db.query(`UPDATE tasks SET status = 'NOT ASSIGNED' WHERE id = '${req.body.id}'`, (err, result) => {

                if(err){
                    return res.status(400).send({
                        message: err
                    });
                }
                
                return res.status(200).send({
                    message: "Task unassigned"
                })

            })

        }
    })

})

router.post("/get-ongoing-task", (req,res,next) => {

    db.query(`SELECT * FROM tasks WHERE LOWER(username) = LOWER('${req.body.username}') AND status = 'ONGOING';`, (err, task) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            task: task[0]
        })
    })

})

router.post("/finish-task", (req,res,next) => {

    db.query(`SELECT * FROM tasks WHERE LOWER(username) = LOWER('${req.body.username}') AND status = 'ONGOING';`, (err, task) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        db.query(`INSERT INTO activities (id, taskId, seconds, created) VALUES ('${uuid.v4()}', ${db.escape(req.body.id)}, ${db.escape(req.body.seconds)}, now());`, 
                    (err, result) => {

                if(err){

                    return res.status(400).send({
                        message: err
                    });
                }

                return res.status(200).send({});
        })

        db.query(`UPDATE tasks SET status = 'DONE' WHERE LOWER(username) = LOWER('${req.body.username}') AND id = ${db.escape(req.body.id)};`)

    })

})

router.post("/lap-task", (req,res,next) => {

    db.query(`SELECT * FROM tasks WHERE LOWER(username) = LOWER('${req.body.username}') AND status = 'ONGOING';`, (err, task) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        db.query(`INSERT INTO activities (id, taskId, seconds, created) VALUES ('${uuid.v4()}', ${db.escape(req.body.id)}, ${db.escape(req.body.seconds)}, now());`, 
                    (err, result) => {

                if(err){

                    return res.status(400).send({
                        message: err
                    });
                }

                return res.status(200).send({});
        })

    })

})

router.post("/total-task-time", (req, res, next) => {

    db.query(`SELECT sum(seconds) as totalTime FROM activities WHERE taskId = ${db.escape(req.body.taskId)};`, (err, result) => {
        
        if(err){
            return res.status(400).send({
                message: err
            });
        }

        return res.status(200).send({
            totalTime: result[0].totalTime
        });
        
    })

})


module.exports = router;