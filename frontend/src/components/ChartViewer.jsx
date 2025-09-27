import { useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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

const downloadSVGAsPNG = async (svgEl, filename = "chart.png", scale = 2) => {
  if (!svgEl) throw new Error("SVG element not found");

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgEl);

  if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
    svgString = svgString.replace(
      /^<svg/,
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }
  if (!svgString.match(/^<svg[^>]+"http:\/\/www.w3.org\/1999\/xlink"/)) {
    svgString = svgString.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  const styleSheets = Array.from(document.styleSheets)
    .map((ss) => {
      try {
        return ss.cssRules
          ? Array.from(ss.cssRules)
              .map((r) => r.cssText)
              .join("")
          : "";
      } catch (e) {
        return "";
      }
    })
    .join("\n");

  const svgWithStyle = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <style><![CDATA[${styleSheets}]]></style>
      ${svgString.replace(/^<svg[^>]*>|<\/svg>$/g, "")}
    </svg>
  `;

  const img = new Image();
  const svgBlob = new Blob([svgWithStyle], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to convert canvas to blob"));
            return;
          }
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);
          resolve();
        }, "image/png");
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG as image"));
    };
    img.src = url;
  });
};

const ChartViewer = ({ data = [], type = "line", xKey = "x", yKey = "y" }) => {
  const containerRef = useRef(null);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <p className="text-center text-gray-600">
          No data available to display the chart.
        </p>
      </div>
    );
  }

  const normalized = data.map((row) => {
    if (row.hasOwnProperty(xKey) || row.hasOwnProperty(yKey)) return row;
    const keys = Object.keys(row);
    return { x: row[keys[0]], y: row[keys[1]], ...row };
  });

  let pieData = [];
  if (type === "pie") {
    const map = new Map();
    normalized.forEach((r) => {
      const name = r[xKey] ?? r.x ?? "";
      const val = Number(r[yKey] ?? r.y ?? 0) || 0;
      map.set(name, (map.get(name) || 0) + val);
    });
    pieData = Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#f97316",
  ];

  const handleDownloadCSV = () => {
    try {
      const csv = toCSV(normalized);
      downloadBlob(csv, `chart_data_${Date.now()}.csv`, "text/csv");
      toast.success("CSV downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download CSV");
    }
  };

  const handleDownloadPNG = async () => {
    try {
      const el = containerRef.current;
      if (!el) throw new Error("Chart container not found");
      const svg = el.querySelector("svg");
      if (!svg) throw new Error("No SVG found inside chart");
      await downloadSVGAsPNG(svg, `chart_${Date.now()}.png`, 2);
      toast.success("Chart PNG downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PNG: " + (err.message || ""));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-gray-800">Chart</h4>
          <span className="text-xs text-gray-500">({type.toUpperCase()})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-md hover:bg-yellow-300"
          >
            ⤓ CSV
          </button>
          <button
            onClick={handleDownloadPNG}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            ⤓ PNG
          </button>
        </div>
      </div>

      <div ref={containerRef} style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={normalized}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yKey} fill="#3b82f6" />
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={normalized}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke="#3b82f6"
                fill="#bfdbfe"
              />
            </AreaChart>
          ) : type === "pie" ? (
            <PieChart>
              <Tooltip />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                fill="#3b82f6"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <LineChart data={normalized}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartViewer;
