$(document).ready(function() {

	window.AutoMuGlobalPage = new GlobalPage();
	window.User = new User( "#signUpForm", "#signInForm", ".signInUp", true);
	window.User.getId();

})