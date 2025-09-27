import ParsedData from "../models/ParsedData.js";

export const getChartData = async (req, res) => {
  try {
    const { uploadId, x, y } = req.body;

    if (!uploadId || !x || !y) {
      return res.status(400).json({
        success: false,
        message: "uploadId, x and y are required in the request body",
      });
    }

    const parsed = await ParsedData.findOne({ uploadId });

    if (!parsed || !parsed.data || parsed.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No parsed data found for the given upload ID",
      });
    }

    const chartData = parsed.data.map((row) => ({
      x: row[x],
      y: row[y],
    }));

    res.status(200).json({
      success: true,
      chartData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
