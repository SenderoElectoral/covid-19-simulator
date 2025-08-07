// COVID-19 Simulation Engine
class CovidSimulation {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentDate = new Date('2020-01-01');
        this.endDate = new Date('2022-12-31');
        this.speed = 1;
        this.dayCounter = 0;
        
        // Virus parameters
        this.virusParams = {
            infectivity: 2.5,    // R₀
            severity: 15,        // % severe cases
            mortality: 2,        // % mortality rate
            incubation: 5,       // days
            infectious: 10       // days
        };
        
        // Current variant
        this.currentVariant = 'original';
        this.variants = {};
        
        // Global statistics
        this.globalStats = {
            totalCases: 0,
            activeCases: 0,
            totalDeaths: 0,
            totalRecovered: 0,
            dailyCases: 0,
            dailyDeaths: 0
        };
        
        // Country data
        this.countries = {};
        this.countryPopulation = {};
        
        // Historical events
        this.events = [];
        this.processedEvents = new Set();
        
        // Government measures
        this.governmentMeasures = {
            'border_closure': { effectiveness: 0.3, cost: 50 },
            'lockdown_partial': { effectiveness: 0.5, cost: 80 },
            'lockdown_full': { effectiveness: 0.8, cost: 100 },
            'mask_mandate': { effectiveness: 0.2, cost: 10 },
            'event_ban': { effectiveness: 0.3, cost: 30 },
            'curfew': { effectiveness: 0.4, cost: 40 },
            'vaccine_program': { effectiveness: 0.9, cost: 200 }
        };
        
        // Simulation callbacks
        this.onUpdate = null;
        this.onEventTriggered = null;
        this.onVariantChange = null;
        
        this.initializeSimulation();
    }
    
    async initializeSimulation() {
        try {
            await this.loadData();
            this.setupCountries();
            this.setupVariants();
            console.log('Simulación inicializada correctamente');
        } catch (error) {
            console.error('Error inicializando simulación:', error);
            throw error;
        }
    }
    
    async loadData() {
        try {
            // Load population data
            const populationResponse = await fetch('data/country_population.json');
            this.countryPopulation = await populationResponse.json();
            
            // Load COVID data
            const covidResponse = await fetch('data/covid_data.json');
            const covidData = await covidResponse.json();
            this.historicalData = covidData;
            
            // Load events
            const eventsResponse = await fetch('data/events.json');
            const eventsData = await eventsResponse.json();
            this.events = eventsData.events;
            
            // Setup variants from historical data
            this.variants = covidData.variants;
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            throw new Error('No se pudieron cargar los datos necesarios para la simulación');
        }
    }
    
    setupCountries() {
        // Initialize countries with population and basic stats
        Object.keys(this.countryPopulation).forEach(countryCode => {
            this.countries[countryCode] = {
                code: countryCode,
                name: this.getCountryName(countryCode),
                population: this.countryPopulation[countryCode],
                cases: 0,
                deaths: 0,
                recovered: 0,
                active: 0,
                dailyCases: 0,
                dailyDeaths: 0,
                casesPerCapita: 0,
                activeMeasures: [],
                governmentResponse: {
                    alertLevel: 0,
                    compliance: Math.random() * 0.4 + 0.6, // 60-100%
                    medicalCapacity: Math.random() * 0.5 + 0.5, // 50-100%
                    politicalStability: Math.random() * 0.3 + 0.7 // 70-100%
                },
                lastMeasureDate: null,
                infected: false,
                firstCaseDate: null
            };
        });
        
        // Set initial outbreak in China
        if (this.countries['CHN']) {
            this.countries['CHN'].cases = 1;
            this.countries['CHN'].active = 1;
            this.countries['CHN'].infected = true;
            this.countries['CHN'].firstCaseDate = new Date('2019-12-31');
            this.globalStats.totalCases = 1;
            this.globalStats.activeCases = 1;
        }
    }
    
    setupVariants() {
        // Variants will be activated based on dates during simulation
        this.variantSchedule = [
            { date: new Date('2020-01-01'), variant: 'original' },
            { date: new Date('2020-12-20'), variant: 'alpha' },
            { date: new Date('2021-04-15'), variant: 'delta' },
            { date: new Date('2021-11-24'), variant: 'omicron' }
        ];
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
            'ISR': 'Israel', 'IRQ': 'Irak', 'PAK': 'Pakistán', 'ROU': 'Rumania',
            'ESP': 'España', 'ARG': 'Argentina', 'AUS': 'Australia', 'KOR': 'Corea del Sur'
        };
        return countryNames[countryCode] || countryCode;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.simulationLoop();
        console.log('Simulación iniciada');
    }
    
    pause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? 'Simulación pausada' : 'Simulación reanudada');
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('Simulación detenida');
    }
    
    reset() {
        this.stop();
        this.currentDate = new Date('2020-01-01');
        this.dayCounter = 0;
        this.currentVariant = 'original';
        this.processedEvents.clear();
        
        // Reset global stats
        this.globalStats = {
            totalCases: 0,
            activeCases: 0,
            totalDeaths: 0,
            totalRecovered: 0,
            dailyCases: 0,
            dailyDeaths: 0
        };
        
        // Reset countries
        this.setupCountries();
        
        console.log('Simulación reiniciada');
        
        if (this.onUpdate) {
            this.onUpdate(this.getSimulationState());
        }
    }
    
    simulationLoop() {
        if (!this.isRunning) return;
        
        if (!this.isPaused && this.currentDate <= this.endDate) {
            this.updateSimulation();
            this.currentDate.setDate(this.currentDate.getDate() + 1);
            this.dayCounter++;
        }
        
        // Continue loop
        setTimeout(() => this.simulationLoop(), 1000 / this.speed);
    }
    
    updateSimulation() {
        // Check for variant changes
        this.checkVariantChange();
        
        // Check for historical events
        this.checkHistoricalEvents();
        
        // Update virus spread
        this.updateVirusSpread();
        
        // Update government responses
        this.updateGovernmentResponses();
        
        // Update recoveries and deaths
        this.updateOutcomes();
        
        // Calculate daily statistics
        this.calculateDailyStats();
        
        // Trigger update callback
        if (this.onUpdate) {
            this.onUpdate(this.getSimulationState());
        }
    }
    
    checkVariantChange() {
        const currentDateStr = this.currentDate.toISOString().split('T')[0];
        
        for (const schedule of this.variantSchedule) {
            const scheduleDate = schedule.date.toISOString().split('T')[0];
            if (currentDateStr === scheduleDate && this.currentVariant !== schedule.variant) {
                this.currentVariant = schedule.variant;
                this.updateVirusParameters();
                
                if (this.onVariantChange) {
                    this.onVariantChange(schedule.variant, this.variants[schedule.variant]);
                }
                break;
            }
        }
    }
    
    updateVirusParameters() {
        const variant = this.variants[this.currentVariant];
        if (variant) {
            // Adjust virus parameters based on variant
            this.virusParams.infectivity = this.virusParams.infectivity * variant.transmissibility;
            this.virusParams.severity = this.virusParams.severity * variant.severity;
        }
    }
    
    checkHistoricalEvents() {
        const currentDateStr = this.currentDate.toISOString().split('T')[0];
        
        this.events.forEach(event => {
            if (event.date === currentDateStr && !this.processedEvents.has(event.date)) {
                this.processedEvents.add(event.date);
                
                if (this.onEventTriggered) {
                    this.onEventTriggered(event);
                }
                
                // Apply event effects
                this.applyEventEffects(event);
            }
        });
    }
    
    applyEventEffects(event) {
        switch (event.type) {
            case 'lockdown':
                // Reduce transmission globally
                this.virusParams.infectivity *= 0.7;
                break;
            case 'vaccine':
                // Increase recovery rate
                Object.values(this.countries).forEach(country => {
                    if (country.active > 0) {
                        const vaccinated = Math.floor(country.active * 0.1);
                        country.recovered += vaccinated;
                        country.active -= vaccinated;
                    }
                });
                break;
            case 'variant':
                // Handled in checkVariantChange
                break;
        }
    }
    
    updateVirusSpread() {
        // Use historical data if available, otherwise simulate
        const currentDateStr = this.currentDate.toISOString().split('T')[0];
        const currentMonth = currentDateStr.substring(0, 7); // YYYY-MM format
        
        // Check if we have historical data for this month
        if (this.historicalData.monthly_data[currentMonth]) {
            this.updateFromHistoricalData(currentMonth);
        } else {
            this.simulateVirusSpread();
        }
    }
    
    updateFromHistoricalData(currentMonth) {
        // Update country data based on historical progression and real first case dates
        this.updateCountriesHistoricalProgression(currentMonth);
        
        // Calculate global stats from country data (more accurate for specific dates)
        this.calculateGlobalStatsFromCountries();
    }
    
    calculateGlobalStatsFromCountries() {
        let totalCases = 0;
        let totalDeaths = 0;
        let totalRecovered = 0;
        let activeCases = 0;
        let dailyCases = 0;
        let dailyDeaths = 0;
        
        // Sum up all country data
        Object.values(this.countries).forEach(country => {
            totalCases += country.cases || 0;
            totalDeaths += country.deaths || 0;
            totalRecovered += country.recovered || 0;
            activeCases += country.active || 0;
            dailyCases += country.dailyCases || 0;
            dailyDeaths += country.dailyDeaths || 0;
        });
        
        // Update global stats
        this.globalStats.totalCases = totalCases;
        this.globalStats.totalDeaths = totalDeaths;
        this.globalStats.totalRecovered = totalRecovered;
        this.globalStats.activeCases = activeCases;
        this.globalStats.dailyCases = dailyCases;
        this.globalStats.dailyDeaths = dailyDeaths;
    }
    
    updateCountriesHistoricalProgression(currentMonth) {
        const currentDate = new Date(this.currentDate);
        
        // Define historical first case dates for major countries
        const firstCaseDates = {
            'CHN': new Date('2019-12-31'), // China - Patient Zero
            'THA': new Date('2020-01-13'), // Thailand - first outside China
            'JPN': new Date('2020-01-16'), // Japan
            'KOR': new Date('2020-01-20'), // South Korea
            'USA': new Date('2020-01-21'), // United States
            'VNM': new Date('2020-01-23'), // Vietnam
            'SGP': new Date('2020-01-23'), // Singapore
            'FRA': new Date('2020-01-24'), // France - first in Europe
            'AUS': new Date('2020-01-25'), // Australia
            'CAN': new Date('2020-01-25'), // Canada
            'DEU': new Date('2020-01-27'), // Germany
            'FIN': new Date('2020-01-29'), // Finland
            'ITA': new Date('2020-01-31'), // Italy
            'GBR': new Date('2020-01-31'), // United Kingdom
            'RUS': new Date('2020-01-31'), // Russia
            'ESP': new Date('2020-01-31'), // Spain
            'IND': new Date('2020-01-30'), // India
            'PHL': new Date('2020-01-30'), // Philippines
            'SWE': new Date('2020-01-31'), // Sweden
            'BEL': new Date('2020-02-04'), // Belgium
            'MYS': new Date('2020-01-25'), // Malaysia
            'NPL': new Date('2020-01-24'), // Nepal
            'LKA': new Date('2020-01-27'), // Sri Lanka
            'KHM': new Date('2020-01-27'), // Cambodia
            'ARE': new Date('2020-01-29'), // UAE
            'EGY': new Date('2020-02-14'), // Egypt
            'IRN': new Date('2020-02-19'), // Iran
            'ISR': new Date('2020-02-21'), // Israel
            'LBN': new Date('2020-02-21'), // Lebanon
            'AFG': new Date('2020-02-24'), // Afghanistan
            'BHR': new Date('2020-02-24'), // Bahrain
            'IRQ': new Date('2020-02-24'), // Iraq
            'KWT': new Date('2020-02-24'), // Kuwait
            'OMN': new Date('2020-02-24'), // Oman
            'PAK': new Date('2020-02-26'), // Pakistan
            'GEO': new Date('2020-02-26'), // Georgia
            'BRA': new Date('2020-02-26'), // Brazil - first in South America
            'CHE': new Date('2020-02-25'), // Switzerland
            'AUT': new Date('2020-02-25'), // Austria
            'HRV': new Date('2020-02-25'), // Croatia
            'NOR': new Date('2020-02-26'), // Norway
            'ROU': new Date('2020-02-26'), // Romania
            'DNK': new Date('2020-02-27'), // Denmark
            'EST': new Date('2020-02-27'), // Estonia
            'NLD': new Date('2020-02-27'), // Netherlands
            'SMR': new Date('2020-02-27'), // San Marino
            'NGA': new Date('2020-02-27'), // Nigeria - first in sub-Saharan Africa
            'LTU': new Date('2020-02-28'), // Lithuania
            'BLR': new Date('2020-02-28'), // Belarus
            'AZE': new Date('2020-02-28'), // Azerbaijan
            'ISL': new Date('2020-02-28'), // Iceland
            'MCO': new Date('2020-02-29'), // Monaco
            'QAT': new Date('2020-02-29'), // Qatar
            'ECU': new Date('2020-02-29'), // Ecuador
            'LUX': new Date('2020-02-29'), // Luxembourg
            'ARM': new Date('2020-03-01'), // Armenia
            'CZE': new Date('2020-03-01'), // Czech Republic
            'DOM': new Date('2020-03-01'), // Dominican Republic
            'IDN': new Date('2020-03-02'), // Indonesia
            'AND': new Date('2020-03-02'), // Andorra
            'JOR': new Date('2020-03-02'), // Jordan
            'LVA': new Date('2020-03-02'), // Latvia
            'MAR': new Date('2020-03-02'), // Morocco
            'SAU': new Date('2020-03-02'), // Saudi Arabia
            'TUN': new Date('2020-03-02'), // Tunisia
            'ARG': new Date('2020-03-03'), // Argentina
            'CHL': new Date('2020-03-03'), // Chile
            'UKR': new Date('2020-03-03'), // Ukraine
            'FRO': new Date('2020-03-03'), // Faroe Islands
            'GIB': new Date('2020-03-03'), // Gibraltar
            'LIE': new Date('2020-03-03'), // Liechtenstein
            'POL': new Date('2020-03-04'), // Poland
            'SVN': new Date('2020-03-04'), // Slovenia
            'HUN': new Date('2020-03-04'), // Hungary
            'BIH': new Date('2020-03-05'), // Bosnia and Herzegovina
            'ZAF': new Date('2020-03-05'), // South Africa
            'BTN': new Date('2020-03-06'), // Bhutan
            'CMR': new Date('2020-03-06'), // Cameroon
            'COL': new Date('2020-03-06'), // Colombia
            'CRI': new Date('2020-03-06'), // Costa Rica
            'PER': new Date('2020-03-06'), // Peru
            'SRB': new Date('2020-03-06'), // Serbia
            'SVK': new Date('2020-03-06'), // Slovakia
            'TGO': new Date('2020-03-06'), // Togo
            'VAT': new Date('2020-03-06'), // Vatican City
            'BGR': new Date('2020-03-08'), // Bulgaria
            'MLD': new Date('2020-03-08'), // Maldives
            'PRY': new Date('2020-03-08'), // Paraguay
            'ALB': new Date('2020-03-09'), // Albania
            'CYP': new Date('2020-03-09'), // Cyprus
            'TUR': new Date('2020-03-11'), // Turkey
            'CUB': new Date('2020-03-11'), // Cuba
            'HND': new Date('2020-03-11'), // Honduras
            'IRL': new Date('2020-03-12'), // Ireland
            'PAN': new Date('2020-03-09'), // Panama
            'BOL': new Date('2020-03-10'), // Bolivia
            'JAM': new Date('2020-03-10'), // Jamaica
            'BRN': new Date('2020-03-09'), // Brunei
            'MNG': new Date('2020-03-10'), // Mongolia
            'CYP': new Date('2020-03-09'), // Cyprus
            'MLT': new Date('2020-03-07'), // Malta
            'MDA': new Date('2020-03-07'), // Moldova
            'PRT': new Date('2020-03-02')  // Portugal
        };
        
        Object.keys(this.historicalData.countries).forEach(countryCode => {
            const historicalCountry = this.historicalData.countries[countryCode];
            const country = this.countries[countryCode];
            const firstCaseDate = firstCaseDates[countryCode];
            
            if (country && historicalCountry && firstCaseDate) {
                // Check if this country should have cases yet based on historical first case date
                if (currentDate >= firstCaseDate) {
                    // Calculate days since first case for this country
                    const daysSinceFirstCase = Math.floor((currentDate - firstCaseDate) / (1000 * 60 * 60 * 24));
                    
                    // Realistic early growth - start very small and grow exponentially
                    let cases, deaths, recovered;
                    
                    if (daysSinceFirstCase === 0) {
                        // First day - just 1 case
                        cases = 1;
                        deaths = 0;
                        recovered = 0;
                    } else if (daysSinceFirstCase < 30) {
                        // First month - exponential growth from 1 case
                        const dailyGrowthRate = 1.15; // 15% daily growth (realistic for early pandemic)
                        cases = Math.floor(Math.pow(dailyGrowthRate, daysSinceFirstCase));
                        deaths = Math.floor(cases * 0.02); // 2% mortality with delay
                        recovered = Math.floor(cases * 0.1); // 10% recovered
                    } else if (daysSinceFirstCase < 90) {
                        // First 3 months - continued exponential but slower
                        const baseCase = Math.floor(Math.pow(1.15, 30)); // Cases after 30 days
                        const additionalDays = daysSinceFirstCase - 30;
                        const slowerGrowthRate = 1.08; // 8% daily growth
                        cases = Math.floor(baseCase * Math.pow(slowerGrowthRate, additionalDays));
                        deaths = Math.floor(cases * 0.03);
                        recovered = Math.floor(cases * 0.3);
                    } else {
                        // After 3 months - use historical data with progression
                        const maxDays = Math.floor((new Date('2022-12-31') - firstCaseDate) / (1000 * 60 * 60 * 24));
                        const progression = Math.min(daysSinceFirstCase / maxDays, 1);
                        cases = Math.floor(historicalCountry.total_cases * progression);
                        deaths = Math.floor(historicalCountry.total_deaths * progression);
                        recovered = Math.floor(historicalCountry.total_recovered * progression);
                    }
                    
                    country.cases = cases;
                    country.deaths = deaths;
                    country.recovered = recovered;
                    country.active = Math.max(0, cases - deaths - recovered);
                    country.casesPerCapita = (cases / country.population) * 100000;
                    
                    if (country.cases > 0 && !country.infected) {
                        country.infected = true;
                        country.firstCaseDate = new Date(firstCaseDate);
                    }
                    
                    // Calculate daily changes based on recent growth
                    if (daysSinceFirstCase < 30) {
                        country.dailyCases = Math.max(1, Math.floor(cases * 0.15)); // 15% daily growth
                        country.dailyDeaths = Math.floor(deaths * 0.1);
                    } else {
                        country.dailyCases = Math.floor(cases * 0.02);
                        country.dailyDeaths = Math.floor(deaths * 0.01);
                    }
                } else {
                    // Country hasn't had first case yet - keep at zero
                    country.cases = 0;
                    country.deaths = 0;
                    country.recovered = 0;
                    country.active = 0;
                    country.casesPerCapita = 0;
                    country.dailyCases = 0;
                    country.dailyDeaths = 0;
                    country.infected = false;
                }
            }
        });
    }
    
    getPreviousMonth(currentMonth) {
        const [year, month] = currentMonth.split('-').map(Number);
        const prevDate = new Date(year, month - 2, 1); // month - 2 because Date month is 0-indexed
        return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    }
    
    simulateVirusSpread() {
        const newInfections = {};
        
        Object.keys(this.countries).forEach(countryCode => {
            const country = this.countries[countryCode];
            
            if (country.active > 0 || this.shouldSpreadToCountry(country)) {
                const newCases = this.calculateNewCases(country);
                newInfections[countryCode] = newCases;
                
                if (newCases > 0 && !country.infected) {
                    country.infected = true;
                    country.firstCaseDate = new Date(this.currentDate);
                }
            }
        });
        
        // Apply new infections
        Object.keys(newInfections).forEach(countryCode => {
            const country = this.countries[countryCode];
            const newCases = newInfections[countryCode];
            
            country.cases += newCases;
            country.active += newCases;
            country.dailyCases = newCases;
            country.casesPerCapita = (country.cases / country.population) * 100000;
            
            this.globalStats.totalCases += newCases;
            this.globalStats.activeCases += newCases;
        });
    }
    
    shouldSpreadToCountry(country) {
        if (country.infected) return true;
        
        // Check if virus should spread from neighboring infected countries
        const globalInfectionRate = this.globalStats.activeCases / 7800000000; // world population
        const spreadProbability = globalInfectionRate * this.virusParams.infectivity * 0.001;
        
        return Math.random() < spreadProbability;
    }
    
    calculateNewCases(country) {
        if (country.active === 0) {
            // Initial seeding for new countries based on global spread
            const globalSpreadFactor = this.globalStats.totalCases / 1000000; // Scale factor
            return Math.random() < (0.001 * globalSpreadFactor) ? Math.floor(Math.random() * 10) + 1 : 0;
        }
        
        // Calculate effective R₀ based on measures
        let effectiveR0 = this.virusParams.infectivity;
        
        // Apply government measures
        country.activeMeasures.forEach(measure => {
            const measureData = this.governmentMeasures[measure];
            if (measureData) {
                effectiveR0 *= (1 - measureData.effectiveness);
            }
        });
        
        // Apply compliance factor
        effectiveR0 *= country.governmentResponse.compliance;
        
        // Calculate new cases based on current active cases
        const baseNewCases = country.active * (effectiveR0 / this.virusParams.infectious);
        
        // Add randomness and population density effects
        const populationDensityFactor = Math.min(country.population / 1000000, 2);
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        
        // Scale based on current date (exponential growth in early months)
        const daysSinceStart = Math.floor((this.currentDate - new Date('2020-01-01')) / (1000 * 60 * 60 * 24));
        const growthFactor = Math.min(1 + (daysSinceStart / 365), 3); // Growth factor up to 3x
        
        const newCases = Math.floor(baseNewCases * populationDensityFactor * randomFactor * growthFactor);
        
        // Ensure we don't exceed population
        const maxPossible = country.population - country.cases;
        return Math.min(newCases, maxPossible);
    }
    
    updateGovernmentResponses() {
        if (this.currentMode === 'government') {
            // In government mode, do not apply automatic measures
            return;
        }
        
        Object.values(this.countries).forEach(country => {
            if (!country.infected) return;
            
            const casesPerCapita = country.casesPerCapita;
            const currentAlertLevel = country.governmentResponse.alertLevel;
            
            // Determine new alert level based on cases per capita
            let newAlertLevel = 0;
            if (casesPerCapita > 1000) newAlertLevel = 4; // Critical
            else if (casesPerCapita > 500) newAlertLevel = 3; // High
            else if (casesPerCapita > 100) newAlertLevel = 2; // Medium
            else if (casesPerCapita > 10) newAlertLevel = 1; // Low
            
            if (newAlertLevel > currentAlertLevel) {
                country.governmentResponse.alertLevel = newAlertLevel;
                this.implementGovernmentMeasures(country, newAlertLevel);
            }
        });
    }
    
    applyGovernmentMeasure(country, measure) {
        if (!country || !measure) return;
        
        if (!country.activeMeasures) {
            country.activeMeasures = [];
        }
        
        if (!country.activeMeasures.includes(measure)) {
            country.activeMeasures.push(measure);
        } else {
            // Toggle off if already active
            country.activeMeasures = country.activeMeasures.filter(m => m !== measure);
        }
        
        // Adjust infectivity based on measure effectiveness
        const measureData = this.governmentMeasures[measure];
        if (measureData) {
            // For simplicity, recalculate infectivity as base infectivity minus sum of effectiveness
            let totalEffectiveness = 0;
            country.activeMeasures.forEach(m => {
                const mData = this.governmentMeasures[m];
                if (mData) totalEffectiveness += mData.effectiveness;
            });
            totalEffectiveness = Math.min(totalEffectiveness, 0.95); // Cap max reduction at 95%
            
            // Reset to base infectivity and apply reduction
            country.effectiveInfectivity = this.virusParams.infectivity * (1 - totalEffectiveness);
        }
    }
    
    implementGovernmentMeasures(country, alertLevel) {
        const measures = [];
        
        switch (alertLevel) {
            case 4: // Critical
                measures.push('lockdown_full', 'border_closure', 'mask_mandate', 'event_ban', 'curfew');
                break;
            case 3: // High
                measures.push('lockdown_partial', 'mask_mandate', 'event_ban', 'border_closure');
                break;
            case 2: // Medium
                measures.push('mask_mandate', 'event_ban');
                break;
            case 1: // Low
                measures.push('mask_mandate');
                break;
        }
        
        // Add measures based on government characteristics
        const responseSpeed = country.governmentResponse.politicalStability;
        if (Math.random() < responseSpeed) {
            country.activeMeasures = [...new Set([...country.activeMeasures, ...measures])];
            country.lastMeasureDate = new Date(this.currentDate);
        }
    }
    
    updateOutcomes() {
        // Only update outcomes if we're not using historical data
        const currentDateStr = this.currentDate.toISOString().split('T')[0];
        const currentMonth = currentDateStr.substring(0, 7);
        
        if (this.historicalData.monthly_data[currentMonth]) {
            // Historical data already updated in updateFromHistoricalData
            return;
        }
        
        Object.values(this.countries).forEach(country => {
            if (country.active === 0) return;
            
            // Calculate recoveries (most people recover)
            const recoveryRate = 1 / (this.virusParams.infectious + 7); // Average recovery time
            const newRecoveries = Math.floor(country.active * recoveryRate * 0.95); // 95% recover
            
            // Calculate deaths
            const mortalityRate = this.virusParams.mortality / 100;
            const newDeaths = Math.floor(country.active * recoveryRate * mortalityRate);
            
            // Apply changes
            country.recovered += newRecoveries;
            country.deaths += newDeaths;
            country.active -= (newRecoveries + newDeaths);
            country.dailyDeaths = newDeaths;
            
            // Update global stats
            this.globalStats.totalRecovered += newRecoveries;
            this.globalStats.totalDeaths += newDeaths;
            this.globalStats.activeCases -= (newRecoveries + newDeaths);
        });
    }
    
    calculateDailyStats() {
        // Calculate daily global statistics
        this.globalStats.dailyCases = Object.values(this.countries)
            .reduce((sum, country) => sum + country.dailyCases, 0);
        
        this.globalStats.dailyDeaths = Object.values(this.countries)
            .reduce((sum, country) => sum + country.dailyDeaths, 0);
    }
    
    updateVirusParams(params) {
        Object.assign(this.virusParams, params);
    }
    
    setSpeed(speed) {
        this.speed = Math.max(0.1, Math.min(5, speed));
    }
    
    getSimulationState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            currentDate: this.currentDate,
            dayCounter: this.dayCounter,
            currentVariant: this.currentVariant,
            virusParams: { ...this.virusParams },
            globalStats: { ...this.globalStats },
            countries: this.countries,
            topCountries: this.getTopCountries(10)
        };
    }
    
    getTopCountries(limit = 10) {
        return Object.values(this.countries)
            .filter(country => country.cases > 0)
            .sort((a, b) => b.cases - a.cases)
            .slice(0, limit);
    }
    
    getCountryData(countryCode) {
        return this.countries[countryCode] || null;
    }
    
    // Event handlers
    onSimulationUpdate(callback) {
        this.onUpdate = callback;
    }
    
    onHistoricalEvent(callback) {
        this.onEventTriggered = callback;
    }
    
    onVariantChanged(callback) {
        this.onVariantChange = callback;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CovidSimulation;
} else {
    window.CovidSimulation = CovidSimulation;
}
