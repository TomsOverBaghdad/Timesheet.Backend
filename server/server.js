//https://codeforgeek.com/2015/03/restful-api-node-and-express-4/

var express = require("express");
var mysql   = require("mysql");
var bodyParser  = require("body-parser");
// var md5 = require('MD5');
var rest = require("./REST.js");
var app  = express();


var resources; 
try{
  resources = require("./resources.json");  
  console.log("loading local resources");
}catch(e){
  resources = process.env;
  console.log("loading environment variables");
}


function REST(){
    var self = this;
    self.connectMysql();
};

REST.prototype.connectMysql = function() {
    var self = this;
    var pool      =    mysql.createPool({
        connectionLimit : 10,
        // connectTimeout  : 1000,
        // acquireTimeout  : 1000,
        // timeout         : 1000,
        host     : resources.host,
        user     : resources.user,
        password : resources.password,
        database : resources.database,
        ssl : "Amazon RDS",
        debug : true
    });
    pool.getConnection(function(err,connection){
        if(err) {
          self.stop(err);
        } else {
          self.configureExpress(connection);
        }
    });
}

REST.prototype.configureExpress = function(connection) {
  	var self = this;
  	app.use(bodyParser.urlencoded({ extended: true }));
 	  app.use(bodyParser.json());
  	var router = express.Router();
  	app.use('/api', router);
  	var rest_router = new rest(router,connection);
  	// var rest_router = new rest(router,connection,md5);
  	self.startServer();
}

REST.prototype.startServer = function() {
	var port = resources.port;
	app.listen(port,function(){
    	console.log("All right ! I am alive at Port: " + port);
    });
}

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL");
    console.log(err);
    process.exit(1);
}

new REST();







//https://codeforgeek.com/2015/01/nodejs-mysql-tutorial/

// var express = require("express");
// var mysql = require('mysql');
// var app = express();
// var resources = require("./resources.json");

// var pool = mysql.createPool({
//     connectionLimit : 100, //important
//     host     : 'localhost',
//     user     : resources.user,
//     password : resources.password,
//     database : resources.database,
//     debug    :  false
// });

// function handle_database(req,res) {
    
//     pool.getConnection(function(err,connection){
//         if (err) {
//           res.json({"code" : 100, "status" : "Error in connection database"});
//           return;
//         }   

//         console.log('connected as id ' + connection.threadId);
        
//         connection.query("select * from user", function(err,rows){
//             connection.release();
//             if(!err) {
//                 res.json(rows);
//             }           
//         });

//         connection.on('error', function(err) {      
//               res.json({"code" : 100, "status" : "Error in connection database"});
//               return;     
//         });
//   });
// }

// app.get("/",function(req,res){-
//     handle_database(req,res);
// });

// app.listen(3000);
