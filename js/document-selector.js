document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get("view");

    const serviceSelected = document.getElementById("service-selected");
    serviceSelected.textContent = val ? val : "No service selected";

    fetch(`/data/${val}.json`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("document-viewer");
            const services = data.external_services || [];
            const extensions = ["avif", "png", "jpg", "jpeg"];

            services.forEach((service, index) => {

                const card = document.createElement("div");
                card.className = "office-card";
                card.style.animationDelay = `${index * 60}ms`;

                const inner = document.createElement("div");
                inner.className = "office-documents";

                const imageWrap = document.createElement("div");
                imageWrap.className = "card-image-wrap";

                const img = document.createElement("img");
                img.alt = service.service_name;

                const basePath = service.image;
                let extIndex = 0;

                function tryNextExtension() {
                    if (extIndex >= extensions.length) {
                        // All extensions failed — show placeholder icon
                        img.remove();
                        const placeholder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        placeholder.setAttribute("viewBox", "0 0 24 24");
                        placeholder.setAttribute("fill", "none");
                        placeholder.setAttribute("stroke", "currentColor");
                        placeholder.setAttribute("stroke-width", "1");
                        placeholder.classList.add("img-placeholder");
                        placeholder.innerHTML = `
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        `;
                        imageWrap.appendChild(placeholder);
                        return;
                    }
                    img.src = `${basePath}.${extensions[extIndex]}`;
                    extIndex++;
                }

                img.onerror = tryNextExtension;
                tryNextExtension();

                imageWrap.appendChild(img);
                const labelDiv = document.createElement("div");
                labelDiv.className = "card-label";

                const p = document.createElement("p");
                p.textContent = service.service_name;

                const tag = document.createElement("span");
                tag.className = "card-tag";
                tag.textContent = "Document";

                labelDiv.appendChild(p);
                labelDiv.appendChild(tag);
                inner.appendChild(imageWrap);
                inner.appendChild(labelDiv);
                card.appendChild(inner);
                container.appendChild(card);

                card.addEventListener("click", () => {
                    window.location.href=`/pages/dynamic-service.html?search=${encodeURIComponent(service.service_name)}`
                });
            });
        })
        .catch(error => console.error("Error fetching JSON data:", error));
});