/**
 * Created by admin on 2014/7/16.
 */
Pui.add('index',function(exports){

    var $win = $(window),
        winHeight = $win.height();

    var headerInit = function(){
        $('#J_header').height(winHeight);
    };

    var scrollInit = function(){
        var $navs = $('#J_navs');
        $navs.scrollnav({
            sticky:true,
            cssSticky:'navs_fixed',
            offset:-200
        });

        $('#J_triggerNavs').find('a').on('click',function(){
            var idx = $(this).index();
            $navs.scrollnav('instance').goTo(idx);
            return false;
        })
    };

    var gotoTop = function(){
      $('#J_top').on('click',function(){
          $('html, body').animate({scrollTop : 0},400);
      })
    };

    var sliderInit = function(){
        $('#J_banner').slider({
            scroller: '.banner_slider',
            nav: '.banner_dot',
            triggerEvent: 'mouseover',
            prevBtn: '.banner_prev',
            nextBtn: '.banner_next',
            navTpl: '<a class="b4{index}" href="javascript:;"></a>', //需要index可 '<li>{index}<li>' index从1起
            autoPlay: false
        });
    };

    exports.init  = function(){
        headerInit();
        scrollInit();
        sliderInit();
        gotoTop();
    }


});