(function($) {

	$('#next-team').on('click', function( event ) {
		event.preventDefault;
		var selected = $('select[name=word_logo]').find(":selected");

		if ( selected[0] !== $('select[name=word_logo] option:last')[0] ) {
			selected.prop("selected", false)
			selected.next('option').prop("selected", true)
		}
		else {
			selected.prop("selected", false)
			$('select[name=word_logo] option:first-of-type').prop("selected", true);
		}

	})

	function swapTeams() {
		var temp = {};
		var inputs = ['name', 'square', 'code', 'color', 'score'];

		/* Load input values into temp obj */
		$.each( inputs, function(index, val) {
			temp[index] = $('*[name=team1_' + val + ']').val();
		});

		/* Replace team1 values with team2 values */
		$.each( inputs, function(index, val) {
			$('*[name=team1_' + val + ']').val( $('*[name=team2_' + val + ']').val() );
		});

		/* Replace team2 values with temp obj value */
		$.each( inputs, function(index, val) {
			$('*[name=team2_' + val + ']').val( temp[index] );
		});
	}

	function extendElemData(elem, obj) {
		var ext = $( elem ).data('extends');


		/* If the element has data-extends, split args into array */
		if ( typeof ext !== 'undefined' ) {
			var extArray = [];

			if ( ext.indexOf(',') !== -1 ) {
				extArray = ext.split(',');
			}
			else {
				extArray[0] = ext;
			}

			/* Grab the value of name=arg and add it to obj */
			for (var i = 0; i < extArray.length; i++) {
				var key = extArray[i];
				obj[key] = $( '*[name=' + extArray[i] + ']' ).get(0).value
			}
		}
	}

	/* ------------------------------------------------------------------------ */
	/* Capture all links as no option commands */
	/* ------------------------------------------------------------------------ */

	$('a').on('click', function( event ) {

		/* Add secret to our request */
		var postData = { 'secret' : secret };
		event.preventDefault();

		/* If is reverse, do that */
		if ( $( this ).data('action') === '/update/team_reverse' ) {
			swapTeams();
			return;
		}

		/* Update dashboard on score increases */
		if ( $( this ).data('action') === '/update/team1_up' ) {
			$('input[name=team1_score').val( parseInt( $('input[name=team1_score').val() ) + 1 );
		}

		/* Add extra data to request object */
		extendElemData( this, postData );

		/* Send POST request to node server */
		$.ajax({
			type: "POST",
			url: $( this ).data('action'),
			data: postData,
			success: function(data) {
			},
			dataType: 'JSON'
		});
	});

	/* ------------------------------------------------------------------------ */
	/* Capture all forms and submit data */
	/* ------------------------------------------------------------------------ */

	$('form').submit( function( event ) {

		/* Prevent default and serialize data */
		event.preventDefault();
		var formData = $( this ).serializeArray();

		/* Turn our indexed array into key value pairs */
		var formJSON = {};
		$( formData ).each( function( index ) {
			formJSON[formData[index].name] = formData[index].value;
		});
		formJSON['secret'] = secret;

		extendElemData( this, formJSON );

		console.log( formJSON );


		/* Send the formatted data to the server */
		$.ajax({
			type: "POST",
			url: $( this ).attr('action'),
			data: formJSON,
			success: function(data) {
			},
			dataType: 'JSON'
		});
	});

	/* ------------------------------------------------------------------------ */
	/* Expand .groups on click */
	/* ------------------------------------------------------------------------ */

	$('.group h1').on('click', function( event ) {
		/* Toggle hide / show for input groups */
		$( this ).parent('.group').toggleClass('open');
	});

	/* ------------------------------------------------------------------------ */
	/* Auto Complete */
	/* ------------------------------------------------------------------------ */

	function autocomplete(inp, arr) {
		/*the autocomplete function takes two arguments, the text field element and an array of possible autocompleted values:*/
		var currentFocus;
		/*execute a function when someone writes in the text field:*/
		inp.addEventListener("input", function(e) {
			var a, b, i, val = this.value;
			/*close any already open lists of autocompleted values*/
			closeAllLists();
			if (!val) { return false;}
			currentFocus = -1;
			/*create a DIV element that will contain the items (values):*/
			a = document.createElement("DIV");
			a.setAttribute("id", this.id + "autocomplete-list");
			a.setAttribute("class", "autocomplete-items");
			/*append the DIV element as a child of the autocomplete container:*/
			this.parentNode.appendChild(a);
			/*for each item in the array...*/
			for (i = 0; i < arr.length; i++) {
				/*check if the item starts with the same letters as the text field value:*/
				if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
					/*create a DIV element for each matching element:*/
					b = document.createElement("DIV");
					/*make the matching letters bold:*/
					b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
					b.innerHTML += arr[i].substr(val.length);
					/*insert a input field that will hold the current array item's value:*/
					b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
					/*execute a function when someone clicks on the item value (DIV element):*/
					b.addEventListener("click", function(e) {
						/*insert the value for the autocomplete text field:*/
						inp.value = this.getElementsByTagName("input")[0].value;
						/*close the list of autocompleted values, (or any other open lists of autocompleted values:*/
						closeAllLists();
					});
					a.appendChild(b);
				}
			}
		});
		/*execute a function presses a key on the keyboard:*/
		inp.addEventListener("keydown", function(e) {
			var x = document.getElementById(this.id + "autocomplete-list");
			if (x) x = x.getElementsByTagName("div");
			if (e.keyCode == 40) {
				/*If the arrow DOWN key is pressed, increase the currentFocus variable:*/
				currentFocus++;
				/*and and make the current item more visible:*/
				addActive(x);
			} else if (e.keyCode == 38) {
				/*If the arrow UP key is pressed, decrease the currentFocus variable:*/
				currentFocus--;
				/*and and make the current item more visible:*/
				addActive(x);
			} else if (e.keyCode == 13) {
				/*If the ENTER key is pressed, prevent the form from being submitted,*/
				/*e.preventDefault();*/
				if (currentFocus > -1) {
					/*and simulate a click on the "active" item:*/
					if (x) x[currentFocus].click();
				}
				else {
					if (x) x[0].click();
				}
			}
		});
		function addActive(x) {
			/*a function to classify an item as "active":*/
			if (!x) return false;
			/*start by removing the "active" class on all items:*/
			removeActive(x);
			if (currentFocus >= x.length) currentFocus = 0;
			if (currentFocus < 0) currentFocus = (x.length - 1);
			/*add class "autocomplete-active":*/
			x[currentFocus].classList.add("autocomplete-active");
		}
		function removeActive(x) {
			/*a function to remove the "active" class from all autocomplete items:*/
			for (var i = 0; i < x.length; i++) {
				x[i].classList.remove("autocomplete-active");
			}
		}
		function closeAllLists(elmnt) {
			/*close all autocomplete lists in the document, except the one passed as an argument:*/
			var x = document.getElementsByClassName("autocomplete-items");
			for (var i = 0; i < x.length; i++) {
				if (elmnt != x[i] && elmnt != inp) {
					x[i].parentNode.removeChild(x[i]);
				}
			}
		}
		/*execute a function when someone clicks in the document:*/
		document.addEventListener("click", function (e) {
			closeAllLists(e.target);
		});
	}

	autocomplete(document.getElementById("words-in"), words);


})(jQuery);
