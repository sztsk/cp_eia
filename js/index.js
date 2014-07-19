/**
 * Created by admin on 2014/7/16.
 */
Pui.add('index',function(exports,P){

    var $win = P.$win,
        $navs = $('#J_navs'),
        scrollDom = (P.detector.engine === 'webkit') ? "body": "html";

    var $modalCnt = $('#J_modalCnt');

    /**
     * 添加头标签 浏览器检测
     */
    var browserCheck = function(){
        var css3 = P.supports("Transition") ? "transitions": "notransitions",
            css3 = P.supports("animation") ? css3 + " animations": css3 + " noanimations",
            detector = P.detector,
            version = detector.version ? 'ie'+ detector.version : '';

        $("html").addClass( css3 + " " + detector.os + " " + detector.engine + " " + detector.browser + " " + version);
    };

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


        $('#J_cert').find('.effeckt-modal-button').on('click.index',function(){
            var img = $(this).attr('href');
            $modalCnt.html('<img src="'+ img +'" />')
        });

        var tpl = $('#J_popTpl').html(),
            $warp = $('#J_popCnt'),
            $list = $('#J_proList');
        $list.on('click','.J_pop',function(){
            var proId = $(this).attr('data-id');
            $warp.html(tpl);
        });

        //商品图切换
        $warp.on('mouseenter','.J_sImg',function(){
            var $this = $(this),
                bImg = $this.attr('href');
            $warp.find('.J_bImg').attr('src',bImg);
            $this.addClass('selected').siblings('a').removeClass('selected');
            return false;
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
        // Declare parallax on layers
        $('#J_scrollList').parallax({
            mouseport: jQuery("#J_scroll"),
            yparallax: false
        });

//        $('#J_pao,#J_pao2').parallax({
//            mouseport: jQuery("#J_header")
//        },{ xparallax: '12%',    yparallax: '12%' },      // Layer 1
//            { xparallax: '50%',   yparallax: 'center' }
//        );


    };

    var lazyLoad = function(){
        $(document).lazyloader({
            effect : "fadeIn",
            dynamic: false
        })
    };


    exports.init  = function(){
        browserCheck();
        headerInit();
        scrollInit();
        sliderInit();
        gotoTop();
        popDetail();
        scroll();
        parallax();
    };

    exports.lazyInit = function(){
        lazyLoad();
    }


});