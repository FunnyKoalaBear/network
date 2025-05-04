
console.log("Script loaded");


// Function to get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            // If this cookie string begins with the name we want
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


document.addEventListener("DOMContentLoaded", function() {
    const likeButtons = document.querySelectorAll(".likeButton");
    const csrftoken = getCookie("csrftoken");
    
    //adds an event listener to each like button
    //when the button is clicked, it sends a POST request to the server
    //with the post ID and the CSRF token
    likeButtons.forEach(button => {
        console.log("Script loaded");

        button.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default action of the button

            const postID = this.getAttribute("data-id");

            //the json data to send
            fetch(`likePost/${postID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ post_id: postID })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Server error: ${response.status} — ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                document.getElementById(`likeCount-${postID}`).innerText = data.likes;
            })
            .catch(error => console.error("Error:", error));
              
        })
    })
});
