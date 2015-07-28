 HttpError = require('../../error').HttpError;
 var checkAuth = require('../../middleware/auth/checkAuth');
 var multer = require('multer');
 var User = require('../../models/User').User;
 var fs = require('fs');
 var done = true;





 module.exports = function(app){
    app.get('/service/upload_user_photo', function(req, res){ res.render('upload_file'); res.end();});
    app.post('/service/upload_user_photo', checkAuth, [ multer({ dest: __dirname + '../../../public/users photos/', limits: {
        fileSize: 1000

    },
        onFileSizeLimit: function (file) {
            console.log('Failed: ', file.originalname);

            fs.unlink(file.path) // delete the partially written file
            file.err = "size_limit";
            done = false;
        },

        onError: function(err, file){
            done = false;
            console.log(file.err);

        },
        onFileUploadComplete: function (file) {
            if(file.err){
                console.log(file.err);
            }else{
                console.log(file.fieldname + ' successfully uploaded to  ' + file.path)
            }
        }
    }), function(req, res, next){
        if(done){
            console.log(req.body) // form fields
            console.log(req.files.userPhoto.name) // form files
            User.change_photo_url(req.session.user, req.files.userPhoto.name, function(err){
                if(err) return next(new HttpError(500, "Ошибка на сервере"));
                return next();
            })

            res.send(req.files.userPhoto.name);
        }else{
            res.sendStatus(500);
            res.send("ошибка");

        }
        res.end();

    }]);


 }
