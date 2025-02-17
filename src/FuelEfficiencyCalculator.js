import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function FuelEfficiencyCalculator() {
  // State variables
  const [distance, setDistance] = useState("");
  const [fuelFilled, setFuelFilled] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  // Results state
  const [efficiency, setEfficiency] = useState(null);
  const [totalCost, setTotalCost] = useState(null);

  // History of calculations
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Unit selection states
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [fuelUnit, setFuelUnit] = useState("liters");
  const [efficiencyUnit, setEfficiencyUnit] = useState("L/100km");

  const [modalVisible, setModalVisible] = useState(false);
  const [activeSelector, setActiveSelector] = useState(null);

  const units = {
    distance: [
      { label: 'Kilometers', value: 'km' },
      { label: 'Miles', value: 'miles' }
    ],
    fuel: [
      { label: 'Liters', value: 'liters' },
      { label: 'Gallons', value: 'gallons' }
    ],
    efficiency: [
      { label: 'L/100km', value: 'L/100km' },
      { label: 'km/L', value: 'km/L' },
      { label: 'MPG', value: 'mpg' }
    ]
  };

  const handleUnitSelect = (value) => {
    switch (activeSelector) {
      case 'distance':
        setDistanceUnit(value);
        break;
      case 'fuel':
        setFuelUnit(value);
        break;
      case 'efficiency':
        setEfficiencyUnit(value);
        break;
    }
    setModalVisible(false);
  };

  // Conversion functions
  const convertDistance = (value, from, to) => {
    const val = parseFloat(value);
    if (isNaN(val)) return 0;

    if (from === to) return val;
    if (from === "km" && to === "miles") return val * 0.621371;
    if (from === "miles" && to === "km") return val * 1.60934;
    return val;
  };

  const convertVolume = (value, from, to) => {
    const val = parseFloat(value);
    if (isNaN(val)) return 0;

    if (from === to) return val;
    if (from === "liters" && to === "gallons") return val * 0.264172;
    if (from === "gallons" && to === "liters") return val * 3.78541;
    return val;
  };

  // Calculate fuel efficiency with unit conversion
  const calculateEfficiency = () => {
    const distanceNum = parseFloat(distance);
    const fuelFilledNum = parseFloat(fuelFilled);
    const fuelCostNum = parseFloat(fuelCost);

    if (isNaN(distanceNum) || isNaN(fuelFilledNum) || isNaN(fuelCostNum)) {
      alert("Please enter valid numbers");
      return;
    }

    // Convert all values to metric for calculation
    const distanceKm = convertDistance(distanceNum, distanceUnit, "km");
    const fuelLiters = convertVolume(fuelFilledNum, fuelUnit, "liters");

    // Calculate base efficiency (L/100km)
    const baseEfficiency = (fuelLiters / distanceKm) * 100;

    // Convert to selected efficiency unit
    let finalEfficiency;
    let unit;

    switch (efficiencyUnit) {
      case "L/100km":
        finalEfficiency = baseEfficiency;
        unit = "L/100km";
        break;
      case "km/L":
        finalEfficiency = 100 / baseEfficiency;
        unit = "km/L";
        break;
      case "mpg":
        finalEfficiency = 235.215 / baseEfficiency;
        unit = "mpg";
        break;
    }

    // Calculate cost (using original input values)
    const costCalc = (fuelFilledNum * fuelCostNum).toFixed(2);

    setEfficiency(`${finalEfficiency.toFixed(2)} ${unit}`);
    setTotalCost(costCalc);

    // Save to history with units
    const newCalculation = {
      distance: `${distance} ${distanceUnit}`,
      fuelFilled: `${fuelFilled} ${fuelUnit}`,
      efficiency: `${finalEfficiency.toFixed(2)} ${unit}`,
      totalCost: costCalc,
    };
    setCalculationHistory([...calculationHistory, newCalculation]);

    // Fade in animation for results
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Reset calculator
  const resetCalculator = () => {
    setDistance("");
    setFuelFilled("");
    setFuelCost("");
    setEfficiency(null);
    setTotalCost(null);
  };

  const renderUnitSelector = () => (
    <View style={styles.unitContainer}>
      <View style={styles.unitRow}>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => {
            setActiveSelector('distance');
            setModalVisible(true);
          }}
        >
          <Text style={styles.dropdownLabel}>Distance: {distanceUnit}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => {
            setActiveSelector('fuel');
            setModalVisible(true);
          }}
        >
          <Text style={styles.dropdownLabel}>Fuel: {fuelUnit}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => {
            setActiveSelector('efficiency');
            setModalVisible(true);
          }}
        >
          <Text style={styles.dropdownLabel}>Output: {efficiencyUnit}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Fuel Efficiency Calculator</Text>
          
          {renderUnitSelector()}

          {/* Unit Selection Modal */}
          <Modal
            transparent
            visible={modalVisible}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={activeSelector ? units[activeSelector] : []}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleUnitSelect(item.value)}
                    >
                      <Text style={styles.modalItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Distance Travelled (km)</Text>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              placeholder="Enter distance"
            />

            <Text style={styles.label}>Fuel Filled (liters)</Text>
            <TextInput
              style={styles.input}
              value={fuelFilled}
              onChangeText={setFuelFilled}
              keyboardType="numeric"
              placeholder="Enter fuel amount"
            />

            <Text style={styles.label}>Cost of Fuel (per liter)</Text>
            <TextInput
              style={styles.input}
              value={fuelCost}
              onChangeText={setFuelCost}
              keyboardType="numeric"
              placeholder="Enter fuel cost"
            />

            {/* Button Container */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={calculateEfficiency}>
                <Text style={styles.buttonText}>Calculate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetCalculator}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results Display */}
          {efficiency && (
            <Animated.View
              style={[styles.resultContainer, { opacity: fadeAnim }]}>
              <Text style={styles.resultTitle}>Calculation Results</Text>
              <Text style={styles.resultText}>Efficiency: {efficiency}</Text>
              <Text style={styles.resultText}>Total Cost: ${totalCost}</Text>
            </Animated.View>
          )}

          {/* Calculation History */}
          {calculationHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>History</Text>
              {calculationHistory.map((calc, index) => (
                <LinearGradient
                  key={index}
                  colors={["#ffffff", "#f8f9fa"]}
                  style={styles.historyItem}>
                  <Text style={styles.historyText}>
                    Distance: {calc.distance} km
                  </Text>
                  <Text style={styles.historyText}>
                    Efficiency: {calc.efficiency}
                  </Text>
                  <Text style={styles.historyText}>
                    Total Cost: ${calc.totalCost}
                  </Text>
                </LinearGradient>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Platform.OS === "ios" ? 16 : 20,
    paddingVertical: 20,
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
    color: "#1a237e",
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: Platform.OS === "ios" ? 16 : 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    width: "100%",
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#424242",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    padding: Platform.OS === "ios" ? 10 : 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fafafa",
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  calculateButton: {
    backgroundColor: "#2962ff",
    padding: Platform.OS === "ios" ? 12 : 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
  },
  resetButton: {
    backgroundColor: "#546e7a",
    padding: Platform.OS === "ios" ? 12 : 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resultContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: Platform.OS === "ios" ? 16 : 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#2962ff",
    width: "100%",
    alignSelf: "center",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#1a237e",
  },
  resultText: {
    fontSize: 18,
    marginBottom: 8,
    color: "#424242",
    fontWeight: "500",
  },
  historyContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: Platform.OS === "ios" ? 16 : 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
    alignSelf: "center",
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#1a237e",
  },
  historyItem: {
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 12 : 15,
    marginBottom: 8,
    width: "100%",
  },
  historyText: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 4,
    fontWeight: "500",
  },
  unitContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  dropdownButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 100,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    width: '80%',
    maxHeight: '50%',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});
