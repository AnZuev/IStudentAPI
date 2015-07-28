 HttpError = require('../../error').HttpError;
 var checkAuth = require('../../middleware/auth/checkAuth');
 var loadCars = require('../../middleware/forum/loadCars');
 var loadSystems = require('../../middleware/forum/loadSystems');
 var loadModels = require('../../middleware/forum/loadModels');
 var loadQuestions = require('../../middleware/forum/loadQuestions');
 var loadQuestion = require('../../middleware/forum/loadQuestion');
 var loadQuestionTemplate = require('../../middleware/forum/loadQuestionTemplate');









 module.exports = function(app){
    app.get('/%D1%84%D0%BE%D1%80%D1%83%D0%BC', loadCars, require('./frontPage').get);
    app.post('/service/add_answer', checkAuth, require('./addAnswer').post);
    app.get('/service/get_all_models', require('./getModels').get);
    app.get('/service/get_list_of_topics', require('./getSystems').get);
    app.get('/service/get_list_of_questions', require('./getQuestions').get);
    app.get('/service/load_question_and_answers', require('./getQuestion').get);
    app.post('/service/make_answer', checkAuth, require('./likeAnswer').post);
    app.post('/service/make_spam', checkAuth, require('./unlikeAnswer').post);
    app.post('/service/add_new_question', checkAuth, require('./addQuestion').post);



    //прямые роуты


    //app.get('/%D1%84%D0%BE%D1%80%D1%83%D0%BC/:company_name/:model/:car_part/:topic/:question_title', load_topics_list, load_questions_list, load_question_and_answers_direct_request,  require('./direct_requests_question_and_answers').get);
    //app.get('/%D1%84%D0%BE%D1%80%D1%83%D0%BC/:company_name/:model/:car_part/:topic', load_topics_list, load_questions_list, require('./direct_requests_questions_list').get);
    //app.get('/%D1%84%D0%BE%D1%80%D1%83%D0%BC/:company_name/:model/:car_part', load_topics_list, require('./direct_requests_topics_list').get);
    //app.get('/%D1%84%D0%BE%D1%80%D1%83%D0%BC/:company_name/:model/', require('./direct_requests_company_model').get);
    app.get('/api/forum/getSystems', loadSystems, require('./getSystems').get);
    app.get('/api/forum/getModels', loadModels, require('./getModels').get);
    app.get('/api/forum/getCars', loadCars, require('./getCars').get);
    app.get('/api/forum/getQuestions', loadQuestions, require('./getQuestions').get);
    app.get('/api/forum/getQuestion', loadQuestion, require('./getQuestion').get);
    app.get('/api/forum/getQuestionTemplate', loadQuestionTemplate, require('./getQuestionTemplate').get);
    app.post('/api/forum/addQuestion', checkAuth, require('./addQuestion').post);
    app.post('/api/forum/addAnswer', checkAuth, require('./addAnswer').post);
    app.post('/api/forum/likeAnswer', checkAuth, require('./likeAnswer').post);
    app.post('/api/forum/unlikeAnswer', checkAuth, require('./unlikeAnswer').post);












 }
