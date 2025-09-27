import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API, { setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";
import ChartViewer from "../components/ChartViewer";
import toast from "react-hot-toast";

const Chart = () => {
  const { token } = useContext(AuthContext);
  const [uploads, setUploads] = useState([]);
  const [uploadId, setUploadId] = useState("");
  const [columns, setColumns] = useState([]);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      setAuthToken(token);
      fetchUploads();
    }
  }, [token, navigate]);

  const fetchUploads = async () => {
    try {
      const res = await API.get("/excel/uploads");
      setUploads(res.data.uploads || []);
    } catch (error) {
      toast.error("Failed to load uploads.");
    }
  };

  const handleUploadChange = async (id) => {
    setUploadId(id);
    try {
      const res = await API.get(`/excel/data/${id}`);
      if (
        res.data.success &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        setColumns(Object.keys(res.data.data[0]));
      } else {
        toast.error("No data found in this upload.");
      }
    } catch (err) {
      toast.error("Error loading columns.");
    }
  };

  const handleGenerateChart = async () => {
    if (!uploadId || !x || !y) {
      toast.error("Please select file, X, and Y axes.");
      return;
    }

    try {
      const res = await API.post("/chart/get", { uploadId, x, y });
      const data = res.data.chartData;

      if (!Array.isArray(data) || data.length === 0) {
        toast.error("No chart data available.");
        return;
      }

      setChartData(data);
      toast.success("Chart generated successfully!");
    } catch (err) {
      toast.error("Error loading chart data.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-t-xl shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">Excel Analytics Dashboard</h1>
          <span className="text-sm opacity-80">Interactive Chart Builder</span>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-b-xl border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Select File & Axes
          </h2>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Choose Uploaded Excel File
            </label>
            <select
              value={uploadId}
              onChange={(e) => handleUploadChange(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-400"
            >
              <option value="">-- Select Excel Upload --</option>
              {uploads.map((file) => (
                <option key={file._id} value={file._id}>
                  {file.originalName}
                </option>
              ))}
            </select>
          </div>

          {columns.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    X-Axis
                  </label>
                  <select
                    value={x}
                    onChange={(e) => setX(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">-- Select Column --</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Y-Axis
                  </label>
                  <select
                    value={y}
                    onChange={(e) => setY(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">-- Select Column --</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    <option value="pie">Pie</option>
                    <option value="doughnut">Doughnut</option>
                    <option value="radar">Radar</option>
                    <option value="polarArea">Polar Area</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateChart}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition cursor-pointer"
              >
                Generate Chart
              </button>
            </>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="bg-white mt-6 p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Chart Preview ({y} vs {x})
            </h3>
            <ChartViewer data={chartData} type={chartType} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
