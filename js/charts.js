// Charts and Data Visualization Handler
class CovidCharts {
    constructor() {
        this.globalChart = null;
        this.countryChart = null;
        this.globalChartContainer = null;
        this.countryChartContainer = null;
        
        // Chart dimensions
        this.margin = { top: 20, right: 30, bottom: 40, left: 60 };
        this.width = 600 - this.margin.left - this.margin.right;
        this.height = 300 - this.margin.top - this.margin.bottom;
        
        // Data storage
        this.globalData = [];
        this.countryData = [];
        this.maxDataPoints = 100; // Keep last 100 days
        
        // Color scheme
        this.colors = {
            cases: '#ff4444',
            deaths: '#ff8844',
            recovered: '#44ff44',
            active: '#4444ff'
        };
        
        this.initialize();
    }
    
    initialize() {
        try {
            this.setupContainers();
            this.createGlobalChart();
            this.createCountryChart();
            console.log('Gráficas inicializadas correctamente');
        } catch (error) {
            console.error('Error inicializando gráficas:', error);
            this.showError('No se pudieron inicializar las gráficas');
        }
    }
    
    setupContainers() {
        this.globalChartContainer = d3.select('#globalChart');
        this.countryChartContainer = d3.select('#countryChart');
        
        if (this.globalChartContainer.empty()) {
            throw new Error('Contenedor de gráfica global no encontrado');
        }
        
        if (this.countryChartContainer.empty()) {
            throw new Error('Contenedor de gráfica de países no encontrado');
        }
    }
    
    createGlobalChart() {
        // Clear existing chart
        this.globalChartContainer.selectAll('*').remove();
        
        // Create SVG
        const svg = this.globalChartContainer
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        
        // Create chart group
        this.globalChart = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Add title
        svg.append('text')
            .attr('x', (this.width + this.margin.left + this.margin.right) / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#ffffff')
            .text('Evolución Global de Casos');
        
        // Create scales
        this.globalScales = {
            x: d3.scaleTime().range([0, this.width]),
            y: d3.scaleLinear().range([this.height, 0])
        };
        
        // Create axes
        this.globalAxes = {
            x: d3.axisBottom(this.globalScales.x).tickFormat(d3.timeFormat('%b %Y')),
            y: d3.axisLeft(this.globalScales.y).tickFormat(d3.format('.2s'))
        };
        
        // Add axes to chart
        this.globalChart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height})`)
            .style('color', '#cccccc');
        
        this.globalChart.append('g')
            .attr('class', 'y-axis')
            .style('color', '#cccccc');
        
        // Add axis labels
        this.globalChart.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#cccccc')
            .style('font-size', '12px')
            .text('Número de Casos');
        
        // Create line generators
        this.globalLines = {
            cases: d3.line()
                .x(d => this.globalScales.x(d.date))
                .y(d => this.globalScales.y(d.cases))
                .curve(d3.curveMonotoneX),
            deaths: d3.line()
                .x(d => this.globalScales.x(d.date))
                .y(d => this.globalScales.y(d.deaths))
                .curve(d3.curveMonotoneX),
            recovered: d3.line()
                .x(d => this.globalScales.x(d.date))
                .y(d => this.globalScales.y(d.recovered))
                .curve(d3.curveMonotoneX)
        };
        
        // Add legend
        this.addGlobalLegend();
    }
    
    addGlobalLegend() {
        const legend = this.globalChart.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 120}, 20)`);
        
        const legendData = [
            { name: 'Casos', color: this.colors.cases },
            { name: 'Muertes', color: this.colors.deaths },
            { name: 'Recuperados', color: this.colors.recovered }
        ];
        
        const legendItems = legend.selectAll('.legend-item')
            .data(legendData)
            .enter().append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);
        
        legendItems.append('line')
            .attr('x1', 0)
            .attr('x2', 15)
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', d => d.color)
            .style('stroke-width', 2);
        
        legendItems.append('text')
            .attr('x', 20)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .style('fill', '#cccccc')
            .style('font-size', '12px')
            .text(d => d.name);
    }
    
    createCountryChart() {
        // Clear existing chart
        this.countryChartContainer.selectAll('*').remove();
        
        // Create SVG
        const svg = this.countryChartContainer
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        
        // Create chart group
        this.countryChart = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Add title
        svg.append('text')
            .attr('x', (this.width + this.margin.left + this.margin.right) / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#ffffff')
            .text('Top 10 Países por Casos');
        
        // Create scales
        this.countryScales = {
            x: d3.scaleBand().range([0, this.width]).padding(0.1),
            y: d3.scaleLinear().range([this.height, 0])
        };
        
        // Create axes
        this.countryAxes = {
            x: d3.axisBottom(this.countryScales.x),
            y: d3.axisLeft(this.countryScales.y).tickFormat(d3.format('.2s'))
        };
        
        // Add axes to chart
        this.countryChart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height})`)
            .style('color', '#cccccc');
        
        this.countryChart.append('g')
            .attr('class', 'y-axis')
            .style('color', '#cccccc');
        
        // Add axis labels
        this.countryChart.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#cccccc')
            .style('font-size', '12px')
            .text('Casos Totales');
    }
    
    updateGlobalChart(simulationData) {
        if (!simulationData || !simulationData.globalStats) return;
        
        // Add new data point
        const dataPoint = {
            date: new Date(simulationData.currentDate),
            cases: simulationData.globalStats.totalCases,
            deaths: simulationData.globalStats.totalDeaths,
            recovered: simulationData.globalStats.totalRecovered,
            active: simulationData.globalStats.activeCases
        };
        
        this.globalData.push(dataPoint);
        
        // Keep only recent data points
        if (this.globalData.length > this.maxDataPoints) {
            this.globalData.shift();
        }
        
        // Update scales
        this.globalScales.x.domain(d3.extent(this.globalData, d => d.date));
        this.globalScales.y.domain([0, d3.max(this.globalData, d => Math.max(d.cases, d.deaths, d.recovered))]);
        
        // Update axes
        this.globalChart.select('.x-axis')
            .transition()
            .duration(500)
            .call(this.globalAxes.x);
        
        this.globalChart.select('.y-axis')
            .transition()
            .duration(500)
            .call(this.globalAxes.y);
        
        // Update lines
        this.updateGlobalLines();
    }
    
    updateGlobalLines() {
        // Cases line
        let casesPath = this.globalChart.select('.cases-line');
        if (casesPath.empty()) {
            casesPath = this.globalChart.append('path')
                .attr('class', 'cases-line')
                .style('fill', 'none')
                .style('stroke', this.colors.cases)
                .style('stroke-width', 2);
        }
        
        casesPath
            .datum(this.globalData)
            .transition()
            .duration(500)
            .attr('d', this.globalLines.cases);
        
        // Deaths line
        let deathsPath = this.globalChart.select('.deaths-line');
        if (deathsPath.empty()) {
            deathsPath = this.globalChart.append('path')
                .attr('class', 'deaths-line')
                .style('fill', 'none')
                .style('stroke', this.colors.deaths)
                .style('stroke-width', 2);
        }
        
        deathsPath
            .datum(this.globalData)
            .transition()
            .duration(500)
            .attr('d', this.globalLines.deaths);
        
        // Recovered line
        let recoveredPath = this.globalChart.select('.recovered-line');
        if (recoveredPath.empty()) {
            recoveredPath = this.globalChart.append('path')
                .attr('class', 'recovered-line')
                .style('fill', 'none')
                .style('stroke', this.colors.recovered)
                .style('stroke-width', 2);
        }
        
        recoveredPath
            .datum(this.globalData)
            .transition()
            .duration(500)
            .attr('d', this.globalLines.recovered);
        
        // Add data points (circles)
        this.addDataPoints();
    }
    
    addDataPoints() {
        // Add circles for latest data point
        if (this.globalData.length === 0) return;
        
        const latestData = this.globalData[this.globalData.length - 1];
        
        // Remove old points
        this.globalChart.selectAll('.data-point').remove();
        
        // Cases point
        this.globalChart.append('circle')
            .attr('class', 'data-point cases-point')
            .attr('cx', this.globalScales.x(latestData.date))
            .attr('cy', this.globalScales.y(latestData.cases))
            .attr('r', 4)
            .style('fill', this.colors.cases)
            .style('stroke', '#ffffff')
            .style('stroke-width', 2);
        
        // Deaths point
        this.globalChart.append('circle')
            .attr('class', 'data-point deaths-point')
            .attr('cx', this.globalScales.x(latestData.date))
            .attr('cy', this.globalScales.y(latestData.deaths))
            .attr('r', 4)
            .style('fill', this.colors.deaths)
            .style('stroke', '#ffffff')
            .style('stroke-width', 2);
        
        // Recovered point
        this.globalChart.append('circle')
            .attr('class', 'data-point recovered-point')
            .attr('cx', this.globalScales.x(latestData.date))
            .attr('cy', this.globalScales.y(latestData.recovered))
            .attr('r', 4)
            .style('fill', this.colors.recovered)
            .style('stroke', '#ffffff')
            .style('stroke-width', 2);
    }
    
    updateCountryChart(simulationData) {
        if (!simulationData || !simulationData.topCountries) return;
        
        const topCountries = simulationData.topCountries.slice(0, 10);
        
        // Update scales
        this.countryScales.x.domain(topCountries.map(d => d.name || d.code));
        this.countryScales.y.domain([0, d3.max(topCountries, d => d.cases)]);
        
        // Update axes
        this.countryChart.select('.x-axis')
            .transition()
            .duration(500)
            .call(this.countryAxes.x)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');
        
        this.countryChart.select('.y-axis')
            .transition()
            .duration(500)
            .call(this.countryAxes.y);
        
        // Update bars
        const bars = this.countryChart.selectAll('.country-bar')
            .data(topCountries, d => d.code);
        
        // Remove old bars
        bars.exit()
            .transition()
            .duration(500)
            .attr('height', 0)
            .attr('y', this.height)
            .remove();
        
        // Add new bars
        const newBars = bars.enter()
            .append('rect')
            .attr('class', 'country-bar')
            .attr('x', d => this.countryScales.x(d.name || d.code))
            .attr('width', this.countryScales.x.bandwidth())
            .attr('y', this.height)
            .attr('height', 0)
            .style('fill', this.colors.cases)
            .style('opacity', 0.8);
        
        // Update all bars
        newBars.merge(bars)
            .transition()
            .duration(500)
            .attr('x', d => this.countryScales.x(d.name || d.code))
            .attr('width', this.countryScales.x.bandwidth())
            .attr('y', d => this.countryScales.y(d.cases))
            .attr('height', d => this.height - this.countryScales.y(d.cases))
            .style('fill', (d, i) => {
                // Color gradient for top countries
                const intensity = 1 - (i / topCountries.length);
                return d3.interpolateReds(0.3 + intensity * 0.7);
            });
        
        // Add value labels on bars
        this.addBarLabels(topCountries);
        
        // Add hover effects
        this.addBarHoverEffects();
    }
    
    addBarLabels(data) {
        // Remove old labels
        this.countryChart.selectAll('.bar-label').remove();
        
        // Add new labels
        this.countryChart.selectAll('.bar-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => this.countryScales.x(d.name || d.code) + this.countryScales.x.bandwidth() / 2)
            .attr('y', d => this.countryScales.y(d.cases) - 5)
            .attr('text-anchor', 'middle')
            .style('fill', '#cccccc')
            .style('font-size', '10px')
            .text(d => this.formatNumber(d.cases));
    }
    
    addBarHoverEffects() {
        this.countryChart.selectAll('.country-bar')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .style('opacity', 1)
                    .style('stroke', '#ffffff')
                    .style('stroke-width', 2);
                
                // Show tooltip
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'chart-tooltip')
                    .style('position', 'absolute')
                    .style('background', 'rgba(0, 0, 0, 0.9)')
                    .style('color', 'white')
                    .style('padding', '8px 12px')
                    .style('border-radius', '4px')
                    .style('font-size', '12px')
                    .style('pointer-events', 'none')
                    .style('z-index', '1000')
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
                    .html(`
                        <strong>${d.name || d.code}</strong><br>
                        Casos: ${this.formatNumber(d.cases)}<br>
                        Activos: ${this.formatNumber(d.active)}<br>
                        Muertes: ${this.formatNumber(d.deaths)}
                    `.bind(this));
            }.bind(this))
            .on('mouseout', function() {
                d3.select(this)
                    .style('opacity', 0.8)
                    .style('stroke', 'none');
                
                // Remove tooltip
                d3.selectAll('.chart-tooltip').remove();
            });
    }
    
    formatNumber(num) {
        if (num === 0) return '0';
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }
    
    showError(message) {
        this.globalChartContainer.html(`
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff4444; text-align: center;">
                <div>
                    <h4>Error en Gráficas</h4>
                    <p>${message}</p>
                </div>
            </div>
        `);
        
        this.countryChartContainer.html(`
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff4444; text-align: center;">
                <div>
                    <h4>Error en Gráficas</h4>
                    <p>${message}</p>
                </div>
            </div>
        `);
    }
    
    // Public methods
    reset() {
        this.globalData = [];
        this.countryData = [];
        
        // Clear charts
        if (this.globalChart) {
            this.globalChart.selectAll('.cases-line, .deaths-line, .recovered-line, .data-point').remove();
        }
        
        if (this.countryChart) {
            this.countryChart.selectAll('.country-bar, .bar-label').remove();
        }
    }
    
    resize() {
        // Recalculate dimensions
        const containerWidth = this.globalChartContainer.node().getBoundingClientRect().width;
        this.width = containerWidth - this.margin.left - this.margin.right;
        
        // Recreate charts with new dimensions
        this.createGlobalChart();
        this.createCountryChart();
    }
    
    exportData() {
        return {
            globalData: this.globalData,
            countryData: this.countryData
        };
    }
    
    // Animation methods
    animateEntry() {
        if (this.globalChart) {
            this.globalChart.selectAll('path')
                .style('opacity', 0)
                .transition()
                .duration(1000)
                .style('opacity', 1);
        }
        
        if (this.countryChart) {
            this.countryChart.selectAll('.country-bar')
                .attr('height', 0)
                .attr('y', this.height)
                .transition()
                .duration(1000)
                .delay((d, i) => i * 100)
                .attr('height', d => this.height - this.countryScales.y(d.cases))
                .attr('y', d => this.countryScales.y(d.cases));
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CovidCharts;
} else {
    window.CovidCharts = CovidCharts;
}
