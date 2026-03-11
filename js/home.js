document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("search-input");
    const keyboardContainer = document.querySelector(".main-keyboard-container");
    const keys = document.querySelectorAll(".keyboard-keys");

    const sidebarContainer = document.getElementById("sidebar-container");
    const toggleBtn = document.getElementById('burger');
    const closeBtn = document.getElementById('close-button');

    const input = document.getElementById("search-input");
    const texts = ["Business Permit", "Mayor's Permit", "Marriage Certificate", "Birth Certificate"];
    let textIndex = 0;
    let index = 0;
    let direction = 1;

    const browseAllDepartments = document.getElementById("browse-all-departments");

    let output = "";

    let data = [];
    fetch("/data/services-list.json")
        .then(res => res.json())
        .then(json => data = json);

    const clearBtn = document.getElementById("clear-btn");
    const autocompleteList = document.getElementById("autocomplete-list");
    const searchBtn = document.getElementById("search-icon-left");

    const keyboardSearch = document.getElementById("keyboard-search");

    let finalSearch = searchInput.value.trim();

    browseAllDepartments.addEventListener('click', () => {
        window.location.href = "/pages/all-services.html";
    });

    // ── Keyboard key press ──────────────────────────────────────
    keys.forEach(key => {
        key.addEventListener("mousedown", (e) => {
            e.preventDefault(); // prevent blur on searchInput
            const keyValue = key.textContent.trim();

            searchInput.focus();

            if (keyValue === "<--") {
                searchInput.value = searchInput.value.slice(0, -1);
            } else if (keyValue.toLowerCase() === "search") {
                let bestSearch = output[0];
                if (bestSearch != null) {
                    window.location.href = `/pages/dynamic-service.html?search=${encodeURIComponent(bestSearch)}`;
                }
            } else if (keyValue.toLowerCase() === "space") {
                searchInput.value += " ";
            } else {
                searchInput.value += keyValue;
            }

            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
        });
    });

    // ── Show keyboard on search focus ───────────────────────────
    searchInput.addEventListener("focus", () => {
        keyboardContainer.classList.add("keyboard-visible");
        document.getElementById("search-container").classList.add("keyboard-open");
    });

    // ── Hide keyboard when clicking outside ─────────────────────
    document.addEventListener("pointerdown", (e) => {
        const insideSearch   = searchInput.contains(e.target) || e.target === searchInput;
        const insideKeyboard = keyboardContainer.contains(e.target);

        if (!insideSearch && !insideKeyboard) {
            keyboardContainer.classList.remove("keyboard-visible");
            document.getElementById("search-container").classList.remove("keyboard-open");
            searchInput.blur();
            autocompleteList.innerHTML = "";
        }
    });

    // ── Autocomplete input handler ───────────────────────────────
    searchInput.addEventListener("input", function () {
        clearBtn.style.display = this.value ? "flex" : "none";

        const value = this.value.toLowerCase();
        autocompleteList.innerHTML = "";

        if (!value) return;

        fetch("/data/services-list.json")
            .then(res => res.json())
            .then(data => {
                const matches = data
                    .filter(item => {
                        const lower = item.toLowerCase();
                        // Prioritize: starts with value, OR any word in the phrase starts with value
                        return lower.startsWith(value) ||
                               lower.split(/\s+/).some(word => word.startsWith(value));
                    })
                    .sort((a, b) => {
                        // Exact start match ranks first
                        const aStarts = a.toLowerCase().startsWith(value) ? 0 : 1;
                        const bStarts = b.toLowerCase().startsWith(value) ? 0 : 1;
                        return aStarts - bStarts;
                    })
                    .slice(0, 5);

                output = matches;

                matches.forEach(match => {
                    const li = document.createElement("li");

                    const icon = document.createElement("img");
                    icon.src = "/assets/icons/search_icon.svg";
                    icon.alt = "search";
                    icon.classList.add("autocomplete-icon");

                    const text = document.createElement("span");
                    text.textContent = match;
                    text.classList.add("autocomplete-text");

                    li.appendChild(icon);
                    li.appendChild(text);

                    li.addEventListener("click", () => {
                        searchInput.value = match;
                        autocompleteList.innerHTML = "";
                    });

                    autocompleteList.appendChild(li);
                });
            });
    });

    // ── Clear button ─────────────────────────────────────────────
    clearBtn.addEventListener("click", function () {
        searchInput.value = "";
        autocompleteList.innerHTML = "";
        clearBtn.style.display = "none";
        searchInput.focus();
    });

    // ── Search icon click ────────────────────────────────────────
    searchBtn.addEventListener("click", () => {
        if (searchInput.value.trim() !== "") {
            window.location.href = `/pages/dynamic-service.html?search=${encodeURIComponent(searchInput.value)}`;
        }
    });

    // ── Placeholder typewriter ───────────────────────────────────
    function type() {
        const text = texts[textIndex];
        input.placeholder = text.slice(0, index);

        if (direction === 1 && index < text.length) {
            index++;
        } else if (direction === 1 && index === text.length) {
            direction = -1;
            setTimeout(type, 1000);
            return;
        } else if (direction === -1 && index > 0) {
            index--;
        } else if (direction === -1 && index === 0) {
            direction = 1;
            textIndex = (textIndex + 1) % texts.length;
        }

        setTimeout(type, 20);
    }

    type();
});