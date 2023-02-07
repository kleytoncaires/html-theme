$(function () {
	// Get container offset
	offsetWidth();

	$(window).resize(function () {
		offsetWidth();
	});

	function offsetWidth() {
		var containerOffset = $('.container').offset().left;

		$('.header-offset').css('width', containerOffset);
	}
});
