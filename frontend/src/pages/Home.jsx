import { Link } from "react-router-dom";

const SpreadsheetMock = () => (
  <div className="w-full max-w-md mx-auto sm:mx-0 sm:max-w-none">
    <div className="bg-white/95 rounded-xl shadow-xl overflow-hidden text-black">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center font-bold">
            X
          </div>
          <div>
            <div className="text-sm font-semibold">Workbook.xlsx</div>
            <div className="text-xs opacity-80">Sheet1 • 12 rows</div>
          </div>
        </div>
        <div className="text-xs opacity-90">Auto-saved</div>
      </div>

      <div className="p-4 bg-neutral-50 text-gray-800">
        <div className="overflow-auto">
          <table className="min-w-[560px] table-fixed border-collapse border border-gray-300">
            <thead>
              <tr>
                {["Date", "Product", "Units", "Price", "Revenue"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-green-800 border border-gray-300 bg-green-50"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["2025-06-01", "Widget A", 12, "$8.50", "$102.00"],
                ["2025-06-02", "Widget B", 7, "$15.00", "$105.00"],
                ["2025-06-03", "Widget C", 20, "$6.75", "$135.00"],
                ["2025-06-04", "Widget A", 5, "$8.50", "$42.50"],
                ["2025-06-05", "Widget B", 11, "$15.00", "$165.00"],
                ["2025-06-06", "Widget C", 8, "$6.75", "$54.00"],
              ].map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-green-50/40">
                  {r.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 text-sm border border-gray-300 text-right first:text-left"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-between items-center text-xs text-gray-600">
          <div>Showing 6 rows</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded bg-white/80 text-green-700 text-xs font-semibold shadow-sm">
              View full
            </button>
            <button className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold shadow">
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Feature = ({ title, desc, icon }) => (
  <div className="bg-white/5 rounded-xl p-4 flex gap-4 items-start">
    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
      {icon}
    </div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm opacity-80 mt-1">{desc}</div>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                Excel-style analytics,{" "}
                <span className="text-yellow-300">deployed</span>.
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Upload Excel files, parse sheets automatically, and turn rows
                into interactive charts — no spreadsheets app required. Fast
                parsing, secure storage, and beautiful visualizations.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Link
                  to="/upload-chart"
                  className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-3 rounded-lg shadow-lg transition"
                >
                  Upload Excel
                  <span className="text-sm opacity-90">(.xlsx)</span>
                </Link>

                <Link
                  to="/chart"
                  className="inline-flex items-center gap-3 border border-white/20 text-white px-5 py-3 rounded-lg hover:bg-white/5 transition"
                >
                  View Charts
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Feature
                  icon="🔒"
                  title="Secure"
                  desc="JWT auth, role based access, and private uploads."
                />
                <Feature
                  icon="⚡"
                  title="Fast parsing"
                  desc="Instant sheet-to-JSON parsing and storage."
                />
                <Feature
                  icon="🎨"
                  title="Beautiful charts"
                  desc="Bar, Line, Pie — with download & export options."
                />
                <Feature
                  icon="☁️"
                  title="Cloud-friendly"
                  desc="Optional Cloudinary / S3 for file storage."
                />
              </div>

              <div className="mt-8 text-sm text-white/80">
                <strong>Tip:</strong> Try the sample demo by uploading a small
                Excel file with Date & Sales columns — then render charts
                instantly.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SpreadsheetMock />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-white/80">Uploads</div>
                <div className="text-2xl font-bold mt-2">128</div>
                <div className="text-xs mt-1 text-white/70">
                  Active this month
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-white/80">Charts</div>
                <div className="text-2xl font-bold mt-2">342</div>
                <div className="text-xs mt-1 text-white/70">Generated</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap items-center gap-6 justify-center">
            <div className="text-sm text-white/70">Integrates with:</div>
            <div className="flex gap-4 items-center">
              <div className="px-3 py-2 bg-white/5 rounded text-sm">
                CSV / XLSX
              </div>
              {/* <div className="px-3 py-2 bg-white/5 rounded text-sm">
                Cloudinary
              </div> */}
              <div className="px-3 py-2 bg-white/5 rounded text-sm">
                MongoDB
              </div>
              {/* <div className="px-3 py-2 bg-white/5 rounded text-sm">
                Vercel / Render
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
