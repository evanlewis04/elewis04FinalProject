const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const fmtPrice = (n) =>
    n === null || n === undefined || Number.isNaN(n)
        ? "—"
        : `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtChange = (d, dp) => {
    if (d === null || d === undefined) return "—";
    const sign = d >= 0 ? "+" : "";
    const pct = dp === null || dp === undefined ? "" : ` (${sign}${dp.toFixed(2)}%)`;
    return `${sign}${d.toFixed(2)}${pct}`;
};

const changeClass = (d) => (d > 0 ? "change-up" : d < 0 ? "change-down" : "");

async function getJSON(url, opts) {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error(`Bad JSON from ${url}`);
    }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

async function loadLayers() {
    const layers = await getJSON("/api/layers");

    // Layer nav buttons.
    const nav = $("#layer-nav");
    nav.innerHTML = layers
        .map(
            (l) =>
                `<button data-target="layer-${l.key}" style="border-left-color: ${l.color}">${l.name}</button>`
        )
        .join("");
    nav.addEventListener("click", (e) => {
        const target = e.target.closest("button")?.dataset.target;
        if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Render each layer's company cards (skeleton — quotes filled in next).
    const section = $("#layers-section");
    section.innerHTML = layers
        .map(
            (l) => `
            <div class="layer-block" id="layer-${l.key}">
                <header>
                    <span class="layer-pill" style="background-color: ${l.color}">Layer ${l.order}</span>
                    <h3>${l.name}</h3>
                </header>
                <p class="layer-desc">${l.description}</p>
                <div class="card-grid" id="grid-${l.key}">
                    ${l.companies
                        .map(
                            (c) => `
                        <article class="company-card" data-ticker="${c.ticker}">
                            <div class="ticker-row">
                                <span class="ticker">${c.ticker}</span>
                                <span class="muted" data-field="changePct">…</span>
                            </div>
                            <div class="name">${c.name}</div>
                            <p class="role">${c.role}</p>
                            <div class="price-row">
                                <span data-field="price">…</span>
                                <span data-field="change" class="muted">loading</span>
                            </div>
                        </article>`
                        )
                        .join("")}
                </div>
            </div>`
        )
        .join("");

    // Populate the note-form ticker dropdown grouped by layer.
    const select = $("#note-ticker");
    select.innerHTML = layers
        .map(
            (l) =>
                `<optgroup label="${l.name}">${l.companies
                    .map((c) => `<option value="${c.ticker}">${c.ticker} — ${c.name}</option>`)
                    .join("")}</optgroup>`
        )
        .join("");

    return layers;
}

async function loadQuotesForLayers(layers) {
    const layerAverages = {};
    for (const l of layers) {
        const tickers = l.companies.map((c) => c.ticker).join(",");
        try {
            const quotes = await getJSON(`/api/quotes?tickers=${encodeURIComponent(tickers)}`);
            const validChanges = [];
            for (const q of quotes) {
                const card = document.querySelector(`#grid-${l.key} [data-ticker="${q.ticker}"]`);
                if (!card) continue;
                if (q.error || q.current === null) {
                    card.querySelector('[data-field="price"]').textContent = "—";
                    card.querySelector('[data-field="change"]').textContent = q.error || "no data";
                    card.querySelector('[data-field="changePct"]').textContent = "";
                    continue;
                }
                card.querySelector('[data-field="price"]').textContent = fmtPrice(q.current);
                const changeEl = card.querySelector('[data-field="change"]');
                changeEl.textContent = fmtChange(q.change, q.changePercent);
                changeEl.className = `${changeClass(q.change)}`;
                const pctEl = card.querySelector('[data-field="changePct"]');
                if (q.changePercent !== null && q.changePercent !== undefined) {
                    pctEl.textContent = `${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%`;
                    pctEl.className = changeClass(q.change);
                    validChanges.push(q.changePercent);
                }
            }
            layerAverages[l.key] = validChanges.length
                ? validChanges.reduce((a, b) => a + b, 0) / validChanges.length
                : 0;
        } catch (err) {
            console.warn(`Failed to load quotes for layer ${l.key}:`, err.message);
            layerAverages[l.key] = 0;
        }
    }
    return layerAverages;
}

function renderLayerChart(layers, averages) {
    const ctx = document.getElementById("layerChart");
    if (!ctx || !window.Chart) return;
    const labels = layers.map((l) => l.name);
    const data = layers.map((l) => Number((averages[l.key] || 0).toFixed(2)));
    const colors = layers.map((l) => l.color);
    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Avg daily % change",
                    data,
                    backgroundColor: colors,
                    borderRadius: 6,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (item) => `${item.parsed.y >= 0 ? "+" : ""}${item.parsed.y.toFixed(2)}%`,
                    },
                },
            },
            scales: {
                x: { ticks: { color: "#9aa3c7" }, grid: { color: "#2a3358" } },
                y: {
                    ticks: {
                        color: "#9aa3c7",
                        callback: (v) => `${v}%`,
                    },
                    grid: { color: "#2a3358" },
                },
            },
        },
    });
}

async function loadNotes() {
    const feed = $("#notes-feed");
    try {
        const notes = await getJSON("/api/notes");
        if (!notes.length) {
            feed.innerHTML = '<p class="muted">No notes yet — be the first to add one above.</p>';
            return;
        }
        feed.innerHTML = notes
            .map(
                (n) => `
            <article class="note-item" data-id="${n._id}">
                <div class="note-meta">
                    <strong>${n.ticker}</strong>
                    <span class="note-author">${escapeHtml(n.author)} · ${new Date(n.createdAt).toLocaleString()}</span>
                    <button class="note-delete" data-id="${n._id}">delete</button>
                </div>
                <p class="note-body">${escapeHtml(n.body)}</p>
            </article>`
            )
            .join("");
    } catch (err) {
        feed.innerHTML = `<p class="muted">Could not load notes: ${escapeHtml(err.message)}</p>`;
    }
}

async function loadWatchlist() {
    const grid = $("#watchlist-grid");
    try {
        const items = await getJSON("/api/watchlist");
        if (!items.length) {
            grid.innerHTML = '<p class="muted">Watchlist is empty — add a ticker on the right.</p>';
            return;
        }
        grid.innerHTML = items
            .map((item) => {
                const q = item.quote;
                const price = q ? fmtPrice(q.current) : "—";
                const change = q ? fmtChange(q.change, q.changePercent) : item.quoteError || "no data";
                const cClass = q ? changeClass(q.change) : "";
                return `
                <article class="company-card" data-ticker="${item.ticker}">
                    <button class="watch-delete" data-id="${item._id}" title="Remove">×</button>
                    <div class="ticker-row">
                        <span class="ticker">${item.ticker}</span>
                        <span class="muted">${item.layer}</span>
                    </div>
                    <div class="name">${q?.profile?.name || item.ticker}</div>
                    ${item.note ? `<p class="role">${escapeHtml(item.note)}</p>` : ""}
                    <div class="price-row">
                        <span>${price}</span>
                        <span class="${cClass}">${change}</span>
                    </div>
                </article>`;
            })
            .join("");
    } catch (err) {
        grid.innerHTML = `<p class="muted">Could not load watchlist: ${escapeHtml(err.message)}</p>`;
    }
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function wireForms() {
    const noteForm = $("#note-form");
    const noteStatus = $("#note-status");
    noteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        noteStatus.textContent = "Saving…";
        noteStatus.className = "form-status";
        const payload = {
            ticker: $("#note-ticker").value,
            author: $("#note-author").value.trim(),
            body: $("#note-body").value.trim(),
        };
        try {
            await getJSON("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            noteStatus.textContent = "Saved.";
            noteStatus.className = "form-status success";
            noteForm.reset();
            loadNotes();
        } catch (err) {
            noteStatus.textContent = err.message;
            noteStatus.className = "form-status error";
        }
    });

    const watchForm = $("#watch-form");
    const watchStatus = $("#watch-status");
    watchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        watchStatus.textContent = "Validating ticker…";
        watchStatus.className = "form-status";
        const payload = {
            ticker: $("#watch-ticker").value.trim(),
            layer: $("#watch-layer").value,
            note: $("#watch-note").value.trim(),
        };
        try {
            await getJSON("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            watchStatus.textContent = "Added.";
            watchStatus.className = "form-status success";
            watchForm.reset();
            loadWatchlist();
        } catch (err) {
            watchStatus.textContent = err.message;
            watchStatus.className = "form-status error";
        }
    });

    // Delegate delete clicks for notes + watchlist.
    document.addEventListener("click", async (e) => {
        const noteBtn = e.target.closest(".note-delete");
        if (noteBtn) {
            try {
                await getJSON(`/api/notes/${noteBtn.dataset.id}`, { method: "DELETE" });
                loadNotes();
            } catch (err) {
                alert(`Failed to delete note: ${err.message}`);
            }
            return;
        }
        const watchBtn = e.target.closest(".watch-delete");
        if (watchBtn) {
            try {
                await getJSON(`/api/watchlist/${watchBtn.dataset.id}`, { method: "DELETE" });
                loadWatchlist();
            } catch (err) {
                alert(`Failed to remove: ${err.message}`);
            }
        }
    });
}

(async function init() {
    wireForms();
    const layers = await loadLayers();
    const averages = await loadQuotesForLayers(layers);
    renderLayerChart(layers, averages);
    loadNotes();
    loadWatchlist();
})();
