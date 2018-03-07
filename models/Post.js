var mongoose = require('mongoose');
var User = require('./User');
//var Conversation = require('./Conversation');

// Define our schema
var PostSchema   = new mongoose.Schema({

    //_conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    _postedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

   
} , {timestamps: true});
//OwnerSchema.index({createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('Post', PostSchema);