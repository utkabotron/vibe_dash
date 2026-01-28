/**
 * Charts Module
 * Handles all chart initialization and updates using ApexCharts
 */

const Charts = {
    instances: {},

    /**
     * Common chart options
     */
    getCommonOptions() {
        return {
            chart: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false
                    }
                }
            },
            colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
            dataLabels: {
                enabled: false
            },
            grid: {
                borderColor: '#e2e8f0',
                strokeDashArray: 4
            },
            tooltip: {
                theme: 'light'
            }
        };
    },

    /**
     * Initialize Burn Rate Chart (Bar Chart)
     */
    initBurnRateChart(data) {
        const projectNames = Object.keys(data).slice(0, 10); // Top 10 projects
        const actualHours = projectNames.map(name => data[name].actual.toFixed(1));
        const plannedHours = projectNames.map(name => data[name].planned);

        const options = {
            ...this.getCommonOptions(),
            series: [
                {
                    name: 'Факт (часы)',
                    data: actualHours
                },
                {
                    name: 'План (часы)',
                    data: plannedHours
                }
            ],
            chart: {
                ...this.getCommonOptions().chart,
                type: 'bar',
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '70%',
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            xaxis: {
                categories: projectNames,
                labels: {
                    rotate: -45,
                    rotateAlways: true,
                    style: {
                        fontSize: '11px'
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Часы'
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left'
            }
        };

        if (this.instances.burnRate) {
            this.instances.burnRate.updateOptions(options);
        } else {
            this.instances.burnRate = new ApexCharts(document.querySelector('#burnRateChart'), options);
            this.instances.burnRate.render();
        }
    },

    /**
     * Initialize Load Balance Chart (Horizontal Bar)
     */
    initLoadBalanceChart(data) {
        const employees = data.combined.map(e => e.name);
        const hours = data.combined.map(e => e.hours.toFixed(1));

        const options = {
            ...this.getCommonOptions(),
            series: [{
                name: 'Часы',
                data: hours
            }],
            chart: {
                ...this.getCommonOptions().chart,
                type: 'bar',
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            xaxis: {
                categories: employees,
                title: {
                    text: 'Часы'
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                offsetX: 30,
                style: {
                    fontSize: '12px',
                    colors: ['#304758']
                }
            }
        };

        if (this.instances.loadBalance) {
            this.instances.loadBalance.updateOptions(options);
        } else {
            this.instances.loadBalance = new ApexCharts(document.querySelector('#loadBalanceChart'), options);
            this.instances.loadBalance.render();
        }
    },

    /**
     * Initialize Overhead Trend Chart (Line/Area Chart)
     */
    initOverheadTrendChart(trends) {
        const months = trends.map(t => t.month);
        const overheadData = trends.map(t => t.overheadRatio.toFixed(2));

        const options = {
            ...this.getCommonOptions(),
            series: [{
                name: 'Overhead Ratio (%)',
                data: overheadData
            }],
            chart: {
                ...this.getCommonOptions().chart,
                type: 'area',
                height: 300
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.1,
                    stops: [0, 90, 100]
                }
            },
            xaxis: {
                categories: months,
                title: {
                    text: 'Месяц'
                }
            },
            yaxis: {
                title: {
                    text: 'Процент (%)'
                },
                labels: {
                    formatter: (val) => val.toFixed(1) + '%'
                }
            },
            annotations: {
                yaxis: [{
                    y: 15,
                    borderColor: '#f59e0b',
                    label: {
                        borderColor: '#f59e0b',
                        style: {
                            color: '#fff',
                            background: '#f59e0b'
                        },
                        text: 'Целевой уровень'
                    }
                }]
            }
        };

        if (this.instances.overheadTrend) {
            this.instances.overheadTrend.updateOptions(options);
        } else {
            this.instances.overheadTrend = new ApexCharts(document.querySelector('#overheadTrendChart'), options);
            this.instances.overheadTrend.render();
        }
    },

    /**
     * Initialize Quality Trend Chart (Line Chart)
     */
    initQualityTrendChart(trends) {
        const months = trends.map(t => t.month);
        const qualityData = trends.map(t => t.qualityRate.toFixed(2));

        const options = {
            ...this.getCommonOptions(),
            series: [{
                name: 'Quality Rate (%)',
                data: qualityData
            }],
            chart: {
                ...this.getCommonOptions().chart,
                type: 'line',
                height: 300
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            markers: {
                size: 5,
                hover: {
                    size: 7
                }
            },
            xaxis: {
                categories: months,
                title: {
                    text: 'Месяц'
                }
            },
            yaxis: {
                title: {
                    text: 'Процент (%)'
                },
                labels: {
                    formatter: (val) => val.toFixed(1) + '%'
                }
            },
            annotations: {
                yaxis: [{
                    y: 5,
                    borderColor: '#10b981',
                    label: {
                        borderColor: '#10b981',
                        style: {
                            color: '#fff',
                            background: '#10b981'
                        },
                        text: 'Цель < 5%'
                    }
                }]
            }
        };

        if (this.instances.qualityTrend) {
            this.instances.qualityTrend.updateOptions(options);
        } else {
            this.instances.qualityTrend = new ApexCharts(document.querySelector('#qualityTrendChart'), options);
            this.instances.qualityTrend.render();
        }
    },

    /**
     * Initialize all charts
     */
    initAllCharts(kpis, trends) {
        this.initBurnRateChart(kpis.burnRateByProject);
        this.initLoadBalanceChart(kpis.loadBalance);
        this.initOverheadTrendChart(trends);
        this.initQualityTrendChart(trends);
    },

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.values(this.instances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.instances = {};
    }
};

// Export for use in other modules
window.Charts = Charts;
