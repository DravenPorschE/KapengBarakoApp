document.addEventListener("DOMContentLoaded", () => {
    const zoomIn = document.querySelector(".zoom-in");
    const zoomOut = document.querySelector(".zoom-out");

    const wrapper = document.querySelector('.map-view');
    const content = document.querySelector('.map-size');

    // const rooms = document.querySelectorAll(".rooms");

    const floorUpBtn = document.querySelector(".floor-up");
    const floorDownBtn = document.querySelector(".floor-down");

    const floorLocation = document.getElementById("floor-location");
    const servicesOffered = document.getElementById("services-offered");

    const floorDisplay = document.getElementById("floor-display");

    let activeRoom = null;
    let currentFloor = 1;

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 3.0;
    const ZOOM_STEP = 0.5; // Smaller steps feel smoother

    let zoomVal = 1; 
    let currentX = 0; 
    let currentY = 0;
    let startX = 0, startY = 0;

        
    const MIN_FLOOR = 1;
    const MAX_FLOOR = 5;

    const servicesListContainer = document.querySelector(".services-list");

    function updateDisplay() {
        content.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomVal})`;
    }

    // --- Zoom In with Limit ---
    zoomIn.addEventListener('click', () => {
          // Math.min ensures the value never goes ABOVE the Max
        zoomVal = Math.min(MAX_ZOOM, zoomVal + ZOOM_STEP);
        updateDisplay();
    });

        // --- Zoom Out with Limit ---
        zoomOut.addEventListener('click', () => {
            // Math.max ensures the value never goes BELOW the Min
            zoomVal = Math.max(MIN_ZOOM, zoomVal - ZOOM_STEP);
            updateDisplay();
        });

        // --- Panning Logic (Remains the same) ---
        wrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            content.style.transition = 'none';
        }, { passive: false });

        wrapper.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;

            let moveX = currentX + deltaX;
            let moveY = currentY + deltaY;

            content.style.transform = `translate(${moveX}px, ${moveY}px) scale(${zoomVal})`;
        }, { passive: false });

        wrapper.addEventListener('touchend', (e) => {
            const deltaX = e.changedTouches[0].clientX - startX;
            const deltaY = e.changedTouches[0].clientY - startY;

            currentX += deltaX;
            currentY += deltaY;
            content.style.transition = 'transform 0.2s ease-out';
        });

    

    
    floorUpBtn.addEventListener("click", () => {
        if (currentFloor < MAX_FLOOR) {
            currentFloor += 1;
            changeFloor(currentFloor);
        } else {
            console.log("Already at the top floor.");
        }
    });
    
    floorDownBtn.addEventListener("click", () => {
        if (currentFloor > MIN_FLOOR) {
            currentFloor -= 1;
            changeFloor(currentFloor);
        } else {
            console.log("Already at the bottom floor.");
        }
    });
    

    function changeFloor(floorNumber) {
        let floorName = "";

        switch(floorNumber) {
            case 1: floorName = "ground floor"; floorDisplay.textContent = "Ground Floor"; break;
            case 2: floorName = "second floor"; floorDisplay.textContent = "Second Floor"; break;
            case 3: floorName = "third floor"; floorDisplay.textContent = "Third Floor"; break;
            case 4: floorName = "fourth floor"; floorDisplay.textContent = "Fourth Floor"; break;
            case 5: floorName = "fifth floor"; floorDisplay.textContent = "Fifth Floor"; break;
        }

        fetch(`/assets/maps/${floorName}.svg`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("SVG not found");
                }
                return response.text();
            })
            .then(svgText => {

                // console.log(svgText);
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

                const svgElement = svgDoc.querySelector('svg');

                content.innerHTML = "";
                floorLocation.textContent = "No Data";
                servicesOffered.textContent = "No Data";

                content.appendChild(svgElement);

                // reset everything
                zoomVal = 1;
                currentX = 0;
                currentY = 0;
                activeRoom = null;
                updateDisplay();

                setupRooms();
            })
            .catch(err => console.error(err));
    }
    function setupRooms() {
        const rooms = content.querySelectorAll(".rooms");

        rooms.forEach(room => {
            room.style.fillOpacity = 0.5;

            room.addEventListener("click", (e) => {
                if (activeRoom) activeRoom.style.fillOpacity = 0.5;

                const selected = e.target.closest(".rooms");
                selected.style.fillOpacity = 1;
                activeRoom = selected;

                floorLocation.textContent = activeRoom.dataset.floorlocation;
                getServiceList(activeRoom.dataset.roomname);
            });
        });
    }

    async function getServiceList(roomName) {
        try {
            const baseName = roomName.toLowerCase();
            servicesListContainer.innerHTML = "";

            const [externalRes, internalRes] = await Promise.all([
                fetch(`/data/${baseName} external Services.json`),
                fetch(`/data/${baseName} internal Services.json`)
            ]);

            const isJson = (res) =>
                res.ok && res.headers.get("content-type")?.includes("application/json");

            if (isJson(externalRes)) {
                console.log("external available");

                let filename = `${roomName} External Services`;

                let serviceItem = document.createElement("li");
                serviceItem.classList.add("service-item");
                serviceItem.textContent = filename;

                servicesListContainer.appendChild(serviceItem);
            } else {
                console.log("external NOT available");
            }

            if (isJson(internalRes)) {
                console.log("internal available");

                let filename = `${roomName} Internal Services`;

                let serviceItem = document.createElement("li");
                serviceItem.classList.add("service-item");
                serviceItem.textContent = filename;

                servicesListContainer.appendChild(serviceItem);
            } else {
                console.log("internal NOT available");
            }

        } catch (err) {
            console.error(err);
        }
    }

    changeFloor(currentFloor);
    // getServiceList(roomName);
});