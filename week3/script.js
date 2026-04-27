mermaid.initialize({ 
    startOnLoad: true,
    securityLevel: 'loose',
    flowchart: { useMaxWidth: true, htmlLabels: true }
});

const DELTA = {
    'Start': { '0': 'A', '1': 'B' },
    'A': { '0': 'Trap', '1': 'B' },
    'B': { '0': 'A', '1': 'B' },
    'Trap': { '0': 'Trap', '1': 'Trap' }
};

const DESCRIPTIONS = {
    'Start': 'Input kosong.',
    'A': 'Gagal: String tidak boleh diakhiri angka 0.',
    'B': 'Berhasil: String valid dan diakhiri angka 1.',
    'Trap': 'Gagal: Ditemukan urutan 00 (terjebak di Trap state).'
};

const ID_MAP = { "Start": "S", "A": "A", "B": "B", "Trap": "T" };

function runFSM() {
    const input = document.getElementById("inp").value.trim();
    const info = document.getElementById("statusInfo");
    const main = document.getElementById("statusMain");
    const desc = document.getElementById("statusDesc");
    const traceEl = document.getElementById("trace");

    if (!input || !/^[01]+$/.test(input)) {
        alert("Masukkan hanya angka 0 atau 1");
        return;
    }

    let currState = "Start";
    let trace = ["Start"];

    resetVisuals();

    for (let ch of input) {
        currState = DELTA[currState][ch];
        trace.push(currState);
    }

    setTimeout(() => highlightNode(currState), 100);

    info.style.display = "block";
    const isAccepted = (currState === "B");
    
    main.textContent = isAccepted ? "STRING DITERIMA" : "STRING DITOLAK";
    main.style.color = isAccepted ? "var(--success)" : "var(--error)";
    desc.textContent = DESCRIPTIONS[currState];
    traceEl.textContent = "Trace: " + trace.join(" → ");
}

function highlightNode(nodeId) {
    const shortId = ID_MAP[nodeId];
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(n => {
        if (n.id.includes(`-${shortId}-`) || n.textContent.trim() === nodeId) {
            n.classList.add('active-node');
        }
    });
}

function resetVisuals() {
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active-node'));
}

document.getElementById("inp").addEventListener("keydown", e => {
    if (e.key === "Enter") runFSM();
});
