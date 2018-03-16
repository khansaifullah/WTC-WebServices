var mongoose = require('mongoose');
var User = require('./User');
var Owner = require('./Owner');
var Post = require('./Post');
//var Conversation = require('./Conversation');

// Define our schema
var galleryImageSchema   = new mongoose.Schema({

    imageUrl:String,
    imageTitle:String
   
} , {timestamps: true});
//OwnerSchema.index({createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('GalleryImage', galleryImageSchema);