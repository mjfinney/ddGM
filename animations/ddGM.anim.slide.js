/* /////////////////////////////////////////////////////
 * Slide Animation for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var animName = 'slide',
	
		defaultOptions = {
			type : 'horizontal', // or vertical or random
			reverse : false, // move in the opposite direction? or "random"
			speed : 750,
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
			
			// set deferred items
			dd.deferreds.animSlide = [$.Deferred(), $.Deferred()];
			
			// in/new item
			if ( newItem != undefined ) {
				window.ddGM.anims[animName].animIn.call(dd, dd.deferreds.animSlide[0], newItem, dir);
			} else {
				dd.deferreds.animSlide[0].resolve();
			};
			
			// out/prev item
			if ( prevItem != undefined ) {
				window.ddGM.anims[animName].animOut.call(dd, dd.deferreds.animSlide[1], prevItem, dir);
			} else {
				dd.deferreds.animSlide[1].resolve();
			};
			
			// resolve on animation complete
			$.when(dd.deferreds.animSlide[0], dd.deferreds.animSlide[1]).done(animComplete.resolve);
			
			// return control to script
			dfd.resolve();
		},
		
		// ANIMATE IN
		animIn : function(comp, item, dir) {
			var dd = this,
				start,
				type = dd.opt.animations[animName].type,
				typeList = ['horizontal','vertical'],
				s = { w: dd.obj.stage.width(), h: dd.obj.stage.height()},
				i = { w: item.width(), h: item.height(), x: parseInt(item.css('left')), y: parseInt(item.css('top')) };
			
			// reverse direction?
			dir = (dd.opt.animations[animName].reverse=='random') ? Math.round(Math.random()) : dd.opt.animations[animName].reverse ? !dir : dir;
			
			// check type for random
			type = ( type=='random' ) ? typeList[Math.round(Math.random()*typeList.length)-1] : type;
			
			// initialize item	
			item.css({
				'display' : 'block',
				'opacity' : 1,
				'z-index' : dd.layers.stageTop
			});
			
			// if scrolling horizontally
			if ( type == 'horizontal' ) {
				
				// set starting position
				start = dir ? ((i.w > s.w) ? s.w : (s.w + i.x)) : ( (i.w > s.w) ? (i.w * -1) : (i.x - s.w) );
				item.css({
					'left':start
				}).animate({'left':i.x}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingIn, comp.resolve);
			
			} else {
				start = dir ? ((i.h > s.h) ? s.h : (s.h + i.y)) : ( (i.y > s.h) ? (i.h * -1) : (i.y - s.h) );
				item.css({
					'top':start
				}).animate({'top':i.y}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingIn, comp.resolve);
			
			};

		},
		
		// ANIMATE OUT
		animOut : function(comp, item, dir) {
			var dd = this;
			item.css({'z-index':dd.layers.stageBottom}).animate({'opacity':0}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingOut, comp.resolve);				
		}
		
		
	};
	
	// load module
	if ( window.ddGM == undefined ) { window.ddGM = {}; };
	if ( window.ddGM.anims == undefined ) { $.extend(window.ddGM, {anims:{}}); };
	window.ddGM.anims[animName] = animation;
})();