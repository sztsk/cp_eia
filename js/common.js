/**
 * Created by admin on 14-7-20.
 */

Pui.add('config', function(exports) {
    var isLocal = (window.location.href.indexOf('localhost') !== -1);
    var root = function(){
        var _root = "http://1.fubi.pw/eic/server/";
        if(isLocal){
            _root = "http://localhost/github/cp_eic/server/";
        }
        return _root
    };


    exports.root = root();

});


Pui.add('rest',function(exports,P){
    var defaults = {
        dataType : "json"
    };

    var root = P.config.root + 'index.php/';

//    var ajaxDom = '<div id="J_loading" class="ui_tips ui_tips_show"><div class="J_txt">加载中...</div></div>';
//    $('body').append(ajaxDom);
//    var $ajax = $('#J_loading');
//
//    $(document).ajaxStart(function() {
//        $ajax.show();
//    }).ajaxComplete(function(){
//        $ajax.hide();
//    });

    /***
     * 获取api url
     * @param {Object} api_path
     */
    var getUrl = function(api_path) {
        return root + api_path;
    };
    /***
     *
     * @param {Object} params
     * @param {Object} type GET/POST/PUT/DELETE
     */
    var baseRest = function(params, type) {
        $.extend(params, defaults);
        params.type = type || "GET";
        return $.ajax(params);
    };

    exports.addProduct = function(data){
        var params = {
            data : data,
            url : getUrl('product'),
            success : function(t_data){
                if(t_data.error){
                    alert(t_data.error.text);
                }
            }
        };
        return baseRest(params, 'POST');
    };

    exports.editProduct = function(data){
        var pId = data.pro_id;
        var params = {
            data : data,
            url : getUrl('product/' + pId)
        };
        return baseRest(params,'PUT');
    };

    exports.getProducts = function(cateId,params){
        params = params || {};
        cateId = cateId || 1;
        params.url = getUrl("products/cate/" + cateId);
        return baseRest(params);
    };

    exports.getProductById = function(pId,params){
        params = params || {};
        params.url = getUrl("product/" + pId);
        return baseRest(params);
    };

    exports.delProductById = function(pId,params){
        params = params || {};
        params.url = getUrl("del/" + pId);
        return baseRest(params,'GET');
    };
});

Pui.add('func',function(exports,P){
    /**
     * 根据表单对象 遍历获取数据
     */
    var getDbData = function(form_id){
        var obj = {};
        $(':input[data-db-name]',form_id).each(function(){
            var $this = $(this),
                key = $this.attr('data-db-name');
            obj[key] = $this.val();

        });
        return obj;
    };

    var setDbData = function(data,form_id){
        for(var i in data){
            $(':input[data-db-name="'+ i +'"]',form_id).val(data[i]);
        }
    };

    /**
     * 上传插件
     * 上传ID
     * 路径
     * 回调函数
     */
    var createUploader = function(id,path,callback){
        new qq.FileUploader({
            element: document.getElementById(id),
            action: P.config.root +'fileuploader.php',
            allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'swf'],
            params:{
                folder:path,
                newname:true
            },
            onComplete: function(id, fileName, responseJSON){
                if (callback && typeof(callback) === "function") {
                    callback(responseJSON);
                }
            }
        });
    };

    /**
     * 获取URL参数
     * //example getUrlParam('id') or getUrlParam('id','#')
     */
    var getUrlParam = function(){
        var url = top.window.location.href;
        var u, params, StrBack = '',gg;
        if (arguments[arguments.length - 1] == "#")
            u = url.split("#");
        else
            u = url.split("?");
        if (u.length == 1)
            params = '';
        else
            params = u[1];

        if (params != '') {
            gg = params.split("&");
            var MaxI = gg.length,
                str = arguments[0] + "=";
            for (i = 0; i < MaxI; i++) {
                if (gg[i].indexOf(str) == 0) {
                    StrBack = gg[i].replace(str, "");
                    break;
                }
            }
        }
        return StrBack;
    };

    return {
        getDbData:getDbData,
        setDbData:setDbData,
        upload:createUploader,
        getUrlParam:getUrlParam
    }
});
