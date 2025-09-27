import { useRef, useState } from "react";
import API from "../api";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
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

const ColumnLetter = ({ idx }) => {
  const letter = (n) => {
    let s = "";
    while (n >= 0) {
      s = String.fromCharCode((n % 26) + 65) + s;
      n = Math.floor(n / 26) - 1;
    }
    return s;
  };
  return (
    <div className="px-2 py-1 text-xs font-semibold text-gray-600">
      {letter(idx)}
    </div>
  );
};

const UploadAndChart = () => {
  const [file, setFile] = useState(null);
  const [uploadId, setUploadId] = useState("");
  const [columns, setColumns] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  const handleFilePick = (f) => {
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an .xlsx file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await API.post("/excel/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const id = res?.data?.uploadId;
      if (!id) throw new Error("No uploadId returned from server.");
      setUploadId(id);

      const parsedRes = await API.get(`/excel/data/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const rows = parsedRes?.data?.data ?? parsedRes?.data ?? [];
      if (!Array.isArray(rows) || rows.length === 0) {
        setColumns([]);
        setParsedRows([]);
        toast.error("No data found in the uploaded Excel file.");
        return;
      }

      setParsedRows(rows);
      setColumns(Object.keys(rows[0]));
      setX("");
      setY("");
      setChartData(null);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        "Upload failed: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRenderChart = async () => {
    if (!uploadId || !x || !y) {
      toast.error("Please upload/select a file and choose X and Y columns.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(
        "/chart/get",
        { uploadId, x, y },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const raw = res?.data?.chartData;
      if (!Array.isArray(raw)) {
        toast.error("Server returned unexpected chartData.");
        return;
      }

      const labels = raw.map((p) => (p?.x === undefined ? "" : p.x));
      const dataPoints = raw.map((p) => (p?.y === undefined ? null : p.y));

      const newChart = {
        labels: Array.isArray(labels) ? labels : [],
        datasets: [
          {
            label: `${y} vs ${x}`,
            data: Array.isArray(dataPoints) ? dataPoints : [],
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderRadius: 6,
          },
        ],
      };

      setChartData(newChart);
    } catch (err) {
      console.error("Chart fetch error:", err);
      toast.error(
        "Failed to fetch chart data: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadChart = () => {
    try {
      const chart = chartRef.current;
      const toBase64 =
        chart?.toBase64Image?.() ||
        chart?.getChart?.()?.toBase64Image?.() ||
        null;
      if (toBase64) {
        const a = document.createElement("a");
        a.href = toBase64;
        a.download = `${y}_vs_${x}.png`;
        a.click();
      } else {
        toast.error(
          "Could not export chart image programmatically. Try right-click on the chart and 'Save image as...'"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to download chart image.");
    }
  };

  const handleDownloadCSV = () => {
    if (!parsedRows || parsedRows.length === 0) {
      toast.error("No parsed rows to download.");
      return;
    }
    const csv = toCSV(parsedRows);
    downloadBlob(csv, `parsed_upload_${uploadId || "local"}.csv`, "text/csv");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Upload Excel</h3>

          <div className="mb-3">
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => handleFilePick(e.target.files?.[0])}
              className="block w-full text-sm text-gray-800 file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0 file:text-sm file:font-semibold
                          file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white cursor-pointer"
            />
            <div className="text-xs text-white/70 mt-2">
              Select a .xlsx file. Only first sheet is parsed.
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 py-2 rounded-md font-semibold shadow hover:scale-[1.01] transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload & Parse"}
          </button>

          <div className="mt-6 space-y-2">
            <div className="text-sm text-white/80">Upload ID</div>
            <div className="bg-white/5 p-2 rounded text-sm break-all">
              {uploadId || "—"}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDownloadCSV}
                className="flex-1 bg-yellow-400 text-black py-2 rounded font-semibold hover:bg-yellow-300"
              >
                Download CSV
              </button>
              <button
                onClick={handleDownloadChart}
                className="flex-1 bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600"
                disabled={!chartData}
              >
                Download Chart
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            Preview & Chart Builder
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                X - Column
              </label>
              <select
                value={x}
                onChange={(e) => setX(e.target.value)}
                className="w-full p-2 rounded bg-white/90 text-black"
              >
                <option value="">Select X column</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/80 mb-1 block">
                Y - Column
              </label>
              <select
                value={y}
                onChange={(e) => setY(e.target.value)}
                className="w-full p-2 rounded bg-white/90 text-black"
              >
                <option value="">Select Y column</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRenderChart}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 py-2 rounded font-semibold"
              >
                {loading ? "Generating..." : "Render Chart"}
              </button>
            </div>
          </div>

          <div className="bg-neutral-50 text-gray-800 rounded overflow-auto border border-gray-200 mb-4">
            <div className="flex items-center bg-gray-100 border-b border-gray-200">
              <div className="w-10 border-r border-gray-200 text-xs px-2 py-2">
                #
              </div>
              {columns.map((col, i) => (
                <div
                  key={i}
                  className="min-w-[140px] px-3 py-2 text-xs font-semibold border-r border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>{col}</div>
                    <div className="text-xs text-gray-500"></div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              {parsedRows.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No preview available — upload a file to see parsed rows.
                </div>
              ) : (
                parsedRows.slice(0, 10).map((row, rIdx) => (
                  <div
                    key={rIdx}
                    className={`flex items-center border-b border-gray-100 ${
                      rIdx % 2 === 0 ? "bg-white" : "bg-white/90"
                    }`}
                  >
                    <div className="w-10 border-r border-gray-200 px-2 py-2 text-xs text-gray-600">
                      {rIdx + 1}
                    </div>
                    {columns.map((col, cIdx) => (
                      <div
                        key={cIdx}
                        className="min-w-[140px] px-3 py-2 text-sm border-r border-gray-100 truncate"
                      >
                        {String(row[col] ?? "")}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {parsedRows.length > 10 && (
              <div className="p-3 text-xs text-gray-600">
                Showing first 10 rows — download CSV to get full data.
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded text-black">
            <h4 className="font-semibold mb-3">
              {chartData ? `${y} vs ${x}` : "Chart preview"}
            </h4>

            {chartData &&
            Array.isArray(chartData.labels) &&
            Array.isArray(chartData.datasets) ? (
              <div>
                <Bar
                  ref={chartRef}
                  key={`${x}-${y}-${chartData.labels.length}`}
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: "#111" } },
                      y: { ticks: { color: "#111" } },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="p-6 text-center text-gray-600">
                No chart to display — choose X and Y and click Render Chart.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAndChart;
