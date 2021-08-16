import sys
import os
import json

'''
Get the physical path of the web root.
'''
def root_path():
    # Infer the root path from the run file in the project root (e.g. manage.py)
    fn = getattr(sys.modules['__main__'], '__file__')
    root_path = os.path.abspath(os.path.dirname(fn))
    return root_path

'''
Convert the list of objects to json string.
'''
def list_json(list):
    s = '[';
    for x in list:
        if s=='[':
            s = s+json.dumps(x.__dict__);
        else:
            s = s+','+json.dumps(x.__dict__);
        
    s = s+"]";
    
    return s;
        
'''
Convert the dictionary to object.
'''
def dict_obj(d):
      
    # checking whether object d is a
    # instance of class list
    if isinstance(d, list):
           d = [dict_obj(x) for x in d] 
  
    # if d is not a instance of dict then
    # directly object is returned
    if not isinstance(d, dict):
           return d
   
    # declaring a class
    class C:
        pass
   
    # constructor of the class passed to obj
    obj = C()
   
    for k in d:
        obj.__dict__[k] = dict_obj(d[k])
   
    return obj