
// =====================================
// R K EVENTS - FRONTEND + FASTAPI
// =====================================

const API_URL = "https://event-feedback-management-system-xeor.onrender.com";

console.log("R K Events frontend loaded!");


// =====================================
// NAVIGATION
// =====================================

const navLinks =
    document.querySelectorAll(".nav-buttons a");

navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        console.log("Clicked:", link.textContent);

    });

});


// =====================================
// HOME PAGE
// =====================================

const messageButton =
    document.querySelector("#messageButton");

const welcomeMessage =
    document.querySelector("#welcomeMessage");

const heading =
    document.querySelector(".hero h1");


if (messageButton && welcomeMessage) {

    messageButton.addEventListener(
        "click",
        function () {

            if (welcomeMessage.textContent === "") {

                welcomeMessage.textContent =
                    "Thank you for visiting R K Events!";

            } else {

                welcomeMessage.textContent = "";

            }

        }
    );

}


if (heading) {

    heading.classList.add("highlight");

}


// =====================================
// EVENTS FROM FASTAPI
// =====================================

const eventGrid =
    document.querySelector("#eventGrid");


async function loadEvents() {

    if (!eventGrid) {
        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/events`);

        const events =
            await response.json();

        eventGrid.innerHTML = "";

        events.forEach(function (event) {

            eventGrid.innerHTML += `

                <div class="event-card">

                    <div class="event-date">

                        <strong>
                            ${event.date}
                        </strong>

                    </div>

                    <div class="event-content">

                        <h2>
                            ${event.name}
                        </h2>

                        <p class="event-location">
                            📍 ${event.location}
                        </p>

                        <p>
                            ${event.description}
                        </p>

                        <a
                            href="feedback.html?event=${encodeURIComponent(event.name)}"
                            class="btn btn-primary"
                        >
                            Give Feedback
                        </a>

                    </div>

                </div>

            `;

        });

    } catch (error) {

        console.error(
            "Error loading events:",
            error
        );

        eventGrid.innerHTML =
            "<p>Unable to load events.</p>";

    }

}


loadEvents();


// =====================================
// FEEDBACK PAGE
// =====================================

const feedbackForm =
    document.querySelector("#feedbackForm");


if (feedbackForm) {

    const eventSelect =
        document.querySelector("#eventName");


    // Get event from URL

    const params =
        new URLSearchParams(
            window.location.search
        );

    const selectedEvent =
        params.get("event");


    if (selectedEvent) {

        eventSelect.value =
            selectedEvent;

    }


    // =================================
    // SUBMIT FEEDBACK TO FASTAPI
    // =================================

    feedbackForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .querySelector("#name")
                    .value
                    .trim();


            const email =
                document
                    .querySelector("#email")
                    .value
                    .trim();


            const eventName =
                document
                    .querySelector("#eventName")
                    .value;


            const rating =
                document
                    .querySelector("#rating")
                    .value;


            const feedback =
                document
                    .querySelector("#feedback")
                    .value
                    .trim();


            // =================================
            // VALIDATION
            // =================================

            if (
                name === "" ||
                email === "" ||
                eventName === "" ||
                rating === "" ||
                feedback === ""
            ) {

                alert(
                    "Please fill all the fields."
                );

                return;

            }


            if (!email.includes("@")) {

                alert(
                    "Please enter a valid email."
                );

                return;

            }


            try {

                // =================================
                // SEND DATA TO FASTAPI
                // =================================

                const response =
                    await fetch(
                        `${API_URL}/feedback`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                event: eventName,

                                rating:
                                    Number(rating),

                                feedback: feedback

                            })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        "Something went wrong."
                    );

                    return;

                }


                // =================================
                // SUCCESS
                // =================================

                const successMessage =
                    document.querySelector(
                        "#successMessage"
                    );


                successMessage.textContent =
                    result.message;


                feedbackForm.reset();


                // Reload backend feedback
                displaySavedFeedback();


            } catch (error) {

                console.error(
                    "Backend error:",
                    error
                );

                alert(
                    "Backend server is not running."
                );

            }

        }
    );

}


// =====================================
// GET FEEDBACK FROM FASTAPI
// =====================================

async function displaySavedFeedback() {

    const savedFeedback =
        document.querySelector(
            "#savedFeedback"
        );


    if (!savedFeedback) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/feedback`
            );


        const result =
            await response.json();


        const feedbacks =
            result.feedbacks;


        if (feedbacks.length === 0) {

            savedFeedback.innerHTML = `

                <h3>Total Feedback: 0</h3>

                <p>
                    No feedback submitted yet.
                </p>

            `;

            return;

        }


        // =================================
        // SEARCH
        // =================================

        const searchFeedback =
            document.querySelector(
                "#searchFeedback"
            );


        const ratingFilter =
            document.querySelector(
                "#ratingFilter"
            );


        const searchText =
            searchFeedback
                ? searchFeedback.value
                    .toLowerCase()
                : "";


        const selectedRating =
            ratingFilter
                ? ratingFilter.value
                : "all";


        // =================================
        // FILTER
        // =================================

        const filteredFeedbacks =
            feedbacks.filter(
                function (feedback) {

                    const matchesSearch =

                        feedback.name
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        feedback.event
                            .toLowerCase()
                            .includes(searchText);


                    const matchesRating =

                        selectedRating === "all"

                        ||

                        String(feedback.rating)
                            === selectedRating;


                    return (
                        matchesSearch &&
                        matchesRating
                    );

                }
            );


        savedFeedback.innerHTML = `

            <h3>
                Total Feedback: ${feedbacks.length}
            </h3>

            <p>
                Showing
                ${filteredFeedbacks.length}
                result(s)
            </p>

        `;


        if (
            filteredFeedbacks.length === 0
        ) {

            savedFeedback.innerHTML += `

                <p>
                    No matching feedback found.
                </p>

            `;

            return;

        }


        // =================================
        // DISPLAY FEEDBACK
        // =================================

        filteredFeedbacks.forEach(
            function (feedback) {

                savedFeedback.innerHTML += `

                    <div class="event-card">

                        <div class="event-content">

                            <h3>
                                ${feedback.name}
                            </h3>

                            <p>
                                <strong>
                                    Email:
                                </strong>

                                ${feedback.email}
                            </p>

                            <p>
                                <strong>
                                    Event:
                                </strong>

                                ${feedback.event}
                            </p>

                            <p>
                                <strong>
                                    Rating:
                                </strong>

                                ${feedback.rating}/5
                            </p>

                            <p>
                                <strong>
                                    Feedback:
                                </strong>

                                ${feedback.feedback}
                            </p>

                            <button
                                class="btn btn-primary"
                                onclick="deleteFeedback(${feedback.id})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;

            }
        );


    } catch (error) {

        console.error(
            "Error loading feedback:",
            error
        );

        savedFeedback.innerHTML =
            "<p>Unable to load feedback.</p>";

    }

}


// =====================================
// DELETE ONE FEEDBACK
// =====================================

async function deleteFeedback(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/feedback/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                "Unable to delete feedback."
            );

            return;

        }


        console.log(result.message);


        displaySavedFeedback();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

    }

}


// =====================================
// CLEAR ALL FEEDBACK
// =====================================

const clearAllBtn =
    document.querySelector("#clearAllBtn");


if (clearAllBtn) {

    clearAllBtn.addEventListener(
        "click",
        async function () {

            const confirmDelete =
                confirm(
                    "Are you sure you want to delete all feedback?"
                );


            if (!confirmDelete) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/feedback`,
                        {
                            method: "DELETE"
                        }
                    );


                const result =
                    await response.json();


                alert(result.message);


                displaySavedFeedback();


            } catch (error) {

                console.error(
                    "Clear error:",
                    error
                );

            }

        }
    );

}


// =====================================
// SEARCH
// =====================================

const searchFeedback =
    document.querySelector(
        "#searchFeedback"
    );


if (searchFeedback) {

    searchFeedback.addEventListener(
        "input",
        function () {

            displaySavedFeedback();

        }
    );

}


// =====================================
// RATING FILTER
// =====================================

const ratingFilter =
    document.querySelector(
        "#ratingFilter"
    );


if (ratingFilter) {

    ratingFilter.addEventListener(
        "change",
        function () {

            displaySavedFeedback();

        }
    );

}


// =====================================
// LOAD FEEDBACK
// =====================================

displaySavedFeedback();
