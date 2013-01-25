/**
 * @author Kareem Dana
 */

Ti.include("/lib/version.js");

function LoginWindow() {
	Ti.API.info("LoginWindow(): Creating Login Window.")
	var self = Ti.UI.createWindow({
		modal: (android) ? false : true,
		title:"find.a.mine Login",
		backgroundColor:'White',
		layout:'vertical'
	});
	
	self.addEventListener('android:back', function(){
		var alert = Ti.UI.createAlertDialog({
			title:'Login Required',
			message:'You must login in order to use find.a.mine.\n\nTo create an account, please visit http://www.findamine.mobi.',
			buttonNames:['Create Account', 'Okay'],
			cancel:1
		});
		alert.addEventListener('click',function(e){
			if(e.index == 0){
				Ti.Platform.openURL('http://www.findamine.mobi/members/register.aspx');
			}
		});
		alert.show();
	});
	
	var label_f = Titanium.UI.createLabel({
		color: '#000',
		text: 'Welcome to find.a.mine! Please visit http://www.findamine.mobi to sign up and enter your username and password below to get started.',
		top:'10dp',
		left:'10dp',
		right:'10dp',
		font:{fontSize:'17dp'},
		autoLink:Ti.UI.AUTOLINK_URLS
	});
	
	var username_tf = Titanium.UI.createTextField({
		color:'#336699',
		height:(android) ? '45dp' : 35,
		top:'15dp',
		left:'10%',
		right:'10%',
		//width:'250dp',
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_NEXT,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		clearButtonMode:Ti.UI.INPUT_BUTTONMODE_ONFOCUS,
		autocorrect: false,
		hintText: "Username"
	});
	
	username_tf.addEventListener('return',function(){
		password_tf.focus();
	});
	
	var password_tf = Titanium.UI.createTextField({
		color:'#336699',
		height:(android) ? '45dp' : 35,
		top:'15dp',
		left:'10%',
		right:'10%',
		//width:'250dp',
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_DONE,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		clearButtonMode:Ti.UI.INPUT_BUTTONMODE_ONFOCUS,
		autocorrect: false,
		hintText: "Password",
		passwordMask: true
	});
	
	var button = Ti.UI.createButton({
		height:'44dp',
		width:'200dp',
		title:"Login",
		top:'15dp'
	});
	
	password_tf.addEventListener('return',function(){
		button.fireEvent('click');
	});
	
	var actInd;
	/*if (android) {
		actInd = Titanium.UI.createActivityIndicator({
			top:'-46dp', 
			height:'44dp',
			width:'auto'
		});
	} else {*/
		actInd = Titanium.UI.createActivityIndicator({
			top:'-44dp', 
			height:'44dp',
			width:Ti.UI.SIZE,
			style: (android) ? Titanium.UI.ActivityIndicatorStyle.DARK : Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
			font: {fontFamily:'Helvetica Neue', fontSize:'15dp',fontWeight:'bold'},
			color: '#444444',
			message: ' Logging in...'
		});
	//}
	
	self.add(label_f);
	self.add(username_tf);
	self.add(password_tf);
	self.add(button);
	self.add(actInd);
	
	Ti.App.addEventListener('apiAuthenticate', function(e) {
		Ti.API.info("LoginWindow(): Got apiAuthenticate result: " + e.value);
		if (e.value == 0) {
			Ti.API.info("LoginWindow(): Login success. Firing loggedIn event.");
			Ti.App.fireEvent('loggedIn');
			actInd.hide();
			self.close();
		} else {
			if (e.value == 1) {
				Ti.API.info("LoginWindow(): Login failed.");
				alert("Invalid username or password. Please try again.");
			} else if (e.value == 2) {
				Ti.API.info("LoginWindow(): Network error. Please try again later.");
				alert("Network error. Please try again later.");
			} else {
				Ti.API.info("LoginWindow(): Unknown error. Please try again later.")
				alert("Unknown error. Please try again later.");
			}
			actInd.hide();
			button.show();
		} 
	});
	
	button.addEventListener('click', function() {
		var authenticate = require('/lib/authenticate');
		button.hide();
		actInd.show();
		//if (android) actInd.message = " Logging in...";
		authenticate.login(username_tf.value, password_tf.value);
		/*
		if (authenticate.login(username_tf.value, password_tf.value)) {
			Ti.API.info("LoginWindow(): Login success. Firing loggedIn event.");
			Ti.App.fireEvent('loggedIn');
			actInd.hide();
			self.close();
		} else {
			Ti.API.info("LoginWindow(): Login failed.");
			alert("Invalid username or password. Please try again.")
			actInd.hide();
			button.show();
		}
		*/
	});
	
	return self;
};

module.exports = LoginWindow;