from django.contrib import admin
from models import Grade, Grade_Comment, Institution, Person, Person_Comment




class PersonCommentInline(admin.StackedInline):
    model = Person_Comment
    extra = 3

class PersonAdmin(admin.ModelAdmin):
    inlines = [PersonCommentInline]




class GradeCommentInline(admin.StackedInline):
    model = Grade_Comment
    extra = 3
    
class GradeAdmin(admin.ModelAdmin):
    inlines = [GradeCommentInline]

    



admin.site.register(Institution)
admin.site.register(Person,PersonAdmin)
admin.site.register(Person_Comment)
admin.site.register(Grade,GradeAdmin)
admin.site.register(Grade_Comment)

