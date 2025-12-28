# Investor Relations Data Management Tool

A comprehensive web-based tool for managing investor relations data points and automatically generating charts for PowerPoint and Word export.

## Features

### 📊 Data Point Management
- **Add/Edit/Delete Data Points**: Manage key metrics and KPIs
- **Categories**: Organize data by Financial Metrics, Operational KPIs, Growth Metrics, or Custom Metrics
- **Time Series Data**: Track metrics over multiple time periods
- **Auto-calculations**: Automatic calculation of changes and growth percentages

### 📈 Chart Generation
- **Multiple Chart Types**: Line, Bar, Pie, Doughnut, and Area charts
- **Interactive Charts**: Powered by Chart.js with hover tooltips
- **Multi-metric Charts**: Combine multiple data points in a single chart
- **Real-time Updates**: Charts automatically refresh when data changes

### 📤 Export Functionality
- **PowerPoint Export**: 
  - Automatic slide generation with charts embedded as images
  - Title slide with generation date
  - Key metrics summary table
  - Individual slides for each chart
  - Detailed data point slides with mini-charts
- **Word Export**: 
  - Comprehensive report with all metrics
  - Formatted tables and data summaries
  - Professional document layout

## Getting Started

### Opening the Tool
1. Open `investor-relations.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. The tool loads with sample data to help you get started
3. All data is stored locally in your browser (localStorage)

### Adding a Data Point
1. Click the "Add Data Point" button
2. Fill in the metric details:
   - **Metric Name**: e.g., "Revenue", "Active Users"
   - **Category**: Select the appropriate category
   - **Unit**: e.g., "$M", "%", "K"
   - **Time Series Data**: Add period/value pairs (e.g., Q1 2024: 72.1)
   - **Description**: Optional context or notes
3. Click "Save Data Point"

### Creating a Chart
1. Click the "Add Chart" button
2. Enter chart details:
   - **Chart Title**: Name for your chart
   - **Chart Type**: Select from available types
   - **Select Data Points**: Check the metrics to include
   - **Description**: Optional insights or notes
3. Click "Create Chart"

### Exporting to PowerPoint
1. Ensure you have at least one chart created
2. Click the "Export PPTX" button in the header
3. The PowerPoint file will download automatically
4. Open in Microsoft PowerPoint or Google Slides

### Exporting to Word
1. Click the "Export DOCX" button in the header
2. The Word document will download as a .doc file
3. Open in Microsoft Word or Google Docs

## Data Structure

Each data point contains:
- **ID**: Unique identifier
- **Name**: Metric name
- **Category**: Classification (financial/operational/growth/custom)
- **Unit**: Measurement unit
- **Description**: Additional context
- **Time Series**: Array of period/value pairs

Example:
```json
{
  "id": "1",
  "name": "Revenue",
  "category": "financial",
  "unit": "$M",
  "description": "Total company revenue",
  "timeSeries": [
    { "period": "Q1 2024", "value": 72.1 },
    { "period": "Q2 2024", "value": 78.5 }
  ]
}
```

## Tips for Best Results

### Data Entry
- Use consistent period naming (e.g., "Q1 2024", "Q2 2024")
- Ensure time series data is chronological
- Use clear, descriptive metric names

### Charts
- Line charts work best for time series trends
- Bar charts are ideal for comparing values
- Pie/Doughnut charts are best for proportion data
- Combine related metrics in multi-line charts for comparison

### Export
- Create multiple charts to populate your pitch deck
- Use descriptive chart titles that work in presentations
- Review exported PowerPoint before important meetings
- The PowerPoint export creates a complete deck structure

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Note: The tool uses modern JavaScript features. Ensure your browser is up to date.

## Data Persistence

- All data is stored locally in your browser using localStorage
- Data persists between sessions
- To reset all data, clear your browser's localStorage for this site
- Consider exporting important data regularly as backup

## Keyboard Shortcuts

- `Esc`: Close active modal
- `Enter` (in forms): Submit form
- `Tab`: Navigate between form fields

## Troubleshooting

### Charts not displaying
- Ensure you have at least one data point with time series data
- Check that the selected data points have matching periods
- Refresh the charts using the "Refresh Charts" button

### Export not working
- Ensure you have created at least one chart for PowerPoint export
- Check browser download permissions
- Try a different browser if issues persist

### Data not saving
- Check browser localStorage is enabled
- Ensure you have sufficient browser storage space
- Try clearing browser cache if issues persist

## Support

For issues or questions:
1. Check browser console for error messages (F12)
2. Ensure all required fields are filled
3. Verify browser compatibility

## License

This tool is provided as-is for investor relations use.

---

**Note**: This tool runs entirely in your browser. No data is sent to external servers. All processing happens locally on your device.


