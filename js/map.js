// Interactive World Map Handler
class WorldMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.countries = new Map();
        this.currentZoom = 1;
        this.currentTransform = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        
        // Color scales for visualization
        this.colorScale = {
            low: '#44ff44',      // Green - low risk
            medium: '#ff8844',   // Orange - medium risk  
            high: '#ff4444',     // Red - high risk
            noData: '#2a2a2a'    // Dark gray - no data
        };
        
        // Outbreak points for visual effects
        this.outbreakPoints = [];
        
        // Callbacks
        this.onCountryClick = null;
        this.onCountryHover = null;
        
        this.initialize();
    }
    
    async initialize() {
        try {
            await this.loadMap();
            this.setupInteractions();
            this.setupZoomControls();
            console.log('Mapa mundial cargado correctamente');
        } catch (error) {
            console.error('Error cargando mapa:', error);
            this.showError('No se pudo cargar el mapa mundial');
        }
    }
    
    async loadMap() {
        try {
            const response = await fetch('assets/world_map.svg');
            const svgText = await response.text();
            
            // Insert SVG into container
            this.container.innerHTML = svgText;
            this.svg = this.container.querySelector('svg');
            
            if (!this.svg) {
                throw new Error('SVG no encontrado en el archivo');
            }
            
            // Setup SVG properties
            this.svg.style.width = '100%';
            this.svg.style.height = '100%';
            this.svg.style.cursor = 'grab';
            
            // Get all country paths
            const countryPaths = this.svg.querySelectorAll('.country-path');
            countryPaths.forEach(path => {
                const countryCode = path.id;
                if (countryCode) {
                    this.countries.set(countryCode, {
                        element: path,
                        code: countryCode,
                        cases: 0,
                        deaths: 0,
                        recovered: 0,
                        active: 0,
                        casesPerCapita: 0,
                        riskLevel: 'noData'
                    });
                }
            });
            
            console.log(`Mapa cargado con ${this.countries.size} países`);
            
        } catch (error) {
            throw new Error(`Error cargando SVG: ${error.message}`);
        }
    }
    
    setupInteractions() {
        // Country click and hover events
        this.countries.forEach((country, code) => {
            const element = country.element;
            
            // Click event
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleCountryClick(code, country);
            });
            
            // Hover events
            element.addEventListener('mouseenter', (e) => {
                this.handleCountryHover(code, country, e);
                element.style.filter = 'brightness(1.2)';
            });
            
            element.addEventListener('mouseleave', (e) => {
                element.style.filter = 'brightness(1)';
            });
        });
        
        // Map pan functionality
        this.svg.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.svg.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMousePos.x;
                const deltaY = e.clientY - this.lastMousePos.y;
                
                this.currentTransform.x += deltaX;
                this.currentTransform.y += deltaY;
                
                this.updateTransform();
                
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.svg.style.cursor = 'grab';
        });
        
        // Zoom with mouse wheel
        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(zoomFactor, e.offsetX, e.offsetY);
        });
    }
    
    setupZoomControls() {
        // Zoom in button
        const zoomInBtn = document.getElementById('zoomIn');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoom(1.2);
            });
        }
        
        // Zoom out button
        const zoomOutBtn = document.getElementById('zoomOut');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoom(0.8);
            });
        }
        
        // Reset zoom button
        const resetZoomBtn = document.getElementById('resetZoom');
        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', () => {
                this.resetZoom();
            });
        }
    }
    
    zoom(factor, centerX = null, centerY = null) {
        const newZoom = Math.max(0.5, Math.min(5, this.currentZoom * factor));
        
        if (centerX !== null && centerY !== null) {
            // Zoom towards mouse position
            const rect = this.svg.getBoundingClientRect();
            const svgX = centerX - rect.left;
            const svgY = centerY - rect.top;
            
            this.currentTransform.x = svgX - (svgX - this.currentTransform.x) * (newZoom / this.currentZoom);
            this.currentTransform.y = svgY - (svgY - this.currentTransform.y) * (newZoom / this.currentZoom);
        }
        
        this.currentZoom = newZoom;
        this.updateTransform();
    }
    
    resetZoom() {
        this.currentZoom = 1;
        this.currentTransform = { x: 0, y: 0 };
        this.updateTransform();
    }
    
    updateTransform() {
        const transform = `translate(${this.currentTransform.x}px, ${this.currentTransform.y}px) scale(${this.currentZoom})`;
        this.svg.style.transform = transform;
    }
    
    handleCountryClick(countryCode, countryData) {
        console.log(`País clickeado: ${countryCode}`, countryData);
        
        if (this.onCountryClick) {
            this.onCountryClick(countryCode, countryData);
        }
        
        // Show country modal
        this.showCountryModal(countryCode, countryData);
    }
    
    handleCountryHover(countryCode, countryData, event) {
        if (this.onCountryHover) {
            this.onCountryHover(countryCode, countryData, event);
        }
        
        // Show tooltip with government measures
        this.showTooltip(countryCode, countryData, event);
    }
    
    showTooltip(countryCode, countryData, event) {
        // Remove existing tooltip
        const existingTooltip = document.getElementById('mapTooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.id = 'mapTooltip';
        tooltip.className = 'map-tooltip';
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY - 10) + 'px';
        
        // Prepare measures list
        let measuresHtml = '';
        if (countryData.activeMeasures && countryData.activeMeasures.length > 0) {
            measuresHtml = '<br><strong>Medidas activas:</strong><ul>';
            countryData.activeMeasures.forEach(measure => {
                measuresHtml += `<li>${this.getMeasureName(measure)}</li>`;
            });
            measuresHtml += '</ul>';
        } else {
            measuresHtml = '<br><em>Sin medidas activas</em>';
        }
        
        tooltip.innerHTML = `
            <strong>${this.getCountryName(countryCode)}</strong><br>
            Casos: ${this.formatNumber(countryData.cases)}<br>
            Activos: ${this.formatNumber(countryData.active)}${measuresHtml}
        `;
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip after 3 seconds or on mouseout
        const removeTooltip = () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        };
        
        setTimeout(removeTooltip, 3000);
        
        this.svg.querySelector(`#${countryCode}`).addEventListener('mouseout', removeTooltip, { once: true });
    }
    
    showCountryModal(countryCode, countryData) {
        const modal = document.getElementById('countryModal');
        if (!modal) return;
        
        // Update modal content
        const countryName = document.getElementById('countryName');
        const countryPopulation = document.getElementById('countryPopulation');
        const countryCases = document.getElementById('countryCases');
        const countryActive = document.getElementById('countryActive');
        const countryDeaths = document.getElementById('countryDeaths');
        const countryRecovered = document.getElementById('countryRecovered');
        const countryRate = document.getElementById('countryRate');
        const activeMeasures = document.getElementById('activeMeasures');
        
        if (countryName) countryName.textContent = this.getCountryName(countryCode);
        if (countryPopulation) countryPopulation.textContent = this.formatNumber(countryData.population || 0);
        if (countryCases) countryCases.textContent = this.formatNumber(countryData.cases);
        if (countryActive) countryActive.textContent = this.formatNumber(countryData.active);
        if (countryDeaths) countryDeaths.textContent = this.formatNumber(countryData.deaths);
        if (countryRecovered) countryRecovered.textContent = this.formatNumber(countryData.recovered);
        if (countryRate) countryRate.textContent = this.formatNumber(countryData.casesPerCapita, 1);
        
        // Update active measures
        if (activeMeasures) {
            const measures = countryData.activeMeasures || [];
            if (measures.length === 0) {
                activeMeasures.innerHTML = '<div class="measure-item">Sin medidas activas</div>';
            } else {
                activeMeasures.innerHTML = measures.map(measure => 
                    `<div class="measure-item">${this.getMeasureName(measure)}</div>`
                ).join('');
            }
        }
        
        // Show modal
        modal.style.display = 'block';
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        // Close on outside click
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
    
    showTooltip(countryCode, countryData, event) {
        // Simple tooltip implementation
        const existingTooltip = document.getElementById('mapTooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        const tooltip = document.createElement('div');
        tooltip.id = 'mapTooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            left: ${event.pageX + 10}px;
            top: ${event.pageY - 10}px;
        `;
        
        tooltip.innerHTML = `
            <strong>${this.getCountryName(countryCode)}</strong><br>
            Casos: ${this.formatNumber(countryData.cases)}<br>
            Activos: ${this.formatNumber(countryData.active)}
        `;
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip after delay
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }
    
    updateCountryData(simulationData) {
        if (!simulationData || !simulationData.countries) return;
        
        // Update country data and colors
        Object.keys(simulationData.countries).forEach(countryCode => {
            const simCountry = simulationData.countries[countryCode];
            const mapCountry = this.countries.get(countryCode);
            
            if (mapCountry) {
                // Update data
                mapCountry.cases = simCountry.cases;
                mapCountry.deaths = simCountry.deaths;
                mapCountry.recovered = simCountry.recovered;
                mapCountry.active = simCountry.active;
                mapCountry.casesPerCapita = simCountry.casesPerCapita;
                mapCountry.population = simCountry.population;
                mapCountry.activeMeasures = simCountry.activeMeasures || [];
                
                // Update risk level and color
                const riskLevel = this.calculateRiskLevel(simCountry.casesPerCapita);
                mapCountry.riskLevel = riskLevel;
                
                // Apply color
                const color = this.colorScale[riskLevel];
                mapCountry.element.style.fill = color;
                
                // Visualize government measures by changing stroke color and width
                if (mapCountry.activeMeasures.length > 0) {
                    mapCountry.element.style.stroke = '#00ffff'; // Cyan border for active measures
                    mapCountry.element.style.strokeWidth = '3';
                    mapCountry.element.style.filter = 'drop-shadow(0 0 5px cyan)';
                } else {
                    mapCountry.element.style.stroke = '#333333';
                    mapCountry.element.style.strokeWidth = '0.5';
                    mapCountry.element.style.filter = 'none';
                }
                
                // Add outbreak points for new infections
                if (simCountry.dailyCases > 0) {
                    this.addOutbreakPoint(countryCode, simCountry.dailyCases);
                }
            }
        });
        
        // Update outbreak points animation
        this.updateOutbreakPoints();
    }
    
    calculateRiskLevel(casesPerCapita) {
        if (casesPerCapita >= 1000) return 'high';
        if (casesPerCapita >= 100) return 'medium';
        if (casesPerCapita > 0) return 'low';
        return 'noData';
    }
    
    addOutbreakPoint(countryCode, intensity) {
        const country = this.countries.get(countryCode);
        if (!country) return;
        
        // Get country center (simplified)
        const bbox = country.element.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        
        // Create outbreak point
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', centerX);
        point.setAttribute('cy', centerY);
        point.setAttribute('r', Math.min(Math.sqrt(intensity) * 0.5, 10));
        point.setAttribute('class', 'outbreak-point');
        point.style.fill = '#ff4444';
        point.style.opacity = '0.8';
        
        this.svg.appendChild(point);
        
        // Store for cleanup
        this.outbreakPoints.push({
            element: point,
            timestamp: Date.now(),
            duration: 3000
        });
    }
    
    updateOutbreakPoints() {
        const now = Date.now();
        this.outbreakPoints = this.outbreakPoints.filter(point => {
            const age = now - point.timestamp;
            if (age > point.duration) {
                // Remove expired point
                if (point.element.parentNode) {
                    point.element.parentNode.removeChild(point.element);
                }
                return false;
            } else {
                // Fade out
                const opacity = 1 - (age / point.duration);
                point.element.style.opacity = opacity;
                return true;
            }
        });
    }
    
    getCountryName(countryCode) {
        const countryNames = {
            'USA': 'Estados Unidos', 'CHN': 'China', 'IND': 'India', 'BRA': 'Brasil',
            'RUS': 'Rusia', 'FRA': 'Francia', 'GBR': 'Reino Unido', 'TUR': 'Turquía',
            'IRN': 'Irán', 'DEU': 'Alemania', 'VNM': 'Vietnam', 'ITA': 'Italia',
            'IDN': 'Indonesia', 'POL': 'Polonia', 'UKR': 'Ucrania', 'ZAF': 'Sudáfrica',
            'NLD': 'Países Bajos', 'IRQ': 'Irak', 'PHL': 'Filipinas', 'MYS': 'Malasia',
            'PER': 'Perú', 'CZE': 'República Checa', 'JPN': 'Japón', 'CAN': 'Canadá',
            'CHL': 'Chile', 'BGD': 'Bangladesh', 'BEL': 'Bélgica', 'THA': 'Tailandia',
            'ISR': 'Israel', 'PAK': 'Pakistán', 'ROU': 'Rumania', 'ESP': 'España',
            'ARG': 'Argentina', 'AUS': 'Australia', 'KOR': 'Corea del Sur',
            'MEX': 'México', 'COL': 'Colombia', 'VEN': 'Venezuela', 'ECU': 'Ecuador',
            'URY': 'Uruguay', 'PRY': 'Paraguay', 'BOL': 'Bolivia', 'GUY': 'Guyana',
            'SUR': 'Suriname', 'GUF': 'Guayana Francesa', 'NOR': 'Noruega',
            'SWE': 'Suecia', 'FIN': 'Finlandia', 'DNK': 'Dinamarca', 'ISL': 'Islandia',
            'IRL': 'Irlanda', 'PRT': 'Portugal', 'CHE': 'Suiza', 'AUT': 'Austria',
            'BEL': 'Bélgica', 'LUX': 'Luxemburgo', 'SVN': 'Eslovenia', 'HRV': 'Croacia',
            'BIH': 'Bosnia y Herzegovina', 'SRB': 'Serbia', 'MNE': 'Montenegro',
            'MKD': 'Macedonia del Norte', 'ALB': 'Albania', 'GRC': 'Grecia',
            'BGR': 'Bulgaria', 'ROU': 'Rumania', 'MDA': 'Moldavia', 'UKR': 'Ucrania',
            'BLR': 'Bielorrusia', 'LTU': 'Lituania', 'LVA': 'Letonia', 'EST': 'Estonia'
        };
        return countryNames[countryCode] || countryCode;
    }
    
    getMeasureName(measureCode) {
        const measureNames = {
            'border_closure': 'Cierre de fronteras',
            'lockdown_partial': 'Cuarentena parcial',
            'lockdown_full': 'Cuarentena total',
            'mask_mandate': 'Uso obligatorio de mascarillas',
            'event_ban': 'Suspensión de eventos',
            'curfew': 'Toque de queda',
            'vaccine_program': 'Programa de vacunación'
        };
        return measureNames[measureCode] || measureCode;
    }
    
    formatNumber(num, decimals = 0) {
        if (num === 0) return '0';
        if (num < 1000) return num.toFixed(decimals);
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff4444; text-align: center;">
                <div>
                    <h3>Error de Carga</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            </div>
        `;
    }
    
    // Event handlers
    onCountryClickHandler(callback) {
        this.onCountryClick = callback;
    }
    
    onCountryHoverHandler(callback) {
        this.onCountryHover = callback;
    }
    
    // Public methods for external control
    focusOnCountry(countryCode) {
        const country = this.countries.get(countryCode);
        if (country) {
            const bbox = country.element.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            
            // Center the map on this country
            this.currentTransform.x = -centerX * this.currentZoom + this.container.clientWidth / 2;
            this.currentTransform.y = -centerY * this.currentZoom + this.container.clientHeight / 2;
            this.updateTransform();
        }
    }
    
    highlightCountry(countryCode, highlight = true) {
        const country = this.countries.get(countryCode);
        if (country) {
            if (highlight) {
                country.element.style.stroke = '#ffffff';
                country.element.style.strokeWidth = '3';
            } else {
                country.element.style.stroke = '#333333';
                country.element.style.strokeWidth = '0.5';
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldMap;
} else {
    window.WorldMap = WorldMap;
}
