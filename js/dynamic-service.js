document.addEventListener("DOMContentLoaded", async () => {

    const serviceName = document.querySelector(".service-name");
    const documentName = document.querySelector(".document-name");
    const classInfo = document.getElementById("class-info");
    const typeInfo = document.getElementById("type-info");
    const backBtn = document.querySelector(".back-button");

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

    backBtn.addEventListener("click", () => {
        window.history.back();
    });

    if (val) {

        const allServices = await loadAllServices();

        const matchedService = allServices.find(service =>
            service.service_name.toLowerCase().trim() === val.toLowerCase().trim()
        );

        if (matchedService) {

            // ✅ Set values
            serviceName.textContent = matchedService.office;
            documentName.textContent = matchedService.service_name; 
            classInfo.textContent = matchedService.classification;
            typeInfo.textContent = matchedService.type_of_transaction;

            // Create new checklist for each requirement
            const checklist = matchedService.checklist_of_requirements || [];
            const checklist_container = document.querySelector(".checklist-container");

            checklist.forEach((list, index) => {
                const checklistCollection = document.createElement("div");
                checklistCollection.className = "checklist";

                // the p elements
                let requirementNumber_p = document.createElement("p");
                requirementNumber_p.className = "requirement-number";
                requirementNumber_p.textContent = "#" + (index + 1);

                let requirementInfo_p = document.createElement("p");
                requirementInfo_p.className = "requirement-info";
                requirementInfo_p.textContent = list.requirement;

                let requirementSource_p = document.createElement("p");
                requirementSource_p.className = "requirement-source";
                requirementSource_p.textContent = list.source;

                checklistCollection.appendChild(requirementNumber_p);
                checklistCollection.appendChild(requirementInfo_p);
                checklistCollection.appendChild(requirementSource_p);
                checklist_container.appendChild(checklistCollection);
            });
            

            // Create new steps

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