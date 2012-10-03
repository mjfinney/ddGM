/* /////////////////////////////////////////////////////
 * Thumb Scroller module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'timeBar',
		
		defaultOptions = {
			type			: 'horizontal', // or 'vertical', or 'both', or false to not change the dimensions
			shrinkWidth		: false, // shrink or grow width (only applies to 'horizontal' or 'both')
			shrinkHeight	: false, // shrink or grow height (only applies to 'vertical' or 'both')			
			
			opacityStart	: 1, // custom opacity for the start of an animation cycle
			opacityEnd		: 1, // custom opacity for the end of an animation cycle
			
			selectors 		: '', // additional selectors to add the timer to
			toGallery		: true // add the timeBar to the main stage?
			
		},
	
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){ 
			var dd = this,
				parents = $();
				tpl = '<div class="ddGM-timeBar-wrapper"><div class="ddGM-timeBar"></div></div>';
			
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);
			
			// set values according to type
			dd.opt.modules[moduleName].cssVarsStart = {opacity: dd.opt.modules[moduleName].opacityStart};
			dd.opt.modules[moduleName].cssVarsEnd = {opacity: dd.opt.modules[moduleName].opacityEnd};
			switch (dd.opt.modules[moduleName].type) {
				case 'horizontal' :
					dd.opt.modules[moduleName].cssVarsStart['width'] = dd.opt.modules[moduleName].shrinkWidth?'100%':'0';
					dd.opt.modules[moduleName].cssVarsEnd['width'] = dd.opt.modules[moduleName].shrinkWidth?'0':'100%';
					break;
					
				case 'vertical' :
					dd.opt.modules[moduleName].cssVarsStart['height'] = dd.opt.modules[moduleName].shrinkHeight?'100%':'0';
					dd.opt.modules[moduleName].cssVarsEnd['height'] = dd.opt.modules[moduleName].shrinkHeight?'0':'100%';
					break;
					
				case 'both' :
					dd.opt.modules[moduleName].cssVarsStart['width'] = dd.opt.modules[moduleName].shrinkWidth?'100%':'0';
					dd.opt.modules[moduleName].cssVarsEnd['width'] = dd.opt.modules[moduleName].shrinkWidth?'0':'100%';
					dd.opt.modules[moduleName].cssVarsStart['height'] = dd.opt.modules[moduleName].shrinkHeight?'100%':'0';
					dd.opt.modules[moduleName].cssVarsEnd['height'] = dd.opt.modules[moduleName].shrinkHeight?'0':'100%';
					break;
				
				default:
			}
			
			// add timeBar to gallery?
			if (dd.opt.modules[moduleName].toGallery) {
				parents = parents.add(dd.gal);
			};
			
			// add timeBar to other selectors?
			if (dd.opt.modules[moduleName].selectors) {
				parents = parents.add(dd.opt.modules[moduleName].selectors);
			};
			
			// load bar
			parents.append(tpl).ready(function(){
			
				// save references and layer
				dd.obj.timeBar = parents.find('.ddGM-timeBar');
				dd.obj.timeBar.parent().css({'z-index':dd.layers.top});
				
				// register events
				dd.registerEvent('loadStart', moduleName, 'resetBar');
				dd.registerEvent('loadEnd', moduleName, 'playPauseBar');
				
				dd.registerEvent('changeStart', moduleName, 'resetBar');
				dd.registerEvent('pauseEnd', moduleName, 'playPauseBar');
				dd.registerEvent('playEnd', moduleName, 'playPauseBar');
				dd.registerEvent('changeEnd', moduleName, 'playPauseBar');

				// return control to ddGM
				dfd.resolve();
			});
			
		},
		
		// RESET THE ANIMATION BAR
		resetBar : function(dfd) { dfd.resolve();
			var dd = this;
			dd.obj.timeBar.stop(1,0).css(dd.opt.modules[moduleName].cssVarsStart);
		},
		
		// PLAY OR PAUSE THE ANIMATION BAR
		playPauseBar : function(dfd) {
			var dd = this;
			if ( dd.states.playing && !dd.states.changing ) {
				dd.obj.timeBar.stop(1,0).animate(dd.opt.modules[moduleName].cssVarsEnd, dd.states.playDelay, 'linear');
			} else {
				dd.obj.timeBar.stop(1,0);
			};
			dfd.resolve();
		},
		
		
		////////////
		// UNLOAD //
		////////////
		unload : function(dfd){
			this.obj.timeBar.remove();
			dfd.resolve();
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();