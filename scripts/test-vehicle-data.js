// Script para probar la carga de datos desde el backend

async function testVehicleData() {
    console.log('🧪 Testing vehicle data from backend...');
    
    try {
        // Obtener vehículos
        const response = await fetch('http://localhost:8000/api/v1/vehicles?limit=5');
        const data = await response.json();
        
        console.log(`✅ Loaded ${data.vehicles.length} vehicles`);
        
        // Verificar cada vehículo
        data.vehicles.forEach((v, i) => {
            console.log(`\n🚗 Vehicle ${i + 1}: ${v.full_name}`);
            console.log(`   💰 Price: ${v.price || 'NO PRICE'}`);
            console.log(`   🎨 Color: ${v.color || 'NO COLOR'}`);
            console.log(`   🔧 Transmission: ${v.transmission || 'NO TRANSMISSION'}`);
            console.log(`   📏 Kilometers: ${v.kilometers || 'NO KM'}`);
            console.log(`   📅 Year: ${v.year || 'NO YEAR'}`);
            
            // Verificar si tiene todos los campos necesarios
            const missingFields = [];
            if (!v.price) missingFields.push('price');
            if (!v.color) missingFields.push('color');
            if (!v.transmission) missingFields.push('transmission');
            
            if (missingFields.length > 0) {
                console.warn(`   ⚠️ Missing fields: ${missingFields.join(', ')}`);
            } else {
                console.log(`   ✅ All fields present`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error testing vehicle data:', error);
    }
}

// Ejecutar test
testVehicleData();