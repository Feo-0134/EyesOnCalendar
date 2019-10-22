//Import the mongoose module
let db = require('../../core/mongoConnection');
let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schemaOptions = {
	// timestamps: true,
	toObject: {
		virtual: true
	},
	toJSON: {
		virtuals: true
    },
    collection: 'team'
};

//create schema
const TeamSchema = new Schema({
	TEAMNAME: {
		type: String,
        uppercase: true,
        unique: true
	},
	TM: [{
		type: String,
		unique: true,
		lowercase: true,
	}],
	TA: [{
		type: String,
		unique: true,
		lowercase: true,
	}],
	FTE: [{
		type: String,
		unique: true,
		lowercase: true,
	}],
	VENDOR: [{
		type: String,
		unique: true,
		lowercase: true,
	}],
	INTERN: [{
		type: String,
		unique: true,
		lowercase: true,
	}],
	OTHERS: [{
		type: String,
		unique: true,
		lowercase: true,
	}],
}, schemaOptions);

//create model
let TeamModel = mongoose.model('Team', TeamSchema);
module.exports = TeamModel;
