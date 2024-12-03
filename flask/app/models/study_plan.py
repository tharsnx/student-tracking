from app import db
from sqlalchemy_serializer import SerializerMixin

class Study_plan(db.Model, SerializerMixin):
    __tablename__ = 'study_plan'
    id = db.Column(db.Integer, primary_key=True)
    planName = db.Column(db.String)
    
    # File fields
    testEng = db.Column(db.LargeBinary)  # File data
    testEng_filename = db.Column(db.String)  # File name
    
    comprehension = db.Column(db.LargeBinary)  # File data
    comprehension_filename = db.Column(db.String)  # File name
    
    quality = db.Column(db.LargeBinary)  # File data
    quality_filename = db.Column(db.String)  # File name
    
    study_planID = db.Column(db.Integer, unique=True)
    publish_research = db.Column(db.Boolean)
    credit = db.Column(db.Integer)

    complete_course = db.Column(db.Boolean)
    defense_exam = db.Column(db.Boolean)
    topic = db.Column(db.Boolean)

    def __init__(self, planName, testEng, testEng_filename, comprehension, comprehension_filename, quality, quality_filename, study_planID, publish_research, credit, complete_course, defense_exam, topic):
        self.planName = planName
        self.testEng = testEng
        self.testEng_filename = testEng_filename
        self.comprehension = comprehension
        self.comprehension_filename = comprehension_filename
        self.quality = quality
        self.quality_filename = quality_filename
        self.study_planID = study_planID
        self.publish_research = publish_research
        self.credit = credit
        self.complete_course = complete_course
        self.defense_exam = defense_exam
        self.topic = topic