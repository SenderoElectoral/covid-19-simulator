
Built by https://www.blackbox.ai

---

# COVID-19 Simulator - SARS-CoV-2

## Project Overview
The COVID-19 Simulator is an interactive web application designed to simulate the spread of the SARS-CoV-2 virus. Users can modify parameters related to the virus' infectivity, severity, and governmental measures to observe how these changes affect global statistics and the progression of the pandemic.

## Installation
To run the COVID-19 Simulator locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd covid-19-simulator
   ```

2. **Open the index.html file**:
   You can open the `index.html` file in your preferred web browser to start the simulation.

## Usage
- **Mode Selection**: Choose between "Modo Virus" (Virus Mode) and "Modo Gobierno" (Government Mode) to set parameters or measures.
- **Map Interaction**: Zoom in/out and reset the world map to visualize the spread of the virus across different countries.
- **Virus Parameters**: Adjust the infectivity (R₀), severity, mortality, incubation period, and infectious period using the provided sliders.
- **Government Measures**: Implement various governmental measures such as border closures, lockdowns, and mask mandates.
- **Simulation Control**: Start, pause, and reset the simulation. Adjust the speed of the simulation using the speed slider.
- **Statistics**: View real-time global statistics, including total cases, active cases, deaths, and recoveries.

## Features
- Interactive global map with risk assessment based on case density.
- Adjustable parameters for simulating the spread dynamics of the virus.
- Government measure options to see their effects on the simulation.
- Real-time statistics displayed throughout the simulation.
- Timeline of historical events related to the pandemic.
- Charts visualizing global cases and top countries affected.

## Dependencies
This project utilizes the following dependencies:
- [D3.js](https://d3js.org/) for data visualization.

No additional libraries are noted in the provided `package.json`.

## Project Structure
```
/covid-19-simulator
│
├── index.html              # Main HTML file for the simulator
├── css/
│   └── style.css          # CSS styles for the simulator
│
├── js/
│   ├── main.js            # Main JavaScript file to control the application
│   ├── map.js             # JavaScript file for map functionalities
│   ├── charts.js          # JavaScript file for chart functionalities
│   └── simulation.js      # JavaScript file to control the simulation logic
│
└── README.md              # Project documentation
```

## Contributing
If you would like to contribute to this project, please follow these steps:
1. **Fork the repository**.
2. **Create your feature branch** (`git checkout -b feature/YourFeature`).
3. **Commit your changes** (`git commit -m 'Add some feature'`).
4. **Push to the branch** (`git push origin feature/YourFeature`).
5. **Open a Pull Request**.

## License
This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgements
- This project was developed as a demonstration of the COVID-19 pandemic dynamics using web technologies.