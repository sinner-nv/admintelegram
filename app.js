import express from 'express'
import mongoose from 'mongoose'


import { PORTBackEnd } from './config.js'
import { dbURI } from './config.js'
import { registerValidation } from './validations/auth.js'
import checkAuth from './util/checkAuth.js'
import { userMe, userLogin, userRegister } from './controllers/userController.js'

const app = express()
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Hello')
})

mongoose
    .connect(dbURI)
    .then(() => {
        console.log('Connect to DB: OK')
    })
    .catch(err => console.log(err))

app.get('/auth/me', checkAuth, userMe)

app.post('/auth/login', userLogin)

app.post('/auth/register', registerValidation, userRegister)

app.listen(PORTBackEnd, () => {
    console.log(`Server OK. Port: ${PORTBackEnd}`)
})