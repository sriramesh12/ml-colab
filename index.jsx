import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, MenuItem, Button, Typography,
  CircularProgress, Alert, Paper, Tabs, Tab, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Checkbox,
  Chip, Card, CardContent, Divider, Icon
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
//import { downloadCSV } from '../../../utils/csvUtils';
import Plot from 'react-plotly.js';
import { DataGrid } from '@mui/x-data-grid';
import { comparePrices } from '../../../api/client';
import useAppStore from '../../../store/appStore';
import MetricCard from '../../shared/MetricCard';


import { useMemo } from 'react';


const INSTANCE_MAPPING = {
  AWS: {
//  ✅ Burstable (T3 → B-series)
    't3.micro':  't3.micro',
    't3.small':  't3.small',
    't3.medium': 't3.medium',
    't3.large':  't3.large',
    't3.xlarge': 't3.xlarge',
    't3.2xlarge': 't3.2xlarge',

    // ✅ General Purpose (M5 → D-series)
    'm5.large':   'm5.large',
    'm5.xlarge':  'm5.xlarge',
    'm5.2xlarge': 'm5.2xlarge',
    'm5.4xlarge': 'm5.4xlarge',
    'm5.8xlarge': 'm5.8xlarge',
    'm5.12xlarge': 'm5.12xlarge',
    'm5.16xlarge': 'm5.16xlarge',

    //✅ Compute Optimized (C5 → F-series)
    'c5.large':   'c5.large',
    'c5.xlarge':  'c5.xlarge',
    'c5.2xlarge': 'c5.2xlarge',
    'c5.4xlarge': 'c5.4xlarge',
    'c5.8xlarge': 'c5.8xlarge',
    'c5.12xlarge': 'c5.12xlarge',
    'c5.16xlarge': 'c5.16xlarge',

    // ✅ Memory Optimized (R5 → E-series)
    'r5.large':   'r5.large',
    'r5.xlarge':  'r5.xlarge',
    'r5.2xlarge': 'r5.2xlarge',
    'r5.4xlarge': 'r5.4xlarge',
    'r5.8xlarge': 'r5.8xlarge',
    'r5.12xlarge': 'r5.12xlarge',
    'r5.16xlarge': 'r5.16xlarge',

    // ✅ Graviton → Same Azure families (cost advantage handled separately)
    'm6g.large':   'm6g.large',
    'm6g.xlarge':  'm6g.xlarge',
    'm6g.2xlarge': 'm6g.2xlarge',
    'm6g.4xlarge': 'm6g.4xlarge',
    'm6g.8xlarge': 'm6g.8xlarge',

    'c6g.large':   'c6g.large',
    'c6g.xlarge':  'c6g.xlarge',
    'c6g.2xlarge': 'c6g.2xlarge',
    'c6g.4xlarge': 'c6g.4xlarge',

    'r6g.large':   'r6g.large',
    'r6g.xlarge':  'r6g.xlarge',
    'r6g.2xlarge': 'r6g.2xlarge',
    'r6g.4xlarge': 'r6g.4xlarge',
  },
  GCP: {
    't3.micro': 'e2-micro',
    't3.small': 'e2-small',
    't3.medium': 'e2-standard-2',
    't3.large': 'e2-standard-4',
    'm5.large': 'n2-standard-2',
    'm5.xlarge': 'n2-standard-4',
    'm5.2xlarge': 'n2-standard-8',
    'c5.large': 'c2-standard-4',
    'c5.xlarge': 'c2-standard-8',
    'c5.2xlarge': 'c2-standard-16',
    'r5.large': 'n2-highmem-2',
    'r5.xlarge': 'n2-highmem-4',
  },
  Azure: {
//  ✅ Burstable (T3 → B-series)
    't3.micro':  'B1s',
    't3.small':  'B1ms',
    't3.medium': 'B2s',
    't3.large':  'B2ms',
    't3.xlarge': 'B4ms',
    't3.2xlarge': 'B8ms',

    // ✅ General Purpose (M5 → D-series)
    'm5.large':   'D2s_v3',
    'm5.xlarge':  'D4s_v3',
    'm5.2xlarge': 'D8s_v3',
    'm5.4xlarge': 'D16s_v3',
    'm5.8xlarge': 'D32s_v3',
    'm5.12xlarge': 'D48s_v3',
    'm5.16xlarge': 'D64s_v3',

    //✅ Compute Optimized (C5 → F-series)
    'c5.large':   'F2s_v2',
    'c5.xlarge':  'F4s_v2',
    'c5.2xlarge': 'F8s_v2',
    'c5.4xlarge': 'F16s_v2',
    'c5.8xlarge': 'F32s_v2',
    'c5.12xlarge': 'F48s_v2',
    'c5.16xlarge': 'F64s_v2',

    // ✅ Memory Optimized (R5 → E-series)
    'r5.large':   'E2s_v3',
    'r5.xlarge':  'E4s_v3',
    'r5.2xlarge': 'E8s_v3',
    'r5.4xlarge': 'E16s_v3',
    'r5.8xlarge': 'E32s_v3',
    'r5.12xlarge': 'E48s_v3',
    'r5.16xlarge': 'E64s_v3',

    // ✅ Graviton → Same Azure families (cost advantage handled separately)
    'm6g.large':   'D2s_v3',
    'm6g.xlarge':  'D4s_v3',
    'm6g.2xlarge': 'D8s_v3',
    'm6g.4xlarge': 'D16s_v3',
    'm6g.8xlarge': 'D32s_v3',

    'c6g.large':   'F2s_v2',
    'c6g.xlarge':  'F4s_v2',
    'c6g.2xlarge': 'F8s_v2',
    'c6g.4xlarge': 'F16s_v2',

    'r6g.large':   'E2s_v3',
    'r6g.xlarge':  'E4s_v3',
    'r6g.2xlarge': 'E8s_v3',
    'r6g.4xlarge': 'E16s_v3',
  }
};


/* ============================
   SAFE JSON PARSER
============================ */
const safeParse = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch (err) {
    console.warn("Invalid JSON:", val);
    return null;
  }
};

/* ============================
   FORMATTER
============================ */
//const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

/* ============================
   COMMON PARSER
============================ */
const parsePricingRow = (val, key, fallback = {}) => {
  const d = safeParse(val);
  if (!d || d.error) return null;

  return {
    //provider: String(d?.provider || key).toUpperCase(),
    provider: String(d?.provider || key).toUpperCase().replace("GCLOUD", "GCP"),
    instance_type: d?.instance_type || fallback.instance,
    vcpu: d?.vcpu ?? d?.vCPU ?? "N/A",
    ram: d?.ram ?? d?.["RAM (GB)"] ?? "N/A",
    monthly_rate: d?.monthly_rate ?? d?.monthly ?? null,
    hourly_rate: d?.hourly_rate ?? d?.hourly ?? null,
    annual_rate: d?.annual_rate ?? d?.annual ?? null,
    family: d?.family ?? "N/A",
    region: d?.region ?? fallback.region,
    pricing_model: d?.pricing_model ?? fallback.pricingModel,
  };
};


const REGIONS = {
  'US East (N. Virginia)': {
    AWS: 'us-east-1',
    Azure: 'eastus',
    GCP: 'us-east4'
  },
  'US West (Oregon)': {
    AWS: 'us-west-2',
    Azure: 'westus2',
    GCP: 'us-west1'
  },
  'EU (Ireland)': {
    AWS: 'eu-west-1',
    Azure: 'northeurope',
    GCP: 'europe-west1'
  }
};

// AWS instances by family
const AWS_BY_FAMILY = {
  'General Purpose': ['t3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge', 'm5.large', 'm5.xlarge', 'm5.2xlarge'],
  'Compute Optimized': ['c5.large', 'c5.xlarge', 'c5.2xlarge'],
  'Memory Optimized': ['r5.large', 'r5.xlarge', 'r5.2xlarge'],
};

const AZURE_BY_FAMILY = {
  'General Purpose': ['B1s', 'B1ms', 'B2s', 'B2ms', 'D2s_v3', 'D4s_v3', 'D8s_v3'],
  'Compute Optimized': ['F2s_v2', 'F4s_v2', 'F8s_v2'],
  'Memory Optimized': ['E2s_v3', 'E4s_v3', 'E8s_v3'],
};

const GCP_BY_FAMILY = {
  'General Purpose': ['e2-micro', 'e2-small', 'e2-standard-2', 'e2-standard-4', 'n2-standard-2', 'n2-standard-4', 'n2-standard-8'],
  'Compute Optimized': ['c2-standard-4', 'c2-standard-8', 'c2-standard-16'],
  'Memory Optimized': ['n2-highmem-2', 'n2-highmem-4', 'n2-highmem-8'],
};

const AWS_INSTANCES = [
  't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge',
  'm5.large', 'm5.xlarge', 'm5.2xlarge',
  'c5.large', 'c5.xlarge', 'c5.2xlarge',
  'r5.large', 'r5.xlarge', 'r5.2xlarge',
];

const INSTANCE_FAMILIES = {
  'General Purpose': ['t3.micro', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge'],
  'Compute Optimized': ['c5.large', 'c5.xlarge', 'c5.2xlarge'],
  'Memory Optimized': ['r5.large', 'r5.xlarge', 'r5.2xlarge'],
  'GPU': ['g4dn.xlarge', 'g4dn.2xlarge', 'p3.2xlarge'],
};

// Instance descriptions for use cases
const INSTANCE_DESCRIPTIONS = {
  'General Purpose': {
    'AWS': {
      't3.micro': '🌱 Burstable - 2 vCPU, 1GB. Development, low-traffic sites, small databases.',
      't3.small': '🌱 Burstable - 2 vCPU, 2GB. Small websites, dev servers, microservices.',
      't3.medium': '🌱 Burstable - 2 vCPU, 4GB. Medium databases, web servers, CI/CD builders.',
      't3.large': '🌱 Burstable - 2 vCPU, 8GB. Medium databases, production web servers.',
      't3.xlarge': '🌱 Burstable - 4 vCPU, 16GB. Large web apps, multiple microservices.',
      'm5.large': '⚖️ General Purpose - 2 vCPU, 8GB. Balanced for web servers, small databases.',
      'm5.xlarge': '⚖️ General Purpose - 4 vCPU, 16GB. Enterprise apps, medium workloads.',
      'm5.2xlarge': '⚖️ General Purpose - 8 vCPU, 32GB. Production web apps, moderate databases.',
    },
    'Azure': {
      'B1s': '🌱 Burstable - 1 vCPU, 1GB. Dev/test servers, small databases.',
      'B1ms': '🌱 Burstable - 1 vCPU, 2GB. Small web servers, dev environments.',
      'B2s': '🌱 Burstable - 2 vCPU, 4GB. Small production workloads, CI/CD.',
      'B2ms': '🌱 Burstable - 2 vCPU, 8GB. Medium web servers, small databases.',
      'D2s_v3': '⚖️ General Purpose - 2 vCPU, 8GB. Web servers, small databases.',
      'D4s_v3': '⚖️ General Purpose - 4 vCPU, 16GB. Enterprise apps, medium databases.',
      'D8s_v3': '⚖️ General Purpose - 8 vCPU, 32GB. Production farms, larger databases.',
    },
    'GCP': {
      'e2-micro': '🌱 General Purpose - 2 vCPU, 1GB. Dev/test, free tier eligible.',
      'e2-small': '🌱 General Purpose - 2 vCPU, 2GB. Small web servers, dev environments.',
      'e2-standard-2': '⚖️ General Purpose - 2 vCPU, 8GB. Small to medium production.',
      'e2-standard-4': '⚖️ General Purpose - 4 vCPU, 16GB. Web servers, small databases.',
      'n2-standard-2': '⚖️ General Purpose - 2 vCPU, 8GB. Balanced compute/memory.',
      'n2-standard-4': '⚖️ General Purpose - 4 vCPU, 16GB. Enterprise web apps.',
      'n2-standard-8': '⚖️ General Purpose - 8 vCPU, 32GB. Production apps, larger databases.',
    },
  },
  'Compute Optimized': {
    'AWS': {
      'c5.large': '⚡ Compute Optimized - 2 vCPU, 4GB. Batch processing, ad serving, ML inference.',
      'c5.xlarge': '⚡ Compute Optimized - 4 vCPU, 8GB. High-perf web servers, scientific modeling.',
      'c5.2xlarge': '⚡ Compute Optimized - 8 vCPU, 16GB. High-traffic servers, video encoding, gaming.',
    },
    'Azure': {
      'F2s_v2': '⚡ Compute Optimized - 2 vCPU, 4GB. Batch, web servers, analytics.',
      'F4s_v2': '⚡ Compute Optimized - 4 vCPU, 8GB. Gaming servers, ad serving, video encoding.',
      'F8s_v2': '⚡ Compute Optimized - 8 vCPU, 16GB. HPC, scientific modeling.',
    },
    'GCP': {
      'c2-standard-4': '⚡ Compute Optimized - 4 vCPU, 16GB. Batch processing, video encoding, gaming.',
      'c2-standard-8': '⚡ Compute Optimized - 8 vCPU, 32GB. HPC, ad serving.',
      'c2-standard-16': '⚡ Compute Optimized - 16 vCPU, 64GB. Scientific computing, machine learning.',
    },
  },
  'Memory Optimized': {
    'AWS': {
      'r5.large': '💾 Memory Optimized - 2 vCPU, 16GB. In-memory caches, real-time analytics.',
      'r5.xlarge': '💾 Memory Optimized - 4 vCPU, 32GB. Large databases, SAP HANA, analytics.',
      'r5.2xlarge': '💾 Memory Optimized - 8 vCPU, 64GB. High-perf databases, graph databases.',
    },
    'Azure': {
      'E2s_v3': '💾 Memory Optimized - 2 vCPU, 16GB. In-memory analytics, relational databases.',
      'E4s_v3': '💾 Memory Optimized - 4 vCPU, 32GB. Large databases, SAP workloads.',
      'E8s_v3': '💾 Memory Optimized - 8 vCPU, 64GB. In-memory caches, big data analytics.',
    },
    'GCP': {
      'n2-highmem-2': '💾 Memory Optimized - 2 vCPU, 16GB. In-memory caches, real-time analytics.',
      'n2-highmem-4': '💾 Memory Optimized - 4 vCPU, 32GB. Large databases, SAP/ERP workloads.',
      'n2-highmem-8': '💾 Memory Optimized - 8 vCPU, 64GB. High-perf databases, in-memory stores.',
    },
  },
};


const OS_TYPES = ['Linux', 'Windows'];
const PRICING_MODELS = ['On-Demand', 'Reserved 1 Year', 'Reserved 3 Year', 'Spot'];

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

// Helper to download CSV with horizontal provider comparison - comprehensive details
const downloadCSV = (rows, filename = 'pricing_comparison.csv') => {
  if (!rows || rows.length === 0) return;
  
  const providers = [...new Set(rows.map(r => r.provider))];
  
  // Create detailed header
  let csv = 'Instance Type,' + providers.map(p => `${p} (Hourly)`).join(',') + ',' + providers.map(p => `${p} (Monthly)`).join(',') + ',' + providers.map(p => `${p} (Annual)`).join(',') + ',' + providers.map(p => `${p} (vCPU)`).join(',') + ',' + providers.map(p => `${p} (RAM GB)`).join(',') + '\n';
  
  // Get unique instance types
  const instances = [...new Set(rows.map(r => r.instance_type))];
  
  // Build rows with all details
  instances.forEach(inst => {
    const row = [inst];
    
    // Add hourly rates
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      row.push(pricing ? fmt(pricing.hourly_rate || 0) : 'N/A');
    });
    
    // Add monthly rates
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      row.push(pricing ? fmt(pricing.monthly_rate || 0) : 'N/A');
    });
    
    // Add annual rates
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) {
        // ✅ Calculate annual from monthly if not available
        const annual = (pricing.annual_rate ?? (pricing.monthly_rate * 12)) || 0;
        row.push(fmt(annual));
      } else {
        row.push('N/A');
      }
    });
    
    // Add vCPU - use !== to avoid treating 0 as falsy
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) {
        row.push(pricing.vcpu !== null && pricing.vcpu !== undefined && pricing.vcpu !== 'N/A' ? pricing.vcpu : 'N/A');
      } else {
        row.push('N/A');
      }
    });
    
    // Add RAM - use !== to avoid treating 0 as falsy
    providers.forEach(provider => {
      const pricing = rows.find(r => r.instance_type === inst && r.provider === provider);
      if (pricing) {
        row.push(pricing.ram !== null && pricing.ram !== undefined && pricing.ram !== 'N/A' ? pricing.ram : 'N/A');
      } else {
        row.push('N/A');
      }
    });
    
    csv += row.join(',') + '\n';
  });
  
  // Download
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ width: '100%', pt: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

// ============================================================
// LIVE API PRICES TAB
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
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);


  // Get instance families for selected reference provider
  const getFamiliesForProvider = (provider) => {
    switch(provider) {
      case 'AWS': return AWS_BY_FAMILY;
      case 'Azure': return AZURE_BY_FAMILY;
      case 'GCP': return GCP_BY_FAMILY;
      default: return AWS_BY_FAMILY;
    }
  };

  const currentFamilies = getFamiliesForProvider(referenceProvider);
  const familyOptions = Object.keys(currentFamilies);
  const instanceOptions = currentFamilies[family] || [];

  // Update instance when family changes
  useEffect(() => {
    if (instanceOptions.length > 0 && !instanceOptions.includes(instance)) {
      setInstance(instanceOptions[0]);
    }
  }, [family, referenceProvider, instanceOptions]);

  // Update instance when reference provider changes
  useEffect(() => {
    setFamily(Object.keys(getFamiliesForProvider(referenceProvider))[0]);
  }, [referenceProvider]);

  useEffect(() => {    setCredentialsLoaded(true);
  }, []);

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    setResults(null);
   
//     const providers = ["AWS", "Azure", "GCP"];

//     const allResults = {};

//     for (const provider of providers) {
//       try {
//         const mappedInstance =
//           INSTANCE_MAPPING[provider]?.[instance] || instance;

//         const region = REGIONS[regionLabel]?.[provider];

//         if (!region) continue;

//         const { data } = await comparePrices(
//           {
//             resource_type: "ec2",
//             specifications: {
//               instance_type: mappedInstance,
//               os: osType,
//               reference_provider: provider,
//             },
//             regions: [region],    // STRING ONLY ✅
//             pricing_model: pricingModel,
//           },
//           openaiApiKey
//         );

//         allResults[provider] = data;
//       } catch (e) {
//         console.error(`Error fetching ${provider}`, e);
//       }
//     }

// setResults(allResults);
    try {
      // ✅ Extract provider-specific region string from REGIONS dict
      const regionDict = REGIONS[regionLabel];
      if (!regionDict) {
        throw new Error(`Region "${regionLabel}" not found in REGIONS mapping`);
      }
      const regionString = regionDict[referenceProvider];
      if (!regionString) {
        throw new Error(`${referenceProvider} region not found for "${regionLabel}"`);
      }
      const { data } = await comparePrices({
        resource_type: 'ec2',
        specifications: { 
            instance_type:
              INSTANCE_MAPPING[referenceProvider]?.[instance] || instance,
                    os: osType, reference_provider: referenceProvider },
                    regions: [regionString],  // ✅ Pass extracted string
        pricing_model:
          referenceProvider === 'GCP'
            ? 'Committed'
            : pricingModel,
              }, openaiApiKey);
              setResults(data);
            } catch (e) {
              //setError(e.response?.data?.detail || e.message || 'Failed to fetch prices');
              setError(
                        e?.response?.data?.detail ||
                        e?.message ||
                        JSON.stringify(e, null, 2) ||
                        "Failed to fetch prices"
                      );
            } finally {
              setLoading(false);
            }



  };

  // Parse results into rows - handles both nested and flat structures
  // const rows = results
  //   ? Object.entries(results)
  //       .filter(([k]) => !k.startsWith('_'))
  //       .map(([key, val], i) => {
  //         // Handle both string JSON and object formats
  //         const d = typeof val === 'string' ? JSON.parse(val) : val;
          
  //         // Skip if error
  //         if (d?.error) return null;
          
  //         // Parse vCPU - handle different field names and 0 values
  //         let vcpu = 'N/A';
  //         if (d?.vcpu !== undefined && d?.vcpu !== null) {
  //           vcpu = Number(d.vcpu);
  //         } else if (d?.vCPU !== undefined && d?.vCPU !== null) {
  //           vcpu = Number(d.vCPU);
  //         }
          
  //         // Parse RAM - handle different field names and 0 values
  //         let ram = 'N/A';
  //         if (d?.ram !== undefined && d?.ram !== null) {
  //           ram = Number(d.ram);
  //         } else if (d?.['RAM (GB)'] !== undefined && d?.['RAM (GB)'] !== null) {
  //           ram = Number(d['RAM (GB)']);
  //         }
          
  //         return {
  //           id: i,
  //           provider: (d?.provider || key).toUpperCase(),
  //           instance_type: d?.instance_type || instance,
  //           vcpu: vcpu,
  //           ram: ram,
  //           family: d?.family || 'N/A',
  //           region: d?.region || REGIONS[regionLabel],
  //           pricing_model: d?.pricing_model || pricingModel,
  //           hourly_rate: d?.hourly_rate || d?.hourly || null,
  //           monthly_rate: d?.monthly_rate || d?.monthly || null,
  //           annual_rate: d?.annual_rate || d?.annual || null,
  //           source: d?.source || 'api'
  //         };
  //       })
  //       .filter((r) => r && r.monthly_rate != null)
  //   : [];

const rows = useMemo(() => {
  if (!results) return [];

  return Object.entries(results)
    .filter(([k]) => !k.startsWith("_"))
    .map(([key, val], i) => {
      const parsed = parsePricingRow(val, key, {
        instance,
        region: REGIONS[regionLabel],
        pricingModel,
      });

      if (!parsed || parsed.monthly_rate == null) return null;

      return {
        id: i,
        ...parsed,
        // ✅ Ensure annual_rate is always set: monthly * 12
        annual_rate: parsed.annual_rate ?? (parsed.monthly_rate * 12),
      };
    })
    .filter(Boolean);
}, [results, instance, pricingModel, regionLabel]);


  // Log for debugging vCPU/RAM/Annual issues
  if (rows.length > 0) {
    console.log('🔍 Parsed pricing rows:', rows.map(r => ({
      provider: r.provider,
      instance: r.instance_type,
      vcpu: r.vcpu,
      ram: r.ram,
      hourly: r.hourly_rate,
      monthly: r.monthly_rate,
      annual: r.annual_rate,
      source: r.source
    })));
  }

  // Generate recommendations based on pricing and specs
  // const getRecommendations = () => {
  //   if (rows.length === 0) return {};
    
  //   const cheapest = rows.reduce((a, b) => (a.monthly_rate < b.monthly_rate ? a : b));
  //   const mostExpensive = rows.reduce((a, b) => (a.monthly_rate > b.monthly_rate ? a : b));
    
  //   // Best for performance (highest vCPU per dollar)
  //   const bestPerf = rows.reduce((best, curr) => {
  //     const currValue = (parseInt(curr.vcpu) || 1) / curr.monthly_rate;
  //     const bestValue = (parseInt(best.vcpu) || 1) / best.monthly_rate;
  //     return currValue > bestValue ? curr : best;
  //   });

  //   return {
  //     cheapest,
  //     bestPerf,
  //     savings: (mostExpensive.monthly_rate - cheapest.monthly_rate) * 12
  //   };
  // };
const getRecommendations = () => {
  if (rows.length === 0) return {};

  const cheapest = rows.reduce((a, b) =>
    a.monthly_rate < b.monthly_rate ? a : b
  );

  const mostExpensive = rows.reduce((a, b) =>
    a.monthly_rate > b.monthly_rate ? a : b
  );

  const bestPerf = rows.reduce((best, curr) => {
    const currValue = curr.monthly_rate
      ? (parseInt(curr.vcpu) || 1) / curr.monthly_rate
      : 0;

    const bestValue = best.monthly_rate
      ? (parseInt(best.vcpu) || 1) / best.monthly_rate
      : 0;

    return currValue > bestValue ? curr : best;
  });

  return {
    cheapest,
    bestPerf,
    savings: (mostExpensive.monthly_rate - cheapest.monthly_rate) * 12,
  };
};


  //const recommendations = getRecommendations();
  const recommendations = useMemo(() => getRecommendations(), [rows]);
  const cheapest = recommendations.cheapest;
  const bestPerf = recommendations.bestPerf;



{!loading && rows.length === 0 && !error && (
  <Alert severity="info">No pricing data found</Alert>
)}


  const barData = rows.length
    ? [{
        type: 'bar',
        x: rows.map((r) => r.provider),
        y: rows.map((r) => r.monthly_rate * quantity),
        text: rows.map((r) => fmt(r.monthly_rate * quantity)),
        textposition: 'outside',
        marker: { 
          color: rows.map((r) => {
            if (r.provider === cheapest?.provider) return '#4caf50';
            if (r.provider === bestPerf?.provider) return '#ff9800';
            return '#2196f3';
          })
        },
      }]
    : [];

  const columns = [
    { field: 'provider', headerName: 'Provider', width: 80, fontWeight: 'bold' },
    { field: 'instance_type', headerName: 'Instance', width: 100 },
    { field: 'vcpu', headerName: 'vCPU', width: 70 },
    { field: 'ram', headerName: 'RAM (GB)', width: 80 },
    { field: 'family', headerName: 'Family', width: 100 },
    { field: 'pricing_model', headerName: 'Model', width: 110 },
    { field: 'hourly_rate', headerName: 'Hourly', width: 90, valueFormatter: ({ value }) => value ? fmt(value) : '-' },
    { field: 'monthly_rate', headerName: 'Monthly', width: 100, valueFormatter: ({ value }) => fmt(value) },
    {
      field: "annual_rate",
      headerName: "Annual",
      width: 100,
      valueFormatter: (params) => {
        const row = params?.row;
        if (!row) return "-";
        // ✅ annual_rate is guaranteed to be set (monthly * 12)
        return fmt(row.annual_rate || 0);
      },
    },
    { field: 'total_monthly', headerName: `Total (x${quantity})`, width: 110, valueGetter: ({ row }) => row.monthly_rate * quantity, valueFormatter: ({ value }) => fmt(value) },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* <Alert severity="info" sx={{ mb: 2 }}>
        🌐 <strong>Live API Prices</strong> — Real-time pricing from cloud providers (AWS/Azure/GCP)
        {credentialsLoaded && <span style={{ marginLeft: '8px' }}>✅ Credentials loaded from environment</span>}
      </Alert> */}

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Reference Provider"
              value={referenceProvider}
              onChange={(e) => setReferenceProvider(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {['AWS', 'Azure', 'GCP'].map((p) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Family"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {familyOptions.map((f) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Instance"
              value={instance} onChange={(e) => setInstance(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {instanceOptions.map((i) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={i} value={i}>{i}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Region"
              value={regionLabel} onChange={(e) => setRegionLabel(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {Object.keys(REGIONS).map((r) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              select size="small" fullWidth label="OS"
              value={osType} onChange={(e) => setOsType(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {OS_TYPES.map((os) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={os} value={os}>{os}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              select size="small" fullWidth label="Model"
              value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {PRICING_MODELS.map((pm) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={pm} value={pm}>{pm}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={0.5}>
            <TextField
              type="number" size="small" fullWidth label="Qty"
              value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' }, minHeight: '40px' } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained" fullWidth onClick={handleCompare}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
              size="medium"
              sx={{ fontSize: '0.85rem', height: '40px' }}
            >
              {loading ? 'Fetching...' : 'Compare'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Instance Description */}
      {INSTANCE_DESCRIPTIONS[family]?.[referenceProvider]?.[instance] && (
        <Alert severity="success" sx={{ mb: 2, fontSize: '0.9rem' }}>
          <strong>{referenceProvider} {instance}:</strong> {INSTANCE_DESCRIPTIONS[family][referenceProvider][instance]}
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {rows.length > 0 && (
        <>
          {/* Recommendations Cards */}
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title="Lowest monthly cost across all providers">
                <Paper sx={{ p: 1.5, backgroundColor: '#c8e6c9', cursor: 'pointer' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#1b5e20' }}>💚 Best for Cost Optimization</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
                    {cheapest?.provider} {fmt(cheapest?.monthly_rate)}/mo
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#1b5e20' }}>
                    Save ${fmt((recommendations.savings || 0) / 12)}/mo
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title="Best vCPU per dollar value">
                <Paper sx={{ p: 1.5, backgroundColor: '#ffe0b2', cursor: 'pointer' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#e65100' }}>⚡ Best Performance Value</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                    {bestPerf?.provider} {bestPerf?.vcpu} vCPU
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#e65100' }}>
                    {((parseInt(bestPerf?.vcpu) || 1) / bestPerf?.monthly_rate).toFixed(2)} vCPU/$
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Monthly Savings"
                value={fmt(Math.max(...rows.map((r) => r.monthly_rate)) - (cheapest?.monthly_rate || 0))}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title="Annual savings if using cheapest option">
                <Paper sx={{ p: 1.5, backgroundColor: '#bbdefb', cursor: 'pointer' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#01579b' }}>📊 Annual Savings</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#01579b' }}>
                    {fmt(recommendations.savings || 0)}/year
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#01579b' }}>
                    vs most expensive option
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            {/* <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Annual Savings"
                value={fmt((Math.max(...rows.map((r) => r.monthly_rate)) - (cheapest?.monthly_rate || 0)) * 12)}
                color="info"
              />
            </Grid> */}
            {/* <Grid item xs={12} sm={6} md={3}>
              <Tooltip title="Providers available for this configuration">
                <Paper sx={{ p: 1.5, backgroundColor: '#f3e5f5', cursor: 'pointer' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#4a148c' }}>☁️ Providers Available</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4a148c' }}>
                    {rows.length} Cloud Provider{rows.length > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#4a148c' }}>
                    {rows.map(r => r.provider).join(', ')}
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid> */}
          </Grid>

          {/* Charts & Table */}
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 1.5 }}>
                <Plot
                  data={barData}
                  layout={{
                    title: `Monthly Cost Comparison (x${quantity})`,
                    height: 350,
                    margin: { t: 40, b: 40, l: 60, r: 20 },
                    xaxis: { tickfont: { size: 10 } },
                    yaxis: { title: 'USD/month', tickfont: { size: 10 } },
                    showlegend: false,
                    font: { size: 10 }
                  }}
                  config={{ displayModeBar: false, responsive: true }}
                  style={{ width: '100%' }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">📊 Price Summary</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => downloadCSV(rows, 'pricing_comparison.csv')}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    CSV
                  </Button>
                </Box>
                <TableContainer sx={{ maxHeight: '100%' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Provider</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Instance</TableCell>
                        <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>vCPU</TableCell>
                        <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>RAM</TableCell>
                        <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Monthly</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, idx) => (
                        <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? '#f5f5f5' : '#fff' }}>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{row.provider}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{row.instance_type}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{row.vcpu}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{row.ram}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem', color: row.provider === cheapest?.provider ? '#4caf50' : '#000', fontWeight: row.provider === cheapest?.provider ? 'bold' : 'normal' }}>
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

          {/* Detailed Table */}
          <Paper sx={{ p: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              📋 Detailed Pricing
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <DataGrid 
                rows={rows} 
                columns={columns} 
                autoHeight={false}
                disableSelectionOnClick 
                sx={{ fontSize: '0.75rem', '& .MuiDataGrid-cell': { padding: '4px 8px' } }} 
              />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}

// ============================================================
// OFFLINE DATABASE TAB
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
    setResults(null);
    try {
      // ✅ Extract AWS region from REGIONS dict (OfflineTab defaults to AWS)
      const regionDict = REGIONS[region];
      if (!regionDict) {
        throw new Error(`Region "${region}" not found in REGIONS mapping`);
      }
      const regionString = regionDict['AWS'];  // Default to AWS for offline tab
      if (!regionString) {
        throw new Error(`AWS region not found for "${region}"`);
      }

      const { data } = await comparePrices({
        resource_type: 'ec2',
        specifications: { 
            instance_type: instance,
  //INSTANCE_MAPPING[referenceProvider]?.[instance] || instance,
            os: osType },
            regions: [regionString],  // ✅ Pass extracted string
        
            pricing_model: pricingModel,
                offline: true,
              }, openaiApiKey);
      setResults(data);
    } catch (e) {
      //setError(e.response?.data?.detail || e.message || 'Failed to fetch offline prices');
      setError(
            e?.response?.data?.detail ||
            e?.message ||
            JSON.stringify(e, null, 2) ||
            "Failed to fetch offline prices"
          );
    } finally {
      setLoading(false);
    }
  };

  const rows = results
    ? Object.entries(results)
        .filter(([k]) => !k.startsWith('_'))
        .map(([key, val], i) => {
          //const d = typeof val === 'string' ? JSON.parse(val) : val;
          const parsed = parsePricingRow(val, key, { instance });
          if (!parsed || parsed.monthly_rate == null) return null;

          return {
            id: i,
            ...parsed,
          };
          
          // Skip if error
          if (d?.error) return null;
          
          return {
            id: i,
            provider: (d?.provider || key).toUpperCase(),
            instance_type: d?.instance_type || instance,
            vcpu: d?.vcpu || 'N/A',
            ram: d?.ram || 'N/A',
            family: d?.family || 'N/A',
            hourly_rate: d?.hourly_rate || d?.hourly || null,
            monthly_rate: d?.monthly_rate || d?.monthly || null,
            annual_rate: d?.annual_rate || d?.annual || null,
            source: d?.source || 'Offline DB',
          };
        })
        .filter((r) => r && (r.monthly_rate !== null && r.monthly_rate !== undefined))
    : [];

  const cheapest = rows.length ? rows.reduce((a, b) => (a.monthly_rate < b.monthly_rate ? a : b)) : null;
  const most_expensive = rows.length ? rows.reduce((a, b) => (a.monthly_rate > b.monthly_rate ? a : b)) : null;

  const columns = [
    { field: 'provider', headerName: 'Provider', width: 90, fontWeight: 'bold' },
    { field: 'instance_type', headerName: 'Instance', width: 100 },
    { field: 'vcpu', headerName: 'vCPU', width: 70 },
    { field: 'ram', headerName: 'RAM (GB)', width: 80 },
    { field: 'family', headerName: 'Family', width: 100 },
    { field: 'hourly_rate', headerName: 'Hourly', width: 90, valueFormatter: ({ value }) => value ? fmt(value) : '-' },
    { field: 'monthly_rate', headerName: 'Monthly', width: 100, valueFormatter: ({ value }) => fmt(value) },
    { field: 'annual_rate', headerName: 'Annual', width: 100, valueFormatter: (params) => {
      // ✅ Simple: annual = monthly * 12
      const monthly = params.row?.monthly_rate || 0;
      return fmt(monthly * 12);
    }},
    { field: 'total', headerName: `Total (x${quantity})`, width: 110, valueGetter: ({ row }) => row.monthly_rate * quantity, valueFormatter: ({ value }) => fmt(value) },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="success" sx={{ mb: 2 }}>
        📦 <strong>Offline Database</strong> — Pre-loaded pricing data (instant results, no API calls)
      </Alert>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select size="small" fullWidth label="Instance"
              value={instance} onChange={(e) => setInstance(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {AWS_INSTANCES.map((i) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={i} value={i}>{i}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select size="small" fullWidth label="Region"
              value={region} onChange={(e) => setRegion(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {Object.keys(REGIONS).map((r) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="OS"
              value={osType} onChange={(e) => setOsType(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {OS_TYPES.map((os) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={os} value={os}>{os}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="Model"
              value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {PRICING_MODELS.map((pm) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={pm} value={pm}>{pm}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <TextField
              type="number" size="small" fullWidth label="Qty"
              value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' }, minHeight: '40px' } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained" fullWidth onClick={handleFetch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
              size="medium"
              sx={{ fontSize: '0.85rem', height: '40px' }}
            >
              {loading ? 'Loading...' : 'Get Prices'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {rows.length > 0 && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard 
                label="Cheapest" 
                value={cheapest?.provider} 
                color="success"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard 
                label="Lowest Price" 
                value={fmt(cheapest?.monthly_rate)} 
                color="success"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Monthly Savings"
                value={fmt((most_expensive?.monthly_rate || 0) - (cheapest?.monthly_rate || 0))}
                color="info"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Results Found"
                value={rows.length}
                color="info"
              />
            </Grid>
          </Grid>

          {/* Data Table */}
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              📋 All Results ({rows.length} instances)
            </Typography>
            <Box sx={{ height: 450, width: '100%' }}>
              <DataGrid 
                rows={rows} 
                columns={columns} 
                autoHeight={false}
                disableSelectionOnClick 
                sx={{ fontSize: '0.75rem', '& .MuiDataGrid-cell': { padding: '4px 8px' } }} 
              />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}

// ============================================================
// GRID VIEW TAB (ALL INSTANCES)
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

  const handleLoadGrid = async () => {
    setLoading(true);
    setError('');
    setGridData([]);
    try {
      // ✅ Extract AWS region from REGIONS dict (GridViewTab defaults to AWS)
      const regionDict = REGIONS[region];
      if (!regionDict) {
        throw new Error(`Region "${region}" not found in REGIONS mapping`);
      }
      const regionString = regionDict['AWS'];  // Default to AWS for grid view
      if (!regionString) {
        throw new Error(`AWS region not found for "${region}"`);
      }

      const { data } = await comparePrices({
        resource_type: 'ec2',
        regions: [regionString],  // ✅ Pass extracted string in array
        os_type: osType,
        pricing_model: pricingModel,  // ✅ Use the local pricingModel state
        get_all: true,
      }, openaiApiKey);
      
      // Process response from backend - handles both flat and nested structures
      const instances = [];
      Object.entries(data).forEach(([provider, providerData]) => {
        if (providerData?.instances && Array.isArray(providerData.instances)) {
          providerData.instances.forEach((inst, idx) => {
            // instances.push({
            //   id: `${provider}_${idx}`,
            //   provider: inst.Provider || provider.toUpperCase(),
            //   instance: inst.Instance || inst.instance_type || 'N/A',
            //   vcpu: inst.vCPU || inst.vcpu || 0,
            //   memory: inst['RAM (GB)'] || inst.ram || 0,
            //   family: inst.Family || inst.family || 'N/A',
            //   hourly: inst.Hourly || inst.hourly || 0,
            //   monthly: inst.Monthly || inst.monthly || 0,
            //   annual: inst.Annual || inst.annual || 0,
            // });
          instances.push({
            id: `${provider}_${idx}`,
            provider: String(inst.Provider || provider).toUpperCase(),
            instance: inst.Instance || inst.instance_type || "N/A",
            vcpu: inst.vCPU ?? inst.vcpu ?? null,
            memory: inst["RAM (GB)"] ?? inst.ram ?? null,
            hourly: inst.Hourly ?? inst.hourly ?? null,
            monthly: inst.Monthly ?? inst.monthly ?? null,
            annual: inst.Annual ?? inst.annual ?? null,
          });

          });
        }
      });
      setGridData(instances);
    } catch (e) {
      //setError(e.response?.data?.detail || e.message || 'Failed to load instance data');
      setError(
            e?.response?.data?.detail ||
            e?.message ||
            JSON.stringify(e, null, 2) ||
            "Failed to load instance data"
          );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstance = (id) => {
    const newSet = new Set(selectedInstances);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedInstances(newSet);
  };

  // Filter data based on criteria
  const filteredData = gridData.filter(
    (row) => row.vcpu >= minVcpu && row.monthly <= maxPrice
  );

  const selectedData = gridData.filter((row) => selectedInstances.has(row.id));

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        📊 <strong>Grid View</strong> — Browse all available instances with instant pricing
      </Alert>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select size="small" fullWidth label="Region"
              value={region} onChange={(e) => setRegion(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {Object.keys(REGIONS).map((r) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select size="small" fullWidth label="OS"
              value={osType} onChange={(e) => setOsType(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {OS_TYPES.map((os) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={os} value={os}>{os}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select size="small" fullWidth label="Pricing Model"
              value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' } } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {PRICING_MODELS.map((pm) => (
                <MenuItem sx={{ fontSize: '0.85rem' }} key={pm} value={pm}>{pm}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              type="number" size="small" fullWidth label="Min vCPU"
              //value={minVcpu} onChange={(e) => setMinVcpu(parseInt(e.target.value) || 0)}
              value={minVcpu} onChange={(e) => {const val = parseInt(e.target.value); setMinVcpu(Number.isNaN(val) ? 1 : val);}}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' }, minHeight: '40px' } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <TextField
              type="number" size="small" fullWidth label="Max Price/mo"
              //value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value) || 1000)}
              value={maxPrice} onChange={(e) => {const val = parseInt(e.target.value); setMaxPrice(Number.isNaN(val) ? 1000 : val);}}
              InputProps={{ sx: { '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: '0.85rem' }, minHeight: '40px' } }}
              InputLabelProps={{ sx: { fontSize: '0.85rem' } }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button
              variant="contained" fullWidth onClick={handleLoadGrid}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
              size="medium"
              sx={{ fontSize: '0.85rem', height: '40px' }}
            >
              {loading ? 'Loading...' : 'Load Grid'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {gridData.length > 0 && (
        <>
          {/* Info Cards */}
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Total Instances"
                value={gridData.length}
                color="info"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Showing"
                value={filteredData.length}
                color="info"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Selected"
                value={selectedInstances.size}
                color="success"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Selected Total"
                value={fmt(selectedData.reduce((sum, r) => sum + r.monthly, 0))}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Data Table */}
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              📋 {filteredData.length} instances ({selectedInstances.size} selected) - Filtered by vCPU ≥ {minVcpu} and Price ≤ ${maxPrice}/mo
            </Typography>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead sx={{ backgroundColor: '#1976d2' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Select</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Provider</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Instance</TableCell>
                    <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>vCPU</TableCell>
                    <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Memory (GB)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Family</TableCell>
                    <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Hourly</TableCell>
                    <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Monthly</TableCell>
                    <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>Annual</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, idx) => (
                    <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? '#f5f5f5' : '#fff', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                      <TableCell sx={{ fontSize: '0.8rem' }}>
                        <Checkbox
                          size="small"
                          checked={selectedInstances.has(row.id)}
                          onChange={() => handleSelectInstance(row.id)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{row.provider}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.instance}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{row.vcpu}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{row.memory}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.family}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#ff9800' }}>{fmt(row.hourly)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: 'bold' }}>{fmt(row.monthly)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#2e7d32' }}>{fmt(row.annual ?? row.monthly * 12)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Selected Summary */}
          {selectedInstances.size > 0 && (
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#e8f5e9' }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                ✅ Selected Instances Summary
              </Typography>
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
                  <MetricCard label="Avg vCPU" value={(selectedData.reduce((sum, r) => sum + r.vcpu, 0) / selectedInstances.size).toFixed(1)} color="info" />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <MetricCard label="Avg RAM" value={(selectedData.reduce((sum, r) => sum + r.memory, 0) / selectedInstances.size).toFixed(1)} color="info" />
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
// MAIN COMPONENT WITH TAB NAVIGATION
// ============================================================
export default function Tab2Pricing() {
  const { openaiApiKey } = useAppStore();
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>💰 Multi-Cloud Price Comparison</Typography>
      </Box>

      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#1976d2', height: 3 },
            '& .MuiTab-root': { fontSize: '0.85rem', fontWeight: 500, textTransform: 'none' },
            '& .Mui-selected': { color: '#1976d2', fontWeight: 600 },
          }}
        >
          <Tab label="🌐 Live API Prices" />
          <Tab label="📦 Offline Database" />
          <Tab label="📊 Grid View (All Instances)" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <LiveApiTab openaiApiKey={openaiApiKey} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <OfflineTab openaiApiKey={openaiApiKey} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <GridViewTab openaiApiKey={openaiApiKey} />
      </TabPanel>
    </Box>
  );
}
