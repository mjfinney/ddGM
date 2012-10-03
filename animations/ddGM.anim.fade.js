/* /////////////////////////////////////////////////////
 * Fade Animation for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var animName = 'fade',
	
		defaultOptions = {
			speed : 1000, // speed of the animation
			cross : false, // crossfade? or 'random'
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
		animate : function(DFD, animComplete, newItem, prevItem, dir) {
			var dd = this, FUNC,
			
				// set crossfade
				cross = (dd.opt.animations[animName].cross=='random')
					? Math.round(Math.random())
					: dd.opt.animations[animName].cross,
					
				// set speed for animations
				speed = cross
					? dd.opt.animations[animName].speed
					: dd.opt.animations[animName].speed/2;
			
			FUNC = [
				// FADE OUT
				function(dfd) {
				
					// hide in/new item
					newItem.css({opacity:0});
					
					// cross fade?
					if (cross) { dfd.resolve(); };
					
					// fade out old
					if ( prevItem != undefined ) {
						window.ddGM.anims[animName].animOut.call(dd, dfd, prevItem, speed);
					} else {
						dfd.resolve();
					};
				},
				
				// FADE IN
				function(dfd){
					dfd.resolve();
					if ( newItem != undefined ) {
						window.ddGM.anims[animName].animIn.call(dd, animComplete, newItem, speed);
					};
				}
			];
			
			// RUN PIPE
			dd.runPipe.call(dd, $.Deferred(), 'animFade', FUNC);
			DFD.resolve();
			
		},
		
		// ANIMATE IN
		animIn : function(comp, item, speed) {
			var dd = this;
			item.css({opacity:0}).animate({opacity:1}, speed, dd.opt.animations[animName].easingOut, comp.resolve);
		},
		
		// ANIMATE OUT
		animOut : function(comp, item, speed) {
			var dd = this;
			item.animate({'opacity':0}, speed, dd.opt.animations[animName].easingOut, comp.resolve);
		}
		
		
	};
	
	// load module
	if ( window.ddGM == undefined ) { window.ddGM = {}; };
	if ( window.ddGM.anims == undefined ) { $.extend(window.ddGM, {anims:{}}); };
	window.ddGM.anims[animName] = animation;
})();