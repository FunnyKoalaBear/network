from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("profile/<str:username>/edit", views.editProfile, name="editProfile"),
    path("newPost", views.newPost, name="newPost"),
    path("likePost/<int:post_id>", views.likePost ,name="likePost"),
    path("editPost/<int:post_id>", views.editPost, name="editPost"),
    path("toggle_follow", views.toggle_follow, name="toggle_follow")
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

