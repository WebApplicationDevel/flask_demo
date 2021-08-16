
//layerHelper管理弹窗（打开、关闭）
//加载于top层的home.html

var layerHelper = {

    _LAYER_INDEX: null,//当前是否打开弹窗的标识
    loadingIndex: null,//提示正在加载
    ICONS:{
        EXCLAMATION:0,
        SUCCESS:1,
        ERROR:2,
        QUESTION:3
    },

    /**
     * 包括提交、关闭按钮的弹窗
     * @param title
     * @param url
     * @param area
     * @param ok_callback
     * @param cancel_callback
     * @param success_callback 弹出成功时回调函数
     */
    show: function (title, url, area, cancel_callback)
    {

        if (!cancel_callback)//确定关闭弹窗的回调函数
            cancel_callback = function (index, layero)    //取消的回调函数没有定义
            {

                top.layerHelper.closeAll();
                top.layerHelper._LAYER_INDEX = null;//关闭当前弹窗
                return true;

            };
        layerHelper._LAYER_INDEX = layer.open({
            id:"layer-"+myRandom.randomNumber(6)
            , title: title
            , type: (url.toUpperCase().indexOf("HTTP")>=0?2:1)
            , content: (url.toUpperCase().indexOf("HTTP")>=0?url:$("#"+url))
            , closeBtn: 0
            , shade: 0
            , area: area
            , offset: "auto"
            , maxmin: false
            , btn: ["关闭"]
            , btn1:  cancel_callback
        });
    },

    /**
     * 包括提交、关闭按钮的弹窗
     * @param title
     * @param url
     * @param area
     * @param ok_callback
     * @param cancel_callback
     * @param success_callback 弹出成功时回调函数
     */
    open: function (title, url, area, ok_callback, cancel_callback,success_callback)
    {

        if (!cancel_callback)//确定关闭弹窗的回调函数
            cancel_callback = function (index, layero)    //取消的回调函数没有定义
            {
                if (confirm("确认退出吗？") == true) {
                    top.layerHelper._LAYER_INDEX = null;//关闭当前弹窗
                    return true;
                } else {
                    return false;
                }
            };
        layerHelper._LAYER_INDEX = layer.open({
            id:"layer-"+myRandom.randomNumber(6)
            , title: title
            , type: (url.toUpperCase().indexOf("HTTP")>=0?2:1)
            , content: (url.toUpperCase().indexOf("HTTP")>=0?url:$("#"+url))
            , closeBtn: 0
            , shade: 0
            , area: area
            , offset: "auto"
            , maxmin: false
            , btn: ["提交", "关闭"]
            , btn1: ok_callback
            , btn2: cancel_callback
            , success: success_callback
        });

    },
    /**
     * 窗口关闭、大小控制
     * @param title
     * @param url
     * @param area
     * @param btn 按钮组，如["提交","关闭"]
     */
    open2: function (title, url, area, btn,ok_callback, cancel_callback,success_callback,maxmin)
    {

        if (!cancel_callback)//确定关闭弹窗的回调函数
            cancel_callback = function (index, layero)    //取消的回调函数没有定义
            {
                if (confirm("确认退出吗？") == true) {
                    layerHelper._LAYER_INDEX = null;//关闭当前弹窗
                    return true;
                } else {
                    return false;
                }
            };
        layerHelper._LAYER_INDEX = layer.open({
            id:"layer-"+myRandom.randomNumber(6)
            , title: title
            , type: (url.toUpperCase().indexOf("HTTP")>=0?2:1)
            , content:(url.toUpperCase().indexOf("HTTP")>=0?url:$("#"+url))
            , closeBtn: 0
            , shade: 0
            , area: area
            , offset: "auto"
            , maxmin: (maxmin==null?true:maxmin)
            , btn: (btn?btn:["提交", "关闭"])
            , btn1: ok_callback
            , btn2: cancel_callback
            , success: success_callback
        });
    },

    open3: function (title, dom_id, area, ok_callback, cancel_callback,btn3_title,btn3_callback)
    {
        if (!cancel_callback)//确定关闭弹窗的回调函数
            cancel_callback = function (index, layero)    //取消的回调函数没有定义
            {
                if (confirm("确认退出吗？") == true) {
                    layerHelper._LAYER_INDEX = null;//关闭当前弹窗
                    return true;
                } else {
                    return false;
                }
            };
        layerHelper._LAYER_INDEX = layer.open({
            id:"layer-"+myRandom.randomNumber(6)
            , title: title
            , type: 2
            , content:$('#'+dom_id)
            , closeBtn: 1
            , shade: 0
            , area: area
            , offset: "auto"
            , maxmin: false
            , btn: ["提交", "关闭",btn3_title]
            , btn1: ok_callback
            , btn2: cancel_callback
            , btn3: btn3_callback
        });

    },

    close: function () {
        layer.close(layerHelper._LAYER_INDEX);
        layerHelper._LAYER_INDEX = null;
    },
    closeAll:function()
    {
        layer.closeAll();
        layerHelper._LAYER_INDEX = null;
    },

    loading: function (title,msg) {
        if(!title) title="提示";
        if(!msg) msg="正在努力操作中..."
        layerHelper.loadingIndex = layer.open({title: title, type: 3, content: msg});
    },
    closeLoading:function()
    {
        layer.close(layerHelper.loadingIndex);

    },

    /**
     * 确认对话框
     * @param msg 提示信息
     * @param callback_ok 确认回叫函数,如function(index, layero)
     * @param callback_cancel 取消回叫函数，如function(index)
     */
    confirm:function(msg,callback_ok,callback_cancel) {
        layer.confirm(msg, {
                btn: ['确定', '取消'] //可以无限个按钮
            }
            , callback_ok
            , callback_cancel
        );
    },
    /**
     * 确认对话框
     * @param title 标题
     * @param elm 信息DOM id
     * @param btns 按钮数组，如['确定','取消']
     * @param fn1 第一个按钮的回,如function(index, layero)
     * @param fn2 第二个按钮的回,如function(index, layero)
     * @param callback_cancel 点击右上角关闭的回叫函数，如function(index)
     */
    confirm2:function(title,elm,fn1,fn_cancel) {
        layer.open({
            title:title
            ,content:$("#"+elm)
            ,type:1
            ,btn:["确定",'取消'] //可以无限个按钮
            ,yes: fn1
            ,cancel: fn_cancel
        });
    },
    /**
     * 确认对话框
     * @param title 标题
     * @param elm 信息DOM id
     * @param btns 按钮数组，如['确定','重试','取消']
     * @param fn1 第一个按钮的回,如function(index, layero)
     * @param fn2 第二个按钮的回,如function(index, layero)
     * @param fn3 第一个按钮的回,如function(index, layero)
     * @param callback_cancel 点击右上角关闭的回叫函数，如function(index)
     */
    confirm3:function(title,elm,btns,fn1,fn2,fn3,fn_cancel) {
        layer.open({
            title:title
            ,content:$("#"+elm)
            ,type:1
            ,btn:btns //可以无限个按钮
            ,yes: fn1
            ,btn2: fn2
            ,btn3: fn3
            ,cancel: fn_cancel
        });
    },
    /**
     * 警告框
     * @param msg 信息
     * @param icon 图标，0--感叹号，1--勾号，2--红叉，3--问号
     */
    alert:function(msg,icon)
    {
        if(icon==null) icon=this.ICONS.SUCCESS;
        layer.alert(msg,{icon:icon});
    }
    // /** 刷新当前活动的图层 */
    // refresh:function()
    // {
    //     $('.jqadmin-body .layui-show').children('iframe')[0].contentWindow.location.reload(true);
    // }

}
