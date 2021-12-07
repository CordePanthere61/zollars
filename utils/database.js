var mongoose = require('mongoose')

const connectDb = () => {
    return mongoose.connect('mongodb://localhost:27017/zollars');
}

module.exports.connectDb = connectDb