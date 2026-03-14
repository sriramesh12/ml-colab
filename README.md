"""
Streamlit web interface for Cloud Rationalization Agent
"""
import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)
    print(f"Added {project_root} to path")  # This will show in terminal

# Now try the imports
try:
    from src.agent import CloudRationalizationAgent
    from src.models.schemas import (
        RationalizationRequest, 
        CloudResource,
        BusinessConstraints,
        OptimizationGoal
    )
    print("✅ Imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print(f"Current sys.path: {sys.path}")

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import asyncio
import json
import sys
import os
from datetime import datetime
import requests


# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

   
from src.agent import CloudRationalizationAgent
from src.models.schemas import (
    RationalizationRequest, 
    CloudResource,
    BusinessConstraints,
    CloudProvider,
    ResourceType,
    UsagePattern,
    OptimizationGoal
)

#added on 13-MArch for graph
import json
from typing import Dict, Any, List
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

def _safe_to_dict(raw: Any) -> Dict[str, Any]:
    """Accept dict or JSON-string and return a dict; else empty dict."""
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}
    return {}

def _to_dataframe(prices: Dict[str, Any]) -> pd.DataFrame:
    """
    Normalize your API shape into tidy data.
    Expected keys: aws_pricing_tool / azure_pricing_tool / gcp_pricing_tool
    Each can be a dict or a JSON string.
    """
    rows: List[Dict[str, Any]] = []
    for provider_key, payload in prices.items():
        data = _safe_to_dict(payload)
        if not data:
            continue

        provider = data.get("provider") or provider_key.replace("_pricing_tool", "").upper()
        hourly = data.get("hourly_rate")
        monthly = data.get("monthly_rate")
        currency = data.get("currency", "USD")
        pricing_model = data.get("pricing_model", "On-Demand")
        region = data.get("region") or (data.get("specifications") or {}).get("region")

        # keep only valid numeric rows
        if hourly is None and monthly is None:
            continue

        rows.append({
            "provider": provider,
            "region": region,
            "pricing_model": pricing_model,
            "currency": currency,
            "hourly_rate": float(hourly) if hourly is not None else None,
            "monthly_rate": float(monthly) if monthly is not None else None,
        })

    return pd.DataFrame(rows)

def _format_currency(amount: float, currency: str = "USD") -> str:
    if amount is None:
        return "-"
    return f"${amount:,.2f}" if currency.upper() == "USD" else f"{currency} {amount:,.2f}"

def render_enhanced_pricing_dashboard(response):
    
    try:
        if response.status_code != 200:
            st.error(f"API error: {response.text}")
            return

        raw = response.json()
        df = _to_dataframe(raw)

        if df.empty:
            st.warning("No valid pricing data received from API.")
            with st.expander("Raw API payload"):
                st.json(raw)
            return

        # Normalize currency column (assume same currency across providers for now)
        currency = df["currency"].dropna().iloc[0] if not df["currency"].dropna().empty else "USD"

        # ------- KPIs / Savings -------
        # Choose monthly by default; fall back to hourly * 730 if monthly not present
        df["monthly_effective"] = df.apply(
            lambda r: r["monthly_rate"]
            if pd.notna(r["monthly_rate"])
            else (r["hourly_rate"] * 730 if pd.notna(r["hourly_rate"]) else None),
            axis=1
        )

        # Drop rows still missing a monthly_effective (no plots for those)
        df_plot = df.dropna(subset=["monthly_effective"]).copy()
        if df_plot.empty:
            st.warning("No billable rates found to plot.")
            with st.expander("Parsed DataFrame"):
                st.dataframe(df)
            return

        # Find cheapest and compute savings vs. cheapest
        cheapest_idx = df_plot["monthly_effective"].idxmin()
        cheapest_row = df_plot.loc[cheapest_idx]
        cheapest_provider = cheapest_row["provider"]
        cheapest_cost = float(cheapest_row["monthly_effective"])

        df_plot["savings_abs"] = df_plot["monthly_effective"] - cheapest_cost
        df_plot["savings_pct"] = df_plot["savings_abs"] / df_plot["monthly_effective"] * 100
        df_plot["label_monthly"] = df_plot.apply(
            lambda r: _format_currency(r["monthly_effective"], currency), axis=1
        )

        # ------- Top KPI cards -------
        c1, c2, c3 = st.columns(3)
        with c1:
            st.metric("Cheapest Provider", cheapest_provider, delta=None)
        with c2:
            st.metric("Cheapest Monthly Cost", _format_currency(cheapest_cost, currency))
        with c3:
            # max savings among non-cheapest
            max_savings = df_plot.loc[df_plot["provider"] != cheapest_provider, "savings_abs"].max()
            if pd.notna(max_savings):
                st.metric("Max Monthly Savings vs. Cheapest", _format_currency(max_savings, currency))
            else:
                st.metric("Max Monthly Savings vs. Cheapest", "-")

        # ------- Monthly Bar (grouped) -------
        st.subheader("Monthly Cost Comparison")
        fig_monthly = px.bar(
            df_plot.sort_values("monthly_effective"),
            x="provider",
            y="monthly_effective",
            color="provider",
            text="label_monthly",
            hover_data=["pricing_model", "region", "currency"],
            title="Monthly Cloud Cost (Effective)",
        )
        fig_monthly.update_traces(textposition="outside")
        fig_monthly.update_layout(
            yaxis_title=f"Monthly Cost ({currency})",
            xaxis_title="Provider",
            showlegend=False,
            margin=dict(t=60, b=0, l=0, r=0)
        )
        st.plotly_chart(fig_monthly, use_container_width=True)

        # ------- Hourly Bar (if available) -------
        if df_plot["hourly_rate"].notna().any():
            st.subheader("Hourly Cost Comparison")
            df_hourly = df_plot.dropna(subset=["hourly_rate"]).copy()
            df_hourly["label_hourly"] = df_hourly.apply(
                lambda r: _format_currency(r["hourly_rate"], currency), axis=1
            )
            fig_hourly = px.bar(
                df_hourly.sort_values("hourly_rate"),
                x="provider",
                y="hourly_rate",
                color="provider",
                text="label_hourly",
                hover_data=["pricing_model", "region", "currency"],
                title="Hourly Cloud Cost",
            )
            fig_hourly.update_traces(textposition="outside")
            fig_hourly.update_layout(
                yaxis_title=f"Hourly Cost ({currency})",
                xaxis_title="Provider",
                showlegend=False,
                margin=dict(t=60, b=0, l=0, r=0)
            )
            st.plotly_chart(fig_hourly, use_container_width=True)

        # ------- Pie chart (spend share) -------
        st.subheader("Monthly Spend Share")
        fig_pie = px.pie(
            df_plot,
            names="provider",
            values="monthly_effective",
            hole=0.35,
            title="Share of Monthly Cost by Provider"
        )
        st.plotly_chart(fig_pie, use_container_width=True)

        # ------- Data table & Download -------
        st.subheader("Detailed Pricing (Normalized)")
        nice_df = df_plot[[
            "provider", "region", "pricing_model", "currency",
            "hourly_rate", "monthly_rate", "monthly_effective",
            "savings_abs", "savings_pct"
        ]].copy()

        # Pretty formatting for display table only
        display_df = nice_df.copy()
        display_df["hourly_rate"] = display_df["hourly_rate"].apply(lambda v: _format_currency(v, currency) if pd.notna(v) else "-")
        display_df["monthly_rate"] = display_df["monthly_rate"].apply(lambda v: _format_currency(v, currency) if pd.notna(v) else "-")
        display_df["monthly_effective"] = display_df["monthly_effective"].apply(lambda v: _format_currency(v, currency))
        display_df["savings_abs"] = display_df["savings_abs"].apply(lambda v: _format_currency(v, currency) if pd.notna(v) else "-")
        display_df["savings_pct"] = display_df["savings_pct"].apply(lambda v: f"{v:,.1f}%" if pd.notna(v) else "-")

        st.dataframe(display_df, use_container_width=True, height=240)

        # Download original (numeric) data as CSV
        csv = nice_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="Download CSV (Normalized Pricing)",
            data=csv,
            file_name="cloud_pricing_comparison.csv",
            mime="text/csv"
        )

        # ------- Expanders for raw provider payloads -------
        st.markdown("### Provider Payloads")
        for k, v in raw.items():
            with st.expander(k.upper()):
                # Show parsed dict when possible; else show raw string
                parsed = _safe_to_dict(v)
                st.json(parsed if parsed else v)

    except Exception as ex:
        st.error(f"Error while rendering pricing dashboard: {ex}")

# ---- Call the enhanced renderer after your response arrives ----
# Example:
# response = requests.post( ... )
# render_enhanced_pricing_dashboard(response)

# Page configuration
st.set_page_config(
    page_title="Cloud Rationalization Agent",
    page_icon="☁️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
    }
    .recommendation-card {
        background-color: #e8f4fd;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
        border-left: 4px solid #1E88E5;
    }
    .savings-positive {
        color: #00C853;
        font-weight: bold;
    }
    .risk-high {
        color: #D32F2F;
    }
    .risk-medium {
        color: #FFA000;
    }
    .risk-low {
        color: #388E3C;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'agent' not in st.session_state:
    st.session_state.agent = None
if 'resources' not in st.session_state:
    st.session_state.resources = []
if 'analysis_result' not in st.session_state:
    st.session_state.analysis_result = None
if 'api_mode' not in st.session_state:
    st.session_state.api_mode = False
if 'api_url' not in st.session_state:
    st.session_state.api_url = "http://localhost:8000"

# Sidebar
with st.sidebar:
    st.image("https://img.icons8.com/color/96/000000/cloud--v1.png", width=80)
    st.title("Cloud Rationalization Agent")
    
    # Mode selection
    st.header("⚙️ Configuration")
    mode = st.radio(
        "Select Mode",
        ["Local Agent", "API Mode"],
        help="Local Agent uses direct LLM access, API Mode connects to the FastAPI backend"
    )
    
    if mode == "Local Agent":
        st.session_state.api_mode = False
        with st.expander("🔑 API Keys", expanded=False):
            openai_key = st.text_input("OpenAI API Key", type="password")
            aws_key = st.text_input("AWS Access Key (optional)", type="password")
            aws_secret = st.text_input("AWS Secret Key (optional)", type="password")
            
            if st.button("🚀 Initialize Agent", type="primary"):
                if openai_key:
                    with st.spinner("Initializing agent..."):
                        st.session_state.agent = CloudRationalizationAgent(
                            openai_api_key=openai_key,
                            aws_credentials={
                                'aws_access_key_id': aws_key,
                                'aws_secret_access_key': aws_secret
                            } if aws_key and aws_secret else None
                        )
                    st.success("Agent initialized successfully!")
                else:
                    st.error("Please provide OpenAI API Key")
    else:
        st.session_state.api_mode = True
        st.session_state.api_url = st.text_input(
            "API URL",
            value="http://localhost:8080",
            help="URL of the FastAPI backend"
        )
        
        if st.button("🔍 Check API Health"):
            try:
                response = requests.get(f"{st.session_state.api_url}/health")
                if response.status_code == 200:
                    st.success("✅ API is healthy")
                    st.json(response.json())
                else:
                    st.error("❌ API is not responding")
            except Exception as e:
                st.error(f"Connection error: {e}")
    
    st.markdown("---")
    st.markdown("### 📊 Quick Stats")
    st.metric("Total Resources", len(st.session_state.resources))
    
    if st.button("🗑️ Clear All Resources"):
        st.session_state.resources = []
        st.session_state.analysis_result = None
        st.rerun()

# Main content
st.markdown("<h1 class='main-header'>☁️ Cloud Infrastructure Optimizer</h1>", unsafe_allow_html=True)

# Create tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📋 Infrastructure Input", 
    "💰 Price Comparison", 
    "📈 Analysis Results",
    "📊 Reports"
])

# Tab 1: Infrastructure Input
with tab1:
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Add Cloud Resource")
        
        with st.form("resource_form"):
            row1_col1, row1_col2, row1_col3 = st.columns(3)
            
            with row1_col1:
                resource_name = st.text_input("Resource Name", value="web-server-01")
                provider = st.selectbox(
                    "Cloud Provider",
                    options=[p.value for p in CloudProvider],
                    format_func=lambda x: x.upper()
                )
            
            with row1_col2:
                resource_type = st.selectbox(
                    "Resource Type",
                    options=[r.value for r in ResourceType],
                    format_func=lambda x: x.upper()
                )
                region = st.text_input("Region", value="us-east-1")
            
            with row1_col3:
                instance_type = st.text_input("Instance Type", value="t3.medium")
                quantity = st.number_input("Quantity", min_value=1, value=1)
            
            row2_col1, row2_col2, row2_col3 = st.columns(3)
            
            with row2_col1:
                usage_pattern = st.selectbox(
                    "Usage Pattern",
                    options=[u.value for u in UsagePattern],
                    format_func=lambda x: x.upper()
                )
            
            with row2_col2:
                monthly_cost = st.number_input(
                    "Current Monthly Cost ($)",
                    min_value=0.0,
                    value=100.0,
                    step=10.0
                )
            
            with row2_col3:
                fault_tolerant = st.checkbox("Fault Tolerant")
                criticality = st.select_slider(
                    "Criticality",
                    options=["low", "medium", "high"],
                    value="medium"
                )
            
            # Additional specs in expander
            with st.expander("Additional Specifications"):
                os_type = st.text_input("Operating System", value="Linux")
                cpu = st.number_input("vCPU Cores", min_value=1, value=2)
                memory = st.number_input("Memory (GB)", min_value=1, value=8)
                storage = st.number_input("Storage (GB)", min_value=10, value=100)
            
            submitted = st.form_submit_button("➕ Add Resource", type="primary")
            
            if submitted:
                new_resource = {
                    "name": resource_name,
                    "provider": provider,
                    "resource_type": resource_type,
                    "region": region,
                    "instance_type": instance_type,
                    "quantity": quantity,
                    "usage_pattern": usage_pattern,
                    "monthly_cost": monthly_cost,
                    "fault_tolerant": fault_tolerant,
                    "criticality": criticality,
                    "specifications": {
                        "os": os_type,
                        "cpu": cpu,
                        "memory": memory,
                        "storage": storage,
                        "instance_type": instance_type
                    }
                }
                st.session_state.resources.append(new_resource)
                st.success(f"Added {resource_name}")
    
    with col2:
        st.subheader("Business Constraints")
        with st.form("constraints_form"):
            max_budget = st.number_input(
                "Max Monthly Budget ($)",
                min_value=0.0,
                value=10000.0
            )
            
            availability = st.select_slider(
                "Required Availability",
                options=["99%", "99.9%", "99.99%", "99.999%"],
                value="99.9%"
            )
            
            compliance = st.multiselect(
                "Compliance Requirements",
                ["HIPAA", "GDPR", "PCI-DSS", "SOC2", "ISO27001"]
            )
            
            risk_tolerance = st.select_slider(
                "Risk Tolerance",
                options=["low", "medium", "high"],
                value="medium"
            )
            
            optimization_goals = st.multiselect(
                "Optimization Goals",
                [g.value for g in OptimizationGoal],
                default=["cost_reduction"]
            )
            
            st.form_submit_button("Save Constraints")

# Display current resources
if st.session_state.resources:
    st.subheader("📋 Current Infrastructure")
    
    # Create DataFrame for display
    df = pd.DataFrame(st.session_state.resources)
    
    # Display metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Resources", len(df))
    with col2:
        st.metric("Total Monthly Cost", f"${df['monthly_cost'].sum():,.2f}")
    with col3:
        st.metric("Avg Cost/Resource", f"${df['monthly_cost'].mean():,.2f}")
    with col4:
        providers = df['provider'].nunique()
        st.metric("Cloud Providers", providers)
    
    # Display table
    st.dataframe(
        df[['name', 'provider', 'resource_type', 'region', 'instance_type', 
            'quantity', 'monthly_cost', 'usage_pattern']],
        use_container_width=True
    )
    
    # Cost visualization
    fig = px.bar(
        df, 
        x='name', 
        y='monthly_cost', 
        color='provider',
        title="Monthly Costs by Resource",
        labels={'monthly_cost': 'Cost ($)', 'name': 'Resource'}
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Run analysis button
    if st.button("🚀 Run Optimization Analysis", type="primary", use_container_width=True):
        if st.session_state.api_mode:
            # API mode
            with st.spinner("Sending to API for analysis..."):
                try:
                    # Prepare request
                    resources = []
                    for r in st.session_state.resources:
                        resources.append({
                            "name": r['name'],
                            "resource_type": r['resource_type'],
                            "provider": r['provider'],
                            "region": r['region'],
                            "specifications": r['specifications'],
                            "quantity": r['quantity'],
                            "usage_pattern": r['usage_pattern'],
                            "monthly_cost": r['monthly_cost'],
                            "fault_tolerant": r['fault_tolerant']
                        })
                    
                    constraints = {
                        "max_budget": max_budget if 'max_budget' in locals() else None,
                        "min_availability": availability if 'availability' in locals() else "99.9%",
                        "compliance_requirements": compliance if 'compliance' in locals() else [],
                        "risk_tolerance": risk_tolerance if 'risk_tolerance' in locals() else "medium"
                    }
                    
                    goals = optimization_goals if 'optimization_goals' in locals() else ["cost_reduction"]
                    
                    response = requests.post(
                        f"{st.session_state.api_url}/analyze",
                        json={
                            "current_infrastructure": resources,
                            "business_constraints": constraints,
                            "optimization_goals": goals,
                            "time_horizon": "1 year"
                        }
                    )
                    
                    if response.status_code == 200:
                        st.session_state.analysis_result = response.json()
                        st.success("Analysis complete!")
                    else:
                        st.error(f"API error: {response.text}")
                        
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            # Local agent mode
            if st.session_state.agent:
                with st.spinner("Analyzing infrastructure..."):
                    try:
                        # Create request
                        resources = []
                        for r in st.session_state.resources:
                            resources.append(CloudResource(
                                name=r['name'],
                                resource_type=r['resource_type'],
                                provider=r['provider'],
                                region=r['region'],
                                specifications=r['specifications'],
                                quantity=r['quantity'],
                                usage_pattern=r['usage_pattern'],
                                monthly_cost=r['monthly_cost'],
                                fault_tolerant=r['fault_tolerant']
                            ))
                        
                        constraints = BusinessConstraints(
                            max_budget=max_budget if 'max_budget' in locals() else None,
                            min_availability=availability if 'availability' in locals() else "99.9%",
                            compliance_requirements=compliance if 'compliance' in locals() else [],
                            risk_tolerance=risk_tolerance if 'risk_tolerance' in locals() else "medium"
                        )
                        
                        goals = [OptimizationGoal(g) for g in (optimization_goals if 'optimization_goals' in locals() else ["cost_reduction"])]
                        
                        request = RationalizationRequest(
                            current_infrastructure=resources,
                            business_constraints=constraints,
                            optimization_goals=goals,
                            time_horizon="1 year"
                        )
                        
                        # Run async analysis
                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                        result = loop.run_until_complete(st.session_state.agent.analyze(request))
                        loop.close()
                        
                        st.session_state.analysis_result = result.dict()
                        st.success("Analysis complete!")
                        
                    except Exception as e:
                        st.error(f"Analysis error: {e}")
            else:
                st.error("Please initialize the agent first in the sidebar")


# Tab 2: Price Comparison
with tab2:
    st.subheader("💰 Multi-Cloud Price Comparison")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        compare_resource = st.selectbox(
            "Resource Type",
            ["ec2", "vm", "compute"]
        )
    
    with col2:
        compare_region = st.text_input("Region", "us-east-1")
    
    with col3:
        compare_instance = st.text_input("Instance Type", "t3.medium")
    
    if st.button("Compare Prices", type="primary"):
        with st.spinner("Fetching prices from all providers..."):
            if st.session_state.api_mode:
                try:
                    
                    response = requests.post(
                        f"{st.session_state.api_url}/compare-prices",
                        json={
                            "resource_type": compare_resource,
                            "specifications": {
                                "instance_type": compare_instance,
                                "region": compare_region
                            },
                            "regions": [compare_region]  # or None
                        }
                    )

                    #response = requests.post(
                    #    f"{st.session_state.api_url}/compare-prices",
                    #    params={
                    #        "resource_type": compare_resource,
                    #        "specifications": json.dumps({
                    #            "instance_type": compare_instance,
                    #            "region": compare_region
                    #        })
                    #    }
                    #)
                #     """
                #     if response.status_code == 200:
                #         prices = response.json()
                        
                #         # Create comparison chart
                #         fig = go.Figure()
                        
                #         for provider, data in prices.items():
                #             if isinstance(data, dict) and 'monthly_rate' in data:
                #                 fig.add_trace(go.Bar(
                #                     name=provider.upper(),
                #                     x=['Monthly Cost'],
                #                     y=[data['monthly_rate']],
                #                     text=[f"${data['monthly_rate']:,.2f}"],
                #                     textposition='auto',
                #                 ))
                        
                #         fig.update_layout(
                #             title="Price Comparison by Provider",
                #             yaxis_title="Monthly Cost (USD)",
                #             showlegend=True,
                #             barmode='group'
                #         )
                        
                #         st.plotly_chart(fig, use_container_width=True)
                        
                #         # Display detailed prices
                #         for provider, data in prices.items():
                #             with st.expander(f"{provider.upper()} Details"):
                #                 st.json(data)
                #     else:
                #         st.error(f"API error: {response.text}")
                        
                # except Exception as e:
                #     st.error(f"Error: {e}")
                # """
                    if response.status_code == 200:
                        render_enhanced_pricing_dashboard(response)
                    #     prices = response.json()

                    #     # Convert JSON strings → dictionaries
                    #     fixed_prices = {}
                    #     for provider, raw_data in prices.items():
                    #         try:
                    #             # If value is JSON string → load it
                    #             if isinstance(raw_data, str):
                    #                 fixed_prices[provider] = json.loads(raw_data)
                    #             else:
                    #                 fixed_prices[provider] = raw_data
                    #         except json.JSONDecodeError:
                    #             st.warning(f"Could not parse data for {provider}")
                    #             continue

                    #     # --- Create comparison chart ---
                    #     fig = go.Figure()

                    #     for provider, data in fixed_prices.items():
                    #         if isinstance(data, dict) and "monthly_rate" in data:
                    #             fig.add_trace(go.Bar(
                    #                 name=provider.upper(),
                    #                 x=["Monthly Cost"],
                    #                 y=[data["monthly_rate"]],
                    #                 text=[f"${data['monthly_rate']:,.2f}"],
                    #                 textposition="auto",
                    #             ))

                    #     fig.update_layout(
                    #         title="Price Comparison by Provider",
                    #         yaxis_title="Monthly Cost (USD)",
                    #         showlegend=True,
                    #         barmode="group"
                    #     )

                    #     st.plotly_chart(fig, use_container_width=True)

                    #     # --- Display details for each provider ---
                    #     for provider, data in fixed_prices.items():
                    #         with st.expander(f"{provider.upper()} Details"):
                    #             st.json(data)

                    # else:
                    #     st.error(f"API error: {response.text}")

                except Exception as e:
                    st.error(f"Error: {e}")

            else:
                st.info("Switch to API mode for price comparisons with live data")

# Tab 3: Analysis Results
with tab3:
    if st.session_state.analysis_result:
        result = st.session_state.analysis_result
        
        st.subheader("📊 Optimization Results")
        
        # Extract metrics from analysis text (simplified)
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            current_cost = sum(r.get('monthly_cost', 0) for r in st.session_state.resources)
            st.metric(
                "Current Monthly Cost",
                f"${current_cost:,.2f}"
            )
        
        with col2:
            # Parse savings from analysis (simplified)
            optimized_cost = current_cost * 0.7  # Example: 30% savings
            st.metric(
                "Optimized Cost",
                f"${optimized_cost:,.2f}",
                delta=f"-${current_cost - optimized_cost:,.2f}"
            )
        
        with col3:
            savings_pct = ((current_cost - optimized_cost) / current_cost) * 100
            st.metric(
                "Potential Savings",
                f"{savings_pct:.1f}%",
                delta_color="inverse"
            )
        
        with col4:
            st.metric(
                "Payback Period",
                "8 months"
            )
        
        # Display analysis text
        st.markdown("### 📝 Detailed Analysis")
        st.markdown(result.get('analysis', 'No analysis text available'))
        
        # Sample recommendations (would come from actual analysis)
        st.markdown("### ✅ Key Recommendations")
        
        recommendations = [
            {
                "title": "Right-size over-provisioned instances",
                "description": "3 instances (web-server-01, db-02, cache-01) are underutilized",
                "savings": "$450/month",
                "risk": "low",
                "effort": "low"
            },
            {
                "title": "Purchase Reserved Instances",
                "description": "Steady-state workloads qualify for 1-year RI savings",
                "savings": "$890/month",
                "risk": "medium",
                "effort": "medium"
            },
            {
                "title": "Use Spot Instances for batch jobs",
                "description": "CI/CD runners and batch processing can use spot",
                "savings": "$320/month",
                "risk": "low",
                "effort": "medium"
            }
        ]
        
        for rec in recommendations:
            risk_class = f"risk-{rec['risk']}"
            st.markdown(f"""
            <div class='recommendation-card'>
                <h4>{rec['title']}</h4>
                <p>{rec['description']}</p>
                <p><span class='savings-positive'>💰 Savings: {rec['savings']}</span></p>
                <p>Risk: <span class='{risk_class}'>{rec['risk'].upper()}</span> | Effort: {rec['effort'].upper()}</p>
            </div>
            """, unsafe_allow_html=True)
        
        # Implementation timeline
        st.markdown("### 📅 Implementation Timeline")
        
        timeline_data = {
            "Phase": ["Quick Wins", "Medium-term", "Long-term"],
            "Timeline": ["Week 1-2", "Month 1-3", "Month 3-6"],
            "Savings": ["$770/month", "$890/month", "$1,200/month"],
            "Effort": ["Low", "Medium", "High"]
        }
        
        st.dataframe(pd.DataFrame(timeline_data), use_container_width=True)
        
    else:
        st.info("Run an optimization analysis first to see results here.")

# Tab 4: Reports
with tab4:
    st.subheader("📊 Generate Reports")
    
    report_type = st.selectbox(
        "Report Type",
        ["Executive Summary", "Detailed Technical Report", "Cost Savings Analysis", "Migration Plan"]
    )
    
    report_format = st.radio("Format", ["PDF", "Excel", "JSON"])
    
    if st.button("Generate Report"):
        with st.spinner("Generating report..."):
            st.success("Report generated successfully!")
            
            # Placeholder for report content
            st.markdown("### Sample Report Preview")
            
            if report_type == "Executive Summary":
                st.markdown("""
                # Executive Summary: Cloud Optimization Report
                
                **Date:** March 2024
                **Prepared for:** Sample Organization
                
                ## Key Findings
                - Current monthly spend: $4,250
                - Optimization potential: $1,870/month (44%)
                - Payback period: 8 months
                
                ## Top Recommendations
                1. Implement Reserved Instances for production workloads
                2. Right-size development environments
                3. Use Spot Instances for CI/CD pipelines
                
                ## Next Steps
                - Begin with quick wins (week 1-2)
                - Schedule implementation windows
                - Set up cost monitoring
                """)
            
            # Download buttons
            col1, col2 = st.columns(2)
            with col1:
                st.download_button(
                    "📥 Download Report",
                    data="Sample report content",
                    file_name=f"cloud_optimization_report_{datetime.now().strftime('%Y%m%d')}.pdf",
                    mime="application/pdf"
                )
            with col2:
                st.download_button(
                    "📊 Download Data",
                    data=json.dumps(st.session_state.analysis_result, indent=2) if st.session_state.analysis_result else "{}",
                    file_name=f"analysis_data_{datetime.now().strftime('%Y%m%d')}.json",
                    mime="application/json"
                )

# Footer
st.markdown("---")
col1, col2, col3 = st.columns(3)
with col2:
    st.markdown("Made with ❤️ using LangChain, OpenAI, and Streamlit")
