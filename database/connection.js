const  mongoose = require('mongoose')

const connectToDatabase = async () => {
    const db = await mongoose.connect(process.env.DB_URL)
    console.log(`Connected successfully to database : ${db.connection.name}`)
}

module.exports = connectToDatabase