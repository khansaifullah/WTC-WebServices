// grab the things we need
var Country = require('./Country');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose.Promise = global.Promise;
// create a schema

//mongoose.createConnection('mongodb://localhost/aldaalah');

var userSchema = new Schema({
  
   // username: { type: String, required: true, unique: true },
      user_name: String, 
      phone: { type: String, required: true, unique: true },
      full_name: String,
      profile_photo_url:{type:String,default:null },
      active:Boolean, 
      OS:String,
      email:{ type: String, required: true, unique: true },
      password:String,
      verified_user:Boolean,
	    deactivate_user:{ type: Boolean, default: false },
      country_code:String,
      verification_code:String,
      palyer_id:String,
      share_location:{ type: Boolean, default: true },
      share_loc_flag_time:{ type: Date, default: Date.now },
      user_type:String,
      loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
        },
      last_shared_loc_time: { type: Date, default: Date.now }
         
}, {timestamps: true});

userSchema.index({phone:1});
//userSchema.index({ loc: '2d' });

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;