/**
 * @author Kareem Dana
 */
	
//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
//yourself what you consider a tablet form factor for android
var tablet = Ti.Platform.osname === 'ipad' || 
				(Ti.Platform.osname === 'android' && (Ti.Platform.displayCaps.platformWidth > 899 || Ti.Platform.displayCaps.platformHeight > 899));
				
var android = Ti.Platform.osname === 'android';
var iPhone = Ti.Platform.osname === 'iphone';
var iPad = Ti.Platform.osname === 'ipad';
// FIXME: Remove this for production
var debug = false;