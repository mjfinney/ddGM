/* /////////////////////////////////////////////////////
 * Lift Animation for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var animName = 'lift',
	
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
			dd.opt.animations[animName] = $.extend(defaultOptions, this.opt.animations[animName]);
			
			// easing sanity check
			dd.opt.animations[animName].easingIn = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingIn : dd.opt.animations[animName].easing;
			dd.opt.animations[animName].easingOut = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingOut : dd.opt.animations[animName].easing;
			
			dfd.resolve();
		},
		
		// MAIN ANIMATION FUNCTION
		animate : function(dfd, animComplete, newItem, prevItem, dir) {
			var dd = this;
			
			// set deferred items
			dd.deferreds.animLift = [$.Deferred(), $.Deferred()];
			
			// in/new item
			if ( newItem != undefined ) {
				window.ddGM.anims[animName].animIn.call(dd, dd.deferreds.animLift[0], newItem);
			} else {
				dd.deferreds.animLift[0].resolve();
			};
			
			// out/prev item
			if ( prevItem != undefined ) {
				window.ddGM.anims[animName].animOut.call(dd, dd.deferreds.animLift[1], prevItem);
			} else {
				dd.deferreds.animLift[1].resolve();
			};
			
			// resolve on animation complete
			$.when(dd.deferreds.animLift[0], dd.deferreds.animLift[1]).done(animComplete.resolve);
			
			// return control to script
			dfd.resolve();
		},
		
		// ANIMATE IN
		animIn : function(comp, item) {
			var dd = this;
			item.css({
				'display':'block',
				'opacity':0
			}).animate({'opacity':1}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingIn, comp.resolve);
		},
		
		// ANIMATE OUT
		animOut : function(comp, item) {
			var dd = this,
				end = {},
				start = {};
			
			item.css({
				'z-index':dd.layers.stageTop,
				'display':'block'
			});
			
			// resizable item?
			if (dd.items[dd.states.current].resizable) {
				
				start.w = item.width();
				start.h = item.height();
				start.x = parseInt(item.css('left'));
				start.y = parseInt(item.css('top'));
				
				end.w = start.w * dd.opt.animations[animName].scale;
				end.h = start.h * dd.opt.animations[animName].scale;
				end.x = start.x - Math.ceil((end.w - start.w)/2);
				end.y = start.y - Math.ceil((end.h - start.h)/2);
				
				item.animate({
					'width': end.w,
					'height': end.h,
					'left': end.x,
					'top': end.y,
					'opacity': 0
				}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingOut, function(){
					$(this).css({
						'width': start.w,
						'height': start.h,
						'left': start.x,
						'top': start.y
					});
					comp.resolve();
				});
				
			// not resizeable? just fade
			} else {
				item.animate({'opacity':1}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingOut, comp.resolve);
			};			
		}
		
		
	};
	
	// load module
	if ( window.ddGM == undefined ) { window.ddGM = {}; };
	if ( window.ddGM.anims == undefined ) { $.extend(window.ddGM, {anims:{}}); };
	window.ddGM.anims[animName] = animation;
})();