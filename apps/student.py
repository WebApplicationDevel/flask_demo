from flask import Blueprint, render_template, abort,request,session
from jinja2 import TemplateNotFound
from dal import student_dal
import utils.util

# Import config
from config import web_config

student = Blueprint('student'
                  , __name__
                  , template_folder='templates');

@student.route('/student/')
@student.route('/student/<page>.html')
def student_page(page=None):
    try:
        config = web_config;
        if 'logined_user' in session:
            user = session["logined_user"];
            if page:
                return render_template(f'/student/{page}.html'
                                       ,config  = config
                                       ,user    = user);
            else:
                return render_template(f'/student/index.html'
                                       ,config  = config
                                       ,user    = user);
        else:
            return render_template("/login/login.html",config=config);
    except TemplateNotFound:
        abort(404);
        

@student.route("/student/get_all.do")
def student_getall():
    try:
       students = student_dal.get_students();
       s= utils.util.list_json(students);
       print(" # Student JSON: ",s);
       return s;
    except TemplateNotFound:
        abort(404);

