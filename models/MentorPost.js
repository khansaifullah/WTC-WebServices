var mongoose = require('mongoose');
var User = require('./User');
var Mentor = require('./Mentor');
var Post = require('./Post');
//var Conversation = require('./Conversation');

// Define our schema
var MentorPostSchema   = new mongoose.Schema({

    _postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    _mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor'},
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    show:{ type: Boolean, default: true}
   
} , {timestamps: true});
//OwnerSchema.index({createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('MentorPost', MentorPostSchema);