import { useState } from "react";

export default function AddFarmModal({ onConfirm, onCancel, existingGroups }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [useNewGroup, setUseNewGroup] = useState(existingGroups.length === 0);

  const finalGroup = useNewGroup ? newGroup.trim() : group;
  const canSubmit = name.trim().length > 0 && finalGroup.length > 0;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-7">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Add Farm Site</h3>

        {/* Name */}
        <label className="block text-sm font-semibold text-gray-500 mb-2">Farm Name</label>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Farm 1"
          className="w-full px-4 py-3 rounded-xl bg-[#f1f0f9] border border-gray-200 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 mb-5"
        />

        {/* Group */}
        <label className="block text-sm font-semibold text-gray-500 mb-2">Group</label>

        {existingGroups.length > 0 && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseNewGroup(false)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                !useNewGroup
                  ? "bg-violet-100 text-violet-600"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              Existing group
            </button>
            <button
              onClick={() => setUseNewGroup(true)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                useNewGroup
                  ? "bg-violet-100 text-violet-600"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
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
            className="w-full px-4 py-3 rounded-xl bg-[#f1f0f9] border border-gray-200 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 mb-5"
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
            className="w-full px-4 py-3 rounded-xl bg-[#f1f0f9] border border-gray-200 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 mb-5"
          />
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={onCancel}
            className="px-5 py-3 text-sm rounded-xl bg-gray-100 text-gray-500 font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onConfirm(name.trim(), finalGroup)}
            disabled={!canSubmit}
            className={`px-6 py-3 text-sm rounded-xl font-bold transition-all ${
              canSubmit
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            Add Farm
          </button>
        </div>
      </div>
    </div>
  );
}
