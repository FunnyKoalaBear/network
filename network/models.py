from django.contrib.auth.models import AbstractUser
from django.db import models 


#gives field types like CharField, IntegerField, TextField, ImageField
#relatoinships like OneToOneField, ForeignKey, ManyToManyField


class User(AbstractUser):
    bio = models.TextField(max_length=30, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/penguin.png', blank=True)



    def __str__(self):
        return f"{self.username} Profile - {self.bio}"


    
class Post(models.Model):
    #title, user, content, timestamp, likes
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=30, default="Untitled")
    content = models.TextField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)

    def __str__(self):
        return f"{self.user.username} Post-  {self.content} - {self.timestamp}"


class Follow(models.Model):
    #follower, following
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following") #reverse lookup for people this user is following
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers") #reverse lookup for people following this user

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')  # prevents duplicate follows

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class Comment(models.Model):
    #user, post, content, timestamp
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} Comment - {self.content} - {self.timestamp}"
