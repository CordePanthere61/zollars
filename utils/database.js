var mongoose = require('mongoose')
const {MongoClient} = require('mongodb');
const url = 'mongodb://localhost:27017';
const userCollection = 'users';

function connectToDb() {
    let client = new MongoClient(url);
    return new Promise(resolve => {
        client.connect((err, client) => {
            resolve(client.db('zollars'));
        })
    })
}

const connectDb = () => {
    return mongoose.connect('mongodb://localhost:27017/zollars');
}

exports.connectToDb = connectToDb
exports.userCollection = userCollection