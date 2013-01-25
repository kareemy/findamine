/**
 * @author Kareem Dana
 */

function SettingsWindow(title) {
	var self = Ti.UI.createWindow({
		title:"Settings",
		backgroundColor:'white'
	});
	
	var label = Ti.UI.createLabel({
		top: '10dp',
		left: '10dp',
		right:'10dp',
		text: 'There are no settings to change yet.',
		font:{fontSize:'17dp'},
		textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER,
		color:'black'
	});
	self.add(label);
	return self;
};

module.exports = SettingsWindow;