
//for production
var sipCoinEmailId = 'admin@sipcoin.io';
var sipCoinEmailPass = 'adminadmin@123';
var serverIP = 'https://sipcoin.io';

//for development
// var sipCoinEmailId = 'coinsipbit@gmail.com';
// var sipCoinEmailPass = 'SMuley1@3';
// var serverIP = 'http://localhost:3000';

var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var request = require('request');
var Promise = require("bluebird");
var moment 		= require('moment');
var nodemailer = require('nodemailer');


//for production
var transporter = nodemailer.createTransport(
	{
		host: 'smtp.zoho.com',
		port: 465,
		secure: true,
		auth: {
			 user: sipCoinEmailId,
			 pass: sipCoinEmailPass
		 }
	 });

//for development
// var transporter = nodemailer.createTransport({
// 		 service: 'gmail',
// 		 auth: {
// 			 user: sipCoinEmailId,
// 			 pass: sipCoinEmailPass
// 		 }
// 	 });



var part1='<head> <title> </title> <style> #one{ position: absolute; top:0%; left:0%; height: 60%; width: 40%; } #gatii{ position: absolute; top:26%; left:5%; height: 20%; width: 20%; } #text_div { position: absolute; top: 10%; left: 5%; } #final_regards { position: absolute; top: 50%; left: 5%; } </style> </head> <body> <div id="text_div"> <b>Welcome, to SIPcoin. You have been successfully registered on SIPcoin.io </b> <br> <br> Please click on the link below to verify your account <br><br>';
var part2=' <br><br> <br> P.S.- You are requested to preserve this mail for future references. <br> <br> </div> <iframe id="gatii" src="https://drive.google.com/file/d/1k99fX9I4HOdhKZA1KwrDflM1W-orCSh0/preview" width="40" height="40"></iframe> <br> <br> <div id="final_regards"> Thank You, <br> <br> Team SIPcoin.io <br> <br> <a href="http://support.sipcoin.io">Support Team</a> <br> <br> </div> </body>'

//console.log(moment().format('x'))

//var URLforVerification = "http://localhost:3000/verify?secretKey=" + newAccount.secret + "&veri=" + makeid(5);

var makeid = function(lengthReqd) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < lengthReqd; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


var getAccountDetails = function(user, email) {
	return new Promise(function(resolve,reject){
		AM.getAccount(user, email, function(o){
			console.log(o);
			if(o) resolve(o);
		});
	});
}

var updateTokenValueOfUser = function(user, email) {
	return new Promise(function(resolve,reject){
		getTokenValue().then((value)=>{
			AM.updateTokenValueOfUserInDB(user,email,value, function(){
				console.log("Updated the TOken Value in DB");
				resolve();
			})
		})
	})
}

var btcCheck = function(){
	return new Promise(function(resolve,reject){
		console.log("inside btcCheck");
		request('https://blockchain.info/ticker', { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			resolve(body.USD.last);
		});
	});
}

var getPublicAddress = function(TID){
	return new Promise(function(resolve,reject){

		//resolve("12wedfv4rtfgb7ytf56yh98iuhggb");

		//get request to the api, then resolve the address
		 var API = 'https://api.blockchain.info/v2/receive?';
		 var xPub = 'xpub6D9eFNDYtCsbwd7xQdGDeQX9SejSpAFsBKRNzaViBprjXcoHs6933e9STs61Boo4P3REpeLNRXv1FW9oKWZp43PVTSD5AZbAFny9MFGHMb9';
		 var callback = 'http%3A%2F%2Fsipcoin.io/getInvoice%3FTID%3D'+TID;
		 var key = '09195d68-3873-4237-92fd-cdc6bda54aa4'
    //
		 var URL = API + 'xpub=' + xPub + '&callback=' + callback + '&key=' + key;
    //
		 request(URL, {json:true}, (err, res, body)=>{
		 	if(err) { return console.log(err); }
		 	console.log("received Address : "+body.address);
		 	resolve(body.address);
		 })

		// request('https://api.blockchain.info/v2/receive?xpub=xpub6D9eFNDYtCsbwd7xQdGDeQX9SejSpAFsBKRNzaViBprjXcoHs6933e9STs61Boo4P3REpeLNRXv1FW9oKWZp43PVTSD5AZbAFny9MFGHMb9&callback=http%3A%2F%2Fsipcoin.io%3Finvoice_id%3D058921123&key=09195d68-3873-4237-92fd-cdc6bda54aa4', { json: true }, (err, res, body) => {
		// 	if (err) { return console.log(err); }
		// 	console.log(body.address);
		// 	resolve(body.address);
		// });

		// request('https://api.blockchain.info/v2/receive?xpub=xpub6D9eFNDYtCsbwd7xQdGDeQX9SejSpAFsBKRNzaViBprjXcoHs6933e9STs61Boo4P3REpeLNRXv1FW9oKWZp43PVTSD5AZbAFny9MFGHMb9&callback=http%3A%2F%2Fsipcoin.io%3Finvoice_id%3D058921123&key=09195d68-3873-4237-92fd-cdc6bda54aa4', { json: true }, (err, res, body) => {
		// 	if (err) { return console.log(err); }
		// 	console.log(body.address);
		// 	resolve(body.address);
		// });
	});
}

//template for mail sending

var sendMailTemplate = function(Purpose, Subject, ){


}


//get transaction doc with the given invoice id
var getTransactionDoc = function(TID){
	return new Promise(function(resolve,reject){
		AM.getTransaction(TID, function(o){
			resolve(o);
		})
	})
}


var getTokenValue = function(){
	//var tokenValue;
	return new Promise(function(resolve,reject){
		console.log("inside getTokenValue");
		AM.currentTokenValue(function(o){
			if(o) resolve(o[0].tokenValue);
		})
	});
}

//get node info for each parent
var getNodeInfo = function(referral){
	return new Promise(function(resolve,reject){
		AM.getLeftRight(referral, function(res){
			resolve(res);
		})
	})
}


module.exports = function(app) {

	//tree generation algorithm call and respond
	app.post('/referralTree',function(req,res){
		AM.formTreeData(req.body.root_referral, function(data){
			console.log(data);
			res.send(data);
		})
	})

	//main page render
	app.get('/',function(req,res){
		if(req.session.user != null) res.redirect('/dashboard');
		else {
			var usd;
			var sip;

			btcCheck().then((USD)=>{
				usd = USD;
				return getTokenValue().then((SIP)=>{return SIP});
			})
			.then((SIP)=>{
				sip = SIP;

				AM.getProgress(function(coins, stage){
					console.log(coins)
					res.render('main',{
						USD : usd,
						SIP : sip,
						coins : coins,
						stage : stage
					})
				})
			})
			.catch((err)=>{
				console.log("Error Occurred on Get Request at '/' : " + err)
			})
		}
	})

// route for front page, stage depiction, total coins bought by users
	app.get('/getProgress',function(req,res){
		AM.getProgress(function(coins){
			res.send(coins);
		})
	})

// resend activation email
	app.get('/resendActivation',function(req,res){
		if(req.session.user == null) res.redirect('/login');
		else {
			AM.getDataForResend(req.session.user.user, function(data){
				console.log(data);
				if(data != null) {
					var URLforVerification = serverIP +"/verify?secretKey=" + data.secret + "&veri=" + makeid(5);

					var mailOptions = {
						from: sipCoinEmailId,
						to: data.email,
						subject: ' SIPCOIN || Resend Activation Link',
						html: part1 +URLforVerification+part2,
					};

					transporter.sendMail(mailOptions, function(error, info){
						if (error) {
							console.log(error);
							console.log("email_not_sent");
						} else {
							console.log('Email sent: ' + info.response);
							res.redirect('/resent_verfication_page');
						}
					})
				}
				else {
					res.redirect('/signup');
				}
		});
	}
});

app.get('/resent_verfication_page',function(req,res){
	if(req.session.user == null) res.redirect('/');
	var usd;
	var sip;

	btcCheck().then((USD)=>{
		usd = USD;
		return getTokenValue().then((SIP)=>{return SIP});
	})
	.then((SIP)=>{
		sip = SIP;
		res.render('resent_verfication_page',{
			BTC : usd,
			SIP : sip,
			udata : req.session.user
		})
	})

});


	//callback for blockchain.info and updation of transaction history and account of user
	app.get('/getInvoice',function(req,res){
		//1.get the invoice,
		// - check how much balance is received, if everthing is fine..
		//2.check in Transactions
		//3.update the transactions table
		//4.get the username and update in accounts table.
		var data = {
			BTCvalue : (req.query.value)/100000000,
			transaction_hash : req.query.transaction_hash,
			address : req.query.address,
			TID : req.query.TID
		}

		getTransactionDoc(req.query.TID).then((o)=>{
				if(true)//Math.abs(o.BTCofTokens - data.value) < 0.0001)
				{
					o.amountPaid = true;
					o.Expired = true;
					o.tokens = parseFloat(((o.BTCtoUSD * data.BTCvalue)/o.valueOfOneToken).toFixed(8));
					o.BTCpaid = data.BTCvalue;
					o.Transaction_hash = data.transaction_hash;
					o.TimeOfPaymentReceived = moment().format('MMMM Do YYYY, h:mm:ss a');
					AM.insertResponse(data, function(){
						console.log(data);
					})
					return o;
				}
		})
		.then((o)=>{
			AM.incrementTokens(o.username,o.tokens, function(msg){
				console.log('msg from increment tokens : ' + msg);
				AM.updateTransactionDoc(o,function(){
					AM.incrementTotalCoins(o.tokens,function(message){
						console.log(message);
						console.log(o);
						AM.checkForPlanAmtSet(o.username, function(result){
							if(result == false)
							{
								AM.incrementTokensAmtInReferral(o.username, o.tokens*o.valueOfOneToken, function(message){
									console.log(message);
									res.send('*ok*');
								})
							}
							else {
								console.log("plan amount already set");
								res.send('*ok*');
							}
						})
					})
				})
			})
		})
		.catch((err)=>{
			console.log("Error while validating getInvoice of TID : " + req.query.TID + " :: error : " + err);
		})
	})

	//current BTC value
	app.get('/btcValue',function(req,res2){
		btcCheck.then((BTCtoUSD)=>{
			console.log(BTCtoUSD);
			res2.send({value:BTCtoUSD});
		})
		.catch((err)=>{
			console.log("Error While Fetching BTCtoUSD :: err : " + err);
			res2.send({value:0})
		})
	})

	//current SIP token value
	app.get('/sipValue',function(req,res){
		getTokenValue().then((value)=>{
			res.send({value:value});
		})
	})

	//transaction details of the user
	app.get('/transaction',function(req,res){
		if(req.session.user == null)
		{
			res.redirect('/');
		}
		else {
			AM.getTransactions(req.session.user.user,req.session.user.email,function(e,o){
				if(e)
				{
					res.render('transaction',{
						udata : req.session.user,
						transactions : JSON.stringify([]),
						BTC : usd,
						SIP : sip,
						message : 'Transaction Data Not Found'
					})
				}
				else {
					//console.log(JSON.stringify(o));
					//res.send({transactions:o});
					var usd;
					var sip;

					btcCheck().then((USD)=>{
						usd = USD;
						return getTokenValue().then((SIP)=>{return SIP});
					})
					.then((SIP)=>{
						sip = SIP;

						res.render('transaction',{
							udata : req.session.user,
							transactions : JSON.stringify(o),
							BTC : usd,
							SIP : sip,
							message : 'Transaction Data Found'
						})
					})
					.catch((err)=>{
						console.log("Error while fetching transaction list for user : " + req.session.user.user + " :: Error : " + err)
					})
				}
			})
		}
	})

	//referral details of the user
	app.get('/referral',function(req,res){
		if(req.session.user == null)
		{
			res.redirect('/');
		}
		else {
			AM.getReferrals(req.session.user.user,req.session.user.email,function(e,o){
				if(e)
				{
					res.redirect('/dashboard');
				}
				else {
					console.log(o);
					//res.send({referrals : o});

					var usd;
					var sip;

					btcCheck().then((USD)=>{
						usd = USD;
						return getTokenValue().then((SIP)=>{return SIP});
					})
					.then((SIP)=>{
						sip = SIP;

						res.render('referral',{
							udata : req.session.user,
							selfReferralCode : o.selfReferralCode,
							level : o.level,
							referredCount : o.referredCount,
							referralTokens : o.referralTokens,
							USD : usd,
							SIP : sip,
							message : 'Referral Data Found'
						})
					})
					.catch((err)=>{
						console.log("Error while fetching referral list for user : " + req.session.user.user + " :: Error : " + err)
					})
				}
			})
		}
	})

	// to make the page handle the continuous refresh
	app.get('/payment',function(req,res){
		console.log("inside GET payment : " + req.query.invoiceID);
		//res.render('paymentAddr');
		var invoiceID = req.query.invoiceID;
		if(req.session.user == null || req.query.invoiceID == undefined){
			res.redirect('/');
		}
		else {
			AM.getTransactionDocUsingInvoice(invoiceID, function(dataCollection){
				if(dataCollection == null) {
					res.redirect('/dashboard');
				}
				else {
					res.render('paymentAddr',{
						udata : req.session.user,
						totaltokens : dataCollection.demandedTokens,
						address : dataCollection.publicAddressWallet,
						BTCTokens : dataCollection.BTCofTokens,
						SIP : dataCollection.valueOfOneToken,
						currentBTC : dataCollection.BTCtoUSD
					});
				}
			});
		}
	});

	//after entering the number of tokens to buy, the freeze route, transaction history generation
	app.post('/payment',function(req,res){

		if(req.session.user == null) res.redirect('/');
		else {
			var TID = (req.session.user.user).substr(0,3) + moment().format('x');

			var dataCollection = {
				username : req.session.user.user,
				email : req.session.user.email,
				demandedTokens : parseInt(req.body['tokenvalue']), // get the input box value
				BTCofTokens : -1, //calculate (tokens*valueOfOneToken/BTCtoUSD)
				valueOfOneToken : -1,
				BTCtoUSD : -1,
				BTCpaid : 0,
				tokens : 0,
				publicAddressWallet : "",
				amountPaid : false,
				Expired : false,
				TimeOfPaymentPlaced : moment().format('MMMM Do YYYY, h:mm:ss a'),
				TransactionID : TID,
				TimeOfPaymentReceived : "No Payment Done",
				Transaction_hash : "Not Generated",
			}

			//step 1 : get the current btc value
			btcCheck().then((USD)=>{
				dataCollection.BTCtoUSD = USD;
				//step 2 : request for the btc address
				return getPublicAddress(dataCollection.TransactionID).then((address)=>{return address})
			})
			.then((address)=>{
				dataCollection.publicAddressWallet = address;
				//step 3 : get the current token value
				return getTokenValue().then((value)=>{return value});
			})
			.then((value)=>{

				//step 4 calculating the BTC of the Tokens
				dataCollection.valueOfOneToken = value;
				dataCollection.BTCofTokens = (dataCollection.demandedTokens * dataCollection.valueOfOneToken)/dataCollection.BTCtoUSD;
				console.log(dataCollection);

				return "insert transaction"
			})
			.then((finished)=>{
				//step 5 : update the transaction into the table
				AM.insertTransaction(dataCollection);
			})
			.then((done)=>{
				//step 6 : respond with the public address
				//res.send({address : dataCollection.publicAddressWallet});
				// res.render('paymentAddr',{
				// 	title: "checking tokens",
				// 	udata : req.session.user,
				// 	totaltokens : dataCollection.demandedTokens,
				// 	address : dataCollection.publicAddressWallet,
				// 	BTCTokens : dataCollection.BTCofTokens,
				// 	SIP : dataCollection.valueOfOneToken,
				// 	currentBTC : dataCollection.BTCtoUSD
				// })

				res.redirect('/payment?invoiceID='+dataCollection.TransactionID);
			})
			.catch((err)=>{
				//step 6` : respond with null address if any error found
				console.log("error found : " + err);
				//res.send({address : null});
				// res.render('paymentAddr',{
				// 	title: "checking tokens",
				// 	udata : req.session.user,
				// 	totaltokens : dataCollection.demandedTokens,
				// 	address : null,
				// 	USD : dataCollection.BTCofTokens,
				// 	currentBTC : dataCollection.BTCtoUSD
				// })
			})
		}
	})


// main login page //
	app.get('/login', function(req, res){
	// check if the user's credentials are saved in a cookie //
	var usd;
	var sip;

		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			btcCheck().then((USD)=>{
				usd = USD;
				return getTokenValue().then((SIP)=>{return SIP});
			})
			.then((SIP)=>{
				sip = SIP;

				res.render('login', {
					title: 'SIPcoin Login',
					USD : usd,
					SIP : sip
				 });

			})
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
						//access DB and update the latest info

					res.redirect('/dashboard');
				}	else{
					btcCheck().then((USD)=>{
						usd = USD;
						return getTokenValue().then((SIP)=>{return SIP});
					})
					.then((SIP)=>{
						sip = SIP;

						res.render('login', {
							title: 'SIPcoin Login',
							USD : usd,
							SIP : sip
						 });

					})
				}
			});
		}
	});

	app.post('/login', function(req, res){
		AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				if (req.body['remember-me'] == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send(o);
			}
		});
	});

// logged-in user homepage //

	app.get('/dashboard', function(req, res) {

		var btc;
		var sip;

		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{

			getTokenValue().then((value)=>{
				sip = value;
				console.log(sip);
			})

			btcCheck().then((value)=>{
				btc = value;
				console.log(btc);
			})
			.then((value)=>{
				updateTokenValueOfUser(req.session.user.user,req.session.user.email).then((value)=>{
					return getAccountDetails(req.session.user.user,req.session.user.email).then((details)=>{return details});
				})
				.then((userDetails)=>{
					console.log(btc);
					res.render('home', {
						title : 'Control Panel',
						countries : CT,
						udata : req.session.user,
						accountDetails : userDetails,
						btcValue : btc,
						sipValue : sip
					});
				})
			})
			.catch((err)=>{
				console.log("Error while fetching dashboard for user : "+req.session.user.user + " :: Error : "+err);
				res.redirect('/dashboard');
			})
		}
	});


	// route for the verification of the account
	app.get('/verify',function(req,res){
		AM.verifyAccount(req.query.secretKey,function(message){
			console.log("Account with Secret : " + req.query.secretKey + " is  Verified");


			var usd;
			var sip;
			var email=req.query["email"];
			var user=req.query["user"];


			AM.getAccountBySecret(req.query.secretKey, function(o){
				var string = "Username : " + o.user + "<br>Sponsor Code : "+ o.selfReferralCode + "<br>Sponsor Link : " + serverIP + "/signup?ref=" + o.selfReferralCode;
				//send mail with account details to the user-------------------------------------------------------------------------------------------------------------------------
				var part1='<head> <title> </title> <style> #one{ position: absolute; top:0%; left:0%; height: 60%; width: 40%; } #gatii{ position: absolute; top:26%; left:5%; height: 20%; width: 20%; } #text_div { position: absolute; top: 10%; left: 5%; } #final_regards { position: absolute; top: 50%; left: 5%; } </style> </head> <body> <div id="text_div"> <b>Welcome, to SIPcoin.</b> <br><br>Thank You for registering at SIPcoin.io. Below are your account details:- <br> <br>' + string + '<br><br>';
				var part2='P.S.- Your password security is our utmost priority, only you know it. <br> In case you do not know your password or you have forgotten it, you can visit:- <a href="'+serverIP+'/login">SIPcoin Login Page</a> <br> Select the option "Forgot Password" and proceed. <br></div> <iframe id="gatii" src="https://drive.google.com/file/d/1k99fX9I4HOdhKZA1KwrDflM1W-orCSh0/preview" width="40" height="40"></iframe> <br> <div id="final_regards">'
				var part3='Thank You, <br> <br> Team SIPcoin.io <br> <br><a href="http://support.sipcoin.io">Support Team</a> <br> <br> </div> </body>'

				var mailOptions = {
					from: sipCoinEmailId,
					to: o.email,
					subject: ' SIPCOIN || Account Details',
					html: part1+part2+part3,
				};

				transporter.sendMail(mailOptions, function(error, info){
				 if (error) {
					 console.log("Email Not Send : "+error);
				 } else {
					 console.log('Email sent: ' + info.response);
				 }
				});
				//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
			})

			btcCheck().then((USD)=>{
				usd = USD;
				return getTokenValue().then((SIP)=>{return SIP});
			})
			.then((SIP)=>{

				sip = SIP;
				res.render('after_verfiy',{
					BTC : usd,
					SIP : sip
				})
			})
			//res.send("Your Account has been Successfully Verified, You can log in by visiting : ")
		})
	})


	// buy page ( 2nd page ), checks for account verification as well as coins remaining before allowing to proceed
	app.get('/buy',function(req,res){

		var btc;
		var sip;

		console.log("inside buy");
		if(req.session.user == null){
			res.redirect('/');
		}else{
			AM.checkAccountVerification(req.session.user.user, function(result){
				if(result) {
					btcCheck().then((value)=>{
						btc = value;
						return getTokenValue().then((value)=>{sip = value; return "render"})
					})
					.then((render)=>{
						AM.getTotalCoinsAvailable(function(coins){
							if(coins < 2000) {
								console.log("coins below threshold")
								res.render('buy',{
									title : "BUY TITLE",
									udata : req.session.user,
									btcValue : btc,
									sipValue : sip,
									buyButton : false
								});
							}
							else {
								console.log("coins available");
								res.render('buy',{
									title : "BUY TITLE",
									udata : req.session.user,
									btcValue : btc,
									sipValue : sip,
									buyButton : true
								});
							}
						})
					})
				}
				else {
					// res.send({"check":"account_not_verfied"});
						res.redirect('/dashboard');
					//res.send('200');
				}
			})
		}
	});



	// app.post('/payment',function(req,res){
	// 	console.log("post of payment");
	// 	console.log(req.body['tokenvalue']);
	// 	if(req.session.user == null){
	// 		res.redirect('/');
	// 	}else {
	// 		res.render('paymentAddr',{
	// 			title: "checking tokens",
	// 			udata : req.session.user,
	// 			totaltokens : req.body['tokenvalue']
	// 		})
	// 	}
	// });



	app.post('/dashboard', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			if(req.body['pass'] == "")
			{
				res.status(400).send('enter-password-for-updation')
			}
			else {
				AM.updateAccount({
					id		: req.session.user._id,
					name	: req.body['name'],
					email	: req.body['email'],
					pass	: req.body['pass'],
					country	: req.body['country']
				}, function(e, o){
					if (e){
						res.status(400).send('error-updating-account');
					}	else{
						req.session.user = o;
						// update the user's login cookies if they exists //
						if (req.cookies.user != undefined && req.cookies.pass != undefined){
							res.cookie('user', o.user, { maxAge: 900000 });
							res.cookie('pass', o.pass, { maxAge: 900000 });
						}
						res.status(200).send('ok');
					}
				});
			}
		}
	});

	// account details updation page
	app.get('/account',function(req,res){
		console.log("inside account_change");
		if(req.session.user == null) res.redirect('/login');
		else {
			var usd;
			btcCheck().then((USD)=>{
				usd = USD;
				return getTokenValue().then((SIP)=>{return SIP});
			})
			.then((SIP)=>{
				res.render('account_home',{
					countries : CT,
					udata : req.session.user,
					USD : usd,
					SIP : SIP
				})
			})
		}
	});

	//updating account details , therefore a post request
	app.post('/account', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			if(req.body['pass'] == "")
			{
				res.status(400).send('enter-password-for-updation')
			}
			else {
				AM.updateAccount({
					id		: req.session.user._id,
					name	: req.body['name'],
					email	: req.body['email'],
					pass	: req.body['pass'],
					country	: req.body['country']
				}, function(e, o){
					if (e){
						res.status(400).send('error-updating-account');
					}	else{
						req.session.user = o;
						// update the user's login cookies if they exists //
						if (req.cookies.user != undefined && req.cookies.pass != undefined){
							res.cookie('user', o.user, { maxAge: 900000 });
							res.cookie('pass', o.pass, { maxAge: 900000 });
						}
						res.status(200).send('ok');
					}
				});
			}
		}
	});


	app.post('/logout', function(req, res){
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e){ res.status(200).send('ok'); });
	})


	// creating new accounts //
		app.get('/signup', function(req, res) {

			var btc;
			btcCheck().then((BTC)=>{
				btc = BTC;
				return getTokenValue().then((SIP)=>{return SIP});
			})
			.then((SIP)=>{
				if(req.query.ref != undefined)
				{
					AM.checkForReferral(req.query.ref,function(result){
						if(result) {
							res.render('signup', {
								title: 'Signup',
								countries : CT,
								USD : btc,
								SIP : SIP,
								ref : req.query.ref
							 });
						}
						else {
							res.render('signup', {
								title: 'Signup',
								countries : CT,
								USD : btc,
								SIP : SIP,
								ref : ""
							 });
						}
					})
				}
				else {
					res.render('signup', {  title: 'Signup', countries : CT, USD : btc, SIP : SIP, ref : "" });
				}
			})
		});


//nodes route for tree generation
	app.get('/nodes',function(req,res){

		console.log('inside nodes');
		if(req.query.node == undefined)
		{
			console.log('first undefined');

			AM.getSelfReferralCode(req.session.user.user, function(result){

				var data = [{
					"label" : req.session.user.user+' ( Root )',
					"id" : result.selfReferralCode,
					"load_on_demand" : true
				}]

				res.send(data);
			})
		}
		else {
			console.log(req.query.node);
			getNodeInfo(req.query.node).then((result)=>{
				console.log(result);
				if(result.length == 0)
				{
					console.log("no tree after this");
					res.send([]);
				}
				else {
					if(result.length == 2)
					{
						console.log('I am two');

						var data = [{
							"label" : result[0].username+' ('+result[0].link+')',
							"id" : result[0].selfReferralCode,
							"load_on_demand" : true
						},
						{
							"label" : result[1].username+' ('+result[1].link+')',
							"id" : result[1].selfReferralCode,
							"load_on_demand" : true
						}]

						res.send(data);

					}
					else if(result.length == 1)
					{
						console.log('I am one');
						var data = [{
							"label" : result[0].username+' ('+result[0].link+')',
							"id" : result[0].selfReferralCode,
							"load_on_demand" : true
						}]

						res.send(data);
					}
				}
			})
		}
	})


//signup submission of registration form along with referral
	app.post('/signup', function(req, res){

		if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
			res.status(200).send('Captcha_not_selected');
			console.log("hey captcha not selected");
			// res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
		}else {

			var newAccount = {
				name 	: req.body['name'],
				email 	: req.body['email'],
				user 	: req.body['user'],
				pass	: req.body['pass'],
				country : req.body['country'],
				tokens : 0,
				referralTokens : 0,
				valueOfTokens : 0,
				valueOfReferralTokens : 0,
				selfReferralCode : ((req.body['user']).substr(0,3) + ((moment().format('x')).toString()).substr(4,3) + (req.body['user']).substr(0,Math.floor(Math.random()*3 + 1))).toUpperCase() + ((moment().format('x')).toString()).substr(8,3),
				referralCode : (req.body['sponsorReferralCode']).toUpperCase(), // referral changed to sponsorReferralCode
				planAmountSet : false,
				secret : makeid(20),
				accountVerified : false
			}

			//var parentReferralCode = (req.body['parentReferralCode']).toUpperCase();

			//var secretKey = "6LdO6j0UAAAAAA04cC4pU1jeWWla3e6cL2Nm7xlz"; // for development
      var secretKey = "6LfXbzsUAAAAABJ4ZCatF2KQ5C8uDVVRTTsjhP1H"; //for production

	// req.connection.remoteAddress will provide IP address of connected user.
			var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
			// Hitting GET request to the URL, Google will respond with success or error scenario.
			request(verificationUrl,function(error,response,body) {
				body = JSON.parse(body);
				// Success will be true or false depending upon captcha validation.
				if(body.success !== undefined && !body.success) {
					res.status(200).send('captcha_not_validated');
					// res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
				}else {
					//new method without parentID insertion
					if(newAccount.referralCode != "")
					{
						if(req.body['link'] != undefined)
						{
							AM.checkForReferral(newAccount.referralCode, function(result){
							if(result == true)
							{
								console.log("Sponsor Referral Code : Present");

								AM.findParentForNewNode(newAccount.referralCode, req.body['link'], function(parentNode){
									console.log("Parent Node found for New Node : " + parentNode);

									AM.addNewAccount(newAccount, function(e){
									if (e){
										res.status(400).send(e);
										}	else{
											AM.referralCreate(newAccount.user, newAccount.email, newAccount.selfReferralCode, newAccount.referralCode, parentNode, req.body['link'], function(){
												var URLforVerification = serverIP +"/verify?secretKey=" + newAccount.secret + "&veri=" + makeid(5);

												var mailOptions = {
													from: sipCoinEmailId,
													to: newAccount.email,
													subject: 'SIPCOIN || Successful Registration',
													html: part1 +URLforVerification+part2,
												};

												AM.referralAddInParent(parentNode, newAccount.selfReferralCode, req.body['link'], function(message){console.log(message)});
												AM.referralAddInSponsor(newAccount.referralCode, newAccount.selfReferralCode, function(message){console.log(message)});

												transporter.sendMail(mailOptions, function(error, info){
													if (error) {
														console.log("Email Not Sent, Error : " + error);
													} else {
														console.log('Email Sent: ' + info.response);
													}
													res.status(200).send('ok');
												});
											})
										}
									});
								})
							}
							else {
								console.log("Sponsor referral code invalid")
								res.status(200).send('Sponsor_Referral_Code_Invalid');
							}
						})
						}
						else {
							console.log("Link invalid")
							res.status(200).send('Link_Invalid');
						}
					}

					else {

						//dont remove this portion of code, can be used for inital user creation - for e.g. ADMIN, without the need of sponsor code and without looking for parent referral code
						// AM.addNewAccount(newAccount, function(e){
						// if (e){
						// 	res.status(400).send(e);
						// 	}	else{
						// 		AM.referralCreate(newAccount.user, newAccount.email, newAccount.selfReferralCode, "SIP35970SIPADM", "SIP35970SIPADM", "root", function(){
						// 			var URLforVerification = serverIP +"/verify?secretKey=" + newAccount.secret + "&veri=" + makeid(5);
            //
						// 			var mailOptions = {
						// 				from: sipCoinEmailId,
						// 				to: newAccount.email,
						// 				subject: ' SIPCOIN || Successful Registration',
						// 				html: part1 +URLforVerification+part2,
						// 			};
            //
						// 			transporter.sendMail(mailOptions, function(error, info){
						// 			 if (error) {
						// 				 console.log(error);
						// 				 console.log("email_not_sent");
						// 				 //response_value="Not Registred Sucessfully";
						// 				 //res.json({"mail_value" : "mail_not_sent"});
						// 			 } else {
						// 				 console.log('Email sent: ' + info.response);
						// 				 //res.json({"mail_value" : "mail_sent"});
						// 				 //response_value="Registred Sucessfully";
						// 			 }
						// 			 res.status(200).send('ok');
						// 			})
						// 		})
						// 	}
						// });

						//var adminRef = "RCH146RC511";	//development //admin of test computer
						var adminRef = "SIP35970SIPADM"; //production //admin of server

						AM.findParentForNewNode(adminRef, "right", function(parentNode){
							console.log("Parent Node found for New Node : " + parentNode);

							AM.addNewAccount(newAccount, function(e){
							if (e){
								res.status(400).send(e);
								}	else{
									AM.referralCreate(newAccount.user, newAccount.email, newAccount.selfReferralCode,  adminRef, parentNode, "right", function(){
										var URLforVerification = serverIP +"/verify?secretKey=" + newAccount.secret + "&veri=" + makeid(5);

										var mailOptions = {
											from: sipCoinEmailId,
											to: newAccount.email,
											subject: 'SIPCOIN || Successful Registration',
											html: part1 +URLforVerification+part2,
										};

										AM.referralAddInParent(parentNode, newAccount.selfReferralCode, "right", function(message){console.log(message)});
										AM.referralAddInSponsor( adminRef, newAccount.selfReferralCode, function(message){console.log(message)});

										transporter.sendMail(mailOptions, function(error, info){
											if (error) {
												console.log("Email Not Sent, Error : " + error);
											} else {
												console.log('Email Sent: ' + info.response);
											}
											res.status(200).send('ok');
										});
									})
								}
							});
						})

						}
					}

		 });
	 }

	});



// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.body['email'], function(o){
			if (o){

				var part1='<head> <title> </title> <style> #one{ position: absolute; top:0%; left:0%; height: 60%; width: 40%; } #gatii{ position: absolute; top:26%; left:5%; height: 20%; width: 20%; } #text_div { position: absolute; top: 10%; left: 5%; } #final_regards { position: absolute; top: 50%; left: 5%; } </style> </head> <body> <div id="text_div"> <b>Welcome, to SIPcoin.</b> <br> <br> Please click on the link below to change your password <br><br>';
		    var part2=' <br><br> <br> P.S.- You are requested to preserve this mail for future references. <br> <br> </div> <iframe id="gatii" src="https://drive.google.com/file/d/1k99fX9I4HOdhKZA1KwrDflM1W-orCSh0/preview" width="40" height="40"></iframe> <br> <br> <div id="final_regards"> Thank You, <br> <br> Team SIPcoin.io <br> <br> <a href="http://support.sipcoin.io">Support Team</a> <br> <br> </div> </body>'

				var link = serverIP + '/reset-password?e='+o.email+'&p='+o.pass;

				var mailOptions = {
					from: sipCoinEmailId,
					to: o.email,
					subject: ' SIPCOIN || Password Reset',
					html: part1+link+part2,
				};

				transporter.sendMail(mailOptions, function(error, info){
				 if (error) {
					 console.log(error);
					 console.log("email_not_sent");
					 //response_value="Not Registred Sucessfully";
					 //res.json({"mail_value" : "mail_not_sent"});
					 res.status(400).send('unable to dispatch password reset')
				 } else {
					 console.log('Email sent: ' + info.response);
					 //res.json({"mail_value" : "mail_sent"});
					 //response_value="Registred Sucessfully";
					 res.status(200).send('ok')
				 }
				});
			}
			else{
				res.status(400).send('email-not-found');
			}

	});
});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/login');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});

	app.post('/reset-password', function(req, res) {
		var nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});

	// view & delete accounts //

		app.get('/print', function(req, res) {
			if(req.query.secret == "SIPcoinICO") {																		/// http://sipcoin.io/print?secret=SIPcoinICO
				AM.getAllRecords( function(e, accounts){
					res.render('print', { title : 'Account List', accts : accounts });
				})
			}
			else {
				res.redirect('/');
			}
		});

	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			}	else{
				res.status(400).send('record not found');
			}
	    });
	});

	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');
		});
	});

	app.get('/confirmation',function(req,res){

		if(req.session.user!=null)
		{
			res.redirect('/');
		}else{

			var usd;
			var sip;
			var email=req.query["email"];
			var user=req.query["user"];

			btcCheck().then((USD)=>{
				usd = USD;
				return getTokenValue().then((SIP)=>{return SIP});
			})
			.then((SIP)=>{
				sip = SIP;

				AM.getAccountByEmail(email,function(o){
					if(o != null)
					{
						res.render('confirmation',{
							BTC : usd,
							SIP : sip,
							EMAIL:email,
							USER:user
						})
					}
					else {
						res.redirect('/');
					}
				})
			})
		}
	});


//referral invitation link - email
	app.post('/email_send',function(req,res){

		var part1_invite='<head> <title> </title> <style> #one{ position: absolute; top:0%; left:0%; height: 60%; width: 40%; } #gatii{ position: absolute; top:26%; left:5%; height: 20%; width: 20%; } #text_div { position: absolute; top: 10%; left: 5%; } #final_regards { position: absolute; top: 50%; left: 5%; } </style> </head> <body> <div id="text_div"> <b>Welcome, to SIPcoin. You have been invited by ' +req.session.user.name+ ' to join SIPcoin.io </b> <br> <br> Please click on the link below to join <br><br>';
		var part2_invite=' <br><br> <br> P.S.- You are requested to preserve this mail for future references. <br> <br> </div> <iframe id="gatii" src="https://drive.google.com/file/d/1k99fX9I4HOdhKZA1KwrDflM1W-orCSh0/preview" width="40" height="40"></iframe> <br> <br> <div id="final_regards"> Thank You, <br> <br> Team SIPcoin.io <br> <br> <a href="http://support.sipcoin.io">Support Team</a> <br> <br> </div> </body>'


		var mailOptions = {
			from: sipCoinEmailId,
			to: req.body.value,
			subject: ' SIPCOIN || Referral Invitation Link',
			html: part1_invite +req.body.link+part2_invite,
		};

		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log(error);
				console.log("email_not_sent");
				res.send({"val":"-1"})
			} else {
				console.log("Email sent")
				res.send({"val":"1"});
			}
		});

	});

	app.get('*', function(req, res) { res.redirect('/') });

};
