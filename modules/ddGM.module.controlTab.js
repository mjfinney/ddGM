/* /////////////////////////////////////////////////////
 * Control Tab module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'controlTab',
		
		defaultOptions = {
			startPinned : false,
			speed : 250,
			center : true
		},
	
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			var dd = this,
				
				// template
				tplW = '<div class="ddGM-control-wrap" />',
				tplT = '<a class="ddGM-control-tab" />';
				
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);
			
			// add tpl to control
			dd.obj.control.wrap(tplW).ready(function(){
			
				// register & layer object
				dd.obj.controlWrap = dd.obj.control.parent('.ddGM-control-wrap');
				dd.obj.controlWrap.css({'z-index':dd.layers.controls});
					
				// add tpl to control
				dd.obj.controlWrap.append(tplT).ready(function(){

					// register & layer object
					dd.obj.controlTab = dd.obj.controlWrap.children('.ddGM-control-tab').css({'z-index':dd.layers.top});
					
					// save loaded state
					dd.states.controlTab = true;
					
					// set css on controller 
					dd.obj.control.css({'position':'relative'});
					
					// initial state
					if ( dd.opt.modules[moduleName].startPinned ) {
						dd.states.controlPins = {'user':true};
						dd.states.controlPinned = true;
						dd.registerEvent('loadStart', moduleName, 'pinOnLoad');
					} else {
						dd.states.controlPins = {'user':false};
						dd.states.controlPinned = false;
					};
					
					// auto-center tab?
					if ( dd.opt.modules[moduleName].center ) {
						dd.registerEvent('loadStart', moduleName, 'center');
						dd.registerEvent('resize', moduleName, 'center');
					};					
					
					///////////
					// CLICK //
					///////////
					dd.obj.controlTab.on('click', function(){
						if ( dd.states.controlPinned ) {
							window.ddGM.modules[moduleName].unpin.call(dd, 'user');
						} else {
							window.ddGM.modules[moduleName].pin.call(dd, 'user');
						};													
					});
					
					// return					
					dfd.resolve();
				});
			});
				
		},
		
		//////////////////
		// START PINNED //
		//////////////////
		pinOnLoad : function(dfd) {
			window.ddGM.modules[moduleName].pin.call(this, 'user');
			dfd.resolve();
		},
		
		/////////////
		// PINNING //
		/////////////
		
		// PIN
		pin : function(toggle){
			var dd = this;
			
			// save reference
			dd.states.controlPins[toggle] = true;
			dd.states.controlPinned = true;
			
			// slide out
			dd.obj.control.animate({'height':0}, dd.opt.modules[moduleName].speed).addClass('pinned');
			
		},
		
		// UNPIN
		unpin : function(toggle){
			var dd = this,
				unpin = true,
				sH, eH;
				
			// user overrides all
			if (toggle == 'user') {
				dd.states.controlPins = {'user':false};
			
			// other pins only clear themselves
			} else {
				$.each(dd.states.controlPins, function(i,v){
					if (i==toggle) {
						dd.states.controlPins[i] = false;
					} else if (v) {
						unpin = false;
					};
				});
			};
			
			// slide in?
			if ( unpin ) {
				dd.states.controlPinned = false;
				sH = dd.obj.control.stop(1,0).height();
				eH = dd.obj.control.css({'opacity':0,'height':''}).height();
				dd.obj.control.css({'opacity':1,'height':sH}).animate({'height':eH}, dd.opt.modules[moduleName].speed, function(){
					$(this).css({'height':''}).removeClass('pinned');
				});
			};			
		},
		
		////////////
		// RESIZE //
		////////////
		center : function(dfd) {
			var dd = this,
				cW = dd.obj.controlWrap.width(),
				tW = dd.obj.controlTab.outerWidth();
			dd.obj.controlTab.css({'left':Math.round( (cW/2) - (tW/2) )});
			if ( dfd!=null) { dfd.resolve(); }
		}		
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();