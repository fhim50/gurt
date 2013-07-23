from django.db import models

class Institution(models.Model):
    name = models.CharField(max_length=30)
    location = models.CharField(max_length=20)
    created = models.DateTimeField(auto_now=True)
    
    def __unicode__(self):
        return self.id
    
    def get_url(self):
        return self.id

class Person_Comment(models.Model):
    comment = models.CharField(max_length=120,blank=True,null=True)
    reated = models.DateTimeField(auto_now=True)
    
    def __unicode__(self):
        return self.id
    
class Grade_Commet(models.Model):
    comment = models.CharField(max_length=120,blank=True,null=True)
    created = models.DateTimeField(auto_now=True)
  
    def __unicode__(self):
        return self.id
    
class Person(models.Model):
    name = models.CharField(max_length=50)
    department = models.CharField(max_length=20,blank=True)
    grade = models.ForeignKey(Grade)
    institution = models.ForeignKey(Institution)
    comment = models.ForeignKey(Person_Comment)
    
    def __unicode__(self):
        return self.id
    
    def get_url(self):
        return self.id
    
    
    
    
    
    
    
    

