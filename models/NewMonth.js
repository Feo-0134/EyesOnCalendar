var mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
var Schema = mongoose.Schema

var daySchema = new Schema({
  day: Number,
  workType: {
    type: String,
  },
  workDay: {
    type: Number,
  }
})

var personSchema = new Schema({
  alias: String,
  name: String, // first name + last name
  days: [daySchema],
  role: {
    type: String,
    enum: ['FTE', 'Vendor', 'Intern']
  },
  principle: {
    type: String,
    enum: ['TM', 'TA', 'None']
  }
})

var monthSchema = new Schema({
  customDayType: {
    Type: [],
    color: []
  },
  year: Number,
  month: Number,
  pod: String,
  lockdate: [],
  people: [personSchema],
})

monthSchema.index({ year: 1, month: 1, pod: 1 }, { unique: true })
module.exports = {
  Month: mongoose.model('Month', monthSchema)
}
