/* /////////////////////////////////////////////////////
 * Thumb Scroller module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'thumbScroller',
		
		defaultOptions = {
			toControl : true, // add the scroller to the control div? (overrides toGallery)
			toGallery : true, // add to the gallery? (overridden by toControl)
			selectors : '', // other element selectors to add the scroller to
			
			fit : false, // resize thumbs to exactly fit width?
			fitMin : 30, // minimum pixel width for thumbs when fitting
			fitMax : 150, // maximium pixel width for thumbs when fitting (set to false for unlimited)
			
			hide : true, // hide thumbs?
			hideDelay : 2000, // how long to wait before sliding out
			
			slideSpeed : undefined, // change slide in/out simultaneously
			slideOutSpeed : 375, // speed of the slide out when showing captions
			slideInSpeed : 750, // speed of the slide in when showing captions
			
			showOnHover : true, // show thumbs on mouseover?
			showOnChange : false, // show thumbs on image change?
			
			scrollSpeed : 500, // scroll speed for auto scroll & arrow scroll
			scrollEasing : 'swing', // custom easing setting for the scroller
			
			hoverScroll : true, // scroll based on mouse hover position
			arrowScroll : false, // show arrows for scrolling
			touchScroll : true // scrolling support for touchscreens
			
		},
	
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			var dd = this;
			
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);
			
			// initialize global var
			dd.states.touchScroll = false;
			
			// slide sanity check
			dd.opt.modules[moduleName].slideInSpeed = (dd.opt.modules[moduleName].slideSpeed == undefined) ? dd.opt.modules[moduleName].slideInSpeed : dd.opt.modules[moduleName].slideSpeed;
			dd.opt.modules[moduleName].slideOutSpeed = (dd.opt.modules[moduleName].slideSpeed == undefined) ? dd.opt.modules[moduleName].slideOutSpeed : dd.opt.modules[moduleName].slideSpeed;
			
			// register events
			dd.registerEvent('loadEnd', moduleName, 'generateThumbs');
			dd.registerEvent('loadEnd', moduleName, 'selectThumb');
			dd.registerEvent('midAnim', moduleName, 'selectThumb');
			dd.registerEvent('resize', moduleName, 'sizer');
			dd.registerEvent('unload', moduleName, 'unload');
			
			if ( dd.opt.modules[moduleName].hide ) {
				dd.registerEvent('loadEnd', moduleName, 'hideThumbs');
				
				if ( dd.opt.modules[moduleName].showOnHover ) {
					dd.registerEvent('mouseIn', moduleName, 'showThumbs');
					dd.registerEvent('mouseOut', moduleName, 'startTimer');
					dd.registerEvent('touchEndUp', moduleName, 'hideThumbs');
				};
				
				if ( dd.opt.modules[moduleName].showOnChange ) {
					dd.registerEvent('midAnim', moduleName, 'showThumbs');
					dd.registerEvent('changeEnd', moduleName, 'startTimer');
				};
			};
			
			
			// resolve deferred
			dfd.resolve();
			
		},
		generateThumbs : function(dfd){
			var dd = this,
				parents = $(),
				tpl='';
				
			tpl+= 	'<div class="ddGM-thumbScroller-main" style="overflow:hidden">';
			
			if ( dd.opt.modules[moduleName].arrowScroll ) {
				tpl+= 	'<a class="ddGM-thumbScroller-arrow-left"><div></div></a>';
				tpl+= 	'<a class="ddGM-thumbScroller-arrow-right"><div></div></a>';
			};
			
			tpl+= 		'<div class="ddGM-thumbScroller-wrapper" style="position:relative;overflow:hidden">';
			tpl+= 			'<div class="ddGM-thumbScroller" style="position:absolute;"></div>';
			tpl+= 		'</div>';
			tpl+=	'</div>';
			
			
			// add to control or gallery
			if (dd.opt.modules[moduleName].toControl) {
				parents = parents.add(dd.obj.control);
			} else if (dd.opt.modules[moduleName].toGallery) {
				parents = parents.add(dd.gal);
			};
			
			// add to selectors
			if (dd.opt.modules[moduleName].selectors) {
				parents = parents.add(dd.opt.modules[moduleName].selectors);
			};
			
			// add scroller
			parents.append(tpl).ready(function(){
				var output = '';
				
				// add references
				dd.obj.thumbScrollerInternal = dd.obj.control.find('.ddGM-thumbScroller-main');
				dd.obj.thumbScrollerMain = parents.find('.ddGM-thumbScroller-main');
				dd.obj.thumbScrollerWrap = parents.find('.ddGM-thumbScroller-wrapper');
				dd.obj.thumbScroller = dd.obj.thumbScrollerWrap.children('.ddGM-thumbScroller');
				if (!dd.opt.modules[moduleName].toControl && dd.opt.modules[moduleName].toGallery) {
					dd.obj.thumbScrollerWrap.css({'z-index':dd.layers.controls});
				};
				
				// size arrows
				if ( dd.opt.modules[moduleName].arrowScroll ) {
					var left = dd.obj.thumbScrollerMain.find('.ddGM-thumbScroller-arrow-left'),
						right = dd.obj.thumbScrollerMain.find('.ddGM-thumbScroller-arrow-right'),
						arrW = left.width(),
						arrH = left.height();
					
					left.children().css({
						'border-top-width':arrH/2,
						'border-bottom-width':arrH/2,
						'border-right-width':arrW
					});
					
					right.children().css({
						'border-top-width':arrH/2,
						'border-bottom-width':arrH/2,
						'border-left-width':arrW
					})
				};
				
				// build thumbs
				$.each(dd.itemList, function(i, id){
					output+='<div class="ddGM-thumb-wrapper '+id+' ddGM-type-'+dd.items[id].type+'"><a class="ddGM-thumb" href="#" data-item="'+id+'" style="position:relative;display:block;float:left;background-image:url('+dd.items[id].thumb+');background-position:center center;background-repeat:no-repeat;" title="'+dd.items[id].title+'"></a></div>';
				});
				
				// add items
				dd.obj.thumbScroller.html(output).ready(function(){
					var h = 0;
					
					// set each scroller height
					dd.obj.thumbScroller.each(function(){
						var ts = $(this);
						h = ts.children().outerHeight(true);
						ts.parent().css({height:h});
					});
					
					// save internal scroller height
					if ( dd.obj.thumbScrollerInternal.length > 0 ) {
						dd.states.thumbScrollerHeight = dd.obj.thumbScrollerInternal.height();
					};
					
					// listen for clicks
					dd.obj.thumbScroller.find('a').on('click touchend', function(e){
						e.preventDefault();
						if (!dd.states.thumbScrollerScrolling && !dd.states.changing) {
							dd.states.navSource = 'direct';
							dd.changeItem.call(dd, null, $(this).data('item'));
						};
					});	
					
					// hover scroll?
					if ( dd.opt.modules[moduleName].hoverScroll ) {
						window.ddGM.modules[moduleName].hoverScroll.call(dd);
					};
					
					// arrow scroll?
					if ( dd.opt.modules[moduleName].arrowScroll ) {
						window.ddGM.modules[moduleName].arrowScroll.call(dd);
					};
					
					// mobile / touch scroll
					if ( dd.opt.modules[moduleName].touchScroll ) {
						window.ddGM.modules[moduleName].touchScroll.call(dd);
					}
					
					// size scrollers
					window.ddGM.modules[moduleName].sizer.call(dd, dfd);
					
				});
			});		
		},
		

		////////////////////////
		// RESIZING FUNCTIONS //
		////////////////////////
		fitThumbs : function(){
			var dd = this;
			// loop through all scrollers
			dd.obj.thumbScroller.each(function(){
				var me = $(this),
					t = me.children(),
					wrapW = me.parent().width(),
					tNW = Math.floor((wrapW - ((t.outerWidth(true)-t.width()) * t.length)) / t.length);
				
				// minimum/maximum width sanity check
				tNW = (tNW < dd.opt.modules[moduleName].fitMin)
					? dd.opt.modules[moduleName].fitMin
					: (dd.opt.modules[moduleName].fitMax===false || dd.opt.modules[moduleName].fitMax > tNW)
						? tNW
						: dd.opt.modules[moduleName].fitMax; 
				
				// set thumb size
				t.css({width:tNW});
				
			});
		},
		sizeScroller : function(){
			// loop through all scrollers
			this.obj.thumbScroller.each(function(){
				var me = $(this),
					t = me.children(),
					w = (t.outerWidth(true) * t.length);
				// sanity check width
				if ( w < me.parent().width() ) { w='100%'; };
				me.css({width:w, left:0});
			});
		},
		sizer : function(dfd){
			var dd = this;
			
			// fit thumbs?
			if ( dd.opt.modules[moduleName].fit ) {
				window.ddGM.modules[moduleName].fitThumbs.call(dd);
			};
			
			// size container
			window.ddGM.modules[moduleName].sizeScroller.call(dd);
			
			// autoscroll
			window.ddGM.modules[moduleName].autoScroller.call(dd, dd.states.current, true);
			
			// hide/show arrows
			window.ddGM.modules[moduleName].arrowShow.call(dd);
			
			dfd.resolve();
		},
		

		/////////////////////////
		// SCROLLING FUNCTIONS //
		/////////////////////////
		autoScroller : function(id, fast){
			var dd = this;
			dd.obj.thumbScrollerWrap.each(function(){
				
				// objects
				var w = $(this),
					s = w.children(),
					t = w.find('.'+id),
					
					// positioning
					wW = parseInt(w.width()),
					sL = parseInt(s.position().left),
					tL = parseInt(t.position().left),
					
					// scrolling defaults
					speed = fast ? 0 : dd.opt.modules[moduleName].scrollSpeed,
					max = wW - parseInt(s.width(),10),
					nL;
				
				// thumbnail is off screen to the right
				if ( (tL + t.outerWidth() + sL) > wW ) {
					nL = wW - (tL + t.outerWidth(true));
					nL = (nL < max) ? max : (nL > 0) ? 0 : nL;
					s.stop(1,0).animate({'left':nL}, speed, dd.opt.modules[moduleName].scrollEasing, function(){
						window.ddGM.modules[moduleName].arrowShow.call(dd);
					});
					
				// thumbnail is off screen to the left
				} else if ( (tL + sL) < 0 ) {
					nL = 0 - tL;
					s.stop(1,0).animate({'left':nL}, speed, dd.opt.modules[moduleName].scrollEasing, function(){
						window.ddGM.modules[moduleName].arrowShow.call(dd);
					});
					
				};
			});
		},
		hoverScroll : function(){
			var dd = this;
			
			// mouse enter (start listening)
			dd.obj.thumbScrollerWrap.each(function(){
				var me = $(this);
				me.on('mouseenter', function(){
					var pad = 50,
						wX = me.offset().left,
						wW = me.width(),
						max = me.width() - me.children().outerWidth();
						
					wX += pad;
					wW -= (pad*2);
						
					if (max<0) {
							
						me.on('mousemove', function(e){
						
							var x = e.pageX - wX;
								nL = Math.ceil((x/wW)*max);
							
							// sanity check
							nL = (nL<max) ? max : (nL>0) ? 0 : nL;
							me.children().css({'left':nL});
							window.ddGM.modules[moduleName].arrowShow.call(dd);
						});
					};
				});
			});
			
			// mouse leave (stop listening)
			dd.obj.thumbScrollerWrap.on('mouseleave', function(){
				dd.obj.thumbScrollerWrap.off('mousemove');
				window.ddGM.modules[moduleName].arrowShow.call(dd);
			});
		},
		arrowScroll : function(){
			var dd = this;
			dd.obj.thumbScrollerMain.each(function(){
				var me = $(this),
					wrap = $(this).children('.ddGM-thumbScroller-wrapper');
					left = me.children('.ddGM-thumbScroller-arrow-left'),
					right = me.children('.ddGM-thumbScroller-arrow-right');
				
				// left click
				left.on('click', function(){
					window.ddGM.modules[moduleName].arrowScroller.call(dd,wrap,1);
				});
				
				// right click
				right.on('click', function(){
					window.ddGM.modules[moduleName].arrowScroller.call(dd,wrap,-1);
				});		
			});			
		},
		arrowScroller : function(ts,x){
			var dd = this,
				c = ts.children(),
				width = ts.width();
				max = width - c.outerWidth(),
				left = parseInt(c.css('left'),10)||0,
				newLeft = left + (width * x);
			
			// sanity check on new position
			newLeft = (newLeft>0)
				? 0
				: (newLeft<max)
					? max
					: newLeft;
			
			// move thumbscroller
			c.animate({left:newLeft}, dd.opt.modules[moduleName].scrollSpeed, dd.opt.modules[moduleName].scrollEasing, function(){
				window.ddGM.modules[moduleName].arrowShow.call(dd);
			});
		},
		arrowShow : function(){
			var dd = this;
			if (dd.opt.modules[moduleName].arrowScroll) {
				dd.obj.thumbScrollerMain.each(function(){
					var me = $(this),
						w = me.find('.ddGM-thumbScroller-wrapper'),
						c = w.children(),
						max = w.width() - c.outerWidth(),
						left = me.find('.ddGM-thumbScroller-arrow-left'),
						right = me.find('.ddGM-thumbScroller-arrow-right')
					
					// hide left arrow?
					if ( parseInt(c.css('left'),10)>=0 ) {
						left.css({'display':'none'});
					} else {
						left.css({'display':'block'});
					};
					
					// hide right arrow?
					if ( parseInt(c.css('left'),10)<=max ) {
						right.css({'display':'none'});
					} else {
						right.css({'display':'block'});
					};
				});
			};
		},
		touchScroll : function(){
			var dd = this;
			
			// loop through scrollers
			dd.obj.thumbScrollerWrap.each(function(){
				var me = $(this),
					c = me.children();
				
				// start listening on touchstart
				me.on('touchstart', function(event){
					
					// pause rotation
					dd.pause.call(dd, 'thumbScroller');
					
					// turn off hover scroll?
					if ( dd.opt.modules[moduleName].hoverScroll ) {
						dd.obj.thumbScrollerWrap.off('mouseenter');
					};
					
					// get maximum scroll amount
					max = me.width() - c.outerWidth();
					
					// stop page from scrolling
					$(document).on('touchmove', function(event) {
						var e = event.originalEvent;
						e.preventDefault();
					});
						
					// set initial vars
					var e = event.originalEvent,
						nStartL = parseInt(me.children().css('left')),
						tStartX = e.touches[0].pageX;
					
					// reset scrolling flag
					dd.states.thumbScrollerScrolling = false;
					
					// click for too long = scrolling
					clearInterval(dd.timers.thumbScroller);
					dd.timers.thumbScroller = setTimeout(function(){
						dd.states.thumbScrollerScrolling = true;				
					}, 750);
					
					// -----------------------------------------
					
					// touch move listener
					me.on('touchmove', function(event) {
						var e = event.originalEvent,
							x = e.touches[0].pageX,
							nL = nStartL + (x - tStartX);
						
						// scroll or click?
						if ( (x+15) > Math.abs(tStartX) ) {
							dd.states.thumbScrollerScrolling = true;
						};
						
						// set min and max values
						nL = (nL < max) ? max : (nL > 0) ? 0 : nL;
						me.children().css({'left':nL});
					});
				
					// -----------------------------------------
					
					// stop listening on touchend
					me.on('touchend', function(event) {
						
						// clear scroll timer
						clearInterval(dd.timers.thumbScroller);
						
						// reinstate page scrolling
						$(document).off('touchmove');
						
						// reinstate hover scroll?
						if ( dd.opt.modules[moduleName].hoverScroll ) {
							window.ddGM.modules[moduleName].hoverScroll.call(dd);
						};
						
						// turn off listeners
						me.off('touchmove');
						me.off('touchend');
						
						// update arrows
						window.ddGM.modules[moduleName].arrowShow.call(dd);
						
						// restart rotation
						dd.play.call(dd, 'thumbScroller');
						
					});
				});
			});		
		},


		/////////////////////////
		// THUMBNAIL FUNCTIONS //
		/////////////////////////
		selectThumb : function(dfd){
			var dd = this,
				id = (dd.states.clicked=='')
					? dd.states.current
					: dd.states.clicked;
					
			dd.obj.thumbScroller.children().removeClass('selected');
			dd.obj.thumbScroller.children('.'+id).addClass('selected');
			window.ddGM.modules[moduleName].autoScroller.call(dd, id);
			dfd.resolve();
		},
		showThumbs : function(dfd){
			var dd = this;
			
			// is there a scroller to show?
			if ( dd.obj.thumbScrollerInternal.length > 0 ) {
			
				// clear slide-out timer
				clearTimeout(dd.timers.thumbScroller);
				
				// slide in
				dd.obj.thumbScrollerInternal.stop(1,0).animate({'height':dd.states.thumbScrollerHeight}, dd.opt.modules[moduleName].hideSpeed);			
			
				// set state variables
				dd.states.thumbScrollerHidden = false;
				
			};
			
			// resolve deferred
			if (dfd!=null) { dfd.resolve(); };
		},
		hideThumbs : function(dfd){
			var dd = this;
			
			// is there a scroller to hide?
			if ( dd.obj.thumbScrollerInternal.length > 0 ) {
				
				// slide out
				dd.obj.thumbScrollerInternal.stop(1,0).animate({'height':0}, dd.opt.modules[moduleName].hideSpeed);			
			
				// set state variables
				dd.states.thumbScrollerHidden = true;
				
			};
			
			// resolve deferred
			if (dfd!=null) { dfd.resolve(); };
		},
		startTimer : function(dfd) {
			var dd = this;
			
			// start the timer?
			if ( dd.opt.modules[moduleName].hide && (!dd.states.hover || !dd.opt.modules[moduleName].showOnHover) ) {
				
				// clear old timer
				clearTimeout(dd.timers.thumbScroller);
				
				// set new timer
				dd.timers.thumbScroller = setTimeout(function(){
					window.ddGM.modules[moduleName].hideThumbs.call(dd, null);
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
			dd.obj.thumbScroller.children('a').off('click');
			this.obj.thumbScrollerWrap.remove();
			dfd.resolve();
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();