from flask import *

# Import config
from config import app_config
from config import web_config

# Import web apps modules
from apps.login   import login
from apps.home    import home
from apps.student import student 

app = Flask(__name__);
app.secret_key = b'231f99031&532#*/!';

app.register_blueprint(login);
app.register_blueprint(home);
app.register_blueprint(student);

# run the application
if __name__ == "__main__":
    app.run(
        debug           = app_config.debug
       ,host            = app_config.host
       ,port            = app_config.port
       ,use_reloader    = app_config.use_reloader
       );