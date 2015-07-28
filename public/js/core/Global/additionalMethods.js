String.prototype.parseWithArgs = function (arguments) {
	var args = [].slice.call(arguments, 0), i = 0;
	return this.replace(/%s/g, function() {
        return args[i++];
    });
}

String.prototype.nl2br = function(){
    return this.replace(/\n/g, "<br />");
}
String.prototype.replaceSpacesWithNewSymbol = function(new_symbol){
    return this.replace(/\s/g, new_symbol);
}


String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();

}

Date.prototype.getMonthName = function(){
    var month;
    switch (this.getMonth()){
        case 0:
            month = 'января';
            break;
        case 1:
            month = 'февраля';
            break;
        case 2:
            month = 'марта';
            break;
        case 3:
            month = 'апреля';
            break;
        case 4:
            month = 'мая';
            break;
        case 5:
            month = 'июня';
            break;
        case 6:
            month = 'июля';
            break;
        case 7:
            month = 'августа';
            break;
        case 8:
            month = 'сентября';
            break;
        case 9:
            month = 'октября';
            break;
        case 10:
            month = 'ноября';
            break;
        case 11:
            month = 'декабря';
            break;
    }
    return month;




}

function chooseEndingToWatches(number){
	var span;
	var kolvo = number;
    while(kolvo> 100){
        kolvo = kolvo%100;
    }
    if(kolvo % 10 == 1 && kolvo%100 !=11){
        span = 'просмотр';
    }else if(kolvo%10 > 1 && kolvo%10 <= 4){
        span = 'просмотра';
    }else if(kolvo >4 && kolvo<21){
        span = 'просмотров';
    } else if(kolvo % 10 == 1 && kolvo > 20 && kolvo < 100){
        span = 'просмотр';
    }else{
        span = 'просмотров';
    }
    return span;
}

function chooseEndingToAnswers(number){
    var span;
    var kolvo = number;
    while(kolvo> 100){
        kolvo = kolvo%100;
    }
    if(kolvo % 10 == 1 && kolvo%100 !=11){
        span = 'ответ';
    }else if(kolvo%10 > 1 && kolvo%10 <= 4){
        span = 'ответа';
    }else if(kolvo >4 && kolvo<21){
        span = 'ответов';
    } else if(kolvo % 10 == 1 && kolvo > 20 && kolvo < 100){
        span = 'ответ';
    }else{
        span = 'ответов';
    }
    return span;
}



function serializeformToObject(form){
    var serialized = form.serializeArray();
    var s = '';
    var data = {};
    for(s in serialized){
        data[serialized[s]['name']] = serialized[s]['value']
    }
    return data;
}




