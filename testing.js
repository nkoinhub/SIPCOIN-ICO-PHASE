var Promise = require("bluebird");
var moment 		= require('moment');

//
// var testFunc = function()
// {
// 	for(var i=0;i<10;i++)
// 	{
// 		var test = function(i){
//       setTimeout(()=>{
//         console.log(i);
//         if(i == 9) console.log("end");
//
//       },1000);
// 		}
// 		test(i);
// 	}
// }
//
// //testFunc();

console.log(moment().format('MMMM Do YYYY, h:mm:ss a'))

var dataCollection = {
	username : "MateenS",
	email : "mateenshaik@gmail.com",
	demandedTokens : 2040,
	BTCofTokens : 0.216927429,
	valueOfOneToken : 1.5,
	BTCtoUSD : 14106.1,
	BTCpaid : 0.216927429,
	tokens : 2040,
	publicAddressWallet : "none",
	amountPaid : true,
	Expired : true,
	TimeOfPaymentPlaced : "December 25th 2017, 6:43:13 pm",
	TransactionID : "MateenSFirst",
	TimeOfPaymentReceived : "December 25th 2017, 6:43:13 pm",
	Transaction_hash : "offline payment",
}

// new Promise(function(resolve,reject){
//   for(var i=0;i<9999999;i++)
// 	{
// 		var test = function(i){
//       setTimeout(()=>{
//         console.log(i);
//         if(i == 9999998) {
//           console.log("end");
//           resolve("resolve");
//         }
//       },0);
// 		}
// 		test(i);
// 	}
// })
// .then((msg)=>{
//   console.log("then")
// })
//
// process.on('uncaughtException', function(err) {
//     // handle the error safely
//     console.log("uncaughtException"+err);
// })
