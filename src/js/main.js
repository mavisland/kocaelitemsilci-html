$(document).ready(function() {
  // Global Variables
  var $body        = $('body');
  var $window      = $(window);
  var $windowWidth = $window.width();

  // Dropdown Hover Effect
  var dropdown = $('#header .dropdown');
  if ($windowWidth > 768) {
    dropdown.hover(
      function() {
        $('.dropdown-menu', this).stop(true, true).fadeIn("fast");
        $(this).toggleClass('open');
      },
      function() {
        $('.dropdown-menu', this).stop(true, true).fadeOut("fast");
        $(this).toggleClass('open');
      }
    );
  }

  // Click event to scroll to top
  var scrollTop = $('.scroll-top');
  scrollTop.on('click', function(){
    $('html, body').animate({
      scrollTop : 0
    }, 800);
    return false;
  });

  // Shrink Header on scroll
  var header = $('#header');
  $window.on('scroll', function() {
    if ($window.scrollTop() > 100) {
      header.addClass("is-scroll");
      scrollTop.fadeIn(300);
    } else {
      header.removeClass("is-scroll");
      scrollTop.fadeOut(300);
    }
  });
});
