/* /////////////////////////////////////////////////////
 * Wipe Animation for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var animName = 'wipe',
	
		defaultOptions = {
			type : 'horizontal', // or vertical or random
			reverse : false, // move in the opposite direction? or "random"
			speed : 1250,
			easing : undefined,
			easingIn : 'swing',
			easingOut : 'swing'
		},
	
	animation = {
		
		// INITIALIZE
		initialize : function(dfd) {
			var dd = this;
			
			// read options
			dd.opt.animations[animName] = $.extend(defaultOptions, this.opt.animations[animName]);
			
			// easing sanity check
			dd.opt.animations[animName].easingIn = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingIn : dd.opt.animations[animName].easing;
			dd.opt.animations[animName].easingOut = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingOut : dd.opt.animations[animName].easing;
			
			// return control to ddGM
			dfd.resolve();
		},
		
		// MAIN ANIMATION FUNCTION
		animate : function(dfd, animComplete, newItem, prevItem, dir) {
			var dd = this;
			
			// set layers
			newItem.css({'z-index':dd.layers.stageBottom});
			prevItem.css({'z-index':dd.layers.stageTop});
			
			// out/prev item
			if ( prevItem != undefined ) {
				window.ddGM.anims[animName].animOut.call(dd, animComplete, prevItem, dir);
			} else {
				outComp.resolve();
			};
			
			// return control to script
			dfd.resolve();
		},
		
		// ANIMATE OUT
		animOut : function(comp, item, dir) {
			var dd = this;
			
			// set direction
			dir = (dd.opt.animations[animName].reverse=='random') ? Math.round(Math.random()) : dd.opt.animations[animName].reverse ? !dir : dir;
					
			// wrap item
			item.wrap('<div class="ddGM-anim-wipe-wrapper" />').ready(function(){
				var i = item.parent(),
					wS = item.css('width'),
					hS = item.css('height'),
					tS = item.css('top'),
					lS = item.css('left'),
					w = item.width(),
					h = item.height(),
					animVal, right, bottom;
					
				// set values on wrapper
				i.css({
					width: w,
					height: h,
					overflow: 'hidden',
					position: 'absolute',
					top: tS,
					left: lS,
					boxShadow: item.css('box-shadow')
				});
				
				// set values on item
				item.css({width: w, height: h, top: 0, left: 0});
				
				// horizontal animation
				if ( dd.opt.animations[animName].type=='horizontal') {
					animVal = {width: 0};
					
					// left to right
					if (!dir) {
						right = dd.obj.stage.width() - item.width() - parseInt(lS,10);
						i.css({left: '', right: right});
						item.css({left: '', right: 0});
					};
				
				// vertical animation
				} else {
					animVal = {height: 0};
					
					// top to bottom
					if (!dir) {
						bottom = dd.obj.stage.height() - item.height() - parseInt(tS,10);
						i.css({top: '', bottom: bottom});
						item.css({top: '', bottom: 0});
					};
					
				};
				
				// animate and clean up
				i.animate(animVal, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingOut, function(){
					item.unwrap().css({
						width: wS,
						height: hS,
						bottom: '',
						right: '',
						top: tS,
						left: lS
					});
					comp.resolve()
				});
			});
		}
		
		
	};
	
	// load module
	if ( window.ddGM == undefined ) { window.ddGM = {}; };
	if ( window.ddGM.anims == undefined ) { $.extend(window.ddGM, {anims:{}}); };
	window.ddGM.anims[animName] = animation;
})();