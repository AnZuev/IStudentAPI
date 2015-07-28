module.exports = function(req, res, next){

    res.sendDBError = function(error){
        if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
            res.status(error.status || 500);
            res.send(error.message ||"Ошибка базы данных");
        }
    };
    next();
};