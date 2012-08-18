/*
 * A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.  
 * A starting point for tab-based application with multiple top-level windows. 
 * Requires Titanium Mobile SDK 1.8.0+.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

// This is a single context application with mutliple windows in a stack
(function() {
	Ti.include('/lib/version.js');
	Ti.API.info("app.js main(): Starting Application.");
	if (android) {
		if (tablet) {
			Ti.API.info("app.js main(): Running on an Android Tablet.");
		} else {
			Ti.API.info("app.js main(): Running on an Android Smartphone.");
		}
	} else if (iPhone) {
		Ti.API.info("app.js main(): Running on an iPhone.");
	} else if (iPad) {
		Ti.API.info("app.js main(): Running on an iPad.")
	}
	
	
	// Setup database
	var db = require('lib/database');
	db.setupDatabase();
	
	/*
	var Window;
	if (tablet) {
		Window = require('ui/tablet/ApplicationWindow');
	}
	else {
		Window = require('ui/handheld/ApplicationWindow');
	}
	*/
	
	Ti.App.addEventListener("pause", function() {
		// FIXME: Upload location data here
		Ti.API.info("app.js main(): Application Entered Background.");
	});
	
	var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	new ApplicationTabGroup().open();
	
	var authenticate = require('lib/authenticate');
	if (!authenticate.isLoggedIn()) {
		Ti.API.info("app.js main(): User is not logged in. Showing modal login window.");
		var LoginWindow = require('ui/common/LoginWindow');
		var w = new LoginWindow();
		w.open();
	}
})();
