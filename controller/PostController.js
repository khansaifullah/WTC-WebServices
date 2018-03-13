const _ = require('lodash');
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var Owner = require('../models/Owner.js');
var Post = require('../models/Post.js');
var TopStory = require('../models/TopStory.js');
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
var ObjectId = require('mongoose').Types.ObjectId;

var pageSize=10;

exports.findAllPosts=function(_id,callback){
 
    try{
		if (ObjectId.isValid(_id)){

			logger.info("Valid Object Id");
	
			Post.find({'_id': {'$gt': _id}}, function(err, posts) {
				if (err){ 
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
				} 
				}).limit(pageSize);
		}else {
			logger.info("In Valid Object Id");
			Post.find({}, function(err, posts) {
				if (err){
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
					//process.exit();
				} 
				}).limit(pageSize);
		}
     
		}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}


exports.findTopStories=function(id,res,callback){
    
    try{
	
			TopStory.find({},{ _postId: 1, _id:0 },function(err,stories){
				if (err){
					res.status(400).send({status:"Failure",
											message:err,
											object:[]
										});
				}
						
				else{ 
					
					logger.info(stories.length + ' stories Found');
					logger.info(stories.length + stories);
					var postids=[];
					stories.forEach(story => {
						postids.push(story._postId);
					});
					
					if (ObjectId.isValid(id)){

						Post.find({$and: [ { _id:postids }, { _id: {'$gt': id}}  ]}, function(err, posts) {
							if (err){
								logger.info("Error Occured While Finding Top Story Posts"+err );
								res.status(400).send({status:"Failure",
														message:err,
														object:[]
								});
							}					
							else{ 
								logger.info(posts.length + 'Top Story posts Found');
								callback(posts);		
							} 
						}).limit(pageSize);
					}
					else{
						Post.find({ _id:postids}, function(err, posts) {
							if (err){
								logger.info("Error Occured While Finding Top Story Posts"+err );
								res.status(400).send({status:"Failure",
														message:err,
														object:[]
								});
							}					
							else{ 
								logger.info(posts.length + 'Top Story posts Found');
								callback(posts);		
							} 
						}).limit(pageSize);
					}
				
				} 

			});
   
		}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}

exports.myPosts=function(postId,userId,callback){
 
    try{
		//userId="5aa80c922d3fdd0014a06694";
		if (ObjectId.isValid(postId)){

			logger.info("Valid Object Id");
			Post.find({$and: [ { _postedByUserId:userId }, { _id: {'$gt': id}}  ]}, function(err, posts) {
			//Post.find({'_id': {'$gt': postId}}, function(err, posts) {
				if (err){ 
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
				} 
				}).limit(pageSize);
		}else {
			logger.info("In Valid Object Id");
			Post.find({ _postedByUserId:userId }, function(err, posts) {
				if (err){
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
					//process.exit();
				} 
				}).limit(pageSize);
		}
     
		}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}

exports.addToTopStories = function (reqData,res){
   
	var postId=reqData.postId;
	logger.info("postId: "+postId);

    var topStory=new TopStory({  
		_postId:postId 	
    });

    topStory.save(function (err, story){
        if(err){
            logger.error('Some Error while Adding Post To Top Stories' + err ); 
          
            res.jsonp({status:"Failure",
            message:"Error while Adding Post To Top Stories",
            object:[]});
        }
        else{
            logger.info('Adding Post To New Top Stories' );
            res.jsonp({status:"Success",
							message:"Post Added To Top Stories",
							object:story});
        
        }
      });
}

exports.findAllQuotes=function(callback){
     
    try{
        
        Quote.find({}, function(err, quotes) {
			if (err){
				 res.status(400).send({status:"Failure",
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

exports.uploadPost = function (req,_attachmentUrl,_thumbnailUrl,_postType,res){
    logger.info("User Received After Authetication: "+req.user._id);
	var desc=req.body.description;
	var title=req.body.title;

    var newPost=new Post({  
    _postedByUserId:req.user._id,
    postType:_postType,
	postDescription:desc,
	title:title,
	attachmentUrl: _attachmentUrl,
	thumbnailUrl:  _thumbnailUrl                    
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