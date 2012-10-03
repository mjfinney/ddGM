/* /////////////////////////////////////////////////////
 * Push Animation for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var animName = 'push',
	
		defaultOptions = {
			type : 'horizontal', // or vertical or random
			reverse : false, // move in opposite direction? or "random"
			speed : 750,
			easing : undefined,
			easingIn : 'swing',
			easingOut : 'swing'
		},
	
	animation = {
		
		// INITIALIZE
		initialize : function(dfd) {
			var dd = this;
			
			// compile options for this animation
			dd.opt.animations[animName] = $.extend(defaultOptions, dd.opt.animations[animName]);
			
			// easing sanity check
			dd.opt.animations[animName].easingIn = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingIn : dd.opt.animations[animName].easing;
			dd.opt.animations[animName].easingOut = ( !dd.opt.animations[animName].easing ) ? dd.opt.animations[animName].easingOut : dd.opt.animations[animName].easing;
			
			// complete
			dfd.resolve();
		},
		
		// MAIN ANIMATION FUNCTION
		animate : function(dfd, animComplete, newItem, prevItem, dir) {
			var dd = this,
			
				// set type
				typeList = ['horizontal','vertical'],
				type = ( dd.opt.animations[animName].type=='random' ) ? typeList[Math.round(Math.random()*typeList.length)-1] : dd.opt.animations[animName].type;
			
			// set deferred items
			dd.deferreds.animPush = [$.Deferred(), $.Deferred()];

			// set direction
			dir = (dd.opt.animations[animName].reverse=='random') ? Math.round(Math.random()) : dd.opt.animations[animName].reverse ? !dir : dir;
			
			// set items
			newItem.css({zIndex:dd.layers.stageTop});
			prevItem.css({zIndex:dd.layers.stageBottom});
			
			// in/new item
			if ( newItem != undefined ) {
				window.ddGM.anims[animName].animIn.call(dd, dd.deferreds.animPush[0], newItem, type, dir);
			} else {
				dd.deferreds.animPush[0].resolve();
			};
			
			// out/prev item
			if ( prevItem != undefined ) {
				window.ddGM.anims[animName].animOut.call(dd, dd.deferreds.animPush[1], prevItem, type, dir);
			} else {
				dd.deferreds.animPush[1].resolve();
			};
			
			// resolve on animation complete
			$.when(dd.deferreds.animPush[0], dd.deferreds.animPush[1]).done(animComplete.resolve);
			
			// return control to script
			dfd.resolve();
		},
		
		// ANIMATE IN
		animIn : function(comp, item, type, dir) {
			var dd = this,
				start,
				s = { w: dd.obj.stage.width(), h: dd.obj.stage.height()},
				i = { w: item.width(), h: item.height(), x: parseInt(item.css('left'),10), y: parseInt(item.css('top'),10) };
			
			// if scrolling horizontally
			if ( type == 'horizontal' ) {
				
				// set starting position
				start = dir ? ((i.w > s.w) ? s.w : (s.w + i.x)) : ( (i.w > s.w) ? (i.w * -1) : (i.x - s.w) );
				item.css({
					'left':start
				}).animate({'left':i.x}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingIn, comp.resolve);
			
			} else {
				start = dir ? (s.h + i.y) : ( (i.y > s.h) ? (i.h * -1) : (i.y - s.h) );
				item.css({
					'top':start
				}).animate({'top':i.y}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingIn, comp.resolve);
			
			};

		},
		
		// ANIMATE OUT
		animOut : function(comp, item, type, dir) {
			var dd = this,
				end,
				s = { w: dd.obj.stage.width(), h: dd.obj.stage.height()},
				i = { w: item.width(), h: item.height(), x: parseInt(item.css('left'),10), y: parseInt(item.css('top'),10) };
			
			// if scrolling horizontally
			if ( type == 'horizontal' ) {
				
				// set starting position
				end = !dir ? ((i.w > s.w) ? s.w : (s.w + i.x)) : ( (i.w > s.w) ? (i.w * -1) : (i.x - s.w) );
				item.css({'left':i.x}).animate({'left':end}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingOut, function(){
					$(this).css({'left':i.x,'opacity':0});
					comp.resolve();
				});
				
			} else {
				end = !dir ? ((i.h > s.h) ? s.h : (s.h + i.y)) : ( (i.y > s.h) ? (i.h * -1) : (i.y - s.h) );
				item.css({'top':i.y}).animate({'top':end}, dd.opt.animations[animName].speed, dd.opt.animations[animName].easingOut, function(){
					$(this).css({'top':i.y,'opacity':0});
					comp.resolve();
				});
			
			};			
		}
		
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.anims ) { $.extend(window.ddGM, {anims:{}}); };
	window.ddGM.anims[animName] = animation;
})();