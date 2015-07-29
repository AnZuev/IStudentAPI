var path = require('path');
var util = require('util');
var http = require('http');

function HttpError(status, message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.status = status;
    this.message = message || http.STATUS_CODES[status] || "Error";

}

util.inherits(HttpError, Error);
HttpError.prototype.name = 'HttpError';

exports.HttpError = HttpError;

function AuthError(message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);

    this.message = message;

}

util.inherits(AuthError, Error);
AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;

function DbError(status, message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, DbError);
    this.status = status || 500;
    this.message = message || "Ошибка базы данных";

}

util.inherits(DbError, Error);
DbError.prototype.name = 'DbError';

exports.DbError = DbError;


function badDataError(status, message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, DbError);
    this.status = status || 400;
    this.message = message || "Плохие данные";

}

util.inherits(DbError, Error);
badDataError.prototype.name = 'badDataError';

exports.badDataError = badDataError;


