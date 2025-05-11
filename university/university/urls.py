"""
URL configuration for university project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from main.views import search_students, unenroll_course, enroll_course, update_email, student_dashboard, add_professor, list_professors, update_professor, delete_professor, login_user, logout_user,home,     professor_signup,student_signup,signup, professor_dashboard, add_course, update_course, delete_course, professor_courses_api
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('api-token-auth/', obtain_auth_token),
    path('', home, name='home'),
    path('signup/', signup, name='signup'),
    path('signup/professor/', professor_signup, name='professor_signup'),
    path('signup/student/', student_signup, name='student_signup'),
    path('admin/', admin.site.urls),
    path('add-professor/', add_professor, name='add_professor'),
    path('list-professors/', list_professors, name='list_professors'),
    path('update-professor/<int:pk>/', update_professor, name='update_professor'),
    path('delete-professor/<int:pk>/', delete_professor, name='delete_professor'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('professor/dashboard/', professor_dashboard, name='professor_dashboard'),
    path('api/professor/courses/', professor_courses_api, name='professor_courses_api'),
    path('professor/course/add/', add_course, name='add_course'),
    path('professor/course/update/<int:pk>/', update_course, name='update_course'),
    path('professor/course/delete/<int:pk>/', delete_course, name='delete_course'),
    path('student/dashboard/', student_dashboard, name='student_dashboard'),
    path("update-email/", update_email, name="update_email"),
    path('enroll/<int:course_id>/', enroll_course, name='enroll_course'),
    path('unenroll/<int:course_id>/', unenroll_course, name='unenroll_course'),
    path('api/signup/professor/', professor_signup, name='api_professor_signup'),
# Add to your urls.py
path('api/professor/students/search/', search_students, name='search_students'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
