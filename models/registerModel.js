import mongoose from 'mongoose'

const agencieSchema = mongoose.Schema({
    agencia: {
        type: Number, 
        require: true
    },
    conta: {
        type: Number, 
        require: true,
    },
    name: {
        type: String, 
        require: true,  
    },
    balance: {
        type: Number, 
        validate(value) {
            if(value <= 0)
            throw new Error(`Balance not less 0`)
        }  
    }
})

const registerModel = mongoose.model('agencies', agencieSchema, 'agencies')

export { registerModel }