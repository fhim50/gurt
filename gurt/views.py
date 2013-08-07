from django.shortcuts import render_to_response, HttpResponse


def grade_person(request):
	if request.method == 'GET':
		person_form = Person_Form()
		grade_form = Grade_Form()

	if request.method == 'POST':
		person_form = Person_Form(post)
		grade_form = Grade_Form(post)

		if person_form.is_valid():
			person = person_form.save()
			grade_form.save()

	return render_to_response ('', dict())
	pass+--+
