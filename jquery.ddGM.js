////////////////////////////////////////////////////////////////////////////////////
/*
 * Darren Doyle's Gallery M (ddGM) :: v1.0 :: 2012-10-02
 * http://inventurous.net/ddgallery
 *
 * Copyright (c) 2012, Darren Doyle
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */
////////////////////////////////////////////////////////////////////////////////////

(function( $ ) {
	
	// create global container for anims, modules, & types
	// (prevents multi-loading of modules), and states
	// variable to hold any global variables
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.anims ) { $.extend(window.ddGM, {anims:{}}); };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	if ( !window.ddGM.types ) { $.extend(window.ddGM, {types:{}}); };
	if ( !window.ddGM.states ) { $.extend(window.ddGM, {states:{}}); };
	
	// universal templates
	if ( !window.ddGM.tpl ) { $.extend(window.ddGM, {tpl:{stage:'',item:{}}}); };
	
	// stage template
	window.ddGM.tpl.stage+= '<div class="ddGM-stage-wrapper" style="width:100%; height:100%; position:relative; overflow:hidden;">';
	window.ddGM.tpl.stage+= 	'<div class="ddGM-stage" style="width:100%; height:100%;" />';
	window.ddGM.tpl.stage+= '</div>';
	window.ddGM.tpl.stage+= '<div class="ddGM-control" style="position:absolute;" />';
	
	// item template
	window.ddGM.tpl.item = {	
		id 			: '',
		type 		: '',
		title 		: '',
		caption 	: '',
		thumb 		: '',
		content 	: '',
		extended 	: '',
		resizable	: false
	};

////////////////////////////////////////////////////////////////////////////////////
	
	///////////////////////////
	// INITIALIZATION OBJECT //
	///////////////////////////
	$.ddGM = function(element, options){
		var dd = this, z;
		
		// create unique ID for this gallery
		dd.id = 'ddGMID' + (Math.floor(Math.random()*10000));
		
		// pull in default and user options
		dd.opt = $.extend({}, $.ddGM.defaultOptions, options);
		
		// initialize
		dd.gal = $(element);
		
		// object container
		dd.obj = {};
		
		// add events
		dd.events = {
			loadStart		: {},
			loadEnd			: {},
			mouseIn			: {},
			mouseOut		: {},
			touchStartUp	: {},
			touchStartDown	: {},
			touchEndUp		: {},
			touchEndDown	: {},
			changeStart		: {},
			itemLoadStart	: {},
			itemLoadEnd		: {},
			preAnim			: {},
			midAnim			: {},
			postAnim		: {},
			changeEnd		: {},
			resize			: {},
			userPlayStart	: {},
			userPlayEnd		: {},
			userPauseStart	: {},
			userPauseEnd	: {},
			playStart		: {},
			playEnd			: {},
			pauseStart		: {},
			pauseEnd		: {},
			unload			: {}
		};
		
		// create predefined layers
		z = (dd.gal.css('z-index') == 'auto') ? 0 : parseInt(dd.gal.css('z-index'),10);
		dd.layers = {
			bottom		: z,
			stage		: z+1,
			stageBottom	: z+2,
			stageTop	: z+3,
			indicators	: z+4,
			controls	: z+5,
			top			: z+6
		};
		
		// prepare item list
		dd.items = {};
		dd.itemList = [];
		
		// prepare source object
		dd.source = {
			html: {},
			list: {}
		};
		
		// initialize state variables
		dd.states = {
			hover			: false,
			linkCapture		: false,
			changing		: false,
			playing			: false,
			paused			: { user : true },
			navSource		: '',
			current			: '',
			clicked			: '',
			count			: 0,
			firstItem		: true,
			animList		: [],
			playTarget		: 0,
			playProgress	: 0,
			galW			: dd.gal.width(),
			galH			: dd.gal.height(),
			debugIndent			: 0
		};
		
		// timers
		dd.timers = {};
		
		// interval for window resize checking
		dd.opt.resizeCheckInterval = 500;
		
		// deferreds
		dd.deferreds = {};
		
		// keypress function container
		dd.keypresses = {};
		
		// initialize gallery
		dd.initialize(dd);
    };

////////////////////////////////////////////////////////////////////////////////////
	
	/////////////////////
	// DEFAULT OPTIONS //
	/////////////////////
	$.ddGM.defaultOptions = {
		animPath		: undefined,
		animations		: {fade:{}},
		modulePath		: undefined,
		modules			: {arrows:{}, resizer:{}},
		typePath		: undefined,
		types			: {img:{}},
		keyboard		: true,
		pause			: 5000,
		hoverPause		: true,
		hoverSelectors	: '',
		contiguous		: false,
		autoPlay		: true,
		startItem		: 1,
		useMin			: true,
		debug			: false
	};
	
////////////////////////////////////////////////////////////////////////////////////
	
	///////////////////////////
	// MAIN PROTOTYPE OBJECT //
	///////////////////////////
	$.ddGM.prototype = {
		
		////////////////////////
		// INITIALIZE GALLERY //
		////////////////////////
		
		// INITIALIZE GALLERY
		initialize : function(dd) {
			
			// INITIALIZATION FUNCTION PIPE
			var FUNC = [
				
				//  1: STORE ORIGINAL CONTENT & SETUP GALLERY
				function(DFD){
				
					// store original content
					dd.origData = dd.gal.html();
					dd.source.html = $('<div />').html(dd.gal.html());
				
					// set css value(s) on main container
					dd.origPos = (dd.gal.css('position')=='static') ? 'relative' : dd.gal.css('position');
					dd.gal.css({
						'position' : dd.origPos
					}).addClass('ddGM-main');
					
					DFD.resolve();
				},
				
				//  2: LOAD TEMPLATE
				function(DFD){
					dd.gal.html(window.ddGM.tpl.stage).ready(DFD.resolve);
				},
				
				//  3: REGISTER OBJECTS
				function(DFD){
	
					// register objects
					dd.obj.control = dd.gal.find('.ddGM-control');
					dd.obj.stageWrap = dd.gal.find('.ddGM-stage-wrapper');
					dd.obj.stage = dd.obj.stageWrap.children('.ddGM-stage');
				
					// assign to layers
					dd.obj.stageWrap.css({'z-index':dd.layers.stage});
					dd.obj.control.css({'z-index':dd.layers.controls});
					
					DFD.resolve();
				},
				
				//  4: LOAD TYPES
				function(DFD){
					dd.loadPlugin.call(dd, DFD, 'type', dd.opt.types);
				},
				
				//  5: LOAD MODULES
				function(DFD){
					dd.loadPlugin.call(dd, DFD, 'module', dd.opt.modules);
				
				},
				
				//  6: LOAD ANIMATIONS
				function(DFD){
					dd.loadPlugin.call(dd, DFD, 'anim', dd.opt.animations);
				},
				
				//  7: RUN "loadStart" MODULES
				function(DFD){
					dd.runEvent.call(dd, DFD, 'loadStart');
				},
				
				//  8: BUILD ITEM LIST
				function(DFD){
					var itemFunc=[];
					
					// parse through each item
					dd.source.html.children().each(function(){
						var item = $(this),
							id='ddGMi'+(Math.floor(Math.random()*1000000));
							
						// tag source
						item.addClass(id);
						dd.source.list[id] = '';
						
						// generate function pipe
						itemFunc.push( (function(dd,item,id){
							return function(dfd){
								var supported = false,
									object = $.extend({}, window.ddGM.tpl.item, {id:id, dfd:dfd});
								
								// loop through each type selector
								$.each(dd.opt.types, function(name,v) {
									
									// set type
									object.type = name;
									
									// send object to type selector
									var ret = window.ddGM.types[name]['selector'].call(dd, item, object);
									
									// stop parsing if selected
									if ( ret === true ) {
										supported = true;
										return false; // exit type loop
									};
									
								});
								
								// resolve & move on if item unsupported
								if ( !supported ) {
									dfd.resolve();
								}
								
							};
						})(dd,item,id));
						
						
					});
					
					// run pipe
					dd.runPipe.call(dd, DFD, 'itemParser', itemFunc);
					
				},
				
				//  9: LOAD FIRST ITEM, AUTOPLAY
				function(DFD){
					
					// sanity check start item setting
					dd.opt.startItem = parseInt(dd.opt.startItem,10) - 1;
					dd.opt.startItem = (dd.opt.startItem > dd.itemList.length-1)
						? dd.itemList.length-1
						: (dd.opt.startItem < 0)
							? 0
							: dd.opt.startItem;
					
					// at least one item?
					if (dd.itemList.length>0) {
						
						// autoplay?
						if (dd.opt.autoPlay) { dd.states.paused.user = false; };
						
						// LOAD INITIAL ITEM
						dd.changeItem.call(dd, DFD, dd.opt.startItem);

					} else {
						DFD.resolve();
					};
					
				},
				
				// 10: RUN "loadEnd" MODULES
				function(DFD){
					dd.runEvent.call(dd, DFD, 'loadEnd');
				},
				
				// 11: SET UP LISTENERS
				function(DFD){
					
					// unset first item flag
					dd.states.firstItem = false;
					
					// set hover listeners
					dd.obj.hoverElements = dd.gal;
					if (dd.opt.hoverSelectors) {
						dd.obj.hoverElements.add(dd.opt.hoverSelectors);
					};				
					
					// set initial hover state
					dd.obj.hoverElements.on('mousemove.'+dd.id, function(){
						dd.mouseHoverOn.call(dd);			
						dd.obj.hoverElements.off('mousemove.'+dd.id);
					});	
					
					// mouse and touch
					dd.hoverStart.call(dd);
					
					// container resize
					dd.timers.resizer = setInterval(function(){
						dd.resizeTimer.call(dd);
					}, dd.opt.resizeCheckInterval);
					
					// window resize
					$(window).on('resize.'+dd.id, function(){
						dd.runEvent.call(dd, null, 'resize');
					});
					
					// keyboard nav?
					if (dd.opt.keyboard) {
						
						// left arrow
						dd.registerKeypress.call(dd, 37, function(){
							dd.states.navSource = 'left';
							dd.rotateItems(false);
						});
						
						// right arrow
						dd.registerKeypress.call(dd, 39, function(){
							dd.states.navSource = 'right';
							dd.rotateItems(true);
						});
					
					};
					
					// keyboard listener
					$(document).on('keydown.'+dd.id, function(e){
						dd.keyPress.call(dd, e.keyCode);
					});
					
					DFD.resolve();
					
				}
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, null, 'initialize', FUNC);
			
		},
		
		// ADD PARSED ITEM TO LIST
		addItem : function(obj) {
			var dd = this,
				output = {};
			
			// ready output
			output[obj.id] = obj;
			
			// add item to globals
			$.extend(true, dd.items, output);
			dd.itemList.push(obj.id);
			dd.source.list[obj.id] = obj.type;
			
			dd.debug('[+] '+obj.type+': '+obj.id);
			
			// resolve
			obj.dfd.resolve();
			return true;
		},
		
		//------------------------------------
		
		/////////////////
		// CHANGE ITEM //
		/////////////////
		changeItem : function(DFD, index) {
			var dd = this,
				FUNC,
				dir = true,
				current = dd.states.current,
				prevObj, prevItem, newObj, newItem, anim,
				currentIndex, clickedIndex,

				// sanity check on passed index
				clicked = (String(index).substr(0,5) == 'ddGMi')
					? index
					: (index > dd.itemList.length-1)
						? dd.itemList[dd.itemList.length-1]
						: (index < 0)
							? dd.itemList[0]
							: dd.itemList[index];
			
			// don't run if item already showing or animating
			if ( current == clicked || dd.states.changing ) { return; };
			
			// clear play timer and reset delay
			clearTimeout(dd.timers.playTimer);
			dd.states.playDelay = dd.opt.pause;
			
			// save references
			currentIndex = $.inArray(current, dd.itemList);
			clickedIndex = $.inArray(clicked, dd.itemList);
			
			// save states
			dd.states.changing = true;
			dd.states.clicked = clicked;
				
			// CHANGE ITEM FUNCTION PIPE
			FUNC = [
				
				//  1: INITIALIZE
				function(dfd){
				
					// item and object references
					if ( !dd.states.firstItem ) {
						prevObj = dd.items[current];
						prevItem = dd.obj.stage.find('.'+current);
					};
					newObj = dd.items[clicked];
					newItem = dd.obj.stage.find('.'+clicked);
					
					// select random animation from loaded animations
					anim = dd.states.animList[(Math.ceil(Math.random()*dd.states.animList.length)-1)];
					
					// direction of animation (true = right/down)
					switch (dd.states.navSource) {
					
						case 'right' :
							dir = true;
							break;
						
						case 'left' :
							dir = false;
							break;
							
						case 'timer' :
							dir = (currentIndex < clickedIndex)
								? true
								: ( (currentIndex == dd.itemList.length-1) && (clickedIndex == 0) )
									? true
									: false;
							break;
							
						case 'direct' :
							dir = (currentIndex < clickedIndex);
							break;
	
					};
					
					dfd.resolve();
				},
				
				//  2: RUN "changeStart" MODULES
				function(dfd){
					if ( dd.states.firstItem ) {
						dfd.resolve();
					} else {
						dd.runEvent.call(dd, dfd, 'changeStart');
					};
				},
				
				//  3: LOAD NEW ITEM
				function(dfd){
					
					// item isn't loaded to stage
					if ( newItem.length == 0 ) {
						dd.gal.addClass('loading');
						
						// create pipe for loading item
						var loadFunc = [
						
							// RUN "itemLoadStart" MODULES
							function(d){
								dd.runEvent.call(dd, d, 'itemLoadStart');
							},
							
							// LOAD ITEM
							function(d){
								window.ddGM.types[newObj.type].loader.call(dd, d, newObj, dd.obj.stage);
							},
								
							// save and initialize new item
							function(d){
								newItem = dd.obj.stage.find('.'+clicked);
								newItem.css({display: 'block',opacity:1});
								d.resolve();
							},
								
							// RUN "itemLoadEnd" MODULES
							function(d){
								dd.runEvent.call(dd, d, 'itemLoadEnd');
							
							}
						];
						
						// RUN PIPE
						dd.runPipe.call(dd, dfd, 'loadItem', loadFunc);

					// Item is already loaded to the stage
					} else {
						newItem.css({display: 'block',opacity:1});
						dfd.resolve();
					};
				},
				
				//  4: RUN "preAnim" MODULES
				function(dfd){
					if ( dd.states.firstItem ) {
						dfd.resolve();
					} else {
						dd.gal.removeClass('loading');
						dd.runEvent.call(dd, dfd, 'preAnim');
					};
				},
				
				//  5: START ANIMATIONS
				function(dfd){
					
					// initialize animation listener
					dd.deferreds.animComplete = [$.Deferred()];
					
					// ANIMATE
					if (anim!=undefined && anim!='' && !dd.states.firstItem){
						dd.debug('ANIMATION START');
						window.ddGM.anims[anim].animate.call(dd, dfd, dd.deferreds.animComplete[0], newItem, prevItem, dir);
					} else {
						dd.deferreds.animComplete[0].resolve();
						dfd.resolve();
					};
				},
				
				//  6: RUN "midAnim" MODULES
				function(dfd){
					if ( dd.states.firstItem ) {
						dfd.resolve();
					} else {
						dd.runEvent.call(dd, dfd, 'midAnim');
					};
				},
				
				//  7: CLEANUP ITEMS
				function(dfd){
					$.when(dd.deferreds.animComplete[0]).then(function(){
						dd.debug('ANIMATION COMPLETE');
						if (!dd.states.firstItem){
							prevItem.css({'display':'none'}).removeClass('selected');
						};
						newItem.css({'display':'block', 'opacity':1}).addClass('selected');
						dfd.resolve();
					});
				},
				
				//  8: RUN "postAnim" MODULES
				function(dfd){
					if ( dd.states.firstItem ) {
						dfd.resolve();
					} else {
						dd.runEvent.call(dd, dfd, 'postAnim');						
					};
				},
				
				//  9: CLEANUP ITEM CHANGE
				function(dfd){
					
					// save new current item
					dd.states.current = clicked;
					dd.states.clicked = '';
					
					// reset timer
					if ( !dd.opt.hoverPause || (dd.opt.hoverPause && !dd.states.hover) ) {
						dd.play.call(dd, 'change', dfd);
					} else {
						dfd.resolve();
					};
					
				},
				
				// 10: RUN "changeEnd" MODULES
				function(dfd){
					
					dd.states.changing = false;
					
					if ( dd.states.firstItem ) {
						dfd.resolve();
					} else {
						dd.runEvent.call(dd, dfd, 'changeEnd');
					};
				}
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, DFD, 'changeItem', FUNC);
		},
		
		//------------------------------------
		
		///////////////////
		// USER CONTROLS //
		///////////////////
		hoverStart : function(){
			var dd = this;
			
			// mouse hover on
			dd.obj.hoverElements.on('mouseenter.'+dd.id, function(){
				dd.mouseHoverOn.call(dd);							
			});
			
			// mouse hover off
			dd.obj.hoverElements.on('mouseleave.'+dd.id, function(){
				dd.mouseHoverOff.call(dd);
			});
			
			// touch
			dd.obj.hoverElements.on('touchstart.'+dd.id, function(){
				dd.touchHoverOn.call(dd);
			});
		},
		//------------
		mouseHoverOn : function(){
			var dd = this, FUNC;
			
			// remove initial hover listener if it exists
			dd.obj.hoverElements.off('mousemove.'+dd.id);
			
			// set hover state
			dd.states.hover = true;
			
			// MOUSEOVER PIPE
			FUNC = [
				
				// RUN "mouseIn" EVENT
				function(dfd){
					dd.runEvent.call(dd, dfd, 'mouseIn');
				},
				
				// PAUSE ON HOVER?
				function(dfd){
					if ( dd.opt.hoverPause ) { dd.pause.call(dd, 'hover'); };
					dfd.resolve();
				}
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, null, 'mouseHoverOn', FUNC);
		},
		//------------
		mouseHoverOff : function(){
			var dd = this, FUNC;
			
			// set hover state
			dd.states.hover = false;
			
			// MOUSEOUT PIPE
			FUNC = [
			
				// RUN "mouseOut" EVENT
				function(dfd){
					dd.runEvent.call(dd, dfd, 'mouseOut');
				},
				
				// UNPAUSE ON HOVER?
				function(dfd){
					if ( dd.opt.hoverPause ) { dd.play.call(dd, 'hover'); };
					dfd.resolve();
				}
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, null, 'mouseHoverOff', FUNC);
		},		
		//------------
		touchHoverOn : function(){
			var dd = this,
				FUNC;
				el = dd.obj.hoverElements;
			
			// don't listen if changing
			if ( dd.states.changing ) { return; };
			
			// stop listening to touchstart and mouse hovers
			el.off('touchstart.'+dd.id);
			el.off('mouseenter.'+dd.id);
			el.off('mouseleave.'+dd.id);
			
			// TOUCH PIPE
			FUNC = [
			
				// 1. run touchstart event
				function(dfd){
					dd.runEvent.call(dd, dfd, (dd.states.hover?'touchStartUp':'touchStartDown'));
				},
				
				// 2. touch events
				function(dfd){
					
					// start listening for touchend
					el.on('touchend.'+dd.id,function(e){
						
						// tapped on a link?
						var link = (e.srcElement.nodeName=='A' || e.srcElement.parentNode.nodeName=='A');
						
						// not a link & tap hover inactive? Activate
						if ( !link && !dd.states.hover ) {
							dd.states.hover = true;
							dd.mouseHoverOn.call(dd);
						
						// not a link & tap hover active? Deactivate
						} else if ( !link ) {
							dd.states.hover = false;
							dd.mouseHoverOff.call(dd);					
						};
						
						// run touchend event
						dd.runEvent.call(dd, null, (!dd.states.hover?'touchEndUp':'touchEndDown'));
						
						// restore listening states
						el.off('touchend.'+dd.id);
						dd.timers.hoverStart = setTimeout(function(){
							dd.hoverStart.call(dd);
						}, 0);
					});
					
					// listen for touchmove (ignore scrolling)
					el.on('touchmove.'+dd.id, function() {
						el.off('touchend.'+dd.id);
						el.on('touchend.'+dd.id, function(){
							el.off('touchend.'+dd.id);
							dd.timers.hoverStart = setTimeout(function(){
								dd.hoverStart.call(dd);
							}, 0);
						});
					});
					
					// return
					dfd.resolve();
				}
				
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, null, 'touch', FUNC);
			
		},
		//------------
		registerKeypress : function(k,f) {
			var dd = this;
			if ( typeof dd.keypresses[k] != 'object' ) {
				dd.keypresses[k] = [];
			};
			dd.keypresses[k].push(f);		
		},
		//------------
		keyPress : function(k){
			var dd = this;
			$.each(dd.keypresses[k], function(i,v){
				v.call(dd);
			});			
		},
		
		//------------------------------------
		
		//////////////////////
		// CONTAINER RESIZE //
		//////////////////////
		resizeTimer : function(){
			var dd = this,
				galW = dd.gal.width(),
				galH = dd.gal.height();
			
			if ( galW != dd.states.galW || galH != dd.states.galH ) {
				dd.runEvent.call(dd, null, 'resize');
				dd.states.galW = galW;
				dd.states.galH = galH;
			};
			
		},
					
		//------------------------------------
		
		/////////////////////
		// PLAYER CONTROLS //
		/////////////////////
		rotateItems : function(forward) {
			var dd = this,
				n = $.inArray(dd.states.current, dd.itemList);
			
			if ( !dd.states.changing ) {
				// sanity check item
				if (n<0) { return; }
				
				// clear play timer
				clearTimeout(dd.timers.playTimer);
							
				// calculate new item
				if (forward){
					n = ((n+1) < dd.itemList.length) ? n+1 : 0;
				} else {
					n = ((n-1) >= 0) ? n-1 : dd.itemList.length-1;
				};
				
				// change to new item
				dd.changeItem.call(dd, null, n);
			};
		},
		//------------
		play : function( toggle, DFD ) {
			var dd = this, FUNC,
				d = new Date(),
				t = d.getTime();
			
			// reset play state
			dd.states.playing = true;
			
			// PLAY FUNCTION PIPE
			FUNC = [
			
				// 1. INITIALIZE
				function(dfd){
					switch (toggle) {
						
						// user play overrides all pauses
						case 'user' :
							dd.states.paused = {};
							break;
					
						// all other toggles only unpause themselves
						default :
							$.each(dd.states.paused, function(i,v){
								if (i==toggle) {
									dd.states.paused[i] = false;
								} else if (v) {
									dd.states.playing = false;
								};
							});
					};
					
					dfd.resolve();
				},
			
				// 2. RUN "userPlayStart" MODULES (only on user-toggled play)
				function(dfd){
					if ( dd.states.playing && toggle=='user' ) {
						dd.runEvent.call(dd, dfd, 'userPlayStart');
					} else {
						dfd.resolve();
					};
				},
				
				// 3. RUN "playStart" MODULES
				function(dfd){
					if (dd.states.playing) {
						dd.runEvent.call(dd, dfd, 'playStart');
					} else {
						dfd.resolve();
					};
				},
				
				// 4. START TIMERS
				function(dfd){
					if ( dd.states.playing ) {
						
						// set new target time
						dd.states.playTarget = t + dd.states.playDelay;
						
						// clear play timer
						clearTimeout(dd.timers.playTimer);
						
						// start play timer
						dd.timers.playTimer = setTimeout(function(){
							dd.states.navSource = 'timer';
							dd.rotateItems.call(dd, true);
						}, dd.states.playDelay);
					};
					dfd.resolve();
				},
				
				// 5. RUN "userPlayEnd" MODULES (only on user-toggled play)
				function(dfd){
					if ( dd.states.playing && toggle=='user' ) {
						dd.runEvent.call(dd, dfd, 'userPlayEnd');
					} else {
						dfd.resolve();
					};
				},
				
				// 6. RUN "playEnd" MODULES
				function(dfd){
					if ( dd.states.playing ) {
						dd.runEvent.call(dd, dfd, 'playEnd');
					} else {
						dfd.resolve();
					};
				}
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, DFD, 'play-'+toggle, FUNC);
		},
		//------------
		pause : function( toggle, DFD ) {
			var dd = this, FUNC,
				d = new Date(),
				t = d.getTime();
			
			// initialize
			clearTimeout(dd.timers.playTimer);
			dd.states.paused[toggle]= true;
			dd.states.playing = false;
			
			// PAUSE FUNCTION PIPE
			FUNC = [
			
				// 1. RUN "userPauseStart" MODULES (only on user-toggled pause)
				function(dfd){
					if (toggle=='user') {dd.runEvent.call(dd, dfd, 'userPauseStart')}
					else {dfd.resolve()};
				},
				
				// 2. RUN "pauseStart" MODULES
				function(dfd){
					dd.runEvent.call(dd, dfd, 'pauseStart');
				},
				
				// 3. set progress
				function(dfd){
					dd.states.playDelay = ((dd.states.playTarget - t) < 0 ) ? dd.opt.pause : (dd.states.playTarget - t);
					dfd.resolve();
				},
				
				// 4. RUN "userPauseEnd" MODULES (only on user-toggled pause)
				function(dfd){
					if ( toggle=='user' ) {
						dd.runEvent.call(dd, dfd, 'userPauseEnd');
					} else {
						dfd.resolve();
					};
				},
				
				// 5. RUN "pauseEnd" MODULES
				function(dfd){
					dd.runEvent.call(dd, dfd, 'pauseEnd');
				}
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, DFD, 'pause-'+toggle, FUNC);
		},
		
		//------------------------------------
		
		/////////////////////
		// PLUGIN HANDLERS //
		/////////////////////
		loadPlugin : function(DFD, type, mods) {
			var dd = this, FUNC = [],
				path = dd.opt[type+'Path'];
				
			// generate pipe for types
			$.each(mods, function(name, options){
				
				FUNC.push(function(dfd){
					if ( !window.ddGM[type+'s'][name] ) {
						var script = path + "ddGM."+type+"." + name + (dd.opt.useMin ? ".min" : "") + ".js";
						dd.debug("[…] FETCHING: " + type + "(" + script + ")");
						$.ajax({
							type : 'GET',
							url : script,
							dataType : 'script',
							success : function(){
								dd.initializePlugin(dfd, type, name, script);
							},
							error : function(jqxhr, settings, exception){
								dd.debug("[X] ERROR LOADING: "+type+"("+script+") :: exception("+exception+")");
								dfd.resolve();
							}
						});
					} else {
						dd.initializePlugin(dfd, type, name, script);
					};				
				});
				
			});
			
			// run pipe
			dd.runPipe.call(dd, DFD, 'load'+type, FUNC);
		},
		//-------------------
		initializePlugin : function(dfd, type, name, script){
			var dd = this;
			if ( type=='anim' ) { dd.states.animList.push(name); };
			dd.debug("[√] LOADED: " + type + "(" + script + ")");
			window.ddGM[type+'s'][name]['initialize'].call(dd, dfd);
		},
		//-------------------
		registerEvent : function(event, mod, action, type) {
			var dd = this,	obj = {};
			type = type==undefined
				? 'modules'
				: type=='animation'
					? 'anims'
					: type+'s';
			
			// add event to list?
			if ( dd.events[event] == undefined ) {
				dd.events[event] = {};
			};
			
			// add module to event?
			if ( dd.events[event][mod] == undefined ) {
				dd.events[event][mod] = [];
			};
			
			// add action to module on event
			if ( dd.events[event][mod] ) {
				obj = {};
				obj[type] = action;
				dd.events[event][mod].push(obj);
			};
			
			dd.debug('[e] "' + event + '" registered: ' + type + '.' + mod + '.' + action);
		},
		//-------------------
		runEvent : function(DFD, event) {
			var dd = this, FUNC=[];
			dd.debug('*** [EVENT] '+event+' ***');
			// GENERATE FUNCTIONS FOR MODULE
			$.each(dd.events[event], function(module,functions){
				FUNC.push( function(dfd){
					
					// build pipe for this module
					var func = [];
					$.each(functions, function(i,v){
						$.each(v, function(type,name){
							func.push( function(d){
								dd.debug('[>] "'+event+'" run: '+type+"."+module+"."+name);
								if ( typeof window.ddGM[type][module][name] == 'function' ) {
									window.ddGM[type][module][name].call(dd, d);
								};
							});
						});
					});
					
					// run module's pipe
					dd.runPipe.call(dd, dfd, event+'_'+module, func);
				});
			});
			
			// run pipe of modules
			dd.runPipe.call(dd, DFD, event, FUNC);
		
		},
		
		//------------------------------------
		
		///////////////////////////
		// RUN FUNCTION PIPELINE //
		///////////////////////////
		runPipe : function(DFD,defs,pipe) {
			var dd=this;
			
			// sanity check
			if (pipe.length<1){
				if(DFD!=null){DFD.resolve();};
				return;
			};
			
			// initialize deferreds
			dd.deferreds[defs] = [];
			for(i=0; i<=pipe.length; i++){dd.deferreds[defs].push($.Deferred())};
			
			// assign deferreds to functions in pipe
			for(i=0; i<pipe.length; i++){ (function(i){
				dd.deferreds[defs][i].done(function(){
					dd.debug('—— '+(i+1)+'. '+defs+' ——');
					pipe[i](dd.deferreds[defs][i+1]);
				});
			})(i)};
			
			// return when pipe is complete
			dd.deferreds[defs][pipe.length].done(function(){
				dd.states.debugIndent--;
				dd.debug('———————— END: '+defs+' ————————');
				if(DFD!=null){DFD.resolve();};
			});
			
			// begin processing
			dd.debug('——————— START: '+defs+' ———————');
			dd.states.debugIndent++;
			dd.deferreds[defs][0].resolve();
		},
		
		//------------------------------------
		
		////////////////
		// DEBUG ECHO //
		////////////////
		debug : function(t, x) {
			var dd=this, tab='';
			for (i=0; i<dd.states.debugIndent; i++) { tab+='  '; };
			if ( this.opt.debug || x ) {
				console.log('[ddGM] '+tab+t);
			};
		},
		
		//------------------------------------
		
		///////////////////////////
		// DESTROY THIS INSTANCE //
		///////////////////////////
		destroy : function() {
			var dd = this;
			
			// STOP TIMERS & INTERVALS
			$.Deferred(function(DFD){
				
				// clear timers
				$.each(dd.timers, function(i,v){
					clearTimeout(v);
					clearInterval(v);
				});
				
				// clear deferreds
				$.each(dd.deferreds, function(i,v){
					for(var n in v){
						try { v[n].reject(); }
						catch(err){};
					};				
				});
				dd.deferreds = [];
				
				DFD.resolve();
			})
			
			// RUN "unload" MODULES
			.pipe(function(){
				return $.Deferred(function(DFD){
					dd.runEvent.call(dd, DFD, 'unload');
				});
			})
			
			// CLEAN UP
			.pipe(function(){
			
				// clear listeners
				dd.gal.off('.'+dd.id);
				dd.obj.hoverElements.off('mouseEnter.'+dd.id);
				$(document).off('keydown.'+dd.id);
				$(window).off('resize.'+dd.id);
		
				// stop any animations
				dd.gal.find().stop(1,0);
		
				// replace original data
				dd.gal.html(dd.origData);
				dd.gal.css({'position':dd.origPos});
			});
		}
	};

////////////////////////////////////////////////////////////////////////////////////

	/////////////////
	// PLUGIN CALL //
	/////////////////
	$.fn.ddGM = function(options, goTo) { 
		var control='load', args,
			extControls = [
				'goTo',
				'togglePlay',
				'play',
				'pause',
				'last',
				'next',
				'resize',
				'load',
				'reload',
				'unload',
				'destroy'
			];
		
		// sanity check on options
		options = (options==undefined) ? {} : options;
		
		// listen for external controls
		if ( (typeof options !== 'object') && $.inArray(options, extControls)>=0 ) {
			control = options;
			
		// (re)initialize ddGallery
		} else {
			
			// sanity check on passed arguments
			args = (typeof options === 'object' || !options ) ? options : arguments[1];
			
			// set paths
			if (args.modulePath==undefined || args.animPath==undefined || args.typePath==undefined) {
				(function(){
					var src = $(document).find('script[src*="ddGM"]').attr('src') || '',
						p = src.match(/^(.*\/).*$/i);
					
					if ( args.modulePath==undefined) {
						args.modulePath = p[1] + "modules/";
						if ( args.debug ) { console.log("[ddGM] MODULE PATH: " + args.modulePath); };
					};
					
					if ( args.animPath==undefined) {
						args.animPath = p[1] + "animations/";
						if ( args.debug ) { console.log("[ddGM] ANIMATION PATH: " + args.animPath); };
					};
					
					if ( args.typePath==undefined) {
						args.typePath = p[1] + "types/";
						if ( args.debug ) { console.log("[ddGM] TYPE PATH: " + args.typePath); };
					};
					
				})();
			};
			
			// path sanity check
			if ( args.modulePath.charAt( args.modulePath.length-1 ) != '/' ) { args.modulePath + '/'; };
			if ( args.animPath.charAt( args.animPath.length-1 ) != '/' ) { args.animPath + '/'; };
			if ( args.typePath.charAt( args.typePath.length-1 ) != '/' ) { args.typePath + '/'; };
			
			
		};
		
		// loop through supplied elements
		this.each(function(){
			// retrieve existing instance
			var dd = $(this).data('ddGM'),
				debug = false;
			
			if (control=='load' && args.debug) {
				debug = true;
				console.log('[ddGM] *** EXTERNAL COMMAND ('+control+') ***');
			} else if (dd) {
				if ( dd.opt.debug ) {
					debug = true;
					console.log('[ddGM] *** EXTERNAL COMMAND ('+control+') ***');
				};
			};
			
			switch (control) {
			
				// LOAD OR RELOAD OR DESTROY
				case 'load' :
				case 'reload' :
				case 'unload' :
				case 'destroy' :
					
					// destroy instance if exists
					if (dd) {
						dd.destroy.call(dd);
						$(this).removeData('ddGM');
						if (debug) { console.log('[ddGM] INSTANCE DESTROYED'); };
					};
					
					// (re)create instance?
					if ( options!='destroy' && options!='unload' ) {
						$(this).data('ddGM', new $.ddGM(this, args));
						if (debug) { console.log('[ddGM] CREATION COMPLETED'); };
					};
					
					break;
					
				// GO TO
				case 'goTo' :
					
					// sanity check
					goTo = goTo - 1;
					goTo = (goTo > dd.itemList.length-1) ? dd.itemList.length-1 : (goTo < 0) ? 0 : goTo;
					
					// load item
					dd.changeItem.call(dd, goTo);
					break;
				
				// NEXT
				case 'next' :
					dd.rotateItems.call(dd, true);					
					break;
					
				// LAST
				case 'last' :
					dd.rotateItems.call(dd, false);					
					break;
					
				// PLAY
				case 'play' :
					dd.play.call(dd, 'user');
					break;
				
				// PAUSE
				case 'pause' :
					dd.pause.call(dd, 'user');
					break;
				
				// TOGGLE PLAY	
				case 'togglePlay' :
					var p = false;
					$.each(dd.states.paused, function(i,v){
						if (v) { p=true; };
					});						
					if (p) {
						dd.play.call(dd, 'user');
					} else {
						dd.pause.call(dd, 'user');
					};
					break;
				
				// RESIZE GALLERY	
				case 'resize' :
					dd.runEvent.call(dd, null, 'resize');
					break;
					
			};
			
		});
		return this;				
    
	};
			
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
	
})( jQuery );
