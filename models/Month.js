var mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
var Schema = mongoose.Schema

var daySchema = new Schema({
  day: Number,
  workType: {
    type: String,
    /** ************************************* Feature 1 add two new status "MS"(morning shift),"NS"(night shift) **************************************/
    enum: ['W', 'PH', 'SL', 'AL', 'H(M)', 'H(A)', 'V', 'T', 'MS', 'NS', 'PO', 'PM', 'DV', 'HMSL', 'HMAL', 'HASL', 'HAAL']
  },
  workDay: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5]
  }
})

var personSchema = new Schema({
  id: {
    type: String,
    unique: true,
    dropDups: true
  },
  name: String,
  region: String,
  days: [daySchema]
})

var monthSchema = new Schema({
  year: Number,
  month: Number,
  people: [personSchema],
  section: String
})

monthSchema.index({ year: 1, month: 1 }, { unique: true })
// monthSchema.index({ month: 1, "people.id": 1 }, { unique: true });
module.exports = {
  Month: mongoose.model('Month', monthSchema)
}
