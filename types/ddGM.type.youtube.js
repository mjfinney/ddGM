/* /////////////////////////////////////////////////////
 * YouTube Type Loader for ddGM
 * v 1.0 :: 2012-10-02
//////////////////////////////////////////////////////*/
(function(){
	var typeName = 'youtube',
	
		defaultOptions = {
			
			// autoplay the video on initial load?
			// options:
			//   false = no autoplay
			//   true  = autoplay on first load
			//   'always' = autoplay every time video enters stage
			autoPlay : false,
			
			// automatically rotate to the next item on video completion?
			playnext : false,
			
			// if controlTab module is loaded, autoPin on play start
			autoPin : true,
			
			// which YouTube API-generated thumb to use?
			// available options: default, hqdefault, mqdefault, maxresdefault, 0, 1, 2, 3
			APIThumb : 'default',
			
			// pass along any available YouTube API parameters
			APIParams: {}
		
		},
	
	type = {
		
		////////////////
		// INITIALIZE //
		////////////////
		initialize : function(dfd) {
			var dd = this;
			
			// merge default and user settings
			dd.opt.types[typeName] = $.extend(defaultOptions, dd.opt.types[typeName]);
			if ( dd.opt.types[typeName].APIParams.wmode == undefined ) { dd.opt.types[typeName].APIParams.wmode = 'opaque'; };
			
			// YouTube API loaded?
			if ( typeof window.onYouTubeIframeAPIReady != 'function' ) {
				
				// load YouTube API
				$.ajax({
					url: '//www.youtube.com/iframe_api',
					type: 'GET',
					dataType: 'script'
				});
				
				// register events
				dd.registerEvent('postAnim', typeName, 'changeItem', 'type');
				if ( dd.opt.types[typeName].autoPlay || dd.opt.types[typeName].playnext ) {
					dd.registerEvent('changeEnd', typeName, 'autoPlay', 'type');
				};
				
				// resolve after load
				window.onYouTubeIframeAPIReady = function(){
					dfd.resolve();
				};
			
			// already loaded
			} else {
				dfd.resolve();
			};
			
		},

		////////////////////////
		// SELECTOR FUNCTIONS //
		////////////////////////
		selector : function(item, obj) {
			var dd = this,
				title, cap;
				
			// Method 1 & 2: iFrame OR Quick Loader
			if ( item.is('iframe') || (item.is('div') && item.data('type')=='youtube') ) {
				
				// set video id
				obj.video = item.is('iframe')
					? window.ddGM.types[typeName].setVideo.call(dd, item.attr('src'))
					: item.data('video');
				
				// Valid YouTube link?
				if ( obj.video ) {
				
					// set thumb
					obj.thumb = window.ddGM.types[typeName].setThumb.call(dd, item.data('thumb'), obj.video);
					
					// set title/caption
					title = item.attr('title')==undefined
						? item.data('title')
						: item.attr('title');
						
					window.ddGM.types[typeName].setText.call(dd, {title:title,cap:item.data('caption')}, obj);
					
				// invalid youtube link = unsupported
				} else {
					return false;
				};
				
				
			// Method 2: Full Features
			} else if ( item.is('ul') && item.data('type')=='youtube' ) {
				
				// set video id
				obj.video = window.ddGM.types[typeName].setVideo.call(dd, item.children('[data-item="content"]').children('iframe').attr('src'));
				
				// valid YouTube link?
				if ( obj.video ) {
					
					// set extended content
					obj.extended = (item.children('[data-item="extended"]').length>0)
						? item.children('[data-item="extended"]').html()
						: '';
					
					// set thumb
					obj.thumb = window.ddGM.types[typeName].setThumb.call(dd, item.data('thumb'), obj.video);
		
					// set title
					cap = (item.children('[data-item="caption"]').length>0)
						? item.children('[data-item="caption"]').html()
						: '';
					title = item.children('[data-item="content"]').children('iframe').attr('title')||'';
					
					window.ddGM.types[typeName].setText.call(dd, {title:title,cap:cap}, obj);
					
				// invalid youtube link = unsupported
				} else {
					return false;
				};
			
			// UNSUPPORTED ITEM
			} else {
				return false;
			};
			
			// return control to script
			return true;
			
		},
		setVideo : function(src) {
			var m = src.match(/(?:http\:|)\/\/(?:www\.|)(youtube)\.co(?:m|\.[a-zA-Z]{2}|)\/.*(?:v=|video\/|embed\/)(.{11})/i) || ['','',''];
			if (m[1].toLowerCase() == 'youtube') {
				return m[2];
			} else {
				return false;
			};
		},
		setThumb : function(thumb, video) {
			var dd = this,
				ytThumbs = ['default', 'hqdefault', 'mqdefault', 'maxresdefault', '0', '1', '2', '3'];
			
			// no custom thumb?
			if ( thumb==undefined ) {
				 return '//img.youtube.com/vi/'+video+'/'+dd.opt.types[typeName].APIThumb+'.jpg';

			// custom setting for YT thumb?
			} else if ( $.inArray(thumb.toString(), ytThumbs)>=0 ) {
				return '//img.youtube.com/vi/'+video+'/'+thumb+'.jpg';
				
			// link to custom thumb
			} else {
				return thumb||'';
			};
		
		},
		setText : function(text, obj){
			var dd = this,
				setText = function(t){
					obj.title = text.title ? text.title : t;
					obj.caption = text.cap ? text.cap : t;
					window.ddGM.types[typeName].builder.call(dd, obj);
				};
			
			// do we need to pull data from YouTube?
			if ( text.title==undefined || text.cap==undefined ) {
				$.ajax({
					url: 'https://gdata.youtube.com/feeds/api/videos/'+obj.video,
					data: {v:2, alt:'json', fields: 'title'},
					dataType: 'json',
					success: function(data){ setText(data.entry.title.$t); },
					error: function(){ setText(''); }
				});
				
			// both title & caption overridden by user
			} else {
				setText('');
			};
			
		},
		
		/////////////
		// BUILDER //
		/////////////
		builder : function (obj) {
			var dd = this;
			
			// build content
			obj.content += '<div data-type="'+typeName+'" class="ddGM-item '+obj.id+'" style="position:absolute;width:100%;height:100%;top:0;left:0;">';
			obj.content += 	'<div id="'+obj.id+'-youtube"></div>';
			obj.content += '</div>';
			
			// add item
			dd.addItem(obj);
		},
		
		////////////
		// LOADER //
		////////////
		loader : function(dfd, obj, parent) {
			var dd = this,
				id = obj.id;
			
			// add div
			parent.append(obj.content).ready(function(){
				dd.items[id].youtube = new window['YT'].Player(id+'-youtube', {
					height: "100%",
					width: "100%",
					videoId: obj.video,
					playerVars: dd.opt.types[typeName].APIParams,
					events: {
						onReady: function(e){
							dd.items[id].youtubeReady = true;
						},
						onStateChange: function(e){
							window.ddGM.types[typeName].playerChange.call(dd, e, id);
						}
					}
				});
				dfd.resolve();
			});
		},
		
		///////////////////////
		// SUPPORT FUNCTIONS //
		///////////////////////
		playerChange: function(e, id) {
			var dd = this;
			
			switch (e.data) {
				
				// PLAYING / BUFFERING
				case window['YT'].PlayerState.BUFFERING:
				case window['YT'].PlayerState.PLAYING:
					
					// pause rotation
					dd.pause.call(dd, 'youtube');
					if ( dd.opt.types[typeName].playnext ) { dd.play.call(dd, 'youtubePlaynext'); };
					
					// clear delay timer
					clearTimeout(dd.timers.youtubeDelay);
					dd.timers.youtubeDelay = false;
							
					// pin controls?
					if ( dd.states.controlTab && dd.opt.types[typeName].autoPin ) {
						window.ddGM.modules.controlTab.pin.call(dd, 'youtube');
						if ( dd.opt.types[typeName].playnext ) { window.ddGM.modules.controlTab.unpin.call(dd, 'youtubePlaynext'); };
					};
					
					// reset states
					dd.items[dd.states.current].youtubeStarted = true;
					dd.states.youtubeEnded = false;
					
					break;
				
				// PAUSED
				case window['YT'].PlayerState.PAUSED :
					
					// delay with timer
					if (!dd.timers.youtubeDelay) {
						dd.timers.youtubeDelay = setTimeout(function(){
							dd.timers.youtubeDelay = false;
															
							// unpin controls?
							if ( dd.states.controlTab && dd.opt.types[typeName].autoPin ) {
								window.ddGM.modules.controlTab.unpin.call(dd, 'youtube');
							};
							// restart gallery rotation
							dd.play.call(dd, 'youtube');
														
						}, 500);
					};
					break;
					
				// ENDED
				case window['YT'].PlayerState.ENDED :
					dd.states.youtubeEnded = true;
					
					// clear delay timer
					clearTimeout(dd.timers.youtubeDelay);
					dd.timers.youtubeDelay = false;
					
					// unpin controls?
					if ( dd.states.controlTab && dd.opt.types[typeName].autoPin ) {
						window.ddGM.modules.controlTab.unpin.call(dd, 'youtube');
					};
					
					// restart gallery rotation
					dd.play.call(dd, 'youtube');
							
					// rotate immediately if playnext
					if ( dd.opt.types[typeName].playnext ) {
						
						// keep controls pinned?
						if ( dd.states.controlTab && dd.opt.types[typeName].autoPin ) {
							window.ddGM.modules.controlTab.pin.call(dd, 'youtubePlaynext');
						};
						dd.pause.call(dd, 'youtubePlaynext');
						dd.rotateItems.call(dd, true);
					};				
					break;
			
			};
		},
		
		////////////////////////
		// PLAYBACK FUNCTIONS //
		////////////////////////
		
		// AUTOPLAY & PLAYLIST
		autoPlay : function(dfd) {
			var dd = this,
				obj = dd.items[dd.states.current],
				myFunc = function(){
					
					// play video? (autoplay always OR autoplay on 1st time OR playnext true and previous video ended)
					if ( dd.opt.types[typeName].autoPlay=='always' || (dd.opt.types[typeName].autoPlay && !obj.youtubeStarted) || (dd.opt.types[typeName].playnext && dd.states.youtubeEnded) ) {
					
						// if playnexting, reset track to start, and remove holdover pin
						if (dd.opt.types[typeName].playnext && dd.states.youtubeEnded) {
							obj.youtube.seekTo(0,true);
						};
						
						// play video
						window.ddGM.types[typeName].play.call(dd, dd.states.current);
						
						// reset state
						dd.states.youtubeEnded = false;
						
					};
					
					// return
					dfd.resolve();
				};
				
			// only process youtube items
			if ( obj.type != 'youtube' ) {
				dfd.resolve();
				return;
			};
			
				
			// video already loaded?
			if ( obj.youtubeReady ) {
				myFunc();
			
			// wait for load
			} else {
			
				// keep testing for video loaded
				dd.timers.youtubeLoading = setInterval(function(){
					
					// video is ready
					if ( obj.youtubeReady ) {
					
						// stop interval timer
						clearInterval(dd.timers.youtubeLoading);
						
						// play state
						myFunc();
					};
				}, 100);
			};
			
		},
		
		// PAUSE ALL VIDEOS (on item change)
		changeItem: function(dfd){
			var dd = this;
			
			// pause all youtube videos
			$.each(dd.items, function(id,v){
				window.ddGM.types[typeName].pause.call(dd, id);
			});
			
			if ( dfd!=null ) { dfd.resolve(); };
		},
		
		// PLAY
		play : function(id) {
			var dd = this,
				obj = dd.items[id];
			
			// is this a loaded video?
			if ( obj.youtubeReady ) {
				
				// play
				obj.youtube.playVideo();
									
			};
		},
		
		// PAUSE
		pause : function(id) {
			var dd = this,
				obj = dd.items[id];
			
			// is this a loaded video?
			if ( obj.youtubeReady ) {
				
				// pause
				obj.youtube.pauseVideo();
			};
		}

	};
	
	// load module
	if ( !window.ddGM ) { window.ddGM = {}; };
	if ( !window.ddGM.types ) { $.extend(window.ddGM, {types:{}}); };
	window.ddGM.types[typeName] = type;
})();
