var universityFile = require('./university');
function userAboutType(){
    var self = this;
    this.university = 0;
    this.getUniversityName = function(code){
        return universityFile[code].title;
    };
    this.getFacultyName = function(universityCode, facultyCode){
        return universityFile[universityCode].faculty[facultyCode].title
    };

    this.getGroups = function(university, faculty){
        return universityFile[university].faculty[faculty].groups;
    };

    this.getFaculties = function(university){
        var res = [];
        universityFile[self.university].faculty.forEach(function(element){
            res.push(element.title)
        });
        return res;
    };

}
var universityInfoLoader = new userAboutType();
exports.universityInfoLoader = universityInfoLoader;