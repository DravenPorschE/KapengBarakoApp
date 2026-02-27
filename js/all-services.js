document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector(".carousel");
    const group = document.querySelector(".group");
    const backBtn = document.getElementById("back-button");

    backBtn.addEventListener("click", function () {
        window.location.href = "/pages/home.html";
    });

    function updateTotalVisitor(visited) {
        let data = JSON.parse(localStorage.getItem("visitors"));

        if (!data) {
            data = {
                "Lipa City Accounting Office External Services": 0,
                "Lipa City Accounting Office Internal Services": 0,
                "Lipa City Administrator's Office External Services": 0,
                "Lipa City Agriculture Office External Services": 0,
                "Lipa City Assesor's Office External Services": 0,
                "Lipa City Budget Office External Services": 0,
                "Lipa City Civil Registar's Office External Services": 0,
                "Lipa City Community Affairs Office External Services": 0,
                "Lipa City Cooperatives Office External Services": 0,
                "Lipa City Engineering Office External Services": 0,
                "Lipa City Environment and Natural Resources Office External Services": 0,
                "Lipa City General Services Office Internal Services": 0,
                "Lipa City Health Office External Services": 0,
                "Lipa City Legal Office External Services": 0,
                "Lipa City Mayor's Office External Services": 0,
                "Lipa City Mayor's Office Internal Services": 0,
                "Lipa City Permits and Licensing Office External Services": 0,
                "Lipa City Personnel Office External Services": 0,
                "Lipa City Personnel Office Internal Services": 0,
                "Lipa City Planning and Development Office External Services": 0,
                "Lipa City Public Order and Safety Office External Services": 0,
                "Lipa City Social Welfare and Development Office External Services": 0,
                "Lipa City Treasurer's Office External Services": 0,
                "Lipa City Treasurer's Office Internal Services": 0,
                "Lipa City Veterinary Office External Services": 0,
                "Kolehiyo ng Lungsod ng Lipa External Services": 0,
                "Ospital ng Lipa External Services": 0,
                "Ospital ng Lipa Internal Services": 0,
                "Office of the Sangguniang Panglungsod External Services": 0,
                "Lipa City Vice Mayor's Office External Services": 0
            };
        }

        data[visited] = (data[visited] || 0) + 1;

        localStorage.setItem("visitors", JSON.stringify(data));

        console.log("Updated:", visited, "=", data[visited]);
    }

    group.innerHTML += group.innerHTML;

    const singleSetWidth = group.scrollWidth / 2;
    carousel.scrollLeft = singleSetWidth;

    function updateActiveCard() {
        const cards = document.querySelectorAll(".card");
        const center = carousel.scrollLeft + carousel.offsetWidth / 2;

        let closest = null;
        let minDist = Infinity;

        cards.forEach(card => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const dist = Math.abs(center - cardCenter);

            if (dist < minDist) {
                minDist = dist;
                closest = card;
            }
        });

        cards.forEach(card => card.classList.remove("active"));

        if (closest) {
            closest.classList.add("active");

            closest.onclick = () => {
                const officeName = closest.querySelector("h3").textContent.trim();

                // ✅ UPDATE VISITOR COUNT
                updateTotalVisitor(officeName);

                // ✅ REDIRECT
                window.location.href =
                    `../pages/document-selector.html?view=${encodeURIComponent(officeName)}`;
            };
        }
    }

    function repositionIfNeeded() {
        const maxScroll = singleSetWidth * 2 - carousel.offsetWidth;

        if (carousel.scrollLeft <= 0 || carousel.scrollLeft >= maxScroll) {
            carousel.style.scrollSnapType = "none";

            if (carousel.scrollLeft <= 0) {
                carousel.scrollLeft += singleSetWidth;
            } else {
                carousel.scrollLeft -= singleSetWidth;
            }

            carousel.offsetHeight;
            carousel.style.scrollSnapType = "x mandatory";
        }
    }

    carousel.addEventListener("scroll", () => {
        repositionIfNeeded();
        requestAnimationFrame(updateActiveCard);
    });

    updateActiveCard();
});