var mongoose = require('mongoose');
var User = require('./User');
var Post = require('./Post');
//var Conversation = require('./Conversation');

// Define our schema
var TopStorySchema   = new mongoose.Schema({

    _postId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'Post'},
    show:{ type: Boolean, default: true}
   
} , {timestamps: true});
//OwnerSchema.index({createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('TopStory', TopStorySchema);