
module.exports = function(app){
    app.post('/workTypes/addType', require('./addType').post);
    app.post('/workTypes/enable', require('./enable').post);
    app.post('/workTypes/disable', require('./disable').post);
    app.post('/workTypes/deactivate', require('./disable').post);
    app.post('/workTypes/setName', require('./setName').post);
    app.get('/workTypes/isExist', require('./isExist').get);
    app.get('/workTypes/getById', require('./getById').get);
    app.get('/workTypes/getNameById', require('./getNameById').get);
    app.get('/workTypes/getEnabled', require('./getEnabled').get);
    app.get('/workTypes/getDisabled', require('./getDisabled').get);
    app.get('/workTypes/getAll', require('./getAll').get);
};
