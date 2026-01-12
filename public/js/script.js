// Bootstrap Validation Script
(function () {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })
})()


setTimeout(() => {
    const flashDiv = document.getElementById('flash-div');
    if (flashDiv) {
        location.reload()
    }
}, 2000); // 5 seconds


function getTimeAgo(dateString) {
    const createdAt = new Date(dateString);
    const now = new Date();
    const diffMs = now - createdAt;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// Now loop through and update your posts
document.querySelectorAll(".devConnect-post").forEach(postEl => {
    const timeText = getTimeAgo(postEl.dataset.createdAt);
    postEl.querySelector(".time").innerText = timeText;
});

const menus = document.querySelectorAll('.menu');

if (menus) {
    menus.forEach(menu => {
        const moreBtn = menu.querySelector('.moreBtn');
        const menuCard = menu.querySelector('.menuCard');

        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Close other open menus first
            document.querySelectorAll('.menuCard.show').forEach(card => {
                if (card !== menuCard) {
                    card.classList.remove('show');
                }
            });

            // Toggle current menu
            menuCard.classList.toggle('show');
        });

        // Close if clicked outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                menuCard.classList.remove('show');
            }
        });
    });
}

let followingBtns = document.querySelectorAll(".following");

followingBtns.forEach((btn) => {
    let originalText = btn.innerText.trim();

    if (["Following", "Following (Follows You)"].includes(originalText)) {
        btn.style.backgroundColor = "transparent";
        btn.style.fontWeight = "800";

        btn.addEventListener("mouseover", () => {
            btn.style.border = "1px solid red";
            btn.style.color = "red";
            btn.innerText = "Unfollow";
        });

        btn.addEventListener("mouseout", () => {
            btn.style.border = "1px solid white";
            btn.style.color = "white";
            btn.innerText = originalText;
        });
    }
});



let likeBtn = document.querySelectorAll('.like-btn');

if (likeBtn) {
    console.log(likeBtn)
    likeBtn.forEach(button => {
        button.addEventListener('click', async function (e) {
            e.preventDefault();

            let id = this.dataset.postId;

            try {
                let res = await fetch(`http://localhost:8080/posts/${id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                let data = await res.json();

                // Update like count
                let countSpan = this.parentElement.querySelector('.like-count');
                countSpan.textContent = data.likesCount;

                // Update icon (toggle heart)
                let icon = this.querySelector('i');
                if (data.liked) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                    icon.style.color = '#ff0000';
                } else {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                    icon.style.color = 'rgb(94, 87, 87)';
                }

            } catch (err) {
                console.error(err);
                alert("Something went wrong");
            }
        });
    });
}

const followBtn = document.getElementById('followBtn');
const followerCountElem = document.querySelector('a[href$="/follower"] b');

if (followBtn) {
    followBtn.addEventListener('click', async () => {
        const username = followBtn.dataset.username;

        try {
            const res = await fetch(`/profile/${username}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();

            if (data.isFollowing) {
                followBtn.textContent = "Following";
                // Decrease followers count
                let count = parseInt(followerCountElem.textContent);
                followerCountElem.textContent = count - 1;
                location.reload()
            } else {
                followBtn.textContent = "Follow";
                // Increase followers count
                let count = parseInt(followerCountElem.textContent);
                followerCountElem.textContent = count + 1;
                location.reload()
            }
        } catch (error) {
            location.reload()
            console.error('Error:', error);
        }
    });
}
