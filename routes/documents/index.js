module.exports = function(app){
    app.post('/documents/addDocument', require('./addDocument').post);
    app.post('/documents/addPart', require('./addPart').post);
    app.post('/documents/removePart', require('./removePart').post);
    
};
