// grab the things we need

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose.Promise = global.Promise;
// create a schema

//mongoose.createConnection('mongodb://localhost/aldaalah');

var countrySchema = new Schema({
  
   // id: String,
    country_id: { type: Number, required: true, unique: true },
    name: String, 
    code:{ type: String, required: true, unique: true },
    shortForm:String
  //updated_at: Date
});
//, { _id: false }
//userSchema.index({phone:1})


// the schema is useless so far
// we need to create a model using it
var Country = mongoose.model('Country', countrySchema);

// make this available to our users in our Node applications
module.exports = Country;