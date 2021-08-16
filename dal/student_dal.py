import json
from json import encoder
from flask import jsonify
import utils.util
from model.Student import StudentModel

'''
Get all students from json file.
'''
def get_students():
    filepath = utils.util.root_path()+"/data/student.json";
    # print("FilePath:",filepath);
    f = open(filepath,"r", encoding="utf-8");
    cont = f.read();
    # print("User json:",cont)
    students = json.loads(cont,object_hook = lambda d: StudentModel(**d));    
    f.close();
    
    # for x in users:
    #     print("user: ",x.__dict__);
    
    return students;
