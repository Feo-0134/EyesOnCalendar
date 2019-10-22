let Team = require('./TeamSchema');
let Managers = require('./ManagerSchema');
let Role = require('../../core/teamRole');

// get alias from AAD session
let alias = 'v-jelu';


// create default data
exports.createDefault = async (ctx, next) => {
    const team = new Team({
        TEAMNAME: ctx.query.teamname || 'Azure PaaS App Service',
        TM: ctx.query.tm || 'Karen Zheng',
        TA: ctx.query.ta || 'Anik Shen',
        FTE: ctx.query.fte || 'DANINELLE Zhao',
        VENDOR: ctx.query.vendor || 'Jery lu',
        INTERN: ctx.query.intern || 'Juncheng',
        OTHERS: ctx.query.others || 'others',
    });

    ctx.body = await team.save()
        .then(data => {
            console.log('create default team success');
            return data;
        })
        .catch(err => {
            console.log('create default team' + err);
            return err;
        })
};

// find all team info
exports.findAll = async (ctx, next) => {
    ctx.body = await Team.find()
        .then(data => {
            console.log('findAll Team info success');
            return data;
        })
        .catch(err => {
            return err;
        })
};


// find current team and render portal first page
exports.findCurrentTeam = async (ctx, next) => {
    // only when findmanager return team name, store teamname in session store;
    ctx.body = await Managers.findOne({ Alias: ctx.query.alias || alias }, { Team: 1 })
        .then(data => {
            if (data.Team[0] != "{") {
                // add teamname in session
                console.log("add teamname in session");
                return data.Team;
            } else {
                console.log("invalid alias or could not found the record");
                return "invalid alias or could not found the record";
            }
        })
        .catch(err => {
            console.log('findmanager error');
            return err;
        })
};


/* Danymic Route */
exports.addRocord = async (ctx, next) => {
    let role = ctx.params.role.toUpperCase();
    if (Role.teamRole.includes(role)) {
        // get teamname from session store
        let teamname = 'AZURE PAAS APP SERVICE'
        // route is valid, update mongo document
        if (teamname != '') {
            ctx.body = await Team.updateOne(
                {
                    TEAMNAME: teamname
                },
                {
                    $push: {
                        [role]: [
                            ctx.query.alias
                        ]
                    }
                }, { upsert: true })
                .then(data => {
                    console.log('add' + role + 'success');
                    return data;
                })
                .catch(err => {
                    console.log('add' + role + 'failed' + err);
                    return err;
                })
        } else {
            ctx.body = 'empty team name';
        }
    } else {
        ctx.body = 'false';
    }
}
