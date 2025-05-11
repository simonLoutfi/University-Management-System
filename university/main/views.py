from django.db import IntegrityError
from django.shortcuts import render, redirect, get_object_or_404
from .models import CustomUser, Professor, Student, Course, Enrollment
from .forms import ProfessorForm, StudentForm, CourseForm, EnrollmentForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from .forms import ProfessorSignUpForm, StudentSignUpForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from datetime import date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from rest_framework_simplejwt.authentication import JWTAuthentication

def home(request):
    return render(request, 'main/home.html')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course(request):
    if request.user.user_type != 'professor':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    professor = request.user.professor_profile
    
    try:
        course = Course.objects.create(
            title=data.get('title'),
            code=data.get('code'),
            description=data.get('description'),
            professor=professor
        )
        return Response({'message': 'Course created successfully', 'course_id': course.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def list_professors(request):
    professors = Professor.objects.all()
    return render(request, 'main/list_professors.html', {'professors': professors})

def add_professor(request):
    if request.method == "POST":
        form = ProfessorForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('list_professors')
    else:
        form = ProfessorForm()
    return render(request, 'main/add_professor.html', {'form': form})

def update_professor(request, pk):
    professor = get_object_or_404(Professor, pk=pk)
    form = ProfessorForm(request.POST or None, request.FILES or None, instance=professor)
    if form.is_valid():
        form.save()
        return redirect('list_professors')
    return render(request, 'main/add_professor.html', {'form': form})

def delete_professor(request, pk):
    professor = get_object_or_404(Professor, pk=pk)
    if request.method == "POST":
        professor.delete()
        return redirect('list_professors')
    return render(request, 'main/delete_professor.html', {'professor': professor})

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.views.decorators.http import require_POST
from rest_framework_simplejwt.tokens import RefreshToken

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)

        user = authenticate(username=username, password=password)
        if user is None:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)

        if not user.is_active:
            return JsonResponse({'error': 'Account is inactive'}, status=400)

        try:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Get user profile data
            user_profile = None
            if user.user_type == 'professor':
                user_profile = {
                    'name': user.professor_profile.name,
                    'department': user.professor_profile.department,
                    'profile_picture': user.professor_profile.profile_picture.url if user.professor_profile.profile_picture else None
                }
            elif user.user_type == 'student':
                user_profile = {
                    'name': user.student_profile.name,
                    'student_id': user.student_profile.student_id,
                    'document': user.student_profile.document.url if user.student_profile.document else None
                }
            
            return JsonResponse({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.user_type,
                    'profile': user_profile
                }
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return render(request, 'main/login.html')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def professor_dashboard(request):
    if request.user.user_type != 'professor':
        return redirect('student_dashboard')
    
    professor = request.user.professor_profile
    courses = Course.objects.filter(professor=professor)
    
    return render(request, 'professor_dashboard.html', {
        'professor': professor,
        'courses': courses
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def professor_courses_api(request):
    if request.user.user_type != 'professor':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    professor = request.user.professor_profile
    courses = Course.objects.filter(professor=professor)
    
    course_list = []
    for course in courses:
        course_list.append({
            'id': course.id,
            'title': course.title,
            'code': course.code,
            'description': course.description,
            'department': professor.department,
            'enrolled_students': course.enrollment_set.count()
        })
    
    return Response(course_list)

def logout_user(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('login')

def signup(request):
    return render(request, 'main/signup_choice.html')

from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from .forms import ProfessorSignUpForm
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def professor_signup(request):
    form = ProfessorSignUpForm(request.data, request.FILES)
    if form.is_valid():
        professor = form.save()
        user = professor.user

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username
        })
    else:
        return Response({'error': form.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def student_signup(request):
    form = StudentSignUpForm(request.POST, request.FILES)
    
    if form.is_valid():
        form.save()  # The save method in the form handles user and student creation
        return Response({'message': 'Student registered successfully'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': form.errors}, status=status.HTTP_400_BAD_REQUEST)

    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    student = get_object_or_404(Student, user=request.user)

    if Enrollment.objects.filter(student=student, course=course).exists():
        return Response({'error': 'You are already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

    enrollment = Enrollment(student=student, course=course, enrollment_date=date.today())
    enrollment.save() 

    return Response({'message': 'Successfully enrolled in the course'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unenroll_course(request, course_id):
    course = Course.objects.get(id=course_id)
    student = get_object_or_404(Student, user=request.user)
    enrollment = Enrollment.objects.filter(student=student, course=course).first()
    
    if enrollment:
        enrollment.delete()
        return Response({'message': 'You have been unenrolled from the course'})
    else:
        return Response({'error': 'You are not enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_course(request, pk):
    if request.user.user_type != 'professor':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    course = get_object_or_404(Course, id=pk)
    if course.professor != request.user.professor_profile:
        return Response({'error': 'You can only update your own courses'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    try:
        course.title = data.get('title', course.title)
        course.code = data.get('code', course.code)
        course.description = data.get('description', course.description)
        course.save()
        return Response({'message': 'Course updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, pk):
    if request.user.user_type != 'professor':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = Course.objects.get(pk=pk, professor=request.user.professor_profile)
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Course not found or you don\'t have permission to delete it'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if course.students.exists(): 
        return Response({
            'success': False,
            'error': 'Cannot delete \"{}\" because it has enrolled students'.format(course.title)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    course.delete()
    return Response({
        'success': True,
        'message': 'Course \"{}\" has been deleted'.format(course.title)
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    # Fetch all courses
    enrolled_courses = Course.objects.filter(enrollment__student__user=request.user)
    available_courses = Course.objects.exclude(enrollment__student__user=request.user)

    # Serialize the data
    enrolled_courses_data = [
        {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'code': course.code,
            'professor': course.professor.name,
        }
        for course in enrolled_courses
    ]

    available_courses_data = [
        {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'code': course.code,
            'professor': course.professor.name,
        }
        for course in available_courses
    ]

    return Response({
        'enrolled_courses': enrolled_courses_data,
        'available_courses': available_courses_data,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_email(request):
    if request.method == "POST":
        new_email = request.data.get("email")
        new_username = request.data.get("username")
        
        if not new_email or not new_username:
            return Response({'error': 'Email and username are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Update CustomUser (username and email)
            user = request.user
            user.email = new_email
            user.username = new_username
            user.save()
            
            # Update Student email
            student = Student.objects.get(user=user)
            student.email = new_email
            student.save()
            
            return Response({
                'message': 'Email and username updated successfully!',
                'email': new_email,
                'username': new_username
            }, status=status.HTTP_200_OK)
            
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'error': 'Invalid request method'}, 
                   status=status.HTTP_405_METHOD_NOT_ALLOWED)


# def student_dashboard(request):
#     search_query = request.GET.get('search', '')
#     order = request.GET.get('order', 'name')
#     courses = Course.objects.all()

#     if search_query:
#         courses = courses.filter(title__icontains=search_query)

#     if order == 'name':
#         courses = courses.order_by('title')
#     elif order == '-name':
#         courses = courses.order_by('-title')
#     elif order == 'popularity':
#         courses = courses.annotate(enrollment_count=Count('enrollment')).order_by('-enrollment_count')

#     return render(request, 'main/student_dashboard.html', {'courses': courses})

@api_view(['POST'])
@permission_classes([AllowAny])
def api_professor_signup(request):
    return professor_signup(request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_students(request):
    search_query = request.query_params.get('search', '')
    if not search_query:
        return Response([])
        
    students = Student.objects.filter(
        Q(name__icontains=search_query) |
        Q(email__icontains=search_query) |
        Q(student_id__icontains=search_query)
    )[:10]  # Limit to 10 results
    
    data = [{
        'student_id': student.student_id,
        'name': student.name,
        'email': student.email
    } for student in students]
    
    return Response(data)