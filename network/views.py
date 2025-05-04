from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follow, Comment
from django.contrib.auth.decorators import login_required


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
    try:
        profile_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponse("User not found", status=404)
    
    followerCount = Follow.objects.filter(following=profile_user).count()
    followingCount = Follow.objects.filter(follower=profile_user).count()
    

    return render(request, "network/profile.html", {
        "userName": profile_user.username,
        "bio": profile_user.bio,
        "posts": Post.objects.filter(user=profile_user).order_by("-timestamp"),
        "pfp": profile_user.profile_picture,   
        "followerCount": followerCount,
        "followingCount": followingCount
    })


@login_required
def editProfile(request, username):
    profile_user = User.objects.get(username=username)

    newProfile_picture = profile_user.profile_picture

    if request.method == "POST" and request.user.username == username:
        #for saving the profile
        newUsername = request.POST["username"]
        newBio = request.POST["bio"]

        if request.FILES.get("profile_picture") != None: 
            newProfile_picture =request.FILES.get("profile_picture")
        
    
        profile_user.profile_picture = newProfile_picture
        profile_user.username = newUsername
        profile_user.bio = newBio
        

        profile_user.save()

        login(request, profile_user) #re-login the user after changing username

        return render(request, "network/profile.html", {
            "userName": profile_user.username,
            "bio": profile_user.bio,
            "posts": profile_user.posts.all().order_by("timestamp"),
            "pfp": profile_user.profile_picture,   
        })

    else: 
        return render(request, "network/editProfile.html", {
            "userName": profile_user.username,
            "bio": profile_user.bio

        })
        

@login_required
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


@login_required
def likePost(request, post_id):
    if request.method == "POST":
        post =  Post.objects.get(id=post_id)
        user = request.user

        if post.likes.filter(id=user.id).exists():
            #remove like
            post.likes.remove(user)
        else: 
            #add like
            post.likes.add(user)
        
        post.save()
        data = {
            'likes': post.likes.count(),
        }
        return JsonResponse(data)
     
    else:
        # Handling non-POST request
        return JsonResponse({"error": "Invalid request"}, status=400)  # In case of non-POST request
        


@login_required
def editPost(request, post_id):

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found"}, status=404)
    
    #for saving edit
    if request.method == "POST":
        user = request.user

        if post.user == user:

            data = json.loads(request.body) #wth u have to actually save the data in an object first, not just POST["VARIABLENAME"] too many hours spend on this lol
            title = data.get("title")
            content = data.get("content")

            post.title = title
            post.content = content

            post.save()
            return JsonResponse({"message": "Post updated successfully"})
        
        else:
            #unlogined user is accessing
            return JsonResponse({"error": "Not authorized to view this post"}, status=403)

    #for getting post information to edit it
    elif request.method == "GET":
        user = request.user

        if post.user == user:
            #verified that post author is editing
            content = post.content
            title = post.title

            data = {
                'title': title,
                'content': content
            }

            return JsonResponse(data)
        
        else:
            #unlogined user is accessing
            return JsonResponse({"error": "Not authorized to view this post"}, status=403)
        
        
    return JsonResponse({"error": "Invalid Request"}, status=400)  # In case of non-POST request



#extra feature
@login_required
def commentPost(request):
    pass  


#extra feature
@login_required
def deletePost(request):
    pass


@login_required
def listFollowers(request):
    pass
