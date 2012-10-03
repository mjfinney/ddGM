/* /////////////////////////////////////////////////////
 * Dot Navigation module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'dotNav',
	
		defaultOptions = {
			toGallery : true,
			toControl : false,
			selectors : undefined,
			numbers : false
		},
	
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			var dd = this;
				
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);
			
			// register module with events
			dd.registerEvent('loadEnd', moduleName, 'addDots');
			dd.registerEvent('midAnim', moduleName, 'selectDot');
			dd.registerEvent('unload', moduleName, 'unload');
			
			// return
			dfd.resolve();
				
		},
		
		////////////////////////
		// BUILD AND ADD DOTS //
		////////////////////////
		addDots : function(dfd){
			var dd = this;
				parents = $(),
				dots = '';
				
			// add to gallery?
			if ( dd.opt.modules[moduleName].toGallery ) {
				parents = parents.add(dd.gal);
			};
			
			// add to controller?
			if ( dd.opt.modules[moduleName].toControl ) {
				parents = parents.add(dd.obj.control);
			};
			
			// add to other elements?
			if ( dd.opt.modules[moduleName].selectors ) { 
				parents = parents.add(dd.opt.modules[moduleName].selectors);
			};

			// add wrapper to gallery
			parents.append('<div class="ddGM-dotNav-wrapper"></div>').ready(function(){
				var output='',
					i=1;
				
				// store item reference & layer
				dd.obj.dotNavWrap = parents.find('.ddGM-dotNav-wrapper');
				dd.obj.dotNavWrap.css({'z-index':dd.layers.controls});
				
				// build items
				$.each(dd.itemList, function(index, val){
					var number = ( dd.opt.modules[moduleName].numbers ) ? i : '';
					output+='<a href="#" data-item="'+val+'" class="ddGM-dot'+(number?'-numbered':'')+' '+val+'">'+number+'</a>';
					i++;
				});
				
				// add items
				dd.obj.dotNavWrap.append('<div class="ddGM-dotNav">'+output+'</div>').ready(function(){
					
					// register object and set layers
					dd.obj.dotNav = dd.obj.dotNavWrap.children('.ddGM-dotNav');
					dd.obj.dotNav.css({'z-index':dd.layers.controls});
					
					// select first dot
					dd.obj.dotNav.children('.'+dd.itemList[dd.opt.startItem]).addClass('selected');
					
					// listen for clicks
					dd.obj.dotNav.children('a').on('click', function(e){
						e.preventDefault();
						if ( !dd.states.changing ) {
							dd.states.navSource = 'direct';
							dd.changeItem.call(dd, null, $(this).data('item'));
						};
					});
					
					// return
					dfd.resolve();
				});
			});
		},
		
		//////////////////////////
		// SELECT DOT ON CHANGE //
		//////////////////////////
		selectDot : function(dfd){
			var dd = this;
			dd.obj.dotNav.children('a').removeClass('selected');
			dd.obj.dotNav.children('.'+dd.states.clicked||dd.states.current).addClass('selected');
			dfd.resolve();
		},
		
		////////////
		// UNLOAD //
		////////////
		unload : function(dfd) {
			var dd = this;
			dd.obj.dotNav.children('a').off('click');
			dd.obj.dotNav.remove();
			dfd.resolve();
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();