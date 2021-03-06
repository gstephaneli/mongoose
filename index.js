import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import { registerRouter } from './routers/registerRouter.js'

dotenv.config()

const conectionInBD = async() =>{
    try {
        await mongoose.connect('mongodb+srv://'+ process.env.USERDB +':'+ process.env.PASSDB +'@cluster0.r196i.mongodb.net/Banks?retryWrites=true&w=majority', {
            useNewUrlParser: true,
             useUnifiedTopology: true,
             useFindAndModify: false,
             useCreateIndex: true
             })  
     console.log(`Conection suceffuly`) 
    } catch (error) {
     console.log(`Not conection, Erro: ${error}`) 
    }
     
 }
 
 conectionInBD()

 const app = express()

app.use(express.json())
app.use(registerRouter)

app.listen(3000, ()=> console.log(`Server ON`))


