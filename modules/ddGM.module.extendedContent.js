/* /////////////////////////////////////////////////////
 * Extended Content module for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var moduleName = 'extendedContent',
	
		defaultOptions = {
			selectors : '', // the selector(s) to add the extended content to
			speed : 750 // the speed of the content fade in/out
		},
		
	module = {
		
		////////////////////
		// INITIALIZATION //
		////////////////////
		initialize : function(dfd){
			var dd = this,
				tpl;
			
			// merge default and user settings
			dd.opt.modules[moduleName] = $.extend(defaultOptions, dd.opt.modules[moduleName]);
			
			// selectors sanity check
			if (dd.opt.modules[moduleName].selectors == ''){
				dfd.resolve();
				return;
			};
			
			// template for
			tpl = '<div class="ddGM-extended-wrapper"></div>';
			
			// set parents
			wrapParent = $(dd.opt.modules[moduleName].selectors);
			
			// add template to wrappers
			wrapParent.append(tpl).ready(function(){
				
				// add reference to wrap
				dd.obj.ext = wrapParent.children('.ddGM-extended-wrapper');
				
				// register events
				dd.registerEvent('loadEnd', moduleName, 'loadFirst');
				dd.registerEvent('changeStart', moduleName, 'changeContent');
				dd.registerEvent('unload', moduleName, 'unload');
				
				dfd.resolve();
					
			});
		},
		
		loadFirst : function(dfd) { dfd.resolve();
			var dd = this;
			dd.obj.ext.html(dd.items[dd.itemList[dd.opt.startItem]].extended);
		},	
		
		////////////////////
		// CHANGE CONTENT //
		////////////////////
		changeContent : function(dfd) { dfd.resolve();
			var dd = this,
				x = dd.items[dd.states.clicked].extended||'';
				
			// fade out previous caption
			dd.obj.ext.css({'opacity':1}).animate({'opacity':0}, dd.opt.modules[moduleName].speed/2, function(){
				// replace content and animate in new caption
				$(this).html(x).animate({'opacity':1}, dd.opt.modules[moduleName].speed/2);
			});
		},
		
		////////////
		// UNLOAD //
		////////////
		unload : function(dfd) {
			this.obj.ext.remove();
			dfd.resolve();
		}
			
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.modules ) { $.extend(window.ddGM, {modules:{}}); };
	window.ddGM.modules[moduleName] = module;
})();