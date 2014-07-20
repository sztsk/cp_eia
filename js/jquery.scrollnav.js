
(function($,P){
    $.extend( jQuery.easing,
        {
            easeInOutQuint: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                return c/2*((t-=2)*t*t*t*t + 2) + b;
            }
        });
    var $win = P.$win,
        isIE6 = !-[1,]&&!window.XMLHttpRequest,
//        ltIE8 = P.detector.browser === 'ie' && P.detector.version < 8,
        scrollDom = (P.detector.engine === 'webkit') ? "body": "html";

    P.widget('pp.scrollnav',{

        options:{
            cssSlide        : '.page',              //关联的页面
            duration        : 600,                  //滚动速度
            easing          : 'easeInOutQuint',     //滚动效果
            clActive        : 'selected',            //选中态类名
            pagerSensitive  : null,                 //翻页灵敏度。下一页出现多少像素时才切换菜单的curIndex，为null时取值$win.height()/2
            offset          : 0,                        //偏移量
            cssNavItem      : 'a',                    //导航点击元素
            sticky          : false,                     //是否支持sticky
            cssSticky       :'scroll_fixed',             //支持sticky的情况下 加fixed类名
            hash            : false                     //是否支持hash定位
        },

        _create:function(){
            // 插件的菜单，就是点击滚动的小点
            this.$navItems = this.$el.find(this.options.cssNavItem);
            // 页面屏数 通过属性data-snav 与之关联
            var cssSlide = this.$el.attr('data-snav');
            cssSlide && ( this.options.cssSlide = cssSlide );
            // 将所有屏数的坐标值存进数组
            this.reset();
//            this.offsets = this._getPageOffset();
//            this.offsets = [743,1749,3546,6392];
            // 获取插件目前所在的位置（用于IE6无法使用fiexd的设置）
            this.top = this.$el.offset().top;
            //判断是否在动画中
            this.isAnimating=false;
            //当前的所在屏数
            this.curIndex = -1;
            //总屏数
            this.total = this.$navItems.length;
            this._bindEvt();
            this.options.hash && this._checkStatus();
        },

        /**
         * 判断当前状态
         * @private
         */
        _checkStatus:function(){
            var navs = parseInt(getUrlParam('navs','#'),10) || 0;
            if($.isNumeric(navs)){
                this.goTo(navs);
            }
        },

        /**
         * 绑定事件
         * @private
         */
        _bindEvt:function(){
            var that = this;
            that._on(that.$navItems,{
                'click':function(e) {
                    //获取点击所在的屏数
                    var index = that.$navItems.index(e.delegateTarget);
                    //跳转到相应的屏数
                    that.goTo(index);
                    //阻止元素本身的事件
                    e.preventDefault();
                }
            });
            //滚动条事件
            that._on($win,{
                'scroll':P.throttle(function(){
                    //更新频数索引值
                    that.updateSelectedNavIndex();
                    //更新导航菜单选中态
                    that.updateNav(that.curIndex);
                    //IE6则使用绝对定位
                    if(isIE6){
                        var scrolls = $(window).scrollTop();
                        that.$el.css({
                            position:'absolute',
                            top: scrolls + that.top
                        });
                    }
//                    console.log($(window).scrollTop());
                    
                    //是否支持sticky
                    if(that.options.sticky){
                        var y = $win.scrollTop();
                        if(y >= that.top){
                            that.$el.addClass(that.options.cssSticky);
                        }else{
                            that.$el.removeClass(that.options.cssSticky);
                        }
                    }
                },50)
            });
        },

        /**
         * 跳转到第几屏
         */
        goTo:function(idx){
            var that = this,
                s_top,
                dom;

            //已经当前页  || 当前正在动画中
            if (that.isAnimating) return;


            s_top = that.offsets[idx];      // 获取当前屏数的坐标值 s_  实际就是select_ 即选中的

            that.curIndex = idx;
            that.isAnimating = true;
            //更新导航菜单
            that.updateNav(idx);
            //console.log(idx);

            $(scrollDom).animate({
                scrollTop: s_top
            }, that.options.duration,that.options.easing,function(){
                that.isAnimating = false;
                that._trigger('done',null,{
                    index: +that.curIndex
                });
            });
        },

        /**
         * 跳转到上一屏
         */
        goPrev:function(){
            var idx = +this.curIndex - 1;
            if (idx<0) return;

            this.goTo(idx);
        },

        /**
         * 跳转到下一屏
         */
        goNext:function(){
            var idx = +this.curIndex + 1;
            if (idx>=this.total) return;
            this.goTo(idx);
        },

        /**
         * 更新导航菜单
         * @param index
         */
        updateNav:function(index){
            this.$navItems
                .removeClass(this.options.clActive)
                .eq(index)
                .addClass(this.options.clActive);
            //TODO urlparam 这里需要优化性能
            this.options.hash && setUrlParam('navs',index);
        },

        /**
         * 获取所有页面片的偏移量数据
         */
        _getPageOffset : function(){
            var arr = [],
                that = this;
            $(this.options.cssSlide).each(function(i){
                var $this = $(this),
                    top = $this.offset().top + that.options.offset;
                if(i==0){
                    top = $this.offset().top -140 ;
                }
//                console.log(top);
                
                arr.push(top);
            });
            return arr;
        },

        /**
         * 更新屏数索引
         */
        updateSelectedNavIndex : function(){
            //如果还在动画中 则不更新
            if (this.isAnimating) return;

            var  s_top = $win.scrollTop(), //当前滚动条的位置
                winHeight = $win.height(),
                pagerSensitive = this.options.pagerSensitive !== null ? this.options.pagerSensitive : (winHeight/2),
                idx = 0;
            for(var i in this.offsets)  {
                if ( (s_top+winHeight-this.offsets[this.total-i-1]) >= pagerSensitive ) {
                    idx = this.total-i-1;
                    break;
                }
            }//for

            if(this.curIndex !== idx){
                this.curIndex = idx;
                this._trigger('done',null,{
                    index: +idx
                });
            }
        },

        /**
         * 重新更新索引
         */
        reset : function(){
            this.offsets = this._getPageOffset();
        }


    })

})(jQuery,Pui);




























