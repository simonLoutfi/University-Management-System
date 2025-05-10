from rest_framework import serializers
from .models import Professor, Student, Course, Enrollment, CustomUser

class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professor
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

from rest_framework import serializers
from django.contrib.auth.models import User
from main.models import Professor  # or your custom user model

class ProfessorSignupSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User  # or your custom User model
        fields = ['username', 'email', 'password1', 'password2', 'first_name', 'profile_picture']

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password1": "Passwords do not match."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password1')
        validated_data.pop('password2')

        # Customize as needed
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            password=password
        )
        
        # Optional: link to a Professor model
        Professor.objects.create(user=user, department=self.context['request'].data.get('department'),
                                 profile_picture=validated_data.get('profile_picture'))

        return user

