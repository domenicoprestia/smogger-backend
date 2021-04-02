const mongoose = require('mongoose')
const geocoder = require('../utilities/geocoder')

const UserSchema = new mongoose.Schema({
   username: {
      type: String,
      required: [true, 'Please insert a name'],
      min: 6,
      max: 255,
      unique: true
   },
   email:{
      type: String,
      required: [true, 'Please insert and email'],
      max: 255, 
      min: 6,
      unique: true
   },
   password:{
      type: String,
      required: [true, 'Please inser a password'],
      max: 1024,
      min: 6
   },
   date:{
      type: Date,
      default: Date.now
   },
   address:{
      type: String,
      required: true
   },
   location:{
      //GeoJSON Point
      type:{
         type: String,
         enum: ['Point'],
         required: false
      },
      coordinates:{
         type: [Number],
         required: false,
         index: '2dsphere'
      },
      formattedAddress: String, 
      street: String, 
      city: String, 
      state: String,
      zipcode: String, 
      country: String
   },
   savedPosts:{
      type:Array
   }
})

//Geocode create location field *node-geocoder* 

UserSchema.pre('save', async function(next){ 
   const loc = await geocoder.geocode(this.address);
   this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].contryCode
   }

   this.address = undefined
   next()
})

UserSchema.pre('update', { document: true, query: false }, async function(next){ 
   console.log(6)
   const loc = await geocoder.geocode(this.address);
   this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].contryCode
   }

   this.address = undefined
   next()
})

module.exports = mongoose.model('User', UserSchema)