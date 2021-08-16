from flask import Blueprint, render_template, abort,request,session,redirect,url_for
from jinja2 import TemplateNotFound
import json
from collections import namedtuple

import utils.util

# Import config
from config import web_config

from model.User import UserModel
from dal import user_dal

login = Blueprint('login'
                  , __name__
                  , template_folder='templates');

@login.route('/login/')
@login.route('/login/<page>.html')
def show_login(page=None):
    try:
        config = web_config;
        # print("Page:",page);
        if page:
            return render_template(f'login/{page}.html',config=config)
        else:
            return render_template(f'login/login.html',config=config)
    except TemplateNotFound:
        abort(404)
        
@login.route('/login/login.do', methods=['GET', 'POST'])
def login_do():
    try:        
        userinfo = request.form;
        # print("username:",userinfo["username"],'; password:',userinfo["password"]);
        login_info = UserModel();
        login_info.username = userinfo["username"];
        login_info.password = userinfo["password"];
        
        user = user_dal.verify_user(login_info);
        
        if user:
            dict = user.__dict__; ##Object to dictionary
            dict["status"] = True;
        else:
            dict={"status":False};
            
        #Save the logined user info to session
        session["logined_user"] = dict;
        return dict;
    except TemplateNotFound:
        abort(404)
        
@login.route('/login/logout.do', methods=['GET', 'POST'])
def logout_do():
    try:        
        if 'logined_user' in session:    
            session.pop('logined_user', None)
        return show_login();
    except TemplateNotFound:
        abort(404)
        
@login.route('/login/changepwd.do', methods=['GET', 'POST'])
def change_pwd():
    try:        
        if 'logined_user' in session:    
            form     = request.form;
            password = form["password"];
            print("new password: " ,password);
            
            user = session["logined_user"];
            print("Session['logined_user']:",user);
            
            # new_user = json.loads(json.dumps(user), object_hook=UserModel);
            new_user = utils.util.dict_obj(user);
            print("##new user dict:",new_user.__dict__);
            new_user.password = password; 
            if user_dal.change_pwd(new_user):
                return {"status":True};
        else:            
            return show_login();
    except TemplateNotFound:
        abort(404)