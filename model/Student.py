
class StudentModel:
    id      = None;
    name    = None;
    age     = None;
    genda   = None;
    Chinese = None;
    Math    = None;
     
    def __init__(self
                 , id=None
                 , name=None
                 , age=None
                 , genda=None
                 , Chinese=None
                 , Math = None):
        
        self.id = id;
        self.name = name;
        self.genda = genda;
        self.age = age;
        self.Chinese  = Chinese;
        self.Math = Math;
        
    # def toJson(self):
    #     return json.dumps(self, default=lambda o: o.__dict__, 
    #         sort_keys=True, indent=4);