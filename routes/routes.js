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
var tempFileName;
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/videos')
	},
	filename: function(req, file, callback) {
		/*
		if (file){
				console.log('File Found : ' + file);
			}
			else {
				console.log('File Not Found : ' + file);
			}
			*/
			
		tempFileName="";
		//console.log("Printing in File Name Field :" + 'file.fieldname : ' + file.fieldname + ' file.originalname :' + file.originalname );
		tempFileName=file.fieldname + '-' + Date.now() + path.extname(file.originalname);
		//console.log("File NEW Name  :" +tempFileName );
		callback(null,tempFileName );
	}
});


module.exports = function(app) {	
	 
	 
	 //Enable All CORS Requests
	app.use(cors());
	app.use(function(req, res, next) {
		//res.header("Access-Control-Allow-Origin", "*");
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
		logger.info("Token: "+ token);
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
	//var object =new Object({"Field1":"Value1","Field2":"Value2"});
	//NotificationController.sendNotifcationToPlayerId("03bd1410-c6f1-4e14-9e12-02e6fd718691",object,"TestEvent");
	//NotificationController.sendNotifcationToPlayerId();
		res.end("WTC-WebServices"); 
	});

	app.post('/register',function(req,res){                         
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body");  
		 }
			 
		 logger.verbose('register-POST called ');
			 
		 var reqData=req.body;
		// console.log("reqData : "+ reqData.phoneNo);
		 // let phoneNo = req.query.phoneNo;;
		 logger.info("in routes /register ");
		 //console.log(reqData);
			
		 regCtrl.register(reqData,res);	
	 
	 });
	
	 // POST /users/login {email, password}
	app.post('/login', (req, res) => {
		if(req.body === undefined||req.body === null) {
			res.end("Empty Body");  
			}
				
			logger.verbose('login-POST called ');
				
			var reqData=req.body;
			//console.log("reqData : "+ reqData.phoneNo);
			// let phoneNo = req.query.phoneNo;;
			logger.info("in routes /login ");
			//console.log(reqData);
			   
			regCtrl.login(reqData,res);
		
	});

	
	app.post('/upload/video', authenticate, function(req,res){

		logger.info("in routes - upload/video : ");
		logger.info("User Received After Authetication: "+req.user.email);
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
    
		
		var upload = multer({
			storage: storage,
			fileFilter: function(req, file, callback) {			
				var ext = path.extname(file.originalname)
				if (ext !== '.mp4' && ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
					return callback(res.end('Only images and Videos are allowed'), null)
				}
				callback(null, true)
			}
		}).single('videoFile');
		upload(req, res, function(err) {
			if (err){
				res.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
			}
			else{
			logger.info ("File Is uploaded");
			var videoUrl="https://wtcapps.herokuapp.com/videos/"+tempFileName;
			//var videoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
			//logger.info("Video" + profilePhotoUrl);
			//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
			PostController.uploadPost(req,videoUrl,res);
				
				// res.jsonp({status:"Success",
				// 			message:"File Successfully Uploaded",
				// 			object:[{"Fileurl":videoUrl}]});

				logger.info ("Setting tempFileNameto Null");
				tempFileName="";

			}
			
		})
		
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
    

// 	app.post('/profilePhoto',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
		
// 		console.log("in routes");
        
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
// 				logger.info ("Photo Is uploaded");
// 				console.log(req.body.phone);
// 			 //geneterate a url 
// 			var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
// 			//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
		
// 			regCtrl.updateProfilePhoto(req.body.phone,profilePhotoUrl,function(data){
// 				tempFileName="";
// 			});            
				
// 			}
		
// 		})
		
// 	});

// 	app.post('/updateProfile',function(req,res){
		
// 		console.log("in routes updateProfile");
// 		var user;
// 		if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
		
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
			
// 				logger.info ("Photo Is uploaded");
// 				console.log(req.body.phoneNo);
// 				//geneterate a url 
// 				var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
// 				//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
// 				console.log ("updateProfilePhotoFlag Without Parsing: " + req.body.updateProfilePhoto);
// 				var updateProfilePhotoFlag = JSON.parse(req.body.updateProfilePhoto);
// 				console.log ("updateProfilePhotoFlag with parsing : " + updateProfilePhotoFlag);
// 				if ((req.body.updateProfilePhoto)&&(req.body.updateName)){
// 					//update picture
// 					regCtrl.updateProfilePhoto(req.body.phoneNo,profilePhotoUrl,function (data){
// 						tempFileName="";
// 					if (data){
// 						 logger.info ('data received after updating profile picture');
// 						 //update Name
// 						regCtrl.updateName(req,function (user){
// 						 if (user){
// 							logger.info ('data received after updating profile picture');
// 							res.jsonp({ status:"success",
// 							message:"Profile has been Updated!",
// 							object:user});
// 						 }
// 						 else{
							 
// 						 }
// 						});
// 					}
// 					else{
						
// 					}
// 					});
					
					
// 				}
// 				else {
// 					if (req.body.updateProfilePhoto){
// 						regCtrl.updateProfilePhoto(req.body.phoneNo,profilePhotoUrl,function (data){
// 							tempFileName="";
// 						if (data){
// 							 user=data;
// 							 res.jsonp({ status:"success",
// 							message:"Profile Photo has been Updated!",
// 							object:user});
// 						}
// 						});
						
// 					}
// 					//Updating Name
// 					if (req.body.updateName){
// 						regCtrl.updateName(req,function (data){
// 						if (data){
// 							 user=data;
// 							 res.jsonp({ status:"success",
// 							message:"Name has been Updated!",
// 							object:user});
// 						}
// 						});
					
// 					}
// 				}
					
// 			}
// 			});            
// 	});
		
		
//     app.post('/contacts',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes /contacts");
// 		regCtrl.syncContacts(req,res);
// 	});
  
    
//     app.get('/country',function(req,res){
// //		  console.log("start"); 
// //	      var country = new Country({ 
// //                    _id:"4",
// //                    country_id:4,
// //                    name: "India", 
// //                    code:"021",
// //                    shortForm:"ind"
// //                     });
// //          country.save(function (err, country) {
// //               console.log("in save"); 
// //                    if(err){
// //                       console.log(err); 
// //                    }
// //              else
// //                  console.log("Country Saved"+country); 
// //                    
// //          });
        
// 		console.log("in routes get country");
// 		AppController.findAllCountries(function (countries) {
// 			console.log("Response Of findAllCountries Method");
// 			res.jsonp({status:"success",
//                         message:"List Of countries",
//                         object:countries});
                             
// 	});		
// 	});

//     	app.post('/group',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
		
// 		console.log("in routes - group" );
// 		var reqData=req.body;
//          logger.info("reqData  :"+reqData.groupName);
		 
		 
		 
// 	 var upload = multer({
// 		storage: storage,
// 		fileFilter: function(req, file, callback) {
				
// 			var ext = path.extname(file.originalname)
// 			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
// 				return callback(res.end('Only images are allowed'), null)
// 			}
// 			callback(null, true)
// 		}
// 	}).single('profilePhoto');

// 	//var file=upload.single('profilePhoto');
// 	//console.log ('logging file : '+file);
// 	//console.log ('logging upload : '+upload);
// 	upload(req, res, function(err) {
//         if (err){
//             res.jsonp({status:"Failure",
//                         message:"Error Uploading File",
//                         object:[]});
//         }
//         else{  
		
//         logger.info ("Photo Is uploaded");
// 		//if ()
// 			//.single(fieldname
// 		console.log (req.files);
// 		var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
// 		//var profilePhotoUrl ="https://cdn0.iconfinder.com/data/icons/education-59/128/communication_discussion_workshop-256.png"; 
// 		ChatController.createGroup(req.body,profilePhotoUrl,res);	
// 		tempFileName="";		
// 		}
		
// 	});
// 	});
	
	
// 	app.post('/updateGroup',function(req,res){
		
// 		console.log("in routes updateGroup");
// 		var conversation;
// 		var conversationId
// 		if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }		
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
// 				try{
// 					var myDate;
// 					var createdDate;
// 				conversationId = req.body.conversationId;
// 				logger.info ("Photo Is uploaded");
// 				console.log("Conversation id : "+conversationId);
// 				//geneterate a url 
// 				var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
// 				//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
// 				console.log ("updateProfilePhotoFlag Without Parsing: " + req.body.updateProfilePhoto);
// 				var updateProfilePhotoFlag = JSON.parse(req.body.updateProfilePhoto);
// 				var updateNameFlag = JSON.parse(req.body.updateName);
// 				console.log ("updateProfilePhotoFlag with parsing : " + updateProfilePhotoFlag);
// 				if ((updateProfilePhotoFlag)&&(updateNameFlag)){
// 					//update picture
// 					ChatController.updateGroupProfilePhoto(conversationId,profilePhotoUrl,function (data){
// 						tempFileName="";
// 					if (data){
// 						 logger.info ('data received after updating Group profile picture');
// 						 //update Name
// 						ChatController.updateGroupName(req,function (group){
// 						 if (group){
// 							 conversation=group;
							 
// 					//Sending update group Notifcation
// 						ChatController.findConversationMembers(conversationId, function(members){
// 						if (members){
// 								logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
// 								myDate = new Date(conversation.createdAt);
// 								createdDate = myDate.getTime();
								
// 								var conversationObj ={
// 										//fromPhoneNo:userMobileNumberFrom,	
// 										conversationId:conversationId, 
// 										isGroupConversation:conversation.isGroupConversation,
// 										adminMobile:conversation.adminMobile,
// 										photoUrl:conversation.conversationImageUrl,
// 										conversationName:conversation.conversationName,
// 										createdAt:createdDate,
										
// 										}
									
										
// 										//Notifying All Group Members
// 								for (var i=0; i < members.length ; i++){
// 									var phoneNo=members[i]._userMobile;
// 									if (phoneNo!==(conversationObj.adminMobile)){
										
										
// 										//Sending Push Notiifcation To Group Members								
// 										logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
// 										//var phoneNo=members[i]._userMobile;
// 										var query = { phone : phoneNo };
										
// 										User.findOne(query).exec(function(err, user){
// 											if (err){
// 											 logger.error('Some Error occured while finding user' + err );
// 											 }
// 											if (user){
// 											logger.info('User Found For Phone No: ' + phoneNo );
// 											logger.info('Sending Notification to player id ' + user.palyer_id );
// 											NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupUpdateRequest");
// 											}
// 											else {
// 											 logger.info('User not Found For Phone No: ' + phoneNo );                 
// 											}                               
// 										});
// 									}								
// 								}
// 						}
// 						});
// 							logger.info ('data received after updating profile picture');
// 							res.jsonp({ status:"success",
// 							message:"Group has been Updated!",
// 							object:group});
// 						 }
// 						 else{
							 
// 						 }
// 						});
// 					}
// 					else{
						
// 					}
// 					});
				
// 				}
// 				else {
// 					if (updateProfilePhotoFlag){
// 						ChatController.updateGroupProfilePhoto(conversationId,profilePhotoUrl,function (data){
// 							tempFileName="";
// 						if (data){
// 							 conversation=data;
							  
// 					//Sending update group Notifcation
// 						ChatController.findConversationMembers(conversationId, function(members){
// 						if (members){
// 								logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
// 								myDate = new Date(conversation.createdAt);
// 								createdDate = myDate.getTime();
								
// 								var conversationObj ={
// 										//fromPhoneNo:userMobileNumberFrom,	
// 										conversationId:conversationId, 
// 										isGroupConversation:conversation.isGroupConversation,
// 										adminMobile:conversation.adminMobile,
// 										photoUrl:conversation.conversationImageUrl,
// 										conversationName:conversation.conversationName,
// 										createdAt:createdDate,
										
// 										}
									
										
// 										//Notifying All Group Members
// 								for (var i=0; i < members.length ; i++){
// 									var phoneNo=members[i]._userMobile;
// 									if (phoneNo!==(conversationObj.adminMobile)){
										
										
// 										//Sending Push Notiifcation To Group Members								
// 										logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
// 										//var phoneNo=members[i]._userMobile;
// 										var query = { phone : phoneNo };
										
// 										User.findOne(query).exec(function(err, user){
// 											if (err){
// 											 logger.error('Some Error occured while finding user' + err );
// 											 }
// 											if (user){
// 											logger.info('User Found For Phone No: ' + phoneNo );
// 											logger.info('Sending Notification to player id ' + user.palyer_id );
// 											if (!user.deactivate_user){
// 											NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupUpdateRequest");	
// 											}else{
// 												logger.info('Can not send notification to deactivated user :  ' +phoneNo  );    
												
// 											}
											
// 											}
// 											else {
// 											 logger.info('User not Found For Phone No: ' + phoneNo );                 
// 											}                               
// 										});
// 									}								
// 								}
// 						}
// 						});
// 							 res.jsonp({ status:"success",
// 							message:"Group Profile Photo has been Updated!",
// 							object:conversation});
// 						}
// 						});
// 					}
// 					//Updating Name
// 					if (updateNameFlag){
// 						ChatController.updateGroupName(req,function (data){
// 						if (data){
// 							 conversation=data;
							  
// 					//Sending update group Notifcation
// 						ChatController.findConversationMembers(conversationId, function(members){
// 						if (members){
// 								logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
// 								myDate = new Date(conversation.createdAt);
// 								createdDate = myDate.getTime();
								
// 								var conversationObj ={
// 										//fromPhoneNo:userMobileNumberFrom,	
// 										conversationId:conversationId, 
// 										isGroupConversation:conversation.isGroupConversation,
// 										adminMobile:conversation.adminMobile,
// 										photoUrl:conversation.conversationImageUrl,
// 										conversationName:conversation.conversationName,
// 										createdAt:createdDate,
										
// 										}
									
										
// 										//Notifying All Group Members
// 								for (var i=0; i < members.length ; i++){
// 									var phoneNo=members[i]._userMobile;
// 									if (phoneNo!==(conversationObj.adminMobile)){
										
										
// 										//Sending Push Notiifcation To Group Members								
// 										logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
// 										//var phoneNo=members[i]._userMobile;
// 										var query = { phone : phoneNo };
										
// 										User.findOne(query).exec(function(err, user){
// 											if (err){
// 											 logger.error('Some Error occured while finding user' + err );
// 											 }
// 											if (user){
// 											logger.info('User Found For Phone No: ' + phoneNo );
// 											logger.info('Sending Notification to player id ' + user.palyer_id );
// 											NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupUpdateRequest");
// 											}
// 											else {
// 											 logger.info('User not Found For Phone No: ' + phoneNo );                 
// 											}                               
// 										});
// 									}								
// 								}
// 						}
// 						});
// 							 res.jsonp({ status:"success",
// 							message:"Group Name has been Updated!",
// 							object:conversation});
// 						}
// 						});
// 					}
// 				}
// 			}catch (err){
// 				logger.info('An Exception Has occured in updateGroupName method' + err);
// 				}		
// 			}
// 			});            
// 	});
	
//      app.post('/deleteGroup',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes post /deleteGroup");
// 		ChatController.closeGroup(req,res);
// 	});
	
// 	 app.post('/groupMember',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes POST /groupMember");

// 		ChatController.addGroupMember(req,res);
// 	});
// 	 app.post('/deleteMember',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes post /groupMember");
// 		ChatController.removeGroupMember(req,res);
// 	});


// 	/***** Location Apis ********/ 
// 	//get location From Client
	

//     app.post('/location',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		/*
// 		  console.log("start"); 
// 	      var country = new Country({ 
//                     _id:"4",
//                     country_id:4,
//                     name: "India", 
//                     code:"021",
//                     shortForm:"ind"
//                      });
//           country.save(function (err, country) {
//                console.log("in save"); 
//                     if(err){
//                        console.log(err); 
//                     }
//               else
//                   console.log("Country Saved"+country); 
                    
//           });
// */
// 		console.log("in routes /location");
// 		var reqData=req.body;
//         // console.log(reqData);
// 		LocController.updateUserLocation(reqData,res);
// 	});
		
	
// 	  app.get('/groupLocation',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		var conversationId = req.query.conversationId;
// 		console.log("in routes /location for group : "+conversationId );
// 		//var reqData=req.body;
//         // console.log(reqData);
// 		LocController.getGroupUserLocations(conversationId,res);
// 	});
	
// 	app.post('/shareLocation',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes /shareLocation");
// 		var reqData=req.body;
        
// 		LocController.updateShareLocationFlag(reqData,res);
// 	});
	

// 	/*  Marker API's */
// 	 app.post('/marker',function(req,res){
		
// 	   if(req.body === undefined||req.body === null) {
//         res.end("Empty Body"); 
//         }
// 		console.log("in routes /marker");
// 		var reqData=req.body;
//         // console.log(reqData);
// 		LocController.setMarker(reqData,res);
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
// 			res.jsonp({ status:"success",
//                         message:"List Of users",
//                         object:users});
                             
// 	});		
// 	});
// 		 // getting User  By user id in Query Params
// 	app.post('/user',function(req,res){
//       	var phoneNo = req.body.phoneNo;
// 		//let phoneNo = req.query.phoneNo;
// 		logger.info("In routes get single user, where phone NO. : "+phoneNo);
// 		AppController.userExists(phoneNo,function (user) {
//             logger.info("Response Of userExists Method : " + user);
			
			
// 			if (user){
// 			res.jsonp({status:"success",
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



