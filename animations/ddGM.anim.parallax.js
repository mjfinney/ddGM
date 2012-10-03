/* /////////////////////////////////////////////////////
 * Parallax Animation for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var animName = 'parallax',
	
		defaultOptions = {
			tiles : [], // list of images
			type : 'horizontal', // or vertical or random
			reverse : false, // move in the opposite direction? or "random"
			speed : 1500,
			follow : 12
		},
	
	animation = {
		
		// INITIALIZE
		initialize : function(dfd) {
			var dd = this;
			
			// read options
			dd.opt.animations[animName] = $.extend(defaultOptions, this.opt.animations[animName]);
			
			// template
			tpl = '<div class="ddGM-parallax" style="position:absolute;top:0;left:0;width:100%;height:100%">';
			
			// add parent wrapper
			dd.obj.stage.prepend(tpl).ready(function(){
				
				// save reference and set layer
				dd.obj.parallaxWrap = dd.obj.stage.find('.ddGM-parallax');
				dd.obj.parallaxWrap.css({'z-index':dd.layers.stage});
				
				// is there at least 1 layer?
				if ( dd.opt.animations[animName].tiles.length > 0 ) {
					
					// generate parallax layers
					$.each(dd.opt.animations[animName].tiles, function(i,v){
						dd.obj.parallaxWrap.append(tpl).children().eq(-1).css({
							background: 'url('+v+') 0 0 repeat',
							zIndex: i
						}).data('x',0).data('y',0);
					});
					
					// save references
					dd.obj.parallax = dd.obj.parallaxWrap.children();
					
					// set animation scale
					dd.states.parallaxScale = 1/(dd.obj.parallax.length+1);
					
				};
				
				dd.registerEvent('loadEnd', animName, 'setLayers', 'animation');
				
				// resolve
				dfd.resolve();
			
			});
		},
		
		setLayers : function(dfd) {
			var dd = this;
			dd.obj.stage.find('.ddGM-item').css({zIndex:dd.layers.stageBottom});
			dfd.resolve();
		},
		
		// MAIN ANIMATION FUNCTION
		animate : function(dfd, animComplete, newItem, prevItem, dir) {
			var dd = this,
				
				// set type
				typeList = ['horizontal','vertical'],
				type = ( dd.opt.animations[animName].type=='random' ) ? typeList[Math.round(Math.random()*typeList.length)-1] : dd.opt.animations[animName].type;
			
			// set layers
			newItem.css({'z-index':dd.layers.stageBottom, display:'none'});
			prevItem.css({'z-index':dd.layers.stageBottom});
			
			// set deferred items
			dd.deferreds.animParallax = [$.Deferred(), $.Deferred()];
			
			// set direction
			dir = (dd.opt.animations[animName].reverse=='random') ? Math.round(Math.random()) : dd.opt.animations[animName].reverse ? !dir : dir;
			
			// animate layers
			dd.obj.parallax.each(function(i){
				var me = $(this),
					
					// calculate motion value for this layer
					xScale = (dd.states.parallaxScale * (i+1) * dd.obj.stage.width() * (dir?-1:1)),
					yScale = (dd.states.parallaxScale * (i+1) * dd.obj.stage.height() * (dir?-1:1)),
					
					// save original position
					xOrig = me.data('x'),
					yOrig = me.data('y');
					
				// scroll type?
				if ( type=='horizontal' ) { yScale = 0; } else { xScale = 0; };
						
				// store new values
				me.data('x', xOrig + xScale);
				me.data('y', yOrig + yScale);
				
				// animate background
				me.stop(1,0).animate({
					backgroundPositionX: (xOrig+xScale)+'px',
					backgroundPositionY: (yOrig+yScale)+'px'
				}, dd.opt.animations[animName].speed, 'linear');	
									
			});
			
			// in/new item
			if ( newItem != undefined ) {
				// wait for slide out
				clearTimeout(dd.timers.parallax);
				dd.timers.parallax = setTimeout(function(){
					window.ddGM.anims[animName].animIn.call(dd, dd.deferreds.animParallax[0], newItem, type, dir);
				}, dd.opt.animations[animName].speed/dd.opt.animations[animName].follow);
			} else {
				dd.deferreds.animPush[0].resolve();
			};
			
			// out/prev item
			if ( prevItem != undefined ) {
				window.ddGM.anims[animName].animOut.call(dd, dd.deferreds.animParallax[1], prevItem, type, dir);
			} else {
				dd.deferreds.animParallax[1].resolve();
			};
			
			// resolve on animation complete
			$.when(dd.deferreds.animParallax[0], dd.deferreds.animParallax[1]).done(animComplete.resolve);
			
			// return control to script
			dfd.resolve();
		},
		
		// ANIMATE IN
		animIn : function(comp, item, type, dir) {
			var dd = this,
				start,
				s = { w: dd.obj.stage.width(), h: dd.obj.stage.height()},
				i = { w: item.width(), h: item.height(), x: parseInt(item.css('left'),10), y: parseInt(item.css('top'),10) },
				speed = (dd.opt.animations[animName].speed/dd.opt.animations[animName].follow)*(dd.opt.animations[animName].follow-1);
			
			// if scrolling horizontally
			if ( type == 'horizontal' ) {
				
				// set starting position
				start = dir ? ((i.w > s.w) ? s.w : (s.w + i.x)) : ( (i.w > s.w) ? (i.w * -1) : (i.x - s.w) );
				item.css({
					'left':start,
					'display':'block'
				}).animate({'left':i.x}, speed, 'linear', comp.resolve);
			
			} else {
				start = dir ? (s.h + i.y) : ( (i.y > s.h) ? (i.h * -1) : (i.y - s.h) );
				item.css({
					'top':start,
					'display':'block'
				}).animate({'top':i.y}, speed, 'linear', comp.resolve);
			
			};

		},
		
		// ANIMATE OUT
		animOut : function(comp, item, type, dir) {
			var dd = this,
				end,
				s = { w: dd.obj.stage.width(), h: dd.obj.stage.height()},
				i = { w: item.width(), h: item.height(), x: parseInt(item.css('left'),10), y: parseInt(item.css('top'),10) },
				speed = (dd.opt.animations[animName].speed/dd.opt.animations[animName].follow)*(dd.opt.animations[animName].follow-1);
			
			// if scrolling horizontally
			if ( type == 'horizontal' ) {
				
				// set starting position
				end = !dir ? ((i.w > s.w) ? s.w : (s.w + i.x)) : ( (i.w > s.w) ? (i.w * -1) : (i.x - s.w) );
				item.css({'left':i.x}).animate({'left':end}, speed, 'linear', function(){
					$(this).css({'left':i.x,'opacity':0});
					comp.resolve();
				});
				
			} else {
				end = !dir ? ((i.h > s.h) ? s.h : (s.h + i.y)) : ( (i.y > s.h) ? (i.h * -1) : (i.y - s.h) );
				item.css({'top':i.y}).animate({'top':end}, speed, 'linear', function(){
					$(this).css({'top':i.y,'opacity':0});
					comp.resolve();
				});
			
			};			
		}
		
		
	};
	
	// load module
	if ( window.ddGM == undefined ) { window.ddGM = {}; };
	if ( window.ddGM.anims == undefined ) { $.extend(window.ddGM, {anims:{}}); };
	window.ddGM.anims[animName] = animation;
})();