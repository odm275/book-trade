const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/APIAuthentication')

const app = express()

//  Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())

// Routes

app.use('/users', require('./routes/users'))

//Routes
const PORT = 3002 || process.env.PORT
app.listen(PORT)