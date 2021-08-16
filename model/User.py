
class UserModel:
    id          = None;
    realname    = None;
    username    = None;
    password    = None;
    role        = None;
     
    def __init__(self
                 , id=None
                 , realname=None
                 , username=None
                 , password=None
                 , role=None):
        
        self.id = id;
        self.realname = realname;
        self.username = username;
        self.password = password;
        self.role     = role;
        
    # def toJson(self):
    #     return json.dumps(self, default=lambda o: o.__dict__, 
    #         sort_keys=True, indent=4);