function GlobalPage () {
	
	this.scrollTop = function(){
		$('body,html').animate({
        	scrollTop: 0
    	}, 400);
	}

	this.hasEnterPressed = function(){
		if(e.keyCode == 13){
        	return true;
    	}
    	return false;
	}

	this.hasCtrlAndEnterPresed = function(e){

		if(e.keyCode == 17){
	        window.ctrl = true;
	   	}
	   	else if(e.keyCode == 13 && ctrl){
	        window.globalEventEmitter.emitEvent('ctrlEnterPressed');
	    }
	    else{
	        window.ctrl = false;
	    }
	    return false;
	}

	this.folderHeader = function(){
		window.onscroll = function() {
	        var scrolled = window.pageYOffset || document.documentElement.scrollTop;

	        if(scrolled > 30){
	            $('.header_top_menu').fadeOut(0);
	            $('.header_top_foldered').fadeIn(0);
	            $('.left_page_button').css('top', 30);
	            $('.left_top_corner_canvas').css('top', 30);
	        }else{
	            $('.header_top_menu').fadeIn(0);
	            $('.header_top_foldered').fadeOut(0);
	            $('.left_page_button').css('top', 50);
	            $('.left_top_corner_canvas').css('top', 50);
	        }
    	}
	}

	this.smoothEverything = function(){
		$('.smoothEverything').fadeIn(400);
		$('body').addClass('noscrollablePage')
	}
	this.unsmoothEverything = function(){
		$('.smoothEverything').fadeOut(100);
		$('body').removeClass('noscrollablePage')

	}
    this.hideRightBlock = function(){
        $('.right').addClass("hide");
        $('.centerAndRightContentBlock').addClass('centerPReqPL').removeClass("centerAndRightContentBlock");
    }
	this.showRightBlock = function(){
        $('.right').removeClass("hide");
        $('.centerPReqPL').addClass('centerAndRightContentBlock').removeClass("centerPReqPL");
    }

    this.showLeftBlock = function(){
        $('.left').fadeIn(50).click(function(){

        });


    }

    this.hideLeftBlock = function(){
        $('.left').fadeOut(50);
    }

    this.createDate = function(date){
        var h = new Date(date);
        return h.getDate() + " " + h.getMonthName()+ " " + h.getFullYear();
    }

	

}
