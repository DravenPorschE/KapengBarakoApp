document.addEventListener("DOMContentLoaded", () => {
    function extractData() {
        const root = document.querySelector(".department-name-display");

        const result = {};

        // 🔹 Department
        const departmentInput = root.querySelector('input[data-key="department"]');
        result.department = departmentInput.value;

        // 🔹 External Services
        const services = [];
        const serviceElements = root.querySelectorAll(".external-services-parent > .service");

        serviceElements.forEach(serviceEl => {
            const service = {};

            // Basic fields inside service
            serviceEl.querySelectorAll(':scope > input[data-key]').forEach(input => {
                const key = input.dataset.key;
                service[key] = input.value;
            });

            // 🔸 Checklist of Requirements
            const requirements = [];
            const requirementElements = serviceEl.querySelectorAll(".checklist_of_requirements .requirements");

            requirementElements.forEach(reqEl => {
            const req = {};

            reqEl.querySelectorAll('input[data-key]').forEach(input => {
                const key = input.dataset.key;
                req[key] = input.value;
            });

            requirements.push(req);
            });

            service.checklist_of_requirements = requirements;

            // 🔸 Steps
            const steps = [];
            const stepElements = serviceEl.querySelectorAll(".steps .step");

            stepElements.forEach(stepEl => {
            const step = {};

            stepEl.querySelectorAll('input[data-key]').forEach(input => {
                const key = input.dataset.key;
                step[key] = input.value;
            });

            steps.push(step);
            });

            service.steps = steps;

            services.push(service);
        });

        result.external_services = services;

        return result;
    }

    console.log(extractData());
});