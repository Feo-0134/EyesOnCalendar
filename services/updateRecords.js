// const fs = require('fs')
// const json = require('../newConvertCsv.js')
const models = require('../models/NewMonth')
const Month = models.Month
const errorMsg = 'Record not found'

/* Function to constructor a new month
 */

function newMonth (year, month, pod, daylock, people, customDayType) {
  console.log('Inserting Full Month')
  return new Month({
    year: year,
    month: month,
    pod: pod,
    daylock: daylock,
    people: people,
    customDayType: customDayType
  })
}

/* Function to search a record
 * with a given alias in a given month
 */
function findRecord (month, alias) {
  // console.log('enterFind')
  let flag = 0
  month.people.forEach(person => {
    if (person.alias === alias) {
      // console.log('Found')
      flag = 1
    }
  })
  // console.log('notFound')
  if (flag === 1) { return true } else { return false }
}

/* Function to check a record
 * with a given alias's principle in a given month
 */
function findPrinciple (month, alias) {
  // console.log('enterFind')
  let flag = 0
  month.people.forEach(person => {
    if ((person.principle === 'TM' ||
     person.principle === 'TA') &&
     person.alias === alias) {
      // console.log('Found')
      flag = 1
    }
  })
  // console.log('notFound')
  if (flag === 1) { return true } else { return false }
}

/* Function to insert records to a given month */
function incrementMonth (month, people) {
  // console.log('Incremental push')
  people.forEach(person => {
    month.people.push(person)
  })
  return month
}

/* Function to update records from a given month */
function updateMonth (month, people) {
  // console.log('updateMonth')
  people.forEach(person => {
    month.people.forEach(p => {
      if (p.alias === person.alias) {
        p.principle = person.principle
      }
    })
  })
  return month
}

/* Function to delete records from a given month */
function decrementMonth (month, alias) {
  // console.log('decrementMonth')
  var position = 0
  var flag = 0
  month.people.forEach(person => {
    if (person.alias === alias) {
      flag = 1
      month.people.splice(position, 1)
    }
    position = position + 1
  })
  if (flag === 0) { return -1 } else { return month }
}

async function modifyTemplate (year, month, peopleSrc) {
  if (typeof (year) !== 'number' || typeof (month) !== 'number')
  { return }
  // init basic template per person per day
  var people = [{
    alias: 'DefaultAlias',
    name: '%DefaultName%',
    role: 'DefaultRole',
    principle: 'DefaultPrinciple',
    days: [{
      day: 1,
      workType: '',
      workDay: 0
    }]
  }]

  // init template for a day (fill real data)
  var dateFormat_0 = year + '-' + month + '-' + people[0].days[0].day
  var weekDay_0 = new Date(dateFormat_0).getDay().toString()
  people[0].days[0].day = 1
  if (weekDay_0 === '0' || weekDay_0 === '6') {
    people[0].days[0].workType = 'PH'
    people[0].days[0].workDay = '0'
  } else {
    people[0].days[0].workType = 'W'
    people[0].days[0].workDay = '1'
  }

  // init template for a month
  var daysLength = new Date(year, month, 0).getDate()
  var i
  for (i = 1; i < daysLength; i++) {
    people[0].days[i] = Object.assign({}, people[0].days[i - 1]) // shallow copy
    people[0].days[i].day = i + 1
    var dateFormat = year + '-' + month + '-' + people[0].days[i].day
    var weekDay = new Date(dateFormat).getDay().toString()
    if (weekDay === '0' || weekDay === '6') {
      people[0].days[i].workType = 'PH'
      people[0].days[i].workDay = '0'
    } else {
      people[0].days[i].workType = 'W'
      people[0].days[i].workDay = '1'
    }
  }

  // init template for a person (fill real data)
  people[0].alias = peopleSrc[0].alias
  people[0].name = peopleSrc[0].name
  people[0].role = peopleSrc[0].role
  people[0].principle = peopleSrc[0].principle

  // init template for the whole team (fill real data)
  for (var cnt = 1; cnt < (peopleSrc).length; cnt++) {
    people[cnt] = Object.assign({}, people[0]) // shallow copy
    people[cnt].alias = peopleSrc[cnt].alias
    people[cnt].name = peopleSrc[cnt].name
    people[cnt].role = peopleSrc[cnt].role
    people[cnt].principle = peopleSrc[cnt].principle
  }
  return people
};

const getMonth = async (ctx) => {
  var p = ctx.params
  try {
    var result =
     await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    if (result == null) {
      throw (errorMsg)
    } else ctx.body = result
  } catch (e) {
    ctx.status = 404
    ctx.body = e
    console.log(e)
  }
}

const rmMonth = async (ctx) => {
  var p = ctx.params
  try {
    var result =
     await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    if (result == null) {
      ctx.body = 'month not found'
      return
    } else {
      await Month.deleteOne({ year: p.year, month: p.month, pod: p.pod })
      ctx.body = 'month removed'
    }
  } catch (e) {
    ctx.status = 404
    ctx.body = e
    console.log(e)
  }
}

const updateDayType = async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  console.log(b)
  try {
    var currentMonth =
     await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    if (currentMonth == null) { throw (errorMsg) }
    var day = currentMonth.people.id(p.person).days.id(p.day)
    day.workType = b.workType
    day.workDay = b.workDay
    var result = await currentMonth.save()
    // if indexes are set, emit update
    // if (b.indexes !== undefined)
    // { io.to('/' + p.year + '/' + p.month).emit('update', b) }
    ctx.body = result
  } catch (e) {
    ctx.status = 400
    ctx.body = e
    console.log(e)
  }
}

const updateDayTypeBatch = async (ctx) => {
  var p = ctx.params
  var flag = 0
  try {
    var currentMonth =
     await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    if (currentMonth == null) { throw (errorMsg) }
    currentMonth.people.forEach(record => {
      if (record.alias === p.person) {
        flag = 1
        record.days.forEach(day => {
          if (day.workType === 'W' ||
           day.workType === 'MS' ||
           day.workType === 'NS') {
            day.workType = p.workType
            if (p.workType === 'NS') {
              day.workDay = 5
            } else if (p.workType === 'MS' ||
            p.workType === 'W') {
              day.workDay = 1
            }
          }
        })
      }
    })
    var result = await currentMonth.save()
    if (flag === 0) {
      ctx.body = 'No Record'
    } else { ctx.body = result }
  } catch (e) {
    ctx.status = 400
    ctx.body = e
    console.log(e)
  }
}

const addPerson = async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  var currentMonth =
   await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
  // eslint-disable-next-line no-array-constructor
  var people =
   await modifyTemplate(Number(p.year), Number(p.month), b.people)
  var payload
  if (b.principle === 'TM' || b.principle === 'TA') {
  // add TM/TA role to a team member
    if (!findRecord(currentMonth, b.alias)) {
      ctx.body =
      'This is not a team member. Please add him to your team first'
      return
    } else if (findPrinciple(currentMonth, b.alias)) {
      ctx.body = 'This person is already TM/TA'
      return
    } else {
      payload = updateMonth(currentMonth, people)
      ctx.body = 'Permission is Added to the Person'
    }
  } else { // add a team member
    if (findRecord(currentMonth, b.alias)) {
      ctx.body = 'Record exist'
      return
    } else {
      payload = incrementMonth(currentMonth, people)
      ctx.body = 'Person is Added to the Team'
    }
  }

  try {
    await payload.save()
  } catch (e) {
    console.log('System Error: crash at insert record' + e)
    ctx.status = 400
    ctx.body = 'error'
  }
}

const removePerson = async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  var currentMonth =
  await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
  // eslint-disable-next-line no-array-constructor
  var people =
  await modifyTemplate(Number(p.year), Number(p.month), b.people)
  var payload
  if (b.principle === 'TM' || b.principle === 'TA') {
    // add TM/TA role to a team member
    if (!findRecord(currentMonth, b.alias)) {
      ctx.body = 'Record not exist'; return
    } else if (!findPrinciple(currentMonth, b.alias)) {
      ctx.body = 'This person is not TM/TA'; return
    } else if (findPrinciple(currentMonth, b.alias)) {
      people[0].principle = 'None'
      payload = updateMonth(currentMonth, people)
      ctx.body = 'Permission is Removed from the Person'
    }
  } else { // delete a team member
    payload = await decrementMonth(currentMonth, b.alias)
    ctx.body = 'Person is Removed from the Team'
    if (payload === -1) { ctx.body = 'Record not exist'; return }
  }

  try {
    await payload.save()
  } catch (e) {
    ctx.status = 400
    ctx.body = 'error'
    console.log('System Error: crash at delete record' + e)
  }
}

const initCalendar = async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  var people =
  await modifyTemplate(Number(p.year), Number(p.month), b.people)
  // eslint-disable-next-line no-array-constructor
  var daylock = new Array()
  var payload = newMonth(p.year, p.month, p.pod, daylock, people,
    { Type: ['C1', 'C2'], color: ['#007EA7', '#003459'] })
  try {
    await payload.save()
    ctx.body = 'success'
  } catch (e) {
    console.log('System Error: crash at insert record' + e)
    ctx.status = 400
    ctx.body = 'error'
  }
}

const extendCalendar = async (ctx) => {
  var p = ctx.params
  try {
    // (new Date().getMonth() + 2) % 12 ? (new Date().getMonth() + 2) % 12 : 12;
    var lastMonth = ((p.month - 1) % 12) ? (p.month - 1) % 12 : 12
    var lastYear = lastMonth === 12 ? p.year - 1 : p.year
    var currentMonth =
      await Month.findOne({ year: lastYear, month: lastMonth, pod: p.pod })
    if (currentMonth === null) {
      ctx.body = 'no last month data'
      return
    }
    var people =
      await modifyTemplate(Number(p.year), Number(p.month), currentMonth.people)
    // eslint-disable-next-line no-array-constructor
    var daylock = new Array()
    var payload = newMonth(p.year, p.month, p.pod, daylock, people, currentMonth.customDayType)
    await payload.save()
  } catch (e) {
    console.log(e)
    ctx.body = e
  }
}

const setCustomDayType = async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  try {
    var currentMonth =
      await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    currentMonth.customDayType = b.customDayType
    const payload = currentMonth
    await payload.save()
    ctx.body = 'success'
  } catch (e) {
    console.log(e)
    ctx.body = e
  }
}

const updateRecords = {
  getMonth: getMonth,
  rmMonth: rmMonth,
  updateDayType: updateDayType,
  updateDayTypeBatch: updateDayTypeBatch,
  addPerson: addPerson,
  removePerson: removePerson,
  initCalendar: initCalendar,
  extendCalendar: extendCalendar,
  setCustomDayType: setCustomDayType
}

module.exports = updateRecords
