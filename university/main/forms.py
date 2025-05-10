from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Professor, Student, Course, Enrollment,CustomUser

from django import forms
from .models import Professor, Student, Course, Enrollment

class ProfessorForm(forms.ModelForm):
    class Meta:
        model = Professor
        fields = ['name', 'email', 'department', 'profile_picture']

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['name', 'email', 'student_id', 'document']

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['title', 'code', 'professor', 'description', 'students']

class EnrollmentForm(forms.ModelForm):
    class Meta:
        model = Enrollment
        fields = ['student', 'course', 'grade']  

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    user_type = forms.ChoiceField(choices=CustomUser.UserTypes.choices)  

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'user_type', 'password1', 'password2')

# forms.py
from django import forms
from django.contrib.auth import get_user_model
from .models import Professor

User = get_user_model()

# forms.py
from django import forms
from .models import CustomUser, Professor

class ProfessorSignUpForm(forms.ModelForm):
    username = forms.CharField(max_length=100)
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = Professor
        fields = ['name', 'email', 'department', 'profile_picture']

    def save(self, commit=True):
        # Create the CustomUser first
        user = CustomUser.objects.create_user(
            username=self.cleaned_data['email'],  # You can set this to email or another field
            password=self.cleaned_data['password'],
            user_type=CustomUser.UserTypes.PROFESSOR  # Set the user type to 'professor'
        )

        # Create the Professor profile and associate it with the user
        professor = super().save(commit=False)
        professor.user = user
        if commit:
            professor.save()

        return professor

class StudentSignUpForm(forms.ModelForm):
    username = forms.CharField(max_length=150)  # Add username field
    password = forms.CharField(widget=forms.PasswordInput)  # Add password field

    class Meta:
        model = Student
        fields = ['name', 'email', 'student_id', 'document']  # Existing fields

    def save(self, commit=True):
        # Create the CustomUser first
        user = CustomUser.objects.create_user(
            username=self.cleaned_data['username'], 
            email=self.cleaned_data['email'], 
            password=self.cleaned_data['password'],
            user_type=CustomUser.UserTypes.STUDENT  # Set user type to 'student'
        )

        # Create the Student profile and associate it with the user
        student = super().save(commit=False)
        student.user = user
        if commit:
            student.save()

        return student
    
class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['title', 'code', 'description']  
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'professor' in self.fields:
            del self.fields['professor']
        if 'students' in self.fields:
            del self.fields['students']