
module.exports = function(app){

	app.get('/universities/getUniversities', require('./getUniversities').get);
	app.get('/universities/getFaculties', require('./getFaculties').get);
	app.post('/universities/addUniversity', require('./addUniversity').post);
	app.post('/universities/addFaculty', require('./addFaculty').post);

};
