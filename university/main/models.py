from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    class UserTypes(models.TextChoices):
        PROFESSOR = 'professor', _('Professor')
        STUDENT = 'student', _('Student')
        ADMIN = 'admin', _('Admin')
    
    user_type = models.CharField(
        max_length=10,
        choices=UserTypes.choices,
        default=UserTypes.STUDENT
    )

    def __str__(self):
        return self.username

class Professor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='professor_profile')
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='professors/', null=True, blank=True)

    def __str__(self):
        return self.name

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    student_id = models.CharField(max_length=20, unique=True)
    document = models.FileField(upload_to='documents/', null=True, blank=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    title = models.CharField(max_length=200)
    professor = models.ForeignKey(Professor, on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, through="Enrollment")
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.title}"

class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)  
    grade = models.CharField(max_length=2, blank=True, null=True)
    
    class Meta:
        unique_together = ('student', 'course')
    
    def __str__(self):
        return f"{self.student.name} in {self.course.title}"