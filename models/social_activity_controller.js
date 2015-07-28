/*
social_activity_controller  - класс для работы с данными, а именно отслеживать какие действия делает пользователь: ставит спасибо,
помечает как спам, задает новый вопрос или отвечает на вопросы, которые уже есть.

Основная задача -  в течении дня собирать информацию об активности пользователей и ночью(когда трафик будет меньше), обновлять
информацию в коллекции пользователей(стаж и кол-во вопросов и ответов).

Определены методы для увеличения количества поставленных "спасибо", количества поставленных "спам", количества новых вопросов
и количества новых ответов.Также определены методы для получения всего списка активностей и очищение активностей за день.


 */

var QUESTIONS_K = 0.2;
var ANSWERS_K = 0.4;
var LIKES_K = 0.05;
var SPAM_K = 0.05;


var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');

var social_activity_controller = new Schema({
    user_id:{
        type: Schema.Types.ObjectId
    },
    new_questions:{
        type: Number,
        default:0
    },
    new_answers:{
        type: Number,
        default:0

    },
    new_likes:{
      type: Number,
      default:0

    },
    new_spams:{
        type: Number,
        default:0
    }
});

social_activity_controller.statics.increment_answers = function(user_id, callback ){
    var social_activity_controller = this;
    async.waterfall([
    function(callback){
        social_activity_controller.find({user_id: user_id}, callback)
    },
    function(social_activity_controller, callback){

        if(social_activity_controller){
            social_activity_controller.new_answers++;
            social_activity_controller.save();
            return callback(null, 0);
        }else{
            var new_social_activity = new social_activity_controller ({
                user_id: user_id,
                new_answers: 1
            });
            new_social_activity.save();
            return callback(null, 1);
        }
    }
    ], callback);
};

social_activity_controller.statics.increment_questions = function(user_id, callback ){
    var social_activity_controller = this;
    async.waterfall([
        function(callback){
            social_activity_controller.find({user_id: user_id}, callback)
        },
        function(social_activity_controller, callback){

            if(social_activity_controller){
                social_activity_controller.new_questions++;
                social_activity_controller.save();
                return callback(null, 0);
            }else{
                var new_social_activity = new social_activity_controller ({
                    user_id: user_id,
                    new_questions: 1
                });
                new_social_activity.save();
                return callback(null, 1);
            }
        }
    ], callback);
};

social_activity_controller.statics.increment_likes = function(user_id, callback ){
    var social_activity_controller = this;
    async.waterfall([
        function(callback){
            social_activity_controller.find({user_id: user_id}, callback)
        },
        function(social_activity_controller, callback){

            if(social_activity_controller){
                social_activity_controller.new_likes++;
                social_activity_controller.save();
                return callback(null, 0);
            }else{
                var new_social_activity = new social_activity_controller ({
                    user_id: user_id,
                    new_likes: 1
                });
                new_social_activity.save();
                return callback(null, 1);
            }
        }
    ], callback);
};

social_activity_controller.statics.increment_spams = function(user_id, callback ){
    var social_activity_controller = this;
    async.waterfall([
        function(callback){
            social_activity_controller.find({user_id: user_id}, callback)
        },
        function(social_activity_controller, callback){

            if(social_activity_controller){
                social_activity_controller.new_spams++;
                social_activity_controller.save();
                return callback(null, 0);
            }else{
                var new_social_activity = new social_activity_controller ({
                    user_id: user_id,
                    new_spams: 1
                });
                new_social_activity.save();
                return callback(null, 1);
            }
        }
    ], callback);
};

social_activity_controller.statics.get_user_activity_list = function(callback){
    var social_activity_controller = this;
    var user_activity_list = social_activity_controller.find({}, function(user_activity_list){
        return user_activity_list;
    })
    return callback(null, user_activity_list);
}

social_activity_controller.statics.reset_user_activity_list = function(callback){
    mongoose.connection.db.dropCollection('social_activity_controllers', function(err, result) {
        if(err) return callback(err);
        return callback(null, result);
    })
}

social_activity_controller.methods.calculate_rating_increment = function(){
    return this.new_questions*QUESTIONS_K + this.new_answers*ANSWERS_K + this.new_likes*LIKES_K + this.new_spams*SPAM_K;
}


exports.social_activity_controller = mongoose.model('social_activity_controller', social_activity_controller);
