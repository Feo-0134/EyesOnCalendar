//Import the mongoose module
let db = require('../../core/mongoConnection');
let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schemaOptions = {
    toObject: {
		virtual: true
	},
	toJSON: {
		virtuals: true
    },
    collection: 'manager'
};

//create schema
const ManagerSchema = new Schema({
    Team: {
        type: String,
        uppercase: true,
    },
    Alias: [{
        type: String,
        lowercase: true,
        unique: true,
    }],
    operationlog: [{
        alias : String,
        operationtime  : String,
        operationtype : String,
        operationresult  : Date,
    }],
}, schemaOptions);

//create model
let ManagerModel = mongoose.model('Manager', ManagerSchema);
module.exports = ManagerModel;
