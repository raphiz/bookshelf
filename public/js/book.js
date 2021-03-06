var book = {
	configuration : undefined,
	book : undefined,
	rendered : [],
	addPage : function(page, book) {
		if (!book.turn('hasPage', page)) {
			var element = $('<div />', {'class': 'page '+((page%2==0) ? 'odd' : 'even'), 'id': 'page-'+page}),
				container = $('<div class="data"></div>', {id:'data-img-page-'+page});
			element.append(container)
			img = $('<img />', {id:'img-page-'+page, 'src': 'documents/' + this.book + this.filename(page-1)})
			.imagesLoaded().done( function( instance ) {
				$(instance.images[0].img).parent().addClass('loaded')
			})


			container.append(img)
			book.turn('addPage', element, page);
		}
	},
	filename: function(idx) {
		zero = this.configuration.zero
		idx = (String(zero) + String(idx)).slice(zero.length*-1)
		return "/page-" + idx + ".png";

	},
	setup : function() {
		this.book = this.getParameterByName('doc'); // Fabrica...
		self = this
		$.getJSON("book/" + this.book, function( data ) {
			self.configuration = data
			self.doSetup.bind(self)()
		})
	},
	doSetup : function() {
		var book = $("#book"),
			win = $(window);


		// Optimize book size
		book.width("70%");
		var maxHeight = (win.height() - 150),
		 	height = this.configuration.ratio*(book.width()/2),
			width = book.width()
		if(maxHeight < height) {
			height = maxHeight;
			width = this.configuration.ratio2*2*height;
		}
		book.height(height);
		book.width(width);
		$("#wrapper").width(width);

		book.turn({
			acceleration: true,
			pages: this.configuration.numOfPages,
			gradients: true,
			when: {
				turning: this.turning.bind(this),
				turned: this.turned.bind(this)
			}
		});
		// Bind arrow key navigation
		win.bind('keydown',this.onKeyDown.bind(this));

		// Link back button
		$('.back').on('click',function(){
			window.history.back();
		});

		//swipe gestures
		body = $('body').get(0)
		hammertime = Hammer(body);
		hammertime.on('swipeleft', function(ev) {
			if (scale <= 1 && book.turn("animating") === false) {
				$('#book').turn('next');
			}
		});
		hammertime.on('swiperight', function(ev) {
			if (scale <=1 && book.turn("animating") === false) {
				$('#book').turn('previous');
			}
		});


		$("#progress").on('click', this.goto.bind(this))
		$("#wrapper").on('click', this.goto.bind(this));

		// Hide the overlay
		$('.overlay').hide();
	},
	goto : function(e){
		var wrapper = $("#wrapper"),
			posX = e.pageX - parseInt(wrapper.css('margin-left').replace("px", "")),
			percent = posX/wrapper.width(),
			page = Math.round((this.configuration.numOfPages * percent)+1)-1;
			if(page == 0){
				page = 1
			}
			$('#book').turn("page", page);
	},
	turning : function(e, page, view) {
		// Gets the range of pages that the book needs right now
		var range = $('#book').turn('range', page);
		// Check if each page is within the book
		for (page = range[0]; page <= range[1]; page++) {
			this.addPage(page, $('#book'));
		};
	},
	turned : function(e, page) {
		this.updateProgress(page);
	},
	onKeyDown : function(e) {
		if (e.target && e.target.tagName.toLowerCase()!='input'){
			if (e.keyCode==37) {
				$('#book').turn('previous');
			} else if (e.keyCode==39) {
				$('#book').turn('next');
			}
		}
	},

	updateProgress: function(page) {
		if(page % 2 === 0){
			page +=1
		}
		percent = ((page)/this.configuration.numOfPages)
		if(page >= this.configuration.numOfPages){
			percent = 1
		}

		$("#progress").width(($("#book").width())*percent);
	},
	getParameterByName : function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
};
book.setup()
