/**
 * Created by anton on 17/02/15.
 */
var mongoose = require('./libs/mongoose');
var User  = require('./models/User').User;
var Questions  = require('./models/Forum').Questions;
var fs = require('fs');



var carList = fs.readFileSync("./public/static/cars.txt",'utf-8').split(',');
var car = "Ваз";
var modelList = fs.readFileSync("./public/static/models/ВАЗ.txt",'utf-8').split(',');
var systemList = fs.readFileSync("./public/static/systems.txt",'utf-8').split(',');
for (var i = 0; i< modelList.length; i++){
    var k = 100*(i+1);
    for(var x = 0; x< systemList.length; x++){
        var arrayId = car + modelList[i] + systemList[x];
        var questionArray = new Questions({
            arrayId: arrayId,
            titles:[
                {
                    title:'title 1',
                    questionId: k*(x+1),
                    watches:k+x+2
                },
                {
                    title:'title 2',
                    questionId: k*(x+1)*113,
                    watches: k*5-x+10
                }
            ]
        });
        questionArray.save(function(err, array){
            if (err)  throw err;
            console.log(array);
        });
    }
}


/*
var questions_content =  new forum_questions_and_content(
            {
                question_title: "Газель (402), РЦС, прокачной штуцер - чем крутить?",
                question_content: "Есть ли традиционные методы? Примерил головку 3/4 с воротком - слишком тесно: штуцер торчит над шлангом, который мешает снизу, справа двигатель, слева рама. А закручен наверняка от души, хоть РЦС и новый. На снятом старом открутил с трудом как раз таким воротком, боюсь, маленькая трещётка не потянет. Правда, есть ещё гибкий кардан, но тоже маленький, под эту самую трещётку, обычного воротка такого размера не припомню. Существуют переходники с 1/2 (вороток) на 1/4 (насадка)? Сходу не нашёл.Понимаю, что надо было заполнять РЦС жижей ещё до установки, но когда прикручивал, один болт отчётливо хрупнул, лучше его не трогать лишний раз.",
                about_author:{
                    author_id: "54e62b3a80dcd073025a88b4",
                    author_name: "Антон Зуев"
                },
                answers:[
                    {
                        answer: "есть разрезные прокачные ключи на 8-10-12 купи 1 раз и пользуйся всю оставшуюся жизнь.",
                        about_author:{
                            author_name: "Алексей Крипушин",
                            author_experience: "Профи"
                        }

                    }
                ]
            }

);
questions_content.save(function(err, question_content){
    console.log(arguments);
})
*/

