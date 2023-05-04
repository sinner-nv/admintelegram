import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'

import { PORTBackEnd } from './config.js'
import { dbURI } from './config.js'
import { registerValidation } from './validations/auth.js'
import UserModel from './models/userModel.js'

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

app.post('/auth/login', async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email })
        if (!user) {
            return req.status(404).json({
                message: 'Пользователь не найден'
            })
        }
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)
        if (!isValidPass) {
            return req.status(404).json({
                message: 'Неверный логин или пароль'
            })
        }
        const token = jwt.sign({ _id: user._id }, 'secret123', { expiresIn: '30d' })
        const { passwordHash, ...docs } = user._doc
        res.json({
            ...docs,
            token
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            message: 'Пользователь не найден!'
        })
    }
})

app.post('/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array())
        }
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const passHash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            fullName: req.body.fullName,
            email: req.body.email,
            avatarUrl: req.body.avatarUrl,
            passwordHash: passHash

        })
        const user = await doc.save()

        const token = jwt.sign(
            { _id: user._id }, 'secret123', { expiresIn: '30d' }
        )
        const { passwordHash, ...docs } = user._doc
        res.json({
            ...docs,
            token
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось зарегистрироваться!'
        })
    }

})

app.listen(PORTBackEnd, () => {
    console.log(`Server OK. Port: ${PORTBackEnd}`)
})