import express from 'express'
import { registerModel } from '../models/registerModel.js'

const app = express()

app.put('/depositBalance', async (req, res) => {
    try {
        const {agencia, conta, balance}  = req.body
        const account = await registerModel.findOne({agencia,conta})
        if(!account){
            res.status(400).send(`Agencie not found`)
        }
        const id = account._id
        const newAccont = await registerModel.findByIdAndUpdate({_id:id}, {$inc: {balance}}, {new: true})
        res.status(200).send(newAccont)
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)

    }
})

app.put('/withdrawalBalance', async (req, res) => {
    try {
        const {agencia, conta, balance}  = req.body
        const account = await registerModel.findOne({agencia,conta})
        if(!account){
            throw new Error(`Agencie not found`)
        }

        if((account.balance - (balance + 1)) < 0){
            throw new Error(`Insufficient balance`)
        }

        const id = account._id
        const newAccont = await registerModel.findByIdAndUpdate({_id:id}, {$inc: {balance:-(balance +1)}}, {new: true})
        res.status(200).send(newAccont)
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

app.get('/getBalance', async (req, res) => {
    try {
        const {agencia, conta}  = req.body
        const account = await registerModel.findOne({agencia,conta})
        if(!account){
            throw new Error(`Agencie not found`)
        }
        res.status(200).send({agencia, conta, balance: account.balance})
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

app.delete('/deleteAccounts', async (req, res) => {
    try {
        const {agencia, conta}  = req.body

        const accountDeleted = await registerModel.deleteOne({agencia,conta})
        if(accountDeleted.deletedCount <= 0){
            throw new Error(`Account not found to delete`)
        }
        let countOfAgAccount = await registerModel.find({agencia}).countDocuments()
        res.status(200).send({accountActive: countOfAgAccount})
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

app.post('/transferBalance', async (req, res) => {
    try {
        const {originAccount, targetAccount, balance}  = req.body
        const accountOrigin = await registerModel.findOne({conta: originAccount})
        const accountTarget = await registerModel.findOne({conta: targetAccount})
        const valueToTranfer = balance
        let valueOfDebit = 0
        if(!accountOrigin || !accountTarget){
            throw new Error(`Agencie(s) not found`)
        }

        if(accountOrigin.agencia !== accountTarget.agencia){
            valueOfDebit += 8
        }

        const newOriginAccont = await registerModel.findByIdAndUpdate({_id:accountOrigin._id}, {$inc: {balance:-(valueToTranfer + valueOfDebit)}}, {new: true})
        await registerModel.findByIdAndUpdate({_id:accountTarget._id}, {$inc: {balance:valueToTranfer }})

        res.status(200).send(newOriginAccont)
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

app.get('/averageBalance', async (req, res) => {
    try {
        const {agencia}  = req.body
        const agen = await registerModel.findOne({agencia})
        if(!agen){
            throw new Error(`Agencie(s) not found`)
        }
        const response = await registerModel.aggregate([{$match: {agencia}},{$group: {_id:null, avg: {$avg:"$balance"}}}])

        res.status(200).send({average: (response[0].avg).toFixed(2)})
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

app.get('/minBalance', async (req, res) => {
    try {
        const {numberAccounts}  = req.body
        const minBalances = await registerModel.find().sort({balance:1}).limit(numberAccounts)

        res.status(200).send({minBalances})
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

app.get('/maxBalance', async (req, res) => {
    try {
        const {numberAccounts}  = req.body
        const maxBalances = await registerModel.find().sort({balance:-1, name:1}).limit(numberAccounts)

        res.status(200).send({maxBalances})
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

app.put('/transferRichs', async (req, res) => {
    try {
        const agencies = await registerModel.distinct("agencia")
        const promiseAgencie = agencies.map(async agencia => {
            const maxBalance = await registerModel.find({agencia}).sort({balance:-1})
            // console.log(`maxBalance: ${maxBalance}`)
            await registerModel.deleteOne({agencia: maxBalance[0].agencia, conta: maxBalance[0].conta})
            const insertAgencie = await registerModel.insertMany({
                agencia: 99,
                conta: maxBalance[0].conta,
                balance: maxBalance[0].balance
            })
            console.log('insertAgencie', insertAgencie)
        });
        await Promise.all(promiseAgencie)

        const moreRichs = await registerModel.find({agencia:99})

        res.status(200).send(moreRichs)
    } catch (error) {
        res.status(500).send(`Search return erro: ${error}`)
    }
})

export {app as registerRouter}