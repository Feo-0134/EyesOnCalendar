const csv = require('csvtojson')

module.exports = function (stream) {
  return new Promise(function (resolve, reject) {
    var x = []
    console.log('reading')
    csv()
      .fromStream(stream)
      .on('csv', (jsonObj) => {
        x.push(jsonObj)
      })
      .on('done', (error) => {
        var msg = 'ma-ta'
        if (error) reject(msg)
        else { resolve(parseCalendar(x)) }
      })
  })
}

var parseCalendar = function (calendar) {
  console.log(calendar)
  // var keys = calendar
  return calendar
    .filter(row => {
      if (row[2] !== '') console.log('OK')
      else console.log('REJECT')
      console.log(row[0])
      return row[2] !== ''
    })
    .filter(row => {
      return row[0] !== 'Employee Name'
    })
    .map(row => {
      var z = {}
      z.id = row[0]
      console.log(z.id)
      z.name = row[0].split('(')[0].trim()
      z.region = row[0].split('(')[1].split('-')[1].split(')')[0]
      row.shift()
      z.days = row.map((y, index) => {
        var q = 0
        if (y === 'V') q = 0
        if (y === 'PH') q = 0
        if (y === 'W') q = 1
        if (y === 'MS') q = 1
        if (y === 'NS') q = 1
        if (y === 'SL') q = 2
        if (y === 'AL') q = 2
        if (y === 'H(M)') q = 2
        if (y === 'H(A)') q = 2
        if (y === 'T') q = 3
        if (y === 'PO') q = 4
        if (y === 'PM') q = 4
        return {
          day: index + 1,
          workType: y,
          workDay: q
        }
      })
      return z
    })
}
