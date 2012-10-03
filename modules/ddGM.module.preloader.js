/* /////////////////////////////////////////////////////
 * Preloader module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'preloader',
	
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			this.registerEvent('loadEnd', moduleName, 'preload');
			dfd.resolve();
		},
		
		////////////////////////////////
		// PRELOAD OBJECTS ONTO STAGE //
		////////////////////////////////
		preload : function(dfd) { dfd.resolve();
			var dd = this,
				FUNC = [];
				
			// loop through items
			for (i=0; i<dd.itemList.length; i++){
				
				(function(i){
					var obj = dd.items[dd.itemList[i]];
					
					// build function pipe
					// step 1: add item to stage
					FUNC.push(function(d){
						if ( dd.obj.stage.find('.'+obj.id).length < 1 ) {
							window.ddGM.types[obj.type].loader.call(dd, d, obj, dd.obj.stage);
						} else {
							d.resolve();
						}
					});
					
					// step 2: hide item
					FUNC.push(function(d){
						if ( obj.id != dd.states.current ) {
							dd.obj.stage.find('.'+obj.id).css({display:'none'});
						};
						d.resolve();
					});
					
				})(i);
				
			};
			
			// run pipe
			dd.runPipe.call(dd, null, 'preloader', FUNC);
						
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();