const _ = require('lodash');
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var Owner = require('../models/Owner.js');
var Post = require('../models/Post.js');
var Quote = require('../models/Quote.js');
var Mentor = require('../models/Mentor.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");
var http = require("http");
// We need this to build our post string
var querystring = require('querystring');
//package to generate a random number
var randomize = require('randomatic');



exports.findAllPosts=function(callback){
     
    try{
        Post.find({}, function(err, posts) {
			if (err){
				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(posts.length + ' posts Found');
				callback(posts);
				//process.exit();
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}


exports.findAllQuotes=function(callback){
     
    try{
        
        Quote.find({}, function(err, quotes) {
			if (err){
				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(quotes.length + ' quotes Found');
				callback(quotes);
				//process.exit();
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in findAllQuotes method' + err);
	}
}

exports.uploadPost = function (req,attachmentUrl,res){
    logger.info("User Received After Authetication: "+req.user._id);
    var desc=req.body.description;

    var newPost=new Post({  
    _postedByUserId:req.user._id,
    postType:"video",
    postDescription:desc,
    attachmentUrl: attachmentUrl                      
    });

    newPost.save(function (err, post){
        if(err){
            logger.error('Some Error while Creating New Post' + err ); 
          
            res.jsonp({status:"Failure",
            message:"Error in Creating New Post",
            object:[]});
        }
        else{
            logger.info('New Post Created' );
            res.jsonp({status:"Success",
							message:"File Successfully Uploaded",
							object:post});
            //callback(user);
        }
      });




}


// var newQuote=new Quote({  
//     //_conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
// _postedByUserId: req.user._id,
// quoteText:"Words, without power, is mere philosophy.",
// author:"Allama Iqbal"                      
//     });

//     newQuote.save(function (err, post){
      
//       });