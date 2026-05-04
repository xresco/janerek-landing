// Selection modal — mirrors Android DialogSelectionAdapter.
//
// Renders into a host <div> on the page and supports both single- and
// multi-select. The single-select variant commits on click; multi-select
// shows Cancel/Done in the footer.
//
// Usage:
//   import { openSelectionModal } from "/js/onboarding-modal.js";
//   openSelectionModal({
//       host: document.getElementById("modal-host"),
//       title: "Pick something",
//       items: [{ value: "A", label: "Apple", icon: "🍎" }, ...],
//       multi: false,
//       initial: ["A"],
//       searchPlaceholder: "Search",
//       limit: 4,                  // multi-only
//       limitWarning: "Pick at most 4",
//       cancelText: "Cancel",
//       doneText: "Done",
//       onDone: (selected) => { ... },
//   });

import { ICON_CLOSE } from "/js/onboarding-icons.js";

export function openSelectionModal(opts) {
    const {
        host, title, items, multi = false, initial = [],
        searchPlaceholder = "Search", limit = 0, limitWarning = "",
        cancelText = "Cancel", doneText = "Done",
        onDone,
    } = opts;
    if (!host) throw new Error("openSelectionModal: host element required");

    const selected = new Set(initial);
    let warning = "";

    function rowHtml(item) {
        const v = item.value;
        const isSelected = selected.has(v);
        const cls = isSelected ? " selected" : "";
        const icon = item.icon || "";
        return `<div class="modal-row${cls}" data-value="${escapeAttr(v)}">
            ${icon ? `<span class="chip-icon-svg">${icon}</span>` : ""}
            <span class="row-text">${escapeHtml(item.label)}</span>
            <span class="check">${isSelected ? "✓" : ""}</span>
        </div>`;
    }

    function rerender() {
        const q = (host.querySelector(".modal-search input")?.value || "")
            .toLowerCase().trim();
        const filtered = q
            ? items.filter((it) => it.label.toLowerCase().includes(q))
            : items;
        host.querySelector(".modal-list").innerHTML =
            filtered.map(rowHtml).join("");
        bindRows();
    }

    function bindRows() {
        host.querySelectorAll(".modal-row").forEach((r) => {
            r.addEventListener("click", () => {
                const v = r.getAttribute("data-value");
                if (multi) {
                    if (selected.has(v)) {
                        selected.delete(v);
                        warning = "";
                    } else if (limit && selected.size >= limit) {
                        warning = limitWarning;
                    } else {
                        selected.add(v);
                        warning = "";
                    }
                    host.querySelector(".modal-warning").textContent = warning;
                    rerender();
                } else {
                    selected.clear();
                    selected.add(v);
                    onDone(Array.from(selected));
                    close();
                }
            });
        });
    }

    function close() {
        document.body.classList.remove("modal-open");
        host.innerHTML = "";
    }

    host.innerHTML = `<div class="modal-backdrop">
        <div class="modal-card" role="dialog" aria-modal="true">
            <div class="modal-header">
                <h2>${escapeHtml(title)}</h2>
                <button type="button" class="modal-close" id="modal-close" aria-label="Close">${ICON_CLOSE}</button>
            </div>
            <div class="modal-search">
                <input type="search" placeholder="${escapeAttr(searchPlaceholder)}" autofocus>
            </div>
            <div class="modal-warning"></div>
            <div class="modal-list"></div>
            ${multi ? `
            <div class="modal-footer">
                <button type="button" class="signup-btn outline" id="modal-cancel">${escapeHtml(cancelText)}</button>
                <button type="button" class="signup-btn primary" id="modal-done">${escapeHtml(doneText)}</button>
            </div>` : ""}
        </div>
    </div>`;
    document.body.classList.add("modal-open");
    host.querySelector(".modal-search input").addEventListener("input", rerender);
    host.querySelector("#modal-close").addEventListener("click", close);
    host.querySelector(".modal-backdrop").addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-backdrop")) close();
    });
    if (multi) {
        host.querySelector("#modal-cancel").addEventListener("click", close);
        host.querySelector("#modal-done").addEventListener("click", () => {
            onDone(Array.from(selected));
            close();
        });
    }
    rerender();
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"]/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
    }[c]));
}

function escapeAttr(s) {
    return String(s ?? "").replace(/["&<>]/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
    }[c]));
}
