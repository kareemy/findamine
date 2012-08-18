/**
 * @author Kareem Dana
 */

var db = require('/lib/database');

exports.isLoggedIn = function() {
	var loggedIn = false;
	if (Ti.App.Properties.hasProperty("loggedIn")) {
		loggedIn = Ti.App.Properties.getBool("loggedIn");
	}
	
	return loggedIn;
}

exports.login = function(username, password) {
	Ti.API.info("login: Attempting to login " + username + " with password '" + password + "'");
	if (exports.isLoggedIn()) {
		Ti.API.info("login(): Already logged in.");
		return true;
	}
	
	//FIXME: Perform API call here
	var loggedIn = true;
	if (!loggedIn) {
		Ti.API.info("login(): login failed.")
		return false;
	}
	
	var start = new Date().getTime();
	while ((new Date().getTime() - start) < 2000) {
		
	}
	
	Ti.API.info("login(): login success.");
	Ti.App.Properties.setString("username", username);
	Ti.App.Properties.setString("password", password);
	Ti.App.Properties.setBool("loggedIn", true);
	return true;
};

exports.logout = function() {
	if (!exports.isLoggedIn()) {
		return true;
	}

	Ti.App.Properties.setBool("loggedIn", false);
	Ti.App.Properties.removeProperty("username");
	Ti.App.Properties.removeProperty("password");
	return true;
}

exports.getUserName = function() {
	if (!exports.isLoggedIn()) {
		return '';
	}
	
	if (Ti.App.Properties.hasProperty("username")) {
		return Ti.App.Properties.getString("username");
	}

	return '';
}

exports.getPassword = function() {
	if (!exports.isLoggedIn()) {
		return '';
	}
	
	if (Ti.App.Properties.hasProperty("password")) {
		return Ti.App.Properties.getString("password");
	}

	return '';
}
