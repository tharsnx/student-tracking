from app import db

class Publish(db.Model):
    __tablename__ = 'publish'

    id = db.Column(db.Integer, primary_key=True)
    stdID = db.Column(db.String(100), nullable=False)
    filename = db.Column(db.String(50))
    types = db.Column(db.String(50))
    file = db.Column(db.LargeBinary)

    def __init__(self, stdID,filename,file,types):
        self.stdID = stdID
        self.filename = filename
        self.file = file
        self.types = types