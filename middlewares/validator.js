const Joi = require("joi");


function userValidation (user) {
    const schema = Joi.object({
        username: Joi.string().min(1).max(100).required(),
        email: Joi.string().min(5).max(255).email().required(),
        password: Joi.string().min(8).max(50).required()
    })
    return schema.validate(user, {allowUnknown: true})
}

exports.userValidation = userValidation