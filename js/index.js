/**
 * Created by admin on 2014/7/16.
 */
Pui.add('index',function(exports,P){

    var $win = P.$win,

        $navs = $('#J_navs'),
        scrollDom = (P.detector.engine === 'webkit') ? "body": "html";

    var headerInit = function(){
        var $height = $('#J_header'),
            winHeight = $win.height();
        var _setHeight = function(){
            winHeight = (winHeight >= 1030)  ? 1030 : $win.height();
//            winHeight = $win.height();
            $height.height(winHeight);
        };
        _setHeight();
        $win.on("resize", P.throttle(function(){_setHeight()},500))

    };

    var scrollInit = function(){

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
        var $top = $('#J_top');
        $top.on('click',function(){
            $(scrollDom).animate({scrollTop : 0},400);
        });

        $navs.on('scrollnavdone',function(e,data){
            if(data.index>0){
                $top.fadeIn();
            }else{
                $top.fadeOut();
            }
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
            autoPlay: false,
            index:2
        });
    };

    var popDetail = function(){
        $('.J_pop').on('click',function(){
            $('#J_pop,#J_popMask').show();
        })
        $('#J_popClose').on('click',function(){
            $('#J_pop,#J_popMask').hide();
        })

        $('.cert_view').on('click',function(){
            $('#J_pop2,#J_popMask').show();
        })

        $('#J_popClose2').on('click',function(){
            $('#J_pop2,#J_popMask').hide();
        })
    };

    var scroll = function(){
        var $map = $('#J_map');
        $('#J_scroll').find('li').hover(function(){
            var $this = $(this),
                city = $this.attr('data-city');
            $this.addClass('selected').siblings('li').removeClass('selected');
            $map.find('.'+city).addClass('bounceIn').siblings('b').removeClass('bounceIn');
        });
    };

    var parallax = function(){
//        $('.c').parallax(
//            { mouseport: jQuery('#J_header') },                    // Options
//            { xparallax: '12%',    yparallax: '12%' },      // Layer 1
//            { xparallax: '50%',   yparallax: 'center' },     // Layer 2
//            { xparallax: 'left',   yparallax: 'top' },     // Layer 3
//            { xparallax: '30%',   yparallax: '40%' },     // Layer 4
//            { xparallax: '984px',   yparallax: '384px' },     // Layer 5
//            { xparallax: '12%',  yparallax: '12%' })     // Layer 6);


        // Declare parallax on layers
        $('#J_scrollList').parallax({
            mouseport: jQuery("#J_scroll"),
            yparallax: false
        });


    }


    exports.init  = function(){
        headerInit();
        scrollInit();
        sliderInit();
        gotoTop();
        popDetail();
        scroll();
        parallax();
    }


});