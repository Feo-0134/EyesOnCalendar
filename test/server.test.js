const request = require('superagent')
const expect = require('chai').expect

describe( '开始测试demo的请求', () => {
  it('测试/getString.json请求', (done) => {
    request
      .post('http://localhost:3030/api/test/newupload2/2019/11',
        { people:
          [{
            principle: 'None',
            role: 'Vendor',
            alias: 'lilpump',
            name: 'Lil Pump'
          }]
        }
      )
      .end((err, res) => {
        expect(res).to.be.an('object')
        console.log(res)
        done()
        console.log(err)
      })
  })
})
