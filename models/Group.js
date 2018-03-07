// grab the things we need

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose.Promise = global.Promise;
// create a schema

//mongoose.createConnection('mongodb://localhost/aldaalah');

var groupSchema = new Schema({
  
   // _id: String,
   // username: { type: String, required: true, unique: true },
      group_name: String,
      admin_id: String,
     group_photo_url:String,
      created_at:Date
  //updated_at: Date
});



// the schema is useless so far
// we need to create a model using it
var Group = mongoose.model('Group', groupSchema);

// make this available to our users in our Node applications
module.exports = Group;