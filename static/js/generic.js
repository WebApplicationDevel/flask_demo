/*
 * 导航设置
 * @type {{set: navHelper.set}}
 */
var navHelper = {
    set: function (menuId) {
        $(".layui-nav-itemed").each(function () {
            $(this).removeClass("layui-nav-itemed");
        });

        var parentId = menuId.substr(0, 3);
        $("#" + parentId).trigger("click");
        $("#"+parentId).addClass("layui-nav-itemed");
        //var menu = $("#" + menuId);
        //$("#" + menuId).trigger("click");
        $("#"+menuId).parent('dd').addClass("layui-this");
    },
    openMenu:function(obj)
    {
        var url=$(obj).attr("data-url");
        $.redirect(_GLOBAL.root+url);
    }
}

/* 用户登录信息管理
 *
 * @type type
 */
var loginedInfo = {
    /*
     * 保存用户
     * @param Object loginedInfo
     * @returns {undefined}
     */
    save: function (loginedInfo) {
        //转成字符串，为了避免转码产生的乱码，添加##作为分隔符
        if(typeof loginedInfo=="object") loginedInfo=JSON.stringify(loginedInfo);
        var liStr = loginedInfo;
        //liStr = Base64.encode(liStr);
        $.setcookie("_LOGINED_INFO_", liStr, _GLOBAL.cookie_expire);//写入COOKIE，10小时后失效
    },
    /*
     * 获取当前登录信息
     * @param isTip 是否提示未登录信息
     * @returns Object
     */
    get: function (isTip) {
        var li = $.getcookie("_LOGINED_INFO_");

        if (!li) {
            if(isTip==undefined ||isTip==true) {
                tip("您没有登录或登录已超时，需要重新登录", "error", function () {
                    top.location.href = "/login.html";
                });
            }
            return null;
        }
        else {
            li = decodeURIComponent(li);
            var loginedInfo = JSON.parse(li);
            return loginedInfo;
        }
    },
    /* 获取当前用户组织id */
    getOrgId:function()
    {
        var user=this.get();
        if(user)
            return user.item_id;
    },

    getRole:function()
    {
        var user=this.get();
        if(user.type==roles.ADMIN.name) return roles.ADMIN.id;
        if(user.type==roles.COMPANY.name) return roles.COMPANY.id;
        if(user.type==roles.COLLEGE.name) return roles.COLLEGE.id;
        if(user.type==roles.DEPARTMENT.name) return roles.DEPARTMENT.id;
        if(user.type==roles.STUDENT.name) return roles.STUDENT.id;
    },
    /*
     * 获取当前登录信息JSON
     * @returns String
     */
    getJson: function () {
        var li = $.getcookie("_LOGINED_INFO_");
        if (!li)
            return null;
        else {
            li = decodeURIComponent(li);
            li = Base64.decode(li);
            return li;
        }
    },

    /* 生成token
     * @remark guid是php后端经过smarty发送过来，在后端session中存储了__GUID__，
     *         前端只要将guid放在token里就可以检查是否是服务授权的token。
     *         TOKEN=(guid*随机数$$登录信息json$$随机数)base64编码
     * */
    createToken: function () {
        var uid = $.getcookie("_CLIENT_UID_");
        var r1 = myRandom.randomNumber(2);
        r = parseInt(r1);
        uid = r * parseInt(uid);

        var li = this.getJson();
        if (!li) return null;
        var u = JSON.parse(li);
        var user = {id: u.id, role_id: u.role_id, dept_id: u.dept_id};
        li = JSON.stringify(user);

        var token = uid + "$$" + li + "$$" + r1 + "$$";
        token = Base64.encode(token);

        return token;

    },
    /* 注销当前用户 */
    logout: function (isReload) {

        var ajax_ok_callback = function (resultObj) {
            var result;
            //判断返回值是字串还是对象类型
            if (typeof (resultObj) == "string")
                result = JSON.parse(resultObj);
            else if (typeof (resultObj) == "object")
                result = resultObj;

            top.closeLoading();

            if (result.code == 0) {
                {
                    if(isReload)
                      location.href = _GLOBAL.root+"login.html";
                    else
                       location.reload();
                }
            } else {
                top.tip("提交失败:" + result.msg);
            }
        }

        var callback1 = function (index) {
            $.deletecookie("_LOGINED_INFO_");

            myAjax("logoff.do", null, "post", ajax_ok_callback);
            top.layer.close(index);   //关闭自己
            return true;
        };
        var callback2 = function (index) {
            top.layer.close(index);    //关闭自己
            return false;
        };

        var area = ["250px", "120px"];
        top.lConfirm('确认要注销当前登录帐号吗？',
            {
                btn1: {title: "是", callback: callback1},
                btn2: {title: "否", callback: callback2}
            },
            area);
    },

    /*
     * 显示修改帐号窗口
     */
    showAccountLayer:function(){

        var self=this;

        $.layer({
            id : 'change-account',
            type : 1,
            title :'修改帐号',
            closeBtn : [0 , true],
            offset:['20%','30%'],
            border : [10 , 0.3 , '#000', true],
            area : ['450px','400px'],
            page : {dom :"#layer-account"}
        });

        $("#layer-account").removeClass("none");
    },

    /*修改用户名 */
    saveAccount: function () {
        var username = $.trim($("#account").val());
        var pass = $.trim($("#password").val());
        var pass2 = $.trim($("#password1").val());
        if (username.length < 2 || username.length > 16) {
            layer.msg("用户名长度应该为2-16位！", 2, 8);
            return false;
        }
        if (pass.length < 6 || pass.length > 20) {
            layer.msg("密码长度应该为6-20位！", 2, 8);
            return false;
        }
        if (pass != pass2) {
            layer.msg("两次密码不匹配！", 2, 8);
            return false;
        }

        var data = {id: "#USER-ID#", name: username, password: pass}
        $.post(_GLOBAL.root + "api/merge/admin", {data: JSON.stringify(data)}
            , function (ret) {
                layer.closeAll();
                var result;
                //判断返回值是字串还是对象类型
                if (typeof (ret) == "string")
                    result = JSON.parse(ret);
                else if (typeof (ret) == "object")
                    result = ret;

                if (result.code == 0) {
                    tip("保存成功，下次登录时使用新帐号！！", "success");
                } else {
                    tip("提交失败:" + result.msg, "error");
                }
            });
    }
}

//<editor-fold defaultstate="collaplsed" desc="扩展$函数">

/*
 * 跳转新页面，同时post传递参数
 * 示例：$.redirect('url/path/req',{arg0:'arg0',arg1:'arg1'});
 * @param url 要跳转的ulr
 * @param args 参数
 * @param isNewTab 是否在新窗口中打开
 */
$.redirect = function (url, args, isNewTab) {
    //创建form表单
    var temp_form = document.createElement("form");
    temp_form.action = url;
    //如需打开新窗口，form的target属性要设置为'_blank'
    if(isNewTab==undefined)
        temp_form.target = "_self";
    else if(isNewTab==true)
        temp_form .target = "_blank";

    temp_form.method = "post";
    temp_form.style.display = "none";
    //添加参数
    if(args!=null) {
        for (var item in args) {
            var opt = document.createElement("textarea");
            opt.name = item;
            opt.value = args[item];
            temp_form.appendChild(opt);
        }
    }
    document.body.appendChild(temp_form);
    //提交数据
    temp_form.submit();

};

/*
 * 关闭当前窗口
 */
$.closeMe=function()
{

    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
            window.opener = null;
            window.close();
        } else {
            window.open('', '_top');
            window.top.close();
        }
    }
    else if (navigator.userAgent.indexOf("Firefox") > 0) {
        window.location.href = 'about:blank ';
    } else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
    }

}
/* 根据文本设置下拉框选中项 */
$.selectText = function (selectId, text) {
    var count = $("#" + selectId + "  option").length;

    for (var i = 0; i < count; i++) {
        if ($("#" + selectId).get(0).options[i].text == text) {
            $("#" + selectId).get(0).options[i].selected = true;
            break;
        }
    }
}
;

/*全局函数************************************************************************************************************/
//json操作
$.json = {
    toString: function (object) {
        var string = "{";
        for (var x in object) {
            string += '"' + x + '":' + object[x];
        }
        string += "}";
        return string;
    },
    count: function (object) {
        var n = 0;
        for (var x in object) {
            ++n;
        }
        return n;
    },
    toObject: function (json) {
        return eval("(" + json + ")");
    }
};

//设置cookie
$.setcookie = function (name, value, life) {
    var cookie = name + "=" + Base64.encode(value+"$$$");
    if (life > 0) {
        var date = new Date();
        date.setTime(date.getTime() + life * 1000);
        cookie += "; expires=" + date.toGMTString();
    }
    cookie+=";path=/";
    document.cookie = cookie;
}

//获取cookie值
$.getcookie = function (name) {
    var cookie = document.cookie;
    var array = cookie.split("; ");
    var n = array.length;
    for (var i = 0; i < n; i++) {
        var arr = array[i].split("=");
        if (arr[0] == name) {
            {
                var str = Base64.decode(arr[1]);
                return str.split("$$$")[0];
            }
        }
    }
    return null;
}

//删除cookie
$.deletecookie = function (name) {
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = name + "=''; expires=" + date.toGMTString()+ ";path=/";
}


//判断是否存在空格
$.checkspace = function (string) {
    return string.match(/\s+/);
};


//去除空白字符
$.stripspace = function (string) {
    return string.replace(/\s*/g, "");
};

/*
 * 判断id对应对象是否存在
 * @param id
 * @returns {boolean}
 */
$.exist=function(id)
{
    return $("#"+id).length>0;
}

//</editor-fold>

//<editor-fold defaultstate="collaplsed" desc="常用工具">
/*
 * 获取元素对象的属性值，并转换成对象
 * @param {元素对象} obj
 * @param {元素对象属性} attr
 * @param {jquery} $
 */
function getParams(obj, attr, $) {
    var params = $(obj).attr(attr);
    if (params) {
        if (typeof (params) == "string") {
            return new Function("return " + params)();
        }
    }
    return params;
}

/* 取Url根（主机和端口）*/
function getUrlRoot() {
    return window.location.host;
}

/*
 * 重复字符串
 * @param {type} str 要重复的字符串
 * @param {type} count 重复次数
 * @returns {String}
 */
function strRepeat(str, count) {
    var ret = "";
    for (var i = 0; i < count; i++) {
        ret += str;
    }
    return ret;
}

/*
 * 从当前URL中获取GET参数
 * @param string name 参数名称
 * @returns string
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}

//</editor-fold>

//<editor-fold defaultstate="collaplsed" desc="扩展JS类Date、String、Array类的操作方法">
/*
千分符（带逗号）格式化输出数字
 */
function numFormat(num) {
    var c = (num.toString().indexOf ('.') !== -1) ? num.toLocaleString() : num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    return c;
}


/* 格式化日期时间 */
Date.prototype.pattern = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()//毫秒
    };
    var week = {
        "0": "\u65e5",
        "1": "\u4e00",
        "2": "\u4e8c",
        "3": "\u4e09",
        "4": "\u56db",
        "5": "\u4e94",
        "6": "\u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

/* 去除文件扩展名 */
String.prototype.removeExt = function () {
    var reg = /\.[^.]+$/;
    return this.replace(reg, '');
}
/* 转换为uri编码 */
String.prototype.toURICode = function () {
    return encodeURIComponent(this);
}
/* 取文件扩展名 */
String.prototype.getExt = function () {
    return (-1 !== this.indexOf('.')) ? this.replace(/.*[.]/, '') : '';
}


/* 替换全局字符串 */
String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
}
/* 判断是否为数字 */
String.prototype.isNumeric = function () {
    try {
        var f = parseFloat(this);
        if (f.toString().toUpperCase() == "NAN")
            return false;
        else
            return true;
    } catch (e) {
        return false;
    }
}

/* 字符串转整数 */
String.prototype.toInt = function () {
    try {
        var f = parseInt(this);
        if (f.toString().toUpperCase() == "NAN")
            return 0;
        else
            return f;
    } catch (e) {
        return 0;
    }
}
//首字母大写
String.prototype.firstUpper = function () {
    return this.substring(0, 1).toUpperCase() + this.substring(1);
}
//首字母小写
String.prototype.firstLower = function () {
    return this.substring(0, 1).toLowerCase() + this.substring(1);
}
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.LTrim = function () {
    return this.replace(/(^\s*)/g, "");
}
String.prototype.RTrim = function () {
    return this.replace(/(\s*$)/g, "");
}
String.prototype.toDate = function () {
    return new Date(this.replace(/-/g, "/"));
}
/* 清除html标签 */
String.prototype.clearHtml = function () {
    return this.replace(/<[^>]+>/g,"").replaceAll("&nbsp;","");
}

/* 从左边取n个子串 */
String.prototype.left = function (n) {
    if (n > this.length) n = this.length;
    return this.substring(0, n);
}

/* 从右边取n个子串 */
String.prototype.right = function (n) {
    var start = 0;
    if (n > this.length)
        start = 0;
    else
        start = this.length - n;
    return this.substring(start);
}

/*
 * 按给定长主自动在左边补齐字符
 * @param s 使用字符
 * @param n 长度
 * @returns {*}
 */
String.prototype.leftPad = function (s, n) {
    if(typeof s!='string') s=s.toString();
    s = s || " ";
    if (this.length < n) {
        var ts = new Array(n - this.length+1);
        ts[n - this.length] = this;
        for (var i = 0; i < n - this.length; i++) {
            ts[i] = s;
        }
        return ts.join("");
    } else {
        return this;
    }
}

/*
 * 计算末尾连接字符数量
 * @param s 要查的字符串
 * @param char 要查的字符
 * @returns {int}
 */
String.prototype.charLenFromRight=function(char)
{

    var len=0;
    if (this.length ==0) return 0;
    else if(this.substr(this.length-1,1)!=char) return 0;
    else
    {
        for (var i = this.length-1;i>=0; i--) {
            if(this.substr(i,1)==char) len++;
            else break;
        }
        return len;
    }
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
}


/*
 *根据值查找所在位置index值，查不到就返回-1
 */
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val)
            return i;
    }
    return -1;
};


/*
 *根椐值删除元素
 */
Array.prototype.removeByVal = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
/*
 *根椐值删除元素
 */
Array.prototype.removeByIndex = function (index) {
    if (index > -1) {
        this.splice(index, 1);
    }
};

/*
 * 交换元素
 * @param int index1 序号1
 * @param int index2 序号2
 * @returns {Array.prototype}
 */
Array.prototype.swap = function (index1, index2) {
    this[index1] = this.splice(index2, 1, this[index1])[0];
    return this;
}

/*
 * 上移元素
 * @param int index 元素序号
 * @returns {undefined}
 */
Array.prototype.up = function (index) {
    if (index == 0) {
        return;
    }
    return this.swap(index, index - 1);
};

/*
 * 下移元素
 * @param int index 元素序号
 * @returns {undefined}
 */
Array.prototype.down = function (index) {
    if (index == this.length - 1) {
        return;
    }
    this.swap(index, index + 1);
};

//加n天后的日期
Date.prototype.addDays = function (days) {
    //return this ;
    this.setDate(this.getDate() + days);
    return this;
}

//加n月后的日期
Date.prototype.addMonths = function (months) {
    var y = this.getFullYear();
    var m = this.getMonth();
    var d = this.getDay();
    if ((m - months) > 0)
        return (new Date(y, m - months - 1, d));
    else {
        y = y - Math.floor(Math.abs(m - months) / 12) - 1;
        m = 12 - months % 12;
        return (new Date(y, m - months - 1, d));
    }
}

//数字到中文的转化
function digit_uppercase(n) {
    var fraction = ['角', '分'];
    var digit = [
        '零', '壹', '贰', '叁', '肆',
        '伍', '陆', '柒', '捌', '玖'
    ];
    var unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ];
    var head = n < 0 ? '欠' : '';
    n = Math.abs(n);
    var s = '';
    for (var i = 0; i < fraction.length; i++) {
        s += (digit[Math.floor(shiftRight(n, 1 + i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);
    for (var i = 0; i < unit[0].length && n > 0; i++) {
        var p = '';
        for (var j = 0; j < unit[1].length && n > 0; j++) {
            p = digit[n % 10] + unit[1][j] + p;
            n = Math.floor(shiftLeft(n, 1));
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return head + s.replace(/(零.)*零元/, '元')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整');
}

// 向右移位
function shiftRight(number, digit){
    digit = parseInt(digit, 10);
    var value = number.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + digit) : digit))
}
// 向左移位
function shiftLeft(number, digit){
    digit = parseInt(digit, 10);
    var value = number.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - digit) : -digit))
}


//</editor-fold>


/**********日期函数 *******************/
var myDate = {
    /*
     * 获取当前tick时间
     * @returns {Number}
     */
    getTick: function () {
        var now = new Date();
        return now.getTime();
    },
    getCurrentYear: function () {
        var mydate = new Date();
        return mydate.getFullYear(); //获取完整的年份(4位,1970-????)
    },
    getCurrentMonth: function () {
        var mydate = new Date();
        return mydate.getMonth();
    },
    getCurrentDay: function () {
        var mydate = new Date();
        return mydate.getDay();
    },
    getCurrentHour: function () {
        var mydate = new Date();
        return mydate.getHours();
    },
    getCurrentMinutes: function () {
        var mydate = new Date();
        return mydate.getMinutes();
    },
    getCurrentSeconds: function () {
        var mydate = new Date();
        return mydate.getSeconds();
    },
    getCurrentDate: function (fmt) {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();

        if (fmt == "yyyy-MM")
            return y + '-' + (m < 10 ? ('0' + m) : m);
        else if (fmt == "yyyy-MM-dd")
            return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
        else
            return date.toLocaleDateString();

    },
    getPreMonth: function (date) {
        var arr = date.split('-');
        var year = arr[0]; //获取当前日期的年份
        var month = arr[1]; //获取当前日期的月份

        var year2 = year;
        var month2 = parseInt(month) - 1;
        if (month2 == 0) {//如果是1月份，则取上一年的12月份
            year2 = parseInt(year2) - 1;
            month2 = 12;
        }

        if (month2 < 10) {
            month2 = '0' + month2;//月份填补成2位。
        }
        var t2 = year2 + '-' + month2;
        return t2;
    },
    //计算日期相差天数
    diffDays: function (dt1, dt2) {
        var time1 = new Date(dt1);                                //创建时间1
        var time2 = new Date(dt2);                                //创建时间2
        /*
         *如果求的时间差为天数则处以864000000，如果是小时数则在这个数字上
         *除以24，分钟数则再除以60，依此类推
         */
        var days = (time1.getTime() - time2.getTime()) / 86400000;

        return days;  //处理时间大小问题
    },
    //计算时间相差分钟数
    diffMinuts: function (dt1, dt2) {
        if (dt1 == null || dt2 == null)
            return 0;
        //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
        dt1 = dt1.replace(/\-/g, "/");
        dt2 = dt2.replace(/\-/g, "/");
        var time1 = new Date(dt1);                                //创建时间1
        var time2 = new Date(dt2);                                //创建时间2
        /*
         *如果求的时间差为天数则处以864000000，如果是小时数则在这个数字上
         *除以24，分钟数则再除以60，依此类推
         */
        var s = (time1.getTime() - time2.getTime()) / (86400000 / 24 / 60);

        return s;  //处理时间大小问题
    },
    //计算时间相差秒数
    diffSeconds: function (dt1, dt2) {
        //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
        dt1 = dt1.replace(/\-/g, "/");
        dt2 = dt2.replace(/\-/g, "/");
        var time1 = new Date(dt1);                                //创建时间1
        var time2 = new Date(dt2);                                //创建时间2
        /*
         *如果求的时间差为天数则处以864000000，如果是小时数则在这个数字上
         *除以24，分钟数则再除以60，依此类推
         */
        var s = (time1.getTime() - time2.getTime()) / (86400000 / 24 / 60 / 60);

        return s;  //处理时间大小问题
    },
    addDays: function (dt, days) {
        //创建开始时间对象
        var date = new Date(dt);
        //设置增加的天数
        date.setDate(date.getDate() + days);
        return date;
    },
    today:function(fmt)
    {
        return this.format(null,fmt)
    },
    //格式化为yyyy-mm-dd
    format: function (date, fmt) {
        if (typeof date === "string")
            date = new Date(date);
        else
            date = new Date();

       if(fmt==null || fmt=="")
           fmt="yyyy-MM-dd HH:mm:ss";

       return date.pattern(fmt);
    },
    //格式化为yyyy-mm-dd HH:mm:ss
    formatLong: function (date) {
        if (typeof date === "string")
            date = new Date(date);
        else
            date = new Date();
        return date.pattern("yyyy-MM-dd HH:mm:ss");
    },
    //转换为日期
    parseDate: function (s) {
        if (!s)
            return new Date();
        var ss = (s.split('-'));
        var y = parseInt(ss[0], 10);
        var m = parseInt(ss[1], 10);
        var d = parseInt(ss[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            return new Date(y, m - 1, d);
        } else {
            return new Date();
        }
    },
    isDate: function (s) {
        try {
            if (!s)
                return false;
            var ss = (s.split('-'));
            var y = parseInt(ss[0], 10);
            var m = parseInt(ss[1], 10);
            var d = parseInt(ss[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return new Date(y, m - 1, d);
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    },
    //长整型微秒时间转标准日期
    long2date: function (iTime) {
        var d = new Date();
        d.setTime(iTime);
        return this.format(d,'yyyy-MM-dd');
    }, //长整型微秒时间转标准时间 hh:mm:ss
    long2time: function (iTime) {
        var d = new Date();
        d.setTime(iTime);
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    },
    //长整型微秒时间转标准时间 hh:mm:ss
    long2DateTime: function (iTime) {
        var d = new Date();
        d.setTime(iTime);
        return d.pattern("yyyy-MM-dd HH:mm:ss");
    },
    /* 获取月份的天数 */
    getMonthDays: function (year, month) {
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12)
            return 31;
        else if (month == 2 && year % 4 == 0)
            return 29;
        else if (month == 2 && year % 4 != 0)
            return 28;
        else
            return 30;
    },
    getMonthDays2: function (ym) {
        var year = ym.split("-")[0];
        var month = ym.split("-")[1];
        return myDate.getMonthDays(year, month);
    }
}

//随机数工具
var myRandom = {
    numberString: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    rangeString: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    //生成随机的len个数字
    randomNumber: function (len) {
        var self = this;
        var str = "", pos;
        for (var i = 0; i < len; i++) {
            pos = Math.round(Math.random() * (self.numberString.length - 1));
            str += self.numberString[pos];
        }
        return str;
    },
    //生成随机的range个字符
    randomWord: function (range) {
        var self = this;
        var str = "", pos;
        for (var i = 0; i < range; i++) {
            pos = Math.round(Math.random() * (self.rangeString.length - 1));
            str += self.rangeString[pos];
        }
        return str;
    },

    /*
     * 生成minNum-maxNum之间的随机整数
     * @param minNum 下限
     * @param maxNum 上限
     * @returns {number}
     */
    randomNum:function (minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
            break;
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
            break;
        default:
            return 0;
            break;
    }
}
}

/******** AES加解密 ***********************************************************
 ** 使用方法：必须引用common/js/cryptoJS_3.1.2下的aes.js和pad-zeropadding-min.js
 ** 注意问题：密文格式为16进制，解密时需要将密文解析成base64字符器
 ******************************************************************************/
var AES = {
    key: '1362749773868738',
    iv: '1362749773868738',

    //初始化
    init: function () {

    },
    /*
     * 加密数据
     * @param {type} data 待加密的字符串
     * @param {type} keyStr 秘钥
     * @param {type} ivStr 向量
     * @returns {unresolved} 加密后的数据
     */
    encrypt: function (data, keyStr, ivStr) {
        var self = this;
        var key, iv;

        if (keyStr != undefined)
            if (keyStr.length >= 16)
                key = CryptoJS.enc.Utf8.parse(keyStr.substring(0, 16));
            else if (keyStr.length < 16)  //如果长度小于16
                key = CryptoJS.enc.Utf8.parse(keyStr + self.key.substring(keyStr.length));
            else
                key = CryptoJS.enc.Utf8.parse(self.key);

        if (ivStr != undefined)
            if (ivStr.length >= 16)
                iv = CryptoJS.enc.Utf8.parse(ivStr.substring(0, 16));
            else if (ivStr.length < 16)  //如果长度小于16
                iv = CryptoJS.enc.Utf8.parse(ivStr + self.iv.substring(ivStr.length));
            else
                iv = CryptoJS.enc.Utf8.parse(self.iv);

        var sendData = CryptoJS.enc.Utf8.parse(data);
        var encrypted = CryptoJS.AES.encrypt(sendData, key,
            {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding});
        return encrypted.ciphertext;
        //return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    },
    /*
     *
     * @param {type} data BASE64的数据
     * @param {type} keyStr 解密秘钥
     * @param {type} ivStr 向量
     * @returns {undefined}
     */
    decrypt: function (data, keyStr, ivStr) {
        var self = this;
        var key, iv;

        if (keyStr != undefined)
            if (keyStr.length >= 16)
                key = CryptoJS.enc.Utf8.parse(keyStr.substring(0, 16));
            else if (keyStr.length < 16)  //如果长度小于16
                key = CryptoJS.enc.Utf8.parse(keyStr + self.key.substring(keyStr.length));
            else
                key = CryptoJS.enc.Utf8.parse(self.key);

        if (ivStr != undefined)
            if (ivStr.length >= 16)
                iv = CryptoJS.enc.Utf8.parse(ivStr.substring(0, 16));
            else if (ivStr.length < 16)  //如果长度小于16
                iv = CryptoJS.enc.Utf8.parse(ivStr + self.iv.substring(ivStr.length));
            else
                iv = CryptoJS.enc.Utf8.parse(self.iv);

        //解密的是基于BASE64的数据，此处data是BASE64数据
        data = CryptoJS.enc.Base64.stringify(data);
        var decrypted = CryptoJS.AES.decrypt(data, key,
            {iv: iv, padding: CryptoJS.pad.ZeroPadding});
        //var decrypted = CryptoJS.AES.decrypt(data, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding });
        var str = decrypted.toString(CryptoJS.enc.Utf8);
        return str;
    }

}

///////////////////////////////
// 结果代码
///////////////////////////////
var ResultCode = {
    /* 成功 **/
    Success: "SUCCESS",
    /* 失败 **/
    Failed: "FAILED",
    /* 验证码错误 **/
    VerifyCodeError: "ERROR-0001",
    /* 登录用户名错误 **/
    LoginUserError: "ERROR-0002",
    /* 登录口令错误 **/
    LoginPwdError: "ERROR-0003",
    /* 登录失败 **/
    LoginFailedError: "ERROR-0004",
    /*注册存在相同用户**/
    RigisterSameUser: "ERROR-0005",
    /*注册时数据写入错误**/
    RigisterDateError: "ERROR-0006",
    /*用户信息修改时数据写入错误**/
    EditUserDateError: "ERROR-0007",
    /*登录时用户帐号锁定/禁用**/
    UserIsLockedError: "ERROR-0008",
    /*未登录或者不是管理员 **/
    UnloginedOrUnAdmin: "ERROR-0009",
    /*非法的数值型 **/
    UnNumeric: "ERROR-0010",
    /*没有要操作的数据项 **/
    NoData: "ERROR-0012",
    /*用户名已存在 **/
    ExistUser: "ERROR-0013",
    /*手机号码已存在 **/
    ExistMobile: "ERROR-0014",
    /*需要管理员身份 **/
    NeedAdmin: "ERROR-0015",
    /*异常信息 */
    Exception: "ERROR-0016",
    /*未登录 */
    Unlogined: "ERROR-0017",
    /*手机验证码错误 */
    SmsCodeError: "ERROR-0018",

    /*文件上传失败 **/
    UploadedFail: "ERROR-0021",
    /*参数格式不正确 **/
    UnvalidatParameters: "ERROR-0022",

    /* 解析错误代码*/
    parseErrorCode: function (errorCode) {
        if (errorCode.indexOf(ResultCode.Exception) >= 0)
            return errorCode.split("#")[1];

        switch (errorCode) {
            case ResultCode.VerifyCodeError:
                return "验证码错误";
            case ResultCode.LoginUserError:
                return "登录用户名错误";
            case ResultCode.LoginPwdError:
                return "登录口令错误";
            case ResultCode.LoginFailedError:
                return "登录失败";
            case ResultCode.RigisterSameUser:
                return "存在登陆名/电话相同的用户";
            case ResultCode.RigisterDateError:
                return "用户注册失败";
            case ResultCode.EditUserDateError:
                return "信息修改失败";
            case ResultCode.UserIsLockedError:
                return "登录时用户帐号锁定/禁用";
            case ResultCode.UnloginedOrUnAdmin:
                return "未登录或者不是管理员";
            case ResultCode.UnNumeric:
                return "非法的数值型";
            case ResultCode.Failed:
                return "操作失败";
            case ResultCode.NoData:
                return "没有要操作的数据项";
            case ResultCode.ExistUser:
                return "用户名已存在";
            case ResultCode.ExistMobile:
                return "手机号码已存在";
            case ResultCode.NeedAdmin:
                return "您当前未登录或者不是管理员身份登录";
            case ResultCode.Exception:
                return "异常";
            case ResultCode.Unlogined:
                return "未登录";
            case ResultCode.SmsCodeError:
                return "手机短信验证码错误";

            case ResultCode.UploadedFail:
                return "文件上传失败";
            /*参数格式不正确 **/
            case ResultCode.UnvalidatParameters:
                return "参数格式不正确";

            default:
                return errorCode.replace("ERROR:", "");
        }
    }
}


/////////////////////////////////
// KeyPress事件和检查录入
////////////////////////////////
var keyPressChecker = {

    //只能输入正整数，使用方法：onkeyup="keyPressChecker.keyInteger(this)"    onafterpaste="keyPressChecker.keyInteger(this)"
    keyInteger: function (obj) {
        if (obj.value.length == 1) {
            obj.value = obj.value.replace(/[^1-9]/g, '')
        } else {
            obj.value = obj.value.replace(/\D/g, '')
        }
    },
    //键盘事件，使用方法：style="ime-mode:disabled;" onpaste="return false;"  onkeypress="keyPress()"
    keyNumeric: function () {
        var keyCode = event.keyCode;
        if ((keyCode >= 48 && keyCode <= 57)) {
            event.returnValue = true;
        } else {
            event.returnValue = false;
        }
    },
    //仅能输入数字，使用方法：同上
    keyDecimal: function () {
        return (/[\d.]/.test(String.fromCharCode(event.keyCode)));
    },
    //仅能输入数字和“-”，使用方法：同上
    keyDate: function () {
        return (/[\d.]/.test(String.fromCharCode(event.keyCode)));
    }


}

/* 内容格式检查器 */
var myChecker = {
    //判断是否为汉字
    ischinese: function (string) {
        return string.match(/[\u4E00-\u9FA5]/g);
    },

    //判断是否为手机
    ismobile: function (string) {
        return string.match(/^1[34578][0-9]{9}$/);
    },
    //是否手机号码
    isMobile: function (value) {
        if (!(/^1[34578]\d{9}$/.test(value))) {
            return false;
        }
        else
            return true;
    },
    //是否为数字
    isNumeric: function (val) {
        if (val == "")
            return false;
        return !isNaN(val);
    },
    //是否为电话号码
    isPhone: function (str) {
        var reg = /^0\d{2,3}-?\d{7,8}$/;
        return (reg.test(str));
    },
    //检查是否邮箱正确格式
    isEmail: function (str) {
        var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        return myreg.test(str);
    },
    //是否为日期
    isDate: function (str) {
        var a = /^(\d{4})-(\d{2})-(\d{2})$/
        if (!a.test(str)) {
            //alert("日期格式不正确!")
            return false
        }
        return true;
    },
    //是否为时间
    isTime: function (str) {
        var reg = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
        var r = str.match(reg);
        if (r == null)
            return false;
        return true;
    },
    //是否为邮编
    isZip: function (str) {
        var re = /^[1-9][0-9]{5}$/;
        if (!re.test(str)) {
            return false
        }
        return true;
    },
    //是否为密码
    isPasswd: function (s) {
        //var patrn=/^(\w){6,20}$/;
        var patrn = /^(\w){6,16}$/;
        if (!patrn.exec(s))
            return "密码格式不正确"
        return true
    },

    /* 返回密码的强度级别 */
    checkStrong: function (sPW) {
        var self=this;
        if (sPW.length <= 4)
            return 0; //密码太短
        Modes = 0;
        for (i = 0; i < sPW.length; i++) {
            //测试每一个字符的类别并统计一共有多少种模式.
            Modes |= self.CharMode(sPW.charCodeAt(i));
        }
        return self.bitTotal(Modes);
    },
    CharMode: function (iN) {
        if (iN >= 48 && iN <= 57) //数字
            return 1;
        if (iN >= 65 && iN <= 90) //大写字母
            return 2;
        if (iN >= 97 && iN <= 122) //小写
            return 4;
        else
            return 8; //特殊字符
    },

//计算出当前密码当中一共有多少种模式
    bitTotal: function (num) {
        modes = 0;
        for (i = 0; i < 4; i++) {
            if (num & 1) modes++;
            num >>>= 1;
        }
        return modes;
    }
}

/*
 * 表单提交操作
 * @type type
 */
var formSubmitor = {
    //表单id
    formId: null,
    //是否在子页面里操作
    inFrame: true,
    check:function(formId){
        return this.validate(formId);
    },
    /* 表单数据有效性检查器 */
    validate: function (formId) {
        var flag = true;
        //表单元素值比较时的信息提示增强;
        if (formId) this.formId = formId;

        $("#" + this.formId).find("input").each(function () {
            var self = $(this);
            var val = self.attr("required");
            if (val) {
                if (self.val() == "") {
                    self.addClass('error');
                    flag = false;
                } else
                    self.removeClass('error');
            }

            var type = self.attr("data-type");
            if (type && self.val() != "") {
                var f = false;
                switch (type) {
                    case "numeric":
                        f = myChecker.isNumeric(self.val());
                        break;
                    case "date":
                        f = myChecker.isDate(self.val());
                        break;
                    case "mobile":
                        f = myChecker.isMobile(self.val());
                        break;
                    case "phone":
                        f = (myChecker.isPhone(self.val())||myChecker.isMobile(self.val()));
                        break;
                    case "email":
                        f = myChecker.isEmail(self.val());
                        break;
                    case "zip":
                        f = myChecker.isZip(self.val());
                        break;
                    default:
                        f = true;
                        break;
                }

                if (!f) {
                    flag = f;
                    self.addClass('error');
                } else {
                    self.removeClass('error');

                }
            }
        });

        $("#" + this.formId).find("select").each(function () {
            var self = $(this);
            var val = self.attr("required");
            if (val) {
                var t = self.find("option:selected").text();
                if (self.find("option:selected").text() == ""
                    || self.find("option:selected").text().indexOf("选择") >= 0
                    || self.find("option:selected").text().indexOf("全体") >= 0) {
                    self.addClass('error');
                    flag = false;
                } else
                    self.removeClass('error');
            }
        });

        $("input[type='hidden']").each(function(){
            var self=$(this);
            var val=self.attr("required");
            //console.log("hidden input id:"+self.attr("id"));

            if(val)
            {
                var id=self.attr("id");
                if(self.val()=="" || self.val()=="0")
                {
                    $("#error-"+id).removeClass("none");
                    $("#"+id).parent().addClass("error");
                    flag=false;
                }
                else
                {

                    $("#error-"+self.attr("id")).addClass("none");
                    $("#"+id).parent().removeClass("error");
                }
            }
        })

        return flag;
    },

    /* 提示表单数据
     * @param formId string 表单id
     * @param fn function 成功后要执行的功能或跳转URL
     * */
    submit: function (formId, fn,async,refresh) {
        if(!formId) formId="myForm";
        var self = this;
        self.formId = formId;

        if (!self.validate()) {
            top.tip("请检查必输项是否空缺,或者数据格式是否正确！");
            return;
        }

         top.loading('提示', "正在保存，请稍候...");
        if(async==undefined) async=true;

        var method = $("#" + formId).attr("data-method");
        if(!method) method="post";
        var table = $("#" + formId).attr("data-table");

        // $("#btn-submit").text("提交中...").attr({"disabled":"disabled"});
        var options = {
            url: _GLOBAL.root+"service/merge/"+table,
            async:async,
            data: {

            },
            type: method,
            success: function (resultObj) {
                var result;
                //判断返回值是字串还是对象类型
                if (typeof(resultObj) == "string")
                    result = JSON.parse(resultObj);
                else if (typeof(resultObj) == "object")
                    result = resultObj;
                top.closeLoading();
                if (result.code == 0) {
                    top.layerHelper.close();
                    top.tip("提交成功！","success");
                    if(!fn && (refresh==undefined || refresh==true) )
                        top.refresh();//刷新表格
                    else {
                        if(typeof(fn)=="string")
                            location.href=fn;
                        else if(typeof(fn)=="function")
                            fn.call();
                    }

                }
                else {
                   top.tip("提交失败:" + result.msg);
                }
            },
            error: function (e) {
                top.closeLoading();
                top.tip("提交失败：无法连接服务器", "error");
            }
        }
        var data = {};

        $("#"+formId).find(".is-field").each(function () {
            data[this.id] = this.value.trim();
        });

        options.data = {data:JSON.stringify(data),token:_GLOBAL.token};
        $.ajax(options);
    },

    /* 提示表单数据 */
    submit2: function (formId, inFrame,fn_success) {
        if(!formId) formId="myForm";
        var self = this;
        self.formId = formId;
        if (inFrame) self.inFrame = inFrame;
        else inFrame = true;

        if (!self.validate())
            return;

        //以下提示均定义在home-index.js中
        if (self.inFrame)
            top.loading('提示', "正在保存，请稍候...");
        else
            loading('提示', "正在保存，请稍候...");

        var method = $("#" + formId).attr("method");
        if(!method) method="post";
        var table = $("#" + formId).attr("data-table");


        if(fn_success==null)
            fn_success=function (resultObj) {
            var result;
            //判断返回值是字串还是对象类型
            if (typeof(resultObj) == "string")
                result = JSON.parse(resultObj);
            else if (typeof(resultObj) == "object")
                result = resultObj;

            if (self.inFrame) top.closeLoading();
            else closeLoading();
            if (result.code == 0) {
                //alert("提交成功！");
                top.closeLayer();
                top.refresh();//刷新表格
            }
            else {
                if (self.inFrame) top.tip("提交失败:" + result.msg);
                else tip("提交失败:" + result.msg);
            }
        };

        // $("#btn-submit").text("提交中...").attr({"disabled":"disabled"});
        var options = {
            url: _GLOBAL.root+"api/merge/"+table,
            data: {

            },
            type: method,
            success: fn_success,
            error: function (e) {
                if (self.inFrame) top.closeLoading();
                else closeLoading();

                if (self.inFrame) top.tip("提交失败：无法连接服务器", "error");
                else tip("提交失败:无法连接服务器！", "error");

            }
        }
        var data = {};

        $("#"+formId).find(".is-field").each(function () {
            data[this.id] = this.value.trim();
        });

        options.data = {data:JSON.stringify(data)};

        $.ajax(options);
    }

}

/*
 * ajax传输工具
 * @param string api 要访问的url
 * @param json data 要传输的参数
 * @param string method 访问方法
 * @param fun success_callback 成功时的回调函数
 * @param fun error_callback 失败时的回调函数
 * @param bool async 同/异步，默认异步
 * @param hasLoading 是否需要进度提示
 * @param hasTip 是否提示保存成功
 * @param hasRefresh 是否需要刷新页面
 * @returns {undefined}
 */
var myAjax = function (api, data, method, success_callback, error_callback,async,hasLoading,hasTip,hasRefresh) {
    if (!api)
        return;

    if (!method)
        method = "get";
    if (!data) {
        data={};
    }

    if(async==null)
        async=true;

    if (!success_callback)   //定义默认成功回调函数
    {
        success_callback = function (resultObj) {
            var result;
            //判断返回值是字串还是对象类型
            if (typeof (resultObj) == "string")
                result = JSON.parse(resultObj);
            else if (typeof (resultObj) == "object")
                result = resultObj;

            top.layerHelper.closeLoading();
            if (result.code == 0) {
                if(hasTip==null || hasTip==true) {
                    top.tip("提交成功！", 1);
                }
                if(hasRefresh==null || hasRefresh==true)
                {
                    top.refresh();//刷新表格
                }
            } else {
                    top.tip("提交失败:" + result.msg);
            }
        };
    }

    if (!error_callback) //定义默认失败回调函数
    {
        error_callback = function () {
            top.layerHelper.closeLoading();
            top.tip("提交失败：无法连接服务器", "error");

        };
    }

    data["token"]=_GLOBAL.token;

    var url=api;

    if(url.toUpperCase().indexOf("HTTP")<0)
        url=_GLOBAL.root + api;

    if(url.toLowerCase().indexOf("/get/")>0)
        data["r"]=Math.random();

    var options = {
        url: url,
        data: data,
        type: method,
        async:async,
        success: success_callback,
        error: error_callback
    }

    if(hasLoading==null || hasLoading==true)
        top.layerHelper.loading("提示", "正在努力操作中...");

    $.ajax(options);

}

/*
 * 数据操作
 * @type {{}}
 */
var myDao={
    /*
     * 为表格加载数据
     * @tableId layui表格dom对象id，必输
     * @where 表格查询条件，可选
     * @done function 加载完成的回叫函数,可选
     * done: function(res, curr, count){
                    top.tip("加载完成");
                }
     * */
    loadTable:function(tableId,where,done)
    {
        if(tableId==null)
        {
            top.tip("没有指定表格","error");
            return;
        }

        var lay_data;
        if(typeof tableId =="string")
            lay_data=$("#"+tableId).attr("lay-data");
        else if(typeof tableId=="object")
            lay_data=$(tableId).attr("lay-data");

        if(lay_data==null || lay_data=="")
        {
            top.tip("表格属性为空","error");
            return;
        }

        var json=JSON.parse(lay_data);
        var lay_tab=json.id;
        var tabName=json.data;
        var url=json.url;
        var order=json.order;
        var filter=json.filter;
        var page=json.page;
        var fields=json.fields;

        var w={"token":_GLOBAL.token};

        if(where==null || where=="")
        {
            //w.where="";
            if(filter!=null && filter!="")
                w.where=filter;
            else w.where=""; //必须给个空值，才能清除上次查询条件
        }
        else
        {
            w.where= encodeURIComponent(where);
        }

        if(order!=null && order!="")
            w.order=order;
        if(fields!=null && fields!="")
            w.fields=fields;

        // if(filter!=null && filter!="")
        //     w.where=filter;

        var json_url;
        if(tabName && tabName!="")
            json_url=_GLOBAL.root+'service/get/'+tabName;
        else if(url && url!="")
            json_url=_GLOBAL.root+url;
        else
        {
            top.tip("表格数据路径错误","error");
            return;
        }

        if(page==null || page==false)
        {
            layui.table.reload(lay_tab, {
                url: json_url
                ,where: w
                ,done: done
            });
        }
        else
            layui.table.reload(lay_tab, {
                url: json_url
                ,method:"post"
                ,where: w
                , page: {
                    curr: 1 //重新从第 1 页开始
                }
                ,done:done
            });

    },

    /* 解析返回数据 */
    parseResponse:function(data)
    {
        var result;
        //判断返回值是字串还是对象类型
        if (typeof(data) == "string")
            result = JSON.parse(data);
        else if (typeof(data) == "object")
            result = data;
        return result;
    },


    /* 插入或更新数据
     *
     * @param table表名
     * @param data 数据json
     * @param topRefresh 是否调用顶层refresh函数更新子页面
     */
    get:function(table,data,fn_call)
    {
        if (typeof(data) == "object") {
            data["token"]=_GLOBAL.token;
            //data = JSON.stringify(data);
        }

        var options = {
            url: _GLOBAL.root+"service/get/"+table,
            data: data,
            type: "post",
            async:false,
            success: fn_call,
            error: function (e) {
                top.layerHelper.closeLoading();
                tip("提交失败:无法连接服务器！", "error");

            }
        }
        top.layerHelper.loading("提示","正在提交数据...");
        $.ajax(options);
    },

    /* 判断条件 where的记录记录记录记录record是否存在
     *
     * @param table表名
     * @param where 条件
     */
    exist:function(table,where)
    {
        if (typeof(data) == "object") {
            data["token"]=_GLOBAL.token;
            //data = JSON.stringify(data);
        }
        var r=false;

        $.ajax( {
            url: _GLOBAL.root+"service/count/"+table,
            data: {where:where},
            type: "post",
            async:false,
            success: function (resultObj) {
                var result;
                //判断返回值是字串还是对象类型
                if (typeof(resultObj) == "string")
                    result = JSON.parse(resultObj);
                else if (typeof(resultObj) == "object")
                    result = resultObj;

                top.layerHelper.closeLoading();
                if (result.code == 0) {
                   r= result.count>0
                }
               else
                   r= false;
            },
            error: function (e) {
                //top.layerHelper.closeLoading();
                tip("提交失败:无法连接服务器！", "error");
                r= false;
            }
        });
       return r;
    },



    /* 插入或更新数据
     *
     * @param table表名
     * @param data 数据json
     * @param topRefresh 是否调用顶层refresh函数更新子页面
     */
    merge:function(table,data,topRefresh)
    {
       if (typeof(data) == "object")
            data =JSON.stringify(data);

        var options = {
            url: _GLOBAL.root+"service/merge/"+table,
            data: {data:data
                ,"token":_GLOBAL.token},
            type: "post",
            async:false,
            success: function (resultObj) {
                var result;
                //判断返回值是字串还是对象类型
                if (typeof(resultObj) == "string")
                    result = JSON.parse(resultObj);
                else if (typeof(resultObj) == "object")
                    result = resultObj;

                top.layerHelper.closeLoading();
                if (result.code == 0) {
                    top.tip("提交成功！",1);
                    //top.layerHelper.close();
                    if (topRefresh == undefined)
                        location.reload();
                    else if(topRefresh==true){
                        top.refresh();
                    }


                }
                else {
                    tip("提交失败:" + result.msg,"error");
                }
            },
            error: function (e) {
                top.layerHelper.closeLoading();
                tip("提交失败:无法连接服务器！", "error");

            }
        }
        top.layerHelper.loading("提示","正在提交数据...");
        $.ajax(options);
    },

    /*
     * 根据id删除数据
     * @param table string 数据表
     * @param id id号
     */
    deleteById:function(table,id)
    {
        layerHelper.confirm("确认要删除数据吗？",function() {
            var options = {
                url: _GLOBAL.root + "service/delete/"+table,
                data: {id: id,"token":_GLOBAL.token},
                type: "post",
                success: function (resultObj) {
                    var result;
                    //判断返回值是字串还是对象类型
                    if (typeof(resultObj) == "string")
                        result = JSON.parse(resultObj);
                    else if (typeof(resultObj) == "object")
                        result = resultObj;

                    layerHelper.closeLoading();
                    if (result.code == 0) {
                        alert("提交成功！");
                        top.closeLayer();
                        location.reload();
                    }
                    else {
                        tip("提交失败:" + result.msg,"error");
                    }
                },
                error: function (e) {
                    layerHelper.closeLoading();
                    tip("提交失败:无法连接服务器！", "error");

                }
            }

            $.ajax(options);
        });
    },

    /*
     * 根据where条件删除数据
     * @param table string 数据表
     * @param id id号
     */
    deleteByWhere:function(table,where)
    {
        layerHelper.confirm("确认要清除数据吗？",function() {
            var options = {
                url: _GLOBAL.root + "service/delete/"+table,
                data: {where: encodeURIComponent(where),"token":_GLOBAL.token},
                type: "post",
                success: function (resultObj) {
                    var result;
                    //判断返回值是字串还是对象类型
                    if (typeof(resultObj) == "string")
                        result = JSON.parse(resultObj);
                    else if (typeof(resultObj) == "object")
                        result = resultObj;

                    top.layerHelper.closeLoading();
                    if (result.code == 0) {
                        alert("提交成功！");
                        top.layerHelper.closeAll();
                        top.refresh();
                    }
                    else {
                        tip("提交失败:" + result.msg,"error");
                    }
                },
                error: function (e) {
                    top.layerHelper.closeLoading();
                    tip("提交失败:无法连接服务器！", "error");

                }
            }

            $.ajax(options);
        });
    }

}

/*从服务器获取数据
 *
 * @param {type} data 参数
 * @param {type} success_callback 成功回调函数
 * @param {type} error_callback 失败回调函数
 * @param {type} inFrame 是否在子窗体iframe中
 * @returns {undefined}
 */
var getData = function (table,data, success_callback, error_callback, inFrame) {
    myAjax("get/"+table, data, "get", success_callback, error_callback, inFrame);
}
/*
 * 上传组件
 * @type type
 */
var myUploader = {
    uploaderUrl:_GLOBAL.root+'service/uploadSingle.do',
    /* 检查文件类型是否允许上传 */
    isAllowed: function (ext) {
        var type = ext.toLowerCase();
        var r = false;
        $.each(_GLOBAL.upload_ext, function (index, item) {
            if (item.toLowerCase() == type) {
                r = true;
                return r;
            }
        })
        return r;
    },
    /* 上传文件  **/
    setUpload: function (elemId, oncomplete, onsubmit) {
        var elem;
        if (typeof (elemId) == "string")
            elem = $('#' + elemId);
        else if (typeof (elemId) == "object")
            elem = elemId;

        var fileNum = 1;
        if (!onsubmit) {
            onsubmit = function (file, ext) {
                if (!myUploader.isAllowed(ext)) {
                    top.tip('该文件类型不允许上传!', 'error');
                    return false;
                }
                //btnUpload.val('上传中');

                if (fileNum == 1)
                    this.disable();
                top.loading(" 正在上传中...", "提示");
            }
        }

        if (!oncomplete) {
            oncomplete = function (file, response) {
                top.closeLoading();

                var info = JSON.parse(response);
                if (info.code == 0) {
                    var msg=JSON.parse(info.msg);
                    var url = msg.url;
                    elem.attr("src", _GLOBAL.root+url);
                    $("#"+elem.attr("id").replace("-img",'')).val(url);
                } else {
                    top.tip(info.msg, "error");
                }
                this.enable();
            }
        }
        return new AjaxUpload(elem, {
            /* 单文件上传API */
            action: myUploader.uploaderUrl, //_GLOBAL.root+'api/uploadSingle.do',
            name: 'file',
            onSubmit: onsubmit,
            onComplete: oncomplete
        })

    }
}

/*
 * CSV导入
 * @type type
 */
var myCsvImporter = {
    /* 检查文件类型是否允许上传 */
    isAllowed: function (ext) {
        var type = ext.toLowerCase();
        var r = false;
        $.each(_GLOBAL.upload_ext, function (index, item) {
            if (item.toLowerCase() == type) {
                r = true;
                return r;
            }
        })
        return r;
    },
    /* 上传文件  **/
    setUpload: function (elemId, oncomplete, onsubmit) {
        var elem;
        if (typeof (elemId) == "string")
            elem = $('#' + elemId);
        else if (typeof (elemId) == "object")
            elem = elemId;

        var fileNum = 1;
        if (!onsubmit) {
            onsubmit = function (file, ext) {
                if (!myUploader.isAllowed(ext)) {
                    top.tip('该文件类型不允许上传!', 'error');
                    return false;
                }
                //btnUpload.val('上传中');

                if (fileNum == 1)
                    this.disable();
                top.loading(" 正在上传中...", "提示");
            }
        }

        if (!oncomplete) {
            oncomplete = function (file, response) {
                top.closeLoading();

                var info = JSON.parse(response);
                if (info.code == 0) {
                    var msg = JSON.parse(info.msg);
                    var url = msg.url;
                    elem.attr("src", _GLOBAL.root + url);
                    $("#" + elem.attr("id").replace("-img", '')).val(url);
                } else {
                    top.tip(info.msg, "error");
                }
                this.enable();
            }
        }
        return new AjaxUpload(elem, {
            /* 单文件上传API */
            action: _GLOBAL.root + 'api/uploadSingle.do',
            name: 'file',
            onSubmit: onsubmit,
            onComplete: oncomplete
        })

    }
}

/*
 * JSON导出为CSV
 * @type {{setDataConver: JSonToCSV.setDataConver, SaveAs: JSonToCSV.SaveAs}}
 */
var exporter = {
    /*
     * 导出csv
     * @param jsonData 数据
     * @param csvFile 文件名
     * @param csvHeader 标题栏
     */
    csvExport: function(jsonData,csvFile,csvHeader) {

        var header=[];
        var keys=[];
        $.each(csvHeader,function(i,v){
            header.push(v.title);
            keys.push(v.field);
        });

        var csv=[];

        $.each(jsonData,function(i,v){
            var row="";
            $.each(keys,function(j,o){
                if(o.indexOf("#")>=0 )  //如果是两个字段组合
                {
                    var arr=o.split("#");
                    var val='';
                    $.each(arr,function(k,x){
                        val+=v[x];
                    });
                    row+=(row==""?"":",")+val;
                }
                else if(o.indexOf("-")>=0 )  //如果是两个字段组合
                {
                    var arr=o.split("-");
                    var val="\"";
                    $.each(arr,function(k,x){
                        val+=(val=="\""?"":"-")+v[x];
                    });
                    row+=(row==""?"":",")+val+"\"";
                }
                else
                    row+=(row==""?"":",")+v[o];
            })
            csv.push(row);
        });
        // var replacer = (key, value) => (value === null ? "" : value);
        // var header = Object.keys(jsonData[0]);
        // var csv = jsonData.map(row =>
        //     header
        //         .map(fieldName => JSON.stringify(row[fieldName], replacer)).join(",")
        // );
        if(_GLOBAL.isDebug)
            console.log("Header:"+header);

        csv.unshift(header.join(","));
        csv = csv.join("\r\n");
        csv = "data:text/csv;charset=utf-8,\uFEFF" + csv;
        if( _GLOBAL.isDebug) console.log(csv);

        var link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = (csvFile.toUpperCase().lastIndexOf(".CSV")?csvFile:csvFile+".csv");
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data file named 'my_data.csv'.
        document.body.removeChild(link); // Required for FF
    },

    layuiTableExportCsv: function(tableId,csvFile) {
        if(csvFile==null || csvFile=="")
            csvFile=myDate.getTick()+".csv";

        if(!tableId) return;
        var table=$("#"+tableId);
        // var json=table.attr("lay-data");
        // json=JSON.parse(json);
        var thead=table.find("th");
        var header=[];
        $.each(thead,function(i,v){
            header.push($(v).html());
        });

        var data=$(".layui-table-main").find("table").find("tr");
        var row=[];
        var csv=[];
        $.each(data,function(i,tr){
            row=[];
            $.each(tr.cells,function(i,td){
                var val=$(td).text();
                if(val.length>10 && myChecker.isNumeric(val))
                    val="'"+val+"'";
                row.push(val);
            })
            csv.push(row.join(","));
        });

        csv.unshift(header.join(","));
        csv ="\uFEFF"+csv.join("\r\n");

        if (navigator.msSaveBlob)
        {//IE 10+
            navigator.msSaveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' })
                ,csvFile.toUpperCase().lastIndexOf(".CSV")?csvFile:csvFile+".csv");
            return;
        }

        csv = "data:text/csv;charset=utf-8," + csv;

        var link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = (csvFile.toUpperCase().lastIndexOf(".CSV")?csvFile:csvFile+".csv");
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data file named 'my_data.csv'.
        document.body.removeChild(link); // Required for FF
    },
    SaveAs: function(fileName, csvData) {
        var bw = this.browser();
        if(!bw['edge'] ||  !bw['ie']) {
            var alink = document.createElement("a");
            alink.id = "linkDwnldLink";
            alink.href = this.getDownloadUrl(csvData);
            document.body.appendChild(alink);
            var linkDom = document.getElementById('linkDwnldLink');
            linkDom.setAttribute('download', fileName);
            linkDom.click();
            document.body.removeChild(linkDom);
        }
    },
    getDownloadUrl: function(csvData) {
        var _utf = "\uFEFF"; // 为了使Excel以utf-8的编码模式，同时也是解决中文乱码的问题
        return 'data:attachment/csv;charset=utf-8,' + _utf + encodeURIComponent(csvData);
    },
    browser: function() {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.indexOf('edge') !== - 1 ? Sys.edge = 'edge' : ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1]:
            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
                (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
        return Sys;
    }
};

//从数据库里读取数据，并显示表单里
var easyLoader = {
    /*
     * 从数据库中加载表单数据
     * @param string formId 表单id
     * @returns {undefined}
     */
    loadFormData: function (formId, success_callback) {
        var self = this;

        if (!success_callback) {
            success_callback = function (resultObj) {
                var result;
                //判断返回值是字串还是对象类型
                if (typeof (resultObj) == "string")
                    result = JSON.parse(resultObj);
                else if (typeof (resultObj) == "object")
                    result = resultObj;

                top.layerHelper.closeLoading();

                if (result.code > 0 || (result.code == 0 && result.count == 0)) {
                    top.layerHelper.closeLoading();
                    top.tip('没有找到相应数据，加载失败！', 'error');
                    return;
                }

                self.loadObjectVal(result.data[0]);
            };

        }
        var table = $("#" + formId).attr("data-table");
        var where = $("#"+formId).attr("data-filter");
        if(!where)where="";

        var option = {
              url:_GLOBAL.root+"api/get/"+table
            , method:"get"
            , data:{where:encodeURIComponent(where)}
            , success: success_callback
            , error:function(){
                  top.layerHelper.closeLoading();
                  top.tip("服务器连接失败！","error");
            }};
        top.layerHelper.loading();
        $.ajax(option);
    },

    /*
     * 自动向下拉框中加载数据
     * @param string selectId 下拉框id
     * @param function fn 加完以后回调函数
     * @returns {undefined}
     *
     */
    loadSelectData: function (selectId, formContainer,fn) {
        var success_callback = function (resultObj) {
            var result;
            //判断返回值是字串还是对象类型
            if (typeof (resultObj) == "string")
                result = JSON.parse(resultObj);
            else if (typeof (resultObj) == "object")
                result = resultObj;

            if (result.code > 0 || (result.code == 0 && result.count == 0)) {
                //layer.alert('没有找到相应数据，加载失败！', {icon: 2});
                return;
            }

            var textField = $("#" + selectId).attr("data-text-field");
            var valField = $("#" + selectId).attr("data-val-field");

            $("#" + selectId).html("");
            $("#" + selectId).append('<option value="">请选择</option>');
            if (result.data) {

                var option;
                var fieldId = selectId.replace("-select", "");
                var val = $("#" + fieldId).val();
                var text;
                if(val==undefined || val=="")
                    val=$("#"+fieldId+"_id").val();

                if(val!=undefined) val=val.trim();
                else{ //如没有找到对应DOM，则找select-text的最近DOM
                    var obj=$("#" + selectId).parent().find(".select-text");
                    if(obj) text=$(obj).val();
                }

                for (var f = 0; f < result.data.length; f++) {
                    option = $("<option>").val(result.data[f][valField]).text(result.data[f][textField]);
                    if(val!=null && (val==result.data[f][valField] || val==result.data[f][textField]))
                        $(option).attr("selected",true);
                    else if(text!=null && text==result.data[f][textField])
                        $(option).attr("selected",true);

                    $("#" + selectId).append(option);
                }
                // if(val!=null) $("#" + selectId).val(val);
                // else if(text!=null)
                // {
                //     $("#" + selectId).find("option[text='"+text+"']").attr("selected",true);
                // }
            }
            if (formContainer) formContainer.render("select");
            if(fn!=null) fn.call();

        };
        var textField = $("#" + selectId).attr("data-text-field");
        var valField = $("#" + selectId).attr("data-val-field");
        var table = $("#" + selectId).attr("data-table");
        var where = $("#" + selectId).attr("data-filter");
        var order = $("#" + selectId).attr("data-order");
        var cols = encodeURIComponent(textField + "," + valField);

        if (where && where != "") {
            where = encodeURIComponent(where);
        }

        var data = {fields: cols,where:where};
        if(order)
            data["order"]=encodeURIComponent(order);

        data["token"]=_GLOBAL.token; //传递令牌
        var options = {
            url: _GLOBAL.root+"service/get/"+table,
            data: data,
            async:false,
            type: "post",
            success: success_callback,
            error: null

        }

        $.ajax(options);
        //myAjax(null, data, "get", success_callback, null, true);
    },

    loadJsonVal: function (json) {
        var obj = eval("(" + json + ")");
        $.each(obj, function (name, value) {
            $("#" + name).val(value);
        });
    },
    loadJsonHtml: function (json) {
        var obj = eval("(" + json + ")");
        $.each(obj, function (name, value) {
            $("#" + name).html(value);
        });
    },
    loadObjectVal: function (object) {
        if(object.constructor == Array)
            object=object[0];

        $.each(object, function (name, value) {
            $("#" + name).val(value);
            $("#"+name+"-select").val(value);
            $("#"+name+"-img").attr("src",_GLOBAL.root+ value);
        });
    },
    loadObjectHtml: function (object) {
        $.each(object, function (name, value) {
            $("#" + name).html(value);
        });
    }
}


//<editor-fold defaultstate="collaplsed" desc="弹窗函数">
/******************************************************
 * 弹窗使用说明
 * 要页面中添加
 * layui.use('layer',function(){layer=layui.layer;});
 */
var layer;
//当前弹窗index
var layerIndex = null;

/*
 * 弹窗函数
 * @param string title 标题
 * @param string content 显示内容，当type=2时，必须为url
 * @param array area 显示大小，如：["400px","600px"]，null时自适应大小
 * @param int type 弹窗类型，type=0或1，显示文本内容；type=2，使用iframe
 * @param bool maxmin 是否显示极大、极小按钮，默认不显示
 * @param bool resizing 是否可以调整大小，默认固定大小
 * @param array buttons 按钮数据，例如：[{title:"OK",callback:cbOK},{title:"cancel",callback:cbCancel}],callback为按钮回调函数
 * @returns int index
 * @example
 *  var area=['400px','600px'];
 var cbOk=function(index){alert("click ok");};
 var cbCancel=function(index){alert("Click cancel");top.closeLayer(index);};
 var buttons=[{title:"OK",callback:cbOk}
 ,{title:"cancel",callback:cbCancel}
 ];
 openLayer("hello","http://www.baidu.com"
 ,buttons
 ,area
 ,2
 ,false)
 */
var openLayer = function (title, content, buttons, area, type,maxmin, resizing, offset, shade,closebtn,success_callbac) {
    if (!area) area = "auto";
    if (!offset) offset = "auto";
    if (!shade) shade = 0.2;

    var options = {
        title: title
        , type: (type != null ? type : 2)
        , area: area
        , offset: offset
        , maxmin: (maxmin != null ? maxmin : false)
        , resizing: (resizing != null ? resizing : false)
        , content: content
        , shade: shade
        , closeBtn:(closebtn !=null?closebtn:1)
        , btn: []
        , success:success_callbac
    };
    var btn = [], callbacks = [];
    if (buttons) {
        for (var i = 1; i <= buttons.length; i++) {
            options.btn.push(buttons[i - 1].title);
            //callbacks.push(b.callback);
            eval('options.btn' + i + '=' + buttons[i - 1].callback);
        }
    }

    layerIndex = layer.open(options);
    return layerIndex;

}

/*
 * 关闭弹窗
 * @param int index 窗口index，默认当前打开的窗口
 * @returns {undefined}
 */
var closeLayer = function (index) {
    if (!index) index = layerIndex;
    if (index) layer.close(index);
}
var layerLoading;

/*
 * 打开进行中提示窗口
 * @param string title 窗口标题，如果为null，则不显示标题
 * @param string msg 显示内容
 * @returns {undefined}
 */
var loading = function (title, msg) {
    layerLoading = layer.open({title: title, type: 3, content: msg});
}

/*
 * 关闭进行中窗口
 * @param int index 待关闭窗口index，默认当前打开的进行中窗口
 * @returns {undefined}
 */
var closeLoading = function (index) {
    if (!index) index = top.layerLoading;
    if (index) layer.close(index);
}

/*
 *
 * @param string msg 提示信息
 * @param int icon 图标类型，0-黄色感叹号，1-绿钩，2-红叉,3-问号，4-锁
 * @returns {undefined}
 */
var tip = function (msg, icon,fn) {
    if (!icon) icon = 0;
    else if (icon === "success") icon = 1;
    else if (icon === "error") icon = 2;
    else if (icon === "warn") icon = 0;
    else if (icon === "question") icon = 3;
    else if (icon === "lock") icon = 4;
    else if (typeof(icon) != "number") icon = 0;

    if(msg==undefined) msg="";

    if(!fn)
        layer.msg(msg, {icon: icon, area: "auto"});
    else
        layer.msg(msg, {icon: icon, area: "auto"},
            function(){
                fn.call();
            });
}

/*
 * 确认窗口
 * @param string content 提示信息
 * @param jsonObject btns 按钮及回调函数
 * @param array area 显示大小，如["400px","500px"]
 * @returns {undefined}
 * @example
 *  var area=["250px","90px"];
 var callback1=function(index){
                             do something
                             top.layer.close(index);   //关闭自己
                             return true;
                            };
 var callback2=function(index){
                             top.layer.close(index);    //关闭自己
                             return false;
                         };

 top.lConfirm('确认要退出吗？',
 {btn1:{title:"是",callback:callback1},
                 btn2:{title:"否",callback:callback2}
                },
 area);
 */
var lConfirm = function (content, btns, area) {
    layer.confirm(content, {
            area: area
            , icon: 3
            , title: null
            , closeBtn: 0
            , btn: [btns.btn1.title, btns.btn2.title]
        },
        btns.btn1.callback,
        btns.btn2.callback
    )
}
//</editor-fold>


//<editor-fold defaultstate="collaplsed" desc="Base64类">



var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;

            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },

    // public method for decoding
    decode : function (input) {

        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

//</editor-fold>

//浏览器信息
var Browser =
    {
        getVersion: function () {
            var browserVersion = window.navigator.userAgent.toUpperCase();
            if (browserVersion.indexOf("MSIE") > -1) {
                if (browserVersion.indexOf("MSIE 6") > -1) {//ie6
                    return "IE6";
                } else {//ie[7-9]
                    if (browserVersion.indexOf("MSIE 9") > -1)
                        return "IE9";
                }
            } else if (browserVersion.indexOf("CHROME") > -1)
                return "CHROME";
            else if (browserVersion.indexOf(".NET") > -1)
                return "IE";
            else if (browserVersion.indexOf("FIREFOX") > -1) {//firefox
                return "FIREFOX";
            } else if (browserVersion.indexOf("OPERA") > -1)
                return "OPERA";
            else if (browserVersion.indexOf("SAFARI") > -1)
                return "SAFARI";

            return "UNKOWN";
        }

    }

/* 部门管理工具 **/
var department = {

    /* 获取上级部门名称
     * parameter id 部门id
     * parameter departs 部门列表
     */
    getParent: function (id, departs) {
        return this.getDepartment(this.getParentId(id, departs), departs);
    },

    /* 找部门上级结点的id
     * parameter id 部门id
     * parameter departs 部门列表
     */
    getParentId: function (id, departs) {
        var pid = 0;
        if (departs == null)
            return pid;

        function _getParentDeptId(id, departs) {
            if (id == 0)
                return;
            if (departs != undefined && departs.length > 0) {
                for (var i in departs) {
                    if (departs[i].id == id) {
                        pid = departs[i].parentId;
                        return;
                    }
                    if (departs[i].children && departs[i].children.length > 0)
                        _getParentDeptId(id, departs[i].children);
                    //else
                    //    return;
                }

            }
        }

        _getParentDeptId(id, departs);
        return pid;

    },
    /* 根据部门id获取部门名称
     * parameter did 部门id
     * parameter departs 部门列表
     */
    getDepartment: function (did, departs) {
        var name = "-";

        function _getDepart(did, departs) {
            if (did == 0)
                return;
            if (departs != undefined && departs.length > 0) {
                for (var i in departs) {
                    console.log("deptId:" + departs[i].id);
                    if (departs[i].id == did) {
                        name = departs[i].name;
                        return;
                    }
                    if (departs[i].children && departs[i].children.length > 0)
                        _getDepart(did, departs[i].children);
                    //else
                    //    return;
                }

            }
        }

        _getDepart(did, departs);
        return name;
    }
}

//右下角滑动通知
$.notice = function (options) {
    var opt = options || {},
        api, aConfig, hide, wrap, top,
        duration = 800;

    var config = {
        id: 'Notice',
        left: '100%',
        top: '100%',
        fixed: true,
        drag: false,
        width: 250,
        height: 50,
        resize: false,
        follow: null,
        lock: false,
        init: function (here) {
            api = this;
            aConfig = api.config;
            wrap = api.DOM.wrap;
            top = parseInt(wrap[0].style.top);
            hide = top + wrap[0].offsetHeight;

            wrap.css('top', hide + 'px')
                .animate({top: top + 'px'}, duration, function () {
                    opt.init && opt.init.call(api, here);
                });
        },
        close: function (here) {
            wrap.animate({top: hide + 'px'}, duration, function () {
                opt.close && opt.close.call(this, here);
                aConfig.close = $.noop;
                api.close();
            });

            return false;
        }
    };

    for (var i in opt) {
        if (config[i] === undefined)
            config[i] = opt[i];
    }
    ;

    return artDialog(config);
};

