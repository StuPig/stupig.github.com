/**
 * µ¯´°ÌáÊ¾Ä£°å
 */
(function($) {
	var conStr = [
			'<div>',
				'<div class="${container}">',
					'<div class="${outerCon}">',
					'</div>',
				'</div>',
			'</div>'
		].join(''),
		arrowStr = [
			'<div>',
				'<div class="${arrowB}">',
					'<div class="${arrowP}">',
					'</div>',
				'</div>',
			'</div>'
		].join('');
	PTtmpl = {
		'containerStr' : conStr,
		'arrowStr' : arrowStr
	};
})(jQuery);