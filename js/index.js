/**
 * Created by admin on 2014/7/16.
 */
Pui.add('index',function(exports,P){

    var $win = P.$win,
        $navs = $('#J_navs'),
        scrollDom = (P.detector.engine === 'webkit') ? "body": "html",
        $modalCnt = $('#J_modalCnt'),
        $doc = P.$doc,
        proTpl = $('#J_proItem').html(),
        $proListUl = $("#J_proListUl"),
        $pager = $('#J_proPage'),           //翻页容器
        $cateImg = $('#J_proCateImg'),      //分类图片
        PAGESIZE = 9,//分页
        cacheProData;//产品列表数据


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
            $navs.scrollnav('goTo',idx);//.goTo(idx);
            return false;
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
            index:0
        });
    };

    var getProducts = function(cate){
        P.rest.getProducts(cate).done(function(data){
            if(!data){
                alert('该分类下没有找到相关的产品')
                return;
            }
            for(var i = 0,len = data.length;i<len;i++){
                var imgs = data[i]['pro_imgs'];
                data[i]['pro_imgs'] = imgs ? imgs.split(',') : ['demo/1.jpg'];
            }
            //将数据存到变量
            cacheProData = data;

            //初始化分页
            initPager(data);
        })
    };

    var initPager = function(data){
        var total = data.length,
            pageTotal = Math.ceil(total/PAGESIZE),   //页数
            str = '';

        //隐藏并填充数据
        $proListUl.html(P.tmpl(proTpl,{items:data}));

        for(var i = 1;i<= pageTotal;i++){
            var start = i*PAGESIZE - PAGESIZE,
                end = i*PAGESIZE;
            if(end>total) end = total;
            str += '<a href="javascript:;" data-start="'+ start +'" data-end="'+ end +'" class="J_page">'+ i +'</a>';
        }
        $pager.show().html(str);
        //触发第一页
        $pager.find('a:eq(0)').trigger('click');
        //只有一页 则隐藏分页
        if(pageTotal <= 1){
            $pager.hide();
        }
    };

    /**
     * 从cachedata中获取数据
     * @param id
     */
    var getProductById = function(id){
        var data;
        $.each(cacheProData,function(i,item){
            if(item.pro_id == id){
                data = item;
                //找到数据后退出循环
                return false;
            }
        });
        return data;
    };

    var popDetail = function(){
        /**
         * 将换行符用p表示
         * @param str
         */
        var changeLine = function(str){
            if(!str) return;
            str = str.replace(/\n/g, "</p><p>");
            return '<p>'+ str +'</p>'
        };

        var $modal = $('#effeckt-modal-wrap'),
            supAni = P.supports("animation");
        $('#J_cert,#J_media').find('.effeckt-modal-button').on('click.index',function(){
            var $this = $(this),
                img = $this.attr('href');

            $modalCnt.html('<img src="'+ img +'" />');

            if(!supAni){
                var hasClass = $this.hasClass('cert_img');
                if(!hasClass){
                    var width = $modal.width() /2,
                        height = $modal.height() /2;
                    $modal.css({
                        'margin-top':'-' + height + 'px',
                        'margin-left':'-' + width + 'px'
                    });
                }
            }

        });

        var tpl = $('#J_popTpl').html(),
            $warp = $('#J_popCnt'),
            $list = $('#J_proList');
        $list.on('click','.J_pop',function(){
            var proId = $(this).attr('data-id'),
                data = getProductById(proId),
                vars = data.pro_vars;//参数列表
            //change template
            data.pro_vars = changeLine(data.pro_vars);
            data.pro_info = changeLine(data.pro_info);

            $warp.html(P.tmpl(tpl,data));
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



    var lazyLoad = function(){
        $doc.lazyloader({
            effect : "fadeIn",
            dynamic: false
        })
    };


    /**
     * 事件对象
     * @type {{}}
     */
    var Event = {

        /**
         * 地图图片视差横向滚动 及 鼠标移动放大效果
         */
        mapEffect:function(){
            var $map = $('#J_map');
            $('#J_scroll').find('li').hover(function(){
                var $this = $(this),
                    city = $this.attr('data-city');
                $this.addClass('selected').siblings('li').removeClass('selected');
                $map.find('.'+city).addClass('bounceIn').siblings('b').removeClass('bounceIn');
            });

            $('#J_scrollList').parallax({
                mouseport: jQuery("#J_scroll"),
                yparallax: false
            });

        },

        /**
         * 返回顶部事件
         */
        gotoTop:function(){
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
        },

        /**
         * 分页事件
         */
        pageChange:function(){
            $pager.on('click','a',function(){
                var $this = $(this),
                    start = $this.attr('data-start'),
                    end = $this.attr('data-end');
                //添加样式
                $this.addClass('selected').siblings('a').removeClass('selected');
                //显示数据
                $proListUl.find('li').hide().slice(start,end).show();
                //重新定位
                $navs.scrollnav('reset');//.reset();
            })
        },

        /**
         * 分类切换
         */
        cateChange:function(){
            $('#J_proCate').find('.J_cate').on('click',function(){
                var $this = $(this),
                    cateId = $this.attr('data-cate-id');
                $this.addClass('selected').siblings('.J_cate').removeClass('selected');
                getProducts(cateId);
                $cateImg.attr('src','images/cate/'+ cateId +'.png')
            })
        },

        init:function(){
            //初始化
            for(var i in this) {
                if (this.hasOwnProperty(i) && i !== 'init') {
                    this[i]();
                }
            }
        }
    };


    exports.init  = function(){
        browserCheck();
        headerInit();
        scrollInit();
        sliderInit();
        popDetail();
        getProducts(1);
        Event.init();
    };

    exports.lazyInit = function(){
        lazyLoad();

    }


});