
module.exports = function(app){

    require('./authorize')(app);
    require('./forum')(app);
    require('./routes_for_working_area')(app);





}
