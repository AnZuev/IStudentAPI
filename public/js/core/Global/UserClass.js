function User (signUpArg, signInArg, signInUp, authorize) {
	var firstName;
	var lastName;
	var experience;
	var authorize = authorize;
	var signInId = $(signInArg);
	var signUpId = $(signUpArg);
	var signInUp = $(signInUp);
	var formType = 'signIn';
	var self = this;

    var _id = null;
    this.photoUrl = 'assets/me2.jpg';


	initalize();

    function checkAuth(){
        $.ajax({
            url: "/api/auth/checkAuth",
            cache: false,
            statusCode:{
                200:function(result){
                    //
                    authorize = true;
                    _id = result;
                    //emit auth event

                },
                401: function(err){
                    authorize = false;
                    logOut();
                    //произошла ошибка, пользователь не авторизован

                },
                500:function(err){
                    authorize = false;
                    //непредвиденная ошибка не сервере

                }

            }
        });
        return true;
    };

    function initalize(){
        checkAuth();
        if(authorize){

            bindLogoutClick();
        }else{
            bindEntryClick();
        }
    }

	this.entryClickListener = function(){
		window.AutoMuGlobalPage.smoothEverything();
		signInUp.removeClass('hide');
		bindEventListenersForAuthorizeForm()
		self.showSignInForm();
	};

	this.showSignInForm = function(){
		signUpId.addClass('hide');
		signInId.removeClass('hide');
        signUpId.find('input[type=password]').val('');
        $('.signInUpHeader').children('p').removeClass('choosen');
		$('.signIn').addClass('choosen');
		formType = "signIn";
        $('.authError').html('');

	};

	this.showSignUpForm = function(){
		signUpId.removeClass('hide');
		signInId.addClass('hide');
		$('.signInUpHeader').children('p').removeClass('choosen');
		$('.signUp').addClass('choosen');
        signInId.find('input[type=password]').val('');
        formType = 'signUp';
        $('.authError').html('');
	}

	this.signInUpFormsSubmit = function(){
		if(formType == "signIn"){
			signIn();
		}else if(formType == "signUp"){
			signUp();
		}else{
			//сообщение об ошибке
		}
		console.log('Обработал нажатие сабмита');
	};

	function signUp(){
		$.ajax({
	   		url: "/api/signUp",
	   		method: "POST",
	      	data: serializeformToObject(signUpId),
	      	statusCode:{
                200: function(result){
                    if(!auth(result.firstName, result.lastName, result.experience)) logOut(); // вызов глобального события авторизации
                    globalEventEmitter.emitEvent('auth');
                },
                400: function(result){
                    $('.authError').html(result.responseText);

                },
                500:function(result){

                }
	        },
	     	beforeSend: function()
	      	{	

	           
	      	}
		});
	}
	function signIn(){
		$.ajax({
	   		url: "/api/signIn",
	   		method: "POST",
	      	data: serializeformToObject(signInId),
	      	statusCode:{
	      		200: function(result){
		           if(!auth(result.firstName, result.lastName, result.experience)) logOut(); // вызов глобального события авторизации
                    window.globalEventEmitter.emitEvent('auth');
                    $('.authError').html('');
                    console.log(result);
		        },
	        	403: function(result){
                    $('.authError').html(result.responseText);
                    console.log(result);
	        	},
                404: function(result){
                    $('.authError').html("Не найден пользователь");
                }
	        },
	     	beforeSend: function()
	      	{	

	      	}
		});
	}
	function logOut(){
        $.ajax({
            url: "/api/logout",
            method: "POST",
            statusCode:{
                200: function(){
                    //
                },
                500:function(){
                    //ошибка не сервере
                }
            },
            beforeSend: function()
            {
                _id = null;
            }
        });
        bindEntryClick();
        window.globalEventEmitter.emitEvent("logOut");
	}
	function auth (name, surname, exp){
		try{
			firstName = name;
			lastName = surname;
            experience = exp;
			checkAuth();
            bindLogoutClick();
		}catch(e){
			return false;
		}

		return true;
	}
	function bindEventListenersForAuthorizeForm(){

		$('.signIn').on('click', self.showSignInForm);
		$('.signUp').on('click', self.showSignUpForm);
		$('.cross').on('click', function(){
			signInUp.addClass('hide').children('form').addClass('hide');
			window.AutoMuGlobalPage.unsmoothEverything();
			unbindEventListenersForAuthorizeForm();
		});
		$('.signUpInSubmit').on('click', self.signInUpFormsSubmit);
	}

	function unbindEventListenersForAuthorizeForm(){
		$('.signIn').off('click');
		$('.signUp').off('click');
		$('.cross').off('click');
		$('.signUpInSubmit').off('click');


	}

    function bindEntryClick(){
        $('.headerRightButton').off('click').click(function() {
            self.entryClickListener();
        });
    }

    function bindLogoutClick(){
        $('.headerRightButton').off('click').click(function() {
            logOut();
        });
    }

    this.getId = function(){
        return _id;
    }




	window.globalEventEmitter.addListener("logOut", function(){
		self.firstName = self.lastName = experience = null;
        authorize = false;
        $('.headerRightButton').html("Вход");

	});

    window.globalEventEmitter.addListener('auth', function(){
        $('.headerRightButton').html("Выход");
        $('.cross').click();

    })
	
}