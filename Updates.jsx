those two important fields. Let me update the React component to include:

1. Scenario description display - Shows detailed description of selected workload
2. Service category multiselect - Allow users to select which service categories to compare

Updated React Component with Missing Fields

```jsx
// ScenarioAnalyzerTab.jsx - Updated with missing fields

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, MenuItem, Button, Typography,
  CircularProgress, Alert, Paper, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Divider,
  Tooltip, IconButton, LinearProgress, FormControlLabel, Checkbox,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MemoryIcon from '@mui/icons-material/Memory';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import DatabaseIcon from '@mui/icons-material/Storage';
import NetworkIcon from '@mui/icons-material/NetworkCheck';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import DescriptionIcon from '@mui/icons-material/Description';
import useAppStore from '../../../store/appStore';
import MetricCard from '../../shared/MetricCard';
import Plot from 'react-plotly.js';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

// Service category icons
const getCategoryIcon = (category) => {
  const lower = category.toLowerCase();
  if (lower.includes('compute')) return <MemoryIcon fontSize="small" />;
  if (lower.includes('storage')) return <StorageIcon fontSize="small" />;
  if (lower.includes('database')) return <DatabaseIcon fontSize="small" />;
  if (lower.includes('network')) return <NetworkIcon fontSize="small" />;
  if (lower.includes('security')) return <SecurityIcon fontSize="small" />;
  if (lower.includes('orchestration')) return <SpeedIcon fontSize="small" />;
  if (lower.includes('cdn')) return <CloudIcon fontSize="small" />;
  if (lower.includes('dns')) return <CloudIcon fontSize="small" />;
  if (lower.includes('waf')) return <SecurityIcon fontSize="small" />;
  return <CloudIcon fontSize="small" />;
};

// Provider color mapping
const PROVIDER_COLORS = {
  AWS: { bg: '#ff9900', text: '#fff', light: '#fff8f0' },
  Azure: { bg: '#0078d4', text: '#fff', light: '#f0f5fc' },
  GCP: { bg: '#4285f4', text: '#fff', light: '#f0f4fe' },
};

// Service categories available for all scenarios
const ALL_SERVICE_CATEGORIES = [
  'compute', 'orchestration', 'storage_input', 'storage_output', 
  'database_results', 'web_hosting', 'database', 'cache', 'storage',
  'cdn', 'dns', 'waf', 'load_balancing', 'message_queue', 'data_warehouse',
  'data_lake', 'ingestion', 'processing', 'container_orchestration',
  'api_gateway', 'observability'
];

// Helper to get display name for service category
const getCategoryDisplayName = (category) => {
  const names = {
    'compute': 'Compute',
    'orchestration': 'Orchestration',
    'storage_input': 'Input Storage',
    'storage_output': 'Output Storage',
    'database_results': 'Database',
    'web_hosting': 'Web Hosting',
    'database': 'Database',
    'cache': 'Cache',
    'storage': 'Storage',
    'cdn': 'CDN',
    'dns': 'DNS',
    'waf': 'WAF / Security',
    'load_balancing': 'Load Balancing',
    'message_queue': 'Message Queue',
    'data_warehouse': 'Data Warehouse',
    'data_lake': 'Data Lake',
    'ingestion': 'Data Ingestion',
    'processing': 'Data Processing',
    'container_orchestration': 'Container Orchestration',
    'api_gateway': 'API Gateway',
    'observability': 'Observability',
  };
  return names[category] || category.replace('_', ' ').toUpperCase();
};

export default function ScenarioAnalyzerTab({ openaiApiKey }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [typicalWorkloads, setTypicalWorkloads] = useState([]);
  const [workloadVolume, setWorkloadVolume] = useState('medium');
  const [selectedServiceCategories, setSelectedServiceCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch available scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await fetch('/api/scenario-analyzer/scenarios');
        const data = await response.json();
        setScenarios(data.scenarios);
        if (data.scenarios.length > 0) {
          setSelectedScenario(data.scenarios[0].key);
        }
      } catch (err) {
        console.error('Error fetching scenarios:', err);
        setError('Failed to load scenarios');
      }
    };
    fetchScenarios();
  }, []);

  // Fetch scenario details when selection changes
  useEffect(() => {
    const fetchScenarioDetails = async () => {
      if (!selectedScenario) return;
      
      try {
        const response = await fetch(`/api/scenario-analyzer/scenario-details?scenario_key=${selectedScenario}`);
        const data = await response.json();
        setScenarioDescription(data.description);
        setTypicalWorkloads(data.typical_workloads || []);
        setAvailableCategories(data.available_categories || []);
        
        // Default: select first 5 categories or all if less than 5
        const defaultCategories = (data.available_categories || []).slice(0, 5);
        setSelectedServiceCategories(defaultCategories);
      } catch (err) {
        console.error('Error fetching scenario details:', err);
      }
    };
    
    fetchScenarioDetails();
  }, [selectedScenario]);

  // Run analysis
  const handleAnalyze = async () => {
    if (!selectedScenario) return;
    
    setLoading(true);
    setError('');
    setAnalysisResult(null);
    
    try {
      const response = await fetch('/api/scenario-analyzer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_key: selectedScenario,
          workload_volume: workloadVolume,
          selected_services: selectedServiceCategories,
          api_key: openaiApiKey,
        }),
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle service category selection
  const toggleServiceCategory = (category) => {
    if (selectedServiceCategories.includes(category)) {
      setSelectedServiceCategories(selectedServiceCategories.filter(c => c !== category));
    } else {
      setSelectedServiceCategories([...selectedServiceCategories, category]);
    }
  };

  // Select all categories
  const selectAllCategories = () => {
    setSelectedServiceCategories([...availableCategories]);
  };

  // Clear all categories
  const clearAllCategories = () => {
    setSelectedServiceCategories([]);
  };

  // Get current scenario name for display
  const currentScenario = scenarios.find(s => s.key === selectedScenario);

  // Filter service comparison based on selected categories
  const filteredServiceComparison = analysisResult?.service_comparison?.filter(
    item => selectedServiceCategories.includes(item.service_category.toLowerCase().replace(/ /g, '_'))
  ) || [];

  // Chart data for cost comparison
  const costChartData = analysisResult?.cost_estimates ? [{
    type: 'bar',
    x: analysisResult.cost_estimates.map(c => c.provider),
    y: analysisResult.cost_estimates.map(c => c.estimated_monthly_cost),
    text: analysisResult.cost_estimates.map(c => fmt(c.estimated_monthly_cost)),
    textposition: 'outside',
    marker: {
      color: analysisResult.cost_estimates.map(c => PROVIDER_COLORS[c.provider]?.bg || '#666')
    },
  }] : [];

  // Download report as CSV
  const handleExportCSV = () => {
    if (!analysisResult) return;
    
    const rows = filteredServiceComparison.map(s => ({
      'Service Category': s.service_category,
      'AWS': s.aws,
      'Azure': s.azure,
      'GCP': s.gcp,
    }));
    
    const headers = ['Service Category', 'AWS', 'Azure', 'GCP'];
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += headers.map(h => `"${row[h]}"`).join(',') + '\n';
    });
    
    // Add cost estimates section
    csv += '\n\nEstimated Monthly Costs\n';
    csv += 'Provider,Estimated Monthly Cost\n';
    analysisResult.cost_estimates.forEach(cost => {
      csv += `${cost.provider},${cost.estimated_monthly_cost}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario_analysis_${analysisResult.scenario_name.replace(/\s/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>🎯 Migration Scenario Analyzer</Typography>
        <Typography variant="body2" color="text.secondary">
          Select your workload scenario and get optimized cloud service recommendations across AWS, Azure, and GCP.
        </Typography>
      </Box>

      {/* Configuration Panel */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#fafafa' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>📋 Scenario Configuration</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Workload Scenario"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              helperText="Select the type of workload you're planning to migrate"
            >
              {scenarios.map(s => (
                <MenuItem key={s.key} value={s.key}>{s.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Workload Volume"
              value={workloadVolume}
              onChange={(e) => setWorkloadVolume(e.target.value)}
              helperText="Expected scale of your workload"
            >
              <MenuItem value="low">Low (Light usage, dev/test)</MenuItem>
              <MenuItem value="medium">Medium (Moderate production)</MenuItem>
              <MenuItem value="high">High (Heavy production, enterprise)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Scenario Description Display - MISSING FIELD 1 */}
        {scenarioDescription && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DescriptionIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="bold">Scenario Description</Typography>
            </Box>
            <Typography variant="body2">{scenarioDescription}</Typography>
            {typicalWorkloads.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {typicalWorkloads.map((workload, idx) => (
                  <Chip key={idx} label={workload} size="small" variant="outlined" />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Service Category Selection - MISSING FIELD 2 */}
        {availableCategories.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                <FilterListIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} fontSize="small" />
                Service Categories to Compare
              </Typography>
              <Box>
                <Button size="small" onClick={selectAllCategories} sx={{ mr: 1 }}>Select All</Button>
                <Button size="small" onClick={clearAllCategories}>Clear All</Button>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Choose which service categories to include in the comparison table
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableCategories.map(category => (
                <Chip
                  key={category}
                  label={getCategoryDisplayName(category)}
                  onClick={() => toggleServiceCategory(category)}
                  color={selectedServiceCategories.includes(category) ? 'primary' : 'default'}
                  variant={selectedServiceCategories.includes(category) ? 'filled' : 'outlined'}
                  icon={getCategoryIcon(category)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Selected: {selectedServiceCategories.length} of {availableCategories.length} categories
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleAnalyze}
            disabled={loading || !selectedScenario}
            startIcon={loading ? <CircularProgress size={20} /> : <SpeedIcon />}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Analyzing...' : 'Analyze Migration'}
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Loading Progress */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Analyzing your workload scenario...
          </Typography>
        </Box>
      )}

      {/* Results Section */}
      {analysisResult && !loading && (
        <>
          {/* Scenario Description Card */}
          <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{analysisResult.scenario_name}</Typography>
              <Typography variant="body2" color="text.secondary">{analysisResult.description}</Typography>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {analysisResult.typical_workloads.map((workload, idx) => (
                  <Chip key={idx} label={workload} size="small" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Service Comparison Table - Filtered by selected categories */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📊 Service Comparison by Provider ({filteredServiceComparison.length} categories selected)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#1976d2' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Service Category</TableCell>
                  <TableCell sx={{ color: '#ff9900', fontWeight: 'bold' }}>AWS</TableCell>
                  <TableCell sx={{ color: '#0078d4', fontWeight: 'bold' }}>Azure</TableCell>
                  <TableCell sx={{ color: '#4285f4', fontWeight: 'bold' }}>GCP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServiceComparison.map((row, idx) => (
                  <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.service_category}</TableCell>
                    <TableCell>{row.aws}</TableCell>
                    <TableCell>{row.azure}</TableCell>
                    <TableCell>{row.gcp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Cost Comparison */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>💰 Estimated Monthly Costs</Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Plot
                  data={costChartData}
                  layout={{
                    title: `Cost Comparison (${workloadVolume.charAt(0).toUpperCase() + workloadVolume.slice(1)} Volume)`,
                    height: 350,
                    margin: { t: 40, b: 40, l: 60, r: 20 },
                    xaxis: { tickfont: { size: 10 } },
                    yaxis: { title: 'USD/month', tickfont: { size: 10 } },
                  }}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {analysisResult.cost_estimates.map((cost, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: PROVIDER_COLORS[cost.provider]?.light || '#f5f5f5',
                        borderLeft: `4px solid ${PROVIDER_COLORS[cost.provider]?.bg}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">{cost.provider}</Typography>
                        <Typography variant="h5" fontWeight="bold" color={PROVIDER_COLORS[cost.provider]?.bg}>
                          {fmt(cost.estimated_monthly_cost)}
                          <Typography component="span" variant="caption" color="text.secondary">/month</Typography>
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          {/* Strategy and Tips */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="subtitle2" fontWeight="bold">Recommended Strategy</Typography>
                </Box>
                <Typography variant="body2">{analysisResult.recommended_strategy}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon color="warning" />
                  <Typography variant="subtitle2" fontWeight="bold">Cost Saving Tips</Typography>
                </Box>
                <Typography variant="body2">{analysisResult.cost_saving_tips}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Export Section */}
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              size="small"
            >
              Export Comparison as CSV
            </Button>
          </Paper>
        </>
      )}

      {/* Empty State */}
      {!analysisResult && !loading && !error && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
          <SpeedIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Ready to analyze</Typography>
          <Typography variant="body2" color="text.secondary">
            Select a workload scenario, choose service categories, and click "Analyze Migration" to get cloud service recommendations.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
```

Updated Backend API - Add Scenario Details Endpoint

```python
# Add to your main.py

@app.get("/api/scenario-analyzer/scenario-details")
async def get_scenario_details(scenario_key: str):
    """Get details for a specific scenario"""
    
    scenario_data = SCENARIO_MAPPINGS.get(scenario_key)
    if not scenario_data:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Get available service categories from the scenario
    available_categories = list(scenario_data["services"].keys())
    
    return {
        "description": scenario_data["description"],
        "typical_workloads": scenario_data["typical_workloads"],
        "available_categories": available_categories
    }
```

Summary of Added Features

Feature Description
Scenario Description Display Shows detailed description and typical workloads when a scenario is selected
Service Category Multiselect Chip-based selection with Select All/Clear All buttons
Filtered Comparison Table Only shows selected service categories in results
Dynamic Category Loading Categories are loaded based on selected scenario

Now users can:

1. Read the scenario description before analyzing
2. Choose which service categories they want to compare
3. See only relevant services in the comparison table

This matches the Python version's functionality!
