var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var util = require('util');
var async = require('async');


var dbError = require('../error').dbError;

var subject = new Schema({
    title: {
        type: String,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
        default: Date.now()
    },
    enabled: {
        type: Boolean,
        default: false
    }
})



/*
 Метод для получения имени предмета
 Вход: id
 Выход: название

 */
subject.methods.getSubjectsName = function(){
    return this.title;
};

/*
Вход:  id предмета
Выход: либо название предмета, либо ошибка

*/
subject.statics.getSubjectsName = function(id, callback){

    this.find({ _id: id,
                enabled: true}, {title:1}, function(err, res){
        if(err) return callback(new dbError(err));
        else{
            if(!res) return new dbError(null, 404, util.format("no subject found by %s", id));
            else{
                return callback(null, res);
            }
        }

    })
};

/*
    Вход: -
    Выход: список всех предметов с названиями и id
 */
subject.statics.getAllSubjects = function(callback){

    this.find({
        enabled: true}, {title:1}, function(err, res){
        if(err) return callback(new dbError(err));
        else{
            if(!res) return new dbError(null, 404, util.format("no subject found by %s", id));
            else{
                return callback(null, res);
            }
        }

    })
};


/*
 Метод для получения списка предметов по названию (используем поиск с помощью regex)
 Вход:
 Выход: либо ошибка, либо список предметов
 */
subject.statics.getSubjectsByTitle = function(title, callback){
    this.aggregate([
        {
            $match: {
                title: {$regex: title},
                enabled: true
            }
        },
        {
            $limit: 10
        },
        {
            $sort: {title:1}
        },
        {
            $project:{
                subjects: "$subjects",
                id: "$_id",
                _id: 0
            }
        }
    ], function(err, subjectsItem){
        if(err) return callback(err);
        if(subjectsItem.length == 0) return callback(null, []);
        subjectsItem = subjectsItem[0];
        return callback(null, subjectsItem);
    })
};
/*
 Метод для добавления предмета
 Вход: название, флаг включения
 Выход: либо ошибка, либо созданный предмет
 */
subject.statics.addSubject = function(title, callback){
    var subject = this;
    var newSubject = new subject({
        title: title
    });
    newSubject.save(function(err, subject){
        if(err) return callback(err);
        else{
            var subjectToReturn = {
                title: subject.title,
                id: subject._id
            };
            return callback(null, subjectToReturn);
        }
    })
};


/*
 Метод для изменения статуса предмета на активный
 Вход: предмет
 Выход: измененный предмет
 */
subject.statics.activate = function(id,callback) {
    this.update({_id: id}, 
    { 
        enabled: true,
        $currentDate: {updated: true}
    },  function(err, res){
             if (res.nModified != 0 && res.n != 0) return callback(null, true);
             else if(err) return callback(new dbError(err));
                  else if (res.nModified == 0) return new dbError(null, 404, util.format("no subject found by %s", id));
    });
};


/*
 Метод для изменения статуса предмета на неактивный
 Вход: предмет
 Выход: измененный предмет
 */
subject.methods.deactivate = function(){
    this.update({_id: id},
        {
            enabled: false,
            $currentDate: {updated: true}
        },  function(err, res){
            if (res.nModified != 0 && res.n != 0) return callback(null, true);
            else    if(err) return callback(new dbError(err));
                    else if (res.nModified == 0) return new dbError(null, 404, util.format("no subject found by %s", id));
        });
};

exports.subject = mongoose.model('subject', subject);




