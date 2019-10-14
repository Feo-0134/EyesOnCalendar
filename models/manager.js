let Managers = require('./ManagerSchema');

// default data
let managers = ['anikshen', 'danzha', 't-jucheng', 'v-jelu'];
let team = 'AZURE PAAS APP SERVICE';

// create default manager
exports.createManager = async (ctx, next) => {
    const manager = new Managers(
        {
            Team: ctx.params.manager || team,
            Alias: managers
        }
    );
    ctx.body = await manager.save()
        .then(data => {
            console.log('add manager success');
            return data;
        })
        .catch(err => {
            console.log('add manager fail' + err);
            return err;
        })
};


// add manager
// team + alias
exports.addManager = async (ctx, next) => {
    ctx.body = await Managers.updateOne(
        {
            Team: ctx.query.team || team
        },
        {
            $push: {
                Alias: [
                    ctx.query.alias
                ]
            }
        }, { upsert : true })
        .then(data => {
            console.log('add manager success');
            return data;
        })
        .catch(err => {
            console.log('add manager fail' + err);
            return err;
        })
};


// find manager and return team name
exports.findmanager = async (ctx, next) => {
    ctx.body = await Managers.findOne({ Alias: ctx.query.alias || "v-jelu" }, { Team: 1 })
        .then(data => {
            console.log('findmanager success ' + ctx.query.alias);
            // add teamname in session
            return data.Team;
        })
        .catch(err => {
            console.log('findmanager error');
            return err;
        })
}

