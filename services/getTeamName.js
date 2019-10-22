const models = require('../models/NewMonth')
const Month = models.Month

const routerTeamName = async (ctx) => {
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
}

const listTeamName = async (ctx) => {
  var p = ctx.params
  try {
    var result = await Month.find({ year: p.year, month: p.month })
    if (result == null) {
      console.log('Records not found.')
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
}

const listAllTeamName = async (ctx) => {
  var p = ctx.params
  try {
    var result = await Month.find({ year: p.year, month: p.month })
    if (result == null) {
      console.log('Records not found.')
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
}

const getTeamName = {
  routerTeamName: routerTeamName,
  listTeamName: listTeamName,
  listAllTeamName: listAllTeamName
}

module.exports = getTeamName
