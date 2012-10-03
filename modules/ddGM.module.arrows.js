/* /////////////////////////////////////////////////////
 * Arrows module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'arrows',
	
		defaultOptions = {
			hide : true,
			speed : 200
		},
	
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			var dd = this,
				tpl='';
				
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);

			// template
			tpl+= '<div class="ddGM-arrow-wrap ddGM-arrow-wrap-left" style="position: absolute; display:block; overflow:hidden;">';
			tpl+= 	'<a class="ddGM-arrow ddGM-arrow-left" style="display:block; overflow:hidden;" href="">';
			tpl+= 		'<span style="position:absolute; width:0; height:0;" />';
			tpl+= 	'</a>';
			tpl+= '</div>';
			tpl+= '<div class="ddGM-arrow-wrap ddGM-arrow-wrap-right" style="position: absolute; display:block; overflow:hidden;">';
			tpl+= 	'<a class="ddGM-arrow ddGM-arrow-right" style="display:block; overflow:hidden;" href="">';
			tpl+= 		'<span style="position:absolute; width:0; height:0;" />';
			tpl+= 	'</a>';
			tpl+= '</div>';
			
			// add arrows to gallery
			dd.gal.append(tpl).ready(function(){
				
				// store item references
				dd.obj.arrows = dd.gal.find('.ddGM-arrow-wrap');
				dd.states.arrowWidth = dd.obj.arrows.width();
				
				// add to appropriate layer
				dd.obj.arrows.css({'z-index':dd.layers.controls});
				
				// initialize widths
				if (dd.opt.modules[moduleName].hide) { dd.obj.arrows.css({'width':0}); };
				
				// left arrow click
				dd.gal.on('click', '.ddGM-arrow-left', function(e){
					e.preventDefault();
					if ( !dd.states.changing ) {
						dd.states.navSource = 'left';
						dd.rotateItems.call(dd, false);
					};
				});
				
				// right arrow click
				dd.gal.on('click', '.ddGM-arrow-right', function(e){
					e.preventDefault();
					if ( !dd.states.changing ) {
						dd.states.navSource = 'right';
						dd.rotateItems.call(dd, true);
					};
				});
				
				// register module with events
				dd.registerEvent('mouseIn', moduleName, 'showArrows');
				dd.registerEvent('mouseOut', moduleName, 'hideArrows');
				dd.registerEvent('loadStart', moduleName, 'positionArrows');
				dd.registerEvent('resize', moduleName, 'positionArrows');
				dd.registerEvent('unload', moduleName, 'unload');
				
				dfd.resolve();
			});
		},
		
		/////////////////
		// SHOW ARROWS //
		/////////////////
		showArrows : function(dfd){
			var dd = this;
			dd.obj.arrows.stop(1,0).animate({'width':dd.states.arrowWidth}, dd.opt.modules[moduleName].speed, function(){
					dfd.resolve();
				});
		},
		
		/////////////////
		// HIDE ARROWS //
		/////////////////
		hideArrows : function(dfd){
			var dd = this;
			if (dd.opt.modules[moduleName].hide) {
				dd.obj.arrows.stop(1,0).animate({'width':0}, dd.opt.modules[moduleName].speed, function(){
					dfd.resolve();
				});
			};
		},
		
		////////////////////
		// POSITON ARROWS //
		////////////////////
		positionArrows : function(dfd) {
			var dd = this,
				wH, bW, bH, aW, aH,
				box, top;
			
			// get arrow dimensions
			wH = dd.obj.arrows.height();
			bW = dd.obj.arrows.children('.ddGM-arrow').width();
			bH = dd.obj.arrows.children('.ddGM-arrow').height();
			box = Math.floor( ( (bW > bH) ? bH : bW) * 0.75);
			
			// build arrows
			aW = Math.ceil(box * 0.6); // arrow width
			aH = Math.ceil((aW * 1.1)/2); // arrow height
			
			dd.obj.arrows.find('span').css({
				'top' : Math.floor((bH/2)-(aH)),
				'left' : Math.floor(((bW/2)-(aW/2)-(aW*0.1))),
				'border-left-width' : '0',
				'border-top' : 'solid transparent '+aH+'px',
				'border-bottom' : 'solid transparent '+aH+'px',
				'border-right-style' : 'solid',
				'border-right-width' : aW+'px'
			});
			
			dd.obj.arrows.find('.ddGM-arrow-right span').css({
				'left' : Math.floor(((bW/2)-(aW/2))+(aW*0.1)),
				'border-right' : 'solid 0 transparent',
				'border-left-style' : 'solid',
				'border-left-width' : aW+'px'
			});
			
			// place arrow buttons
			top = Math.floor((dd.obj.stageWrap.height()/2)-(wH/2));		
			dd.obj.arrows.css({'top' : top});
			
			dfd.resolve();
			
		},
		
		////////////
		// UNLOAD //
		////////////
		unload : function(dfd){
			this.obj.arrows.off('click touchend');
			dfd.resolve();
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();