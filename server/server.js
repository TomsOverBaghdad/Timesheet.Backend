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
        database : resources.database
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
  	app.use('/', router);

    //
    app.use(function (req, res, next) {
        console.log("--------------------------------------------");
        console.log("--------------------------------------------");
        console.log("--------------------------------------------");
        console.log("--------------------------------------------");
        // Website you wish to allow to connect
        // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
        // res.addHeader('Access-Control-Allow-Origin', 'http://itsabouttime.herokuapp.com');
        res.addHeader('Access-Control-Allow-Origin', '*');
        console.log(res);
        // Request methods you wish to allow
        // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Request headers you wish to allow
        // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        // res.setHeader('Access-Control-Allow-Credentials', true);
        // Pass to next layer of middleware

        console.log("--------------------------------------------");
        console.log("--------------------------------------------");
        console.log("--------------------------------------------");
        console.log("--------------------------------------------");
        next();
    });
  	var rest_router = new rest(router,connection);
  	// var rest_router = new rest(router,connection,md5);
  	self.startServer();
}

REST.prototype.startServer = function() {
	var port = process.env.PORT || resources.port;
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
