// Main Application Controller
class CovidSimulatorApp {
    constructor() {
        this.simulation = null;
        this.worldMap = null;
        this.charts = null;
        
        // UI elements
        this.elements = {};
        
        // Application state
        this.currentMode = 'virus'; // 'virus' or 'government'
        this.isInitialized = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    async initialize() {
        try {
            console.log('Inicializando simulador COVID-19...');
            
            // Show loading screen
            this.showLoadingScreen(true);
            
            // Get UI elements
            this.getUIElements();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup parameter controls
            this.setupParameterControls();
            
            // Setup simulation controls
            this.setupSimulationControls();
            
            // Setup mode selector
            this.setupModeSelector();
            
            // Hide loading screen
            this.showLoadingScreen(false);
            
            this.isInitialized = true;
            console.log('Simulador inicializado correctamente');
            
        } catch (error) {
            console.error('Error inicializando aplicación:', error);
            this.showError('Error al inicializar el simulador: ' + error.message);
        }
    }
    
    getUIElements() {
        // Parameter controls
        this.elements.infectivity = document.getElementById('infectivity');
        this.elements.infectivityValue = document.getElementById('infectivityValue');
        this.elements.severity = document.getElementById('severity');
        this.elements.severityValue = document.getElementById('severityValue');
        this.elements.mortality = document.getElementById('mortality');
        this.elements.mortalityValue = document.getElementById('mortalityValue');
        this.elements.incubation = document.getElementById('incubation');
        this.elements.incubationValue = document.getElementById('incubationValue');
        this.elements.infectious = document.getElementById('infectious');
        this.elements.infectiousValue = document.getElementById('infectiousValue');
        
        // Simulation controls
        this.elements.startSim = document.getElementById('startSim');
        this.elements.pauseSim = document.getElementById('pauseSim');
        this.elements.resetSim = document.getElementById('resetSim');
        this.elements.simSpeed = document.getElementById('simSpeed');
        this.elements.speedValue = document.getElementById('speedValue');
        
        // Statistics displays
        this.elements.totalCases = document.getElementById('totalCases');
        this.elements.activeCases = document.getElementById('activeCases');
        this.elements.totalDeaths = document.getElementById('totalDeaths');
        this.elements.totalRecovered = document.getElementById('totalRecovered');
        
        // Variant display
        this.elements.currentVariant = document.getElementById('currentVariant');
        this.elements.variantDate = document.getElementById('variantDate');
        
        // Timeline
        this.elements.currentDate = document.getElementById('currentDate');
        this.elements.timelineEvents = document.getElementById('timelineEvents');
        
        // Mode selector
        this.elements.virusMode = document.getElementById('virusMode');
        this.elements.govMode = document.getElementById('govMode');
        
        // Error handling
        this.elements.errorContainer = document.getElementById('errorContainer');
        this.elements.errorText = document.getElementById('errorText');
        this.elements.retryBtn = document.getElementById('retryBtn');
        
        // Loading screen
        this.elements.loadingScreen = document.getElementById('loadingScreen');
    }
    
    async initializeComponents() {
        // Initialize simulation engine
        this.simulation = new CovidSimulation();
        await this.simulation.initializeSimulation();
        
        // Initialize world map
        this.worldMap = new WorldMap('worldMap');
        
        // Initialize charts
        this.charts = new CovidCharts();
        
        // Setup simulation callbacks
        this.simulation.onSimulationUpdate((data) => this.onSimulationUpdate(data));
        this.simulation.onHistoricalEvent((event) => this.onHistoricalEvent(event));
        this.simulation.onVariantChanged((variant, data) => this.onVariantChanged(variant, data));
        
        // Setup map callbacks
        this.worldMap.onCountryClickHandler((countryCode, countryData) => {
            this.onCountryClick(countryCode, countryData);
        });
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            if (this.charts) {
                this.charts.resize();
            }
        });
        
        // Error retry button
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => {
                location.reload();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleSimulation();
            } else if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                this.resetSimulation();
            }
        });
    }
    
    setupParameterControls() {
        // Infectivity control
        if (this.elements.infectivity) {
            this.elements.infectivity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.elements.infectivityValue.textContent = value.toFixed(1);
                this.updateVirusParameter('infectivity', value);
            });
        }
        
        // Severity control
        if (this.elements.severity) {
            this.elements.severity.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.elements.severityValue.textContent = value;
                this.updateVirusParameter('severity', value);
            });
        }
        
        // Mortality control
        if (this.elements.mortality) {
            this.elements.mortality.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.elements.mortalityValue.textContent = value.toFixed(1);
                this.updateVirusParameter('mortality', value);
            });
        }
        
        // Incubation control
        if (this.elements.incubation) {
            this.elements.incubation.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.elements.incubationValue.textContent = value;
                this.updateVirusParameter('incubation', value);
            });
        }
        
        // Infectious period control
        if (this.elements.infectious) {
            this.elements.infectious.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.elements.infectiousValue.textContent = value;
                this.updateVirusParameter('infectious', value);
            });
        }
    }
    
    setupSimulationControls() {
        // Start simulation button
        if (this.elements.startSim) {
            this.elements.startSim.addEventListener('click', () => {
                this.startSimulation();
            });
        }
        
        // Pause simulation button
        if (this.elements.pauseSim) {
            this.elements.pauseSim.addEventListener('click', () => {
                this.pauseSimulation();
            });
        }
        
        // Reset simulation button
        if (this.elements.resetSim) {
            this.elements.resetSim.addEventListener('click', () => {
                this.resetSimulation();
            });
        }
        
        // Speed control
        if (this.elements.simSpeed) {
            this.elements.simSpeed.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.elements.speedValue.textContent = value + 'x';
                if (this.simulation) {
                    this.simulation.setSpeed(value);
                }
            });
        }
    }
    
    setupModeSelector() {
        // Virus mode button
        if (this.elements.virusMode) {
            this.elements.virusMode.addEventListener('click', () => {
                this.setMode('virus');
            });
        }
        
        // Government mode button
        if (this.elements.govMode) {
            this.elements.govMode.addEventListener('click', () => {
                this.setMode('government');
            });
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        if (this.simulation) {
            this.simulation.currentMode = mode;
        }
        
        // Update UI buttons
        if (this.elements.virusMode && this.elements.govMode) {
            this.elements.virusMode.classList.toggle('active', mode === 'virus');
            this.elements.govMode.classList.toggle('active', mode === 'government');
        }
        
        // Show/hide panels
        const virusPanel = document.querySelector('.virus-panel');
        const govPanel = document.querySelector('.government-panel');
        if (virusPanel && govPanel) {
            virusPanel.style.display = mode === 'virus' ? 'block' : 'none';
            govPanel.style.display = mode === 'government' ? 'block' : 'none';
        }
    }

    setupGovernmentControls() {
        const govButtons = document.querySelectorAll('.gov-btn');
        govButtons.forEach(button => {
            button.addEventListener('click', () => {
                const measure = button.getAttribute('data-measure');
                this.applyGovernmentMeasureToAll(measure);
                button.classList.toggle('gov-active');
            });
        });
    }

    applyGovernmentMeasureToAll(measure) {
        if (!this.simulation) return;
        Object.keys(this.simulation.countries).forEach(countryCode => {
            const country = this.simulation.countries[countryCode];
            this.simulation.applyGovernmentMeasure(country, measure);
        });
        // Update map visualization
        if (this.worldMap) {
            this.worldMap.updateCountryData(this.simulation.getSimulationState());
        }
    }
    
    initialize() {
        // Existing initialization code...
        this.setupModeSelector();
        this.setupGovernmentControls();
        // ...
    }
    
    updateVirusParameter(parameter, value) {
        if (this.simulation) {
            const params = {};
            params[parameter] = value;
            this.simulation.updateVirusParams(params);
        }
    }
    
    startSimulation() {
        if (!this.simulation) return;
        
        this.simulation.start();
        this.updateSimulationButtons(true, false);
    }
    
    pauseSimulation() {
        if (!this.simulation) return;
        
        this.simulation.pause();
        const isPaused = this.simulation.isPaused;
        this.elements.pauseSim.textContent = isPaused ? 'Reanudar' : 'Pausar';
    }
    
    toggleSimulation() {
        if (!this.simulation) return;
        
        if (this.simulation.isRunning) {
            this.pauseSimulation();
        } else {
            this.startSimulation();
        }
    }
    
    resetSimulation() {
        if (!this.simulation) return;
        
        this.simulation.reset();
        this.updateSimulationButtons(false, true);
        
        // Reset charts
        if (this.charts) {
            this.charts.reset();
        }
        
        // Reset timeline
        if (this.elements.timelineEvents) {
            this.elements.timelineEvents.innerHTML = '<div class="event-item">Simulación reiniciada...</div>';
        }
        
        console.log('Simulación reiniciada');
    }
    
    updateSimulationButtons(isRunning, isReset = false) {
        if (this.elements.startSim) {
            this.elements.startSim.disabled = isRunning;
        }
        
        if (this.elements.pauseSim) {
            this.elements.pauseSim.disabled = !isRunning;
            this.elements.pauseSim.textContent = 'Pausar';
        }
        
        if (isReset && this.elements.pauseSim) {
            this.elements.pauseSim.textContent = 'Pausar';
        }
    }
    
    setMode(mode) {
        this.currentMode = mode;
        
        // Update button states
        if (this.elements.virusMode && this.elements.govMode) {
            this.elements.virusMode.classList.toggle('active', mode === 'virus');
            this.elements.govMode.classList.toggle('active', mode === 'government');
        }
        
        // Update UI based on mode
        this.updateModeUI(mode);
        
        console.log(`Modo cambiado a: ${mode}`);
    }
    
    updateModeUI(mode) {
        // This could be expanded to show/hide different controls based on mode
        // For now, both modes use the same interface
        
        if (mode === 'government') {
            // Could show government-specific controls
            console.log('Modo gobierno activado - controles de medidas gubernamentales');
        } else {
            // Show virus-specific controls
            console.log('Modo virus activado - controles de parámetros virales');
        }
    }
    
    onSimulationUpdate(data) {
        // Update statistics display
        this.updateStatistics(data.globalStats);
        
        // Update date display
        this.updateDateDisplay(data.currentDate);
        
        // Update variant display
        this.updateVariantDisplay(data.currentVariant);
        
        // Update map
        if (this.worldMap) {
            this.worldMap.updateCountryData(data);
        }
        
        // Update charts
        if (this.charts) {
            this.charts.updateGlobalChart(data);
            this.charts.updateCountryChart(data);
        }
    }
    
    onHistoricalEvent(event) {
        console.log('Evento histórico:', event);
        
        // Add event to timeline
        if (this.elements.timelineEvents) {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item fade-in';
            eventElement.innerHTML = `
                <strong>${this.formatDate(new Date(event.date))}</strong>: ${event.description}
            `;
            
            // Add to beginning of timeline
            this.elements.timelineEvents.insertBefore(eventElement, this.elements.timelineEvents.firstChild);
            
            // Remove old events (keep last 10)
            const events = this.elements.timelineEvents.querySelectorAll('.event-item');
            if (events.length > 10) {
                for (let i = 10; i < events.length; i++) {
                    events[i].remove();
                }
            }
        }
    }
    
    onVariantChanged(variant, data) {
        console.log('Variante cambiada:', variant, data);
        
        // Update variant display
        this.updateVariantDisplay(variant);
        
        // Show notification
        this.showNotification(`Nueva variante detectada: ${data.name}`, 'warning');
    }
    
    onCountryClick(countryCode, countryData) {
        console.log('País seleccionado:', countryCode, countryData);
        
        // Focus map on country
        if (this.worldMap) {
            this.worldMap.focusOnCountry(countryCode);
        }
    }
    
    updateStatistics(stats) {
        if (this.elements.totalCases) {
            this.elements.totalCases.textContent = this.formatNumber(stats.totalCases);
        }
        
        if (this.elements.activeCases) {
            this.elements.activeCases.textContent = this.formatNumber(stats.activeCases);
        }
        
        if (this.elements.totalDeaths) {
            this.elements.totalDeaths.textContent = this.formatNumber(stats.totalDeaths);
        }
        
        if (this.elements.totalRecovered) {
            this.elements.totalRecovered.textContent = this.formatNumber(stats.totalRecovered);
        }
    }
    
    updateDateDisplay(date) {
        if (this.elements.currentDate) {
            this.elements.currentDate.textContent = this.formatDate(new Date(date));
        }
    }
    
    updateVariantDisplay(variant) {
        if (this.elements.currentVariant && this.simulation) {
            const variantData = this.simulation.variants[variant];
            if (variantData) {
                this.elements.currentVariant.textContent = variantData.name;
                if (this.elements.variantDate) {
                    this.elements.variantDate.textContent = this.formatDate(new Date(variantData.first_detected));
                }
            }
        }
    }
    
    formatNumber(num) {
        if (num === 0) return '0';
        if (num < 1000) return num.toLocaleString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }
    
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    }
    
    showLoadingScreen(show) {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = show ? 'flex' : 'none';
        }
    }
    
    showError(message) {
        console.error('Error de aplicación:', message);
        
        if (this.elements.errorContainer && this.elements.errorText) {
            this.elements.errorText.textContent = message;
            this.elements.errorContainer.style.display = 'flex';
        }
        
        // Hide loading screen
        this.showLoadingScreen(false);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'warning' ? '#ff8844' : '#4444ff'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Public API methods
    getSimulationData() {
        return this.simulation ? this.simulation.getSimulationState() : null;
    }
    
    exportData() {
        const data = {
            simulation: this.getSimulationData(),
            charts: this.charts ? this.charts.exportData() : null,
            timestamp: new Date().toISOString()
        };
        
        // Create download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `covid-simulation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
const covidSimulatorApp = new CovidSimulatorApp();

// Export for global access
window.CovidSimulatorApp = covidSimulatorApp;
