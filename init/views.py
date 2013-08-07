from django.shortcuts import render_to_response, HttpResponse
from gurt.models import Grade, Person




def init(request):
    """
    initial function return the home screen
    """ 
    user = request.user
    recent_persons = Person.objects.all()[:5]
    return render_to_response('init/theme.html',dict())