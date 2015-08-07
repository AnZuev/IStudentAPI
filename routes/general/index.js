
module.exports = function(app){
    // modify
    app.post('/feedback', require('./feedback').post);

}
