const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const IBMCloudEnv = require('ibm-cloud-env');

cookieParser    = require('cookie-parser'),
session         = require('express-session'),
bodyParser      = require('body-parser');

query           = require('querystring');

const UrlPattern = require('url-pattern');
const rolesacs = require('./config/accessRoles.json');


const { LogContext,  AppLogger } = require('./config/logcontext');
var logctx= new LogContext();
var applog= new AppLogger();
applog.LogContext=logctx;
var label='server'
applog.info( 'Server is starting',label);
applog.info( 'Server test message',label);

const localConfig = require('./config/local.json');


const app = express();
app.set('x-powered-by', false);
const server = http.createServer(app);


IBMCloudEnv.init('/server/config/mappings.json');
// Add your code here
const port =  process.env.SHAPP_SERVICE_PORT  || localConfig.port;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, ad-name, x-powered-by, date, authorization, callid, SystemID, DtRequest,app_username,x-Content-Type");
  res.header('Access-Control-Allow-Methods', 'DELETE,GET,PATCH,POST,PUT'); 
  next();
});


/*=====================================================================*/


const apperror = require('./error/appError');
const applib = require('./applib/apputils');


let i_todos=[
   {"id": "1", "name": "todo-1",  "description": "description todo 1", "owner": "usr1"},
   {"id": "2", "name": "todo-2",  "description": "description todo 2", "owner": "usr2"},
   {"id": "3", "name": "todo-3",  "description": "description todo 3", "owner": "usr4"},
   {"id": "4", "name": "todo-4",  "description": "description todo 4", "owner": "usr4"},
   {"id": "5", "name": "todo-5",  "description": "description todo 5", "owner": "usr3"}
];

app.options('/api/todos',  function(req, res) {
  label='options /api/todos' 
  applog.info( ` Виклик методу `  ,label);
  return res.status(200).end();
});

app.options('/api/todo',  function(req, res) {
  label='options /api/todo' 
  applog.info( ` Виклик методу `  ,label);
  return res.status(200).end();
});

app.options('/api/todo/:todoid',  function(req, res) {
  label='options /api/todo/:id' 
  applog.info( ` Виклик методу `  ,label);
  return res.status(200).end();
});

app.get('/api/health',  function(req, res) {
  let label='health';
  applog.info( 'call api/health method', label);
  let result={ "status": "UP"}
  return res.status(200).json( result );

});  


// Включаємо  session memory store
const memoryStore = new session.MemoryStore()

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}))


// включаємо keycloack
const keycloak = require('./config/keycloak-config.js').initKeycloak(memoryStore);
app.use(keycloak.middleware());


/**
 * Перевірка доступа
 * @param {*} token 
 * @param {*} request 
 * @returns 
 */
function checkAccess(token, request) {
  let label='checkAccess';
  let is_role=false ;
  applog.info(`checkAccess Method: ${request.method} Path: ${request.path}`, label);

  applog.info("Set session param ", label);
  request.session["keycloak-token"]=token;

  applog.info(`Check parmission of: ${token.content.preferred_username} - ${token.content.name} state= ${token.content.session_state}`, label);
  let ri = 0;
  while (ri <rolesacs.length){
      let pattern = new UrlPattern( rolesacs[ri].path);
      let v1=pattern.match(  request.path );
      let v2=rolesacs[ri].method;
      if ( pattern.match(  request.path ) !== null && request.method === rolesacs[ri].method) {
        
        rolelist=rolesacs[ri].accessroles;
        let i = 0;
        while (i < rolelist.length) {
          console.log(rolelist[i]);
          if ( token.hasRole( rolelist[i]) ) {
            is_role=true ;
            break; 

          }
          i++;
        }        
      }
      ri++;
  }
  applog.info(`Check parmission : ${token.content.preferred_username} - ${token.content.name} state= ${token.content.session_state}  against Method: ${request.method} Path: ${request.path}  RESULT: ${is_role}`, label);
  return is_role;
}  

/**
 * Find todo in array by id
 * @returns  
 *    if found - array index  
 *    if not found - (-1)
 */
function findtodobyid( todolist, todo_id ) {
  return new Promise(function (resolve) {
      return resolve( todolist.findIndex( (item ) => { 
                                if (item.id.localeCompare(todo_id ) === 0){
                                    return true;
                                }
                      }) );
  });
};   //findtodobyid

//================================================================================
// ###################     PROTECTED API     #####################################
//================================================================================

app.get('/api/todos',  keycloak.protect( checkAccess ), function(req, res) {
  let label='todos';
  let ssnk=req.session['keycloak-token'];
  let alogctx= new LogContext();
  let alog= new AppLogger();
  alog.LogContext=alogctx;      
  alog.State=ssnk.content.session_state;  
  alog.Username=ssnk.content.preferred_username;
  alog.info( 'call api/todos method', label);
  try{
      let result=i_todos;
      return res.status(200).json( result );
  } 
  catch (err){
      alog.error( `Error ${err.message} `, label);
      errresp=applib.HttpErrorResponse(err)
      alog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
      return res.status(errresp.Error.statusCode ).json(errresp);    

  }

});  

/**
 *  request:
 *      {"name": "todo name", "description": "todo description", "owner": "todo username"}
 *  response-ok
 *      {}
 */
app.post('/api/todo',  keycloak.protect( checkAccess ),  function(req, res) {
  let label='createtodo';
  let ssnk=req.session['keycloak-token'];
  let alogctx= new LogContext();
  let alog= new AppLogger();
  alog.LogContext=alogctx;      
  alog.State=ssnk.content.session_state;  
  alog.Username=ssnk.content.preferred_username;
  alog.info( 'call post api/todo method', label);

  let body=req.body;
  try { 
      alog.info( 'Check propery [name]', label);
      if (!body.hasOwnProperty("name")){
        throw new apperror.ValidationError( 'key [name] is absend' );
      }
      alog.info( 'Check propery [description]', label);
      if (!body.hasOwnProperty("description")){
        throw new apperror.ValidationError( 'key [description] is absend' );

      }
      alog.info( 'Check propery [owner]', label);
      if (!body.hasOwnProperty("owner")){
        throw new apperror.ValidationError( 'key [owner] is absend' );
      }
      alog.info( 'Return result', label);
      
      body["id"] = uuid.v4()
      i_todos.push(  body )
      let result={"id": body.id};
      return res.status(200).json( result );

  } 
  catch (err){
    alog.error( `Error ${err.message} `, label);
    errresp=applib.HttpErrorResponse(err)
    alog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
    return res.status(errresp.Error.statusCode ).json(errresp);

  }

});

app.get('/api/todo/:todoid', keycloak.protect( checkAccess ), function(req, res) {
    let label='readTodo';
    let ssnk=req.session['keycloak-token'];
    let alogctx= new LogContext();
    let alog= new AppLogger();
    alog.LogContext=alogctx;      
    alog.State=ssnk.content.session_state;  
    alog.Username=ssnk.content.preferred_username;
    alog.info( 'call get api/todo by todoid method', label);
  
    let todo_id = req.params.todoid;
    try { 
  
        alog.info( 'Return todo by id', label);
        let result=i_todos[0];
        findtodobyid(i_todos, todo_id)
        .then (todoidx=>{
            alog.warn( '***************************************************************', label);
            alog.warn( `todo index= ${todoidx}`, label);
            alog.warn( '***************************************************************', label);
            if ( todoidx <0 ) {
              throw new apperror.ValidationError( `Record with id= ${todo_id} not found`  );

            } else {
                let result = i_todos[todoidx] ;
                return res.status(200).json( result );
            }
          
        })
        .catch (err =>{
            alog.error( `Error ${err.message} `, label);
            errresp=applib.HttpErrorResponse(err)
            alog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
            return res.status(errresp.Error.statusCode ).json(errresp);
        });
    } 
    catch (err){
      alog.error( `Error ${err.message} `, label);
      errresp=applib.HttpErrorResponse(err)
      alog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
      return res.status(errresp.Error.statusCode ).json(errresp);
  
    };
  

});  

app.delete('/api/todo/:todoid', keycloak.protect( checkAccess ), function(req, res) {
  let label='deleteTodo';
  let ssnk=req.session['keycloak-token'];
  let alogctx= new LogContext();
  let alog= new AppLogger();
  alog.LogContext=alogctx;      
  alog.State=ssnk.content.session_state;  
  alog.Username=ssnk.content.preferred_username;
  alog.info( 'call delete api/todo by todoid method', label);

  let todo_id = req.params.todoid;
  try { 

      alog.info( 'Return todo by id', label);
      let result=i_todos[0];
      findtodobyid(i_todos, todo_id)
      .then (todoidx=>{
          alog.warn( '***************************************************************', label);
          alog.warn( `todo index= ${todoidx}`, label);
          alog.warn( '***************************************************************', label);
          if ( todoidx <0 ) {
            throw new apperror.ValidationError( `Record with id= ${todo_id} not found`  );

          } else {
              let result = { "id": i_todos[todoidx].id };
              i_todos.splice(todoidx, 1);
              return res.status(200).json( result );
          }
        
      })
      .catch (err =>{
          alog.error( `Error ${err.message} `, label);
          errresp=applib.HttpErrorResponse(err)
          alog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
          return res.status(errresp.Error.statusCode ).json(errresp);
      });
  } 
  catch (err){
    alog.error( `Error ${err.message} `, label);
    errresp=applib.HttpErrorResponse(err)
    alog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
    return res.status(errresp.Error.statusCode ).json(errresp);

  };


}); 


if(!module.parent){ 

  server.listen(port, function(){

    applog.info( 'SERVER HAS STARTED',label);
    applog.info( `LISTENING  PORT= ${port} on HOST ${ ( typeof process.env.HOSTNAME === "undefined") ? 'localhost' :  process.env.HOSTNAME}`,label);
  
  });
}


module.exports = server;