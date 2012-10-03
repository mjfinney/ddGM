/* /////////////////////////////////////////////////////
 * iFrame Type Loader for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var typeName = 'iframe',
	
	type = {
		
		// INITIALIZE
		initialize : function(dfd) { dfd.resolve(); },
		
		// SELECTOR
		selector : function(item, obj) {
			var dd = this;
			
			// Method 1: Inline iFrame
			if ( item.is('iframe') ) {
				obj.src = item.attr('src');
				obj.thumb = item.data('thumb')||'';
				obj.title = item.attr('title');
				obj.caption = obj.title;
				
			// Method 2: Full Features
			} else if ( item.is('ul') && item.data('type')=='iframe' ) {
				obj.src = item.children('[data-item="content"]').children('iframe').attr('src');
				obj.thumb = item.data('thumb')||'';
				obj.title = item.children('[data-item="content"]').children('iframe').attr('title');
				obj.caption = item.children('[data-item="caption"]').length>0
					? item.children('[data-item="caption"]').html()
					: obj.title;
				obj.extended = (item.children('[data-item="extended"]').length>0)
					? item.children('[data-item="extended"]').html()
					: '';
					
			// Method 3: Quick Loader
			} else if ( item.is('div') && item.data('type')=='iframe' ) {
				obj.src = item.data('src');
				obj.thumb = item.data('thumb')||'';
				obj.title = item.data('title')||'';
				obj.cap = item.data('caption')==undefined ? obj.title : item.data('caption');
			
			// UNSUPPORTED ITEM	
			} else {
				return false;
			}
			
			// build object
			return window.ddGM.types[typeName].builder.call(dd, obj);

		},
		
		
		// BUILDER
		builder : function (obj) {
			var dd = this;
			
			// build content
			obj.content+= '<div data-type="'+typeName+'" class="ddGM-item '+obj.id+'" style="position:absolute;width:100%;height:100%;overflow:auto;top:0;left:0;">';
			obj.content+= 	'<iframe allowfullscreen scrolling="auto" style="border:none;width:100%;height:100%;margin-bottom:-5px;" src="'+obj.src+'"></iframe>';
			obj.content+= '</div>';
			
			// add item
			return dd.addItem(obj);
			
		},				
				
		
		// LOADER
		loader : function(dfd, obj, parent) {
			parent.append(obj.content).ready(function(){
				dfd.resolve();
			});
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.types ) { $.extend(window.ddGM, {types:{}}); };
	window.ddGM.types[typeName] = type;
})();