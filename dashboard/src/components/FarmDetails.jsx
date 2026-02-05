const PROJECT_TYPES = [
  "", "Cocoa", "Coffee", "Palm Oil", "Rubber", "Rice",
  "Maize", "Soybean", "Agroforestry", "Reforestation", "Other",
];

function Field({ label, value, onChange, type = "text", placeholder = "", options }) {
  const base =
    "w-full px-4 py-3 rounded-xl bg-[#f1f0f9] border border-gray-200 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400";

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 mb-2">{label}</label>
      {options ? (
        <select value={value} onChange={onChange} className={base}>
          {options.map((o) => (
            <option key={o} value={o}>{o || `Select ${label.toLowerCase()}...`}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

export default function FarmDetails({ farm, onUpdateDetails }) {
  const d = farm.details;

  const update = (key) => (e) => {
    onUpdateDetails(farm.id, { ...d, [key]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Project Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Project Type" value={d.projectType} onChange={update("projectType")} options={PROJECT_TYPES} />
          <Field label="Project Length" value={d.projectLength} onChange={update("projectLength")} placeholder="e.g. 5 years" />
          <Field label="Year Start" value={d.yearStart} onChange={update("yearStart")} type="number" placeholder="e.g. 2024" />
          <Field label="Year End" value={d.yearEnd} onChange={update("yearEnd")} type="number" placeholder="e.g. 2029" />
          <Field label="Total Budget" value={d.totalBudget} onChange={update("totalBudget")} placeholder="e.g. $500,000" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Name" value={d.contactName} onChange={update("contactName")} placeholder="e.g. John Smith" />
          <Field label="Email" value={d.contactEmail} onChange={update("contactEmail")} type="email" placeholder="e.g. john@farm.com" />
          <Field label="Phone" value={d.contactPhone} onChange={update("contactPhone")} type="tel" placeholder="e.g. +44 7700 000000" />
        </div>
      </div>
    </div>
  );
}
