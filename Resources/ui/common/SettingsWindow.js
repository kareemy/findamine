/**
 * @author Kareem Dana
 */

function SettingsWindow(title) {
	var self = Ti.UI.createWindow({
		title:"Settings",
		backgroundColor:'white'
	});
	
	var label = Ti.UI.createLabel({
		top: 0,
		width:'320dp',
		height:'auto',
		text: 'There are no settings to change yet.'
	});
	self.add(label);
	return self;
};

module.exports = SettingsWindow;