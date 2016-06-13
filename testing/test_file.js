var file = require("../models/file").file;
file.find({},function(err,res) {
    console.log(res);
    
});