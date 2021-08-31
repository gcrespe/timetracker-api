const express = require('express')
const app = express()
const cors = require('cors')

const PORT = process.env.PORT || 3000;

app.use(express.json())

const router = require("./routes/router.js")
app.use('/api', router)

app.listen(PORT, () => console.log('Server running on port ' + PORT))