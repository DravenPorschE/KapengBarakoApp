document.addEventListener("DOMContentLoaded", () => {
    const findButton = document.querySelector(".search-button");
    const searchInput = document.querySelector(".search-input");

    const suggestions = [
        "Lipa City Civil Registrar's Office", 
        "Lipa City Assessor's Office",
        "Lipa City Treasurer's Office",
        "Lipa City Personnel Office",
        "Lipa City Cooperatives Office",
        "Lipa City Accounting Office",
        "Lipa City Legal Office",
        "Commision On Audit",
        "Lipa City Budget Office",
        "Administrative Division",
        "Lipa City Permits and Licensing Office",
        "Business One Stop Shop (BOSS)",
        "Lipa City Community Affairs Office",
        "Lipa City Planning and Development Office",
        "Office of the Congressman",
        "Lipa City Mayor's Office",
        "Lipa City Administrator's Office",
        "Office of the Sangguniang Panglungsod",
        "Lipa City Vice Mayor's Office"
    ];

    const zoomIn = document.querySelector(".zoom-in");
    const zoomOut = document.querySelector(".zoom-out");

    const wrapper = document.querySelector('.map-view');
    const content = document.querySelector('.map-size');

    const urlParams = new URLSearchParams(window.location.search);
    let val = urlParams.get("view");

    let pulsatingRoom;

    if (val) {
        val = decodeURIComponent(val);
        val = val.replace(/['''\u2018\u2019]/g, "_");
    }

    console.log("Normalized val:", val);

    let currentFloor = 1;
    let autoRoute = false;

    findRoomFloorFromSVG(val);

    function findRoomFloorFromSVG(val) {
        const floorMap = {
            "Ground Floor": 1,
            "First Floor": 1,
            "Second Floor": 2,
            "Third Floor": 3,
            "Fourth Floor": 4,
            "Fifth Floor": 5
        };

        const floorFiles = [
            "ground floor",
            "second floor",
            "third floor",
            "fourth floor",
            "fifth floor"
        ];

        floorFiles.forEach(floorName => {
            fetch(`/assets/maps/${floorName}.svg`)
                .then(res => res.ok ? res.text() : Promise.reject("SVG not found"))
                .then(svgText => {
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                    const rooms = svgDoc.querySelectorAll(".rooms");

                    const targetRoom = Array.from(rooms).find(r => r.dataset.roomname === val);
                    if (targetRoom) {
                        const locationName = targetRoom.dataset.floorlocation;
                        const floorNumber = floorMap[locationName];
                        console.log(`Room "${val}" is on floor number:`, floorNumber, `(from "${locationName}")`);
                        currentFloor = floorNumber;
                        changeFloor(floorNumber);
                        autoRoute = true;
                    }
                })
                .catch(err => console.warn(`Error loading ${floorName}:`, err));
        });
    }

    const floorUpBtn = document.querySelector(".floor-up");
    const floorDownBtn = document.querySelector(".floor-down");

    const floorLocation = document.getElementById("floor-location");
    const servicesOffered = document.getElementById("services-offered");

    const floorDisplay = document.getElementById("floor-display");

    const mapDepartmentName = document.querySelector(".map-department-name");

    let activeRoom = null;

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 3.0;
    const ZOOM_STEP = 0.5;

    let zoomVal = 1; 
    let currentX = 0; 
    let currentY = 0;
    let startX = 0, startY = 0;

    const MIN_FLOOR = 1;
    const MAX_FLOOR = 5;

    const servicesListContainer = document.querySelector(".services-list");

    const floorMap = {
        "Ground Floor": 1,
        "First Floor": 1,
        "Second Floor": 2,
        "Third Floor": 3,
        "Fourth Floor": 4,
        "Fifth Floor": 5
    };

    function updateDisplay() {
        content.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomVal})`;
    }

    zoomIn.addEventListener('click', () => {
        zoomVal = Math.min(MAX_ZOOM, zoomVal + ZOOM_STEP);
        updateDisplay();
    });

    zoomOut.addEventListener('click', () => {
        zoomVal = Math.max(MIN_ZOOM, zoomVal - ZOOM_STEP);
        updateDisplay();
    });

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
        }
    });

    floorDownBtn.addEventListener("click", () => {
        if (currentFloor > MIN_FLOOR) {
            currentFloor -= 1;
            changeFloor(currentFloor);
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
                if (!response.ok) throw new Error("SVG not found");
                return response.text();
            })
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                const svgElement = svgDoc.querySelector('svg');

                content.querySelectorAll(".rooms").forEach(room => stopPulse(room));

                content.innerHTML = "";
                floorLocation.textContent = "No Data";

                content.appendChild(svgElement);

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

                const departmentName = activeRoom.dataset.roomname.replace('_', "'");
                mapDepartmentName.textContent = departmentName;
                floorLocation.textContent = activeRoom.dataset.floorlocation;

                getServiceList(activeRoom.dataset.roomname);
                stopPulse(pulsatingRoom);
                pulsatingRoom = null;
            });

            if (val && room.dataset.roomname === val) {
                pulsatingRoom = room;
                activeRoom = room;
                room.style.fillOpacity = 1;
                mapDepartmentName.textContent = room.dataset.roomname.replace('_', "'");
                floorLocation.textContent = room.dataset.floorlocation;
                getServiceList(activeRoom.dataset.roomname);

                startPulse(room);
            }
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
                let filename = `${roomName} External Services`.replace('_', "'");
                let serviceItem = document.createElement("li");
                serviceItem.classList.add("service-item");
                serviceItem.appendChild(document.createTextNode(filename));
                serviceItem.appendChild(document.createElement("br"));
                serviceItem.appendChild(document.createElement("br"));
                serviceItem.appendChild(document.createTextNode("Click for more details"));
                servicesListContainer.appendChild(serviceItem);
            }

            if (isJson(internalRes)) {
                let filename = `${roomName} Internal Services`.replace('_', "'");
                let serviceItem = document.createElement("li");
                serviceItem.classList.add("service-item");
                serviceItem.appendChild(document.createTextNode(filename));
                serviceItem.appendChild(document.createElement("br"));
                serviceItem.appendChild(document.createElement("br"));
                serviceItem.appendChild(document.createTextNode("Click for more details"));
                servicesListContainer.appendChild(serviceItem);
            }

        } catch (err) {
            console.error(err);
        }
    }

    if (!autoRoute) {
        changeFloor(currentFloor);
    }

    servicesListContainer.addEventListener("click", (e) => {
        const li = e.target.closest(".service-item");

        if (li) {
            let itemName = li.textContent.replace("Click for more details", "").trim();
            updateTotalVisitor(itemName);
            window.location.href = `/pages/document-selector.html?view=${itemName}`;
        }
    });

    function updateTotalVisitor(visited) {
        let data = JSON.parse(localStorage.getItem("visitors"));

        if (!data) {
            data = {
                "Lipa City Accounting Office External Services": 0,
                "Lipa City Accounting Office Internal Services": 0,
                "Lipa City Administrator_s Office External Services": 0,
                "Lipa City Agriculture Office External Services": 0,
                "Lipa City Assesor_s Office External Services": 0,
                "Lipa City Budget Office External Services": 0,
                "Lipa City Civil Registrar_s Office External Services": 0,
                "Lipa City Community Affairs Office External Services": 0,
                "Lipa City Cooperatives Office External Services": 0,
                "Lipa City Engineering Office External Services": 0,
                "Lipa City Environment and Natural Resources Office External Services": 0,
                "Lipa City General Services Office Internal Services": 0,
                "Lipa City Health Office External Services": 0,
                "Lipa City Legal Office External Services": 0,
                "Lipa City Mayor_s Office External Services": 0,
                "Lipa City Mayor_s Office Internal Services": 0,
                "Lipa City Permits and Licensing Office External Services": 0,
                "Lipa City Personnel Office External Services": 0,
                "Lipa City Personnel Office Internal Services": 0,
                "Lipa City Planning and Development Office External Services": 0,
                "Lipa City Public Order and Safety Office External Services": 0,
                "Lipa City Social Welfare and Development Office External Services": 0,
                "Lipa City Treasurer_s Office External Services": 0,
                "Lipa City Treasurer_s Office Internal Services": 0,
                "Lipa City Veterinary Office External Services": 0,
                "Kolehiyo ng Lungsod ng Lipa External Services": 0,
                "Ospital ng Lipa External Services": 0,
                "Ospital ng Lipa Internal Services": 0,
                "Office of the Sangguniang Panglungsod External Services": 0,
                "Lipa City Vice Mayor_s Office External Services": 0
            };
        }

        data[visited] = (data[visited] || 0) + 1;
        localStorage.setItem("visitors", JSON.stringify(data));
        console.log("Updated:", visited, "=", data[visited]);
    }

    function createPulse(element) {
        const clone = element.cloneNode(true);
        element.parentNode.insertBefore(clone, element);
        clone.style.pointerEvents = "none";

        let start = null;
        const duration = 1200;

        function animate(timestamp) {
            if (!start) start = timestamp;
            let progress = (timestamp - start) / duration;

            if (progress >= 1) { clone.remove(); return; }

            clone.style.transformOrigin = "center";
            clone.style.transformBox = "fill-box";
            clone.style.transform = `scale(${1 + progress - 0.1})`;
            clone.style.opacity = 1 - progress;

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    function startPulse(element) {
        if (element._pulseRunning) return;
        element._pulseRunning = true;

        function loop() {
            if (!element._pulseRunning) return;
            createPulse(element);
            element._pulseTimeout = setTimeout(loop, 1000);
        }

        loop();
    }

    function stopPulse(element) {
        if (!element) return;
        element._pulseRunning = false;
        clearTimeout(element._pulseTimeout);
    }

    findButton.addEventListener("click", () => {
        const value = searchInput.value.trim();
        if (value) {
            window.location.href = `/pages/map-view.html?view=${encodeURIComponent(value)}`;
        }
    });

    searchInput.addEventListener("input", () => {
        const value = searchInput.value;
        if (suggestions.includes(value)) {
            window.location.href = `/pages/map-view.html?view=${value}`;
        }
    });

    // ── Keyboard Setup ────────────────────────────────────────────
    const keyboardContainer = document.querySelector(".main-keyboard-container");
    const keys = document.querySelectorAll(".keyboard-keys");

    function showKeyboard() {
        keyboardContainer.classList.add("keyboard-visible");
    }

    function hideKeyboard() {
        keyboardContainer.classList.remove("keyboard-visible");
    }

    keys.forEach(key => {
        key.addEventListener("mousedown", (e) => {
            e.preventDefault(); // keeps focus on searchInput
            const keyValue = key.textContent.trim();

            searchInput.focus();

            if (key.classList.contains("action-keys") && key.id !== "keyboard-search") {
                // Del
                searchInput.value = searchInput.value.slice(0, -1);
            } else if (keyValue.toLowerCase() === "search") {
                const currentVal = searchInput.value.trim();
                if (currentVal) {
                    window.location.href = `/pages/map-view.html?view=${encodeURIComponent(currentVal)}`;
                }
            } else if (keyValue.toLowerCase() === "space") {
                searchInput.value += " ";
            } else {
                searchInput.value += keyValue;
            }

            // trigger input listener so suggestion redirect still fires
            searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        });
    });

    // Clicking inside keyboard container shouldn't blur the input
    keyboardContainer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        searchInput.focus();
    });

    searchInput.addEventListener("focus", showKeyboard);

    searchInput.addEventListener("blur", () => {
        // Delay so mousedown on a key fires before keyboard disappears
        setTimeout(hideKeyboard, 150);
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !keyboardContainer.contains(e.target)) {
            searchInput.blur();
        }
    });
});