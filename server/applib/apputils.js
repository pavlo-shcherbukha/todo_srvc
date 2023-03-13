/**
* apputils.js
*
*/




/**
 * Foramt  webservice response error
 * @param {*} err 
 * @param {*} statusCode 
 * @param {*} code 
 * @returns 
 */
function HttpErrorResponse(err, statusCode, code) {
	if (err.hasOwnProperty('name')) {
	  rp_name = err.name ; 
	} else {

	  rp_name = "error";
	}

	if (err.hasOwnProperty('statusCode')) {
	  rp_statusCode = err.statusCode;
	} else if ( typeof statusCode !== "undefined" ){
	  rp_statusCode = statusCode;
	} else {
	  rp_statusCode = 503 ;
	}

	if (err.hasOwnProperty('stack')) {
	  rp_stack = err.stack;
	} else {
	  rp_stack = '';
	}   

	if (err.hasOwnProperty('code')) {
	  rp_code = err.code;
	} else if ( typeof code !== "undefined" ){
	  rp_code = code;
	} else {
	  rp_code = 'error' ;
	}
	if (err.hasOwnProperty('description')) {
	  rp_description = err.description;
	} else if ( err.hasOwnProperty('message') ){
	  rp_description = err.message;
	} else {
	  rp_description = 'application error' ;
	}

	if (err.hasOwnProperty('target')) {
	  rp_target = err.target;
	} else {
	  rp_target = '' ;
	}

	let ResponeError = {
		code: rp_code,
		statusCode: rp_statusCode,
		description: rp_description,
		target: rp_target,
		stack: rp_stack
	} ;   
	errorObject= {};
	errorObject.Error=ResponeError;
	return errorObject;
}    



module.exports.HttpErrorResponse= HttpErrorResponse;