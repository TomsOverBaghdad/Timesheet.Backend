var mysql   = require("mysql");

function REST_ROUTER(router,connection) {
// function REST_ROUTER(router,connection,md5) {
    var self = this;
    // self.handleRoutes(router,connection,md5);
    self.handleRoutes(router,connection);
}


function mySqlErrorJson(err){
    return {"Error" : err, "Message" : "Error executing MySQL query"};
}

function errorJson(message){
    return {"Error" : true, "Message" : message};
}

function SignIn(req, res, connection){
    var query = "INSERT INTO timesheet.timesheet_log "
              + "( TimesheetId, DTStartLog, UserEmail )"
              + "VALUES (?, NOW(), ?)"
    var table = [req.params.timesheetId, req.params.userEmail];
    query = mysql.format(query, table);
    connection.query(query, function(err, rows){
        if(err) {
            res.json(mySqlErrorJson(err));
        } else {
            res.json({"Error" : false, "Message" : "Success", "SignIn" : rows});
        }
    });
}

function SignOut(lastLogged, req, res, connection){
    var highLogTime = 4; //4 hours
    var query = "UPDATE timesheetapp.timesheet_log"
              + " SET DTEndLog = NOW(), Comment = ?, HighLogTime = TIMESTAMPDIFF(HOUR, lastLogged.DTStartLog, NOW()) > " +  highLogTime //4 hours
              + " WHERE LogId = ?";
    var table = [lastLogged.Comment, lastLogged.LogId];
    connection.query(query, function(err, rows){
        if(err) {
            res.json(mySqlErrorJson(err));
        } else {
            res.json({"Error" : false, "Message" : "Success", "SignOut" : rows});
        }
    });
}


// REST_ROUTER.prototype.handleRoutes = function(router,connection,md5) {
REST_ROUTER.prototype.handleRoutes = function(router,connection) {
    var self = this;
    var errorJson = 
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/timesheet/:timesheetId",function(req,res){
        //todo is this too much sql? should this be in a SP or a view?
        var query = "SELECT programs.`Name` AS programName,"
                  + " organizations.`Name` AS organizationName,"
                  + " timesheet.`Name` AS timesheetName"
                  + " FROM timesheet"
                  + " JOIN programs "
                  + " ON programs.`ProgramId` = timesheet.`ProgramId`"
                  + " JOIN organizations"
                  + " ON organizations.`OrganizationId` = programs.`OrganizationId`"
                  + " WHERE timesheet.`TimesheetId` = ?";
        var table = [req.params.timesheetId];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json(mySqlErrorJson(err));
            } else {
                // var program = rows.lenth == 0 ? null : rows[0];
                res.json({"Error" : false, "Message" : "Success", "program" : rows[0]});
            }
        });
    });

//this is a hack for now, ultimately need to implement users 
    router.get("/timesheet/GetLastLogged/:userEmail",function(req,res){
        var query = "SELECT * FROM timesheet_log"
                  + " WHERE timesheet_log.`UserEmail` = ?"
                  + " ORDER BY timesheet_log.`DTStartLog` DESC LIMIT 1";
        var table = [req.params.userEmail];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json(mySqlErrorJson(err));
            } else {
                res.json({"Error" : false, "Message" : "Success", "timesheetLog" : rows[0]});
            }
        });
    });
//hack for now
    router.post("/timesheet/:timesheetId/Log/:userEmail",function(req,res){
        var query = "SELECT * FROM timesheet_log"
                  + " WHERE timesheet_log.`UserEmail` = ?"
                  + " ORDER BY timesheet_log.`DTStartLog` DESC LIMIT 1";
        var table = [req.params.userEmail];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if (err) {
                res.json(errorJson(err));
            } else {
                if (rows.length > 0) {
                    lastLogged = rows[0];

                    if(lastLogged.DTEndLog == null) {
                        if(lastLogged.TimesheetId != req.params.timesheetId){
                            res.json(errorJson("Did not log out from another timesheet"));
                        }
                        else {
                            SignOut(lastLogged, req, res, connection);
                        }    
                        return;                    
                    }
                }
                SignIn(req, res, connection);
            }
        });
    });

    // router.post("/users",function(req,res){
    //     var query = "INSERT INTO ??(??,??) VALUES (?,?)";
    //     var table = ["user_login","user_email","user_password",req.body.email,md5(req.body.password)];
    //     query = mysql.format(query,table);
    //     connection.query(query,function(err,rows){
    //         if(err) {
    //             res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    //         } else {
    //             res.json({"Error" : false, "Message" : "User Added !"});
    //         }
    //     });
    // });

    // router.put("/users",function(req,res){
    //     var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    //     var table = ["user_login","user_password",md5(req.body.password),"user_email",req.body.email];
    //     query = mysql.format(query,table);
    //     connection.query(query,function(err,rows){
    //         if(err) {
    //             res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    //         } else {
    //             res.json({"Error" : false, "Message" : "Updated the password for email "+req.body.email});
    //         }
    //     });
    // });

    // router.delete("/users/:email",function(req,res){
    //     var query = "DELETE from ?? WHERE ??=?";
    //     var table = ["user_login","user_email",req.params.email];
    //     query = mysql.format(query,table);
    //     connection.query(query,function(err,rows){
    //         if(err) {
    //             res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    //         } else {
    //             res.json({"Error" : false, "Message" : "Deleted the user with email "+req.params.email});
    //         }
    //     });
    // });
}

module.exports = REST_ROUTER;
