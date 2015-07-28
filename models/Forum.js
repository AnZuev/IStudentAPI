var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var httpError = require('../error').HttpError;
var DbError = require('../error').DbError;


/*
var Questions = new Schema({
    arrayId: {   // производитель + модель + часть + подкатегория
        type: String,
        require: true
    },
    titles:[
        {
            title:{
                type: String
            },
            questionId:{
                type: Number//Schema.Types.ObjectId
            },
            watches:{
                type: Number,
                default:0
            }
        }
    ]
});

Questions.statics.addQuestion = function(title ,questionId, arrayId , callback){
    var Question=this;
            Question.findOneAndUpdate(
                {arrayId: arrayId},
                 {$push: {"titles":
                    {
                     title: title,
                     questionId: questionId
                    }
                 }},function(err, question){
                    console.log("Вывод вопроса из добавление в список вопоросов: " + question);
                    if(err) callback(new DbError('ошибка при добавлении вопроса'));
                    callback(null)
                }
                )

};

Questions.statics.getQuestions = function(arrayId, callback){
    var Questions = this;
    Questions.findOne({arrayId:arrayId}, function(err, questions){
        if(err) return callback(err);
        if(questions){
            if(questions.titles.length > 0){
                return callback(null, questions);
            }else{
                return callback(new httpError(204));
            }
        }else{
            return callback(new httpError(404));
        }
    })
};

exports.Questions = mongoose.model('Questions', Questions);

*/

//--------------------------------------------


var Question = new Schema({
    title:{
        type:String,
        require: true,
        unique: true
    },
    content:{
        type:String,
        require: true
    },
    about:{
        car:{
            type: String
        },
        model:{
            type: String
        },
        system:{
            type: String
        }
    },
    author:{
        authorId:{
            type: Schema.Types.ObjectId
        },
        authorUrl:{
          type: String
        },
        name:{
            type: String
        },
        experience:{
            type: String,
            default: "Новичок"
        }
    },

    social:{
        watches:{
            type:Number,
            default:0
        }
    },

    created:{
        type: Date,
        default: Date.now()
    },

    answers: [
        {
            answer:{
                type: String,
                required: true
            },

            created:{
                type: Date,
                default: Date.now()
            },

            author:{
                name:{
                    type: String
                },
                photoUrl:{
                    type: String
                },
                experience:{
                    type: String,
                    default: "Новичок"
                },
                authorId: {
                    type: Schema.Types.ObjectId
                }
            },

            unlikes:{
                rating:{
                    type: Number,
                    default:0
                },
                senders:[]
            },

            likes:{
                rating:{
                    type: Number,
                    default:0
                },
                senders:[]

            }
        }
    ]
});

Question.statics.load = function(id, callback){
    var Question = this;
    Question.findByIdAndUpdate(id,{$inc:{"social.watches": 1}}, function(err, question){
        if(err) return callback(err);
        if(question){
            return callback(null, question);
         }else{
            return callback(new httpError(404));
         }
    })
};

Question.statics.addQuestion =  function(title, content, authorId, authorUrl, experience, name, aboutCar, aboutModel, aboutSystem,  callback){
    var Question = this;
    async.waterfall([
        function(callback){
            Question.findOne({"title": title}, callback)
        },
        function(question, callback){
            if(question){
                console.log(question);
                return callback(new httpError(400));
            }else{
                var newQuestion = new Question({
                    author:{
                        name: name,
                        authorId: authorId,
                        experience: experience,
                        authorUrl: authorUrl
                    },
                    title: title,
                    content: content,
                    about:{
                        car: aboutCar,
                        model: aboutModel,
                        system: aboutSystem
                    }
                });
                newQuestion.save(function(err){
                    if(err) {
                        return callback(err);
                    }else{
                        return callback(null, newQuestion);
                    }

                });

            }
         }
    ], callback);
};

Question.statics.addAnswer = function(questionId, answer, name, authorId, experience, callback){
    var Question = this;

    Question.findByIdAndUpdate(questionId, { $addToSet : {"answers":
    {
        answer: answer,
        author:{
            name: name,
            experience: experience,
            authorId: authorId
        }
    }
    }}, function(err, question){
        if(err) throw err;
        var answer = question.answers[question.answers.length - 1];
        return callback(null, answer);
    });

};

Question.statics.like = function(questionId, answerId, userId, callback){

    this.findByIdAndUpdate(questionId, {}, function(err, question){
        if(err) return callback(err);
        if(!question) return callback(new httpError(400));
        // добавить отметку о добавлении ответа
        for(var i = 0; i< question.answers[answerId].likes.senders.length; i++){
            if(question.answers[answerId].likes.senders[i] == userId) return callback(new httpError(400));
        }
        question.answers[answerId].likes.rating++;
        question.answers[answerId].likes.senders.push(userId);
        question.save();
        return true;
    })
};

Question.statics.unlike = function(questionId, answerId,userId, callback){
    this.findByIdAndUpdate(questionId, {}, function(err, question){
        if(err) return callback(err);
        if(!question) return callback(new httpError(400));
        // добавить отметку о добавлении ответа
        for(var i = 0; i< question.answers[answerId].likes.senders.length; i++){
            if(question.answers[answerId].unlikes.senders[i] == userId) return callback(new httpError(400));
        }
        question.answers[answerId].unlikes.rating++;
        question.answers[answerId].unlikes.senders.push(userId);
        question.save();
        return true;

    })


};

Question.statics.loadQuestionByTitle = function(title, callback){
    var Question = this;
    Question.findOneAndUpdate({title: title},{$inc:{"social.watches": 1}}, function(err, question){
        if(err) {
            return callback(err);
        }
        if(question){
            return callback(null, question);
        }else{
            return callback(new httpError(404));
        }
    })
};

Question.statics.getQuestionsByCar = function(car, callback){
    var Question = this;
    Question.find({'about.car': car}, function(err, questions){
        if(err) return callback(err);
        if(questions.length >  0) {
            return callback(null, questions)
        }else{
            return callback(new DbError('empty'));
        }
    })
};
Question.statics.getQuestionsByCarAndModel = function(car, model, callback){
    var Question = this;
    Question.find({'about.car': car, 'about.model': model}, function(err, questions){
        if(err) return callback(err);
        if(questions.length >  0) {
            return callback(null, questions)
        }else{
            return callback(new DbError('empty'));
        }
    })
};
Question.statics.getQuestionsByCarModelSystem = function(car, model, system, callback){
    var Question = this;
    Question.find({"about.car": car, "about.model": model, "about.system": system}, function(err, questions){
        if(err) return callback(err);
        else{
            return callback(null, questions);
        }

    })
}








exports.Question = mongoose.model('Question', Question);



