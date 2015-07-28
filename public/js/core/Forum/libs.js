/**
 * Created by anton on 14/06/15.
 */
function addQuestionHideAllDropDown(){
    $("#carListDropDown div").hide();
    $("#modelListDropDown div ").hide();
    $("#systemListDropDown div ").hide();
    $('body').addClass('noscrollablePage');
}

function resetAddQuestionBlockDropDowns(x){
    switch (x){
        case 3:
            $('#carListDropDown p').html("<span>▼</span>Выберите машину").siblings('div').fadeOut(0);
        case 2:
            $('#modelListDropDown p').html("<span>▼</span>Выберите модель").siblings('div').fadeOut(0);
        case 1:
            $('#systemListDropDown p').html("<span>▼</span>Выберите систему").siblings('div').fadeOut(0);
            break;
    }
}

function setAddQuestionBlockDropDown(car, model, system){
    $('#carListDropDown p').html("<span>▼</span>" + (car || "Выберите машину"));
    $('#modelListDropDown p').html("<span>▼</span>" +  (model || "Выберите модель"));
    $('#systemListDropDown p').html("<span>▼</span>" + (system || "Выберите систему"));
    getCars();
    if(car){
        getModels(car);
        var x = true;
        while(x){
            setTimeout(function(){
                if(self.checkLoadingCars){
                    var list = makeListOfSMTHForAddQuestionBlock(sessionStorage.carList.split(','));
                    $('#carListDropDown ul').html(list);
                    x=false;
                }
            }, 500);
        }
    }

    if(model){
        getSystems();
        x = true;
        while(x){
            setTimeout(function(){
                if(self.checkLoadingModels){
                    var list = makeListOfSMTHForAddQuestionBlock(sessionStorage.modelsList.split(','));
                    $('#modelListDropDown ul').html(list);
                    x=false;
                }
            }, 500);
        }
    }
    if(system){
        x = true;
        while(x){
            setTimeout(function(){
                if(self.checkLoadingSystems){
                    var list = makeListOfSMTHForAddQuestionBlock(sessionStorage.systemsList.split(','));
                    $('#systemListDropDown ul').html(list);
                    x=false;
                }
            }, 500);
        }
    }
}



