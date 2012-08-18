/**
 * @author Kareem Dana
 */

Ti.include("/lib/version.js");

function LoginWindow() {
	Ti.API.info("LoginWindow(): Creating Login Window.")
	var self = Ti.UI.createWindow({
		modal: true,
		title:"Find-a-mine Login",
		backgroundColor:'White'
	});
	
	var label_f = Titanium.UI.createLabel({
		color: '#000',
		text: 'Welcome to Find-a-mine! Please visit http://www.findamine.mobi to sign up and enter your username and password below to get started.',
		top:'10dp',
		left:'10dp',
		width:'auto'
	});
	
	var username_tf = Titanium.UI.createTextField({
		color:'#336699',
		height:'35dp',
		top:'110dp',
		left:'10dp',
		width:'250dp',
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		autocorrect: false,
		hintText: "Username"
	});
	
	var password_tf = Titanium.UI.createTextField({
		color:'#336699',
		height:'35dp',
		top:'155dp',
		left:'10dp',
		width:'250dp',
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		autocorrect: false,
		hintText: "Password",
		passwordMask: true
	});
	
	var button = Ti.UI.createButton({
		height:'44dp',
		width:'200dp',
		title:"Login",
		top:'210dp'
	});
	
	var actInd;
	if (android) {
		actInd = Titanium.UI.createActivityIndicator({
			bottom:10, 
			height:50,
			width:150
		});
	} else {
		actInd = Titanium.UI.createActivityIndicator({
			top:'210dp', 
			height:'50dp',
			height:'50dp',
			width:'auto',
			style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
			font: {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
			color: 'black',
			message: 'Logging in...'
		});
	}
	
	self.add(label_f);
	self.add(username_tf);
	self.add(password_tf);
	self.add(button);
	self.add(actInd);
	
	button.addEventListener('click', function() {
		var authenticate = require('/lib/authenticate');
		button.hide();
		actInd.show();
		if (android) actInd.message = "Logging in...";

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
	});
	
	return self;
};

module.exports = LoginWindow;