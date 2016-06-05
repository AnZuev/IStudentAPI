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
});




/*
Вход:  id предмета
Выход: либо название предмета, либо ошибка

*/
subject.statics.getSubjectNameById = function(id, callback){

    this.find({ _id: id,
                enabled: true}, {title:1}, function(err, res){
        if(err) return callback(new dbError(err));
        else {
            if (res.length == 0) return new dbError(null, 404, util.format("no subject found by %s", id));
            else return callback(null, res);
        }
    })
};


/*
 Вход: id предмета
 Выход: true, если найден предмет
        ошибка
 */
subject.statics.isExist = function(id, callback){

    this.find({
        _id: id,
        enabled: true
        }, {title:1}, function(err, res){
        if(err) return callback(new dbError(err));
        else{
            if(res.length == 0) return callback(new dbError(null, 404, util.format("no subjects")));
            else return callback(null, true);
        }
    })
};



/*
    Вход: -
    Выход: список всех предметов с названиями и id
 */
subject.statics.getActivatedSubjects = function(callback){

    this.find({
        enabled: true}, {title:1}, function(err, res){
        if(err) return callback(new dbError(err));
        else{
            if(res.length == 0) return callback(new dbError(null, 204, util.format("no subjects")));
            else return callback(null, res);
        }

    })
};

/*
 Вход: -
 Выход: список всех предметов с названиями и id
 */
subject.statics.getAllSubjects = function(callback){

    this.find({}, {}, function(err, res){
        if(err) return callback(new dbError(err));
        else{
            if(!res) return callback(new dbError(null, 204, util.format("no subject found")));
            else{
                if(res.length == 0) return callback(new dbError(null, 204, util.format("no subjects")));
                else return callback(null, res);
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
                title: "$title",
                id: "$_id",
                _id: 0
            }
        }
    ], function(err, subjectsItem){
         if(err) return callback(new dbError(err));
        if(subjectsItem.length == 0) return callback(new dbError(null, 204, util.format("no subjects found by %s", title)));
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
        if(err) {
            if (err.code == 11000 || err.code == 11001) return callback(new dbError(null, 400, util.format("Уже существует предмет с названием %s", title)));
            else return callback(new dbError(err));
        }
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
Метод для удаления предмета
вход: id
выход: true , если предмет удален
       ошибка, если предмета нет
 */
subject.statics.removeSubjectById = function(id, callback){
    var subjects = this;
    subjects.remove({_id: id}, function (err, subject) {
        if (err) return callback(new dbError(err));
        if (subject.result.n == 0) return callback(new dbError(null, 404, util.format("No subject found by id: %s",id)));
        else return callback(null, true);
    });
};

/*
    Метод меняет название предмета на newTitle по id

    вход: id, newTitle
    выход: true, если успешно изменено имя
           ошибка, если предмета нет
 */
subject.statics.changeName = function(id, newTitle, callback){
    var subjects = this;

    subjects.update({_id: id},
        {
            title: newTitle
        },  function(err, subject){
            if (err){
                if (err.code == 11000|| err.code == 11001) return callback(new dbError(null, 400, util.format("Невозможно выполнить операцию, так как уже есть предмет с названием %s", newTitle)));
                else return callback(new dbError(err));
            }
            else if(subject.nModified == 0) return callback(new dbError(null, 404, "Не найдено предметов для изменеия"));
            else return callback(null,true);

        });
};

/*
 Метод для изменения статуса предмета на активный
 Вход: id
 Выход: true, если успешно
        false, если нет
 */
subject.statics.activate = function(id,callback) {
    this.update({_id: id}, 
    { 
        enabled: true,
        $currentDate: {updated: true}
    },  function(err, res){
             if (res.nModified != 0 && res.n != 0) return callback(null, true);
             else if(err) return callback(new dbError(err));
                  else if (res.nModified == 0) return callback(new dbError(null, 404, util.format("no subject found by %s", id)));

    });
};


/*
 Метод для изменения статуса предмета на неактивный
 Вход: id
 Выход: true, если успешно
 false, если нет
 */
subject.statics.deactivate = function(id,callback) {
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




