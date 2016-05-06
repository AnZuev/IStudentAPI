
module.exports = function(app){

    app.post('/general/feedback', require('./feedback').post);

}
