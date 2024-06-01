$(window).scroll(function() {
    let scrollTop = $(document).scrollTop();
    let viewportHeight = $(window).height();
    let sections = $('.content');
    let numSections = sections.length;

    sections.each(function(index) {
        let sectionOffsetTop = $(this).offset().top;
        let distanceFromTop = scrollTop - sectionOffsetTop + viewportHeight / 2;
        let opacity;

        if (distanceFromTop >= 0 && distanceFromTop <= viewportHeight) {
            opacity = Math.min(1, (index + 1) / numSections * 0.85 + 0.15); // Increase opacity from 0.15 to 1
        } else {
            opacity = 0;
        }

        $(this).css('background', `rgba(0, 0, 0, ${opacity})`);
    });
});