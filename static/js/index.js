
var indexHelper ={
    change_password:function()
    {
        layerHelper.open("Change Password"
                    ,"panel_pwd"
                    ,['360px','300px']
                    //Click "OK" callback function
                    ,function(){
                        if($("#password").val().trim()=="")
                        {
                            alert("Please input the password");
                            return;
                        }
                        if($("#repass").val().trim()=="")
                        {
                            alert("Please input the confirmed password");
                            return;
                        }
                        if($("#password").val()!=$("#repass").val())
                        {
                            alert(" The password isn't match with repassword!");
                            return;
                        }

                        var data ={password:$("#password").val()};
                        $.ajax({
                            url:"/login/changepwd.do",
                            type:'post',
                            data:data,
                            beforeSend:function () {
                                layerHelper.loading("Tips"," Working...");
                            },
                            success:function(data){
                                if(data.status==true){                      
                                    layer.msg("密码修改成功.", {
                                        icon: 6,//成功的表情
                                        time: 3000 //1秒关闭（如果不配置，默认是3秒）
                                    });
                                }
                                else
                                {
                                  layer.msg("密码修改失败", {
                                        icon: 3,//成功的表情
                                        time: 3000 //1秒关闭（如果不配置，默认是3秒）
                                    });
                                }
                            },
                            complete: function () {
                                layerHelper.closeLoading();
                            },
                          });
                    }
                    //click "Cancel" callback function
                    ,function(){alert('cancel')} 
                    ,function(){}
                    );

    }
}