from app import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    fname = db.Column(db.String, nullable=False)
    lname = db.Column(db.String, nullable=False)
    isAdmin = db.Column(db.Boolean, default=False)
    picture = db.Column(db.LargeBinary)  # For storing the binary data of the image

    def __init__(self, email, password, fname, lname, isAdmin, picture):
        self.email = email
        self.password = password
        self.fname = fname
        self.lname = lname
        self.isAdmin = isAdmin
        self.picture = picture
