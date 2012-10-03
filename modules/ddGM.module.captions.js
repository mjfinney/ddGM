/* /////////////////////////////////////////////////////
 * Captions module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'captions',
	
		defaultOptions = {
			fadeSpeed : undefined, // change fade in/out simultaneously
			fadeOutSpeed : 375, // speed of the fade out when changing captions
			fadeInSpeed : 750, // speed of the fade in when changing captions
			
			internal : true, // use the built in caption? turn off for external captions
			toControl : true, // add to the main control or to the gallery?
			selectors : '', // additional css selectors to add the caption to
			
			hide : true, // does the internal caption auto-hide?
			hideDelay : 2000, // delay before sliding out
			
			slideSpeed : undefined, // change slide in/out simultaneously
			slideOutSpeed : 375, // speed of the slide out when showing captions
			slideInSpeed : 750, // speed of the slide in when showing captions
			
			showOnChange : true, // re-show the captions when the item changes?
			showOnHover : true // show the captions when the mouse is over the gallery?
			
		},
		
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			var dd = this,
				tplW = '',
				tplC = '',
				internalParent = $(),
				externalParents = $(),
				parents = $();
			
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);
			
			// fade sanity check
			dd.opt.modules[moduleName].fadeInSpeed = (dd.opt.modules[moduleName].fadeSpeed == undefined) ? dd.opt.modules[moduleName].fadeInSpeed : dd.opt.modules[moduleName].fadeSpeed;
			dd.opt.modules[moduleName].fadeOutSpeed = (dd.opt.modules[moduleName].fadeSpeed == undefined) ? dd.opt.modules[moduleName].fadeOutSpeed : dd.opt.modules[moduleName].fadeSpeed;
			
			// slide sanity check
			dd.opt.modules[moduleName].slideInSpeed = (dd.opt.modules[moduleName].slideSpeed == undefined) ? dd.opt.modules[moduleName].slideInSpeed : dd.opt.modules[moduleName].slideSpeed;
			dd.opt.modules[moduleName].slideOutSpeed = (dd.opt.modules[moduleName].slideSpeed == undefined) ? dd.opt.modules[moduleName].slideOutSpeed : dd.opt.modules[moduleName].slideSpeed;
			
			// template: wrapper
			tplW = '<div class="ddGM-caption-wrapper" style="overflow:hidden" />';
			
			// template: caption
			tplC = '<span class="ddGM-caption">&nbsp;</span>';
			
			// select where to add the wrapper
			if (dd.opt.modules[moduleName].internal) {
				internalParent = (dd.opt.modules[moduleName].toControl)
					? internalParent.add(dd.obj.control)
					: internalParent.add(dd.gal);
			};
			
			// add to other elements?
			if ( dd.opt.modules[moduleName].selectors ) {
				externalParents = externalParents.add(dd.opt.modules[moduleName].selectors);
			};
			
			// combine sources
			parents = parents.add(internalParent).add(externalParents);
			
			// add wrappers to selected parents
			parents.append(tplW).ready(function(){
				
				// store reference to all caption wrappers
				dd.obj.capWrapAll = parents.find('.ddGM-caption-wrapper');
				
				// store reference to internal caption wrappers and css settings
				dd.obj.capWrapInternal = $();
				if ( dd.opt.modules[moduleName].internal ) {
					dd.obj.capWrapInternal = dd.gal.find('.ddGM-caption-wrapper');
					dd.obj.capWrapInternal.css({
						zIndex: dd.layers.indicators,
						position: (dd.opt.modules[moduleName].toControl?'':'position:absolute;'),
						width: '100%',
						height: 0
					});
				};
				
				// store reference to external caption wrappers
				dd.obj.capWrapExternal = $();
				if ( dd.opt.modules[moduleName].selectors ) {
					dd.obj.capWrapExternal = parents.not(dd.obj.control).not(dd.gal).find('.ddGM-caption-wrapper');
				};
				
				// add caption to selected parent(s);
				dd.obj.capWrapAll.html(tplC).ready(function(){
				
					// reference to captions
					dd.obj.capAll = dd.obj.capWrapAll.find('.ddGM-caption');
					dd.obj.capInternal = dd.obj.capWrapInternal.find('.ddGM-caption');
					dd.obj.capExternal = dd.obj.capWrapExternal.find('.ddGM-caption');
					
					// ----------
					//   EVENTS
					// ----------
					
					// change caption on item change
					dd.registerEvent('changeStart', moduleName, 'changeCap');
					dd.registerEvent('midAnim', moduleName, 'showCap');
					
					// show first caption
					dd.registerEvent('loadEnd', moduleName, 'changeCap');
					
					// functions only for internal captions
					if ( dd.opt.modules[moduleName].internal ) {
						
						// does the caption slide out?
						if ( dd.opt.modules[moduleName].hide ) {
						
							dd.registerEvent('changeEnd', moduleName, 'startTimer');
						
							// show on change?
							if ( dd.opt.modules[moduleName].showOnHover ) {
								dd.registerEvent('changeStart', moduleName, 'showCap');
							};
							
							// show on hover?
							if ( dd.opt.modules[moduleName].showOnHover ) {
								dd.registerEvent('mouseIn', moduleName, 'showCap');
								dd.registerEvent('touchEndUp', moduleName, 'hideCap');
								dd.registerEvent('mouseOut', moduleName, 'startTimer');
							};
						
						// no slideout: show caption
						} else {
							dd.registerEvent('loadEnd', moduleName, 'showCap');
							dd.registerEvent('changeStart', moduleName, 'showCap');
						};
						
						// initialize states variable
						dd.states.capHidden = true;
						dd.states.capHeight = 0;

					};
					
					// unload
					dd.registerEvent('unload', moduleName, 'unload');
					
					// return control to ddGM
					if (dfd!=null) { dfd.resolve(); };
					
				});

			});
		},
		
		////////////////////
		// CHANGE CAPTION //
		////////////////////
		changeCap : function(dfd) {
			var dd = this,
				prev = dd.obj.capAll.html(),
				cap = dd.items[dd.states.clicked!=''?dd.states.clicked:dd.states.current].caption;
				
			// sanity check on caption
			switch (cap) {
				case undefined :
				case '' :
				case ' ' :
					cap = '&nbsp;';
			};
			
			// stop animation
			dd.obj.capAll.stop(1,1).css({'opacity':0}).html(cap);
			
			// get new height
			dd.states.capHeight = dd.obj.capInternal.outerHeight();
			
			// fade out previous caption
			dd.obj.capAll.html(prev).css({'opacity':1}).animate({'opacity':0}, dd.opt.modules[moduleName].fadeOutSpeed, function(){
				// replace content and animate in new caption
				$(this).html(cap).animate({'opacity':1}, dd.opt.modules[moduleName].fadeInSpeed);
			});
				
			// return
			if ( dfd!=null ) { dfd.resolve(); };
				
		},
		
		//////////////////
		// HIDE CAPTION //
		//////////////////
		hideCap : function(dfd) {
			var dd = this;
			
			// reset timer
			clearTimeout(dd.timers.capTimer);

			// slide out
			dd.obj.capWrapInternal.stop(1,0).animate({'height':0}, dd.opt.modules[moduleName].slideOutSpeed);
			
			// set state variable
			dd.states.capHidden = true;
			
			// resolve
			if (dfd!=null) { dfd.resolve(); };
		},
		
		//////////////////
		// SHOW CAPTION //
		//////////////////
		showCap : function(dfd) {
			var dd = this,
				hide=false,
				id = (dd.states.clicked!='') ? dd.states.clicked : dd.states.current,
				cap = dd.items[id].caption;
			
			// clear slideout timer
			clearTimeout(dd.timers.capTimer);
			
			// check for empty caption
			switch (cap) {
				case undefined :
				case null :
				case '' :
				case ' ' :
				case '&nbsp;' :
					hide=true;
			};
			
			// hide empty captions
			if ( hide ) {
				window.ddGM.modules[moduleName].hideCap.call(dd, null);
				return;
			};
			
			// slide in
			dd.obj.capWrapInternal.stop(1,0).animate({'height':dd.states.capHeight}, dd.opt.modules[moduleName].slideInSpeed);			
			
			// set state variables
			dd.states.capHidden = false;
			
			// resolve
			if (dfd!=null) { dfd.resolve(); };
			
		},
		
		/////////////////
		// START TIMER //
		/////////////////
		startTimer : function(dfd) {
			var dd = this;
			
			// start the timer?
			if ( dd.opt.modules[moduleName].hide && (!dd.states.hover || !dd.opt.modules[moduleName].showOnHover) ) {
				
				// clear old timer
				clearTimeout(dd.timers.capTimer);
				
				// set new timer
				dd.timers.capTimer = setTimeout(function(){
					window.ddGM.modules[moduleName].hideCap.call(dd, null);
				}, dd.opt.modules[moduleName].hideDelay);
			};
			
			// resolve
			if (dfd!=null) { dfd.resolve(); };
		},
		
		////////////
		// UNLOAD //
		////////////
		unload : function(dfd) {
			var dd = this;
			
			// clear timer
			clearTimeout(dd.timers.capTimer);
			
			// unset captions (remove from externals)
			dd.obj.capWrapAll.remove();
			
			// return
			if (dfd!=null) { dfd.resolve(); };
			
		}
			
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();