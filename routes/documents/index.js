module.exports = function(app){
    app.post('/documents/addDocument', require('./addDocument').post);
    app.post('/documents/addPart', require('./addPart').post);
    app.post('/documents/removePart', require('./removePart').post);

    // app.get('/subjects/getSubjects', require('./getSubjects').get);
    // app.get('/subjects/getAllSubjects', require('./getAllSubjects').get);
    // app.post('/subjects/addSubject', require('./addSubject').post);
    // app.post('/subjects/changeName', require('./changeName').post);
    // app.post('/subjects/removeSubject', require('./removeSubject').post);
    // app.post('/subjects/activate', require('./activate').post);
    // app.post('/subjects/deactivate', require('./deactivate').post);
};
