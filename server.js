const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connnectDB = require('./config/db')
const colors = require('colors')
const errorHandler = require('./middlewares/error')
const connectDB = require('./config/db')
const sanitizer = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
const cors = require('cors')

dotenv.config({path: './config/config.env'})

connectDB()

const user = require('./routes/user')
const posts = require('./routes/posts')

const app = express()

//Prevents http param spoofing
app.use(hpp())

//Prevents cross site requests
app.use(xss())

//Prevents NoSQL injections 
app.use(sanitizer())

//Package that prevents various type of attacks 
app.use(helmet())

//rate limiting

const limiter = rateLimit({
   windowMs: 5*60*1000,
   max: 100
})
app.use(limiter)

//Enable CORS Cross Origin Resource Sharing
//app.use(cors)

app.use(express.json())

if(process.env.NODE_ENV === "development"){
   app.use(morgan('dev'))
}

app.use('/api/v1/user', user)
app.use('/api/v1/posts', posts)


app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
   console.log(('Server running on port: ' + PORT + ', in mode: ' + process.env.NODE_ENV).yellow.bold)
})

process.on('unhandledRejection', (err, promise) => {
   console.log(('Error: ' + err).red)
})