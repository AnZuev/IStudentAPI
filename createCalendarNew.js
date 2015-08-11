/**
 * Created by anton on 03/08/15.
 */
/*
var Event = require('./models/Events').Event;
var User = require('./models/User').User;
var calendarNews = require('./models/calendarNews').calendarNews;



/*
for(var i = 0; i< 25; i++){
    var idArray = ["55c05ed72631f5d19fc0b0df","55c05ed72631f5d19fc0b0e2","55c05ed72631f5d19fc0b0e1", "55c05ed72631f5d19fc0b0de", "55c05ed72631f5d19fc0b0e0", "55c05ed72631f5d19fc0b0e4","55c05ed72631f5d19fc0b0e6", "55c05ed72631f5d19fc0b0e7","55c05ed72631f5d19fc0b0e5", "55c05ed72631f5d19fc0b0e3"];
    var title = 'title ' + i;
    var startTime = new Date(2005, i%12, i);
    var finishTime = new Date(2005, i%12, i+ 2);
    var invites = [];
    var userId = idArray[i%10];
    for(var y=0; y < i%10; y++){
        if(idArray[y] == userId) continue;
        invites.push(idArray[y]);
    }
    var place = 'место' + i;
    var description = 'описание ' + i;
    var type = 'На всех студентов';


    Event.addEvent(title, startTime, finishTime, '', invites,place, description, type, userId, function(err, event){
        if(err) throw err;
        else{
            console.log(event);
            return;
        }
    })
}
*/



/*
for(var x = 0; x< 10; x++){
    var firstName =  "Имя "+ x;
    var lastName = 'Фамилия ' + x;
    var groupNumber = 4300 + x;
    var faculty = "Кти";
    var year = x%6;
    var studNumber = groupNumber*100+x;
    var password = 'hotwinter';
    var user = new User({
        personal_information:{
            firstName: firstName,
            lastName: lastName,
            groupNumber:groupNumber,
            faculty: faculty,
            year: year
        },
        auth:{
            studNumber: studNumber,
            password: password
        }
    })
    user.save(function(err, user){
        if(err) throw err;
        else{
            console.log(user);
        }
    })
}
*/

/*

var userTo, userFrom;
var eventId = "55c064fb2767c214a06e92a7";

User.find({}, function(err, result){
    userTo = result[0];
    userFrom = result[1];
    var event = {
        title: "Название события",
        description:'Описание события'
    }

    var calendarNew = {

        to: userTo._id,
        from: userFrom._id,
        notification:{
            type:  "Уведомление",
            title: 'Пользоваетель ' + userFrom.personal_information.firstName +" "+ userFrom.personal_information.lastName + " приглашает Вас на событие '"+ event.title + "'",
            message: event.description,
            eventId: eventId
        }
    }
    calendarNews.addNew(calendarNew, function(err, result){
        if(err) throw err;
        else{


        }
    })
    calendarNews.getCalendarNewsForUser(userTo._id, function(err, result){
        if(err) throw err;
        else {
            for(var i = 0; i< result.length; i++){
                calendarNews.removeNew(userTo._id, result[i]._id, function(err, result){
                    if(err) throw err;
                    else{
                        console.log('deleted');
                    }

                })
            }

        }
    })


})



/*
var userIdTo = "55c05ed72631f5d19fc0b0e0";
var userIdFrom = "55c05ed72631f5d19fc0b0e3";
 */





/*
Event.findFromDateToDate(userId, startTime, finishTime, function(err, events){
    if(err) throw err;
    console.log(events);
})
*/
/*
Event.accept(userId, eventId, function(err, events){
    if(err) throw err;
    console.log(err, events);
})
*/


/*
Event.removeEvent(eventId, userId, function(err){
    if(err) throw err;
    else{
        console.log("Я закончил");
    }
})
*/
var array1 = [1,3,5,8,10,11,12];
var array2 = [1,3,5,12,15,25,34];
console.log(DiffSortArr(array2, array1));
function IntersecSortArr(A,B){
    var M = A.length, N = B.length, C = [],
        m = 1, n = 1, k = 0, a = 0, b = 0;
    for (var i = 1, t = A[0]; i < M; i++)
    {
        if (A[i] !== t)
            {
                A[m++] = A[i]; t = A[i];
            }
    }

    for ( i = 1, t = B[0]; i < N; i++)
    {
        if (B[i] !== t){
            B[n++] = B[i]; t = B[i];
        }
    }

    while (a < m && b < n)
    {
        if (A[a] < B[b]) ++a;
        else if (A[a] > B[b]) ++b;
        else C[k++] = A[a++];
    }
    return C;
}

function DiffSortArr(A,B){
    var C = IntersecSortArr(A,B),
        M = A.length,
        N = C.length;

    for (var i=0, k=0, a=0, c=0; i<M+N; i++)
    {
        if (A[a] === C[c]){
            ++a; ++c;
        }
        else{
            A[k] = A[i];
            k++; a++;
        }
    }
    A.length = k;
    return A;
}

