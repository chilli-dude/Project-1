import { useState } from "react";

export default function AddFarmModal({ onConfirm, onCancel, existingGroups }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [useNewGroup, setUseNewGroup] = useState(existingGroups.length === 0);

  const finalGroup = useNewGroup ? newGroup.trim() : group;
  const canSubmit = name.trim().length > 0 && finalGroup.length > 0;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Add Farm Site</h3>

        {/* Name */}
        <label className="block text-xs font-medium text-slate-400 mb-1">Farm Name</label>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Farm 1"
          className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-4"
        />

        {/* Group */}
        <label className="block text-xs font-medium text-slate-400 mb-1">Group</label>

        {existingGroups.length > 0 && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setUseNewGroup(false)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                !useNewGroup
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                  : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
            >
              Existing group
            </button>
            <button
              onClick={() => setUseNewGroup(true)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                useNewGroup
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                  : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
            >
              New group
            </button>
          </div>
        )}

        {!useNewGroup && existingGroups.length > 0 ? (
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm text-slate-100 focus:outline-none focus:border-blue-500 mb-4"
          >
            <option value="">Select a group...</option>
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
            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-4"
          />
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onConfirm(name.trim(), finalGroup)}
            disabled={!canSubmit}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            Add Farm
          </button>
        </div>
      </div>
    </div>
  );
}
