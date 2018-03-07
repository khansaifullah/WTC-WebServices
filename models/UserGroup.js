// grab the things we need

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose.Promise = global.Promise;
// create a schema

//mongoose.createConnection('mongodb://localhost/aldaalah');

var userGroupSchema = new Schema({
  
   group_id:String,
   user_id:String
  //updated_at: Date
});



// the schema is useless so far
// we need to create a model using it
var UserGroup = mongoose.model('UserGroup', userGroupSchema);

// make this available to our users in our Node applications
module.exports = UserGroup;