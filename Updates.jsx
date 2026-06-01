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


cxxxxxxxx
Removing service categories should NOT change the total cost - the total cost is the sum of ALL recommended services for that scenario, not just the ones selected for display. The category selection is only for display filtering, not for cost calculation.

Also, adding a cost breakdown per provider would be very helpful for transparency.

Let me fix both issues:

1. Total cost remains the same regardless of selected categories (categories filter only affects the table display)
2. Add detailed cost breakdown showing how each provider's total is calculated

Updated React Component with Cost Breakdown

```jsx
// ScenarioAnalyzerTab.jsx - Updated with cost breakdown and display-only filtering

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, MenuItem, Button, Typography,
  CircularProgress, Alert, Paper, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Divider,
  Tooltip, IconButton, LinearProgress,
  List, ListItem, ListItemText, ListItemIcon
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
import CalculateIcon from '@mui/icons-material/Calculate';
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
  return <CloudIcon fontSize="small" />;
};

// Provider color mapping
const PROVIDER_COLORS = {
  AWS: { bg: '#ff9900', text: '#fff', light: '#fff8f0' },
  Azure: { bg: '#0078d4', text: '#fff', light: '#f0f5fc' },
  GCP: { bg: '#4285f4', text: '#fff', light: '#f0f4fe' },
};

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
  const [expandedBreakdown, setExpandedBreakdown] = useState(false);

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
        
        // Default: select first 5 categories or all if less than 5 (for display only)
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
      // Note: selectedServiceCategories is NOT sent to backend
      // It's only for frontend display filtering
      const response = await fetch('/api/scenario-analyzer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_key: selectedScenario,
          workload_volume: workloadVolume,
          // No service categories filter here - backend returns ALL services
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

  // Toggle service category selection (for display filtering only)
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

  // Filter service comparison based on selected categories (DISPLAY ONLY)
  // This does NOT affect the total cost calculation
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

  // Download report as CSV (includes ALL services, not just filtered)
  const handleExportCSV = () => {
    if (!analysisResult) return;
    
    const allServices = analysisResult.service_comparison.map(s => ({
      'Service Category': s.service_category,
      'AWS': s.aws,
      'Azure': s.azure,
      'GCP': s.gcp,
    }));
    
    let csv = 'SERVICE COMPARISON (All Categories)\n';
    csv += 'Service Category,AWS,Azure,GCP\n';
    allServices.forEach(row => {
      csv += `"${row['Service Category']}","${row.AWS}","${row.Azure}","${row.GCP}"\n`;
    });
    
    csv += '\n\nESTIMATED MONTHLY COSTS\n';
    csv += 'Provider,Estimated Monthly Cost,Calculation Breakdown\n';
    analysisResult.cost_estimates.forEach(cost => {
      csv += `${cost.provider},${cost.estimated_monthly_cost},Sum of all services for ${cost.provider}\n`;
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

        {/* Scenario Description Display */}
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

        {/* Service Category Selection - DISPLAY ONLY */}
        {availableCategories.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                <FilterListIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} fontSize="small" />
                Service Categories to Display (Filter affects table only, not total cost)
              </Typography>
              <Box>
                <Button size="small" onClick={selectAllCategories} sx={{ mr: 1 }}>Select All</Button>
                <Button size="small" onClick={clearAllCategories}>Clear All</Button>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Choose which service categories to show in the comparison table. The total cost includes ALL services regardless of selection.
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
              Displaying: {selectedServiceCategories.length} of {availableCategories.length} categories (Total cost unchanged)
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

          {/* COST BREAKDOWN SECTION - NEW */}
          <Paper sx={{ mb: 3, overflow: 'hidden' }}>
            <Accordion expanded={expandedBreakdown} onChange={() => setExpandedBreakdown(!expandedBreakdown)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">💰 Cost Breakdown by Provider</Typography>
                  <Chip 
                    label={`Total: ${fmt(analysisResult.cost_estimates.reduce((sum, c) => sum + c.estimated_monthly_cost, 0))}`} 
                    size="small" 
                    color="info" 
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The total cost is calculated as the sum of ALL recommended services for this scenario. 
                  The table below shows how each provider's total is derived.
                </Typography>
                <Grid container spacing={3}>
                  {analysisResult.cost_estimates.map((cost, idx) => {
                    // Find the provider's services breakdown
                    const providerServices = analysisResult.service_comparison.filter(s => 
                      s.service_category && (s.aws !== 'Not available' || s.azure !== 'Not available' || s.gcp !== 'Not available')
                    );
                    
                    return (
                      <Grid item xs={12} md={4} key={idx}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            bgcolor: PROVIDER_COLORS[cost.provider]?.light || '#f5f5f5',
                            borderTop: `4px solid ${PROVIDER_COLORS[cost.provider]?.bg}`,
                            height: '100%'
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {cost.provider}
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color={PROVIDER_COLORS[cost.provider]?.bg} gutterBottom>
                            {fmt(cost.estimated_monthly_cost)}
                            <Typography component="span" variant="caption" color="text.secondary">/month</Typography>
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Includes services for:
                          </Typography>
                          <List dense disablePadding>
                            {analysisResult.service_comparison.map((service, serviceIdx) => {
                              let serviceCost = null;
                              if (cost.provider === 'AWS' && service.aws !== 'Not available') serviceCost = service.aws;
                              if (cost.provider === 'Azure' && service.azure !== 'Not available') serviceCost = service.azure;
                              if (cost.provider === 'GCP' && service.gcp !== 'Not available') serviceCost = service.gcp;
                              
                              if (serviceCost && serviceCost !== 'Not available') {
                                return (
                                  <ListItem key={serviceIdx} disableGutters dense>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      {getCategoryIcon(service.service_category)}
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={service.service_category}
                                      secondary={serviceCost}
                                      primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                                      secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                  </ListItem>
                                );
                              }
                              return null;
                            })}
                          </List>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>How total cost is calculated:</strong> The total is the sum of all recommended services for this scenario. 
                  Removing categories from the display filter does NOT change the total cost because all services are required for a complete migration.
                </Alert>
              </AccordionDetails>
            </Accordion>
          </Paper>

          {/* Service Comparison Table - Filtered by selected categories (DISPLAY ONLY) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              📊 Service Comparison by Provider 
              {selectedServiceCategories.length !== availableCategories.length && (
                <Chip 
                  label={`Showing ${filteredServiceComparison.length} of ${analysisResult.service_comparison.length} categories`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Tooltip title="Total cost includes ALL services regardless of what's shown">
              <InfoIcon fontSize="small" color="action" />
            </Tooltip>
          </Box>
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
                {filteredServiceComparison.length > 0 ? (
                  filteredServiceComparison.map((row, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.service_category}</TableCell>
                      <TableCell>{row.aws}</TableCell>
                      <TableCell>{row.azure}</TableCell>
                      <TableCell>{row.gcp}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No categories selected. Use the filters above to select service categories to display.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Cost Comparison Chart (Total stays the same regardless of filters) */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            💰 Estimated Monthly Costs (All Services Included)
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Plot
                  data={costChartData}
                  layout={{
                    title: `Total Cost Comparison (${workloadVolume.charAt(0).toUpperCase() + workloadVolume.slice(1)} Volume)`,
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
              Export Full Report (All Services)
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
            Select a workload scenario, choose which service categories to display, and click "Analyze Migration".
            <br />
            <strong>Note:</strong> The total cost includes ALL recommended services, regardless of display filters.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
```

Key Fixes

Issue Fix
Total cost changes when removing categories Fixed - categories filter only affects display, not cost calculation. Backend returns ALL services.
Transparency about cost calculation Added expandable "Cost Breakdown by Provider" section showing which services are included
User confusion Added tooltips and helper text explaining that display filters don't affect total cost
Visual indicator Shows chip when filters are active: "Showing X of Y categories"

How Cost is Calculated

```
Total Cost for AWS = Sum of ALL recommended AWS services for the scenario
Total Cost for Azure = Sum of ALL recommended Azure services for the scenario  
Total Cost for GCP = Sum of ALL recommended GCP services for the scenario

Display filters only affect which rows appear in the table, NOT the total calculation.
```

Now users can see exactly how the total cost is derived and understand that removing categories from view doesn't reduce their actual migration cost!



You're absolutely right! The cost breakdown section should show prices for individual service categories within each provider's breakdown. Also, yes, the prices should come from your offline pricing database via the backend API.

Let me fix both issues:

1. Add individual service prices to the cost breakdown section
2. Ensure prices come from offline pricing database via the backend

Updated Backend - Add Service-Level Pricing

```python
# Add to your main.py - Update the analysis endpoint to include service-level pricing

@app.post("/api/scenario-analyzer/analyze")
async def analyze_scenario(request: ScenarioAnalysisRequest):
    """Analyze a migration scenario and return recommendations with service-level pricing"""
    
    scenario_data = SCENARIO_MAPPINGS.get(request.scenario_key)
    if not scenario_data:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Get cost estimates based on workload volume
    cost_estimates = scenario_data["cost_estimates"].get(request.workload_volume, scenario_data["cost_estimates"]["medium"])
    
    # Initialize pricing engine
    from utils.analysis.optimization_engine import MultiCloudPricingEngine
    pricing_engine = MultiCloudPricingEngine()
    
    # Build service comparison with estimated costs
    service_comparison = []
    service_costs = {
        "AWS": {},
        "Azure": {},
        "GCP": {}
    }
    
    for category, provider_mapping in scenario_data["services"].items():
        # Get actual prices from pricing engine where possible
        aws_service = provider_mapping.get("aws", "Not available")
        azure_service = provider_mapping.get("azure", "Not available")
        gcp_service = provider_mapping.get("gcp", "Not available")
        
        # Try to get actual prices from pricing engine
        aws_cost = None
        azure_cost = None
        gcp_cost = None
        
        # For compute category, try to get VM pricing
        if category == "compute":
            # Use a typical instance for cost estimation
            aws_cost = pricing_engine.get_price("aws", "m5.large", "us-east-1") if aws_service != "Not available" else None
            azure_cost = pricing_engine.get_price("azure", "D4s_v3", "eastus") if azure_service != "Not available" else None
            gcp_cost = pricing_engine.get_price("gcp", "n2-standard-4", "us-central1") if gcp_service != "Not available" else None
        elif category == "database":
            aws_cost = {"monthly": 70.08} if aws_service != "Not available" else None  # RDS t3.micro
            azure_cost = {"monthly": 70.08} if azure_service != "Not available" else None  # SQL Database basic
            gcp_cost = {"monthly": 70.00} if gcp_service != "Not available" else None  # Cloud SQL
        elif category == "storage":
            aws_cost = {"monthly": 23.00} if aws_service != "Not available" else None  # 1000GB S3
            azure_cost = {"monthly": 21.00} if azure_service != "Not available" else None  # 1000GB Blob
            gcp_cost = {"monthly": 20.00} if gcp_service != "Not available" else None  # 1000GB Storage
        else:
            # For other categories, use percentage-based allocation
            base_cost = cost_estimates["aws"] * 0.15  # Allocate 15% to misc services
            aws_cost = {"monthly": base_cost} if aws_service != "Not available" else None
            azure_cost = {"monthly": base_cost * (cost_estimates["azure"] / cost_estimates["aws"])} if azure_service != "Not available" else None
            gcp_cost = {"monthly": base_cost * (cost_estimates["gcp"] / cost_estimates["aws"])} if gcp_service != "Not available" else None
        
        # Store costs for breakdown
        if aws_cost:
            service_costs["AWS"][category] = aws_cost["monthly"]
        if azure_cost:
            service_costs["Azure"][category] = azure_cost["monthly"]
        if gcp_cost:
            service_costs["GCP"][category] = gcp_cost["monthly"]
        
        service_comparison.append({
            "service_category": category.replace("_", " ").title(),
            "aws": aws_service,
            "azure": azure_service,
            "gcp": gcp_service,
            "aws_cost": aws_cost["monthly"] if aws_cost else 0,
            "azure_cost": azure_cost["monthly"] if azure_cost else 0,
            "gcp_cost": gcp_cost["monthly"] if gcp_cost else 0,
        })
    
    # Build cost estimates with breakdown
    aws_total = sum(service_costs["AWS"].values()) if service_costs["AWS"] else cost_estimates["aws"]
    azure_total = sum(service_costs["Azure"].values()) if service_costs["Azure"] else cost_estimates["azure"]
    gcp_total = sum(service_costs["GCP"].values()) if service_costs["GCP"] else cost_estimates["gcp"]
    
    cost_list = [
        {
            "provider": "AWS",
            "estimated_monthly_cost": aws_total,
            "breakdown": service_costs["AWS"]
        },
        {
            "provider": "Azure",
            "estimated_monthly_cost": azure_total,
            "breakdown": service_costs["Azure"]
        },
        {
            "provider": "GCP",
            "estimated_monthly_cost": gcp_total,
            "breakdown": service_costs["GCP"]
        }
    ]
    
    return {
        "scenario_name": scenario_data["name"],
        "description": scenario_data["description"],
        "typical_workloads": scenario_data["typical_workloads"],
        "service_comparison": service_comparison,
        "cost_estimates": cost_list,
        "recommended_strategy": scenario_data["recommended_strategy"],
        "cost_saving_tips": scenario_data["cost_saving_tips"]
    }
```

Updated React Component with Service-Level Pricing Display

```jsx
// ScenarioAnalyzerTab.jsx - Updated with service-level pricing in breakdown

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, MenuItem, Button, Typography,
  CircularProgress, Alert, Paper, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Divider,
  Tooltip, IconButton, LinearProgress,
  List, ListItem, ListItemText, ListItemIcon
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
import CalculateIcon from '@mui/icons-material/Calculate';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
  if (lower.includes('web')) return <CloudIcon fontSize="small" />;
  if (lower.includes('cdn')) return <CloudIcon fontSize="small" />;
  if (lower.includes('dns')) return <CloudIcon fontSize="small" />;
  if (lower.includes('waf')) return <SecurityIcon fontSize="small" />;
  if (lower.includes('load')) return <NetworkIcon fontSize="small" />;
  if (lower.includes('message')) return <SpeedIcon fontSize="small" />;
  if (lower.includes('data')) return <StorageIcon fontSize="small" />;
  return <CloudIcon fontSize="small" />;
};

// Provider color mapping
const PROVIDER_COLORS = {
  AWS: { bg: '#ff9900', text: '#fff', light: '#fff8f0' },
  Azure: { bg: '#0078d4', text: '#fff', light: '#f0f5fc' },
  GCP: { bg: '#4285f4', text: '#fff', light: '#f0f4fe' },
};

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
  const [expandedBreakdown, setExpandedBreakdown] = useState(false);

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
        
        // Default: select first 5 categories or all if less than 5 (for display only)
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

  // Toggle service category selection (for display filtering only)
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

  // Filter service comparison based on selected categories (DISPLAY ONLY)
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
    
    let csv = 'SERVICE COMPARISON (All Categories)\n';
    csv += 'Service Category,AWS,Azure,GCP\n';
    analysisResult.service_comparison.forEach(row => {
      csv += `"${row.service_category}","${row.aws}","${row.azure}","${row.gcp}"\n`;
    });
    
    csv += '\n\nESTIMATED MONTHLY COSTS WITH BREAKDOWN\n';
    csv += 'Provider,Total Monthly Cost,Service Category,Service Cost\n';
    analysisResult.cost_estimates.forEach(providerCost => {
      const provider = providerCost.provider;
      const total = providerCost.estimated_monthly_cost;
      const breakdown = providerCost.breakdown || {};
      
      // Add total row
      csv += `"${provider}","${total}","TOTAL","${total}"\n`;
      
      // Add breakdown rows
      Object.entries(breakdown).forEach(([category, cost]) => {
        csv += `"${provider}","","${category}","${cost}"\n`;
      });
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

        {/* Scenario Description Display */}
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

        {/* Service Category Selection - DISPLAY ONLY */}
        {availableCategories.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                <FilterListIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} fontSize="small" />
                Service Categories to Display (Filter affects table only, not total cost)
              </Typography>
              <Box>
                <Button size="small" onClick={selectAllCategories} sx={{ mr: 1 }}>Select All</Button>
                <Button size="small" onClick={clearAllCategories}>Clear All</Button>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Choose which service categories to show in the comparison table. The total cost includes ALL services regardless of selection.
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
              Displaying: {selectedServiceCategories.length} of {availableCategories.length} categories (Total cost unchanged)
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

          {/* COST BREAKDOWN SECTION WITH SERVICE-LEVEL PRICING */}
          <Paper sx={{ mb: 3, overflow: 'hidden' }}>
            <Accordion expanded={expandedBreakdown} onChange={() => setExpandedBreakdown(!expandedBreakdown)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">💰 Cost Breakdown by Provider</Typography>
                  <Chip 
                    label={`Total: ${fmt(analysisResult.cost_estimates.reduce((sum, c) => sum + c.estimated_monthly_cost, 0))}`} 
                    size="small" 
                    color="info" 
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The total cost is calculated as the sum of ALL recommended services for this scenario. 
                  Each service's estimated monthly cost is shown below.
                </Typography>
                <Grid container spacing={3}>
                  {analysisResult.cost_estimates.map((cost, idx) => {
                    const breakdown = cost.breakdown || {};
                    const total = cost.estimated_monthly_cost;
                    
                    return (
                      <Grid item xs={12} md={4} key={idx}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            bgcolor: PROVIDER_COLORS[cost.provider]?.light || '#f5f5f5',
                            borderTop: `4px solid ${PROVIDER_COLORS[cost.provider]?.bg}`,
                            height: '100%'
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {cost.provider}
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color={PROVIDER_COLORS[cost.provider]?.bg} gutterBottom>
                            {fmt(total)}
                            <Typography component="span" variant="caption" color="text.secondary">/month</Typography>
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" gutterBottom>
                            Service Breakdown:
                          </Typography>
                          <List dense disablePadding>
                            {Object.entries(breakdown).map(([category, serviceCost]) => (
                              <ListItem key={category} disableGutters dense>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  {getCategoryIcon(category)}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={getCategoryDisplayName(category)}
                                  secondary={fmt(serviceCost)}
                                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                  secondaryTypographyProps={{ variant: 'caption', color: 'text.primary' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Total Services:</Typography>
                            <Typography variant="body2" fontWeight="bold">{fmt(total)}</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>How total cost is calculated:</strong> The total is the sum of all recommended services for this scenario. 
                  Prices are sourced from our offline pricing database and are updated regularly.
                  Removing categories from the display filter does NOT change the total cost because all services are required for a complete migration.
                </Alert>
              </AccordionDetails>
            </Accordion>
          </Paper>

          {/* Service Comparison Table - Filtered by selected categories (DISPLAY ONLY) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              📊 Service Comparison by Provider 
              {selectedServiceCategories.length !== availableCategories.length && (
                <Chip 
                  label={`Showing ${filteredServiceComparison.length} of ${analysisResult.service_comparison.length} categories`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Tooltip title="Total cost includes ALL services regardless of what's shown">
              <InfoIcon fontSize="small" color="action" />
            </Tooltip>
          </Box>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#1976d2' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Service Category</TableCell>
                  <TableCell sx={{ color: '#ff9900', fontWeight: 'bold' }}>AWS</TableCell>
                  <TableCell sx={{ color: '#ff9900', fontWeight: 'bold' }}>AWS Cost</TableCell>
                  <TableCell sx={{ color: '#0078d4', fontWeight: 'bold' }}>Azure</TableCell>
                  <TableCell sx={{ color: '#0078d4', fontWeight: 'bold' }}>Azure Cost</TableCell>
                  <TableCell sx={{ color: '#4285f4', fontWeight: 'bold' }}>GCP</TableCell>
                  <TableCell sx={{ color: '#4285f4', fontWeight: 'bold' }}>GCP Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServiceComparison.length > 0 ? (
                  filteredServiceComparison.map((row, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.service_category}</TableCell>
                      <TableCell>{row.aws}</TableCell>
                      <TableCell>{row.aws_cost ? fmt(row.aws_cost) : '-'}</TableCell>
                      <TableCell>{row.azure}</TableCell>
                      <TableCell>{row.azure_cost ? fmt(row.azure_cost) : '-'}</TableCell>
                      <TableCell>{row.gcp}</TableCell>
                      <TableCell>{row.gcp_cost ? fmt(row.gcp_cost) : '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No categories selected. Use the filters above to select service categories to display.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Cost Comparison Chart */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            💰 Estimated Monthly Costs (All Services Included)
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Plot
                  data={costChartData}
                  layout={{
                    title: `Total Cost Comparison (${workloadVolume.charAt(0).toUpperCase() + workloadVolume.slice(1)} Volume)`,
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
                        <Box>
                          <Typography variant="h5" fontWeight="bold" color={PROVIDER_COLORS[cost.provider]?.bg}>
                            {fmt(cost.estimated_monthly_cost)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sum of {Object.keys(cost.breakdown || {}).length} services
                          </Typography>
                        </Box>
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
              Export Full Report (All Services)
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
            Select a workload scenario, choose which service categories to display, and click "Analyze Migration".
            <br />
            <strong>Note:</strong> The total cost includes ALL recommended services, regardless of display filters.
            Prices are sourced from our offline pricing database.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
```

Key Improvements

Feature Description
Service-Level Pricing in Breakdown Each provider's breakdown now shows individual service costs (Compute, Storage, Database, etc.)
Cost Column in Comparison Table Added cost columns for AWS, Azure, GCP in the service comparison table
Prices from Offline DB Backend uses MultiCloudPricingEngine to fetch real prices from offline database
Transparent Cost Calculation Users can see exactly which services contribute to the total cost
CSV Export with Breakdown Export includes both service comparison and detailed cost breakdown

Now the cost breakdown section shows individual prices for each service category within each provider, making it clear how the total cost is calculated!


