const Joi = require('joi')

exports.registerValidation = (data) => {
   const schema = Joi.object({
      username: Joi.string().min(6).required(),
      email: Joi.string().min(6).required().email(),
      password: Joi.string().min(6).required(),
      address: Joi.string().required()
   })
   return schema.validate(data)
}

exports.loginValidation = (data) => {
   const schema = Joi.object({
      username: Joi.string().min(6).required(),
      password: Joi.string().min(6).required()
   })
   return schema.validate(data)
}

exports.postValidation = (data) => {
   const schema = Joi.object({
      address: Joi.string().required(),
      creator: Joi.string().required()
   })
   return schema.validate(data)
}