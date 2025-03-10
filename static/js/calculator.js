document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const numYearsInput = document.getElementById('numYears');
    const headsetRowsContainer = document.getElementById('headsetRows');
    const addRowBtn = document.getElementById('addRowBtn');
    const totalCostElement = document.getElementById('totalCost');
    
    // Initial row template
    const initialRow = headsetRowsContainer.querySelector('.headset-row');
    
    // Counter for unique IDs
    let rowCounter = 1;
    
    // Prices
    const productPrices = {
        CE: 2500,
        'VTF Single Discipline': 2000,
        'VTF Bundle': 3000,
        AA: 5500,
    };
    
    const headsetPrices = {
        "COH - Quest 3S (128 GB) & Case": 350,
        "COH - Quest 3S (256 GB) & Case": 450,
        "COH - Quest 3 (512 GB) & Case": 550,
        "Leased Hardware": 300,
    };

    const mdmPrices = {
        "MDM Services Bundle": 100,
        "MHMS": 150,
        "MDM Services Plan": 200,
    };
    
    // Format currency
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
    
    // Calculate cost for a single row
    function calculateRowCost(row) {
        const quantityInput = row.querySelector('.quantity');
        const productTypeSelect = row.querySelector('.product-type');
        const headsetTypeSelect = row.querySelector('.headset-type');
        const mdmTypeSelect = row.querySelector('.mdm-type');
        const rowCostElement = row.querySelector('.row-cost');
        
        const quantity = parseInt(quantityInput.value) || 0;
        const numYears = parseInt(numYearsInput.value) || 0;
        const productType = productTypeSelect.value;
        const headsetType = headsetTypeSelect.value;
        const mdmType = mdmTypeSelect.value;
        
        const productCostPerUnit = productPrices[productType] || 0;
        const headsetCostPerUnit = headsetPrices[headsetType] || 0;
        const mdmCostPerUnit = mdmPrices[mdmType] || 0;
        
        const productCost = productCostPerUnit * quantity * numYears;
        const headsetCost = headsetCostPerUnit * quantity;
        const mdmCost = mdmCostPerUnit * quantity * numYears;
        const totalRowCost = productCost + headsetCost + mdmCost;
        
        rowCostElement.textContent = `Subtotal: ${formatCurrency(totalRowCost)}`;
        
        // Add animation feedback
        animateElement(rowCostElement);
        
        return totalRowCost;
    }
    
    // Calculate and update total cost
    function calculateTotalCost() {
        let totalCost = 0;
        const rows = headsetRowsContainer.querySelectorAll('.headset-row');
        
        rows.forEach(row => {
            totalCost += calculateRowCost(row);
        });
        
        totalCostElement.textContent = `Estimated Total Cost: ${formatCurrency(totalCost)}`;
        
        // Add animation effect for visual feedback
        animateElement(totalCostElement);
    }
    
    // Add a subtle animation when an element changes
    function animateElement(element) {
        element.classList.add('highlight');
        setTimeout(() => {
            element.classList.remove('highlight');
        }, 500);
    }
    
    // Add validation for number inputs
    function validateNumberInput(input) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 1) {
            input.value = 1;
            // Visual feedback for correction
            input.classList.add('input-corrected');
            setTimeout(() => {
                input.classList.remove('input-corrected');
            }, 800);
        }
    }
    
    // Add a new headset row
    function addHeadsetRow() {
        rowCounter++;
        
        // Clone the template row
        const newRow = initialRow.cloneNode(true);
        
        // Update IDs and attributes
        newRow.querySelector('h4').textContent = `Configuration #${rowCounter}`;
        
        const quantityInput = newRow.querySelector('.quantity');
        const productTypeSelect = newRow.querySelector('.product-type');
        const headsetTypeSelect = newRow.querySelector('.headset-type');
        const mdmTypeSelect = newRow.querySelector('.mdm-type');
        
        quantityInput.id = `quantity-${rowCounter}`;
        productTypeSelect.id = `productType-${rowCounter}`;
        headsetTypeSelect.id = `headsetType-${rowCounter}`;
        mdmTypeSelect.id = `mdmType-${rowCounter}`;
        
        // Reset row cost
        newRow.querySelector('.row-cost').textContent = 'Subtotal: $0';
        
        // Add event listeners
        setupRowEventListeners(newRow);
        
        // Add to container
        headsetRowsContainer.appendChild(newRow);
        
        // Add animation for new row
        newRow.classList.add('new-row');
        setTimeout(() => {
            newRow.classList.remove('new-row');
        }, 500);
        
        // Calculate costs
        calculateTotalCost();
        
        // Scroll to new row
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Remove a headset row
    function removeHeadsetRow(event) {
        const row = event.target.closest('.headset-row');
        
        // Don't remove if it's the last row
        if (headsetRowsContainer.querySelectorAll('.headset-row').length > 1) {
            // Add removal animation
            row.classList.add('removing-row');
            
            // Delay actual removal to allow for animation
            setTimeout(() => {
                row.remove();
                calculateTotalCost();
            }, 300);
        } else {
            // Visual feedback that you can't remove the last row
            row.classList.add('shake');
            setTimeout(() => {
                row.classList.remove('shake');
            }, 800);
            
            alert('You need at least one configuration.');
        }
    }
    
    // Setup event listeners for a row
    function setupRowEventListeners(row) {
        const quantityInput = row.querySelector('.quantity');
        const productTypeSelect = row.querySelector('.product-type');
        const headsetTypeSelect = row.querySelector('.headset-type');
        const mdmTypeSelect = row.querySelector('.mdm-type');
        const removeBtn = row.querySelector('.remove-row');
        
        quantityInput.addEventListener('input', calculateTotalCost);
        quantityInput.addEventListener('blur', function() {
            validateNumberInput(quantityInput);
            calculateTotalCost();
        });
        
        productTypeSelect.addEventListener('change', calculateTotalCost);
        headsetTypeSelect.addEventListener('change', calculateTotalCost);
        mdmTypeSelect.addEventListener('change', calculateTotalCost);
        
        removeBtn.addEventListener('click', removeHeadsetRow);
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Years input
        numYearsInput.addEventListener('input', calculateTotalCost);
        numYearsInput.addEventListener('blur', function() {
            validateNumberInput(numYearsInput);
            calculateTotalCost();
        });
        
        // Add row button
        addRowBtn.addEventListener('click', addHeadsetRow);
        
        // Add button hover animation
        addRowBtn.addEventListener('mouseover', function() {
            this.classList.add('btn-hover');
        });
        
        addRowBtn.addEventListener('mouseout', function() {
            this.classList.remove('btn-hover');
        });
        
        // Initial row
        setupRowEventListeners(initialRow);
    }
    
    // Add CSS dynamically for the animations
    const style = document.createElement('style');
    style.textContent = `
        .total-cost.highlight, .row-cost.highlight {
            transition: all 0.4s ease;
            transform: scale(1.05);
            color: #ffffff;
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
        }
        
        .input-corrected {
            border-color: var(--warning-color) !important;
            background-color: rgba(255, 204, 0, 0.05) !important;
        }
        
        .new-row {
            animation: fadeIn 0.5s ease-out;
        }
        
        .removing-row {
            animation: fadeOut 0.3s ease-out;
            opacity: 0;
            transform: translateX(20px);
        }
        
        .shake {
            animation: shake 0.4s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(20px); }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize
    initEventListeners();
    calculateTotalCost();
}); 