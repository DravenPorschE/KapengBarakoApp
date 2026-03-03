document.addEventListener("DOMContentLoaded", async () => {

    const serviceName = document.querySelector(".service-name");
    const documentName = document.querySelector(".document-name");
    const classInfo = document.getElementById("class-info");
    const typeInfo = document.getElementById("type-info");
    const backBtn = document.querySelector(".back-button");

    const dropdownAction = document.querySelectorAll(".client-step-container");

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
            const steps = matchedService.steps || [];
            const processInfoContainer = document.querySelector(".process-info");
 
            let agencyActionLabel = document.createElement("p");
            agencyActionLabel.className = "service-label";
            agencyActionLabel.textContent = "AgencyActions";           
            
            let currentStep = 0;
            let agencyStepNum = 0;

            steps.forEach((step, index) => {

                if(step.client_step != "N/A") {
                    agencyStepNum = 0;
                    currentStep++;
                    const processContainer = document.createElement("div");
                    processContainer.className = "process-container";

                    const clientStepContainer = document.createElement("div");
                    clientStepContainer.className = "client-step-container";

                    const checkboxContainer = document.createElement("div");
                    checkboxContainer.className = "checkbox-container";

                    const checkbox = document.createElement("div");
                    checkbox.className = "checkbox";

                    const stepContainer = document.createElement("div");
                    stepContainer.className = "step-container";

                    let stepNumber = document.createElement("p");
                    stepNumber.className = "step-number";
                    if(step.client_step != "N/A") {
                        stepNumber.textContent = "Step " + currentStep;
                    } 
                    
                    let clientStepInfo = document.createElement("p");
                    clientStepInfo.className = "client-step-info";
                    if(step.client_step != "N/A") {
                        clientStepInfo.textContent = step.client_step
                            .replace(/^\d+\.\s*/, "")
                            .trim();
                    } 
                    
                    const svgNS = "http://www.w3.org/2000/svg";

                    // Create the <svg>
                    const svg = document.createElementNS(svgNS, "svg");
                    svg.classList.add("step-arrow");
                    svg.setAttribute("viewBox", "0 0 24 24");
                    svg.setAttribute("fill", "none");
                    svg.setAttribute("stroke", "currentColor");
                    svg.setAttribute("stroke-width", "2");
                    svg.setAttribute("stroke-linecap", "round");
                    svg.setAttribute("stroke-linejoin", "round");

                    // Create the <polyline>
                    const polyline = document.createElementNS(svgNS, "polyline");
                    polyline.setAttribute("points", "9 18 15 12 9 6");

                    // Append polyline into svg
                    svg.appendChild(polyline);

                    checkboxContainer.appendChild(checkbox);
                    stepContainer.appendChild(stepNumber);
                    stepContainer.appendChild(clientStepInfo);
                    
                    clientStepContainer.appendChild(checkboxContainer);
                    clientStepContainer.appendChild(stepContainer);
                    clientStepContainer.appendChild(svg);

                    processContainer.appendChild(clientStepContainer);

                    processInfoContainer.appendChild(processContainer);
                } else {
                    agencyStepNum++;

                    const agencyActionContainer = document.createElement("div");
                    agencyActionContainer.className = "agency-action-container";

                    const agencyAction = document.createElement("div");
                    agencyAction.className = "agency-action";

                    let agencyStep = document.createElement("p");
                    agencyStep.className = "agency-step";
                    agencyStep.textContent = currentStep + "." + agencyStepNum;

                    const actionResponsible = document.createElement("div");
                    actionResponsible.className = "action-responsible";

                    let actionInfo = document.createElement("p");
                    actionInfo.className = "action-info";
                    actionInfo.textContent = step.agency_action
                            .replace(/^\d+\.\s*/, "")
                            .trim();
                }
            });
        } else {
            console.log("Service not found");
        }

    } else {
        console.log("No search parameter in URL");
    }

    document.querySelectorAll(".client-step-container").forEach(step => {
        step.addEventListener("click", () => {

            const processContainer = step.closest(".process-container");
            const agencyContainer = processContainer.querySelector(".agency-action-container");
            const checkbox = step.querySelector(".checkbox");

            // Toggle dropdown
            agencyContainer.classList.toggle("show");

            // Toggle arrow rotation
            step.classList.toggle("active");

            // Toggle checkbox
            checkbox.classList.toggle("checked");
        });
    });
});