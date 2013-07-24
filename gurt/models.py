from django.db import models



class Institution(models.Model):
    name = models.CharField(max_length=30)
    location = models.CharField(max_length=20)
    created = models.DateTimeField(auto_now=True)
    
    def __unicode__(self):
        return self.name
    
    def get_url(self):
        return '/gurt/institution/%s' % self.id
    
    class Meta:
        db_table = 'institution'
 
    
 
 
    
class Person(models.Model):
    name = models.CharField(max_length=50)
    department = models.CharField(max_length=20,blank=True)
    institution = models.ForeignKey(Institution)
    
    def __unicode__(self):
        return self.name
    
    def get_url(self):
        return '/gurt/person/%s' % self.id
    
    class Meta:
        db_table = 'person'
        
        
        

        
class Grade(models.Model):
    GRADE = ((1,1),(2,2),(3,3),(4,4),(5,5))
    person = models.ForeignKey(Person)
    hotness = models.IntegerField(choices=GRADE)
    easeness = models.IntegerField(choices=GRADE)
    exam_diff = models.IntegerField(choices=GRADE) #exam_difficulty
    helpfulness = models.IntegerField(choices=GRADE)
    clearity = models.IntegerField(choices=GRADE)
    kownledge = models.IntegerField(choices=GRADE)
    strict = models.IntegerField(choices=GRADE)
    
    def __unicode__(self, ):
        return str(self.id)
    
    class Meta:
        db_table = 'grade'


    
class Person_Comment(models.Model):
    person = models.ForeignKey(Person)
    comment = models.CharField(max_length=120,blank=True,null=True)
    reated = models.DateTimeField(auto_now=True)
    
    def __unicode__(self):
        return self.comment
    
    class Meta:
        db_table = 'person_comment'
        verbose_name = "Comments on Person"
    
    


    
class Grade_Commet(models.Model):
    grade = models.ForeignKey(Grade)
    comment = models.CharField(max_length=120,blank=True,null=True)
    created = models.DateTimeField(auto_now=True)
    
    def __unicode__(self):
        return self.comment
    
    def get_url(self):
        return '/gurt/gradecomment/%s' % self.id
    
    class Meta:
        db_table = 'grade_comment'
        verbose_name = "Comments on Grade"
    
 
 
 

    
    

    


    
    
    
    
    
    
    

