const fs = require("fs");
const pathModule = require("path");
const { ipcRenderer } = require('electron');
const { pathToFileURL } = require("url");

document.addEventListener("DOMContentLoaded", () => {

    const browseBtn       = document.getElementById("browseBtn");
    const tools           = document.querySelectorAll(".tool");
    const filesDisplay    = document.getElementById("files-display");
    const settingsDisplay = document.getElementById("settings-display");

    const panels = { files: filesDisplay, settings: settingsDisplay };
    let activePanel = filesDisplay;

    const jsonPathInput  = document.getElementById("jsonPathInput");
    const savePathBtn    = document.getElementById("savePathBtn");
    const filesPanelBody = document.getElementById("file-list");

    const savedPath = localStorage.getItem("jsonFolderPath");
    if (savedPath) {
        jsonPathInput.value = savedPath;
        loadJsonFiles(savedPath);
    }

    savePathBtn.addEventListener("click", () => {
        const path = jsonPathInput.value.trim();
        if (!path) return alert("Please enter a valid path");
        localStorage.setItem("jsonFolderPath", path);
        loadJsonFiles(path);
    });

    // ── TOOL CLICK ──────────────────────────────────
    tools.forEach(tool => {
        tool.addEventListener("click", () => {
            const isActive = tool.classList.contains("active");
            tools.forEach(t => t.classList.remove("active"));
            Object.values(panels).forEach(p => p.classList.remove("show"));
            if (!isActive) {
                tool.classList.add("active");
                activePanel = panels[tool.id];
                activePanel.classList.add("show");
            }
        });
    });

    // ── RESIZE ──────────────────────────────────────
    let isResizing = false;

    function addResize(panel) {
        const handle = panel.querySelector(".resize-handle");
        handle.addEventListener("mousedown", () => {
            isResizing = true;
            document.body.style.cursor = "ew-resize";
        });
        window.addEventListener("mousemove", (e) => {
            if (!isResizing) return;
            const min = 180, max = 440;
            panel.style.width = Math.max(min, Math.min(max, e.clientX)) + "px";
        });
        window.addEventListener("mouseup", () => {
            isResizing = false;
            document.body.style.cursor = "default";
        });
    }

    // ── LOAD FILES ──────────────────────────────────
    function loadJsonFiles(folderPath) {
        filesPanelBody.innerHTML = "";

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                filesPanelBody.innerHTML = `<p class="panel-empty">Invalid folder path.</p>`;
                return;
            }

            const jsonFiles = files.filter(f => f.endsWith(".json"));

            if (jsonFiles.length === 0) {
                filesPanelBody.innerHTML = `<p class="panel-empty">No JSON files found.</p>`;
                return;
            }

            const list = document.createElement("div");
            list.className = "file-list";

            jsonFiles.forEach(file => {
                const fileItem = document.createElement("div");
                fileItem.className = "file-item";
                fileItem.innerHTML = `
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>${file}</span>
                `;
                fileItem.addEventListener("click", () => {
                    document.querySelectorAll(".file-item").forEach(i => i.classList.remove("selected"));
                    fileItem.classList.add("selected");
                    openJsonFile(pathModule.join(folderPath, file));
                });
                list.appendChild(fileItem);
            });

            filesPanelBody.appendChild(list);
        });
    }

    // ── CURRENT FILE TRACKING ───────────────────────
    let currentFileName = null; // e.g. "LIPA CITY ADMINISTRATOR_S OFFICE EXTERNAL SERVICES.json"

    // ── OPEN FILE ───────────────────────────────────
    function openJsonFile(filePath) {
        currentFileName = pathModule.basename(filePath);
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err) return console.error(err);
            try {
                displayJson(JSON.parse(data));
            } catch (e) {
                console.error("Invalid JSON", e);
            }
        });
    }

    // ── COLLECT JSON FROM DOM ───────────────────────
    function field(card, name) {
        const el = card.querySelector(`[data-field="${name}"]`);
        return el ? el.value.trim() : "";
    }

    function collectJson() {
        const departmentEl = document.querySelector(".department-name");
        const department = departmentEl ? departmentEl.textContent.trim() : "";

        const serviceCards = document.querySelectorAll(".new-service");
        const external_services = [];

        serviceCards.forEach(card => {
            const service_name        = field(card, "service_name");
            const image               = field(card, "image");
            const office              = field(card, "office");
            const classification      = field(card, "classification");
            const type_of_transaction = field(card, "type_of_transaction");
            const who_may_avail       = field(card, "who_may_avail");

            // Requirements
            const reqBlocks = card.querySelectorAll(".checklist-of-requirements .requirements");
            const checklist_of_requirements = [];
            reqBlocks.forEach(block => {
                const inputs = block.querySelectorAll("input");
                checklist_of_requirements.push({
                    requirement: inputs[0] ? inputs[0].value.trim() : "",
                    source:      inputs[1] ? inputs[1].value.trim() : "",
                });
            });

            // Steps
            const stepContainers = card.querySelectorAll(".step-container");
            const steps = [];
            stepContainers.forEach(sc => {
                const inputs = sc.querySelectorAll("input");
                steps.push({
                    client_step:        inputs[0] ? inputs[0].value.trim() : "",
                    agency_action:      inputs[1] ? inputs[1].value.trim() : "",
                    fees:               inputs[2] ? inputs[2].value.trim() : "",
                    processing_time:    inputs[3] ? inputs[3].value.trim() : "",
                    person_responsible: inputs[4] ? inputs[4].value.trim() : "",
                });
            });

            // Total
            const totalFees = card.querySelector(".total-fees");
            const totalTime = card.querySelector(".total-processig-time");

            external_services.push({
                service_name,
                image,
                office,
                classification,
                type_of_transaction,
                who_may_avail,
                checklist_of_requirements,
                steps,
                total: {
                    fees:            totalFees ? totalFees.value.trim() : "",
                    processing_time: totalTime ? totalTime.value.trim() : "",
                }
            });
        });

        return { department, external_services };
    }

    // ── SAVE JSON TO DISK ───────────────────────────
    function saveJson() {
        if (!currentFileName) {
            return alert("No file is currently open. Please select a file first.");
        }

        const basePath = localStorage.getItem("jsonFolderPath");
        if (!basePath) {
            return alert("No folder path set. Please configure the folder in Settings.");
        }

        const json = collectJson();
        const jsonString = JSON.stringify(json, null, 2);

        // Ensure output folder exists
        const outputDir = pathModule.join(basePath, "..", "electron_saved_json");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = pathModule.join(outputDir, currentFileName);

        fs.writeFile(outputPath, jsonString, "utf-8", (err) => {
            if (err) {
                console.error("Save failed:", err);
                return alert("Failed to save file:\n" + err.message);
            }
            showSaveToast(outputPath);
        });
    }

    // ── TOAST NOTIFICATION ──────────────────────────
    function showSaveToast(filePath) {
        let toast = document.getElementById("save-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "save-toast";
            toast.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                background: #1a1917; color: #fff;
                padding: 10px 16px; border-radius: 8px;
                font-family: 'DM Sans', sans-serif; font-size: 12px;
                display: flex; align-items: center; gap: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                transition: opacity 0.3s; opacity: 0;
            `;
            document.body.appendChild(toast);
        }

        const fileName = pathModule.basename(filePath);
        toast.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#4ade80" stroke-width="1.5"/>
                <path d="M4.5 7l2 2 3-3" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Saved to electron_saved_json/${fileName}
        `;

        toast.style.opacity = "1";
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => { toast.style.opacity = "0"; }, 3000);
    }

    // ── ICON HELPERS ────────────────────────────────
    const icons = {
        plus: `<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
        trash: `<svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6v4.5M8.5 6v4.5M3 4l.7 7.5h6.6L11 4" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        edit: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
        save: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
        del: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
    };

    // ── DISPLAY JSON ────────────────────────────────
    function displayJson(json) {
        const container = document.querySelector(".main-content");
        if (!json) return;

        container.innerHTML = "";

        const contentContainer = document.createElement("div");
        contentContainer.classList.add("content-container");

        // Department label
        const departmentName = document.createElement("div");
        departmentName.classList.add("department-name");
        departmentName.textContent = json.department;

        const externalServices = document.createElement("div");
        externalServices.classList.add("external_services");

        // ── BUILD EACH SERVICE ──
        json.external_services.forEach(serviceEl => {
            externalServices.appendChild(buildServiceCard(serviceEl));
        });

        // ── TOOLBAR ──
        const toolBar = document.createElement("div");
        toolBar.classList.add("toolbar");

        const addNewServiceBtn = document.createElement("button");
        addNewServiceBtn.classList.add("add-service-btn");
        addNewServiceBtn.innerHTML = `${icons.plus} Add service`;
        toolBar.appendChild(addNewServiceBtn);

        const saveJsonBtn = document.createElement("button");
        saveJsonBtn.classList.add("save-json-btn");
        saveJsonBtn.innerHTML = `${icons.save} Save to JSON`;
        saveJsonBtn.addEventListener("click", saveJson);
        toolBar.appendChild(saveJsonBtn);

        contentContainer.appendChild(toolBar);
        contentContainer.appendChild(departmentName);
        contentContainer.appendChild(externalServices);
        container.appendChild(contentContainer);
    }

    // ── BUILD ONE SERVICE CARD ──────────────────────
    function buildServiceCard(serviceEl) {
        const newService = document.createElement("div");
        newService.classList.add("new-service");

        // Service name input
        const service_name = document.createElement("input");
        service_name.classList.add("service");
        service_name.dataset.field = "service_name";
        service_name.value = serviceEl.service_name;
        service_name.disabled = true;

        // ── CARD ACTION BAR ──
        const actionBar = document.createElement("div");
        actionBar.classList.add("card-action-bar");

        const editBtn = document.createElement("button");
        editBtn.classList.add("card-btn", "card-btn-edit");
        editBtn.innerHTML = `${icons.edit} <span>Edit</span>`;
        editBtn.dataset.editing = "false";

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("card-btn", "card-btn-delete");
        deleteBtn.innerHTML = `${icons.del} <span>Delete</span>`;

        // ── DETAILS SECTION ──
        const detailsSection = document.createElement("div");
        detailsSection.classList.add("service-section");
        const detailsLabel = document.createElement("div");
        detailsLabel.classList.add("section-label");
        detailsLabel.textContent = "Service Details";
        detailsSection.appendChild(detailsLabel);

        function makeField(labelText, inputEl) {
            const row = document.createElement("div");
            row.classList.add("field-row");
            const lbl = document.createElement("div");
            lbl.classList.add("field-label");
            lbl.textContent = labelText;
            row.appendChild(lbl);
            row.appendChild(inputEl);
            return row;
        }

        const image = document.createElement("input");
        image.dataset.field = "image";
        image.value = serviceEl.image;
        image.disabled = true;

        const imageDisplay = document.createElement("img");
        imageDisplay.classList.add("image-display");
        imageDisplay.src = `..${serviceEl.image}.jpg`;

        const imagePicker = document.createElement("button");
        imagePicker.classList.add("add-btn");
        imagePicker.innerHTML = `${icons.plus} Pick image`;

        imagePicker.addEventListener("click", async () => {
            const baseFolder = pathModule.join(__dirname, "..", "assets", "document_background");
            const imagePath  = await ipcRenderer.invoke("select-image", baseFolder);
            if (imagePath) {
                let rel = pathModule.relative(pathModule.join(__dirname, ".."), imagePath);
                rel = "/" + rel.replace(/\\/g, "/").replace(/\.[^/.]+$/, "");
                image.value = rel;
                imageDisplay.src = pathToFileURL(imagePath).href;
            }
        });

        const office           = document.createElement("input"); office.dataset.field = "office";           office.value = serviceEl.office;
        const classification   = document.createElement("input"); classification.dataset.field = "classification"; classification.value = serviceEl.classification;
        const typeOfTransaction= document.createElement("input"); typeOfTransaction.dataset.field = "type_of_transaction"; typeOfTransaction.value = serviceEl.type_of_transaction;
        const whoMayAvail      = document.createElement("input"); whoMayAvail.dataset.field = "who_may_avail";   whoMayAvail.value = serviceEl.who_may_avail || "";

        detailsSection.appendChild(makeField("Image path", image));
        detailsSection.appendChild(makeField("Image preview", imageDisplay));
        detailsSection.appendChild(imagePicker);
        detailsSection.appendChild(makeField("Office", office));
        detailsSection.appendChild(makeField("Classification", classification));
        detailsSection.appendChild(makeField("Type of transaction", typeOfTransaction));
        detailsSection.appendChild(makeField("Who may avail", whoMayAvail));

        // ── REQUIREMENTS SECTION ──
        const reqSection = document.createElement("div");
        reqSection.classList.add("service-section");
        const reqLabel = document.createElement("div");
        reqLabel.classList.add("section-label");
        reqLabel.textContent = "Checklist of requirements";
        reqSection.appendChild(reqLabel);

        const checklistOfRequirements = document.createElement("div");
        checklistOfRequirements.classList.add("checklist-of-requirements");

        function buildRequirementRow(requirementEl) {
            const wrapper = document.createElement("div");

            const requirements = document.createElement("div");
            requirements.classList.add("requirements");

            function makeLabeledInput(labelText, value, placeholder) {
                const wrap = document.createElement("div");
                wrap.classList.add("input-labeled");
                const lbl  = document.createElement("span");
                lbl.classList.add("input-inline-label");
                lbl.textContent = labelText;
                const inp  = document.createElement("input");
                inp.value = value;
                inp.placeholder = placeholder;
                wrap.appendChild(lbl);
                wrap.appendChild(inp);
                return wrap;
            }

            requirements.appendChild(makeLabeledInput("Requirement", requirementEl.requirement, "Enter requirement"));
            requirements.appendChild(makeLabeledInput("Source", requirementEl.source, "Enter source"));

            const actionReqContainer = document.createElement("div");
            actionReqContainer.classList.add("action-btn-container");

            const addNewReqBtn = document.createElement("button");
            addNewReqBtn.classList.add("add-btn");
            addNewReqBtn.innerHTML = `${icons.plus} Add requirement`;

            const deleteReqBtn = document.createElement("button");
            deleteReqBtn.classList.add("add-btn", "danger");
            deleteReqBtn.innerHTML = `${icons.trash} Delete`;

            // Add new requirement after this one
            addNewReqBtn.addEventListener("click", () => {
                const newRow = buildRequirementRow({ requirement: "", source: "" });
                wrapper.after(newRow);
            });

            // Delete this requirement
            deleteReqBtn.addEventListener("click", () => {
                wrapper.remove();
            });

            actionReqContainer.appendChild(addNewReqBtn);
            actionReqContainer.appendChild(deleteReqBtn);

            wrapper.appendChild(requirements);
            wrapper.appendChild(actionReqContainer);
            return wrapper;
        }

        serviceEl.checklist_of_requirements.forEach(req => {
            checklistOfRequirements.appendChild(buildRequirementRow(req));
        });

        reqSection.appendChild(checklistOfRequirements);

        // ── STEPS SECTION ──
        const stepsSection = document.createElement("div");
        stepsSection.classList.add("service-section");
        const stepsLabel = document.createElement("div");
        stepsLabel.classList.add("section-label");
        stepsLabel.textContent = "Steps";
        stepsSection.appendChild(stepsLabel);

        const steps = document.createElement("div");
        steps.classList.add("steps");

        function buildStepRow(stepsEl) {
            const wrapper = document.createElement("div");

            const stepContainer = document.createElement("div");
            stepContainer.classList.add("step-container");

            function makeStepLabeled(labelText, value, placeholder) {
                const wrap = document.createElement("div");
                wrap.classList.add("input-labeled");
                const lbl  = document.createElement("span");
                lbl.classList.add("input-inline-label");
                lbl.textContent = labelText;
                const inp  = document.createElement("input");
                inp.value = value;
                inp.placeholder = placeholder;
                wrap.appendChild(lbl);
                wrap.appendChild(inp);
                return wrap;
            }

            stepContainer.appendChild(makeStepLabeled("Client step",        stepsEl.client_step,      "Client step"));
            stepContainer.appendChild(makeStepLabeled("Agency action",       stepsEl.agency_action,    "Agency action"));
            stepContainer.appendChild(makeStepLabeled("Fees",                stepsEl.fees,             "e.g. None"));
            stepContainer.appendChild(makeStepLabeled("Processing time",     stepsEl.processing_time,  "e.g. 5 minutes"));
            stepContainer.appendChild(makeStepLabeled("Person responsible",  stepsEl.person_responsible,"Person responsible"));

            const actionStepContainer = document.createElement("div");
            actionStepContainer.classList.add("action-btn-container");

            const addNewStepBtn = document.createElement("button");
            addNewStepBtn.classList.add("add-btn");
            addNewStepBtn.innerHTML = `${icons.plus} Add step here`;

            const deleteStepBtn = document.createElement("button");
            deleteStepBtn.classList.add("add-btn", "danger");
            deleteStepBtn.innerHTML = `${icons.trash} Delete`;

            addNewStepBtn.addEventListener("click", () => {
                const newRow = buildStepRow({
                    client_step: "", agency_action: "", fees: "",
                    processing_time: "", person_responsible: ""
                });
                wrapper.after(newRow);
            });

            deleteStepBtn.addEventListener("click", () => {
                wrapper.remove();
            });

            actionStepContainer.appendChild(addNewStepBtn);
            actionStepContainer.appendChild(deleteStepBtn);

            wrapper.appendChild(stepContainer);
            wrapper.appendChild(actionStepContainer);
            return wrapper;
        }

        serviceEl.steps.forEach(s => steps.appendChild(buildStepRow(s)));
        stepsSection.appendChild(steps);

        // ── TOTAL ──
        const total = document.createElement("div");
        total.classList.add("total");
        const total_container = document.createElement("div");
        total_container.classList.add("total-container");

        const total_fees = document.createElement("input");
        total_fees.classList.add("total-fees");
        total_fees.value = serviceEl.total.fees;
        total_fees.placeholder = "Total fees";

        const total_processing_time = document.createElement("input");
        total_processing_time.classList.add("total-processig-time");
        total_processing_time.value = serviceEl.total.processing_time;
        total_processing_time.placeholder = "Total time";

        total_container.appendChild(total_fees);
        total_container.appendChild(total_processing_time);
        total.appendChild(total_container);

        // ── EDIT / LOCK TOGGLE ──
        function getAllInputs() {
            return newService.querySelectorAll("input");
        }

        // Start locked
        getAllInputs().forEach(inp => { inp.readOnly = true; });

        editBtn.addEventListener("click", () => {
            const isEditing = editBtn.dataset.editing === "true";

            if (isEditing) {
                getAllInputs().forEach(inp => { inp.readOnly = true; });
                editBtn.dataset.editing = "false";
                editBtn.innerHTML = `${icons.edit} <span>Edit</span>`;
                editBtn.classList.remove("card-btn-edit--active");
                newService.classList.remove("editing");
            } else {
                getAllInputs().forEach(inp => { inp.readOnly = false; });
                editBtn.dataset.editing = "true";
                editBtn.innerHTML = `${icons.save} <span>Save</span>`;
                editBtn.classList.add("card-btn-edit--active");
                newService.classList.add("editing");
            }
        });

        actionBar.appendChild(editBtn);
        actionBar.appendChild(deleteBtn);

        // ── ASSEMBLE ──
        newService.appendChild(service_name);
        newService.appendChild(actionBar);
        newService.appendChild(detailsSection);
        newService.appendChild(reqSection);
        newService.appendChild(stepsSection);
        newService.appendChild(total);

        return newService;
    }

    // Browse folder
    browseBtn.addEventListener("click", async () => {
        const folder = await ipcRenderer.invoke("select-folder");
        if (folder) {
            jsonPathInput.value = folder;
            localStorage.setItem("jsonFolderPath", folder);
            loadJsonFiles(folder);
        }
    });

    addResize(filesDisplay);
    addResize(settingsDisplay);
});