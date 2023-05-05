import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'

import { secretKey } from '../config.js'
import UserModel from '../models/userModel.js'

const userMe = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.userId })
        const { passwordHash, ...userData } = user._doc
        res.json({ ...userData })
    } catch (err) {
        res.status(403).json({
            message: 'Нет доступа'
        })
    }
}

const userLogin = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            })
        }
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)
        if (!isValidPass) {
            return res.status(401).json({
                message: 'Неверный логин или пароль'
            })
        }
        const token = jwt.sign({ _id: user._id }, secretKey, { expiresIn: '30d' })
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
}

const userRegister = async (req, res) => {
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
            { _id: user._id }, secretKey, { expiresIn: '30d' }
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

}

export { userMe, userLogin, userRegister }