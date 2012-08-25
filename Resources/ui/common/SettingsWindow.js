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
		text: 'There are no settings to change yet.\n\n\n This application is developed at West Texas A&M University (www.wtamu.edu).\n Certain icons created by Glyphish (glyphish.com).'
	});
	self.add(label);
	return self;
};

module.exports = SettingsWindow;