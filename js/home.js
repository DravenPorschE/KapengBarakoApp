document.addEventListener("DOMContentLoaded", function() {

    const input = document.getElementById("search-input");
    const texts = ["Business Permit", "Mayor's Permit", "Marriage Certificate", "Birth Certificate"];
    let textIndex = 0;
    let index = 0;
    let direction = 1;

    const sidebarContainer = document.getElementById("sidebar-container");
    const toggleBtn = document.getElementById('burger');
    const closeBtn = document.getElementById('close-button');
    const searchInput = document.getElementById("search-input");
    const autocompleteList = document.getElementById("autocomplete-list");
    const clearBtn = document.getElementById("clear-btn");

    const searchBtn = document.getElementById("search-icon-left");
    
    const browseAllDepartments = document.getElementById("browse-all-departments");

    let data = [];
    fetch("/data/services-list.json")
        .then(res => res.json())
        .then(json => data = json);

    searchInput.addEventListener("input", function () {
        clearBtn.style.display = this.value ? "flex" : "none";

        const value = this.value.toLowerCase();
        autocompleteList.innerHTML = "";

        if (!value) return;

        const matches = data
            .filter(item => item.toLowerCase().includes(value))
            .slice(0, 5);

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

            li.addEventListener("click", function () {
                searchInput.value = match;
                autocompleteList.innerHTML = "";
            });

            autocompleteList.appendChild(li);
        });
    });

    clearBtn.addEventListener("click", function () {
        searchInput.value = "";
        autocompleteList.innerHTML = "";
        clearBtn.style.display = "none";
    });

    document.addEventListener("click", function (e) {
        if (!document.getElementById("searchbox").contains(e.target)) {
            autocompleteList.innerHTML = "";
        }
    });

    toggleBtn.addEventListener('click', () => {
        sidebarContainer.classList.toggle('show');
    });

    closeBtn.addEventListener('click', () => {
        sidebarContainer.classList.toggle('show');
    });

    browseAllDepartments.addEventListener('click', () => {
        window.location.href = "/pages/all-services.html";
    });


    searchBtn.addEventListener("click", () => {
        window.location.href=`/pages/dynamic-service.html?search=${encodeURIComponent(searchInput.value)}`
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
});