/* ============================================================
   SHARED DATA LAYER — used by client.html, dashboard.html, maintenance.html
   All data lives in localStorage so every page reads/writes the same data.
   ============================================================ */
const KEYS = { assets: "mq_assets", issues: "mq_issues", records: "mq_records", history: "mq_history" };

function load(key) { return JSON.parse(localStorage.getItem(key) || "[]"); }
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function uid() { return Math.random().toString(36).slice(2, 10); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : "—"; }

const STATUS_COLORS = {
  "Operational": "bg-green-100 text-green-800",
  "Issue Reported": "bg-yellow-100 text-yellow-800",
  "Under Inspection": "bg-blue-100 text-blue-800",
  "Under Maintenance": "bg-orange-100 text-orange-800",
  "Out of Service": "bg-red-100 text-red-800",
  "Retired": "bg-gray-200 text-gray-600",
};
const ISSUE_COLORS = {
  "Reported": "bg-yellow-100 text-yellow-800",
  "Assigned": "bg-blue-100 text-blue-800",
  "Inspection Started": "bg-blue-100 text-blue-800",
  "Maintenance In Progress": "bg-orange-100 text-orange-800",
  "Waiting for Parts": "bg-purple-100 text-purple-800",
  "Resolved": "bg-green-100 text-green-800",
  "Closed": "bg-gray-200 text-gray-600",
  "Reopened": "bg-red-100 text-red-800",
};
function badge(status, map) {
  return `<span class="px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}">${status}</span>`;
}

function logHistory(assetId, action, actor, relatedIssueId = null) {
  const history = load(KEYS.history);
  history.unshift({ id: uid(), assetId, action, actor, relatedIssueId, createdAt: new Date().toISOString() });
  save(KEYS.history, history);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ============================================================
   SEED DATA — 5 demo assets
   ============================================================ */
function seedData() {
  const assets = [
    { id: uid(), code: "AST-PR001", name: "Classroom Projector 01", category: "Electronics", location: "Room 204", condition: "Good", status: "Operational", lastService: "2026-05-01", nextService: "2026-11-01" },
    { id: uid(), code: "AST-AC002", name: "Lecture Hall AC Unit", category: "HVAC", location: "Hall A", condition: "Fair", status: "Operational", lastService: "2026-04-10", nextService: "2026-10-10" },
    { id: uid(), code: "AST-GN003", name: "Backup Generator", category: "Electrical", location: "Basement", condition: "Good", status: "Operational", lastService: "2026-03-15", nextService: "2026-09-15" },
    { id: uid(), code: "AST-PC004", name: "Lab Computer 12", category: "IT Equipment", location: "Computer Lab", condition: "Good", status: "Under Maintenance", lastService: "2026-06-01", nextService: "2026-12-01" },
    { id: uid(), code: "AST-FE005", name: "Fire Extinguisher - Floor 2", category: "Safety", location: "Floor 2 Corridor", condition: "Good", status: "Operational", lastService: "2026-01-20", nextService: "2026-07-20" },
  ];
  save(KEYS.assets, assets);
  save(KEYS.issues, []);
  save(KEYS.records, []);
  save(KEYS.history, []);
  assets.forEach(a => logHistory(a.id, "Asset registered (seed data)", "system"));
}

function ensureSeeded() {
  if (load(KEYS.assets).length === 0) seedData();
}

/* Mocked rule-based AI triage — swap for a real API call later if you have time */
function mockTriage(complaint) {
  const text = complaint.toLowerCase();
  let category = "Other", priority = "Medium",
      causes = "General wear or misuse.",
      checks = "Visually inspect the asset before use.";

  if (/leak|water|drip/.test(text)) {
    category = "Leakage / Performance";
    causes = "Blocked drain pipe, damaged seal, or condensation buildup.";
    checks = "Turn off power near any water if applicable; inspect for visible leaks.";
  }
  if (/noise|sound|rattle|vibrat/.test(text)) causes += " Loose components or worn bearings may be responsible.";
  if (/spark|smoke|shock|wire|electric/.test(text)) {
    category = "Electrical"; priority = "Critical";
    checks = "Disconnect power immediately. Do not operate until inspected by a qualified electrician.";
  }
  if (/slow|lag|freeze|not (working|responding)|crash/.test(text)) category = "Software / Network";
  if (/broken|not working|stopped|dead|no power/.test(text)) priority = "High";

  const title = complaint.length > 60 ? complaint.slice(0, 57) + "..." : complaint;
  return { title, category, priority, causes, checks };
}

function resetDemoData() {
  if (confirm("This will erase all local data and reload the 5 demo assets. Continue?")) {
    seedData();
    location.reload();
  }
}
