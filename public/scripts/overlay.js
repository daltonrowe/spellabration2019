(function($) {

	var imagesDir = '/images/';

	socket.on('refresh', function( data ) {
		location.reload()
	});

	/* ------------------------------------------------------------------------ */
	/* Teams */
	/* ------------------------------------------------------------------------ */

	socket.on('teams_hide', function( data ) {
		$( '#teams' ).removeClass('active');
		$('.team.out').removeClass('out');
		$('#bug').removeClass('hide');
	});

	function updateTeams(data) {
		console.log( data );

		$( '#teams:not(.active)' ).addClass('active');
		$('#bug').addClass('hide');

		var totalTeams = 8;

		for (var i = 1; i < totalTeams + 1; i++) {
			console.log( data['team' + i + '_name'] );

			$('.team' + i + '_name').text( data['team' + i + '_name']);
			$('.team' + i + '_sa').text( 'Spell Again: ' + data['team' + i + '_sa']);

			$('.team' + i + '_logo').attr('src', imagesDir + 'square-' + data['team' + i + '_logo'] + '.png');

			if ( 'out' === data['team' + i + '_in'] ) {
				$('.team' + i + ':not(.out)').addClass('out');
			}
		}
	}

	socket.on('teams', function( data ) {

		setTimeout( function() {
			updateTeams( data );
		}, 1000);
	});

	/* ------------------------------------------------------------------------ */
	/* Words Overlay */
	/* ------------------------------------------------------------------------ */

	socket.on('word_new', function( data ) {
		console.log( data );

		if ( data.word_logo !== '' ) {
			$('#team-logo').css('background-image', 'url(images/square-' + data.word_logo + '.png)');
		}

		if ( data.text === '' ) {
			$( '#word-wrapper' ).addClass('hide');
		}
		else {
			$( '#word' ).text( data.text );
			$( '#word-wrapper' ).removeClass('hide');
		}

	});

	socket.on('word_correct', function( data ) {
		console.log( 'correct' );

		$( '#word-wrapper' ).addClass('correct');

		setTimeout( function() {
			$( '#word-wrapper' ).removeClass('correct');
			$( '#word-wrapper' ).addClass('hide');
		}, 3000)
	});

	socket.on('word_wrong', function( data ) {
		console.log( 'wrong' );

		$( '#word-wrapper' ).addClass('wrong');

		setTimeout( function() {
			$( '#word-wrapper' ).removeClass('wrong');
		}, 3000)
	});

	/* ------------------------------------------------------------------------ */
	/* Cards */
	/* ------------------------------------------------------------------------ */

	function hideCards() {
		$('#cards #card-bg > .active').removeClass('active');
		$('#cards > .active').removeClass('active');
	}

	socket.on('card_sponsors', function( data ) {
		console.log( data );
		hideCards();
		setBg( data );

		setTimeout(function() {
			$('#cards #card-bg').addClass('active');
			$('#cards #card-sponsors').addClass('active');
		}, 1000)
	});

	function setBg( data ) {
		if ( typeof data.bg !== 'undefined' ) {
			$('#cards #card-bg').addClass('active');

			if ( typeof $('#cards video.active')[0] !== 'undefined' ) {
				$('#cards video.active').get(0).pause();
			}

			var bgVideo = '';

			if ( data.bg === 'rand') {

				var allBg = $('#card-bg video');
				var rand = Math.floor( Math.random() * allBg.length );
				bgVideo = allBg.get(rand);
			} else {
				bgVideo = $( 'video.' + data.bg ).get(0);
			}

			$( bgVideo ).addClass('active');
			bgVideo.play();
		}
	}

	socket.on('card_text', function( data ) {
		console.log( data );

		hideCards();

		setTimeout( function() {

			setBg( data );

			$('#cards #card-text').addClass('active');
			$( '#card-text .card-text').text( data.text )

			if ( data.more_text === '') {
				$( '#card-text .more-text').addClass('hide');

			}
			else {
				$( '#card-text .more-text').text( data.more_text );
				$( '#card-text .more-text.hide').removeClass('hide');
			}

		}, 1000);

	});

	socket.on('card_hide', function( data ) {
		setTimeout( function() {
			hideCards();
		}, 1000);
	});


	/* ------------------------------------------------------------------------ */
	/* Bug */
	/* ------------------------------------------------------------------------ */

	function resetBug() {
		$('#bug.hide').removeClass('hide');
		$('#bug-inner .active').removeClass('active');
	}

	socket.on('bug_embiggen', function( data ) {
		$('#bug').toggleClass('embiggen');
	});

	socket.on('bug_text', function( data ) {
		resetBug();

		setTimeout( function() {
			$('#bug-inner .bug_text').text( data.text );
			$('#bug-inner #bug-text').addClass('active');
		}, 1000);
	});

	socket.on('bug_logo', function( data ) {
		resetBug();

		setTimeout( function() {
			$('#bug-inner #bug-logo').addClass('active');
		}, 1000);
	});

	socket.on('bug_countdown', function( data ) {
		resetBug();

		setTimeout( function() {
			$('#bug-inner #bug-countdown').addClass('active');
		}, 1000);
	});

	socket.on('bug_hide', function( data ) {
		$('#bug').toggleClass('hide');
	});

	/* ------------------------------------------------------------------------ */
	/* Countdown */
	/* ------------------------------------------------------------------------ */

	var countDownInterval;
	var countDownDate;

	function addHours(date, hr) {
		return new Date(date.getTime() + hr*3600*1000);
	}
	function addMinutes(date, min) {
		return new Date(date.getTime() + min*60000);
	}
	function addSeconds(date, sec) {
		return new Date(date.getTime() + sec*1000);
	}

	function countDownComplete() {
		resetBug();
		clearInterval( countDownInterval );

		setTimeout( function() {
			if ( $('#bug').hasClass('embiggen') ) {
				$('#bug').removeClass('embiggen')
			}

			$('#bug-inner #bug-logo').addClass('active');
		}, 1000);
	}

	function setCountdown( date ) {

		var tempCount = date.getTime()
		countDownInterval = setInterval(function() {

			var now = new Date().getTime();
			var distance = countDownDate - now;

			var days = Math.floor(distance / (1000 * 60 * 60 * 24));
			var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((distance % (1000 * 60)) / 1000);

			if ( hours < 0 ) {
				hours = 0;
			}
			if ( minutes < 0 ) {
				minutes = 0;
			}
			if ( seconds < 0 ) {
				seconds = 0;
			}

			if ( minutes < 10 ) {
				minutes = '0' + minutes.toString();
			}
			if ( seconds < 10 ) {
				seconds = '0' + seconds.toString();
			}

			document.getElementById("hours").innerHTML = hours;
			document.getElementById("minutes").innerHTML = minutes;
			document.getElementById("seconds").innerHTML = seconds;

			if ( distance <= 0 ) {
				countDownComplete();
			}
		}, 1000);
	}


	socket.on('countdown', function( data ) {
		console.log( data );
		resetBug();

		var hr = parseInt( data.hours ) || 0;
		var min = parseInt( data.minutes ) || 0;
		var sec = parseInt( data.seconds ) || 0;

		countDownDate = new Date();
		countDownDate = addHours( countDownDate, hr );
		countDownDate = addMinutes( countDownDate, min );
		countDownDate = addSeconds( countDownDate, sec + 2 );
		setCountdown( countDownDate );

		setTimeout( function() {
			if ( $('#bug').hasClass('embiggen') === false ) {
				$('#bug').addClass('embiggen')
			}

			$('#bug-inner #bug-countdown').addClass('active');
		}, 1000);

	});

	/* ------------------------------------------------------------------------ */
	/* Slider */
	/* ------------------------------------------------------------------------ */

	$('img.sponsor:first-of-type').addClass('active');
	var slider_total = $('img.sponsor').length - 1;
	var slider_i = 0;

	setInterval(function() {

		if ( slider_i < slider_total ) {
			$('img.sponsor.active').removeClass('active').next('img.sponsor').addClass('active');
			slider_i++;
		}
		else {
			$('img.sponsor.active').removeClass('active')
			$('img.sponsor:first-of-type').addClass('active')
			slider_i = 0;
		}
	}, 4000)

})(jQuery);
