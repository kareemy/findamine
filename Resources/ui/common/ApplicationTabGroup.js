function ApplicationTabGroup() {
	//create module instance
	var self = Ti.UI.createTabGroup();
	
	// Windows
	var MapWindow = require('ui/common/MapWindow');
	var SelectHuntWindow = require('ui/common/SelectHuntWindow');
	var SettingsWindow = require('ui/common/SettingsWindow');
	
	//create app tabs
	var win1 = new SelectHuntWindow(),
		win2 = new MapWindow(self),
		win3 = new SettingsWindow();
	
	var tab1 = Ti.UI.createTab({
		title: L('hunts'),
		icon: '/images/tabhunt.png',
		window: win1
	});
	win1.containingTab = tab1;
	
	var tab2 = Ti.UI.createTab({
		title: L('map'),
		icon: '/images/tabmap.png',
		window: win2
	});
	win2.containingTab = tab2;
	
	var tab3 = Ti.UI.createTab({
		title: L('settings'),
		icon: '/images/KS_nav_views.png',
		window: win3
	});
	win3.containingTab = tab3;
	
	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);
	
	return self;
};

module.exports = ApplicationTabGroup;
