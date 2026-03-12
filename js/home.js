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

    // toggleBtn.addEventListener('click', () => {
    //     sidebarContainer.classList.toggle('show');
    // });

    // closeBtn.addEventListener('click', () => {
    //     sidebarContainer.classList.toggle('show');
    // });

    browseAllDepartments.addEventListener('click', () => {
        window.location.href = "/pages/all-services.html";
    });

    keys.forEach(key => {
        key.addEventListener("mousedown", (e) => {
            e.preventDefault();
            const keyValue = key.textContent.trim();

            searchInput.focus();

            if (keyValue === "<--") {
                searchInput.value = searchInput.value.slice(0, -1);
            } else if(keyValue.toLowerCase() == "search") {
                let bestSearch = output[0];
                
                if (bestSearch != null) {
                    window.location.href = `/pages/dynamic-service.html?search=${encodeURIComponent(bestSearch)}`;
                }
            } 
            else if(keyValue.toLowerCase() == "space") {
                searchInput.value += " ";
            }
            else {
                searchInput.value += keyValue;
            }

            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
        });
    });

    keyboardContainer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        searchInput.focus();
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !keyboardContainer.contains(e.target)) {
            searchInput.blur();
            document.body.style.overflow = "hidden";

            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }, 300);
        }
    });

    searchInput.addEventListener("focus", () => {
        document.body.style.overflow = "auto";
        setTimeout(() => {
            document.body.style.overflow = "auto";

            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: "smooth"
            });
        }, 300);
    });

    searchInput.addEventListener("blur", () => {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 300);
        document.body.style.overflow = "hidden";
    });

    searchInput.addEventListener("input", function () {
        clearBtn.style.display = this.value ? "flex" : "none";

        const value = this.value.toLowerCase();
        autocompleteList.innerHTML = "";

        if (!value) return;

        fetch("/data/services-list.json")
            .then(res => res.json())
            .then(data => {
                // Combine searches and offices into objects with type
                const combined = [
                    ...data.searches.map(item => ({ name: item, type: "service" })),
                    ...data.office.map(item => ({ name: item, type: "office" }))
                ];

                const matches = combined
                    .filter(item => item.name.toLowerCase().includes(value))
                    .slice(0, 5);

                output = matches.map(item => item.name); // optional for first suggestion

                matches.forEach(match => {
                    const li = document.createElement("li");
                    const icon = document.createElement("img");
                    icon.src = "/assets/icons/search_icon.svg";
                    icon.alt = "search";
                    icon.classList.add("autocomplete-icon");

                    const text = document.createElement("span");
                    text.textContent = match.name;
                    text.classList.add("autocomplete-text");

                    li.appendChild(icon);
                    li.appendChild(text);

                    li.addEventListener("click", () => {
                        let name = match.name;

                        name = name.replace(/['’]/g, "_");

                        searchInput.value = match.name; 
                        autocompleteList.innerHTML = "";

                        // Redirect based on type
                        if (match.type === "service") {
                            //alert("service");
                            window.location.href = `/pages/dynamic-service.html?search=${encodeURIComponent(name)}`;
                        } else if (match.type === "office") {
                            //alert(name.replace(/'/g,'_'));
                            
                            window.location.href = `/pages/document-selector.html?view=${encodeURIComponent(name)}`;
                        }
                    });

                    autocompleteList.appendChild(li);
                });
            });
    });

    clearBtn.addEventListener("click", function () {
        searchInput.value = "";
        autocompleteList.innerHTML = "";
        clearBtn.style.display = "none";
        searchInput.focus();
    });

    // searchBtn.addEventListener("click", () => {
    //     // if (searchInput.value.trim() !== "") {
    //     //     window.location.href = `/pages/dynamic-service.html?search=${encodeURIComponent(searchInput.value)}`;
    //     // }

    //     if(fetchDataFromServices(searchInput.value) == "Success") {
    //         console.log("yeyyy");
    //     }
    // });
    searchBtn.addEventListener("click", async () => {
        const value = searchInput.value.trim().toLowerCase();

        if (!value) return;

        const res = await fetch("/data/services-list.json");
        const data = await res.json();

        const serviceMatch = data.searches.find(item => item.toLowerCase() === value);
        const officeMatch = data.office.find(item => item.toLowerCase() === value);

        if (serviceMatch) {
            window.location.href = `/pages/dynamic-service.html?search=${encodeURIComponent(serviceMatch)}`;
        } else if (officeMatch) {
            window.location.href = `/pages/document-selector.html?view=${encodeURIComponent(officeMatch)}`;
        } else {
            console.log("Not found");
        }
    });

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

    async function fetchDataFromServices(value) {
        const res = await fetch("/data/services-list.json");
        const data = await res.json();

        // Find the first item that includes the value (case-insensitive)
        const found = data.office.find(item => item.toLowerCase().includes(value.toLowerCase()));

        // Return the matched text, or null if nothing is found
        return found || null;
    }
});