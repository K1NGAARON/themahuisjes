$(window).scroll(function() {
    console.log("loaded");

    var scrollTop = $(document).scrollTop();
    var viewportHeight = $(window).height();
    var sections = $('.content');

    sections.each(function() {
        var sectionOffsetTop = $(this).offset().top;
        var distanceFromTop = scrollTop - sectionOffsetTop + viewportHeight / 2;

        if (distanceFromTop >= 0 && distanceFromTop <= viewportHeight) {
            var opacity = Math.max(0.5, 1 - (Math.abs(distanceFromTop - viewportHeight / 2) / (viewportHeight / 2)));
            $(this).css('background', `rgba(0, 0, 0, ${opacity})`);
        } else {
            $(this).css('background', 'rgba(0, 0, 0, 0.5)');
        }
    });
});