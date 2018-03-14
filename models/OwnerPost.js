var mongoose = require('mongoose');
var User = require('./User');
var Owner = require('./Owner');
var Post = require('./Post');
//var Conversation = require('./Conversation');

// Define our schema
var OwnerPostSchema   = new mongoose.Schema({

    _postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    _ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner'},
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    show:{ type: Boolean, default: true}
   
} , {timestamps: true});
//OwnerSchema.index({createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('OwnerPost', OwnerPostSchema);