//Import the mongoose module
let db = require('../../core/mongoConnection');
let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schemaOptions = {
	timestamps: true,
	toObject: {
		virtual: true
	},
	toJSON: {
		virtuals: true
    },
    collection: 'engineer'
};

//create schema
const EngineerSchema = new Schema({
	Alias: {
		type: String,
        lowercase: true,
        required: true
    },
    Teamname: {
        type: String,
        uppercase: true,
    },
    Type: {
        type: String,
    },
}, schemaOptions);

//create model
let EngineerModel = mongoose.model('Engineer', EngineerSchema);
module.exports = EngineerModel;
