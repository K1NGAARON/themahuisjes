document.addEventListener('scroll', function() {
    let scrollTop = document.documentElement.scrollTop;
    let viewportHeight = window.innerHeight;
    let sections = document.querySelectorAll('.content');

    // Ensure there are sections to process
    if (sections.length > 0) {
        sections.forEach(function(section, index) {
            let sectionOffsetTop = section.offsetTop;
            let distanceFromTop = scrollTop - sectionOffsetTop;

            if (distanceFromTop >= -viewportHeight && distanceFromTop <= viewportHeight) {
                let opacity = Math.max(0.5, 1 - (Math.abs(distanceFromTop) / viewportHeight));
                section.style.background = `rgba(0, 0, 0, ${opacity})`;
            }
        });
    }
});