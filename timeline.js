// Timeline visualization
class TimelineVisualization {
    constructor() {
        this.chart = null;
        this.zoomLevel = 1;
        this.maxZoom = 5;
        this.minZoom = 0.5;
        this.zoomStep = 0.5;
        this.currentStep = 0;
        
        // Initialize controls
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.resetZoomBtn = document.getElementById('resetZoomBtn');
        
        // Bind event listeners
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.resetZoomBtn.addEventListener('click', () => this.resetZoom());
        
        // Initialize chart
        this.initializeChart();
    }
    
    initializeChart() {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Page Faults',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }, {
                    label: 'Memory Usage',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }, {
                    label: 'Page Hits',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            title: (items) => {
                                return `Step ${items[0].label}`;
                            },
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            currentStep: {
                                type: 'line',
                                xMin: 0,
                                xMax: 0,
                                borderColor: '#f59e0b',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Current Step',
                                    enabled: true,
                                    position: 'top'
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time Step',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value',
                            font: {
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    updateTimeline(steps, pageFaults, memoryUsage, pageHits) {
        const labels = Array.from({length: steps}, (_, i) => i + 1);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = pageFaults;
        this.chart.data.datasets[1].data = memoryUsage;
        this.chart.data.datasets[2].data = pageHits;
        
        // Update current step indicator
        if (this.chart.options.plugins.annotation) {
            this.chart.options.plugins.annotation.annotations.currentStep.xMin = this.currentStep;
            this.chart.options.plugins.annotation.annotations.currentStep.xMax = this.currentStep;
        }
        
        this.chart.update('none'); // Use 'none' for better performance
    }
    
    setCurrentStep(step) {
        this.currentStep = step;
        if (this.chart && this.chart.options.plugins.annotation) {
            this.chart.options.plugins.annotation.annotations.currentStep.xMin = step;
            this.chart.options.plugins.annotation.annotations.currentStep.xMax = step;
            this.chart.update('none');
        }
    }
    
    zoomIn() {
        if (this.zoomLevel < this.maxZoom) {
            this.zoomLevel += this.zoomStep;
            this.updateZoom();
        }
    }
    
    zoomOut() {
        if (this.zoomLevel > this.minZoom) {
            this.zoomLevel -= this.zoomStep;
            this.updateZoom();
        }
    }
    
    resetZoom() {
        this.zoomLevel = 1;
        this.updateZoom();
    }
    
    updateZoom() {
        const wrapper = document.querySelector('.timeline-wrapper');
        wrapper.style.transform = `scale(${this.zoomLevel})`;
        wrapper.style.transformOrigin = 'center center';
        
        // Update button states
        this.zoomInBtn.disabled = this.zoomLevel >= this.maxZoom;
        this.zoomOutBtn.disabled = this.zoomLevel <= this.minZoom;
    }
}

// Initialize timeline visualization
document.addEventListener('DOMContentLoaded', () => {
    window.timelineViz = new TimelineVisualization();
}); 