const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors()) 

const PORT = process.env.PORT || 3001;

app.use(express.json())

const router = require("./routes/router.js")
app.use('/api', router)

app.listen(PORT, () => console.log('Server running on port ' + PORT))