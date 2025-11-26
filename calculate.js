/**
 * WoW TBC Classic Spell Haste Calculator
 * Targeted for Arcane Mages
 */

// Constants
const HASTE_RATING_CONVERSION = 15.77; // 15.77 haste rating = 1% haste

// Buffs and Multipliers
const MULTIPLIERS = [
    { id: 'heroism', label: 'Heroism / Bloodlust', value: 30, description: '30% Cast Speed' },
    { id: 'icyveins', label: 'Icy Veins', value: 20, description: '20% Cast Speed' },
    { id: 'powerinfusion', label: 'Power Infusion', value: 20, description: '20% Cast Speed' },
    { id: 'berserker', label: 'Berserker', value: 20, description: '20% Cast Speed (Troll Racial)' }
];

// Gear and Items
const HASTE_ITEMS = {
    Weapons: [
        { id: 'zdgd', label: "Zhar'doom, Greatstaff of the Devourer", value: 55 },
        { id: 'sunflare', label: "Sunflare", value: 23 },
        { id: 'heart', label: "Heart of the Pit", value: 32 }
    ],
    Armor: [
        { id: 'pant', label: "Pantaloons of Arcane Annihilation", value: 45 },
        { id: 'mont', label: "Mantle of Nimble Thought", value: 38 },
        { id: 'robe', label: "Robe of Departed Spirits", value: 35 },
        { id: 'brooch', label: "Brooch of Nature's Mercy", value: 33 },
        { id: 'shroud', label: "Shroud of the Highborne", value: 32 },
        { id: 'waist', label: "Waistwrap of Infinity", value: 32 },
        { id: 'roa1', label: "Ring of Ancient Knowledge #1", value: 31 },
        { id: 'roa2', label: "Ring of Ancient Knowledge #2", value: 31 },
        { id: 'omnipotence', label: "Ring of Omnipotence", value: 31 },
        { id: 'mab', label: "Mana Attuned Band", value: 29 },
        { id: 'tierbelt', label: "Belt of the Tempest", value: 29 },
        { id: 'bont', label: "Bracers of Nimble Thought", value: 28 },
        { id: 'loop', label: "Loop of Cursed Bones", value: 27 },
        { id: 'tierbracers', label: "Bracers of the Tempest", value: 26 },
        { id: 'foot', label: "Footpads of Madness", value: 25 },
        { id: 'drape', label: "Shadowcaster's Drape", value: 25 },
        { id: 'tierboots', label: "Boots of the Tempest", value: 25 }
    ],
    Trinkets: [
        { id: 'mqg', label: "Mind Quickening Gem", value: 330 },
        { id: 'quag', label: "Quagmirran's Eye", value: 320 },
        { id: 'tsog', label: "The Skull of Gul'dan", value: 175 },
        { id: 'ash', label: "Ashtongue Talisman of Insight", value: 145 }
    ],
    Misc: [
        { id: 'drums', label: "Drums of Battle", value: 80 }
    ]
};

// State
const state = {
    castTime: 1.5,
    targetCastTime: 0.96,
    manualHasteRating: 0,
    activeMultipliers: new Set(),
    activeItems: new Set()
};

/**
 * rounds a number to 3 decimal places
 */
function round(number, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(number * factor) / factor;
}

/**
 * Renders the configuration UI
 */
function renderConfirguration() {
    const configContainer = document.getElementById('configuration-container');
    
    // Render Multipliers
    const multipliersHtml = MULTIPLIERS.map(buff => `
        <label class="checkbox-wrapper">
            <input type="checkbox" id="${buff.id}" data-type="multiplier" value="${buff.value}">
            <span>${buff.label} <small>(${buff.value}%)</small></span>
        </label>
    `).join('');

    // Render Items by Category
    let itemsHtml = '';
    for (const [category, items] of Object.entries(HASTE_ITEMS)) {
        const categoryItems = items.map(item => `
            <label class="checkbox-wrapper">
                <input type="checkbox" id="${item.id}" data-type="item" value="${item.value}">
                <span>${item.label} <small>(${item.value})</small></span>
            </label>
        `).join('');

        itemsHtml += `
            <div class="category-group">
                <h3 class="group-title">${category}</h3>
                <div class="options-grid">
                    ${categoryItems}
                </div>
            </div>
        `;
    }

    configContainer.innerHTML = `
        <div class="card">
            <h2>Buffs</h2>
            <div class="options-grid">
                ${multipliersHtml}
            </div>
        </div>
        <div class="card">
            <h2>Gear</h2>
            ${itemsHtml}
        </div>
    `;

    // Add event listeners
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
        
        // Add hover listeners for preview
        const wrapper = checkbox.closest('.checkbox-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => handleMouseEnter(checkbox, wrapper));
            wrapper.addEventListener('mouseleave', () => handleMouseLeave(wrapper));
        }
    });
}

function handleCheckboxChange(event) {
    const { id, checked, dataset } = event.target;
    const set = dataset.type === 'multiplier' ? state.activeMultipliers : state.activeItems;
    
    if (checked) {
        set.add(id);
    } else {
        set.delete(id);
    }
    
    calculate();
}

function handleMouseEnter(checkbox, wrapper) {
    const { id, checked, dataset } = checkbox;
    
    // Create simulated sets based on current state
    const simMultipliers = new Set(state.activeMultipliers);
    const simItems = new Set(state.activeItems);
    
    // Toggle the hovered item in the simulation
    const set = dataset.type === 'multiplier' ? simMultipliers : simItems;
    if (checked) {
        set.delete(id); // Simulate removing
    } else {
        set.add(id); // Simulate adding
    }
    
    // Calculate simulated stats
    const stats = calculateStats(simMultipliers, simItems);
    const simCastTime = stats.currentCastTime;
    
    // Determine Class
    wrapper.classList.remove('preview-good', 'preview-bad', 'preview-neutral', 'preview-warn');
    
    // Fuzzy comparison for floating point equality
    const isSweetSpot = Math.abs(simCastTime - state.targetCastTime) < 0.001;
    const isBelowSweetSpot = simCastTime < (state.targetCastTime - 0.001); // Faster than 0.96s
    
    if (isBelowSweetSpot) {
        // Too fast (Over cap) - Bad
        wrapper.classList.add('preview-bad');
    } else if (isSweetSpot || (simCastTime >= state.targetCastTime && simCastTime <= 1.001)) {
        // Perfect range (0.96 - 1.0)
        wrapper.classList.add('preview-good');
    } else {
        // Slower than 1.0
        wrapper.classList.add('preview-neutral');
    }
}

function handleMouseLeave(wrapper) {
    wrapper.classList.remove('preview-good', 'preview-bad', 'preview-neutral', 'preview-warn');
}

function calculateStats(activeMultipliers, activeItems) {
    // 1. Calculate Multipliers
    let castingSpeedMultiplier = 1;
    MULTIPLIERS.forEach(buff => {
        if (activeMultipliers.has(buff.id)) {
            castingSpeedMultiplier *= (1 + buff.value / 100);
        }
    });

    // 2. Calculate Haste Rating
    let totalHasteRating = state.manualHasteRating;
    
    for (const category in HASTE_ITEMS) {
        HASTE_ITEMS[category].forEach(item => {
            if (activeItems.has(item.id)) {
                totalHasteRating += item.value;
            }
        });
    }

    // 3. Convert Rating to Percent
    const hasteRatingPercent = totalHasteRating / HASTE_RATING_CONVERSION / 100;
    
    // 4. Final Percent Multiplier from Haste Rating
    const hasteRatingMultiplier = 1 + hasteRatingPercent;

    // 5. Total Casting Speed
    const totalCastingSpeed = castingSpeedMultiplier * hasteRatingMultiplier;

    // 6. Calculate Results
    let currentCastTime = state.castTime / totalCastingSpeed;
    
    // GCD floor Logic (Visual only for "Current GCD" field usually, but casting time can go lower)
    // But here we want the raw cast time.
    
    return {
        totalCastingSpeed,
        currentCastTime,
        castingSpeedMultiplier, // Buffs only
        totalHasteRating,
        hasteRatingPercent
    };
}

function calculate() {
    const stats = calculateStats(state.activeMultipliers, state.activeItems);
    updateUI(stats);
}

function updateUI(stats) {
    // --- Column 1: Current Stats ---
    document.getElementById('current-cast-time').textContent = `${round(stats.currentCastTime, 3)}s`;
    document.getElementById('current-haste-percent').textContent = `${round(stats.hasteRatingPercent * 100, 2)}%`;
    document.getElementById('current-haste-rating').textContent = Math.ceil(stats.totalHasteRating);
    document.getElementById('current-gcd').textContent = `${round(Math.max(1.0, 1.5 / stats.totalCastingSpeed), 3)}s`;

    // --- Target Range (1.0s - 0.96s) ---
    const targetMin = calculateTarget(state.castTime, 1.0, stats.castingSpeedMultiplier); // 1.0s (Floor/Slowest end of range)
    const targetMax = calculateTarget(state.castTime, state.targetCastTime, stats.castingSpeedMultiplier); // 0.96s (Ceiling/Fastest end of range)
    
    updateRangeColumn(targetMin, targetMax, stats.totalHasteRating);
}

function calculateTarget(baseCastTime, targetTime, buffMultiplier) {
    const requiredTotalSpeed = baseCastTime / targetTime;
    const requiredRatingMultiplier = requiredTotalSpeed / buffMultiplier;
    let requiredRatingPercent = requiredRatingMultiplier - 1;
    // if (requiredRatingPercent < 0) requiredRatingPercent = 0;
    const requiredRating = requiredRatingPercent * 100 * HASTE_RATING_CONVERSION;

    return {
        rating: requiredRating,
        percent: requiredRatingPercent
    };
}

function updateRangeColumn(targetMin, targetMax, currentRating) {
    const minRating = Math.ceil(targetMin.rating);
    const maxRating = Math.ceil(targetMax.rating);
    
    const minPercent = round(targetMin.percent * 100, 2);
    const maxPercent = round(targetMax.percent * 100, 2);

    // Display Ranges
    document.getElementById('target-rating-range').textContent = `${minRating} - ${maxRating}`;
    document.getElementById('target-percent-range').textContent = `${minPercent}% - ${maxPercent}%`;

    const elNeeded = document.getElementById('target-needed');
    const elBufferRow = document.getElementById('buffer-row');
    const elBuffer = document.getElementById('target-buffer');
    
    // Reset Buffer visibility
    elBufferRow.style.visibility = 'hidden';

    if (currentRating < minRating) {
        // Under the Range
        const deficit = minRating - Math.ceil(currentRating);
        const deficitPercent = round(deficit / HASTE_RATING_CONVERSION, 2);
        elNeeded.textContent = `+${deficit} Rating (+${deficitPercent}%)`;
        elNeeded.style.color = 'var(--preview-warn)';
    } else if (currentRating > maxRating) {
        // Over the Range
        const surplus = Math.ceil(currentRating) - maxRating;
        const surplusPercent = round(surplus / HASTE_RATING_CONVERSION, 2);
        elNeeded.textContent = `-${surplus} Rating (-${surplusPercent}%)`;
        elNeeded.style.color = 'var(--preview-bad)';
    } else {
        // Within Range
        elNeeded.textContent = "0 Rating";
        elNeeded.style.color = 'var(--preview-good)';
        
        // Show Safe Margin
        elBufferRow.style.visibility = 'visible';
        
        const loseRating = Math.floor(currentRating - minRating); // Floor to be safe? Math.ceil(current) - minRating
        // currentRating is float from calc? No, totalHasteRating is sum of ints usually.
        const loseVal = Math.ceil(currentRating) - minRating;
        const gainVal = maxRating - Math.ceil(currentRating);
        
        const losePercent = round(loseVal / HASTE_RATING_CONVERSION, 2);
        const gainPercent = round(gainVal / HASTE_RATING_CONVERSION, 2);

        elBuffer.textContent = `-${loseVal} (-${losePercent}%) / +${gainVal} (+${gainPercent}%)`;
        elBuffer.style.color = 'var(--preview-good)';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderConfirguration();
    
    const castTimeInput = document.getElementById('cast-time-input');
    const manualHasteInput = document.getElementById('manual-haste-input');
    castTimeInput.addEventListener('input', (e) => {
        state.castTime = parseFloat(e.target.value) || 0;
        calculate();
    });

    manualHasteInput.addEventListener('input', (e) => {
        state.manualHasteRating = parseInt(e.target.value) || 0;
        calculate();
    });

    // Initial calculation
    calculate();
});
