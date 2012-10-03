/* /////////////////////////////////////////////////////
 * img Type Loader for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var typeName = 'img',
	
	type = {
		
		// INITIALIZE
		initialize : function(dfd) { dfd.resolve(); },
		
		// SELECTOR
		selector : function(item, obj) {
			var dd = this,
				img, e;
			
			// Method 1: inline image
			if ( item.is('img') ) {
				obj.src = item.attr('src');
				obj.thumb = obj.src;
				obj.title = item.attr('alt');
				obj.caption = obj.title;
			
			// Method 2 & 3: Linked & Clickable images
			} else if ( item.is('a') && item.children('img').length>0 ) {
				img = item.children('img');
				e = item.attr('href').match(/.*\.(jpg|jpeg|gif|png)(?:$|\?)/i) || [,false];
				
				obj.title = img.attr('alt');
				obj.caption = obj.title;

				// linked image
				if ( item.data('type')!='link' && (e[1]=='jpg' || e[1]=='jpeg' || e[1]=='gif' || e[1]=='png') ) {
					obj.src = item.attr('href');
					obj.thumb = img.attr('src');
					
				// clickable image
				} else if ( item.data('type')!='img' ) {
					obj.src = img.attr('src');
					obj.thumb = obj.src;
					obj.link = item.attr('href');
					obj.target = item.attr('target');
				};
			
			// Method 4: Full Features
			} else if ( item.is('ul') && item.data('type')=='img' ) {
				obj.src = item.children('[data-item="content"]').children('img').length>0
					? item.children('[data-item="content"]').children('img').attr('src')
					: item.children('[data-item="content"]').children('a').children('img').attr('src');
					
				obj.thumb = item.data('thumb')==undefined ? obj.src : item.data('thumb');
				
				obj.title = item.children('[data-item="content"]').children('img').length>0
					? item.children('[data-item="content"]').children('img').attr('src')
					: item.children('[data-item="content"]').children('a').children('img').attr('alt');
				
				obj.caption = (item.children('[data-item="caption"]').length>0)
					? item.children('[data-item="caption"]').html()
					: obj.title;
				
				obj.link = item.children('[data-item="content"]').children('a').length>0
					? item.children('[data-item="content"]').children('a').attr('href')
					: '';
				
				obj.target = item.children('[data-item="content"]').children('a').length>0
					? item.children('[data-item="content"]').children('a').attr('target')
					: '';
					
				obj.extended = (item.children('[data-item="extended"]').length>0)
					? item.children('[data-item="extended"]').html()
					: '';
			
			// Method 5: Quick Loader
			} else if ( item.is('div') && item.data('type')=='img' ) {
				obj.src = item.data('src');
				obj.thumb = item.data('thumb')==undefined ? obj.src : item.data('thumb');
				obj.title = item.data('title');
				obj.caption = item.data('caption')==undefined ? obj.title : item.data('caption');
				obj.link = item.data('link')||'';
				obj.target = item.data('target')||'';
			
			// UNSUPPORTED ITEM
			} else {
				return false;
			};
			
			// build object
			return window.ddGM.types[typeName].builder.call(dd, obj);
			
		},
		
		
		// BUILDER
		builder : function (obj) {
			var dd = this;
			
			// build content
			obj.content += obj.link ? '<a href="'+obj.link+'" target="'+obj.target+'">' : '';
			obj.content += '<img src="" data-type="'+typeName+'" class="ddGM-item '+obj.id+'" alt="'+obj.title+'" style=";position:absolute;left:0;top:0;" />';
			obj.content += obj.link ? '</a>' : '';
			
			// set extra vars
			obj.resizable = true;
			
			// add object
			return dd.addItem(obj);

		},
		
		
		// LOADER
		loader : function(dfd, obj, parent) {
			parent.append(obj.content).ready(function(){
				parent.find('.'+obj.id).css({display:'none'}).on('load',function(){
					$(this).off('load');
					dfd.resolve();
				}).attr('src', obj.src);
			});
		}
		
	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.types ) { $.extend(window.ddGM, {types:{}}); };
	window.ddGM.types[typeName] = type;
})();