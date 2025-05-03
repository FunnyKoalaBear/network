from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post, Follow, Comment


def index(request):
    return render(request, "network/index.html", {
        "posts": Post.objects.all().order_by("-timestamp"),
        "user": request.user
    }) 


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def profile(request, username):
    #follower count, following count, display all posts, follow/unfollow button
    profile_user = User.objects.get(username=username)
    

    return render(request, "network/profile.html", {
        "userName": profile_user.username,
        "bio": profile_user.bio,
        "posts": profile_user.posts.all(),
        "pfp": profile_user.profile_picture,   
    })


def editProfile(request, username):
    profile_user = User.objects.get(username=username)

    if request.method == "POST":
        #for saving the profile
        newUsername = request.POST["username"]
        newBio = request.POST["bio"]
        newProfile_picture = request.FILES.get("profile_picture")

        profile_user = User.objects.get(username=username)
        profile_user.username = newUsername
        profile_user.bio = newBio
        profile_user.profile_picture = newProfile_picture

        profile_user.save()

        login(request, profile_user) #re-login the user after changing username

        return render(request, "network/profile.html", {
            "userName": profile_user.username,
            "bio": profile_user.bio,
            "posts": profile_user.posts.all(),
            "pfp": profile_user.profile_picture,   
        })

    else: 
        return render(request, "network/editProfile.html", {
            "userName": profile_user.username,
            "bio": profile_user.bio

        })
        

def newPost(request):
    user = request.user

    if request.method == "POST":
        content = request.POST["content"]   
        title = request.POST["title"]     

        #creating the post 
        post = Post.objects.create(user=user, content=content, title=title)
        post.save()
        #redirecting to the profile page
        return render(request, "network/profile.html", {
            "userName": user.username,
            "bio": user.bio,
            "posts": user.posts.all(),
            "pfp": user.profile_picture
        })
    
    else:
        return render(request, "network/newPost.html", {
            "userName": user.username,
            "bio": user.bio,
            "pfp": user.profile_picture
        })


def likePost(request):
    pass


def commentPost(request):
    pass


def editPost(request):
    pass

def deletePost(request):
    pass
