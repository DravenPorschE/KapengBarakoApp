document.addEventListener("DOMContentLoaded", function() {

    const backBtn = document.getElementById("back-button"); 
    backBtn.addEventListener("click", function() {
        window.history.back();
    });

    let storedData = JSON.parse(localStorage.getItem("visitors")) || {};

    const keyMap = {
        "accounting-external": "Lipa City Accounting Office External Services",
        "accounting-internal": "Lipa City Accounting Office Internal Services",
        "admin-external": "Lipa City Administrator's Office External Services",
        "agriculture-external": "Lipa City Agriculture Office External Services",
        "assessor-external": "Lipa City Assesor's Office External Services",
        "budget-external": "Lipa City Budget Office External Services",
        "civil-registrar": "Lipa City Civil Registar's Office External Services",
        "community-affairs-external": "Lipa City Community Affairs Office External Services",
        "cooperatives-external": "Lipa City Cooperatives Office External Services",
        "engineering-external": "Lipa City Engineering Office External Services",
        "environment-external": "Lipa City Environment and Natural Resources Office External Services",
        "general-services-internal": "Lipa City General Services Office Internal Services",
        "health-external": "Lipa City Health Office External Services",
        "legal-external": "Lipa City Legal Office External Services",
        "mayor-external": "Lipa City Mayor's Office External Services",
        "mayor-internal": "Lipa City Mayor's Office Internal Services",
        "permits-external": "Lipa City Permits and Licensing Office External Services",
        "personnel-external": "Lipa City Personnel Office External Services",
        "personnel-internal": "Lipa City Personnel Office Internal Services",
        "planning-external": "Lipa City Planning and Development Office External Services",
        "public-safety-external": "Lipa City Public Order and Safety Office External Services",
        "social-welfare-external": "Lipa City Social Welfare and Development Office External Services",
        "treasurer-external": "Lipa City Treasurer's Office External Services",
        "treasurer-internal": "Lipa City Treasurer's Office Internal Services",
        "veterinary-external": "Lipa City Veterinary Office External Services",
        "kll-external": "Kolehiyo ng Lungsod ng Lipa External Services",
        "hospital-external": "Ospital ng Lipa External Services",
        "hospital-internal": "Ospital ng Lipa Internal Services",
        "sangguniang-external": "Office of the Sangguniang Panglungsod External Services",
        "vice-mayor-external": "Lipa City Vice Mayor's Office External Services"
    };

    const visitors = {};
    for (const id in keyMap) {
        const officeName = keyMap[id];
        visitors[id] = storedData[officeName] || 0;
    }

    const highest = Math.max(...Object.values(visitors), 1);

    function setProgress(idPrefix, displayMode) {
        const bar = document.getElementById(`${idPrefix}-bar`);
        const number = document.getElementById(`${idPrefix}-number`);
        if (!bar || !number) return;
        const value = visitors[idPrefix] || 0;
        if (displayMode === 'number') {
            number.textContent = value;
        } else if (displayMode === 'percentage') {
            const percent = ((value / highest) * 100).toFixed(2);
            number.textContent = `${percent}%`;
        }
        const widthPercent = ((value / highest) * 100);
        bar.style.width = widthPercent + "%";
    }

    function updateAllBars(displayMode) {
        for (const key in visitors) {
            setProgress(key, displayMode);
        }
    }

    function sortRowsAnimated() {
        const dataTable = document.querySelector(".data-table");
        const rows = Array.from(dataTable.querySelectorAll(".data-row"));
        const initialPositions = rows.map(row => row.getBoundingClientRect().top);
        const sortedRows = [...rows].sort((a, b) => {
            const aKey = a.querySelector(".bar-result").id.replace("-bar", "");
            const bKey = b.querySelector(".bar-result").id.replace("-bar", "");
            return visitors[bKey] - visitors[aKey];
        });
        sortedRows.forEach((row, index) => {
            const oldIndex = rows.indexOf(row);
            const delta = initialPositions[oldIndex] - initialPositions[index];
            row.style.transform = `translateY(${delta}px)`;
        });
        requestAnimationFrame(() => {
            sortedRows.forEach(row => dataTable.appendChild(row));
            requestAnimationFrame(() => {
                sortedRows.forEach(row => { row.style.transform = ''; });
            });
        });
    }

    setTimeout(() => {
        updateAllBars('number');
        sortRowsAnimated();
    }, 300);

    const radios = document.querySelectorAll('input[name="display_options"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selected = document.querySelector('input[name="display_options"]:checked').value;
            if (selected === 'show_number') {
                updateAllBars('number');
            } else if (selected === 'show_percentage') {
                updateAllBars('percentage');
            }
        });
    });

});