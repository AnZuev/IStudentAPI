/**
 * Created by anton on 04/11/15.
 */
function cache(title, maxSize){
    var shell = {};
    var size = 0;
    cleanCache();
    this.getField = function(userId){
        var imId = shell[userId];
        remove(userId);
        size--;
        return imId;
    };
    this.setField = function(userId, dialogs){
        if(size>maxSize){

        }
        shell[userId] = dialogs;
        size++;
    };
    function remove(userId){
        delete shell[userId];
    }
    function cleanCache(){
        shell = {};
        size = 0;
        setTimeout(cleanCache, 1000*60*60*24);
    }
}
exports.imCache = new cache("im", 200);