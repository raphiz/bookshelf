var book = {
	scale : 0,
	numberOfPages : 0,
	rendered : [],
	pdf : null,
	addPage : function(page, book) {
		if (!book.turn('hasPage', page)) {
			console.log("adding page " + page);
			var element = $('<div />', {'class': 'page '+((page%2==0) ? 'odd' : 'even'), 'id': 'page-'+page})
			element.html('<div class="data"><canvas id="canv' + page + '"></canvas></div>');
			book.turn('addPage', element, page);
		}
	},
	renderPage : function (num) {
		if (!this.rendered[num]) {
			console.log("rendering page " + num);
			this.pdf.getPage(num).then(this.doRenderPage.bind(this));
			this.rendered[num] = true;
		}
	},
	doRenderPage : function(page) {

		var viewport = page.getViewport(this.scale);

		var canvasElm = $('#canv' + (page.pageIndex+1));
		var canvas = canvasElm.get(0);
		if(canvas == undefined) {
			console.log((page.pageIndex+1))
		}

		// Resize the canvas to the viewport's dimensions
		canvas.height = viewport.height;
		canvas.width = viewport.width;
		// Render the pdf page on the canvas
		var renderContext = {
			canvasContext: canvas.getContext('2d'),
			viewport: viewport
		};
		page.render(renderContext);

	},
	setup : function() {
		var url = this.getParameterByName('doc');
		console.log(url)
		PDFJS.disableWorker = true;
		PDFJS.getDocument(url).then(function(pdfDoc){
			this.pdf = pdfDoc;

			// Fetch the first page to evaluate the page ratio.
			this.pdf.getPage(1).then(this.doSetup.bind(this));
		}.bind(this));
	},
	doSetup : function(page) {
		var book = $("#book"),
			win = $(window);

		// Evaluate the page ratio
		var ratio = page.getViewport(1).height / page.getViewport(1).width;

		// Optimize book size
		book.width("70%");
		console.log(book.width())
		var maxHeight = (win.height() - 150),
		 	height = ratio*(book.width()/2),
			width = book.width()
		if(maxHeight < height) {
			height = maxHeight;
			ratio = page.getViewport(1).width / page.getViewport(1).height;
			width = ratio*2*height;
		}

		book.height(height);
		book.width(width);
		$("#wrapper").width(width);

		// Calculate the scale passed to pdfjs to fit the page
		this.scale = (book.height()) / page.getViewport(1).height;
		this.numberOfPages = this.pdf.numPages;

		book.turn({
			acceleration: true,
			pages: this.numberOfPages,
			gradients: false,
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
		Hammer($('body').get(0)).on('swipeleft', function(ev) {
			$('#book').turn('next');			
		});
		Hammer($('body').get(0)).on('swiperight', function(ev) {
			$('#book').turn('previous');
		});


		// Hide the overlay
		$('.overlay').hide();
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

		var range = $('#book').turn('range', page);
		for (page = range[0]; page<=range[1]; page++) {
			this.renderPage(page);
		}
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
		var percent = ((page+(this.numberOfPages % 2))/this.numberOfPages)*100;
		$("#progress").width(($("#book").width()/100)*percent);
	},
	getParameterByName : function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
};
book.setup()
