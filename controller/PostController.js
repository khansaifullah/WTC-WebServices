const _ = require('lodash');
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var Owner = require('../models/Owner.js');
var Post = require('../models/Post.js');
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