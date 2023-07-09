const express = require('express')
const { FieldValue, FieldPath } = require('firebase-admin/firestore')
const app = express()
const allRouter = require("./routes")
const port = process.env.PORT || 8383
const { db } = require('./firebase.js')
var bodyParser = require('body-parser')
var cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.use(allRouter)

app.listen(port, () => console.log(`Server has started on port: ${port}`))