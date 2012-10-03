/* /////////////////////////////////////////////////////
 * Resizer module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'resizer',
		
		/*
		RESIZE TYPE DESCRIPTIONS:
		
			fit: Items taller and/or wider than the stage are
			     scaled down until they fit inside the stage.
			     If enlarge is enabled, small items are scaled
			     up to the maximum size that fits inside the stage.
		
			fill: All Items are scaled until the entire stage is
			      filled; portions of the item may not be visible.
			      
			stretch: All items are set to the exact width and height
			         of the stage without regard to aspect ratio.
			         
			center: All items are centered on the stage without
			        being resized.
		
		*/
		
		defaultOptions = {
			type : 'fit', // also: fill, stretch, center
			enlarge : true // only affects 'fit' type
		},
	
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			var dd = this;
				
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);

			// register events
			dd.registerEvent('loadEnd', moduleName, 'resize');
			dd.registerEvent('preAnim', moduleName, 'resize');
			dd.registerEvent('resize', moduleName, 'resize');
			
			dfd.resolve();
				
		},
		
		/////////////
		// RESIZER //
		/////////////
		resize : function(dfd){
			var dd = this,
				id, obj, item, o,
				iW, iH, iR,
				sW, sH, sR,
				nW, nH;
			
			id = (dd.states.clicked!='') ? dd.states.clicked : dd.states.current;
			obj = dd.items[id];
			
			// only operate on effects-capable items
			if ( obj.resizable ) {
				
				item = dd.obj.stage.find('.'+obj.id),
				o = item.css('opacity'),
				d = item.css('display');
			
				// initialize item
				item.css({
					'opacity':0,
					'display':'none',
					'width':'',
					'height':''
				});
				
				// get item dimensions
				iW = item.width();
				iH = item.height();
				iR = iW/iH; // width to height ratio
				
				// get stage dimensions
				sW = dd.obj.stage.width();
				sH = dd.obj.stage.height();
				sR = sW/sH; // width to height ratio
				
				//////////////////
				// GET NEW SIZE //
				//////////////////
				if (dd.opt.modules[moduleName].type == 'center') {
					// no resize //
				
				} else if (dd.opt.modules[moduleName].type == 'stretch') {
					iW = sW;
					iH = sH;
				
				// should the image be resized?
				} else if ( ((iH>sH) || (iW>sW)) || (((iH < sH) && (iW < sW)) && dd.opt.modules[moduleName].enlarge) || (((iH < sH) || (iW < sW)) && dd.opt.modules[moduleName].type == 'fill') ) {
					
					// fit: stage ratio > item ratio == set height first  
					// fill: item wide == match stage height
					if ( (sR>iR && dd.opt.modules[moduleName].type=='fit') || (iR>1 && dd.opt.modules[moduleName].type=='fill') ) {
						nH = sH;
						iW = Math.round(iW * (nH/iH));
						iH = nH;
					
					} else {
						nW = sW;
						iH = Math.round(iH * (nW/iW));
						iW = nW;
					};
						
				};
				
				////////////////
				// REPOSITION //
				////////////////
				item.css({
					'left' : Math.ceil((sW/2)-(iW/2)),
					'top' : Math.ceil((sH/2)-(iH/2)),
					'width' : iW,
					'height' : iH,
					'opacity' : o,
					'display' : d
				});
			};
			
			dfd.resolve();
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();