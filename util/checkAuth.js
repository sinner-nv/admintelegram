import jwt from 'jsonwebtoken'

import { secretKey } from '../config.js'


export default (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')
    if (token) {
        try {
            const decode = jwt.verify(token, secretKey)
            req.userId = decode._id
            next()
        } catch (error) {
            return res.status(403).json({
                message: 'Нет доступа.'
            })
        }
    } else {
        return res.status(403).json({
            message: 'Нет доступа.'
        })
    }

}