/**
 * Created by anton on 03/08/15.
 */

var Event = require('./models/Events').Event;

for(var i = 0; i< 25; i++){
    var title = 'title ' + i;
    var startTime = new Date(2005, i%12, i);
    var finishTime = new Date(2005, i%12, i+ 2);
    var id = ObjectId("55b7ef65ffed0ce674d4a51c");
    var place = 'место' + i;
    var description = 'описание ' + i;
    var type = 'На всех студентов';
    var userId = 'kmk';

    Event.addEvent(title, startTime, finishTime, '', id,place, description, type, userId, function(err, event){
        if(err) throw err;
        else{
            console.log(event);
            return;
        }
    })
}
