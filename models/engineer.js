let Engineer = require('./EngineerSchema');

// get user alias from mongoStore session
let alias = 'v-jelu'

exports.getEngineerInfo = async (ctx, next) => {
    ctx.body = await Engineer.find()
        .then(data => {
            console.log('findAll Engineer info success');
            return data[0].Alias;
        })
        .catch(err => {
            return err;
        })
}
