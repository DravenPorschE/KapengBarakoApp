document.addEventListener("DOMContentLoaded", async () => {
    const serviceName = document.querySelector(".service-name");
    const documentName = document.querySelector(".document-name");
    const classInfo = document.getElementById("class-info");
    const typeInfo = document.getElementById("type-info");
    const backBtn = document.querySelector(".back-button");

    const totalFees = document.getElementById("total-fees");
    const totalTime = document.getElementById("total-time");
    const totalSteps = document.getElementById("total-steps");

    const serviceNotice = document.querySelector(".service-notice");
    const showNotice = document.querySelector(".show-notice");

    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get("search");

    const rooms = document.querySelectorAll(".rooms");

    const tableClose = document.querySelector(".table-close");
    const noticeContainer = document.querySelector(".notice-container");

    const showMap = document.querySelector(".show-map");

    let departmentName = "";

    const jsonFiles = [
        "/data/Lipa City Environment and Natural Resources Office External Services.json",
        "/data/Lipa City Social Welfare and Development Office External Services.json",
        "/data/LIPA CITY AGRICULTURE OFFICE EXTERNAL SERVICES.json",
        "/data/Lipa City Permits and Licensing Office External Services.json",
        "/data/Lipa City Permits and Licensing Office Internal Services.json",
        "/data/Lipa City Assesor_s Office External Services.json",
        "/data/Lipa City Engineering Office External Services.json",
        "/data/Lipa City Cooperatives Office External Services.json",
        "/data/Lipa City Disaster Risk Reduction and Management Office External Services.json",
        "/data/Lipa City Accounting Office External Services.json",
        "/data/LIPA CITY ACCOUNTING OFFICE INTERNAL SERVICES.json",
        "/data/Lipa City Veterinary Office External Services.json",
        "/data/LIPA CITY GENERAL SERVICES OFFICE INTERNAL SERVICES.json",
        "/data/LIPA CITY LEGAL OFFICE INTERNAL SERVICES.json",
        "/data/LIPA CITY MAYOR_S OFFICE EXTERNAL SERVICES.json",
        "/data/LIPA CITY MAYOR_S OFFICE INTERNAL SERVICES.json",
        "/data/LIPA CITY BUDGET OFFICE EXTERNAL SERVICES.json",
        "/data/Lipa City Civil Registrar_s Office External Services.json",
        "/data/OFFICE OF THE SANGGUNIANG PANLUNGSOD EXTERNAL SERVICES.json",
        "/data/Lipa City Community Affairs Office External Services.json",
        "/data/LIPA CITY HEALTH OFFICE EXTERNAL SERVICES.json",
        "/data/Lipa City Hospital Systems Office External Services.json",
        "/data/Lipa City Hospital Systems Office INTERNAL SERVICES.json",
        "/data/Lipa City Personnel Office External Services.json",
        "/data/Lipa City Personnel Office Internal Services.json",
        "/data/Lipa City Planning and Development Office External Services.json",
        "/data/KOLEHIYO NG LUNGSOD NG LIPA EXTERNAL SERVICES.json",
        "/data/LIPA CITY VICE MAYOR_S OFFICE EXTERNAL SERVICES.json",
        "/data/Lipa City Treasurer_s Office External Services.json",
        "/data/LIPA CITY ADMINISTRATOR_S OFFICE EXTERNAL SERVICES.json",
        "/data/LIPA CITY TREASURER_S OFFICE INTERNAL SERVICES.json",
        "/data/LIPA CITY PUBLIC ORDER AND SAFETY OFFICE EXTERNAL SERVICES.json",
        "/data/LIPA CITY TRAFFIC MANAGEMENT AND TRANSPORT OFFICE EXTERNAL SERVICES.json"
    ];

    async function fetchJsonSafe(file) {
        try {
            const res = await fetch(file);

            if (!res.ok) {
                console.warn(`Skipped file: ${file} (${res.status})`);
                return null;
            }

            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                console.warn(`Not JSON: ${file}`);
                return null;
            }

            return await res.json();
        } catch (error) {
            console.warn(`Failed to load ${file}:`, error);
            return null;
        }
    }

    async function loadAllServices() {
        const responses = await Promise.all(jsonFiles.map(fetchJsonSafe));

        return responses
            .filter(Boolean)
            .flatMap(dept =>
                (dept.external_services || dept.internal_services || []).map(service => ({
                    ...service,
                    department: dept.department || service.office || ""
                }))
            );
    }

    function clearUI() {
        serviceName.textContent = "Service Name";
        documentName.textContent = "";
        classInfo.textContent = "info";
        typeInfo.textContent = "info";
        totalFees.textContent = "P0.00";
        totalTime.textContent = "0 min";
        totalSteps.textContent = "0";

        const checklistContainer = document.querySelector(".checklist-container");
        const processInfoContainer = document.querySelector(".process-info");
        const tableBody = document.querySelector(".data-container");

        if (checklistContainer) checklistContainer.innerHTML = "";
        if (processInfoContainer) processInfoContainer.innerHTML = "";
        if (tableBody) tableBody.innerHTML = "";

        if (serviceNotice) serviceNotice.style.display = "none";
        if (showNotice) showNotice.style.display = "none";
    }

    backBtn?.addEventListener("click", () => {
        window.history.back();
    });

    clearUI();

    if (val) {
        const allServices = await loadAllServices();

        console.log("Search value:", val);
        console.log("Loaded services:", allServices);

        const matchedService = allServices.find(service =>
            (service.service_name || "").toLowerCase().trim() === val.toLowerCase().trim()
        );

        console.log("Matched service:", matchedService);

        if (matchedService) {
            serviceName.textContent = matchedService.office || matchedService.department || "Service Name";
            documentName.textContent = matchedService.service_name || "No service name";
            classInfo.textContent = matchedService.classification || "N/A";
            typeInfo.textContent = matchedService.type_of_transaction || "N/A";

            if (matchedService.service_notice) {
                serviceNotice.style.display = "block";
                showNotice.style.display = "block";
            }

            const fees =
                matchedService.total?.fees ||
                matchedService.total_fees_to_be_paid ||
                "None";

            const time =
                matchedService.total?.processing_time ||
                matchedService.total_processing_time ||
                "N/A";

            totalFees.textContent = fees;
            totalTime.textContent = time;

            if (fees.length > 15) totalFees.style.fontSize = "12px";
            if (time.length > 15) totalTime.style.fontSize = "12px";

            const totalClientStep = (matchedService.steps || []).filter(step => {
                const clientStep = step.client_step || step.client_steps;
                return clientStep && clientStep !== "N/A";
            });

            totalSteps.textContent = totalClientStep.length;

            const checklistContainer = document.querySelector(".checklist-container");
            checklistContainer.innerHTML = "";

            (matchedService.checklist_of_requirements || []).forEach((list, index) => {
                const checklistCollection = document.createElement("div");
                checklistCollection.className = "checklist";

                const requirementNumber = document.createElement("p");
                requirementNumber.className = "requirement-number";
                requirementNumber.textContent = "#" + (index + 1);

                const requirementInfo = document.createElement("p");
                requirementInfo.className = "requirement-info";
                requirementInfo.textContent = list.requirement || "N/A";

                const requirementSource = document.createElement("p");
                requirementSource.className = "requirement-source";
                requirementSource.textContent = list.source || "N/A";

                checklistCollection.appendChild(requirementNumber);
                checklistCollection.appendChild(requirementInfo);
                checklistCollection.appendChild(requirementSource);

                checklistContainer.appendChild(checklistCollection);
            });

            const processInfoContainer = document.querySelector(".process-info");
            processInfoContainer.innerHTML = "";

            showNotice?.addEventListener("click", () => {
                noticeContainer.classList.add("show");
            });

            tableClose?.addEventListener("click", () => {
                noticeContainer.classList.remove("show");
            });

            const tableBody = document.querySelector(".data-container");
            tableBody.innerHTML = "";

            const serviceNoticeData = matchedService.service_notice;
            if (serviceNoticeData) {
                serviceNoticeData.forEach((data) => {
                    const row = document.createElement("tr");

                    const serviceInfoData = document.createElement("td");
                    serviceInfoData.innerHTML = data.service_name || "";

                    const processFeeData = document.createElement("td");
                    processFeeData.innerHTML = data.processing_fee || "";

                    const processTimeData = document.createElement("td");
                    processTimeData.innerHTML = data.processing_time || "";

                    row.appendChild(serviceInfoData);
                    row.appendChild(processFeeData);
                    row.appendChild(processTimeData);

                    tableBody.appendChild(row);
                });
            }

            let currentStep = 0;

            (matchedService.steps || []).forEach((step) => {
                const clientStepValue = step.client_step || step.client_steps || "";
                const feeValue = step.fees || step.fees_to_be_paid || "None";
                const isClientStep = clientStepValue && clientStepValue !== "N/A";

                if (isClientStep) {
                    currentStep++;
                    let agencyStepNum = 0;

                    const processContainer = document.createElement("div");
                    processContainer.className = "process-container";

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
                    clientStepInfo.textContent = clientStepValue
                        .replace(/^\d+[-.]?\d*\.\s*/, "")
                        .trim();

                    stepContainer.appendChild(stepNumber);
                    stepContainer.appendChild(clientStepInfo);

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

                    const agencyContainer = document.createElement("div");
                    agencyContainer.className = "agency-action-container";

                    const agencyLabel = document.createElement("p");
                    agencyLabel.className = "service-label";
                    agencyLabel.textContent = "Agency Actions";
                    agencyContainer.appendChild(agencyLabel);

                    processContainer.appendChild(clientStepContainer);
                    processContainer.appendChild(agencyContainer);
                    processInfoContainer.appendChild(processContainer);

                    clientStepContainer.addEventListener("click", () => {
                        agencyContainer.classList.toggle("show");
                        clientStepContainer.classList.toggle("active");
                        checkbox.classList.toggle("checked");
                    });

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
                        actionRole.textContent = step.person_responsible || "N/A";

                        const otherInfo = document.createElement("div");
                        otherInfo.className = "other-info";

                        const actionTime = document.createElement("p");
                        actionTime.className = "action-time";
                        actionTime.textContent = step.processing_time || "N/A";

                        const actionFee = document.createElement("p");
                        actionFee.className = "action-fee";
                        actionFee.textContent = feeValue;

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
            console.warn("No matched service found for:", val);
            documentName.textContent = "Service not found";
        }
    } else {
        console.log("No search parameter in URL");
    }

    rooms.forEach(room => {
        room.addEventListener("click", (e) => {
            const selectedRoom = e.target.closest(".rooms");
            if (!selectedRoom) return;

            const mapValue = selectedRoom.dataset.mapvalue;
            const floorLocation = selectedRoom.dataset.floorlocation;

            departmentName = selectedRoom.dataset.fulldepartmentname;

            document.querySelector(".name-of-room").textContent = mapValue || "";
            document.querySelector(".floor-information").textContent = floorLocation || "";
        });
    });

    showMap?.addEventListener("click", () => {
        let departmentName = serviceName.textContent || "";

        const regex = /External Services|Internal Services/g;
        departmentName = departmentName.replace(regex, "").trim();

        window.location.href = `/pages/map-view.html?view=${encodeURIComponent(departmentName)}`;
    });
});