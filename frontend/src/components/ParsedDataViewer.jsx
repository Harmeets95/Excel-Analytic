import { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";

const toCSV = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const header = cols.join(",");
  const lines = rows.map((r) =>
    cols
      .map((c) => {
        const v = r[c] ?? "";
        return `"${String(v).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
};

const downloadBlob = (content, filename, mime = "text/plain") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ParsedDataViewer = () => {
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParsed = async () => {
    try {
      setLoading(true);
      const res = await API.get("/excel/parsed", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const arr = res?.data?.parsed ?? [];
      setParsedData(Array.isArray(arr) ? arr : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch parsed data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParsed();
  }, []);

  const handleDownload = (entry) => {
    const rows = entry?.data ?? [];
    if (!Array.isArray(rows) || rows.length === 0) {
      toast.error("No data to download for this upload.");
      return;
    }
    const csv = toCSV(rows);
    downloadBlob(csv, `parsed_${entry.uploadId || "unknown"}.csv`, "text/csv");
    toast.success("CSV downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 rounded-xl shadow-xl mb-6">
          <h1 className="text-2xl font-bold">Parsed Excel Data</h1>
          <p className="text-sm opacity-90 mt-1">
            All parsed uploads (showing preview rows). Download CSV to export
            full data.
          </p>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="bg-white/5 rounded-xl p-8 text-center text-white/80">
              Loading parsed data...
            </div>
          ) : parsedData.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center text-white/80">
              No parsed Excel data available.
            </div>
          ) : (
            parsedData.map((entry, index) => {
              const rows = Array.isArray(entry?.data) ? entry.data : [];
              const cols = rows.length > 0 ? Object.keys(rows[0]) : [];

              return (
                <div
                  key={entry._id || index}
                  className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-sm text-white/80">
                        Upload #{index + 1}
                      </div>
                      <div className="text-lg font-semibold text-yellow-300">
                        {entry.originalName ?? `Upload ${index + 1}`}
                      </div>
                      <div className="text-xs text-white/70 mt-1">
                        ID: {entry.uploadId ?? entry._id}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm text-white/80 mr-2">
                        {rows.length} rows
                      </div>
                      <button
                        onClick={() => handleDownload(entry)}
                        className="px-4 py-2 bg-yellow-400 text-black rounded-md font-semibold hover:bg-yellow-300"
                      >
                        ⤓ Download CSV
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 overflow-auto rounded-md border border-gray-200 bg-white text-black">
                    {cols.length === 0 ? (
                      <div className="p-6 text-center text-gray-600">
                        No rows to preview for this upload.
                      </div>
                    ) : (
                      <table className="min-w-full table-fixed border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-xs text-left border-r border-gray-200">
                              #
                            </th>
                            {cols.map((col) => (
                              <th
                                key={col}
                                className="px-3 py-2 text-xs text-left font-medium border-r border-gray-200"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {rows.slice(0, 10).map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={
                                rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-3 py-2 text-sm border-r border-gray-100">
                                {rIdx + 1}
                              </td>
                              {cols.map((col, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-3 py-2 text-sm border-r border-gray-100 truncate max-w-[200px]"
                                >
                                  {row[col] === null || row[col] === undefined
                                    ? ""
                                    : String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {rows.length > 10 && (
                    <div className="mt-2 text-xs text-white/70">
                      Showing first 10 rows — download CSV to get full data.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ParsedDataViewer;
