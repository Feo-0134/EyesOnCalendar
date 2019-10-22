const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

var connString = ''

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined) {
  connString = process.env.DB_CONNECTSTRING_PRODUCTION
} else {
  connString = process.env.DB_CONNECTSTRING_DEV
}

mongoose.connect(connString)
const db = mongoose.connection
module.exports = db
