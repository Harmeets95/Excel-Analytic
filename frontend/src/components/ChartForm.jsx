import { useState } from "react";
import toast from "react-hot-toast";

const ChartForm = ({ uploads = [], columns = [], onSubmit }) => {
  const [uploadId, setUploadId] = useState("");
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uploadId || !xKey || !yKey) {
      toast.error("Please fill in all fields.");
      return;
    }
    onSubmit({ uploadId, x: xKey, y: yKey });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-2xl rounded-xl border border-gray-200 w-full max-w-3xl mx-auto mt-12 overflow-hidden"
    >
      {/* Header Bar (Excel-like ribbon) */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-wide">
          📊 Excel Analytics — Chart Generator
        </h2>
        <span className="text-sm opacity-80">Sheet1 • Chart Builder</span>
      </div>

      {/* Body */}
      <div className="p-8 bg-gray-50">
        {/* Upload select */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Choose Excel Upload
          </label>
          <select
            value={uploadId}
            onChange={(e) => setUploadId(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
          >
            <option value="">-- Select File --</option>
            {uploads.map((upload) => (
              <option key={upload._id} value={upload._id}>
                {upload.originalName}
              </option>
            ))}
          </select>
        </div>

        {/* Axis selectors in grid (Excel-like row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              X-Axis
            </label>
            <select
              value={xKey}
              onChange={(e) => setXKey(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            >
              <option value="">-- Select X-Axis --</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Y-Axis
            </label>
            <select
              value={yKey}
              onChange={(e) => setYKey(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            >
              <option value="">-- Select Y-Axis --</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold text-lg shadow hover:scale-[1.02] transition-transform"
        >
          Render Chart
        </button>
      </div>
    </form>
  );
};

export default ChartForm;
