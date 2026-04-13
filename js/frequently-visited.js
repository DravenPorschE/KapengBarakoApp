document.addEventListener("DOMContentLoaded", function () {

    const backBtn = document.querySelector(".back-btn");
    backBtn.addEventListener("click", function () {
        window.history.back();
    });

    /* ── Date display ── */
    const dateEl = document.getElementById("filter-date");
    if (dateEl) {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-PH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        dateEl.innerHTML = `As of: <span>${formatted}</span>`;
    }

    let storedData = JSON.parse(localStorage.getItem("visitors")) || {};

    const keyMap = {
        "accounting-external":        "Lipa City Accounting Office External Services",
        "accounting-internal":        "Lipa City Accounting Office Internal Services",
        "admin-external":             "Lipa City Administrator's Office External Services",
        "agriculture-external":       "Lipa City Agriculture Office External Services",
        "assessor-external":          "Lipa City Assesor's Office External Services",
        "budget-external":            "Lipa City Budget Office External Services",
        "civil-registrar":            "Lipa City Civil Registar's Office External Services",
        "community-affairs-external": "Lipa City Community Affairs Office External Services",
        "cooperatives-external":      "Lipa City Cooperatives Office External Services",
        "engineering-external":       "Lipa City Engineering Office External Services",
        "environment-external":       "Lipa City Environment and Natural Resources Office External Services",
        "general-services-internal":  "Lipa City General Services Office Internal Services",
        "health-external":            "Lipa City Health Office External Services",
        "legal-external":             "Lipa City Legal Office External Services",
        "legal-internal":             "Lipa City Legal Office Internal Services",
        "mayor-external":             "Lipa City Mayor's Office External Services",
        "mayor-internal":             "Lipa City Mayor's Office Internal Services",
        "permits-external":           "Lipa City Permits and Licensing Office External Services",
        "personnel-external":         "Lipa City Personnel Office External Services",
        "personnel-internal":         "Lipa City Personnel Office Internal Services",
        "planning-external":          "Lipa City Planning and Development Office External Services",
        "public-safety-external":     "Lipa City Public Order and Safety Office External Services",
        "social-welfare-external":    "Lipa City Social Welfare and Development Office External Services",
        "treasurer-external":         "Lipa City Treasurer's Office External Services",
        "treasurer-internal":         "Lipa City Treasurer's Office Internal Services",
        "veterinary-external":        "Lipa City Veterinary Office External Services",
        "kll-external":               "Kolehiyo ng Lungsod ng Lipa External Services",
        "hospital-external":          "Ospital ng Lipa External Services",
        "hospital-internal":          "Ospital ng Lipa Internal Services",
        "sangguniang-external":       "Office of the Sangguniang Panglungsod External Services",
        "vice-mayor-external":        "Lipa City Vice Mayor's Office External Services"
    };

    const visitors = {};
    for (const id in keyMap) {
        const officeName = keyMap[id];
        visitors[id] = storedData[officeName] || 0;
    }

    const highest = Math.max(...Object.values(visitors), 1);

    function setProgress(idPrefix, displayMode) {
        const bar    = document.getElementById(`${idPrefix}-bar`);
        const number = document.getElementById(`${idPrefix}-number`);
        if (!bar || !number) return;

        const value = visitors[idPrefix] || 0;
        if (displayMode === 'number') {
            number.textContent = value.toLocaleString();
        } else {
            const pct = ((value / highest) * 100).toFixed(1);
            number.textContent = `${pct}%`;
        }
        bar.style.width = ((value / highest) * 100) + "%";
    }

    function updateAllBars(displayMode) {
        for (const key in visitors) {
            setProgress(key, displayMode);
        }
    }

    /* ── Animate rows into sorted order ── */
    function sortRowsAnimated() {
        const dataTable = document.querySelector(".data-table");
        const rows = Array.from(dataTable.querySelectorAll(".data-row"));

        /* Record positions before reorder */
        const initialPositions = rows.map(row => row.getBoundingClientRect().top);

        /* Sorted copy */
        const sortedRows = [...rows].sort((a, b) => {
            const aKey = a.querySelector(".bar-result").id.replace("-bar", "");
            const bKey = b.querySelector(".bar-result").id.replace("-bar", "");
            return visitors[bKey] - visitors[aKey];
        });

        /* Fake-animate using translateY offset trick */
        sortedRows.forEach((row, index) => {
            const oldIndex = rows.indexOf(row);
            const delta = initialPositions[oldIndex] - initialPositions[index];
            row.style.transform = `translateY(${delta}px)`;
        });

        requestAnimationFrame(() => {
            sortedRows.forEach(row => dataTable.appendChild(row));
            requestAnimationFrame(() => {
                sortedRows.forEach(row => { row.style.transform = ""; });
            });
        });

        /* Re-number rank badges */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const reordered = Array.from(dataTable.querySelectorAll(".data-row"));
                reordered.forEach((row, i) => {
                    const badge = row.querySelector(".row-rank");
                    if (badge) badge.textContent = i + 1;
                });
            });
        });
    }

    setTimeout(() => {
        updateAllBars('number');
        sortRowsAnimated();
    }, 300);

    /* ── Toggle listeners ── */
    const radios = document.querySelectorAll('input[name="display_options"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selected = document.querySelector('input[name="display_options"]:checked').value;
            updateAllBars(selected === 'show_number' ? 'number' : 'percentage');
        });
    });

    /* ── Keep pill active-class in sync (for CSS styling) ── */
    const pills = document.querySelectorAll('.filter-pill');
    radios.forEach((radio, i) => {
        radio.addEventListener('change', () => {
            pills.forEach(p => p.classList.remove('active'));
            pills[i].classList.add('active');
        });
    });
    /* Set initial active state */
    const checkedIndex = [...radios].findIndex(r => r.checked);
    if (checkedIndex >= 0) pills[checkedIndex].classList.add('active');

});