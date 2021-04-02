const mongoose = require('mongoose')
const geocoder = require('../utilities/geocoder')
const { unlink } =  require('fs/promises');

const PostSchema = new mongoose.Schema({
   creator:{
      type: String,
      required: [true, 'Please insert a creator']
   },
   address:{
      type: String,
      required: [true, 'Please insert an address']
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
   image:{
      type: String,
      required: [true, 'Please add an image']
   }

})
PostSchema.pre('save', async function(next){ 
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

PostSchema.pre('remove', async function(next){
   const file = this.image.split('/')
   unlink('uploads/images/' + file[3], (err) => {
      if(err) throw err;
      console.log('successfully deleted /tmp/hello').blue;
   })
})



module.exports = mongoose.model('Post', PostSchema)
