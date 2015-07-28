function ForumQuestionPage () {
	var questionId = '';
    var answersListLength = 0;


    /*
    сеттер для questionsId
	*/

    this.setQuestionId = function(id){
		if( id.length < 24){
			throw new Error("id у вопроса не может быть таким коротким");

		}else if(id.length > 24){
			throw new Error("id у вопроса не может быть таким коротким");
		}else{
			questionId = id;
		}
	}

    /*
    метод, инициирующая запрос на получения данных с сервера, создание и отображение страницы вопроса и ответов
    */
	this.initialize  = function(questionId, ForumMainPage){
        var url = "форум/%s/%s/%s/%s/%s".parseWithArgs(ForumMainPage.car, ForumMainPage.model, ForumMainPage.carPart, ForumMainPage.system, questionId);
		$.ajax({
            url: url,
            method: "GET", // id вопроса берем из сессии юзера
            statusCode:{
                200: function(result){
                    var body = JSON.parse(result);
                    //глобальный класс для навигации
                    loadPage(body);

                },
                204: function(){
                    // такого вопроса нет
                },
                500: function(){
                    // непредвиденная ошибка на сервере
                }
            }
        });
	}	

    /*
    вспомогательные метод для метода initialize(), реализующая непосредственно отображение данных на странице
    */
	function loadPage(questionObject, UserObject){

        /*
        отрисовываем стандартные блоки
        отрисовываем непосредственно вопрос
        */

		var sendAnswerBlock = "<li class='send_answer' id='no_border'><textarea placeholder='Ответ...'></textarea><p class='send_button' >Отправить</p>"+
        "<p class='attach_photo'>Прикрепить</p></li>";
    	var questionName = "<div class='question_name'>" + questionObject.question_title + "<p class='question_watched'>Просмотров: " + content_from_server.social.watched_by +"</p></div>";

    	var leftColumn = "<li><table><tr><td class='first_column_in_answer_template' valign='top'>"+
        "<img src='/assets/no_photo.png'>"+
        "<p class='user_name'>%s</p><p class='experience'>%s</p></td>";
    	var userName = questionObject.about_author.author_name;
    	var userExperience = questionObject.about_author.author_experience;
    	var questionContent = questionObject.question_content;
    	var rightColumn = "<td class='second_column_in_answer_template'>"+
        "<p class='answer min_height_for_answer' style='margin-bottom:20px'>%s"+
        "</p></td></tr></table></li>";
    	var answersList = leftColumn.parseWithArgs(userName, userExperience) + rightColumn.parseWithArgs(questionContent);

        // если пользователь неавторизован - блокируем поле для отправки ответа

    	var userId = UserObject.Id;
    	if(userId == null){
        	sendAnswerBlock = "<li class='send_answer' id='no_border'>"+
            "<textarea placeholder='Авторизируйтесь, чтобы ответить:)' disabled></textarea>"+
            "<p class='send_button' >Отправить</p>"+
            "<p class='attach_photo'>Прикрепить</p>"+
            "</li>";
    	};
    	answersListLength = questionObject.answers.length;

        /* 
        рендерим все ответы
        если ответ помечен как спам - он не отображается
        если сказано спасибо - делаем пометку об этом
        */

    	for(var i = 0; i < answersListLength; i++){

	        userName = questionObject.answers[i].about_author.author_name;
    	    userExperience =  questionObject.answers[i].about_author.author_experience;
        	answer = questionObject.answers[i].answer;

        	var thank = "<span id='make_an_answer'>Спасибо!</span><span class='helpful_counter'>%s</span>";
        	var spam = "<span id='make_spam'>&times</span>";
        	var show = true;

        	if(userId){
            	for(var y = 0; y < questionObject.answers[i].about_spam.sender_id.length; y++){
	                if(userId == questionObject.answers[i].about_spam.sender_id[y]){
	                    show = false
	                }
            	}
                if(!show){
                    continue;
                }
                for(var y=0; y < questionObject.answers[i].about_helpful.sender_id.length; y++){
                    if(user_id == questionObject.answers[i].about_author.author_id){
                        spam_block = "";
                    }
                    if(userId == questionObject.answers[i].about_helpful.sender_id[y]){
                        thank = "<span class='made_answer'>Спасибо!</span><span class='helpful_counter'>%s</span>";
                        break;
                    }
                }
            }

            var thank = thank.parseWithArgs(questionObject.answers[i].about_helpful.sender_id.length );

            rightColumn = "<td class='second_column_in_answer_template'>"+
            "<p class='answer min_height_for_answer' style='margin-bottom:0px'>%s"+
            "</p>"+
            "<p class='answer' >%s"+
            "<span class='display_none'>%s</span>"+
            "</p>"+
            "</td>"+
            "</tr></table></li>";
            var listItem = leftColumn.parseWithArgs(spam_block, user_name, experience) + rightColumn.parseWithArgs( answer.nl2br(), make_answer, i );
            answersList = answersList + listItem;
        }


        /*
        собираем все в одну кучу и помещаем на страницу
        */
    	var list = "<ul>" + answersList + sendAnswerBlock + "</ul>";
    	var mainBlockContent = "<div class='main_block_answer' style=\"display:none\">" + questionName + list + "</div>";
    	$('.main_block').hide();
    	$('.filter_lists_to_search_block').hide();
    	$(mainBlockContent).appendTo(".all_content").fadeIn(500);
    	//скролл наверх глобально
    	// делаем хедер сжатым - глобально
	}

    /*
    метод для отметки "Спасибо"
    */
    this.thank = function(self){
        $.ajax({
            url:"форум/service/thank",
            method: "POST",
            data: {
                "answer_id": parseInt($(self).siblings('.display_none').html())
            },
            statusCode: {
                200: function(){
                    $(self).addClass("made_answer").removeAttr("id");
                    $(self).siblings('.helpful_counter').html(parseInt($(type_this).siblings('.helpful_counter').html()) + 1);
                    $(self).parent('p').parent('td').parent('tr').parent('tbody').parent('table').siblings("span").remove();
                },
                500: function(){
                    //ошибка на сервере
                }

            }
        });
    }
    
    /*
    метод для отметки "Спам"
    */
    this.spam = function(self){
        var answer_id = parseInt($(self).siblings('table').children('tbody').children('tr').children('.second_column_in_answer_template').children('p:odd').children('.display_none').html());
        $.ajax({
            url:"форум/service/spam",
            method: "POST",
            data:{
                "answer_id": answer_id
            },
            statusCode:{
                200:function(){
                    $(self).parent('li').addClass('deleted_message').html('<p>Спасибо за бдительность! <br> Благодаря Вам мы становимся лучше:)</p>').delay(2000).fadeOut(1000);
                },
                500: function(){
                    // ошибка на сервере
                }
            }
        });
    }

    /*
    метод для добавление нового вопроса
    */
    this.addAnswer = function(UserObject){
        var answer = $(".send_answer textarea").val();
        $.ajax({
            url:"форум/service/add_answer",
            method: "POST",
            data: {
                "answer": answer
            },
            statusCode: {
                200: function(){
                    showNewAnswer(UserObject)
                    $(".send_answer textarea").val('');
                },
                401: function(){
                    //пользователь не авторизован, ответ не был добавлен
                },
                500: function(){
                    //ошибка на сервере при добавлении ответа
                }


            }
        });
    }

    /*
    вспомогательный метод для метода addAnswer(UserObject). Нужен для вывода на страницу только что добавленного ответа
    */
    function showNewAnswer(userObject){
        var leftColumn = "<li><table><tr><td class='first_column_in_answer_template' valign='top'>"+
        "<img src='/assets/no_photo.png'>"+
        "<p class='user_name'>%s</p>"
        +"<p class='experience'>%s</p>"
        +"</td>";
        var userName = userObject.firstName+ " " + userObject.lastName;
        var experience = userObject.experience;
        var answer = $('.send_answer textarea').val();
        var rightColumn = "<td class='second_column_in_answer_template'>"+
        "<p class='answer min_height_for_answer' style='margin-bottom:0px'>%s"+
        "</p>"+
        "<p class='answer' >"+
        "<span id='make_an_answer'>Спасибо!</span><span class='helpful_counter'>0</span><span class='display_none'>%s</span>"+
        "</td>"+
        "</tr></table></li>";
        var listItem = leftColumn.parseWithArgs(userName, experience) + rightColumn.parseWithArgs(answer.nl2br(), answersListLength++); //может быть так, что id ответа будет на 1 больше, проверить
        $('#no_border').before(listItem);
    }


}