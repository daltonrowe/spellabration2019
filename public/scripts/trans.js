(function($) {

	function hideTrans() {
		$('video.active').removeClass('active');
	}

	socket.on('refresh', function( data ) {
		location.reload()
	});

	socket.on('trans_play', function( data ) {
		console.log( data );


		var transVideo = '';

		if ( data.trans === 'rand') {

			var allTrans = $('#trans video');
			var rand = Math.floor( Math.random() * allTrans.length );
			transVideo = allTrans.get(rand);
		} else {
			transVideo = $( 'video.' + data.trans ).get(0);
		}

		$( transVideo ).addClass('active');
		transVideo.onended = function() {
			$( this ).removeClass('active');
		}
		transVideo.play();

	});

	$("video").prop("volume", 0.025);

})(jQuery);
