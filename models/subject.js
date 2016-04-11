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
        type: Boolean
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
 Метод для получения списка предметов по id
 Вход:  id предмета
 Выход: либо список предметов с id, либо ошибка

 */
subject.statics.getSubjects= function(id, callback){
    this.aggregate([
        {
            $match:{
                _id: id,
                enabled: true
            },
            $project:{

                title: "$title"
            }
        }
    ], function(err, subjectsItem){
        if(err) return callback(err);
        else{
            return callback(null, subjectsItem);
        }
    });
};



/*
 Метод для получения списка предметов по названию (используем поиск с помощью regex)
 Вход:
 Выход: либо ошибка, либо список предметов
 */
subject.statics.getSubjectsByTitle = function(title, subject, callback){
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
        subjectsItem.subjects.forEach(function(element){

            element.id = element._id;
            delete element._id;
        });
        return callback(null, subjectsItem);
    })
};
/*
 Метод для добавления предмета
 Вход: название, флаг включения
 Выход: либо ошибка, либо созданный предмет
 */
subject.statics.addSubject = function(title, enabled, callback){
    var subject = this;
    var newSubject = new subject({
        title: title,
        enabled: enabled
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
        console.log(arguments);
    });

};
/*
 Метод для изменения статуса предмета на неактивный
 Вход: предмет
 Выход: измененный предмет
 */
subject.methods.deactivate = function(){
    this.enabled = false;
    this.update
};

exports.subject = mongoose.model('subject', subject);




