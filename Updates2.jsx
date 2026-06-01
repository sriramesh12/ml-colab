 a single accordion that contains all three providers side-by-side in a grid layout for easy comparison. That's much better for comparison!

Single Accordion with 3 Providers Side-by-Side

```jsx
// In ScenarioAnalyzerTab.jsx - Single accordion with 3 providers in grid

<Accordion defaultExpanded={true} sx={{ mb: 3 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
            <Typography variant="h6" fontWeight="bold">💰 Cost Breakdown by Provider</Typography>
            <Chip 
                label={`Total: ${fmt(analysisResult.cost_estimates.reduce((sum, c) => sum + c.estimated_monthly_cost, 0))}`} 
                size="small" 
                color="info" 
            />
        </Box>
    </AccordionSummary>
    
    <AccordionDetails>
        {/* 3-column grid for providers */}
        <Grid container spacing={2}>
            {analysisResult.cost_estimates && analysisResult.cost_estimates.map((cost, idx) => {
                const breakdown = cost.breakdown || {};
                const total = cost.estimated_monthly_cost;
                const volumeInfo = cost.volume_info || {};
                
                // Calculate metrics
                const totalCost = analysisResult.cost_estimates.reduce((sum, c) => sum + c.estimated_monthly_cost, 0);
                const percentage = (total / totalCost * 100).toFixed(1);
                
                // Find cheapest and most expensive services
                const services = Object.entries(breakdown);
                const cheapestService = services.length ? services.reduce((a, b) => (a[1] < b[1]) ? a : b, services[0]) : ['', 0];
                const mostExpensiveService = services.length ? services.reduce((a, b) => (a[1] > b[1]) ? a : b, services[0]) : ['', 0];
                const avgCost = services.length ? total / services.length : 0;
                
                // Find best provider
                const cheapestProvider = analysisResult.cost_estimates.reduce((a, b) => 
                    a.estimated_monthly_cost < b.estimated_monthly_cost ? a : b
                );
                const isCheapest = cost.provider === cheapestProvider?.provider;
                const savingsPercent = isCheapest && cheapestProvider ? 
                    Math.round((cheapestProvider.estimated_monthly_cost / total * 100)) : 0;
                
                return (
                    <Grid item xs={12} md={4} key={idx}>
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 1.5, 
                                height: '100%',
                                bgcolor: PROVIDER_COLORS[cost.provider]?.light || '#fafafa',
                                borderTop: `3px solid ${PROVIDER_COLORS[cost.provider]?.bg}`,
                                position: 'relative'
                            }}
                        >
                            {/* Provider Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {cost.provider}
                                </Typography>
                                {isCheapest && (
                                    <Tooltip title="Best value provider">
                                        <Chip 
                                            label="Best Value"
                                            size="small"
                                            color="success"
                                            icon={<CheckCircleIcon />}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                            
                            {/* Total Cost */}
                            <Typography variant="h4" fontWeight="bold" color={PROVIDER_COLORS[cost.provider]?.bg} gutterBottom>
                                {fmt(total)}
                                <Typography component="span" variant="caption" color="text.secondary">/month</Typography>
                            </Typography>
                            
                            {/* Percentage of total */}
                            <Chip 
                                label={`${percentage}% of total`}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 1.5 }}
                            />
                            
                            {/* Volume Badges - Compact */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                <Tooltip title="Workload volume level">
                                    <Chip 
                                        label={`${volumeInfo.level?.toUpperCase()} Volume`}
                                        size="small"
                                        color={volumeInfo.level === 'high' ? 'error' : volumeInfo.level === 'medium' ? 'warning' : 'success'}
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title={`${Math.round(volumeInfo.multiplier * 100)}% of standard volume`}>
                                    <Chip 
                                        label={`${Math.round(volumeInfo.multiplier * 100)}% Scale`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title="Monthly requests">
                                    <Chip 
                                        label={`📊 ${(volumeInfo.requests / 1000000).toFixed(1)}M req`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title="Storage volume">
                                    <Chip 
                                        label={`💾 ${volumeInfo.storage_gb} GB`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title="Compute hours">
                                    <Chip 
                                        label={`⚡ ${volumeInfo.compute_hours} hrs`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                            </Box>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            {/* Service Breakdown Table - Compact */}
                            <Typography variant="subtitle2" gutterBottom>
                                Services ({services.length}):
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, maxHeight: 250 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell>Service</TableCell>
                                            <TableCell align="right">Cost</TableCell>
                                            <TableCell align="right">%</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {services.slice(0, 8).map(([category, serviceCost]) => {
                                            const servicePercent = (serviceCost / total * 100).toFixed(1);
                                            return (
                                                <TableRow key={category}>
                                                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.5 }}>
                                                        {getCategoryIcon(category)}
                                                        <Typography variant="caption">{getCategoryDisplayName(category)}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="caption">{fmt(serviceCost)}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={Math.min(100, servicePercent)} 
                                                                sx={{ width: 40, height: 3, borderRadius: 1 }}
                                                            />
                                                            <Typography variant="caption">{servicePercent}%</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {services.length > 8 && (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    <Typography variant="caption" color="text.secondary">
                                                        + {services.length - 8} more services
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            {/* Cost Insights - Compact Row */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                <Tooltip title="Lowest cost service">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Cheapest:</Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            {getCategoryDisplayName(cheapestService[0])}
                                        </Typography>
                                        <Typography variant="caption">({fmt(cheapestService[1])})</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Highest cost service">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Costliest:</Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            {getCategoryDisplayName(mostExpensiveService[0])}
                                        </Typography>
                                        <Typography variant="caption">({fmt(mostExpensiveService[1])})</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Average cost per service">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Avg/Service:</Typography>
                                        <Typography variant="caption" fontWeight="bold">{fmt(avgCost)}</Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                            
                            {/* Cost Efficiency Indicator */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                                <Typography variant="caption" color="text.secondary">Efficiency:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {volumeInfo.multiplier <= 0.6 ? (
                                        <><CheckCircleIcon fontSize="small" color="success" /><Typography variant="caption">Excellent</Typography></>
                                    ) : volumeInfo.multiplier <= 1.0 ? (
                                        <><CheckCircleIcon fontSize="small" color="warning" /><Typography variant="caption">Standard</Typography></>
                                    ) : (
                                        <><CheckCircleIcon fontSize="small" color="error" /><Typography variant="caption">Premium</Typography></>
                                    )}
                                </Box>
                            </Box>
                            
                            {/* Savings Alert (if this is best value) */}
                            {isCheapest && (
                                <Alert severity="success" sx={{ mt: 1, py: 0, '& .MuiAlert-message': { py: 0.5 } }}>
                                    💰 Saves {savingsPercent}% vs others
                                </Alert>
                            )}
                        </Paper>
                    </Grid>
                );
            })}
        </Grid>
    </AccordionDetails>
</Accordion>
```

Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ▼ 💰 Cost Breakdown by Provider                                    [Total: $5,230]  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐           │
│  │ AWS      [Best Value]│ │ Azure               │ │ GCP                 │           │
│  │ $2,450/month        │ │ $1,850/month        │ │ $930/month          │           │
│  │ 47% of total        │ │ 35% of total        │ │ 18% of total        │           │
│  │ ─────────────────── │ │ ─────────────────── │ │ ─────────────────── │           │
│  │ HIGH Volume         │ │ HIGH Volume         │ │ HIGH Volume         │           │
│  │ 200% Scale          │ │ 200% Scale          │ │ 200% Scale          │           │
│  │ 2.0M req │ 500GB    │ │ 2.0M req │ 500GB    │ │ 2.0M req │ 500GB    │           │
│  │ ─────────────────── │ │ ─────────────────── │ │ ─────────────────── │           │
│  │ Services (8):       │ │ Services (7):       │ │ Services (6):       │           │
│  │ • Compute    $850 35%│ │ • Compute    $720 39%│ │ • Compute    $380 41%│           │
│  │ • Storage    $450 18%│ │ • Storage    $380 20%│ │ • Storage    $200 22%│           │
│  │ • Database   $600 25%│ │ • Database   $480 26%│ │ • Database   $250 27%│           │
│  │ • CDN        $250 10%│ │ • CDN        $180 10%│ │ • CDN        $60  6%│           │
│  │ ─────────────────── │ │ ─────────────────── │ │ ─────────────────── │           │
│  │ Cheapest: Storage   │ │ Cheapest: Storage   │ │ Cheapest: CDN       │           │
│  │ Costliest: Compute  │ │ Costliest: Compute  │ │ Costliest: Compute  │           │
│  │ Avg/Service: $306   │ │ Avg/Service: $264   │ │ Avg/Service: $155   │           │
│  │ ─────────────────── │ │ ─────────────────── │ │ ─────────────────── │           │
│  │ Efficiency: Standard│ │ Efficiency: Standard│ │ Efficiency: Premium │           │
│  │ 💰 Saves 25% vs others│ │                     │ │                     │           │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘           │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

Benefits of This Design

Feature Benefit
Single accordion One expand/collapse for all provider data
3-column grid Side-by-side comparison at a glance
Color-coded headers AWS (#ff9900), Azure (#0078d4), GCP (#4285f4)
Compact badges Volume info without taking much space
Service tables Up to 8 services shown, with scroll for more
Progress bars Visual percentage of total cost
Cost insights Cheapest, costliest, average per service
Efficiency indicator Excellent/Standard/Premium based on volume
Best value highlight Green badge for cheapest provider
Savings alert Shows savings percentage

Now you can compare all three providers side-by-side in one compact accordion!



xxxxx 

Absolutely! Here's the one line to add to each service row in the cost breakdown table to show the respective service name:

```jsx
// Add this line inside the TableCell for service name
<TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {getCategoryIcon(category)}
    <Box>
        <Typography variant="body2" fontWeight="medium">{getCategoryDisplayName(category)}</Typography>
        <Typography variant="caption" color="text.secondary">{row[cost.provider.toLowerCase()]}</Typography>
    </Box>
</TableCell>
```

Complete Updated Cost Breakdown with Service Names

Here's the complete updated cost breakdown section that eliminates the separate service comparison table and includes all service details directly in the cost breakdown:

```jsx
// In ScenarioAnalyzerTab.jsx - Complete cost breakdown with service details

<Accordion defaultExpanded={true} sx={{ mb: 3 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
            <Typography variant="h6" fontWeight="bold">💰 Cost Breakdown by Provider</Typography>
            <Chip 
                label={`Total: ${fmt(analysisResult.cost_estimates.reduce((sum, c) => sum + c.estimated_monthly_cost, 0))}`} 
                size="small" 
                color="info" 
            />
        </Box>
    </AccordionSummary>
    
    <AccordionDetails>
        <Grid container spacing={2}>
            {analysisResult.cost_estimates && analysisResult.cost_estimates.map((cost, idx) => {
                const breakdown = cost.breakdown || {};
                const total = cost.estimated_monthly_cost;
                const volumeInfo = cost.volume_info || {};
                const provider = cost.provider;
                
                // Find the service comparison data for this provider
                const serviceData = analysisResult.service_comparison || [];
                
                // Calculate metrics
                const totalCost = analysisResult.cost_estimates.reduce((sum, c) => sum + c.estimated_monthly_cost, 0);
                const percentage = (total / totalCost * 100).toFixed(1);
                
                // Find cheapest and most expensive services
                const services = Object.entries(breakdown);
                const cheapestService = services.length ? services.reduce((a, b) => (a[1] < b[1]) ? a : b, services[0]) : ['', 0];
                const mostExpensiveService = services.length ? services.reduce((a, b) => (a[1] > b[1]) ? a : b, services[0]) : ['', 0];
                const avgCost = services.length ? total / services.length : 0;
                
                // Find best provider
                const cheapestProvider = analysisResult.cost_estimates.reduce((a, b) => 
                    a.estimated_monthly_cost < b.estimated_monthly_cost ? a : b
                );
                const isCheapest = cost.provider === cheapestProvider?.provider;
                
                return (
                    <Grid item xs={12} md={4} key={idx}>
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 1.5, 
                                height: '100%',
                                bgcolor: PROVIDER_COLORS[cost.provider]?.light || '#fafafa',
                                borderTop: `3px solid ${PROVIDER_COLORS[cost.provider]?.bg}`,
                                position: 'relative'
                            }}
                        >
                            {/* Provider Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {cost.provider}
                                </Typography>
                                {isCheapest && (
                                    <Tooltip title="Best value provider">
                                        <Chip 
                                            label="Best Value"
                                            size="small"
                                            color="success"
                                            icon={<CheckCircleIcon />}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                            
                            {/* Total Cost */}
                            <Typography variant="h4" fontWeight="bold" color={PROVIDER_COLORS[cost.provider]?.bg} gutterBottom>
                                {fmt(total)}
                                <Typography component="span" variant="caption" color="text.secondary">/month</Typography>
                            </Typography>
                            
                            {/* Percentage of total */}
                            <Chip 
                                label={`${percentage}% of total`}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 1.5 }}
                            />
                            
                            {/* Volume Badges */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                <Tooltip title="Workload volume level">
                                    <Chip 
                                        label={`${volumeInfo.level?.toUpperCase()} Volume`}
                                        size="small"
                                        color={volumeInfo.level === 'high' ? 'error' : volumeInfo.level === 'medium' ? 'warning' : 'success'}
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title={`${Math.round(volumeInfo.multiplier * 100)}% of standard volume`}>
                                    <Chip 
                                        label={`${Math.round(volumeInfo.multiplier * 100)}% Scale`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title="Monthly requests">
                                    <Chip 
                                        label={`📊 ${(volumeInfo.requests / 1000000).toFixed(1)}M req`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title="Storage volume">
                                    <Chip 
                                        label={`💾 ${volumeInfo.storage_gb} GB`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                                <Tooltip title="Compute hours">
                                    <Chip 
                                        label={`⚡ ${volumeInfo.compute_hours} hrs`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Tooltip>
                            </Box>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            {/* Service Breakdown Table with Service Names */}
                            <Typography variant="subtitle2" gutterBottom>
                                Services ({services.length}):
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, maxHeight: 350 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell>Service</TableCell>
                                            <TableCell align="right">Cost</TableCell>
                                            <TableCell align="right">%</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {services.map(([category, serviceCost]) => {
                                            const servicePercent = (serviceCost / total * 100).toFixed(1);
                                            // Find the actual cloud service name from service_comparison
                                            const serviceInfo = serviceData.find(s => 
                                                s.service_category.toLowerCase().replace(/ /g, '_') === category ||
                                                s.service_category.toLowerCase().includes(category)
                                            );
                                            const serviceName = serviceInfo ? serviceInfo[provider.toLowerCase()] : getCategoryDisplayName(category);
                                            
                                            return (
                                                <TableRow key={category}>
                                                    <TableCell sx={{ py: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {getCategoryIcon(category)}
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {getCategoryDisplayName(category)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {serviceName}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2">{fmt(serviceCost)}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={Math.min(100, servicePercent)} 
                                                                sx={{ width: 50, height: 4, borderRadius: 2 }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary">{servicePercent}%</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            {/* Cost Insights */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                <Tooltip title="Lowest cost service">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Cheapest:</Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            {getCategoryDisplayName(cheapestService[0])}
                                        </Typography>
                                        <Typography variant="caption">({fmt(cheapestService[1])})</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Highest cost service">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Costliest:</Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            {getCategoryDisplayName(mostExpensiveService[0])}
                                        </Typography>
                                        <Typography variant="caption">({fmt(mostExpensiveService[1])})</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Average cost per service">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Avg/Service:</Typography>
                                        <Typography variant="caption" fontWeight="bold">{fmt(avgCost)}</Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                            
                            {/* Cost Efficiency Indicator */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                                <Typography variant="caption" color="text.secondary">Efficiency:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {volumeInfo.multiplier <= 0.6 ? (
                                        <><CheckCircleIcon fontSize="small" color="success" /><Typography variant="caption">Excellent</Typography></>
                                    ) : volumeInfo.multiplier <= 1.0 ? (
                                        <><CheckCircleIcon fontSize="small" color="warning" /><Typography variant="caption">Standard</Typography></>
                                    ) : (
                                        <><CheckCircleIcon fontSize="small" color="error" /><Typography variant="caption">Premium</Typography></>
                                    )}
                                </Box>
                            </Box>
                            
                            {/* Savings Alert */}
                            {isCheapest && cheapestProvider && (
                                <Alert severity="success" sx={{ mt: 1, py: 0, '& .MuiAlert-message': { py: 0.5 } }}>
                                    💰 Saves {Math.round((cheapestProvider.estimated_monthly_cost / total * 100))}% vs others
                                </Alert>
                            )}
                        </Paper>
                    </Grid>
                );
            })}
        </Grid>
    </AccordionDetails>
</Accordion>
```

What This Does

1. Eliminates the separate "Service Comparison by Provider" table - No longer needed
2. Removes the service category filter - All services shown directly
3. Adds cloud service names - Each service row now shows the actual AWS/Azure/GCP service name (e.g., "EC2 t3.medium", "Azure Functions", etc.)
4. All in one place - Everything is in the cost breakdown accordion

The Key Line

```jsx
<Typography variant="caption" color="text.secondary">{serviceName}</Typography>
```

This single line adds the cloud service name below each service category, making the cost breakdown completely self-contained!
