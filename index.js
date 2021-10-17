const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors()) 

const PORT = process.env.PORT || 3001;

app.use(express.json())

app.use('/api', require("./routes/login.js"))
app.use('/api/projects', require("./routes/project.js"))
app.use('/api/tasks', require("./routes/task.js"))

app.listen(PORT, () => console.log('Server running on port ' + PORT))