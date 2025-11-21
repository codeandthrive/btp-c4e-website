    "use strict";


    var windowOn = $(window);
  
    // PreLoader Js
    windowOn.on('load', function () {
      $("#loading").fadeOut(500);
    });

    /*--
        Header Sticky
    -----------------------------------*/

    window.onscroll = function () {
        const left = document.getElementById("header");

        if (left.scrollTop > 50 || self.pageYOffset > 50) {
            left.classList.add("sticky")
        } else {
            left.classList.remove("sticky");
        }
    }    

    /*--    
        Tabs
    -----------------------------------*/  
    const tabs = document.querySelectorAll('[data-tab-target]')
    const tabContents = document.querySelectorAll('.sasmix-event-schedule-tab-pane')

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.querySelector(tab.dataset.tabTarget)
            tabContents.forEach(tabContent => {
                tabContent.classList.remove('active')
            })
            tabs.forEach(tab => {
                tab.classList.remove('active')
            })
            tab.classList.add('active')
            target.classList.add('active')
        })
    })

  /*--
        Mobile Menu
  -----------------------------------*/
	$('#mobile-menu').meanmenu({
		meanMenuContainer: '.mobile-menu',
		meanScreenWidth: "991",
		meanExpand: ['<i class="fas fa-plus"></i>'],
	});

   /*--
        Sidebar Js
  -----------------------------------*/
	$(".sidebar-toggle-btn").on("click", function () {
		$(".sidebar__area").addClass("sidebar-opened");
		$(".body-overlay").addClass("opened");
	});
	$(".sidebar__close-btn").on("click", function () {
		$(".sidebar__area").removeClass("sidebar-opened");
		$(".body-overlay").removeClass("opened");
	});



	/*--
        Body overlay Js
  -----------------------------------*/
	$(".body-overlay").on("click", function () {
		$(".sidebar__area").removeClass("sidebar-opened");
		$(".body-overlay").removeClass("opened");
	});


  /*--
		Mousemove Parallax
	-----------------------------------*/
  var b = document.getElementsByTagName("BODY")[0];  

  b.addEventListener("mousemove", function(event) {
  parallaxed(event);

  });

  function parallaxed(e) {
      var amountMovedX = (e.clientX * -0.3 / 8);
      var amountMovedY = (e.clientY * -0.3 / 8);
      var x = document.getElementsByClassName("parallaxed");
      var i;
      for (i = 0; i < x.length; i++) {
          x[i].style.transform='translate(' + amountMovedX + 'px,' + amountMovedY + 'px)'
      }
  }


   /*--    
       Marquee Active  
    -----------------------------------*/
    if ($(".marquee_mode").length) {
      $('.marquee_mode').marquee({
          speed: 100,
          gap: 0,
          delayBeforeStart: 0,
          direction: 'left',
          duplicated: true,
          pauseOnHover: true,
          startVisible:true,
      });
  }

  /*--    
        Brand Active
    -----------------------------------*/
    var swiper = new Swiper(".brand-2-active .swiper-container", {
      slidesPerView: 4,
      spaceBetween: 30,
      loop: true,
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 1,
        },
        992: {
          slidesPerView: 2,
        },
        1200: {
          slidesPerView: 4,
        },
      },
  });

  /*--    
        Brand Active
    -----------------------------------*/
    var swiper = new Swiper(".brand-active .swiper-container", {
      slidesPerView: 4,
      spaceBetween: 30,
      loop: true,
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
        },
        992: {
          slidesPerView: 4,
        },
      },
  });

  
  
    /*--
      Testimonial Active
    -----------------------------------*/
    var swiper = new Swiper('.testimonial-active', {
      slidesPerView: 2,
      spaceBetween: 30,
      centeredSlides: true,
      grabCursor: true,
      loop: true,
      pagination: {
        el: ".testimonial-active .swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        0: {
        slidesPerView: 1,
        },
        
        1200: {
            slidesPerView: 2,
        },
        
    },
  });

  /*--
    Testimonial-2 Active
  -----------------------------------*/
  var swiper = new Swiper('.testimonial-2-active', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,  
    pagination: {
      el: ".testimonial-2-active .swiper-pagination",
      clickable: true,
    },      
  });

   // brand slider 
   var swiper = new Swiper(".tp-brand-top-active", {
    slidesPerView: 'auto',
    spaceBetween: 30,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
       delay: 1,
       disableOnInteraction: true,
    },
  });

 // brand slider  
  var swiper = new Swiper(".tp-brand-bottom-active", {
    slidesPerView: 'auto',
    spaceBetween: 30,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
       delay: 1,
       disableOnInteraction: true,
    },
  });

  /*--    
        Team Active
    -----------------------------------*/
    var swiper = new Swiper(".team-active", {
      slidesPerView: 5,
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: ".team-active .swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
        },
        992: {
          slidesPerView: 4,
        },
        1200: {
          slidesPerView: 5,
        },
      },
  });


  // ==== Title Addon ====

  document.addEventListener("DOMContentLoaded", function () {
    Splitting(); // initialize Splitting.js

    const targets = document.querySelectorAll("[data-splitting]");

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });

    targets.forEach(el => observer.observe(el));
  });

  /*--
    odometer
  -----------------------------------*/	
  document.addEventListener("DOMContentLoaded", function() {
    var counters = document.querySelectorAll('.odometer');

    // Intersection Observer to animate when visible
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var finalValue = el.getAttribute('data-count');
                el.innerHTML = finalValue;
                observer.unobserve(el); // Stop observing after animation
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
        observer.observe(counter);
    });
  });


  /*--
    magnificPopup video view 
  -----------------------------------*/	
	$('.popup-video').magnificPopup({
		type: 'iframe'
	});

   /*--
        AOS
    -----------------------------------*/   
    AOS.init({
      duration: 1200,
      once: true,
  });
