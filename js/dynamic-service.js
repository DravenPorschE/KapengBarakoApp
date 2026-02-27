document.addEventListener("DOMContentLoaded", async () => {

    const serviceName = document.querySelector(".service-name");
    const documentName = document.querySelector(".document-name");
    const classInfo = document.getElementById("class-info");
    const typeInfo = document.getElementById("type-info");

    const dropdownAction = document.querySelectorAll(".inner-process-info");

    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get("search");

    const jsonFiles = [
        "/data/Lipa City Environment and Natural Resources Office External Services.json"
    ];

    async function loadAllServices() {
        const responses = await Promise.all(
            jsonFiles.map(file => fetch(file).then(res => res.json()))
        );

        // 🔥 Attach department to each service
        return responses.flatMap(dept =>
            dept.external_services.map(service => ({
                ...service,
                department: dept.department
            }))
        );
    }

    if (val) {

        const allServices = await loadAllServices();

        const matchedService = allServices.find(service =>
            service.service_name.toLowerCase().trim() === val.toLowerCase().trim()
        );

        if (matchedService) {

            // ✅ Set values
            serviceName.textContent = matchedService.service_name;
            documentName.textContent = matchedService.department; // ← Department here
            classInfo.textContent = matchedService.classification;
            typeInfo.textContent = matchedService.type_of_transaction;

            console.log("Department:", matchedService.department);

        } else {
            console.log("Service not found");
        }

    } else {
        console.log("No search parameter in URL");
    }

    // Dropdown toggle
    dropdownAction.forEach(btn => {
        btn.addEventListener("click", () => {
            const processContainer = btn.closest(".process-container");
            const innerProcess = processContainer.querySelector(".inner-process");

            innerProcess.classList.toggle("show");
        });
    });

});