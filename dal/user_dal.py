import json
from json import encoder
from flask import jsonify
import utils.util
from model.User import UserModel

'''
Get all users from json file.
'''
def get_users():
    filepath = utils.util.root_path()+"/data/user.json";
    # print("FilePath:",filepath);
    f = open(filepath,"r", encoding="utf-8");
    cont = f.read();
    # print("User json:",cont)
    users = json.loads(cont,object_hook = lambda d: UserModel(**d));    
    f.close();
    
    # for x in users:
    #     print("user: ",x.__dict__);
    
    return users;

'''
Verify the user info.
'''
def verify_user(user):
    users = get_users();
    for x in users:
        if user.username==x.username and user.password==x.password:
            return x;
        
    return None;

'''
Change current password
'''
def change_pwd(user):
    print("New user: ",user.__dict__)
    users = get_users();
    for x in users:
        if user.username==x.username:
            x.password = user.password;
    
    print("------------")
    for x in users:
        print(x.__dict__);
    
    filepath = utils.util.root_path()+"/data/user.json";
    a_file = open(filepath, "w")
    jsonstr = utils.util.list_json(users);
    print("jsonstr: ",jsonstr);
    a_file.write(jsonstr);
    a_file.close()
    
    return True;
