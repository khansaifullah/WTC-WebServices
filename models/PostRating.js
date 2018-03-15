var mongoose = require('mongoose');
var User = require('./User');
var Owner = require('./Owner');
var Post = require('./Post');

// Define our schema
var PostRatingSchema   = new mongoose.Schema({

    _postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    _ratedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    ratedValue:{type: Number, default: 0 }
   
} , {timestamps: true});
//OwnerSchema.index({createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('PostRating', PostRatingSchema);