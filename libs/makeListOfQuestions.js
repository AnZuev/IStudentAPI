module.exports = function(questions){
    var list = [];
    for(var i = 0; i< questions.length; i++){
        var questionItem = {
            title: questions[i].title,
            watches: questions[i].social.watches,
            _id: questions[i]._id
        };
        list.push(questionItem);
    }
    return list;
};