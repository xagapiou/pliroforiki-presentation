$(function() {
	'use scrict';

	remark.highlighter.engine.registerLanguage('γλώσσα', glossa);

	var slideshow = remark.create({
		sourceUrl: 'presentation.md',
	//	ratio: '16:9',
		highlightLanguage: 'γλώσσα',
		highlightLines: true,
		highlightStyle: 'vs'
	});

	setTimeout(function() {
		// Make all links to target to a new window
		$('.remark-slides-area a').each(function() {
			var $this = $(this);
			$this.attr('target', '_blank');
		});
	}, 100);

	slideshow.on('showSlide', function (slide) {
		setTimeout(function() {
			// Clear flowchart markup first
			// Then draw flowchart
			$('.remark-visible .remark-code.flowchart:not(:has(>svg))').each(function () {
				var $this = $(this);
				var html = $this.html();
			//	console.log(html);
				var code = html;
				code = code.replace(/<\/div>/ig, '\n');
				code = code.replace(/<\/?[^>]+>/ig, '');
				code = code.replace(/&lt;/ig, '<');
				code = code.replace(/&gt;/ig, '>');
			//	console.log(code);

				var diagram = flowchart.parse(code);
				$this.html('');
				diagram.drawSVG($this.get(0));
				$this.hide();
				setTimeout(function() {
					$this.find('svg').attr('width', '100%');
					$this.find('svg').attr('height', '98%');
					$this.show();
				}, 100);
			});

			$('.remark-visible .remark-code').each(function () {
				var $this = $(this);
				var el = $this[0];

				var ratio = el.clientHeight / el.scrollHeight;

				// Lower font-size on code elements that have a small overflow ratio
				// so that the scrollbar will go away
				if (ratio >= 0.8) {
					var size = 1;
					while (ratio < 1) {
						size -= 0.01;
						$this.css('font-size', size + 'em');

						ratio = el.clientHeight / el.scrollHeight;
						console.log(ratio);
					}
				} else {
					$this.css({position: 'relative'})
					$icon = $('<span class="expand-icon"/>');
					$this.append($icon);
					$icon.on('click', function() {
						var $this = $(this);
						var $code = $this.closest('.remark-code');

						if ($code.hasClass('expanded')) {
							$code.removeClass('expanded');
							$code.css({position: 'relative'});
						} else {
							$code.addClass('expanded');
							$code.css({position: 'absolute'});
						}
					});
				}

				// Prevent scrolling on overflowing code elements
				var hasHorizontalScrollbar = el.scrollWidth > el.clientWidth;
				var hasVerticalScrollbar = el.scrollHeight > el.clientHeight;

				if (hasHorizontalScrollbar || hasVerticalScrollbar) {
					$this.on('mousewheel', function(event) {
						event.stopPropagation();
					});
				}
			});

			var $contents_list = $current_clide.find('.contents');

			// Build contents list
			if ($contents_list.length === 1 && $contents_list.find('> ul').length === 0) {
				var $list = $('<ul>');

				$contents_list.append($list);
				$contents_list.on('mousewheel', function(event) {
					event.stopPropagation();
				});

				var chapters = [];

				$('h2[id]').each(function(index) {
					if (index < 2) { return; }

					var $this = $(this);
					var text = $this.text();

					var match = $this.attr('id').match(/^(\d+)-(\d+)/);

					if (!match) { return; }

					var chapter = match[0];

					if (chapters.indexOf(chapter) > -1) { return; }

					chapters.push(chapter);

					var $slide = $this.closest('.remark-slide-container');

					$list.append('<li><a href="#" data-index="' + ($slide.index() + 1) + '">' + $this.text() + '</a></li>');
				});

				console.log($list);

				$('a[data-index]').on('click', function(event) {
					event.preventDefault();
					slideshow.gotoSlide($(this).data('index'));
				});
			}
		}, 100);
	});

	if ('serviceWorker' in navigator) {
		console.log('CLIENT: service worker registration in progress.');
		navigator.serviceWorker
			.register('./service-worker.js')
			.then(
				function() {
					console.log('CLIENT: service worker registration complete.');
				},
				function() {
					console.log('CLIENT: service worker registration failure.');
				}
			);
	} else {
		console.log('CLIENT: service worker is not supported.');
	}
});
