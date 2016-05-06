
module.exports = function(app){
    app.get('/subjects/getSubjects', require('./getSubjects').get);

    app.post('/subjects/addSubject', require('./addSubject').post);
    app.post('/subjects/changeName', require('./changeName').post);
    app.post('/subjects/removeSubject', require('./removeSubject').post);
    app.post('/subjects/activate', require('./activate').post);
    app.post('/subjects/deactivate', require('./deactivate').post);
};
