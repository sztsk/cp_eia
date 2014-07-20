/**
 * Created by admin on 14-7-20.
 */

Pui.add('list',function(exports,P){
    var Rest = P.rest;

    var cateId = P.func.getUrlParam('id') || 1;

    /**
     * 将换行符用p表示
     * @param str
     */
    var changeLine = function(str){
        if(!str) return;
        str = str.replace(/\n/g, "</p><p>");
        return '<p>'+ str +'</p>'
    };

    exports.init = function(){

        $('#J_cate').find('li[data-id="'+ cateId +'"]').addClass('active').siblings('li').removeClass('active');

        Rest.getProducts(cateId).done(function(data){
            var tpl = $('#J_tplItem').html();
            if(!data){
                alert('该分类下没有数据');
                return;
            }
            for(var i = 0,len = data.length;i<len;i++){
                var imgs = data[i]['pro_imgs'];
                data[i]['pro_imgs'] = imgs ? imgs.split(',') : ['demo/1.jpg'];
                //change template
                data[i].pro_vars = changeLine(data[i].pro_vars);
                data[i].pro_info = changeLine(data[i].pro_info);
            }

            $('#J_proList').html(P.tmpl(tpl,{items:data}))
        })
    }
});
