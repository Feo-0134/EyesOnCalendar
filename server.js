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
const upload = multer({ dest: 'uploads/' })
const path = require('path')

require('dotenv').config()

const getTeamName = require('./services/getTeamName.js')
const updateRecords = require('./services/updateRecords.js')

// env params
var staticPath = './client/dist/'
// if (process.env.NODE_ENV === 'production' ||
//  process.env.NODE_ENV === undefined) {
//   staticPath = './client/dist/'
// } else {
//   staticPath = './client/dist/'
// }

// db connection
const db = require('./mongodb')
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('Connected to DB ' + process.env.NODE_ENV)
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

/* API to get a certain month data */
router.get('/:pod/:year/:month', updateRecords.getMonth)

/* API to remove a certain month data */
router.get('/:pod/:year/:month/remove', updateRecords.rmMonth)

/* API for update employee dayType
 * Update one dayType of one person each time
 */
router.post('/:pod/:year/:month/:person/:day', bodyParser(),
  updateRecords.updateDayType)

/* API for batch update employee dayType to
 * Morning Shift or Night Shift one person each time
 */
router.post('/:pod/:year/:month/batch/:person/:workType',
  updateRecords.updateDayTypeBatch)

/* API to insert records to a given month
 * with given alias and a default dayType
 */
router.post('/:pod/:year/:month/person',
  upload.any('csv'), bodyParser(), updateRecords.addPerson)

/* API to delete records from a given month with given alias
 */
router.post('/:pod/:year/:month/delete',
  bodyParser(), updateRecords.removePerson)

/* API to Very First Calendar Generator for a new team
 * to join the tool initiate their data about members
 */
router.post('/:pod/newupload2/:year/:month',
  upload.any('csv'), bodyParser(), updateRecords.initCalendar)

// why needs upload.any('csv')
router.post('/:pod/extendCalendar/:year/:month',
  upload.any('csv'), bodyParser(), updateRecords.extendCalendar)

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
  .use(async ctx => {
    await send(ctx, 'index.html',
      { root: path.resolve(__dirname, staticPath) })
  })

function startServer () {
  server.listen(process.env.PORT || 3030, () => {
    console.log('Listening on ' + (process.env.PORT || 3030))
  })
}

exports.startServer = startServer
