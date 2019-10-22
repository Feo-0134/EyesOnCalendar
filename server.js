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

const getTeamName = require('./services/getTeamName.js')

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
router.get('/getpod/:year/:month/:alias', getTeamName.routerTeamName)

/* API return teamName (for autocomplete when pick teamName) */
router.get('/:pod/:year/:month/ownTeamName/:alias', getTeamName.listTeamName)

/* API return all team name data for su */
router.get('/:pod/:year/:month/allTeamName', getTeamName.listAllTeamName)

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

function startServer () {
  server.listen(process.env.PORT || 3030, () => {
    console.log('Listening on ' + (process.env.PORT || 3030))
  })
}

exports.startServer = startServer
