$(window).scroll(function() {
    var scrollTop = $(document).scrollTop();
    var viewportHeight = $(window).height();
    var sections = $('.content');
    var numSections = sections.length;

    sections.each(function(index) {
        var sectionOffsetTop = $(this).offset().top;
        var distanceFromTop = scrollTop - sectionOffsetTop + viewportHeight / 2;
        var opacity;

        if (distanceFromTop >= 0 && distanceFromTop <= viewportHeight) {
            opacity = Math.min(1, (index + 1) / numSections * 0.85 + 0.15); // Increase opacity from 0.15 to 1
        } else {
            opacity = 0.5; // Default opacity when not in view
        }

        $(this).css('background', `rgba(0, 0, 0, ${opacity})`);
    });
});