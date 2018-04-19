const _ = require('lodash');
var regCtrl= require('../controller/RegistrationController.js');
var AppController= require('../controller/AppController.js');
var ChatController = require('../controller/ChatController.js');
var LocController = require('../controller/LocationController.js');
var NotificationController = require('../controller/PushNotificationController.js');
var PostController= require('../controller/PostController.js');
var AdminController = require('../controller/AdminController.js');
var bodyParser = require('body-parser');
var Country = require('../models/Country.js');
var Conversation = require('../models/Conversation.js');
var User = require('../models/User.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
require('datejs');
cors = require('cors');
var mongoose = require('mongoose');
var path = require('path');
var multer = require('multer');
var FormData = require('form-data');
var http = require('http');
var request=require("request");
var fs = require('fs');

var tempFileName;
var videoFileTempName;
var imageFileTempName;
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/videos')
	},
	filename: function(req, file, callback) {
	
		tempFileName="";
		//videoFileTempName="";
		//imageFileTempName="";
		//console.log("Printing in File Name Field :" + 'file.fieldname : ' + file.fieldname + ' file.originalname :' + file.originalname );
		tempFileName=file.fieldname + '-' + Date.now() + path.extname(file.originalname);
		if (file.fieldname==="image"){
			imageFileTempName=tempFileName;
			logger.info ("Image File Received Temp Name :"+ imageFileTempName);
		} else if (file.fieldname==="video"){
			videoFileTempName=tempFileName;
			logger.info ("Video File Received Temp Name :"+ videoFileTempName);
		}
		//console.log("File NEW Name  :" +tempFileName );
		callback(null,tempFileName );
	}
});


module.exports = function(app) {	
	 
	 
	 //Enable All CORS Requests
	app.use(cors());
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Headers", "*");
		next();
	  });
    app.use(bodyParser.urlencoded({
        extended: true
    }));
	// parse application/json
	app.use(bodyParser.json())

	
	//private route
	var authenticate = (req, res, next) => {

		logger.info("in routes - authenticate ");
		var token = req.header('x-auth');
		//logger.info("Token: "+ token);
		if (token===undefined){
			res.jsonp({ status:"Failure",
			message:"Auth Token Required",
			object:[]});
		}
		else{
			logger.info("Token Received : "+token);
			User.findByToken(token).then((user) => {
				if (!user) {
					logger.info("User Not Found with token :  "+ token);
					return Promise.reject();
				}
			
				req.user = user;
				req.token = token;
				next();
				}).catch((e) => {
				logger.info("Exception Occured in Authenticate: "+e);
				res.status(401).send(res.jsonp({ status:"Failure",
									message:"Unable To Authenticate",
									object:[]}));
				});
		}	
	};
	
	
	app.get('/', function(req, res) {
		res.end("WTC-WebServices"); 
	});

	app.post('/register',function(req,res){                         
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body");  
		 }
			 
		 logger.verbose('register-POST called '); 
		 var reqData=req.body;
		 logger.info("in routes /register - Req Data : "+ reqData);
		 regCtrl.register(reqData,res);	
	 
	 });

	 app.post('/admin/register',function(req,res){                         
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body");  
		 }
			 
		 logger.verbose('/admin/register-POST called '); 
		 var reqData=req.body;
		 logger.info("in routes /admin/register - Req Data : "+ reqData);
		 regCtrl.adminRegister(reqData,res);	
	 
	 });
	
	app.post('/login', (req, res) => {
		if(req.body === undefined||req.body === null) {
			res.end("Empty Body");  
			}
				
			logger.verbose('login-POST called ');	
			var reqData=req.body;
			//console.log("reqData : "+ reqData.phoneNo);
			// let phoneNo = req.query.phoneNo;;
			logger.info("in routes /login - Req Data : "+ reqData);   
			regCtrl.login(reqData,res);
		
	});


	app.post('/admin/login', (req, res) => {
		if(req.body === undefined||req.body === null) {
			res.end("Empty Body");  
			}
				
			logger.verbose('login-POST called ');	
			var reqData=req.body;
			//console.log("reqData : "+ reqData.phoneNo);
			// let phoneNo = req.query.phoneNo;;
			logger.info("in routes /login - Req Data : "+ reqData);   
			regCtrl.adminLogin(reqData,res);
		
	});
	var upload = multer({ storage : storage });

	app.post('/upload/video2',authenticate,upload.fields([{ name: 'video', maxCount: 1}, { name: 'image', maxCount: 1}]),
	 function(req, resp, next){

		logger.info ("File Is uploaded New Method");
		//logger.info ("Description : " + req);

		var form = new FormData();
		//console.log("form.append 1");
		console.log("videoFileTempName: "+videoFileTempName);
		console.log("imageFileTempName: "+imageFileTempName);
		form.append('video', fs.createReadStream( './/public//videos//'+videoFileTempName));
		//console.log("form.append 2");
		form.append('image', fs.createReadStream( './/public//videos//'+imageFileTempName));
		//console.log("form.append 3");
		form.submit('http://brandedsms.net/postvideo/postvideoNew.php', function(err, res) {
			console.log("In submit");
			if (err){
				logger.info("Error : "+ err);
				resp.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
			}else{
				console.log("In else");
				var body = '';
				res.on('data', function(chunk) {
				  body += chunk;
				});
				res.on('end', function() {
				  console.log("body : "+body);
				  var urls = JSON.parse(body);
				  console.log("video : "+urls.videourl);
				  var videoUrl=urls.videourl;
				  var imageUrl=urls.imageurl;
			
				PostController.uploadPost(req,videoUrl,imageUrl,"video",resp);  
				logger.info ("Setting tempFileNames to Null");
				tempFileName="";
				videoFileTempName="";
				imageFileTempName="";
				});
			}	
		});
		
	});

	app.post('/topStory',authenticate,function(req,res){                         
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body");  
		 }
			 
		 logger.verbose('topStory-POST called '); 
		 var reqData=req.body;
		 logger.info("in routes post /topStory - Req Data : "+ reqData);
		 PostController.addToTopStories(reqData,res);	
	 
	 });
	
	 app.get('/topStory',authenticate,function(req,res){   
		logger.info("User Received After Authetication: "+req.user.email);

		var id = req.query.id;
		logger.info("id : "+id);
		PostController.findTopStories(id,res,function (posts) {
			logger.info("Response Of findTopStories Method");
			res.jsonp({ status:"Success",
			message:"List Of Posts",
			object:posts});
	 
	 	});

		});
		
	// 	//update topStory
	app.put('/topStory',function(req,res){
			
		if(req.body === undefined||req.body === null) {
		res.end("Empty Body"); 
		}
		console.log("in routes PUT : /topStory");
		var reqData=req.body;
		PostController.updateTopStory(reqData,res);
	});


	// 	// delete topStory
	// app.delete('/topStory',function(req,res){

	// 	if(req.body === undefined||req.body === null) {
	// 	res.end("Empty Body"); 
	// 	}
	// 	var storyId = req.query.storyId;
	// 	console.log("in routes delete /topStory");
		
	// 	PostController.deleteMarkerCategory(categoryId,res);
	// });

	app.post('/ratePost',authenticate,function(req,res){                         
		logger.info("User Received After Authetication in /ratePost: "+req.user._id);
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body");  
		 }
			 
		 logger.verbose('ratePost-POST called '); 
		 //var reqData=req.body;
		 logger.info("in routes post /ratePost  : ");
		 PostController.ratePost(req,res);	
	 
	 });

	app.get('/myVideos', authenticate,function(req, res) {
		logger.info("User Received After Authetication in /myVideos: "+req.user.email);
		var postId = req.query.id;
		var userId=req.user._id;
		logger.info("postId : "+postId);
		logger.info("userId : "+userId);
		PostController.myPosts(postId,userId,function (posts) {
			logger.info("Response Of myPosts Method");
			res.jsonp({ status:"Success",
			message:"List Of Posts",
			object:posts});
											
		});	

	});

	app.get('/ideas', authenticate,function(req, res) {
		logger.info("User Received After Authetication: "+req.user.email);
		var id = req.query.id;
		logger.info("id : "+id);
		PostController.ownersIdeas(id,function (posts) {
			logger.info("Response Of ownersIdeas Method");
			res.jsonp({ status:"Success",
			message:"List Of Posts",
			object:posts});
											
		});	
	
	});
		
	app.post('/upload/video', authenticate, function(req,res){

		logger.info("in routes - upload/video : " );
		//console.log("File"+req.files.videoFile);
		logger.info("User Received After Authetication: "+req.user.email);
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
    
	var fileToUpload;

		var upload = multer({
			storage: storage,
			fileFilter: function(req, file, callback) {
				fileToUpload=file;
				var ext = path.extname(file.originalname)
				if (ext !== '.mp4' && ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
					return callback(res.end('Only images and Videos are allowed'), null)
				}
				callback(null, true)
			}
		}).single('videoFile');
		
		upload(req, res, function(err) {
			if (err){
				logger.info("Error Uploading File : "+err);				
				res.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
			}
			else{
			logger.info ("File Is uploaded");

			var form = new FormData();
			form.append('video', fs.createReadStream( './/public//videos//'+tempFileName));
			form.append('image', fs.createReadStream( './/public//videos//'+tempFileName));
			form.submit('http://brandedsms.net/postvideo/postvideoNew.php', function(err, res) {
				if (err){
					logger.info("Error : "+ err);
				}
				var body = '';
				res.on('data', function(chunk) {
				  body += chunk;
				});
				res.on('end', function() {
				  console.log("body : "+body);
				  var urls = JSON.parse(body);
				  console.log("video : "+urls.videourl);
				  var videoUrl=urls.videourl;
				  var imageUrl=urls.imageurl;
			
				PostController.uploadPost(req,videoUrl,imageUrl,"video",res);  
				logger.info ("Setting tempFileNameto Null");
				tempFileName="";
				});
			
			});
			logger.info("tempFileName 1: "+tempFileName);

			}
			
		})
		
	});
	
	app.get('/timeline', authenticate,function(req, res) {
		logger.info("User Received After Authetication: "+req.user.email);
		var id = req.query.id;
		logger.info("id : "+id);
		PostController.findAllPosts(id,function (posts) {
			logger.info("Response Of findAllPosts Method");
			res.jsonp({ status:"Success",
			message:"List Of Posts",
			object:posts});
										 
		});	

		});

		
	app.post('/quote',authenticate,function(req,res){                         
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body");  
		 }
			 
		 logger.verbose('quote-POST called '); 
		 var reqData=req.body;
		 logger.info("in routes post /quote - Req Data : "+ reqData.author);
		 PostController.addQuote(reqData,res);	
	 
	 });
	app.get('/quotes', authenticate,function(req, res) {
		logger.info("User Received After Authetication: "+req.user.email);

		PostController.findAllQuotes(function (quotes) {
			logger.info("Response Of findAllQuotes Method");
			res.jsonp({ status:"Success",
			message:"List Of Quotes",
			object:quotes});
										 
		});	

	});
	
// 	//update Quote
		 app.put('/quote',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 console.log("in routes PUT : /quote");
			 var reqData=req.body;
			 PostController.updateQuote(reqData,res);
		 });


// 	// delete Quote
		 app.delete('/quote',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 var quoteId = req.query.categoryId;
			 console.log("in routes delete /quote");
			
			 PostController.deleteQuote(quoteId,res);
		 });
	

		 // Post Image to Gallery
		//  app.post('/gallery/image',authenticate,function(req,res){                         
		
		// 	if(req.body === undefined||req.body === null) {
		// 	 res.end("Empty Body");  
		// 	 }
				 
		// 	 logger.verbose('/gallery/image-POST called '); 
		// 	 var reqData=req.body;
		// 	 logger.info("in routes post /gallery/image ");
		// 	 PostController.addQuote(reqData,res);	
		 
		//  });
		 app.post('/gallery/image',authenticate,upload.fields([ { name: 'image', maxCount: 1}]),
		 function(req, resp, next){
	
			logger.info ("Image is Uploaded");
			
			var form = new FormData();
			
			console.log("imageFileTempName: "+imageFileTempName);
			//form.append('video', fs.createReadStream( './/public//videos//'+videoFileTempName));
			form.append('image', fs.createReadStream( './/public//videos//'+imageFileTempName));
			form.submit('https://brandedsms.net/postvideo/postimage.php', function(err, res) {
				 

				console.log("In submit");
				if (err){
					logger.info("Error : "+ err);
					resp.jsonp({status:"Failure",
								message:"Error Uploading Image",
								object:[]});
				}else{
					console.log("In else");
					var body = '';
					res.on('data', function(chunk) {
					  body += chunk;
					});
					res.on('end', function() {
					  console.log("body : "+body);
					  var urls = JSON.parse(body);
					  console.log("video : "+urls.imageurl);
					 
					  var imageUrl=urls.imageurl;
				
					PostController.uploadImageForGallery(req,imageUrl,resp);  
					logger.info ("Setting tempFileNames to Null");
					tempFileName="";
					videoFileTempName="";
					imageFileTempName="";
					});
				}	
			});
			
		});

		 //Get list of Images for Gallery
		app.get('/gallery/images', authenticate,function(req, res) {
			logger.info("User Received After Authetication: "+req.user.email);
			var id = req.query.id;
			logger.info("id : "+id);
			PostController.getImageGallery(id,function (images) {
				logger.info("Response Of getImageGallery Method");
				res.jsonp({ status:"Success",
				message:"List Of Gallery Images",
				object:images});
												
			});	

		});

		
	/********  Admin Panel Apis********/
	
	 // getting List of users
	 app.get('/users', authenticate, function(req,res){ 
      	
		logger.info("In routes get users");
		AppController.findAllUser(function (users) {
            logger.info("Response Of findAllUser Method");
			res.jsonp({ status:"Success",
                        message:"List Of users",
                        object:users});
                             
	});		
	});
	 		 // getting User  By user id in Query Params
	app.get('/user', authenticate, function(req,res){
      	//var email = req.body.email;
		let email = req.query.email;
		logger.info("In routes get single user, where email : "+email);
		AppController.userExists(email,function (user) {
            logger.info("Response Of userExists Method : " + user);
			
			
			if (user){
			res.jsonp({status:"Success",
                        message:"User Found",
                        object:user});
			}
			else{
			res.jsonp({status:"Failure",
                        message:"User Not Found",
                        object:[]});
				
			}
                             
	});		
	});
	
};
	 


//     app.post('/verificationcode',function(req,res){                         
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body");  
//         }
            
//         logger.verbose('verificationcode-POST called ');
            
//         var reqData=req.body;
//         console.log("reqData : "+ reqData.phoneNo);
//         // let phoneNo = req.query.phoneNo;;
// 		console.log("in routes /verificationcode ");
//         console.log(reqData);
           
//         regCtrl.sendVerificationCode(reqData,res);	
	
// 	});

	
   
    
//     app.post('/verifycode',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes /verifyCode ");
// 		var reqData=req.body;
//          console.log(reqData);
//              regCtrl.verifyCode(reqData,res);	
// 	});
    
    
// 	   app.post('/deactivateAccount',function(req,res){                         
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body");  
//         }
            
//         logger.info('deactivateAccount-POST called ');
            
//         var reqData=req.body;
//         console.log("Phone No : "+ reqData.phoneNo);
// 		console.log("in routes /deactivateAccount ");
         
//         regCtrl.deactivateAccount(reqData,res);	
	
// 		});
	
// 	app.post('/login',function(req,res){
// 		var email = req.body.email;
//         var password = req.body.password;

// 		login.login(email,password,function (found) {
			
//             console.log(found);
// 			res.json(found);
// 	});
// 	});

// 	// POST /users
// 	app.post('/users', (req, res) => {
// 		var body = _.pick(req.body, ['email', 'password']);
// 		var user = new User(body);
	
// 		user.save().then((user) => {
// 		return user.generateAuthToken();
// 		}).then((token) => {
// 		res.header('x-auth', token).send(user);
// 		}).catch((e) => {
// 		res.status(400).send(e);
// 		console.log('Erro in saving data: ', e);
// 		})
// 	  });

// 	app.post('/profile',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
    
// 		console.log("in routes - profile : " + req.body.phone);
// 		var upload = multer({
// 			storage: storage,
// 			fileFilter: function(req, file, callback) {			
// 				var ext = path.extname(file.originalname)
// 				if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
// 					return callback(res.end('Only images are allowed'), null)
// 				}
// 				callback(null, true)
// 			}
// 		}).single('profilePhoto');
// 		upload(req, res, function(err) {
// 			if (err){
// 				res.jsonp({status:"Failure",
// 							message:"Error Uploading File",
// 							object:[]});
// 			}
// 			else{
// 			logger.info ("File Is uploaded");
// 			var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
// 			logger.info("profilePhotoUrl" + profilePhotoUrl);
// 			//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
// 			regCtrl.completeProfile(req.body,profilePhotoUrl,res);
// 				tempFileName="";
				
// 			}
			
// 		})
		
// 	});
    
	
// 	app.post('/shareLocation',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes /shareLocation");
// 		var reqData=req.body;
        
// 		LocController.updateShareLocationFlag(reqData,res);
// 	});
	


	


// 	/******* Push Notification Apis *****/
	
// 	app.post('/playerId',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes /playerId ");
// 		//var reqData=req.body;
//         // console.log(reqData);
// 		regCtrl.updatePlayerId(req,res);
// 	});
	
	
// 	/********  Admin Panel Apis********/
	
// 	 // getting List of users
//     app.get('/users',function(req,res){ 
      	
// 		logger.info("In routes get users");
// 		AppController.findAllUser(function (users) {
//             logger.info("Response Of findAllUser Method");
// 			res.jsonp({ status:"Success",
//                         message:"List Of users",
//                         object:users});
                             
// 	});		
// 	});
// // 		 // getting User  By user id in Query Params
// 	app.post('/user',function(req,res){
//       	var email = req.body.email;
		
// 		logger.info("In routes get single user, where email : "+email);
// 		AppController.userExists(email,function (user) {
//             logger.info("Response Of userExists Method : " + user);
			
			
// 			if (user){
// 			res.jsonp({status:"Success",
//                         message:"User Found",
//                         object:user});
// 			}
// 			else{
// 			res.jsonp({status:"Failure",
//                         message:"User Not Found",
//                         object:[]});
				
// 			}
                             
// 	});		
// 	});
	
// 	 // getting List of Groups
//     app.get('/groups',function(req,res){
      	
// 		logger.info("in routes get groups");
// 		ChatController.findAllGroups(function (groups) {
//             logger.info("Response Of findAllGroups Method");
// 			 res.jsonp({status:"success",
//                         message:"List Of groups",
//                         object:groups});
                             
// 	});		
// 	});
	
// 	 // getting groupMembers Details
//     app.get('/groupMembers',function(req,res){
      	
// 		logger.info("in routes get groupMembers");
// 		var conversationId = req.query.conversationId;
// 		var arrayToSend = [];
// 		let promiseArr = [];
// 		var tempObject;
// 		var adminMobile;
// 		function add(member){									
// 			return new Promise((resolve,reject) => {
				
// 				phoneNo=member._userMobile;	
// 				logger.info ("Member Phone No  before : "+phoneNo);
// 				logger.info ("Admin Phone No before : "+adminMobile);
// 				query = { phone : phoneNo };
// 				AppController.userExists(phoneNo,function (user) {
// 					logger.info("Response Of userExists Method : " + user);
					
					
// 					if (user){
// 					logger.info('User Found For Phone No: ' + phoneNo );
// 					phoneNo=user.phone;
// 					tempObject=new Object ();
// 					tempObject.phoneNo=user.phone;
// 					tempObject.profileUrl=user.profile_photo_url;
// 					if (adminMobile===phoneNo){
// 						logger.info('Its Admin' );
// 						logger.info ("Member Phone No : "+phoneNo);
// 						logger.info ("Admin Phone No : "+adminMobile);
// 						tempObject.type="admin";
// 					}
// 					else {
// 						logger.info('Its Non  Admin');
// 						logger.info ("Member Phone No  in chk : "+phoneNo);
// 						logger.info ("Admin Phone No in chk : "+adminMobile);
// 						tempObject.type="member";
// 					}
// 					arrayToSend.push(tempObject);
// 					 resolve();
// 					}
// 					else{
// 					logger.info('User not Found For Phone No: ' + phoneNo ); 
// 					resolve();
						
// 					}
                             
// 				});	
			
				
// 			});
// 		}
// 		var query = { _id : conversationId };
// 		Conversation.findOne(query).exec(function(err,conversation){
// 			if (conversation){
				
// 				adminMobile=conversation.adminMobile;
				
// 				ChatController.findConversationMembers(conversationId, function(members){
			
// 					if (members){
// 						logger.info ("Group members list size " + members.length);
// 						var phoneNo;
// 						var query;
// 						logger.info ('findConversationMembers Response, Members List Size : ' + members.length);											
// 								//Add all members in a list to send All Group Members								
											   
// 						 members.forEach(function(member) {								
// 									 promiseArr.push(add(member));
														        
// 						 });
						
// 						 Promise.all(promiseArr)
// 							 .then((result)=> res.jsonp({status:"success",
// 											   message:"Group Members List",
// 											  object:arrayToSend}))
// 							 .catch((err)=>res.send({status:"failure",
// 											   message:"Error Occured while finding Members" + err,
// 											  object:[]}));
						
// 					}
// 					else {
// 						//Send Response no members Found
// 						logger.info ("members : " + members);
// 						res.send({status:"failure",
// 								  message:"No Members Found In Group",
// 								  object:[]})
						
// 					}
// 				});
// 			}
// 			else{
				
				
// 				res.send({status:"failure",
// 						  message:"No Such Conversation Found",
// 						  object:[]})
// 			}
			
// 		});
		
						
						

// 	});
	
// 	 // getting List of Markers
//     app.get('/markers',function(req,res){ 
      	
// 		logger.info("in routes get markers");
// 		AppController.findAllMarkers(function (markers) {
//             logger.info("Response Of findAllMarkers Method");
// 			res.jsonp({status:"success",
//                         message:"List Of Markers",
//                         object:markers});
                             
// 	});		
// 	});
	
	
// 		// Admin Login
// 	app.post('/adminlogin',function(req,res){
		
// 		 if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes /adminlogin");
// 		//var reqData=req.body;
// 		var userName = req.body.username;
//         var password = req.body.password;

// 		AdminController.login(userName,password,function (admin) {
			
//           if (admin){
// 			res.header("Access-Control-Allow-Headers", "*");
// 			res.setHeader("App-Awt-Token", "xhbqabsbasa17ascxxkk");
// 			res.jsonp({status:"success",
//                         message:"Successful Login",
//                         object:admin});
// 			}
// 			else{
// 			res.jsonp({status:"Failure",
//                         message:"Wrong username or Password",
//                         object:[]});
				
// 			}
// 	});
// 	});





// 	/* ALDAALAH V2 APIS */


// 	/*  Marker  API's */


// 	app.post('/v2.0/marker',function(req,res){
		
// 		if(req.body === undefined||req.body === null) {
// 		 res.end("Empty Body"); 
// 		 }
// 		 console.log("in routes post /marker");
// 		 var reqData=req.body;
// 		 // console.log(reqData);
// 		 LocController.setMarker(reqData,res);
// 	 });

// 	//  app.post('/v2.0/updateMarker',function(req,res){				
// 	// 	if(req.body === undefined||req.body === null) {
//     //     res.end("Empty Body"); 
//     //     }
			 
// 	// 	console.log("in routes /updateMarker");
// 	// 	var reqData=req.body;
//     //     // console.log(reqData);
// 	// 	LocController.updateMarker(reqData,res);
// 	// });

// 	app.post('/v2.0/updateMarker',function(req,res){				
	
// 		if(req.body === undefined||req.body === null) {
// 			res.jsonp({status:"Failure",
//                         message:"Empty Body",
//                         object:[]});
// 			}
				 
// 			console.log("in routes /updateMarker");
// 			var reqData=req.body;
// 			// console.log(reqData);
// 			LocController.updateMarker(reqData,res);

// 		// res.jsonp({status:"success",
//         //                 message:"Successful Login",
//         //                 object:[]});
		
// 	});


// 	 app.delete('/v2.0/marker',function(req,res){
		
// 		if(req.body === undefined||req.body === null) {
// 		 res.end("Empty Body"); 
// 		 }
// 		 var markerId = req.query.markerId;
// 		 console.log("in routes delete /marker");
		 
// 		 // console.log(reqData);
// 		 LocController.deleteMarker(markerId,res);
// 	 });


	

		
// 	/*  Marker Category API's */

// 	//Add new Catogory
// 		app.post('/v2.0/markerCategory',function(req,res){
		
// 			if(req.body === undefined||req.body === null) {
// 			 res.end("Empty Body"); 
// 			 }
// 			 console.log("in routes POST:  /markerCategory");
// 			 var reqData=req.body;
// 			 LocController.addMarkerCategory(reqData,res);
// 		 });

// 	//update Marker Category
// 		 app.put('/v2.0/markerCategory',function(req,res){
		
// 			if(req.body === undefined||req.body === null) {
// 			 res.end("Empty Body"); 
// 			 }
// 			 console.log("in routes PUT : /markerCategory");
// 			 var reqData=req.body;
// 			 LocController.updateCategoryMarker(reqData,res);
// 		 });


// 	// delete Marker Category
// 		 app.delete('/v2.0/markerCategory',function(req,res){
		
// 			if(req.body === undefined||req.body === null) {
// 			 res.end("Empty Body"); 
// 			 }
// 			 var categoryId = req.query.categoryId;
// 			 console.log("in routes delete /markerCategory");
			 
// 			 // console.log(reqData);
// 			 LocController.deleteMarkerCategory(categoryId,res);
// 		 });


// 			// getting List of Markers
// 		app.get('/v2.0/markerCategory',function(req,res){ 

// 			logger.info("in routes get markers");
// 			AppController.findAllMarkerCategories(function (markerCategories) {
// 				logger.info("Response Of findAllMarkerCategories Method");
// 				res.jsonp({status:"success",
// 							message:"List Of Markers Categories",
// 							object:markerCategories});
									
// 		});		
// 		});

// 		 // Add new Group member from IOS device
// 		 app.post('/v2.0/groupMember',function(req,res){
		
// 			if(req.body === undefined||req.body === null) {
// 			 res.end("Empty Body"); 
// 			 }
// 			 console.log("in routes POST /v2.0/groupMember");
	 
// 			 ChatController.addGroupMemberFromIOS(req,res);
// 		 });

// 		 // Delete  Group member from IOS device
// 		 app.post('/v2.0/deleteMember',function(req,res){
		
// 			if(req.body === undefined||req.body === null) {
// 			 res.end("Empty Body"); 
// 			 }
// 			 console.log("in routes post /v2.0/deleteMember");
// 			 ChatController.removeGroupMemberFromIOS(req,res);
// 		 });



