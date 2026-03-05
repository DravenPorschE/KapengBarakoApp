document.addEventListener("DOMContentLoaded", async () => {
    const serviceName = document.querySelector(".service-name");
    const documentName = document.querySelector(".document-name");
    const classInfo = document.getElementById("class-info");
    const typeInfo = document.getElementById("type-info");
    const backBtn = document.querySelector(".back-button");

    const totalFees = document.getElementById("total-fees");
    const totalTime = document.getElementById("total-time");
    const totalSteps = document.getElementById("total-steps");

    const serviceNotice =  document.querySelector(".service-notice");
    const showNotice = document.querySelector(".show-notice");

    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get("search");

    const tableClose = document.querySelector(".table-close");
    const noticeContainer = document.querySelector(".notice-container");

    const mapContainerOuter = document.querySelector(".map-container-outer");
    const showMapButton = document.querySelector(".show-map");
    const closeMapButton = document.querySelector(".close-map-btn");

    const jsonFiles = [
        "/data/Lipa City Environment and Natural Resources Office External Services.json",
        "/data/KOLEHIYO NG LUNGSOD NG LIPA EXTERNAL SERVICES.json",
        "/data/Lipa City Social Welfare and Development Office External Services.json",
        "/data/LIPA CITY AGRICULTURE OFFICE EXTERNAL SERVICES.json",
        "/data/Lipa City Permits and Licensing Office External Services.json",
        "/data/Lipa City Assessor_s Office External Services.json",
        "/data/Lipa City Engineering Office External Services.json",
        "/data/Lipa City Cooperatives Office External Services.json",
        "/data/Lipa City Accounting Office External Services.json",
        "/data/LIPA CITY ACCOUNTING OFFICE INTERNAL SERVICES.json",
        "/data/Lipa City Veterinary Office External Services.json",
        "/data/LIPA CITY GENERAL SERVICES OFFICE INTERNAL SERVICES.json",
        "/data/LIPA CITY LEGAL OFFICE EXTERNAL SERVICES.json"
    ];
    

    async function loadAllServices() {
        const responses = await Promise.all(
            jsonFiles.map(file => fetch(file).then(res => res.json()))
        );

        // attach department to each service
        return responses.flatMap(dept =>
            dept.external_services.map(service => ({
                ...service,
                department: dept.department
            }))
        );
    }

    const allServices = await loadAllServices();

    backBtn.addEventListener("click", () => {
        window.history.back();
    });

    if (val) {
        const allServices = await loadAllServices();

        const matchedService = allServices.find(service =>
            service.service_name.toLowerCase().trim() === val.toLowerCase().trim()
        );

        // console.log(matchedService);

        if (matchedService) {
            // Set header info
            serviceName.textContent = matchedService.office;
            documentName.textContent = matchedService.service_name;
            classInfo.textContent = matchedService.classification;
            typeInfo.textContent = matchedService.type_of_transaction;

            if(matchedService.service_notice != null) {
                serviceNotice.style.display = "block";
                showNotice.style.display = "block";
            }

            totalFees.textContent = matchedService.total_fees;
            totalTime.textContent = matchedService.total_processing_time;
            
            const totalClientStep = (matchedService.steps || []).filter(
                step => step.client_step && step.client_step !== "N/A"
            );

            totalSteps.textContent = totalClientStep.length;

            // ===== Checklist =====
            const checklist_container = document.querySelector(".checklist-container");
            checklist_container.innerHTML = "";

            (matchedService.checklist_of_requirements || []).forEach((list, index) => {
                const checklistCollection = document.createElement("div");
                checklistCollection.className = "checklist";

                const requirementNumber_p = document.createElement("p");
                requirementNumber_p.className = "requirement-number";
                requirementNumber_p.textContent = "#" + (index + 1);

                const requirementInfo_p = document.createElement("p");
                requirementInfo_p.className = "requirement-info";
                requirementInfo_p.textContent = list.requirement;

                const requirementSource_p = document.createElement("p");
                requirementSource_p.className = "requirement-source";
                requirementSource_p.textContent = list.source;

                checklistCollection.appendChild(requirementNumber_p);
                checklistCollection.appendChild(requirementInfo_p);
                checklistCollection.appendChild(requirementSource_p);

                checklist_container.appendChild(checklistCollection);
            });

            // ===== Steps =====
            const processInfoContainer = document.querySelector(".process-info");
            processInfoContainer.innerHTML = ""; // clear once before generating

            showNotice.addEventListener("click", () => {
                noticeContainer.classList.add("show");
            });
            tableClose.addEventListener("click", () => {
                noticeContainer.classList.remove("show");
            });

            const tableContainer = document.querySelector(".table-notice");
            const tableBody = document.querySelector(".data-container");

            const serviceNoticeData = matchedService.service_notice;
            
            if(serviceNoticeData) {
                serviceNoticeData.forEach((data, index) => {
                    const row = document.createElement("tr");

                    let serviceInfoData = document.createElement("td");
                    serviceInfoData.innerHTML = data.service_name;

                    let processFeeData = document.createElement("td");
                    processFeeData.innerHTML = data.processing_fee;

                    let processTimeData = document.createElement("td");
                    processTimeData.innerHTML = data.processing_time;

                    row.appendChild(serviceInfoData);
                    row.appendChild(processFeeData);
                    row.appendChild(processTimeData);

                    tableBody.appendChild(row);
                });
            }

            let currentStep = 0;

            (matchedService.steps || []).forEach((step, index) => {
                const isClientStep = step.client_step !== "N/A";

                if (isClientStep) {
                    currentStep++;
                    let agencyStepNum = 0;

                    // ===== Process Container =====
                    const processContainer = document.createElement("div");
                    processContainer.className = "process-container";

                    // ===== Client Step Container =====
                    const clientStepContainer = document.createElement("div");
                    clientStepContainer.className = "client-step-container";

                    const checkboxContainer = document.createElement("div");
                    checkboxContainer.className = "checkbox-container";

                    const checkbox = document.createElement("div");
                    checkbox.className = "checkbox";
                    checkboxContainer.appendChild(checkbox);

                    const stepContainer = document.createElement("div");
                    stepContainer.className = "step-container";

                    const stepNumber = document.createElement("p");
                    stepNumber.className = "step-number";
                    stepNumber.textContent = "Step " + currentStep;

                    const clientStepInfo = document.createElement("p");
                    clientStepInfo.className = "client-step-info";
                    clientStepInfo.textContent = step.client_step
                        .replace(/^\d+\.\s*/, "")
                        .trim();

                    stepContainer.appendChild(stepNumber);
                    stepContainer.appendChild(clientStepInfo);

                    // ===== Arrow SVG =====
                    const svgNS = "http://www.w3.org/2000/svg";
                    const svg = document.createElementNS(svgNS, "svg");
                    svg.classList.add("step-arrow");
                    svg.setAttribute("viewBox", "0 0 24 24");
                    svg.setAttribute("fill", "none");
                    svg.setAttribute("stroke", "currentColor");
                    svg.setAttribute("stroke-width", "2");
                    svg.setAttribute("stroke-linecap", "round");
                    svg.setAttribute("stroke-linejoin", "round");

                    const polyline = document.createElementNS(svgNS, "polyline");
                    polyline.setAttribute("points", "9 18 15 12 9 6");
                    svg.appendChild(polyline);

                    clientStepContainer.appendChild(checkboxContainer);
                    clientStepContainer.appendChild(stepContainer);
                    clientStepContainer.appendChild(svg);

                    // ===== Agency Container =====
                    const agencyContainer = document.createElement("div");
                    agencyContainer.className = "agency-action-container";

                    const agencyLabel = document.createElement("p");
                    agencyLabel.className = "service-label";
                    agencyLabel.textContent = "Agency Actions";
                    agencyContainer.appendChild(agencyLabel);

                    processContainer.appendChild(clientStepContainer);
                    processContainer.appendChild(agencyContainer);

                    processInfoContainer.appendChild(processContainer);

                    // ===== Add Click Event (checkbox toggle + show/hide) =====
                    clientStepContainer.addEventListener("click", () => {
                        agencyContainer.classList.toggle("show");
                        clientStepContainer.classList.toggle("active");
                        checkbox.classList.toggle("checked");
                    });

                    // ===== Add Agency Action(s) =====
                    if (step.agency_action) {
                        agencyStepNum++;
                        const agencyAction = document.createElement("div");
                        agencyAction.className = "agency-action";

                        const agencyStep = document.createElement("p");
                        agencyStep.className = "agency-step";
                        agencyStep.textContent = currentStep + "." + agencyStepNum;

                        const actionResponsible = document.createElement("div");
                        actionResponsible.className = "action-responsible";

                        const actionInfo = document.createElement("p");
                        actionInfo.className = "action-info";
                        actionInfo.textContent = step.agency_action.replace(/^\d+\.\s*/, "").trim();

                        const actionRole = document.createElement("p");
                        actionRole.className = "action-role";
                        actionRole.textContent = step.person_responsible;

                        const otherInfo = document.createElement("div");
                        otherInfo.className = "other-info";

                        const actionTime = document.createElement("p");
                        actionTime.className = "action-time";
                        actionTime.textContent = step.processing_time;

                        const actionFee = document.createElement("p");
                        actionFee.className = "action-fee";
                        actionFee.textContent = step.fees || "None";

                        actionResponsible.appendChild(actionInfo);
                        actionResponsible.appendChild(actionRole);

                        otherInfo.appendChild(actionTime);
                        otherInfo.appendChild(actionFee);

                        agencyAction.appendChild(agencyStep);
                        agencyAction.appendChild(actionResponsible);
                        agencyAction.appendChild(otherInfo);

                        agencyContainer.appendChild(agencyAction);
                    }
                }
            });
        } else {
            console.log("Service not found");
        }
    } else {
        console.log("No search parameter in URL");
    }

    showMapButton.addEventListener("click", () => {
        mapContainerOuter.classList.add("show");
    });
    closeMapButton.addEventListener("click", () => {
        mapContainerOuter.classList.remove("show");
    });
});