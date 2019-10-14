const Koa = require('koa')
const app = new Koa()
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

const Router = require('koa-router')
const router = new Router({ prefix: '/api' })
const bodyParser = require('koa-bodyparser')

const serve = require('koa-static')
const multer = require('koa-multer')
const send = require('koa-send')

const models = require('./models/NewMonth')
const Month = models.Month

const path = require('path')
const fs = require('fs')
const json = require('./newConvertCsv.js')
const upload = multer({ dest: 'uploads/' })

require('dotenv').config()

// const variable here
const errorMsg = 'Record not found'

// env params
var staticPath = ''
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined) {
  staticPath = '/dist/'
} else {
  staticPath = './client/dist/'
}

// db connection
const db = require('./mongodb')
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('Connected to DB')
})

// koa router
router.use(bodyParser())

/* ##################################################
 *   get default team name & team name autocomplete
 * ##################################################
 */

/* API return teamName (for smart router) */
router.get('/getpod/:year/:month/:alias', async (ctx) => {
  var p = ctx.params
  var flag = 0
  var podName = 'default'
  var name = 'default'
  var principle = 'default'
  var monthRecord = await Month.find({ year: p.year, month: p.month })
  monthRecord.forEach((month) => {
    month.people.forEach((person) => {
      if (person.alias === p.alias) {
        flag = 1
        name = person.name
        principle = person.principle
      }
    })
    if (flag === 1) { podName = month.pod; flag = 0 }
  })
  ctx.body = { pod: podName, name: name, principle: principle }
})

/* API return teamName (for autocomplete when pick teamName) */
router.get('/:pod/:year/:month/ownTeamName/:alias', async (ctx) => {
  var p = ctx.params
  try {
    var result = await Month.find({ year: p.year, month: p.month })
    if (result == null) {
      throw (errorMsg)
    } else {
      // eslint-disable-next-line no-array-constructor
      var linkList = new Array()
      linkList.push({ value: 'TEMPLATE', link: '/TEMPLATE/' + p.year + '/' + p.month })
      // eslint-disable-next-line no-array-constructor
      var resultRecord = new Array()
      result.forEach(record => {
        record.people.forEach(person => {
          if (person.alias === p.alias) { resultRecord.push(record) }
        })
      })
      resultRecord.forEach(record => {
        linkList.push({ value: record.pod, link: '/' + record.pod + '/' + p.year + '/' + p.month })
      })
      ctx.body = linkList
      console.log(linkList)
    }
  } catch (e) {
    ctx.status = 404
    ctx.body = e
    console.log(e)
  }
})

/* API return all team name data for su */
router.get('/:pod/:year/:month/allTeamName', async (ctx) => {
  var p = ctx.params
  try {
    var result = await Month.find({ year: p.year, month: p.month })
    if (result == null) {
      throw (errorMsg)
    } else {
      // eslint-disable-next-line no-array-constructor
      var linkList = new Array()
      result.forEach(element => {
        linkList.push({ value: element.pod, link: '/' + element.pod + '/' + p.year + '/' + p.month })
        ctx.body = linkList
      })
    }
  } catch (e) {
    ctx.status = 404
    ctx.body = e
    console.log(e)
  }
})

/* ##################################################
 * CURD Operations with the person record and dayType
 * ##################################################
 */

/* Function to constructor a new month
 */
function newMonth (year, month, pod, daylock, people) {
  console.log('Inserting Full Month')
  return new Month({
    year: year,
    month: month,
    pod: pod,
    daylock: daylock,
    people: people
  })
}

/* Function to search a record with a given alias in a given month */
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

/* Function to check a record with a given alias's principle in a given month */
function findPrinciple (month, alias) {
  // console.log('enterFind')
  let flag = 0
  month.people.forEach(person => {
    if ((person.principle === 'TM' || person.principle === 'TA') && person.alias === alias) {
      // console.log('Found')
      flag = 1
    }
  })
  // console.log('notFound')
  if (flag === 1) { return true } else { return false }
}

/* Function to insert records to a given month */
function incrementMonth (month, people) {
  console.log('Incremental push')
  people.forEach(person => {
    month.people.push(person)
  })
  return month
}

/* Function to update records from a given month */
function updateMonth (month, people) {
  console.log('updateMonth')
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
  console.log('decrementMonth')
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

/* API to get a certain month data */
router.get('/:pod/:year/:month', async (ctx) => {
  var p = ctx.params
  try {
    var result = await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    if (result == null) {
      throw (errorMsg)
    } else ctx.body = result
  } catch (e) {
    ctx.status = 404
    ctx.body = e
    console.log(e)
  }
})

/* API for update employee dayType Update one dayType of one person each time */
router.post('/:pod/:year/:month/:person/:day', bodyParser(), async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  console.log(b)
  try {
    var currentMonth = await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    if (currentMonth == null) { throw (errorMsg) }
    var day = currentMonth.people.id(p.person).days.id(p.day)
    day.workType = b.workType
    day.workDay = b.workDay
    var result = await currentMonth.save()
    // if indexes are set, emit update
    if (b.indexes !== undefined) { io.to('/' + p.year + '/' + p.month).emit('update', b) }
    ctx.body = result
  } catch (e) {
    ctx.status = 400
    ctx.body = e
    console.log(e)
  }
})

/* API for batch update employee dayType to Morning Shift or Night Shift one person each time */
router.post('/:pod/:year/:month/batch/:person/:workType', async (ctx) => {
  var p = ctx.params
  var flag = 0
  try {
    var currentMonth = await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
    if (currentMonth == null) { throw (errorMsg) }
    currentMonth.people.forEach(record => {
      if (record.alias === p.person) {
        flag = 1
        record.days.forEach(day => {
          if (day.workType === 'W' || day.workType === 'MS' || day.workType === 'NS') {
            day.workType = p.workType
            if (p.workType === 'NS') {
              day.workDay = 5
            } else if (p.workType === 'MS' || p.workType === 'W') { day.workDay = 1 }
          }
        })
      }
    })
    var result = await currentMonth.save()
    if (flag === 0) { ctx.body = 'No Record' } else { ctx.body = result }
  } catch (e) {
    ctx.status = 400
    ctx.body = e
    console.log(e)
  }
})

/* API to insert records to a given month with given alias and a default dayType
 *
 * raw request.body (for postman):
 *       {"principle":"None",
 *        "role":"Vendor",
 *        "alias":"lilpump",
 *        "name":"Lil Pump"}
 */
router.post('/:pod/:year/:month/person', upload.any('csv'), bodyParser(), async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  var currentMonth = await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
  // eslint-disable-next-line no-array-constructor
  var people = await modifyTemplate(Number(p.year), Number(p.month), b.people)
  var payload
  if (b.principle === 'TM' || b.principle === 'TA') { // add TM/TA role to a team member
    if (!findRecord(currentMonth, b.alias)) {
      ctx.body = 'This is not a team member. Please add him to your team first'; return
    } else if (findPrinciple(currentMonth, b.alias)) {
      ctx.body = 'This person is already TM/TA'; return
    } else {
      payload = updateMonth(currentMonth, people)
      ctx.body = 'Permission is Added to the Person'
    }
  } else { // add a team member
    if (findRecord(currentMonth, b.alias)) {
      ctx.body = 'Record exist'; return
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
})

/* API to delete records from a given month with given alias
 *
 * json raw request.body
 *        {"alias":"apac"}
 */
router.post('/:pod/:year/:month/delete', bodyParser(), async (ctx) => {
  var p = ctx.params
  var b = ctx.request.body
  var currentMonth = await Month.findOne({ year: p.year, month: p.month, pod: p.pod })
  // eslint-disable-next-line no-array-constructor
  var people = await modifyTemplate(Number(p.year), Number(p.month), b.people)
  var payload
  if (b.principle === 'TM' || b.principle === 'TA') { // add TM/TA role to a team member
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
})

async function modifyTemplate (year, month, peopleSrc) {
  if (typeof (year) !== 'number' || typeof (month) !== 'number') { return }
  var filepath = './uploads/calendarTemplate.txt'
  var days = new Date(year, month, 0).getDate()
  var monthArr = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  var name = monthArr[month - 1]
  var str = ''
  str += name
  for (var i = 0; i < days; i++) {
    str += ','
  }
  str += '\nEmployee Name'
  for (i = 0; i < days; i++) {
    str += ',' + (i + 1).toString()
  }
  str += '\n%DefaultName% (DefaultAlias-DefaultRole-DefaultPrinciple)'
  for (i = 0; i < days; i++) {
    var tmp = year + '-' + month + '-' + (i + 1)
    var dayptr = new Date(tmp).getDay().toString()
    var type = ''
    if (dayptr === '0' || dayptr === '6') {
      type = 'PH'
    } else {
      type = 'W'
    }
    str += ',' + type
  }
  // console.log(str)
  fs.writeFile(filepath, str, { flag: 'w', encoding: 'utf-8', mode: '0666' }, function (e) { console.log(e) })

  var src = await fs.createReadStream(filepath)
  var people = await json(src)
  people[0].alias = peopleSrc[0].alias
  people[0].name = peopleSrc[0].name
  people[0].role = peopleSrc[0].role
  people[0].principle = peopleSrc[0].principle
  for (var cnt = 1; cnt < (peopleSrc).length; cnt++) {
    people[cnt] = Object.assign({}, people[0]) // shallow copy
    people[cnt].alias = peopleSrc[cnt].alias
    people[cnt].name = peopleSrc[cnt].name
    people[cnt].role = peopleSrc[cnt].role
    people[cnt].principle = peopleSrc[cnt].principle
  }
  return people
};

/* API to Very First Calendar Generator for a new team
 * to join the tool initiate their data about members
 *
 * json raw request.body
 *          {"people":
 *           [{
 *            "principle":"None",
 *            "role":"Vendor",
 *            "alias":"lilpump",
 *            "name":"Lil Pump"
 *           },
 *           {
 *            "principle":"TA",
 *            "role":"FTE",
 *            "alias":"danzha",
 *            "name":"Danielle Zhao"
 *           }]
 *          }
 */
router.post('/:pod/newupload2/:year/:month', upload.any('csv'), bodyParser(), async (ctx) => {
  // var uploadDict = ['january', 'february', 'march', 'april', 'may',
  //   'june', 'july', 'august', 'september', 'october', 'november', 'december']
  var p = ctx.params
  var b = ctx.request.body
  var people = await modifyTemplate(Number(p.year), Number(p.month), b.people)

  // eslint-disable-next-line no-array-constructor
  var daylock = new Array()
  var payload = newMonth(p.year, p.month, p.pod, daylock, people)
  try {
    await payload.save()
    ctx.body = 'success'
  } catch (e) {
    console.log('System Error: crash at insert record' + e)
    ctx.status = 400
    ctx.body = 'error'
  }
})

io.on('connection', socket => {
  socket.join(socket.handshake.query.path)
  socket.on('hello', socket => {
    console.log(socket.rooms)
  })
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve(path.resolve(__dirname, staticPath)))
// catch all for Vue app
  .use(async ctx => { await send(ctx, 'index.html', { root: path.resolve(__dirname, staticPath) }) })

server.listen(process.env.PORT || 3030, () => {
  console.log('Listening on ' + (process.env.PORT || 3030))
})

/********************************
 items below are no longer used APIs
 ********************************/

/*
    //  update the new calendar by upload a csv
    //  which is no longer used in the project
    //  only for back up
    //
    router.post('/:pod/upload/:year/:month', upload.any('csv'), async (ctx) => {
      var p = ctx.params
      const tmpPath = ctx.req.files[0].path
      console.log(tmpPath)
      const src = fs.createReadStream(tmpPath)
      const people = await json(src)
      const currentMonth = await Month.findOne({ year: p.year, month: p.month, section: p.pod })
      var payload
      // eslint-disable-next-line no-array-constructor
      var daylock = new Array()
      if (currentMonth == null) { payload = newMonth(p.year, p.month, p.pod, daylock, people)
      } else { payload = incrementMonth(currentMonth, people) }
      try {
        await payload.save()
        ctx.body = 'success'
      } catch (e) {
        ctx.status = 400
        ctx.body = 'error'
        console.log(e)
      }
    })

    // Very First Calendar Generator
    // for a new team to join the tool
    // initiate their data about members
    // test-version
    //
    router.post('/:pod/newupload/:year/:month', upload.any('csv'), async (ctx) => {
      var p = ctx.params
      const tmpPath = ctx.req.files[0].path
      console.log(tmpPath)
      const src = fs.createReadStream(tmpPath)
      const people = await json(src)
      // eslint-disable-next-line no-array-constructor
      const daylock = new Array()
      var payload = newMonth(p.year, p.month, p.pod, daylock, people)
      try {
        await payload.save()
        ctx.body = 'success'
      } catch (e) {
        ctx.status = 400
        ctx.body = 'error'
        console.log(e)
      }
    })

    // Function to restore calendar template, back to empty
    function cleanCalendar (filePth) {
      var data = fs.readFileSync(filePth)
      var strData = data.toString()
      var arrData = strData.split('\r\n')
      fs.writeFile(filePth, arrData[0] + '\r\n' + arrData[1], { flag: 'w', encoding: 'utf-8', mode: '0666' }, function (err) {
        if (err) {
          return console.error('System Error: crash at clean calendar' + err)
        }
      })
    }

    // API to initiate
    // records for a given month,
    // (1/2) build the default template
    //
    router.post('/:pod/:year/:month/init', upload.any('csv'), async (ctx) => {
      var monthArr = ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December']
      // compare current month and target month
      // if target month == current month + 1
      // the initiate process goes on, else it stop
      var p = ctx.params
      var lastMon = (p.month - 1) % 12 ? (p.month - 1) % 12 : 12
      var lastYear = lastMon === 12 ? p.year - 1 : p.year
      var thisMon = new Date().getMonth() + 1
      var flag = false
      var str2 = (p.year).toString() + '-' + (p.month).toString() + '-'
      console.log('initiate ' + str2 + ' Calendar')
      console.log('last calendar:' + lastYear + '-' + lastMon)
      if (thisMon === lastMon) { flag = true }
      // eslint-disable-next-line no-array-constructor
      var arrMonth = new Array()
      var lastMonth = await Month.findOne({ year: lastYear, month: lastMon, pod: p.pod })
      var filePath = './uploads/months/' + monthArr[p.month - 1] + '.txt'
      var dayNum = new Date(p.year, p.month, 0).getDate()
      var cnt = 0
      cleanCalendar(filePath)
      if (flag) {
        setTimeout(function () {
          while (cnt < dayNum) {
            var tmp = str2 + (cnt + 1).toString()
            var dayPtr = new Date(tmp).getDay().toString()
            if (dayPtr === '0' || dayPtr === '6') {
              // "0" stands Sundays & "6" stands Saturdays
              arrMonth[cnt] = 'PH'
            } else {
              arrMonth[cnt] = 'W'
            }
            cnt++
          }
          var str3 = arrMonth.join(',')
          str3 = '\r\n%DefaultName% (DefaultAlias-DefaultRole-DefaultPrinciple),' + str3
          lastMonth.people.forEach(person => {
            console.log(person.name)
            fs.writeFile(filePath, str3, { flag: 'a', encoding: 'utf-8', mode: '0666' },
              function (err) {
                if (err) { return console.error(err) }
              })
          })
        }, 50)
      }
    })

    // API to initiate
    // records for a given month,
    // (2/2) filling with the given data
    //
    router.post('/:pod/:year/:month/reload', upload.any('csv'), async (ctx) => {
      var monthArr = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      // compare current month and target month
      // if target month == current month + 1
      // the initiate process goes on, else it stop
      var p = ctx.params
      var lastMon = (p.month - 1) % 12 ? (p.month - 1) % 12 : 12
      var lastYear = lastMon === 12 ? p.year - 1 : p.year
      var thisMon = new Date().getMonth() + 1
      var flag = false
      if (thisMon === lastMon) { flag = true }
      var filePath = './uploads/months/' + monthArr[p.month - 1] + '.txt'
      // if target month == current month + 1
      // replace the default data (alias, name, role, principle)
      // with data from last month
      if (flag) {
        var src = await fs.createReadStream(filePath)
        var people = await json(src)
        var lastMonth = await Month.findOne({ year: lastYear, month: lastMon, pod: p.pod })
        var countNum = 0
        people.forEach(person => {
          person.alias = lastMonth.people[countNum].alias
          person.name = lastMonth.people[countNum].name
          person.role = lastMonth.people[countNum].role
          person.principle = lastMonth.people[countNum].principle
          countNum++
        })
        // eslint-disable-next-line no-array-constructor
        var daylock = new Array()
        var payload = newMonth(p.year, p.month, p.pod, daylock, people)
        try {
          await payload.save()
          ctx.body = 'Record Saved'
        } catch (e) {
          ctx.status = 400
          ctx.body = e
          console.log(e)
        }
        // restore calendar generator data
        // help it back to empty
        setTimeout(function () {
          cleanCalendar(filePath)
        }, 2000)
      }
    })
*/
