module.exports = function(app){
    app.post('/documents/addDocument', require('./addDocument').post);
    app.post('/documents/addPart', require('./addPart').post);
    app.post('/documents/removePart', require('./removePart').post);
    app.post('/documents/addLike', require('./addLike').post);
    app.post('/documents/addDislike', require('./addDislike').post);
    app.post('/documents/addComment', require('./addComment').post);   
    app.get('/documents/getDocumentsBy', require('./getDocumentsBy').get);
    app.get('/documents/getDocumentById', require('./getDocumentById').get);
    app.get('/documents/getComments', require('./getComments').get);

};
