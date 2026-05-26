// Tab2Pricing.jsx - Complete updated version

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, TextField, MenuItem, Button, Typography,
  CircularProgress, Alert, Paper, Tabs, Tab, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, Checkbox,
  Tooltip, Chip, IconButton, Collapse, Card, CardContent
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoIcon from '@mui/icons-material/Info';
import { DataGrid } from '@mui/x-data-grid';
import { comparePrices } from '../../../api/client';
import useAppStore from '../../../store/appStore';
import MetricCard from '../../shared/MetricCard';
import Plot from 'react-plotly.js';

// ============================================================
// CONSTANTS & MAPPINGS (Same as your existing)
// ============================================================

const INSTANCE_MAPPING = {
  AWS: {
    't3.micro': 't3.micro', 't3.small': 't3.small', 't3.medium': 't3.medium',
    't3.large': 't3.large', 't3.xlarge': 't3.xlarge', 't3.2xlarge': 't3.2xlarge',
    'm5.large': 'm5.large', 'm5.xlarge': 'm5.xlarge', 'm5.2xlarge': 'm5.2xlarge',
    'm5.4xlarge': 'm5.4xlarge', 'm5.8xlarge': 'm5.8xlarge', 'm5.12xlarge': 'm5.12xlarge',
    'm5.16xlarge': 'm5.16xlarge',
    'c5.large': 'c5.large', 'c5.xlarge': 'c5.xlarge', 'c5.2xlarge': 'c5.2xlarge',
    'c5.4xlarge': 'c5.4xlarge', 'c5.8xlarge': 'c5.8xlarge', 'c5.12xlarge': 'c5.12xlarge',
    'c5.16xlarge': 'c5.16xlarge',
    'r5.large': 'r5.large', 'r5.xlarge': 'r5.xlarge', 'r5.2xlarge': 'r5.2xlarge',
    'r5.4xlarge': 'r5.4xlarge', 'r5.8xlarge': 'r5.8xlarge', 'r5.12xlarge': 'r5.12xlarge',
    'r5.16xlarge': 'r5.16xlarge',
    'm6g.large': 'm6g.large', 'm6g.xlarge': 'm6g.xlarge', 'm6g.2xlarge': 'm6g.2xlarge',
    'm6g.4xlarge': 'm6g.4xlarge', 'm6g.8xlarge': 'm6g.8xlarge',
    'c6g.large': 'c6g.large', 'c6g.xlarge': 'c6g.xlarge', 'c6g.2xlarge': 'c6g.2xlarge',
    'c6g.4xlarge': 'c6g.4xlarge',
    'r6g.large': 'r6g.large', 'r6g.xlarge': 'r6g.xlarge', 'r6g.2xlarge': 'r6g.2xlarge',
    'r6g.4xlarge': 'r6g.4xlarge',
  },
  Azure: {
    't3.micro': 'B1s', 't3.small': 'B1ms', 't3.medium': 'B2s', 't3.large': 'B2ms',
    't3.xlarge': 'B4ms', 't3.2xlarge': 'B8ms',
    'm5.large': 'D2s_v3', 'm5.xlarge': 'D4s_v3', 'm5.2xlarge': 'D8s_v3',
    'm5.4xlarge': 'D16s_v3', 'm5.8xlarge': 'D32s_v3', 'm5.12xlarge': 'D48s_v3', 'm5.16xlarge': 'D64s_v3',
    'c5.large': 'F2s_v2', 'c5.xlarge': 'F4s_v2', 'c5.2xlarge': 'F8s_v2',
    'c5.4xlarge': 'F16s_v2', 'c5.8xlarge': 'F32s_v2', 'c5.12xlarge': 'F48s_v2', 'c5.16xlarge': 'F64s_v2',
    'r5.large': 'E2s_v3', 'r5.xlarge': 'E4s_v3', 'r5.2xlarge': 'E8s_v3',
    'r5.4xlarge': 'E16s_v3', 'r5.8xlarge': 'E32s_v3', 'r5.12xlarge': 'E48s_v3', 'r5.16xlarge': 'E64s_v3',
    'm6g.large': 'D2s_v3', 'm6g.xlarge': 'D4s_v3', 'm6g.2xlarge': 'D8s_v3', 'm6g.4xlarge': 'D16s_v3', 'm6g.8xlarge': 'D32s_v3',
    'c6g.large': 'F2s_v2', 'c6g.xlarge': 'F4s_v2', 'c6g.2xlarge': 'F8s_v2', 'c6g.4xlarge': 'F16s_v2',
    'r6g.large': 'E2s_v3', 'r6g.xlarge': 'E4s_v3', 'r6g.2xlarge': 'E8s_v3', 'r6g.4xlarge': 'E16s_v3',
  },
  GCP: {
    't3.micro': 'e2-micro', 't3.small': 'e2-small', 't3.medium': 'e2-standard-2',
    't3.large': 'e2-standard-4', 't3.xlarge': 'e2-standard-8', 't3.2xlarge': 'e2-standard-16',
    'm5.large': 'n2-standard-2', 'm5.xlarge': 'n2-standard-4', 'm5.2xlarge': 'n2-standard-8',
    'm5.4xlarge': 'n2-standard-16', 'm5.8xlarge': 'n2-standard-32', 'm5.12xlarge': 'n2-standard-48', 'm5.16xlarge': 'n2-standard-64',
    'c5.large': 'c2-standard-4', 'c5.xlarge': 'c2-standard-8', 'c5.2xlarge': 'c2-standard-16',
    'c5.4xlarge': 'c2-standard-30', 'c5.8xlarge': 'c2-standard-60',
    'r5.large': 'n2-highmem-2', 'r5.xlarge': 'n2-highmem-4', 'r5.2xlarge': 'n2-highmem-8',
    'r5.4xlarge': 'n2-highmem-16', 'r5.8xlarge': 'n2-highmem-32',
    'm6g.large': 'n2d-standard-2', 'm6g.xlarge': 'n2d-standard-4', 'm6g.2xlarge': 'n2d-standard-8',
    'm6g.4xlarge': 'n2d-standard-16', 'm6g.8xlarge': 'n2d-standard-32',
  },
};

const REGIONS = {
  'US East (N. Virginia)': { AWS: 'us-east-1', Azure: 'eastus', GCP: 'us-east4' },
  'US East (Ohio)': { AWS: 'us-east-2', Azure: 'eastus2', GCP: 'us-east1' },
  'US West (Oregon)': { AWS: 'us-west-2', Azure: 'westus2', GCP: 'us-west1' },
  'US West (N. California)': { AWS: 'us-west-1', Azure: 'westus', GCP: 'us-west2' },
  'EU (Ireland)': { AWS: 'eu-west-1', Azure: 'northeurope', GCP: 'europe-west1' },
  'EU (Frankfurt)': { AWS: 'eu-central-1', Azure: 'westeurope', GCP: 'europe-west3' },
  'Asia Pacific (Singapore)': { AWS: 'ap-southeast-1', Azure: 'southeastasia', GCP: 'asia-southeast1' },
  'Asia Pacific (Tokyo)': { AWS: 'ap-northeast-1', Azure: 'japaneast', GCP: 'asia-northeast1' },
};

const AWS_BY_FAMILY = {
  'General Purpose': ['t3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge', 'm5.large', 'm5.xlarge', 'm5.2xlarge', 'm5.4xlarge', 'm5.8xlarge'],
  'Compute Optimized': ['c5.large', 'c5.xlarge', 'c5.2xlarge', 'c5.4xlarge', 'c5.8xlarge'],
  'Memory Optimized': ['r5.large', 'r5.xlarge', 'r5.2xlarge', 'r5.4xlarge', 'r5.8xlarge'],
};

const AZURE_BY_FAMILY = {
  'General Purpose': ['B1s', 'B1ms', 'B2s', 'B2ms', 'D2s_v3', 'D4s_v3', 'D8s_v3', 'D16s_v3', 'D32s_v3'],
  'Compute Optimized': ['F2s_v2', 'F4s_v2', 'F8s_v2', 'F16s_v2', 'F32s_v2'],
  'Memory Optimized': ['E2s_v3', 'E4s_v3', 'E8s_v3', 'E16s_v3', 'E32s_v3'],
};

const GCP_BY_FAMILY = {
  'General Purpose': ['e2-micro', 'e2-small', 'e2-standard-2', 'e2-standard-4', 'n2-standard-2', 'n2-standard-4', 'n2-standard-8', 'n2-standard-16'],
  'Compute Optimized': ['c2-standard-4', 'c2-standard-8', 'c2-standard-16', 'c2-standard-30'],
  'Memory Optimized': ['n2-highmem-2', 'n2-highmem-4', 'n2-highmem-8', 'n2-highmem-16'],
};

const AWS_INSTANCES = [
  't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge',
  'm5.large', 'm5.xlarge', 'm5.2xlarge',
  'c5.large', 'c5.xlarge', 'c5.2xlarge',
  'r5.large', 'r5.xlarge', 'r5.2xlarge',
];

const OS_TYPES = ['Linux', 'Windows'];
const PRICING_MODELS = ['On-Demand', 'Reserved 1 Year', 'Reserved 3 Year', 'Spot'];

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const safeParse = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return null;
  }
};

const parsePricingRow = (val, key, fallback = {}) => {
  const d = safeParse(val);
  if (!d || d.error) return null;

  return {
    provider: String(d?.provider || key).toUpperCase().replace("GCLOUD", "GCP"),
    instance_type: d?.instance_type || fallback.instance,
    vcpu: d?.vcpu ?? d?.vCPU ?? "N/A",
    ram: d?.ram ?? d?.["RAM (GB)"] ?? "N/A",
    monthly_rate: d?.monthly_rate ?? d?.monthly ?? null,
    hourly_rate: d?.hourly_rate ?? d?.hourly ?? null,
    annual_rate: d?.annual_rate ?? (d?.monthly_rate ? d.monthly_rate * 12 : null),
    family: d?.family ?? "N/A",
    region: d?.region ?? fallback.region,
    pricing_model: d?.pricing_model ?? fallback.pricingModel,
  };
};

// Enhanced CSV Export with all details
const downloadCSV = (rows, filename = 'pricing_comparison.csv') => {
  if (!rows?.length) return;

  const providers = [...new Set(rows.map(r => r.provider))];
  let csv = 'Instance Type,' + providers.map(p => `${p} (Hourly)`).join(',') + ',' +
    providers.map(p => `${p} (Monthly)`).join(',') + ',' +
    providers.map(p => `${p} (Annual)`).join(',') + ',' +
    providers.map(p => `${p} (vCPU)`).join(',') + ',' +
    providers.map(p => `${p} (RAM GB)`).join(',') + '\n';

  const instances = [...new Set(rows.map(r => r.instance_type))];

  instances.forEach(inst => {
    const row = [inst];
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) {
        row.push(fmt(pricing.hourly_rate || 0));
      } else row.push('N/A');
    });
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) row.push(fmt(pricing.monthly_rate || 0));
      else row.push('N/A');
    });
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) row.push(fmt(pricing.annual_rate || pricing.monthly_rate * 12 || 0));
      else row.push('N/A');
    });
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) row.push(pricing.vcpu !== 'N/A' ? pricing.vcpu : 'N/A');
      else row.push('N/A');
    });
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) row.push(pricing.ram !== 'N/A' ? pricing.ram : 'N/A');
      else row.push('N/A');
    });
    csv += row.join(',') + '\n';
  });

  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// ============================================================
// LIVE API TAB (Enhanced)
// ============================================================
function LiveApiTab({ openaiApiKey }) {
  const [referenceProvider, setReferenceProvider] = useState('AWS');
  const [family, setFamily] = useState('General Purpose');
  const [instance, setInstance] = useState(AWS_BY_FAMILY['General Purpose'][2]);
  const [regionLabel, setRegionLabel] = useState('US East (N. Virginia)');
  const [osType, setOsType] = useState('Linux');
  const [pricingModel, setPricingModel] = useState('On-Demand');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const getFamiliesForProvider = (provider) => {
    switch (provider) {
      case 'AWS': return AWS_BY_FAMILY;
      case 'Azure': return AZURE_BY_FAMILY;
      case 'GCP': return GCP_BY_FAMILY;
      default: return AWS_BY_FAMILY;
    }
  };

  const currentFamilies = getFamiliesForProvider(referenceProvider);
  const familyOptions = Object.keys(currentFamilies);
  const instanceOptions = currentFamilies[family] || [];

  useEffect(() => {
    if (instanceOptions.length && !instanceOptions.includes(instance)) {
      setInstance(instanceOptions[0]);
    }
  }, [family, referenceProvider, instanceOptions, instance]);

  useEffect(() => {
    setFamily(Object.keys(getFamiliesForProvider(referenceProvider))[0]);
  }, [referenceProvider]);

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const regionDict = REGIONS[regionLabel];
      if (!regionDict) throw new Error(`Region "${regionLabel}" not found`);
      const regionString = regionDict[referenceProvider];
      if (!regionString) throw new Error(`${referenceProvider} region not found`);

      const { data } = await comparePrices({
        resource_type: 'ec2',
        specifications: {
          instance_type: INSTANCE_MAPPING[referenceProvider]?.[instance] || instance,
          os: osType,
          reference_provider: referenceProvider,
        },
        regions: [regionString],
        pricing_model: referenceProvider === 'GCP' ? 'Committed' : pricingModel,
      }, openaiApiKey);
      setResults(data);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    if (!results) return [];
    return Object.entries(results)
      .filter(([k]) => !k.startsWith('_'))
      .map(([key, val], i) => {
        const parsed = parsePricingRow(val, key, { instance, region: REGIONS[regionLabel], pricingModel });
        if (!parsed || parsed.monthly_rate == null) return null;
        return { id: i, ...parsed, annual_rate: parsed.annual_rate ?? parsed.monthly_rate * 12 };
      })
      .filter(Boolean);
  }, [results, instance, regionLabel, pricingModel]);

  const recommendations = useMemo(() => {
    if (rows.length === 0) return {};
    const cheapest = rows.reduce((a, b) => a.monthly_rate < b.monthly_rate ? a : b);
    const mostExpensive = rows.reduce((a, b) => a.monthly_rate > b.monthly_rate ? a : b);
    const bestPerf = rows.reduce((best, curr) => {
      const currValue = curr.monthly_rate ? (parseInt(curr.vcpu) || 1) / curr.monthly_rate : 0;
      const bestValue = best.monthly_rate ? (parseInt(best.vcpu) || 1) / best.monthly_rate : 0;
      return currValue > bestValue ? curr : best;
    });
    return { cheapest, bestPerf, savings: (mostExpensive.monthly_rate - cheapest.monthly_rate) * 12 };
  }, [rows]);

  const barData = rows.length ? [{
    type: 'bar',
    x: rows.map(r => r.provider),
    y: rows.map(r => r.monthly_rate * quantity),
    text: rows.map(r => fmt(r.monthly_rate * quantity)),
    textposition: 'outside',
    marker: { color: rows.map(r => r.provider === recommendations.cheapest?.provider ? '#4caf50' : '#2196f3') },
  }] : [];

  const columns = [
    { field: 'provider', headerName: 'Provider', width: 80 },
    { field: 'instance_type', headerName: 'Instance', width: 100 },
    { field: 'vcpu', headerName: 'vCPU', width: 70 },
    { field: 'ram', headerName: 'RAM (GB)', width: 80 },
    { field: 'pricing_model', headerName: 'Model', width: 110 },
    { field: 'hourly_rate', headerName: 'Hourly', width: 90, valueFormatter: ({ value }) => value ? fmt(value) : '-' },
    { field: 'monthly_rate', headerName: 'Monthly', width: 100, valueFormatter: ({ value }) => fmt(value) },
    { field: 'annual_rate', headerName: 'Annual', width: 100, valueFormatter: ({ value }) => fmt(value || 0) },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
        🌐 <strong>Live API Prices</strong> — Real-time pricing from cloud providers
      </Alert>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField select size="small" fullWidth label="Provider"
              value={referenceProvider} onChange={(e) => setReferenceProvider(e.target.value)}>
              {['AWS', 'Azure', 'GCP'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select size="small" fullWidth label="Family"
              value={family} onChange={(e) => setFamily(e.target.value)}>
              {familyOptions.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select size="small" fullWidth label="Instance"
              value={instance} onChange={(e) => setInstance(e.target.value)}>
              {instanceOptions.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select size="small" fullWidth label="Region"
              value={regionLabel} onChange={(e) => setRegionLabel(e.target.value)}>
              {Object.keys(REGIONS).map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField select size="small" fullWidth label="OS"
              value={osType} onChange={(e) => setOsType(e.target.value)}>
              {OS_TYPES.map(os => <MenuItem key={os} value={os}>{os}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField select size="small" fullWidth label="Model"
              value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}>
              {PRICING_MODELS.map(pm => <MenuItem key={pm} value={pm}>{pm}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={0.5}>
            <TextField type="number" size="small" fullWidth label="Qty"
              value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button variant="contained" fullWidth onClick={handleCompare} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}>
              {loading ? 'Fetching...' : 'Compare'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {rows.length > 0 && (
        <>
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 1.5, bgcolor: '#c8e6c9' }}>
                <Typography variant="caption" color="#1b5e20">💚 Best for Cost</Typography>
                <Typography variant="body2" fontWeight="bold">{recommendations.cheapest?.provider} {fmt(recommendations.cheapest?.monthly_rate)}/mo</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 1.5, bgcolor: '#ffe0b2' }}>
                <Typography variant="caption" color="#e65100">⚡ Best Performance Value</Typography>
                <Typography variant="body2" fontWeight="bold">{recommendations.bestPerf?.provider} {recommendations.bestPerf?.vcpu} vCPU</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard label="Monthly Savings" value={fmt((rows.reduce((a,b)=>Math.max(a,b.monthly_rate),0) - (recommendations.cheapest?.monthly_rate||0)))} color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 1.5, bgcolor: '#bbdefb' }}>
                <Typography variant="caption" color="#01579b">📊 Annual Savings</Typography>
                <Typography variant="body2" fontWeight="bold">{fmt(recommendations.savings || 0)}/year</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 1.5 }}>
                <Plot data={barData} layout={{ title: `Monthly Cost Comparison (x${quantity})`, height: 350, margin: { t: 40 } }}
                  config={{ displayModeBar: false }} style={{ width: '100%' }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">📊 Price Summary</Typography>
                  <Button size="small" startIcon={<FileDownloadIcon />} onClick={() => downloadCSV(rows)}>CSV</Button>
                </Box>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#1976d2' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff' }}>Provider</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Instance</TableCell>
                        <TableCell align="right" sx={{ color: '#fff' }}>Monthly</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => (
                        <TableRow key={row.id} sx={{ bgcolor: row.provider === recommendations.cheapest?.provider ? '#e8f5e9' : 'inherit' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{row.provider}</TableCell>
                          <TableCell>{row.instance_type}</TableCell>
                          <TableCell align="right" sx={{ color: row.provider === recommendations.cheapest?.provider ? '#4caf50' : '#000', fontWeight: 'bold' }}>
                            {fmt(row.monthly_rate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>📋 Detailed Pricing</Typography>
            <Box sx={{ height: 350 }}>
              <DataGrid rows={rows} columns={columns} autoHeight={false} disableSelectionOnClick sx={{ fontSize: '0.75rem' }} />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}

// ============================================================
// OFFLINE TAB (Same as your existing, works fine)
// ============================================================
function OfflineTab({ openaiApiKey }) {
  const [region, setRegion] = useState('US East (N. Virginia)');
  const [osType, setOsType] = useState('Linux');
  const [pricingModel, setPricingModel] = useState('On-Demand');
  const [quantity, setQuantity] = useState(1);
  const [instance, setInstance] = useState('t3.medium');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const regionDict = REGIONS[region];
      if (!regionDict) throw new Error(`Region "${region}" not found`);
      const regionString = regionDict['AWS'];
      const { data } = await comparePrices({
        resource_type: 'ec2',
        specifications: { instance_type: instance, os: osType },
        regions: [regionString],
        pricing_model: pricingModel,
        offline: true,
      }, openaiApiKey);
      setResults(data);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to fetch offline prices');
    } finally {
      setLoading(false);
    }
  };

  const rows = results ? Object.entries(results)
    .filter(([k]) => !k.startsWith('_'))
    .map(([key, val], i) => {
      const parsed = parsePricingRow(val, key, { instance });
      if (!parsed || parsed.monthly_rate == null) return null;
      return { id: i, ...parsed };
    }).filter(Boolean) : [];

  const cheapest = rows.length ? rows.reduce((a, b) => a.monthly_rate < b.monthly_rate ? a : b) : null;
  const mostExpensive = rows.length ? rows.reduce((a, b) => a.monthly_rate > b.monthly_rate ? a : b) : null;

  const columns = [
    { field: 'provider', headerName: 'Provider', width: 90 },
    { field: 'instance_type', headerName: 'Instance', width: 100 },
    { field: 'vcpu', headerName: 'vCPU', width: 70 },
    { field: 'ram', headerName: 'RAM (GB)', width: 80 },
    { field: 'hourly_rate', headerName: 'Hourly', width: 90, valueFormatter: ({ value }) => value ? fmt(value) : '-' },
    { field: 'monthly_rate', headerName: 'Monthly', width: 100, valueFormatter: ({ value }) => fmt(value) },
    { field: 'annual_rate', headerName: 'Annual', width: 100, valueFormatter: ({ value }) => fmt(value || 0) },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="success" sx={{ mb: 2, fontSize: '0.85rem' }}>
        📦 <strong>Offline Database</strong> — Pre-loaded pricing data (instant results)
      </Alert>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField select size="small" fullWidth label="Instance" value={instance} onChange={(e) => setInstance(e.target.value)}>
              {AWS_INSTANCES.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField select size="small" fullWidth label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
              {Object.keys(REGIONS).map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select size="small" fullWidth label="OS" value={osType} onChange={(e) => setOsType(e.target.value)}>
              {OS_TYPES.map(os => <MenuItem key={os} value={os}>{os}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select size="small" fullWidth label="Model" value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}>
              {PRICING_MODELS.map(pm => <MenuItem key={pm} value={pm}>{pm}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <TextField type="number" size="small" fullWidth label="Qty" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button variant="contained" fullWidth onClick={handleFetch} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : null}>
              {loading ? 'Loading...' : 'Get Prices'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {rows.length > 0 && (
        <>
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard label="Cheapest" value={cheapest?.provider} color="success" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard label="Lowest Price" value={fmt(cheapest?.monthly_rate)} color="success" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard label="Monthly Savings" value={fmt(((mostExpensive?.monthly_rate || 0) - (cheapest?.monthly_rate || 0)))} color="info" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard label="Results Found" value={rows.length} color="info" />
            </Grid>
          </Grid>

          <Paper sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">📋 All Results ({rows.length} instances)</Typography>
              <Button size="small" startIcon={<FileDownloadIcon />} onClick={() => downloadCSV(rows)}>CSV</Button>
            </Box>
            <Box sx={{ height: 450 }}>
              <DataGrid rows={rows} columns={columns} autoHeight={false} disableSelectionOnClick sx={{ fontSize: '0.75rem' }} />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}

// ============================================================
// GRID VIEW TAB (Enhanced with better filtering)
// ============================================================
function GridViewTab({ openaiApiKey }) {
  const [region, setRegion] = useState('US East (N. Virginia)');
  const [osType, setOsType] = useState('Linux');
  const [pricingModel, setPricingModel] = useState('On-Demand');
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState([]);
  const [selectedInstances, setSelectedInstances] = useState(new Set());
  const [error, setError] = useState('');
  const [minVcpu, setMinVcpu] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const handleLoadGrid = async () => {
    setLoading(true);
    setError('');
    try {
      const regionDict = REGIONS[region];
      if (!regionDict) throw new Error(`Region "${region}" not found`);
      const regionString = regionDict['AWS'];

      const { data } = await comparePrices({
        resource_type: 'ec2',
        regions: [regionString],
        os_type: osType,
        pricing_model: pricingModel,
        get_all: true,
      }, openaiApiKey);

      const instances = [];
      Object.entries(data).forEach(([provider, providerData]) => {
        if (providerData?.instances && Array.isArray(providerData.instances)) {
          providerData.instances.forEach((inst, idx) => {
            instances.push({
              id: `${provider}_${idx}`,
              provider: String(inst.Provider || provider).toUpperCase(),
              instance: inst.Instance || inst.instance_type || "N/A",
              vcpu: inst.vCPU ?? inst.vcpu ?? null,
              memory: inst["RAM (GB)"] ?? inst.ram ?? null,
              family: inst.Family || inst.family || "N/A",
              hourly: inst.Hourly ?? inst.hourly ?? null,
              monthly: inst.Monthly ?? inst.monthly ?? null,
              annual: inst.Annual ?? inst.annual ?? null,
            });
          });
        }
      });
      setGridData(instances);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load instance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstance = (id) => {
    const newSet = new Set(selectedInstances);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedInstances(newSet);
  };

  const handleSelectAll = () => {
    if (selectedInstances.size === filteredData.length) {
      setSelectedInstances(new Set());
    } else {
      setSelectedInstances(new Set(filteredData.map(item => item.id)));
    }
  };

  const filteredData = gridData.filter(row => row.vcpu >= minVcpu && row.monthly <= maxPrice);
  const displayData = showSelectedOnly ? filteredData.filter(row => selectedInstances.has(row.id)) : filteredData;
  const selectedData = gridData.filter(row => selectedInstances.has(row.id));

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
        📊 <strong>Grid View</strong> — Browse all available instances with instant pricing
      </Alert>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField select size="small" fullWidth label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
              {Object.keys(REGIONS).map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select size="small" fullWidth label="OS" value={osType} onChange={(e) => setOsType(e.target.value)}>
              {OS_TYPES.map(os => <MenuItem key={os} value={os}>{os}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField select size="small" fullWidth label="Pricing Model" value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}>
              {PRICING_MODELS.map(pm => <MenuItem key={pm} value={pm}>{pm}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField type="number" size="small" fullWidth label="Min vCPU" value={minVcpu}
              onChange={(e) => { const val = parseInt(e.target.value); setMinVcpu(isNaN(val) ? 0 : val); }} />
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField type="number" size="small" fullWidth label="Max Price/mo" value={maxPrice}
              onChange={(e) => { const val = parseInt(e.target.value); setMaxPrice(isNaN(val) ? 1000 : val); }} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button variant="contained" fullWidth onClick={handleLoadGrid} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}>
              {loading ? 'Loading...' : 'Load Grid'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {gridData.length > 0 && (
        <>
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={6} sm={3} md={2}>
              <MetricCard label="Total Instances" value={gridData.length} color="info" />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <MetricCard label="Filtered" value={filteredData.length} color="info" />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <MetricCard label="Selected" value={selectedInstances.size} color="success" />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <MetricCard label="Selected Total" value={fmt(selectedData.reduce((sum, r) => sum + r.monthly, 0))} color="warning" />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Button size="small" variant="outlined" onClick={handleSelectAll}>
                {selectedInstances.size === filteredData.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Button size="small" variant="outlined" onClick={() => setShowSelectedOnly(!showSelectedOnly)}>
                {showSelectedOnly ? 'Show All' : 'Show Selected Only'}
              </Button>
            </Grid>
          </Grid>

          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              📋 {displayData.length} instances {showSelectedOnly ? '(selected only)' : ''}
            </Typography>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead sx={{ backgroundColor: '#1976d2' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff' }}>Select</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Provider</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Instance</TableCell>
                    <TableCell align="right" sx={{ color: '#fff' }}>vCPU</TableCell>
                    <TableCell align="right" sx={{ color: '#fff' }}>RAM (GB)</TableCell>
                    <TableCell align="right" sx={{ color: '#fff' }}>Monthly</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayData.map((row, idx) => (
                    <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? '#f5f5f5' : '#fff', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                      <TableCell>
                        <Checkbox size="small" checked={selectedInstances.has(row.id)} onChange={() => handleSelectInstance(row.id)} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.provider}</TableCell>
                      <TableCell>{row.instance}</TableCell>
                      <TableCell align="right">{row.vcpu}</TableCell>
                      <TableCell align="right">{row.memory}</TableCell>
                      <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 'bold' }}>{fmt(row.monthly)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {selectedInstances.size > 0 && (
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#e8f5e9' }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>✅ Selected Instances Summary</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6} sm={3} md={2}>
                  <MetricCard label="Count" value={selectedInstances.size} color="success" />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <MetricCard label="Monthly Total" value={fmt(selectedData.reduce((sum, r) => sum + r.monthly, 0))} color="success" />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <MetricCard label="Annual Total" value={fmt(selectedData.reduce((sum, r) => sum + (r.annual ?? r.monthly * 12), 0))} color="success" />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <MetricCard label="Avg vCPU" value={(selectedData.reduce((sum, r) => sum + (r.vcpu || 0), 0) / selectedInstances.size).toFixed(1)} color="info" />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <Button size="small" variant="contained" startIcon={<FileDownloadIcon />} onClick={() => downloadCSV(selectedData, 'selected_instances.csv')}>
                    Export Selected
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Tab2Pricing() {
  const { openaiApiKey } = useAppStore();
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>💰 Multi-Cloud Price Comparison</Typography>

      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="🌐 Live API Prices" />
          <Tab label="📦 Offline Database" />
          <Tab label="📊 Grid View (All Instances)" />
        </Tabs>
      </Paper>

      {tabValue === 0 && <LiveApiTab openaiApiKey={openaiApiKey} />}
      {tabValue === 1 && <OfflineTab openaiApiKey={openaiApiKey} />}
      {tabValue === 2 && <GridViewTab openaiApiKey={openaiApiKey} />}
    </Box>
  );
}


xxxx

// ============================================================
// BIDIRECTIONAL INSTANCE MAPPING (Fixed)
// ============================================================

// Complete mapping for all providers to all providers
const INSTANCE_MAPPING_COMPLETE = {
  // AWS → Others
  AWS: {
    Azure: {
      't3.micro': 'B1s', 't3.small': 'B1ms', 't3.medium': 'B2s', 't3.large': 'B2ms',
      't3.xlarge': 'B4ms', 't3.2xlarge': 'B8ms',
      'm5.large': 'D2s_v3', 'm5.xlarge': 'D4s_v3', 'm5.2xlarge': 'D8s_v3',
      'm5.4xlarge': 'D16s_v3', 'm5.8xlarge': 'D32s_v3', 'm5.12xlarge': 'D48s_v3', 'm5.16xlarge': 'D64s_v3',
      'c5.large': 'F2s_v2', 'c5.xlarge': 'F4s_v2', 'c5.2xlarge': 'F8s_v2',
      'c5.4xlarge': 'F16s_v2', 'c5.8xlarge': 'F32s_v2', 'c5.12xlarge': 'F48s_v2', 'c5.16xlarge': 'F64s_v2',
      'r5.large': 'E2s_v3', 'r5.xlarge': 'E4s_v3', 'r5.2xlarge': 'E8s_v3',
      'r5.4xlarge': 'E16s_v3', 'r5.8xlarge': 'E32s_v3', 'r5.12xlarge': 'E48s_v3', 'r5.16xlarge': 'E64s_v3',
    },
    GCP: {
      't3.micro': 'e2-micro', 't3.small': 'e2-small', 't3.medium': 'e2-standard-2', 't3.large': 'e2-standard-4',
      't3.xlarge': 'e2-standard-8', 't3.2xlarge': 'e2-standard-16',
      'm5.large': 'n2-standard-2', 'm5.xlarge': 'n2-standard-4', 'm5.2xlarge': 'n2-standard-8',
      'm5.4xlarge': 'n2-standard-16', 'm5.8xlarge': 'n2-standard-32', 'm5.12xlarge': 'n2-standard-48', 'm5.16xlarge': 'n2-standard-64',
      'c5.large': 'c2-standard-4', 'c5.xlarge': 'c2-standard-8', 'c5.2xlarge': 'c2-standard-16',
      'c5.4xlarge': 'c2-standard-30', 'c5.8xlarge': 'c2-standard-60',
      'r5.large': 'n2-highmem-2', 'r5.xlarge': 'n2-highmem-4', 'r5.2xlarge': 'n2-highmem-8',
      'r5.4xlarge': 'n2-highmem-16', 'r5.8xlarge': 'n2-highmem-32',
    },
  },
  // Azure → Others
  Azure: {
    AWS: {
      'B1s': 't3.micro', 'B1ms': 't3.small', 'B2s': 't3.medium', 'B2ms': 't3.large',
      'B4ms': 't3.xlarge', 'B8ms': 't3.2xlarge',
      'D2s_v3': 'm5.large', 'D4s_v3': 'm5.xlarge', 'D8s_v3': 'm5.2xlarge',
      'D16s_v3': 'm5.4xlarge', 'D32s_v3': 'm5.8xlarge', 'D48s_v3': 'm5.12xlarge', 'D64s_v3': 'm5.16xlarge',
      'F2s_v2': 'c5.large', 'F4s_v2': 'c5.xlarge', 'F8s_v2': 'c5.2xlarge',
      'F16s_v2': 'c5.4xlarge', 'F32s_v2': 'c5.8xlarge', 'F48s_v2': 'c5.12xlarge', 'F64s_v2': 'c5.16xlarge',
      'E2s_v3': 'r5.large', 'E4s_v3': 'r5.xlarge', 'E8s_v3': 'r5.2xlarge',
      'E16s_v3': 'r5.4xlarge', 'E32s_v3': 'r5.8xlarge', 'E48s_v3': 'r5.12xlarge', 'E64s_v3': 'r5.16xlarge',
    },
    GCP: {
      'B1s': 'e2-micro', 'B1ms': 'e2-small', 'B2s': 'e2-standard-2', 'B2ms': 'e2-standard-4',
      'B4ms': 'e2-standard-8', 'B8ms': 'e2-standard-16',
      'D2s_v3': 'n2-standard-2', 'D4s_v3': 'n2-standard-4', 'D8s_v3': 'n2-standard-8',
      'D16s_v3': 'n2-standard-16', 'D32s_v3': 'n2-standard-32',
      'F2s_v2': 'c2-standard-4', 'F4s_v2': 'c2-standard-8', 'F8s_v2': 'c2-standard-16',
      'F16s_v2': 'c2-standard-30', 'F32s_v2': 'c2-standard-60',
      'E2s_v3': 'n2-highmem-2', 'E4s_v3': 'n2-highmem-4', 'E8s_v3': 'n2-highmem-8',
      'E16s_v3': 'n2-highmem-16', 'E32s_v3': 'n2-highmem-32',
    },
  },
  // GCP → Others
  GCP: {
    AWS: {
      'e2-micro': 't3.micro', 'e2-small': 't3.small', 'e2-standard-2': 't3.medium', 'e2-standard-4': 't3.large',
      'e2-standard-8': 't3.xlarge', 'e2-standard-16': 't3.2xlarge',
      'n2-standard-2': 'm5.large', 'n2-standard-4': 'm5.xlarge', 'n2-standard-8': 'm5.2xlarge',
      'n2-standard-16': 'm5.4xlarge', 'n2-standard-32': 'm5.8xlarge', 'n2-standard-48': 'm5.12xlarge', 'n2-standard-64': 'm5.16xlarge',
      'c2-standard-4': 'c5.large', 'c2-standard-8': 'c5.xlarge', 'c2-standard-16': 'c5.2xlarge',
      'c2-standard-30': 'c5.4xlarge', 'c2-standard-60': 'c5.8xlarge',
      'n2-highmem-2': 'r5.large', 'n2-highmem-4': 'r5.xlarge', 'n2-highmem-8': 'r5.2xlarge',
      'n2-highmem-16': 'r5.4xlarge', 'n2-highmem-32': 'r5.8xlarge',
    },
    Azure: {
      'e2-micro': 'B1s', 'e2-small': 'B1ms', 'e2-standard-2': 'B2s', 'e2-standard-4': 'B2ms',
      'e2-standard-8': 'B4ms', 'e2-standard-16': 'B8ms',
      'n2-standard-2': 'D2s_v3', 'n2-standard-4': 'D4s_v3', 'n2-standard-8': 'D8s_v3',
      'n2-standard-16': 'D16s_v3', 'n2-standard-32': 'D32s_v3',
      'c2-standard-4': 'F2s_v2', 'c2-standard-8': 'F4s_v2', 'c2-standard-16': 'F8s_v2',
      'c2-standard-30': 'F16s_v2', 'c2-standard-60': 'F32s_v2',
      'n2-highmem-2': 'E2s_v3', 'n2-highmem-4': 'E4s_v3', 'n2-highmem-8': 'E8s_v3',
      'n2-highmem-16': 'E16s_v3', 'n2-highmem-32': 'E32s_v3',
    },
  },
};

// Helper function to get mapped instance
const getMappedInstance = (referenceProvider, targetProvider, instanceType) => {
  const mapping = INSTANCE_MAPPING_COMPLETE[referenceProvider]?.[targetProvider];
  if (!mapping) return instanceType;
  const mapped = mapping[instanceType];
  if (mapped) return mapped;
  
  // Fallback: try to find by pattern (e.g., extract family and size)
  console.warn(`No mapping found for ${referenceProvider} ${instanceType} to ${targetProvider}`);
  return instanceType;
};

// Get instance families based on provider and reference
const getFamiliesForProvider = (provider, referenceProvider = null) => {
  // If this is the reference provider, show all available families
  if (referenceProvider === provider || !referenceProvider) {
    switch (provider) {
      case 'AWS': return AWS_BY_FAMILY;
      case 'Azure': return AZURE_BY_FAMILY;
      case 'GCP': return GCP_BY_FAMILY;
      default: return AWS_BY_FAMILY;
    }
  }
  
  // For non-reference providers, we need to show instances that have mappings
  // This is more complex - for simplicity, show common instances
  switch (provider) {
    case 'AWS': return AWS_BY_FAMILY;
    case 'Azure': return AZURE_BY_FAMILY;
    case 'GCP': return GCP_BY_FAMILY;
    default: return AWS_BY_FAMILY;
  }
};

// Get instance options for a family based on provider
const getInstanceOptionsForFamily = (provider, family, referenceProvider = null) => {
  const families = getFamiliesForProvider(provider, referenceProvider);
  return families[family] || [];
};


live mapping updste for livetav

function LiveApiTab({ openaiApiKey }) {
  const [referenceProvider, setReferenceProvider] = useState('AWS');
  const [family, setFamily] = useState('General Purpose');
  const [instance, setInstance] = useState('t3.medium');
  const [regionLabel, setRegionLabel] = useState('US East (N. Virginia)');
  const [osType, setOsType] = useState('Linux');
  const [pricingModel, setPricingModel] = useState('On-Demand');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Get available families based on reference provider
  const availableFamilies = useMemo(() => {
    switch (referenceProvider) {
      case 'AWS': return Object.keys(AWS_BY_FAMILY);
      case 'Azure': return Object.keys(AZURE_BY_FAMILY);
      case 'GCP': return Object.keys(GCP_BY_FAMILY);
      default: return Object.keys(AWS_BY_FAMILY);
    }
  }, [referenceProvider]);

  // Get instances for selected family based on reference provider
  const availableInstances = useMemo(() => {
    switch (referenceProvider) {
      case 'AWS': return AWS_BY_FAMILY[family] || [];
      case 'Azure': return AZURE_BY_FAMILY[family] || [];
      case 'GCP': return GCP_BY_FAMILY[family] || [];
      default: return AWS_BY_FAMILY[family] || [];
    }
  }, [referenceProvider, family]);

  // Reset instance when family or provider changes
  useEffect(() => {
    if (availableInstances.length > 0) {
      setInstance(availableInstances[0]);
    }
  }, [availableInstances]);

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const regionDict = REGIONS[regionLabel];
      if (!regionDict) throw new Error(`Region "${regionLabel}" not found`);
      
      // For each provider we want to query, get the mapped instance type
      const providersToQuery = ['AWS', 'Azure', 'GCP'];
      const requestPromises = providersToQuery.map(async (targetProvider) => {
        // Map the reference instance to the target provider's equivalent
        const mappedInstance = getMappedInstance(referenceProvider, targetProvider, instance);
        const regionString = regionDict[targetProvider];
        
        if (!regionString) return null;
        
        try {
          const { data } = await comparePrices({
            resource_type: 'ec2',
            specifications: {
              instance_type: mappedInstance,
              os: osType,
              reference_provider: targetProvider,
            },
            regions: [regionString],
            pricing_model: targetProvider === 'GCP' ? 'Committed' : pricingModel,
          }, openaiApiKey);
          
          return { provider: targetProvider, data, mappedInstance };
        } catch (err) {
          console.error(`Error fetching ${targetProvider}:`, err);
          return { provider: targetProvider, data: null, error: err.message };
        }
      });
      
      const allResults = await Promise.all(requestPromises);
      const combinedResults = {};
      allResults.forEach(result => {
        if (result && result.data) {
          combinedResults[result.provider] = result.data;
        }
      });
      setResults(combinedResults);
      
      // Show warning if some providers failed
      const failedProviders = allResults.filter(r => r && !r.data).map(r => r.provider);
      if (failedProviders.length > 0) {
        setError(`Warning: Could not fetch prices for ${failedProviders.join(', ')}`);
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  // Parse results with proper provider identification
  const rows = useMemo(() => {
    if (!results) return [];
    const parsedRows = [];
    let id = 0;
    
    Object.entries(results).forEach(([providerKey, providerData]) => {
      // ProviderKey is like "AWS", "Azure", "GCP"
      Object.entries(providerData).forEach(([key, val]) => {
        if (key.startsWith('_')) return;
        
        const parsed = parsePricingRow(val, key, {
          instance: instance,
          region: REGIONS[regionLabel],
          pricingModel,
        });
        
        if (parsed && parsed.monthly_rate != null) {
          parsedRows.push({
            id: id++,
            provider: providerKey,
            ...parsed,
            annual_rate: parsed.annual_rate ?? parsed.monthly_rate * 12,
          });
        }
      });
    });
    
    return parsedRows;
  }, [results, instance, regionLabel, pricingModel]);

  // Rest of the component remains the same...
  // (recommendations, barData, columns, render logic)

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
        🌐 <strong>Live API Prices</strong> — Real-time pricing from cloud providers
        <br />
        <small>Select any provider as reference, and we'll find equivalent instances across AWS, Azure, and GCP.</small>
      </Alert>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Reference Provider"
              value={referenceProvider}
              onChange={(e) => setReferenceProvider(e.target.value)}
            >
              {['AWS', 'Azure', 'GCP'].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Family"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
            >
              {availableFamilies.map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Instance"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
            >
              {availableInstances.map(i => (
                <MenuItem key={i} value={i}>{i}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Region"
              value={regionLabel}
              onChange={(e) => setRegionLabel(e.target.value)}
            >
              {Object.keys(REGIONS).map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              select size="small" fullWidth label="OS"
              value={osType}
              onChange={(e) => setOsType(e.target.value)}
            >
              {OS_TYPES.map(os => (
                <MenuItem key={os} value={os}>{os}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              select size="small" fullWidth label="Model"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value)}
            >
              {PRICING_MODELS.map(pm => (
                <MenuItem key={pm} value={pm}>{pm}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={0.5}>
            <TextField
              type="number" size="small" fullWidth label="Qty"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained" fullWidth onClick={handleCompare}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? 'Fetching...' : 'Compare'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Show mapping info for transparency */}
      {instance && (
        <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
          🔄 Instance Mapping: {referenceProvider} <strong>{instance}</strong> →
          AWS: <strong>{getMappedInstance(referenceProvider, 'AWS', instance)}</strong> |
          Azure: <strong>{getMappedInstance(referenceProvider, 'Azure', instance)}</strong> |
          GCP: <strong>{getMappedInstance(referenceProvider, 'GCP', instance)}</strong>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Rest of the rendering logic remains the same as before */}
      {rows.length > 0 && (
        // ... existing display code
      )}
    </Box>
  );
}

nnnnn

region mapping
// This already maps unified region to each provider's specific region code
const REGIONS = {
  'US East (N. Virginia)': { AWS: 'us-east-1', Azure: 'eastus', GCP: 'us-east4' },
  'US East (Ohio)': { AWS: 'us-east-2', Azure: 'eastus2', GCP: 'us-east1' },
  'US West (Oregon)': { AWS: 'us-west-2', Azure: 'westus2', GCP: 'us-west1' },
  'US West (N. California)': { AWS: 'us-west-1', Azure: 'westus', GCP: 'us-west2' },
  'EU (Ireland)': { AWS: 'eu-west-1', Azure: 'northeurope', GCP: 'europe-west1' },
  'EU (Frankfurt)': { AWS: 'eu-central-1', Azure: 'westeurope', GCP: 'europe-west3' },
  'EU (London)': { AWS: 'eu-west-2', Azure: 'uksouth', GCP: 'europe-west2' },
  'Asia Pacific (Singapore)': { AWS: 'ap-southeast-1', Azure: 'southeastasia', GCP: 'asia-southeast1' },
  'Asia Pacific (Tokyo)': { AWS: 'ap-northeast-1', Azure: 'japaneast', GCP: 'asia-northeast1' },
  'Asia Pacific (Mumbai)': { AWS: 'ap-south-1', Azure: 'centralindia', GCP: 'asia-south1' },
  'South America (Sao Paulo)': { AWS: 'sa-east-1', Azure: 'brazilsouth', GCP: 'southamerica-east1' },
  'Australia (Sydney)': { AWS: 'ap-southeast-2', Azure: 'australiaeast', GCP: 'australia-southeast1' },
};

Enhanced region handling
// Helper function to get region with fallback
const getRegionForProvider = (unifiedRegion, provider, fallbackRegion = null) => {
  const regionMap = REGIONS[unifiedRegion];
  if (!regionMap) {
    console.warn(`Unified region "${unifiedRegion}" not found`);
    return fallbackRegion || (provider === 'AWS' ? 'us-east-1' : provider === 'Azure' ? 'eastus' : 'us-central1');
  }
  
  const regionCode = regionMap[provider];
  if (!regionCode) {
    console.warn(`Provider ${provider} not supported in region "${unifiedRegion}"`);
    // Fallback to default region for this provider
    const defaultRegions = { AWS: 'us-east-1', Azure: 'eastus', GCP: 'us-central1' };
    return fallbackRegion || defaultRegions[provider];
  }
  
  return regionCode;
};

// Get available unified regions for a specific provider (some providers may not support all regions)
const getAvailableRegionsForProvider = (provider) => {
  const available = [];
  Object.entries(REGIONS).forEach(([unifiedName, providerMap]) => {
    if (providerMap[provider]) {
      available.push(unifiedName);
    }
  });
  return available;
};

... livetab changed ====

  function LiveApiTab({ openaiApiKey }) {
  const [referenceProvider, setReferenceProvider] = useState('AWS');
  const [family, setFamily] = useState('General Purpose');
  const [instance, setInstance] = useState('t3.medium');
  const [regionLabel, setRegionLabel] = useState('US East (N. Virginia)');
  const [osType, setOsType] = useState('Linux');
  const [pricingModel, setPricingModel] = useState('On-Demand');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Get available regions for the current reference provider
  const availableRegions = useMemo(() => {
    return getAvailableRegionsForProvider(referenceProvider);
  }, [referenceProvider]);

  // Reset region if current selection not available for new provider
  useEffect(() => {
    if (!availableRegions.includes(regionLabel)) {
      setRegionLabel(availableRegions[0] || 'US East (N. Virginia)');
    }
  }, [referenceProvider, availableRegions, regionLabel]);

  // Get available families based on reference provider
  const availableFamilies = useMemo(() => {
    switch (referenceProvider) {
      case 'AWS': return Object.keys(AWS_BY_FAMILY);
      case 'Azure': return Object.keys(AZURE_BY_FAMILY);
      case 'GCP': return Object.keys(GCP_BY_FAMILY);
      default: return Object.keys(AWS_BY_FAMILY);
    }
  }, [referenceProvider]);

  // Get instances for selected family based on reference provider
  const availableInstances = useMemo(() => {
    switch (referenceProvider) {
      case 'AWS': return AWS_BY_FAMILY[family] || [];
      case 'Azure': return AZURE_BY_FAMILY[family] || [];
      case 'GCP': return GCP_BY_FAMILY[family] || [];
      default: return AWS_BY_FAMILY[family] || [];
    }
  }, [referenceProvider, family]);

  // Reset instance when family or provider changes
  useEffect(() => {
    if (availableInstances.length > 0 && !availableInstances.includes(instance)) {
      setInstance(availableInstances[0]);
    }
  }, [availableInstances, instance]);

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const providersToQuery = ['AWS', 'Azure', 'GCP'];
      const requestPromises = providersToQuery.map(async (targetProvider) => {
        const mappedInstance = getMappedInstance(referenceProvider, targetProvider, instance);
        // Use the helper function to get region with fallback
        const regionString = getRegionForProvider(regionLabel, targetProvider);
        
        if (!regionString) {
          console.warn(`No region mapping for ${targetProvider} in ${regionLabel}`);
          return { provider: targetProvider, data: null, error: 'Region not available' };
        }
        
        try {
          const { data } = await comparePrices({
            resource_type: 'ec2',
            specifications: {
              instance_type: mappedInstance,
              os: osType,
              reference_provider: targetProvider,
            },
            regions: [regionString],
            pricing_model: targetProvider === 'GCP' ? 'Committed' : pricingModel,
          }, openaiApiKey);
          
          return { provider: targetProvider, data, mappedInstance };
        } catch (err) {
          console.error(`Error fetching ${targetProvider}:`, err);
          return { provider: targetProvider, data: null, error: err.message };
        }
      });
      
      const allResults = await Promise.all(requestPromises);
      const combinedResults = {};
      const failedProviders = [];
      
      allResults.forEach(result => {
        if (result && result.data) {
          combinedResults[result.provider] = result.data;
        } else if (result) {
          failedProviders.push(result.provider);
        }
      });
      
      setResults(combinedResults);
      
      if (failedProviders.length > 0) {
        setError(`Warning: Could not fetch prices for ${failedProviders.join(', ')} in region "${regionLabel}"`);
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  // Parse results with proper provider identification
  const rows = useMemo(() => {
    if (!results) return [];
    const parsedRows = [];
    let id = 0;
    
    Object.entries(results).forEach(([providerKey, providerData]) => {
      Object.entries(providerData).forEach(([key, val]) => {
        if (key.startsWith('_')) return;
        
        const parsed = parsePricingRow(val, key, {
          instance: instance,
          region: regionLabel,
          pricingModel,
        });
        
        if (parsed && parsed.monthly_rate != null) {
          parsedRows.push({
            id: id++,
            provider: providerKey,
            ...parsed,
            annual_rate: parsed.annual_rate ?? parsed.monthly_rate * 12,
          });
        }
      });
    });
    
    return parsedRows;
  }, [results, instance, regionLabel, pricingModel]);

  // ... rest of the component (recommendations, barData, columns, render logic)

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
        🌐 <strong>Live API Prices</strong> — Real-time pricing from cloud providers
        <br />
        <small>Select any provider and region. We'll find equivalent instances across AWS, Azure, and GCP.</small>
      </Alert>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Reference Provider"
              value={referenceProvider}
              onChange={(e) => setReferenceProvider(e.target.value)}
            >
              {['AWS', 'Azure', 'GCP'].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Family"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
            >
              {availableFamilies.map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Instance"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
            >
              {availableInstances.map(i => (
                <MenuItem key={i} value={i}>{i}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Region"
              value={regionLabel}
              onChange={(e) => setRegionLabel(e.target.value)}
            >
              {availableRegions.map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              select size="small" fullWidth label="OS"
              value={osType}
              onChange={(e) => setOsType(e.target.value)}
            >
              {OS_TYPES.map(os => (
                <MenuItem key={os} value={os}>{os}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              select size="small" fullWidth label="Model"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value)}
            >
              {PRICING_MODELS.map(pm => (
                <MenuItem key={pm} value={pm}>{pm}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={0.5}>
            <TextField
              type="number" size="small" fullWidth label="Qty"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained" fullWidth onClick={handleCompare}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? 'Fetching...' : 'Compare'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Show mapping info for transparency */}
      {instance && (
        <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
          🔄 <strong>Instance Mapping:</strong> {referenceProvider} <strong>{instance}</strong> →
          AWS: <strong>{getMappedInstance(referenceProvider, 'AWS', instance)}</strong> |
          Azure: <strong>{getMappedInstance(referenceProvider, 'Azure', instance)}</strong> |
          GCP: <strong>{getMappedInstance(referenceProvider, 'GCP', instance)}</strong>
          <br />
          📍 <strong>Region Mapping:</strong> "{regionLabel}" →
          AWS: <strong>{getRegionForProvider(regionLabel, 'AWS')}</strong> |
          Azure: <strong>{getRegionForProvider(regionLabel, 'Azure')}</strong> |
          GCP: <strong>{getRegionForProvider(regionLabel, 'GCP')}</strong>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Rest of the rendering logic */}
      {rows.length > 0 && (
        // ... existing display code
      )}
    </Box>
  );
  }

nnnn offlineta 
function OfflineTab({ openaiApiKey }) {
  const [region, setRegion] = useState('US East (N. Virginia)');
  const [osType, setOsType] = useState('Linux');
  const [pricingModel, setPricingModel] = useState('On-Demand');
  const [quantity, setQuantity] = useState(1);
  const [instance, setInstance] = useState('t3.medium');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Get available regions (offline tab typically uses AWS as reference)
  const availableRegions = useMemo(() => {
    return getAvailableRegionsForProvider('AWS');
  }, []);

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      // For offline tab, we use AWS as the reference provider
      const regionString = getRegionForProvider(region, 'AWS');
      
      const { data } = await comparePrices({
        resource_type: 'ec2',
        specifications: { instance_type: instance, os: osType },
        regions: [regionString],
        pricing_model: pricingModel,
        offline: true,
      }, openaiApiKey);
      setResults(data);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to fetch offline prices');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}

