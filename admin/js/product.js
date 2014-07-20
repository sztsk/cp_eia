/**
 * Created by admin on 14-7-20.
 */

Pui.add('product',function(exports,P){
    var Rest = P.rest;

    var ui = {
        $listImg : $('#J_listImg')
    };
    var listImg = function(filename){
        var str = '<li><img data-src="'+ filename +'" src="../product/'+ filename +'" /><button type="button" class="close J_del"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></li>';
        ui.$listImg.append(str);
    };

    var getImgs = function(){
        var arr = [];
        ui.$listImg.find('img').each(function(i){
            var src = $(this).attr('data-src');
            arr.push(src)
        });
        return arr.join(',');
    }

    var Event = {
        add : function(){
            $('#J_productForm').on('submit',function(){
                var id = +P.func.getUrlParam('id');
                var data = P.func.getDbData();
                data['pro_imgs'] = getImgs();
                if(id){
                    data['pro_id'] = id;
                    Rest.editProduct(data).done(function(){
                        alert('修改成功！')
                    })
                }else{
                    Rest.addProduct(data).done(function(data){
                        alert('添加产品成功！')
                        window.location.reload(true);
                    });
                }

                return false;
            })
        },

        upload:function(){
            P.func.upload('J_upload','../product/',function(data){
                listImg(data.filename);
            })
        },

        delImg : function(){
            ui.$listImg.on('click','.J_del',function(){
                $(this).closest('li').fadeOut(500,function(){
                    $(this).remove();
                });
                return false;
            })
        },

        delPro : function(){
            $('#J_delPro').on('click',function(){
                var id = +P.func.getUrlParam('id');
                if(confirm('你确认要删除该产品吗？')){
                    Rest.delProductById(id).done(function(){
                        alert('删除成功，点击确定跳转到列表页！');
                        window.location.href = "list.html";
                    })
                }
            })
        },

        /**
         * 加载数据
         */
        loadData:function(){
            var id = +P.func.getUrlParam('id');
            if(!id) return;
            Rest.getProductById(id).done(function(data){
                P.func.setDbData(data,'#J_productForm');
                var imgs = data.pro_imgs
                if(imgs){
                    imgs = imgs.split(',');
                    for(var i in imgs){
                        listImg(imgs[i]);
                    }
                }
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

    exports.init = function(){
        Event.init();
    }
});
