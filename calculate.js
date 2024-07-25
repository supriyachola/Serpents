document.getElementById('carbonFootprintForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const transportation = parseFloat(document.getElementById('transportation').value);
    const energyUsage = parseFloat(document.getElementById('energyUsage').value);
    const foodConsumption = parseFloat(document.getElementById('foodConsumption').value);
    const wasteProduction = parseFloat(document.getElementById('wasteProduction').value);
    const purchasingHabits = parseFloat(document.getElementById('purchasingHabits').value);
    
    const transportationFootprint = transportation * 0.21; // kg CO2 per km
    const energyUsageFootprint = energyUsage * 0.257; // kg CO2 per kWh
    const foodConsumptionFootprint = foodConsumption * 2.4; // kg CO2 per meal
    const wasteProductionFootprint = wasteProduction * 0.9; // kg CO2 per kg of waste
    const purchasingHabitsFootprint = purchasingHabits * 2.5; // kg CO2 per item

    const totalFootprint = transportationFootprint + energyUsageFootprint + foodConsumptionFootprint + wasteProductionFootprint + purchasingHabitsFootprint;
    
    let resultText = `Your estimated weekly carbon footprint is ${totalFootprint.toFixed(2)} kg CO2.`;
    let warnings = [];
    
    // Specific warnings based on the calculated footprints
    if (transportationFootprint > 80) {
        warnings.push(`Transportation: Your footprint from transportation is high. Consider using public transport, cycling, or carpooling.`);
    }
    
    if (energyUsageFootprint > 55) {
        warnings.push(`Energy Usage: Your footprint from energy usage is high. Consider switching to renewable energy sources or improving energy efficiency at home.`);
    }
    
    if (foodConsumptionFootprint > 21) {
        warnings.push(`Food Consumption: Your footprint from food consumption is high. Consider eating more plant-based meals or reducing food waste.`);
    }
    
    if (wasteProductionFootprint > 5) {
        warnings.push(`Waste Production: Your footprint from waste production is high. Consider increasing recycling efforts and reducing overall waste.`);
    }
    
    if (purchasingHabitsFootprint > 7) {
        warnings.push(`Purchasing Habits: Your footprint from purchasing new items is high. Consider buying fewer new items and opting for sustainable products.`);
    }
    
    if (totalFootprint > 60) {
        warnings.push(`Overall: Your total carbon footprint is above 40-60 kg CO2. Consider taking more actions to reduce your overall emissions.`);
    }

    if (warnings.length > 0) {
        resultText += "\nWarnings:\n- " + warnings.join("\n- ");
        document.getElementById('result').classList.add('warning');
    } else {
        document.getElementById('result').classList.remove('warning');
    }
    
    document.getElementById('result').innerText = resultText;
});