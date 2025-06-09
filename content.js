console.log("📦 Extension loaded: multi-site autofill");

function insertButtons() {
    if (document.querySelector("#box-selector-panel")) return;

    const panel = document.createElement("div");
    panel.id = "box-selector-panel";
    panel.innerHTML = `
        <style>
        #box-selector-panel {
            position: fixed;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            background-color: rgba(255, 255, 255, 0.8);
            border: 1px solid #ccc;
            padding: 10px;
            z-index: 10000;
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }
        #box-selector-panel button {
            margin: 6px 0;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            background-color: transparent;
            border: 1px solid #aaa;
            transition: all 0.2s ease-in-out;
            border-radius: 4px;
        }
        #box-selector-panel button.active {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }
        </style>
        <strong style="margin-bottom: 10px;">📦 Box Size</strong>
        <button id="btn-14">14</button>
        <button id="btn-18">18</button>
        <button id="btn-25">25</button>
        <button id="btn-20x6x6">20×6×6</button>
        <button id="btn-24x6x6">24×6×6</button>
        <button id="btn-28x4x4">28×4×4</button>
        <button id="btn-30x4x4">30×4×4</button>
    `;
    document.body.appendChild(panel);

    const boxMap = {
        "btn-14": "14",
        "btn-18": "18",
        "btn-25": "25",
        "btn-20x6x6": "20x6x6",
        "btn-24x6x6": "24x6x6",
        "btn-28x4x4": "28x4x4",
        "btn-30x4x4": "30x4x4"
    };

    for (const [btnId, label] of Object.entries(boxMap)) {
        document.getElementById(btnId).addEventListener("click", () => {
            fillBox(label);
            markActive(btnId);
        });
    }
}

const markActive = (id) => {
    document.querySelectorAll("#box-selector-panel button").forEach(btn => {
        btn.classList.remove("active");
    });
    const activeBtn = document.getElementById(id);
    if (activeBtn) activeBtn.classList.add("active");
};

const setField = (selector, value) => {
    let input = document.getElementById(selector) || document.querySelector(selector);
    if (input) {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

const fillBox = async (label) => {
    const dims = {
        "14": { l: 14, w: 4, h: 4 },
        "18": { l: 18, w: 4, h: 4 },
        "25": { l: 25, w: 4, h: 4 },
        "20x6x6": { l: 20, w: 6, h: 6 },
        "24x6x6": { l: 24, w: 6, h: 6 },
        "28x4x4": { l: 28, w: 4, h: 4 },
        "30x4x4": { l: 30, w: 4, h: 4 }
    };
    const { l, w, h } = dims[label] || {};

    let lb = 0, oz = 0;
    try {
        const res = await fetch("http://localhost:5000/weight");
        const data = await res.json();
        lb = data.weight_lb || 0;
        oz = (data.weight_oz || 0);
    } catch (err) {
        console.error("❌ Failed to fetch weight from server:", err);
    }

    // Pirate Ship
    setField("configuration-key-length", l);
    setField("configuration-key-width", w);
    setField("configuration-key-height", h);
    setField("configuration-key-weight-pounds", lb);
    setField("configuration-key-weight-ounces", oz);

    // eBay
    setField('input[name="dimensions.length"]', l);
    setField('input[name="dimensions.width"]', w);
    setField('input[name="dimensions.height"]', h);
    setField('input[aria-label="Package weight in pounds"]', lb);

    // Amazon
    setField('[placeholder="Length"]', l);
    setField('[placeholder="Width"]', w);
    setField('[placeholder="Height"]', h);
    setField('[aria-label="Pounds"]', lb);
    setField('[aria-label="Ounces"]', oz);

    console.log(`✅ Autofilled ${label} box: ${l}x${w}x${h}, ${lb} lb ${oz} oz`);
};

setTimeout(insertButtons, 100);
