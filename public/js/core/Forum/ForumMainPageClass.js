function ForumMainPage(_carListId, _modelListId, _systemListId, car,  model, system, _choosenQuestion) {

  this.car = car || null;
  this.carListId = $(_carListId);
  this.model  = model ||null;
  this.modelListId = $(_modelListId);
  this.system = car ||null;
  this.systemListId  = $(_systemListId);
  this.checkLoadingCars = false;
  this.checkLoadingModels = false;
  this.checkLoadingSystems = false;

    var choosenQuestion = _choosenQuestion || null;



  var self = this;



  this.initialize  = function(){
    globalEventEmitter.addListener("auth", authorize);
    getCars();
    bindAllEventsListeners();
    if(choosenQuestion == null){
      if(system == null){
        if(model == null){
            if(car == null){
              

            }else{
              //в поле машины забить выбранную машину
            }
        }else{
          //заполнить список для машины, для модели и для систем
        }
      }else{
        //выбрана система, показать список вопросов
      }
    }else{
      //есть объект вопроса, показать вопрос
    }
  }

  //=================================================================================

  function getCars () {
      if(sessionStorage.carList) {
          self.checkLoadingCars = true;
          return true;
      }
      sessionStorage.carList = null;
      self.checkLoadingCars = false;

      $.ajax({
        url: "/api/forum/getCars",
        beforeSend:function(){

        },
        statusCode:{
          404: function(){
            //нет такой машины
          },
          200: function(result){
            sessionStorage.carList = result;
            self.checkLoadingCars = true;
          }
        }
      });
      return true;
  }

  function getModels (car){
      var val = car || self.car;
      if(!val) return false;
      self.checkLoadingModels = false;

      $.ajax({
        url: "/api/forum/getModels",
        data: "car="+ val,
        beforeSend:function(){

        },
        statusCode:{
          404: function(){
            //нет такой машины
          },
          200: function(result){
             sessionStorage.modelsList = result;
              self.checkLoadingModels = true;
              return true;
          }
        }
      });
      return false;
  }

  function getSystems(){
      self.checkLoadingSystems = false;
      if(sessionStorage.systemsList != null) {
          self.checkLoadingSystems = true;
          return true;
      }
     $.ajax({
        url: "/api/forum/getSystems",
        beforeSend:function(){

        },
        statusCode:{
          500: function(){
            //ошибка на сервере
            console.log('Произошла ошибка при попытке получить список систем');

          },
          200: function(result){
            sessionStorage.systemsList = result;
              self.checkLoadingSystems = true;

              return true;

          },
          404: function(){
            console.log("Не найден файлик с системами, 404");
          }
        }
      });
      return false;
  }


  //=================================================================================


  function drawQuestionsList (){
      var loadingStatus = parseInt(JSON.parse(sessionStorage.checkLoadingQuestions));
      var listOfQuestions = JSON.parse(sessionStorage.listOfQuestions);
      var listOfLi = '';
      var listIds = [];
      var searchResults = $('.forumMainPageQuestionSearchResult');

      switch (loadingStatus){
          case 200:
              for(var i = 0; i<listOfQuestions.length; i++){
                  var question = new Question(listOfQuestions[i]._id, listOfQuestions[i].title, i, listOfQuestions[i].watches);
                  listOfLi = listOfLi + question.renderQuestion();
              }
              saveQuestionIds(makeListOfQuestionId(listOfQuestions));
              searchResults.html(listOfLi);
              break;
          case 204:
               //по
              var result = "<p class=\"forumMainPageQuestionSearchResultAlt\">Ничего не найдено</p>";
              console.log("получили 204");
              searchResults.html(result);
                break;
          case 500:
              //выводим алерт о том, что произошла ошибка на сервере
              break;
      }
      return true;
  }

  this.initQuestionsList = function(){
     if(self.car == '' || self.model =='' || self.system == '') {
      return false;
     }
      sessionStorage.listOfQuestions = null;
      sessionStorage.listOfQuestionsIds = [];

      $.ajax({
        url: "/api/forum/getQuestions",
        data:"system=" + self.system + "&car=" + self.car + "&model=" + self.model,
        beforeSend:function(){

        },
        statusCode:{
          500: function(){
                sessionStorage.checkLoadingQuestions = 500;
          },
          200: function(result){
                sessionStorage.listOfQuestions = result;
                sessionStorage.checkLoadingQuestions = 200;
                return true;
          },
          204: function(){
                sessionStorage.checkLoadingQuestions = 204;
                return true;
          }
        },
        complete:function(){
            drawQuestionsList();
        }
      });
      return true;
  };
  

  //=================================================================================


  function makeListOfSearchResult(list, request) {
    var listOfSearhResult = [];
    for(var y = 0; y < list.length; y++){
      if(list[y].indexOf(request) + 1){

        if(list[y] == request) {
            listOfSearhResult = 'equal';
            break;
        }
        if(listOfSearhResult.length < 6) {
          listOfSearhResult.push(list[y]);
        }else{
          break;
        }
      }
    }

    return listOfSearhResult;
  }

  function drawListOfSearchResults (listOfSearhResult) {
      if(listOfSearhResult == 'equal') return listOfSearhResult;
      var list = '';
      for(var i = 0; i < listOfSearhResult.length; i++){
        list = list + "<li>" + listOfSearhResult[i] + "</li>";
      }
      return list;
  }

   
  //=================================================================================

  function Question(id, questionTitle, key, number){
    var _questionTitle = questionTitle;
    var _key = key;
    var _number=number;
    var template = "<li key=%s><span>%s</span><p>%s</p></li>";

    this.renderQuestion = function(){
      var watсhes = _number + " " + chooseEndingToWatches(_number);
      template = template.parseWithArgs([_key, watсhes, _questionTitle]);
      return template;
    };

    this.addQuestionIDToList = function(id){
         var list = JSON.parse(sessionStorage.listOfQuestionsIds);
         list.push(id);
         sessionStorage.listOfQuestionsIds = JSON.stringify(list);
         return list.length;
    };

   

   
  }
  function saveQuestionIds (list){
        sessionStorage.listOfQuestionsIds = JSON.stringify(list);
  }
  function getQuestionIdFromList(key){
      var list = JSON.parse(sessionStorage.listOfQuestionsIds);
      return list[key];
  }
  function makeListOfQuestionId (rawList){
    var list = [];
    for(var i = 0; i<rawList.length; i++){
      list.push(rawList[i]._id);
    }
    return list;
  }
  function getQuestionIdListLength() {
     return JSON.parse(sessionStorage.listOfQuestionsIds).length;
  }


  //=================================================================================


  function QuestionPage(id){
    var questionBlock;

    initialize();


      function initialize(){
          var url = "/api/forum/getQuestion";
          if(!localStorage.questionPageTemplate){
              $.ajax({
                  url: "/api/forum/getQuestionTemplate",
                  method:"GET",
                  statusCode:{
                      200: function(result){
                          localStorage.questionPageTemplate = result;
                      },
                      404: function(){

                      },
                      500: function(){

                      }
                  }
              })
          }
          $.ajax({
                  url: url,
                  method: "GET", // id вопроса берем из сессии юзера
                  data: "qid="+id,
                  beforeSend:function(){

                  },
                  statusCode:{
                      200: function(result){
                          var body = JSON.parse(result);
                          //глобальный класс для навигации
                          renderPage(body);
                      },
                      404: function(){
                          console.log("404 - вопрос по id не нашел");
                          // такого вопроса нет
                      },
                      500: function(){
                          // непредвиденная ошибка на сервере
                      }
                  }
              });
      }

      function renderPage(body){
          var date = window.AutoMuGlobalPage.createDate(body.created);
          if(localStorage.questionPageTemplate == null){
              setTimeout(renderPage, 500, body);
          }else{
              var template = JSON.parse(localStorage.questionPageTemplate);
              var forumQuestionPage = template.mainTemplate;
              var forumQuestionPageQuestion = template.questionPageHeader.parseWithArgs([body.title, body.content,date, (body.answers.length + " " + chooseEndingToAnswers(body.answers.length)), (body.social.watches + " " + chooseEndingToWatches(body.social.watches)), body.about.car, body.about.model, body.about.system]);
              var sendAnswer = template.sendAnswer.parseWithArgs([window.User.photoUrl]);

              window.AutoMuGlobalPage.showLeftBlock();
              var answers = '';

              if(body.answers.length > 0){
                  var he;
                  var tempRight = template.answerRight;
                  var tempLeft = template.answerLeft;
                  for(var i = 0; i < body.answers.length; i++){
                      he = body.answers[i];
                      if(he.author.authorId == window.User.getId()){
                          answers = answers + tempRight.parseWithArgs([  he.author.name, he.answer, window.AutoMuGlobalPage.createDate(he.created),'', parseInt(he.likes.rating), (he.author.photoUrl || 'assets/me2.jpg')]);
                      }else{
                          answers = answers + tempLeft.parseWithArgs([ (he.author.photoUrl || 'assets/me2.jpg'), he.author.name, he.answer, window.AutoMuGlobalPage.createDate(he.created), ' ', parseInt(he.likes.rating)]);
                      }
                  }
              }
              forumQuestionPage = forumQuestionPage.parseWithArgs([forumQuestionPageQuestion, answers, sendAnswer]);
              window.AutoMuGlobalPage.hideRightBlock();
              $('.center100').hide();
              $('.centerPReqPL').append(forumQuestionPage);
              $('#forumQuestionPage').fadeIn(200);
              $('textarea[name=answer]').focus(addCtrlEnterListener).keydown(function(e){
                  window.AutoMuGlobalPage.hasCtrlAndEnterPresed(e);
              });
          }

      }

     function addAnswer(){
         var newAnswerToSend = {
             answerContent: $('textarea[name=answer]').val(),
             qid: choosenQuestion
         };
         if(newAnswerToSend.answerContent.length == 0){
             return false;
         }

          $.ajax({
              url: '/api/forum/addAnswer',
              data: newAnswerToSend,
              method: "POST",
              beforeSend: function(){
                  sessionStorage.loaded = null;
                  $('.loader').css('width', "100%").css('opacity', '0.2');
                  setTimeout(function(){
                      $('.loader').animate({opacity:0}, 400).delay(1000).css('width', "0%");
                      sessionStorage.loaded = true;
                  }, 2400)
              },
              statusCode:{
                  200:function(answer){
                        addAnswerToList(answer);

                  },
                  401: function(){
                      $('#forumMainPageQuestionSendAnswerError').html('Для добавления ответов требуется авторизация').fadeIn(200);
                  },
                  400: function(){

                  },
                  500: function(){

                  }

              }
          })
      }

      function addAnswerToList(answer){
          if(sessionStorage.loaded == "null") {
              setTimeout(addAnswerToList, 500, answer);
              return false;
          }else{
              $('textarea[name=answer]').val('');
              var tempRight = JSON.parse(localStorage.questionPageTemplate).answerRight;
              var newAnswer = tempRight.parseWithArgs([ answer.author.name, answer.answer, window.AutoMuGlobalPage.createDate(answer.created),'', parseInt(answer.likes.rating), (answer.author.photoUrl || 'assets/me2.jpg')]);
              var hr = $('.forumQuestionPageAnswers').children('hr');
              console.log(hr);
              hr.before(newAnswer);
              $('#forumMainPageQuestionSendAnswerError').html('');
              sessionStorage.loaded = null;

          }

      }
     function addCtrlEnterListener(){
         window.globalEventEmitter.addListener('ctrlEnterPressed', addAnswer)
     }
      function removeCtrlEnterListener(){
          window.globalEventEmitter.removeListener('ctrlEnterPressed', addAnswer);
      }
  }


  //=================================================================================


  function authorize(){
      //записываем то, что нам нужно поменять на странице 
      //при авторизации пользователя
    }

  //=================================================================================

  function bindAllEventsListeners(){      
    
    self.carListId.siblings('input').on('keyup', function () {
      var id;
      var listFromServer;
      var inputId;
      var carSystem  =  $("#carSystem");
      switch($(this).attr('id')){
          case "carName":
            inputId = "#carName";
            listFromServer = sessionStorage.carList.split(',');
            id = self.carListId;
              self.car = '';
              self.model = '';
              $("#carModel").val('');
              sessionStorage.removeItem('modelsList');
              self.system = '';
             carSystem.val('');
            break;
          case "carModel":
            if(self.car == null) return false;
            inputId = "#carModel";
            listFromServer = sessionStorage.modelsList.split(',');
            id = self.modelListId;
            self.system = '';
            carSystem.val('');
            break;
          case "carSystem":
            if(self.model == null) return false;
            inputId = "#carSystem";
            listFromServer = sessionStorage.systemsList.split(',');
            id = self.systemListId;
            break;
        }
      var request = $(inputId).val();
      if(request.length > 0){
        request = request.capitalizeFirstLetter(); 
        var list  = drawListOfSearchResults(makeListOfSearchResult(listFromServer, request));
        if(list == "equal") {
            id.addClass('hide');
            switch(inputId){
                case "#carName":
                    self.car = request;
                    getModels();
                    break;
                case "#carModel":
                    self.model = request;
                    getSystems();
                    break;
                case "#carSystem":
                    self.system = request;
                    break;
            }
        }
        else if(list.length == 0) {
          id.addClass('hide');
        }else{
         id.html(list).removeClass('hide');
         id.children('li').on('click', function(){
             $(inputId).val($(this).html());
             id.addClass('hide');
             switch(inputId){
                 case "#carName":
                     self.car = $(this).html();
                     getModels();
                     break;
                 case "#carModel":
                     self.model = $(this).html();
                     getSystems();
                     break;
                 case "#carSystem":
                     self.system = $(this).html();
                     break;
             }
            //self.carListId.siblings('input').off('keyup');
          })
        }
      }else{
        id.addClass('hide');
      }   
    });
    self.carListId.siblings('input').on('change', function(){

        if($(this).val() !== '') return false;
        var inputId;
        switch($(this).attr('id')){
            case "carName":
                inputId = "#carName";
                self.car = '';
                self.model = '';
                $("#carModel").val('');
                self.system = '';
                $("#carSystem").val('');
                break;
            case "carModel":
                if(self.car == null) return false;
                break;
            case "carSystem":
                if(self.model == null) return false;
                break;
        }

    });

    $(document).on('click', ".forumMainPageQuestionSearchResult li", function(){
      var key = $(this).attr('key');
      choosenQuestion = getQuestionIdFromList(key);
      var questionPage = new QuestionPage(choosenQuestion);

    })


   
  } 

  //=================================================================================


  this.initAddQuestionBlock = function(){
      var AddQuestionBlock = new AddQuestionBlockClass();
  }

  function AddQuestionBlockClass(){

     showAddNewQuestion();

     function showAddNewQuestion(){
          $('.center100').children('div').addClass('hide');
          $('.forumMainPageAddNewQuestionBlock').fadeIn(300);
          window.AutoMuGlobalPage.showLeftBlock();

         var submit =  $('.forumMainPageAddNewQusetionBlockSubmit');
         submit.children('.prevButton').click(function(){
              hideAddNewQuestion();
          });
         submit.children('.nextButton').click(function(){
              addNewQuestion();
          });
          self.addQuestionCar = self.car ;
          self.addQuestionModel = self.model ;
          self.addQuestionSystem = self.system;
         setAddQuestionBlockDropDown(self.addQuestionCar, self.addQuestionModel, self.addQuestionSystem);
         bindEEForAddQuestion();
      }

      function hideAddNewQuestion(){
          $('.forumMainPageAddNewQuestionBlock').fadeOut(0);
          $('.center100').children('div').removeClass('hide');
          unbindAllEE();
          window.AutoMuGlobalPage.hideLeftBlock();


      }

      function addNewQuestion(){
          var question = validateAddQuestionBlockForm();
          if(typeof question !== "object"){
              $('.addQuestionError').html(question);
          }else{
              console.log(question);
          }

          $.ajax({
              url: "/api/forum/addQuestion",
              method: "POST",
              data: question,
              beforeSend:function(){

              },
              statusCode:{
                  500: function(){
                      //ошибка на сервере
                      return false;
                  },
                  200: function(_id){
                      // вопрос успешно создан
                      var length = getQuestionIdListLength();
                      var li = new Question(_id, sessionStorage.questionTitle, length, 1);
                      sessionStorage.questionTitle = null;
                      li.addQuestionIDToList(_id);
                      $('.forumMainPageQuestionSearchResult').append(li.renderQuestion());
                      if(!length){
                          $('.forumMainPageQuestionSearchResultAlt ').fadeOut();
                      }
                      hideAddNewQuestion();
                      return true;
                  },
                  401: function(result){
                      //ошибка авторизации
                      console.log(result);
                      return false;
                  },
                  400: function(result){
                      console.log(result);
                      return false;
                      //плохой запрос, переданы не все корректные значения
                  }
              }
          })
      }

      function makeListOfSMTHForAddQuestionBlock(array){
          var list = '';
          for(var i = 0; i<array.length; i++){
              list = list + "<li>"+ array[i] + "</li>";
          }
          return list;
      }

      function bindEEForAddQuestion(){

          $('#carListDropDown p').click(function(){
              hideAllDropDown();
              addQuestionHideAllDropDown();
              $("#carListDropDown div").fadeIn(0);
          });

          $(document).on('click', '#carListDropDown div ul li', function(){
              var value = $(this).html();
              self.addQuestionCar = value;
              $('#carListDropDown p').html("<span>▼</span>" + value).siblings('div').fadeOut(0);
              resetAddQuestionBlockDropDowns(2);
              getModels(value);
              setTimeout(function(){
                  var list;
                  if(!self.checkLoadingModels){
                      list = "Ничего не найдено";
                  }else{
                      list = makeListOfSMTHForAddQuestionBlock(sessionStorage.modelsList.split(','));
                  }
                  $('#modelListDropDown ul').html(list);
                  $('body').removeClass('noscrollablePage');
              }, 1000);


          });

          $('#modelListDropDown p').click(function(){
              hideAllDropDown();
              $("#modelListDropDown div").fadeIn(0);
          });

          $(document).on('click', '#modelListDropDown ul li',function(){
              resetAddQuestionBlockDropDowns(1);
              var value = $(this).html();
              self.addQuestionModel = value;
              getSystems();
              setTimeout(function(){
                  var list;
                  if(self.checkLoadingSystems){
                      list = makeListOfSMTHForAddQuestionBlock(sessionStorage.systemsList.split(','));
                  }else{
                      list = 'Ничего не найдено';
                  }
                  $('#systemListDropDown ul').html(list);
              }, 1000);
              $('#modelListDropDown p').html("<span>▼</span>" + value).siblings('div').fadeOut(0);
              $('body').removeClass('noscrollablePage');
          })

          $('#systemListDropDown p').click(function(){
              hideAllDropDown();
              $("#systemListDropDown div").fadeIn(0);
          });

          $(document).on('click', '#systemListDropDown ul li', function(){
              var value = $(this).html();
              self.addQuestionSystem = value;
              $('#systemListDropDown p').html("<span>▼</span>" + value).siblings('div').fadeOut(0);
              $('body').removeClass('noscrollablePage');

          })
      }

      function validateAddQuestionBlockForm(){
          var error = '';
          var car = self.addQuestionCar;
          var model = self.addQuestionModel;
          var system = self.addQuestionSystem;
          var form = $('#forumMainPageAddNewQuestionForm');
          var question = serializeformToObject(form);
          sessionStorage.questionTitle = question.title;
          if(question.title && question.content && car && model && system){
              question.car = car;
              question.model = model;
              question.system = system;
              return question;
          }else{
              error = "Вы не заполнили все необходимые поля";
              return error;
          }


      }

      function hideAllDropDown(){
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
             var round = setInterval(function(){
                  if(self.checkLoadingCars){
                      var list = makeListOfSMTHForAddQuestionBlock(sessionStorage.carList.split(','));
                      $('#carListDropDown ul').html(list);
                      clearInterval(round);
                  }
              }, 1000);

          if(car){
              getModels(car);
          }

          if(model){
              getSystems();
              var round1 = setInterval(function(){
                  if(self.checkLoadingModels){
                      var list = makeListOfSMTHForAddQuestionBlock(sessionStorage.modelsList.split(','));
                      $('#modelListDropDown ul').html(list);
                      clearInterval(round1);
                  }
              }, 1000);

              var round2 = setInterval(function(){
                  if(self.checkLoadingSystems){
                      var list = makeListOfSMTHForAddQuestionBlock(sessionStorage.systemsList.split(','));
                      $('#systemListDropDown ul').html(list);
                      clearInterval(round2);
                  }
              }, 1000);

          }
      }

      function unbindAllEE(){
          $('#carListDropDown p').off('click');
          $('#modelListDropDown p').off('click');
          $('#systemListDropDown p').off('click');
          $('#systemListDropDown ul li').off('click');
          $('#modelListDropDown ul li').off('click');
          $('#carListDropDown ul li').off('click');
          $('.forumMainPageAddNewQusetionBlockSubmit').children('span').off('click');
      }

  }


}




