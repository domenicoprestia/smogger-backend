const mongoose = require('mongoose')
const dotenv = require('dotenv')

const connectDB = async () => {
   const conn = await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useCreateIndex:true, useFindAndModify: false, useUnifiedTopology: true})
   console.log(('MongoDB connected: ' + conn.connection.host).underline.cyan)
}

module.exports = connectDB