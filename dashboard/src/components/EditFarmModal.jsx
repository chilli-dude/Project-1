import { useState } from "react";

export default function EditFarmModal({ farm, onConfirm, onCancel, existingGroups }) {
  const [name, setName] = useState(farm.name);
  const [group, setGroup] = useState(farm.group);
  const [newGroup, setNewGroup] = useState("");
  const [useNewGroup, setUseNewGroup] = useState(false);

  const finalGroup = useNewGroup ? newGroup.trim() : group;
  const canSubmit = name.trim().length > 0 && finalGroup.length > 0;

  const inputClass = "w-full px-8 py-6 rounded-xl bg-[#f5f5f5] border border-gray-200 text-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white shadow-xl w-full max-w-4xl mx-4" style={{ borderRadius: "var(--widget-radius)", padding: "48px" }}>
        <h3 className="text-3xl font-bold text-gray-900" style={{ marginBottom: "var(--spacing-lg)" }}>Edit Farm</h3>

        <label className="block text-lg font-semibold text-gray-500" style={{ marginBottom: "var(--spacing-sm)" }}>Farm Name</label>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Farm 1"
          className={inputClass}
          style={{ marginBottom: "var(--spacing-lg)" }}
        />

        <label className="block text-lg font-semibold text-gray-500" style={{ marginBottom: "var(--spacing-sm)" }}>Group</label>

        {existingGroups.length > 0 && (
          <div className="flex gap-3" style={{ marginBottom: "var(--spacing-md)" }}>
            <button
              onClick={() => setUseNewGroup(false)}
              className={`text-base px-6 py-3 rounded-full font-medium transition-colors ${
                !useNewGroup ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              Existing group
            </button>
            <button
              onClick={() => setUseNewGroup(true)}
              className={`text-base px-6 py-3 rounded-full font-medium transition-colors ${
                useNewGroup ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              New group
            </button>
          </div>
        )}

        {!useNewGroup ? (
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className={inputClass}
            style={{ marginBottom: "var(--spacing-lg)" }}
          >
            {existingGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder="e.g. Cocoa Farms"
            className={inputClass}
            style={{ marginBottom: "var(--spacing-lg)" }}
          />
        )}

        <div className="flex justify-end" style={{ gap: "var(--spacing-lg)", marginTop: "var(--spacing-xl)" }}>
          <button
            onClick={onCancel}
            className="px-10 py-5 text-base rounded-xl bg-gray-100 text-gray-500 font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onConfirm(farm.id, name.trim(), finalGroup)}
            disabled={!canSubmit}
            className={`px-12 py-5 text-base rounded-xl font-bold transition-all ${
              canSubmit
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
