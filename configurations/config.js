const dotenv = require('dotenv')
dotenv.config()

const { PORT , ACCESS_TOkEN , SERVER_URL } = process.env

module.exports = { PORT , ACCESS_TOkEN , SERVER_URL}