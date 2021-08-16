from flask import Blueprint, render_template, abort,request,session
from jinja2 import TemplateNotFound

# Import config
from config import web_config

home = Blueprint('home'
                  , __name__
                  , template_folder='templates');

@home.route('/')
@home.route('/<page>.html')
def home_page(page=None):
    try:
        config = web_config;
        if 'logined_user' in session:
            user = session["logined_user"];
            if page:
                return render_template(f'{page}.html'
                                       ,config  = config
                                       ,user    = user);
            else:
                return render_template(f'index.html'
                                       ,config  = config
                                       ,user    = user);
        else:
            return render_template("/login/login.html",config=config);
    except TemplateNotFound:
        abort(404);
        

@home.route("/home/<page>.html")
def home_subpage(page=None):
    try:
        config = web_config;
        if page:
            return render_template(f'/home/{page}.html',config=config);
        else:
            return render_template(f'/home/console.html',config=config);
    except TemplateNotFound:
        abort(404);

