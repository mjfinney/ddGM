/* /////////////////////////////////////////////////////
 * Drop Animation for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var animName = 'drop',
	
		defaultOptions = {
			speed : 750,
			scale : 2.5,
			easing : undefined,
			easingIn : 'swing',
			easingOut : 'swing'
		},
	
	animation = {
		
		// INITIALIZE
		initialize : function(dfd) {
			var dd = this;
			
			// load options
			dd.opt.animations[animName] = $.extend(defaultOptions, dd.opt.animations[animName]);
			
			// easing sanity check
			dd.opt.animations[animName].easingIn = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingIn : dd.opt.animations[animName].easing;
			dd.opt.animations[animName].easingOut = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingOut : dd.opt.animations[animName].easing;
			
			dfd.resolve();
		},
		
		// MAIN ANIMATION FUNCTION
		animate : function(dfd, animComplete, newItem, prevItem, dir) {
			var dd = this;
			
			// set deferred items
			dd.deferreds.animDrop = [$.Deferred(), $.Deferred()];
			
			// in/new item
			if ( newItem != undefined ) {
				window.ddGM.anims[animName].animIn.call(dd, dd.deferreds.animDrop[0], newItem);
			} else {
				dd.deferreds.animDrop[0].resolve();
			};
			
			// out/prev item
			if ( prevItem != undefined ) {
				window.ddGM.anims[animName].animOut.call(dd, dd.deferreds.animDrop[1], prevItem);
			} else {
				dd.deferreds.animDrop[1].resolve();
			};
			
			// resolve on animation complete
			$.when(dd.deferreds.animDrop[0], dd.deferreds.animDrop[1]).done(animComplete.resolve);
			
			// return control to script
			dfd.resolve();
		},
		
		// ANIMATE IN
		animIn : function(comp, item) {
			var dd = this,
				end = {},
				start = {};
			
			item.css({
				'z-index':dd.layers.stageTop,
				'display':'block',
				'opacity':0
			});
			
			// resizable item?
			if (dd.items[dd.states.clicked].resizable) {
				
				end.w = item.width();
				end.h = item.height();
				end.x = parseInt(item.css('left'));
				end.y = parseInt(item.css('top'));
				
				start.w = end.w * dd.opt.animations[animName].scale;
				start.h = end.h * dd.opt.animations[animName].scale;
				start.x = end.x - Math.ceil((start.w - end.w)/2);
				start.y = end.y - Math.ceil((start.h - end.h)/2);
				
				item.css({
					'width': start.w,
					'height': start.h,
					'left': start.x,
					'top': start.y
				}).animate({
					'width': end.w,
					'height': end.h,
					'left': end.x,
					'top': end.y,
					'opacity': 1
				}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingIn, comp.resolve); 
				
			// not resizeable? just fade
			} else {
				item.animate({'opacity':1}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingIn, comp.resolve);
			};
		},
		
		// ANIMATE OUT
		animOut : function(comp, item) {
			var dd = this;
			item.css({'z-index':dd.layers.stageBottom}).animate({'opacity':0}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingOut, comp.resolve);
		}
		
		
	};
	
	// load module
	if ( window.ddGM == undefined ) { window.ddGM = {}; };
	if ( window.ddGM.anims == undefined ) { $.extend(window.ddGM, {anims:{}}); };
	window.ddGM.anims[animName] = animation;
})();