document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const numYearsInput = document.getElementById('numYears');
    const numStudentsInput = document.getElementById('numStudents');
    const headsetRowsContainer = document.getElementById('headsetRows');
    const addRowBtn = document.getElementById('addRowBtn');
    const totalCostElement = document.getElementById('totalCost');
    const annualizedCostElement = document.getElementById('annualizedCost');
    const perStudentCostElement = document.getElementById('perStudentCost');
    
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
        "Transfr Purchased - Quest 3S (128 GB) & Case": 400,
        "Transfr Purchased - Quest 3S (256 GB) & Case": 500,
        "Transfr Purchased - Quest 3 (512 GB) & Case": 600,
        "COH - (Other Sources) - Pico": 0,
        "COH - (Other Sources) - Meta": 0,
        "Transfr Leased Hardware": 300, // This is now per year, not one-time
    };

    const mdmPrices = {
        "ManageXR": 100,
        "MDM Services Plan": 200,
        "MDM Included": 0,
        "Customer Already Has Manage XR or ArborXR": 0
    };
    
    const pdDaysPrice = 3500; // One-time fee
    
    // Format currency
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
    
    // Calculate and update total cost
    function calculateTotalCost() {
        let totalCost = 0;
        let totalOneTimeCost = 0;
        let totalRecurringCost = 0;
        const rows = headsetRowsContainer.querySelectorAll('.headset-row');
        const numYears = parseInt(numYearsInput.value) || 1;
        const numStudents = numStudentsInput.value ? parseInt(numStudentsInput.value) : 0;
        
        rows.forEach(row => {
            // Get individual costs for the row
            const costs = calculateRowCostDetails(row);
            totalCost += costs.totalRowCost;
            totalOneTimeCost += costs.headsetCost + costs.pdDaysCost;
            totalRecurringCost += (costs.productCost + costs.mdmCost + costs.leasedHardwareCost) / numYears; // Normalize to per year
        });
        
        totalCostElement.textContent = `Estimated Total Cost: ${formatCurrency(totalCost)}`;
        
        // Calculate and display per-student cost only if a value is entered
        if (numStudents > 0) {
            const annualCost = totalCost / numYears;
            const costPerStudent = annualCost / numStudents;
            perStudentCostElement.textContent = `Estimated Annual Cost per Student: ${formatCurrency(costPerStudent)}`;
            perStudentCostElement.style.display = 'block';
            
            // Add animation effect for visual feedback
            animateElement(perStudentCostElement);
        } else {
            // Hide the per-student cost element if no student count is provided
            perStudentCostElement.style.display = 'none';
        }
        
        // Get the yearly breakdown element and content
        const yearlyBreakdownElement = document.getElementById('yearlyBreakdown');
        const yearlyBreakdownContent = document.getElementById('yearlyBreakdownContent');
        
        // Only show yearly breakdown if years > 1
        if (numYears > 1) {
            // Hide the annualized cost element since we'll use the yearly breakdown
            annualizedCostElement.style.display = 'none';
            
            // Clear previous content
            yearlyBreakdownContent.innerHTML = '';
            
            // Year 1 includes one-time costs + recurring costs
            const year1Cost = totalOneTimeCost + totalRecurringCost;
            const year1Element = document.createElement('div');
            year1Element.className = 'year-cost';
            year1Element.innerHTML = `<strong>Year 1:</strong> ${formatCurrency(year1Cost)}`;
            yearlyBreakdownContent.appendChild(year1Element);
            
            // Years 2 through N only include recurring costs
            for (let year = 2; year <= numYears; year++) {
                const yearElement = document.createElement('div');
                yearElement.className = 'year-cost';
                yearElement.innerHTML = `<strong>Year ${year}:</strong> ${formatCurrency(totalRecurringCost)}`;
                yearlyBreakdownContent.appendChild(yearElement);
            }
            
            // Show the yearly breakdown
            yearlyBreakdownElement.style.display = 'block';
            
            // Add animation effect for visual feedback
            animateElement(yearlyBreakdownElement);
        } else {
            // Hide both for 1-year contracts
            annualizedCostElement.style.display = 'none';
            yearlyBreakdownElement.style.display = 'none';
        }
        
        // Add animation effect for visual feedback
        animateElement(totalCostElement);
    }
    
    // Calculate detailed costs for a single row
    function calculateRowCostDetails(row) {
        const quantityInput = row.querySelector('.quantity');
        const productTypeSelect = row.querySelector('.product-type');
        const headsetTypeSelect = row.querySelector('.headset-type');
        const mdmTypeSelect = row.querySelector('.mdm-type');
        const pdDaysInput = row.querySelector('.pd-days');
        const rowCostElement = row.querySelector('.row-cost');
        
        const quantity = parseInt(quantityInput.value) || 0;
        const numYears = parseInt(numYearsInput.value) || 0;
        const productType = productTypeSelect.value;
        const headsetType = headsetTypeSelect.value;
        const mdmType = mdmTypeSelect.value;
        const pdDaysValue = parseInt(pdDaysInput.value) || 0;
        
        const productCostPerUnit = productPrices[productType] || 0;
        const headsetCostPerUnit = headsetPrices[headsetType] || 0;
        const mdmCostPerUnit = mdmPrices[mdmType] || 0;
        
        const productCost = productCostPerUnit * quantity * numYears;
        let headsetCost = 0;
        let leasedHardwareCost = 0;
        
        // Handle leased hardware as a recurring cost instead of one-time
        if (headsetType === "Transfr Leased Hardware") {
            leasedHardwareCost = headsetCostPerUnit * quantity * numYears;
        } else {
            headsetCost = headsetCostPerUnit * quantity;
        }
        
        const mdmCost = mdmCostPerUnit * quantity * numYears;
        const pdDaysCost = pdDaysValue > 0 ? pdDaysPrice : 0;
        
        const totalRowCost = productCost + headsetCost + mdmCost + leasedHardwareCost + pdDaysCost;
        
        rowCostElement.textContent = `Subtotal: ${formatCurrency(totalRowCost)}`;
        
        // Add animation feedback
        animateElement(rowCostElement);
        
        return {
            totalRowCost,
            productCost,
            headsetCost,
            mdmCost,
            leasedHardwareCost,
            pdDaysCost
        };
    }
    
    // Calculate cost for a single row (wrapper for backward compatibility)
    function calculateRowCost(row) {
        return calculateRowCostDetails(row).totalRowCost;
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
        const pdDaysInput = newRow.querySelector('.pd-days');
        
        quantityInput.id = `quantity-${rowCounter}`;
        productTypeSelect.id = `productType-${rowCounter}`;
        headsetTypeSelect.id = `headsetType-${rowCounter}`;
        mdmTypeSelect.id = `mdmType-${rowCounter}`;
        pdDaysInput.id = `pdDays-${rowCounter}`;
        
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
    
    // Handle headset type change to update MDM
    function handleHeadsetTypeChange(event) {
        const row = event.target.closest('.headset-row');
        const headsetTypeSelect = event.target;
        const mdmTypeSelect = row.querySelector('.mdm-type');
        const headsetValue = headsetTypeSelect.value;
        
        // Define specific COH standard Quest headsets (exact matches)
        const standardCOHHeadsets = [
            "Transfr Purchased - Quest 3S (128 GB) & Case",
            "Transfr Purchased - Quest 3S (256 GB) & Case",
            "Transfr Purchased - Quest 3 (512 GB) & Case"
        ];
        
        // Get all MDM options
        const mdmOptions = mdmTypeSelect.querySelectorAll('option');
        
        // First, reset all options to be visible
        mdmOptions.forEach(option => {
            option.style.display = '';
        });
        
        if (headsetValue === "Transfr Leased Hardware") {
            // Set to "MDM Included" and disable the select
            mdmTypeSelect.value = "MDM Included";
            mdmTypeSelect.disabled = true;
        } else if (standardCOHHeadsets.includes(headsetValue)) {
            // Set to "ManageXR" and disable the select for standard COH headsets
            mdmTypeSelect.value = "ManageXR";
            mdmTypeSelect.disabled = true;
        } else if (headsetValue === "COH - (Other Sources) - Pico") {
            // Set to "ManageXR" and only show two specific options
            mdmTypeSelect.value = "ManageXR";
            mdmTypeSelect.disabled = false;
            
            // Show only Pico-compatible MDM options, hide all others
            mdmOptions.forEach(option => {
                const optionValue = option.value;
                if (optionValue === "ManageXR" || optionValue === "Customer Already Has Manage XR or ArborXR") {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            });
        } else if (headsetValue === "COH - (Other Sources) - Meta") {
            // Set to "MDM Services Plan" and disable the select
            mdmTypeSelect.value = "MDM Services Plan";
            mdmTypeSelect.disabled = true;
        } else {
            // Enable the select for other cases
            mdmTypeSelect.disabled = false;
        }
        
        // Recalculate costs
        calculateTotalCost();
    }
    
    // Setup event listeners for a row
    function setupRowEventListeners(row) {
        const quantityInput = row.querySelector('.quantity');
        const productTypeSelect = row.querySelector('.product-type');
        const headsetTypeSelect = row.querySelector('.headset-type');
        const mdmTypeSelect = row.querySelector('.mdm-type');
        const pdDaysInput = row.querySelector('.pd-days');
        const removeBtn = row.querySelector('.remove-row');
        
        quantityInput.addEventListener('input', calculateTotalCost);
        quantityInput.addEventListener('blur', function() {
            validateNumberInput(quantityInput);
            calculateTotalCost();
        });
        
        productTypeSelect.addEventListener('change', calculateTotalCost);
        headsetTypeSelect.addEventListener('change', function(event) {
            handleHeadsetTypeChange(event);
        });
        mdmTypeSelect.addEventListener('change', calculateTotalCost);
        pdDaysInput.addEventListener('input', calculateTotalCost);
        pdDaysInput.addEventListener('blur', function() {
            // No validation needed for PD Days as it can be 0
            calculateTotalCost();
        });
        
        removeBtn.addEventListener('click', removeHeadsetRow);
        
        // Initial check for headset type
        const headsetValue = headsetTypeSelect.value;
        
        // Define specific COH standard Quest headsets (exact matches)
        const standardCOHHeadsets = [
            "Transfr Purchased - Quest 3S (128 GB) & Case",
            "Transfr Purchased - Quest 3S (256 GB) & Case",
            "Transfr Purchased - Quest 3 (512 GB) & Case"
        ];
        
        // Get all MDM options
        const mdmOptions = mdmTypeSelect.querySelectorAll('option');
        
        // First, reset all options to be visible
        mdmOptions.forEach(option => {
            option.style.display = '';
        });
        
        if (headsetValue === "Transfr Leased Hardware") {
            mdmTypeSelect.value = "MDM Included";
            mdmTypeSelect.disabled = true;
        } else if (standardCOHHeadsets.includes(headsetValue)) {
            mdmTypeSelect.value = "ManageXR";
            mdmTypeSelect.disabled = true;
        } else if (headsetValue === "COH - (Other Sources) - Pico") {
            mdmTypeSelect.value = "ManageXR";
            mdmTypeSelect.disabled = false;
            
            // Show only Pico-compatible MDM options, hide all others
            mdmOptions.forEach(option => {
                const optionValue = option.value;
                if (optionValue === "ManageXR" || optionValue === "Customer Already Has Manage XR or ArborXR") {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            });
        } else if (headsetValue === "COH - (Other Sources) - Meta") {
            mdmTypeSelect.value = "MDM Services Plan";
            mdmTypeSelect.disabled = true;
        }
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Years input (now a select element)
        numYearsInput.addEventListener('change', calculateTotalCost);
        
        // Students input
        numStudentsInput.addEventListener('input', calculateTotalCost);
        numStudentsInput.addEventListener('blur', function() {
            // Only validate if there's a value
            if (numStudentsInput.value !== '') {
                // Ensure the number of students is at least 1
                if (parseInt(numStudentsInput.value) < 1 || isNaN(parseInt(numStudentsInput.value))) {
                    numStudentsInput.value = 1;
                    numStudentsInput.classList.add('input-corrected');
                    setTimeout(() => {
                        numStudentsInput.classList.remove('input-corrected');
                    }, 800);
                }
            }
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
        .total-cost.highlight, .row-cost.highlight, .annualized-cost.highlight, .per-student-cost.highlight {
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
    
    // Check all existing rows for initial headset type
    document.querySelectorAll('.headset-row').forEach(row => {
        const headsetTypeSelect = row.querySelector('.headset-type');
        const mdmTypeSelect = row.querySelector('.mdm-type');
        const headsetValue = headsetTypeSelect.value;
        
        // Define specific COH standard Quest headsets (exact matches)
        const standardCOHHeadsets = [
            "Transfr Purchased - Quest 3S (128 GB) & Case",
            "Transfr Purchased - Quest 3S (256 GB) & Case",
            "Transfr Purchased - Quest 3 (512 GB) & Case"
        ];
        
        // Get all MDM options
        const mdmOptions = mdmTypeSelect.querySelectorAll('option');
        
        // First, reset all options to be visible
        mdmOptions.forEach(option => {
            option.style.display = '';
        });
        
        if (headsetValue === "Transfr Leased Hardware") {
            mdmTypeSelect.value = "MDM Included";
            mdmTypeSelect.disabled = true;
        } else if (standardCOHHeadsets.includes(headsetValue)) {
            mdmTypeSelect.value = "ManageXR";
            mdmTypeSelect.disabled = true;
        } else if (headsetValue === "COH - (Other Sources) - Pico") {
            mdmTypeSelect.value = "ManageXR";
            mdmTypeSelect.disabled = false;
            
            // Show only Pico-compatible MDM options, hide all others
            mdmOptions.forEach(option => {
                const optionValue = option.value;
                if (optionValue === "ManageXR" || optionValue === "Customer Already Has Manage XR or ArborXR") {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            });
        } else if (headsetValue === "COH - (Other Sources) - Meta") {
            mdmTypeSelect.value = "MDM Services Plan";
            mdmTypeSelect.disabled = true;
        }
    });
    
    calculateTotalCost();
    
    // PDF Export Functionality
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    
    exportPdfBtn.addEventListener('click', function() {
        // Show loading state
        exportPdfBtn.disabled = true;
        exportPdfBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px; animation: spin 1s linear infinite;"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg> Generating PDF...';
        
        // Add keyframes for spin animation if they don't exist
        if (!document.getElementById('spinKeyframes')) {
            const style = document.createElement('style');
            style.id = 'spinKeyframes';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Start by loading the logo
        loadLogoForPDF(document.querySelector('.header-logo').src)
            .then(logoDataUrl => {
                setTimeout(() => generatePDF(logoDataUrl), 100);
            })
            .catch(() => {
                // If logo loading fails, generate PDF without it
                setTimeout(() => generatePDF(null), 100);
            });
    });
    
    // Helper function to load and convert logo to data URL
    function loadLogoForPDF(logoSrc) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = function() {
                try {
                    // Create canvas to convert image to data URL
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw image to canvas and convert to data URL
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load logo'));
            };
            
            img.src = logoSrc;
        });
    }
    
    function generatePDF(logoDataUrl) {
        // Get data for PDF
        const title = document.querySelector('.calculator-header h1').textContent;
        const numYears = parseInt(numYearsInput.value) || 1;
        const numStudents = numStudentsInput.value ? parseInt(numStudentsInput.value) : 0;
        const totalCost = document.getElementById('totalCost').textContent.split(':')[1].trim();
        
        // Get all configurations
        const configurations = [];
        document.querySelectorAll('.headset-row').forEach((row, index) => {
            const config = {
                number: index + 1,
                quantity: row.querySelector('.quantity').value,
                productType: row.querySelector('.product-type').value,
                headsetType: row.querySelector('.headset-type').value,
                mdmType: row.querySelector('.mdm-type').value,
                pdDays: row.querySelector('.pd-days').value,
                subtotal: row.querySelector('.row-cost').textContent.split(':')[1].trim()
            };
            configurations.push(config);
        });
        
        // Get yearly breakdown if available
        const yearlyBreakdown = [];
        const yearlyBreakdownElement = document.getElementById('yearlyBreakdown');
        if (yearlyBreakdownElement.style.display !== 'none') {
            document.querySelectorAll('.year-cost').forEach(yearCost => {
                yearlyBreakdown.push(yearCost.textContent);
            });
        }
        
        // Get per-student cost if available
        const perStudentCostElement = document.getElementById('perStudentCost');
        const perStudentCost = perStudentCostElement.style.display !== 'none' ? perStudentCostElement.textContent : null;
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Define branding colors - using Transfr blue
        const brandBlue = [0, 85, 255]; // RGB for #0055ff
        const darkText = [44, 62, 80]; // RGB for #2c3e50 - matching result box
        const lightGray = [150, 150, 150]; // RGB for #969696
        
        // Add page header with light gray background
        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Handle logo placement
        if (logoDataUrl) {
            // If we have a data URL for the logo, use it
            try {
                doc.addImage(logoDataUrl, 'PNG', 20, 10, 50, 20);
            } catch (error) {
                // Fall back to text if image adding fails
                createTextLogo();
            }
        } else {
            // No logo data URL available, use text fallback
            createTextLogo();
        }
        
        // Helper function for text logo fallback
        function createTextLogo() {
            doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
            doc.rect(20, 15, 40, 15, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('TRANSFR', 25, 25);
        }
        
        // Add title with brand color
        doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
        doc.setFontSize(18);
        doc.text('PRICING PROPOSAL', 105, 25, { align: 'center' });
        
        // Document information section
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(20, 50, 190, 50);
        
        doc.setFontSize(12);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('PROPOSAL DETAILS', 20, 60);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
        doc.text(`Contract Duration: ${numYears} ${numYears > 1 ? 'Years' : 'Year'}`, 20, 78);
        
        // Add organization name field (empty but marked for manual entry)
        doc.text('Organization:', 20, 86);
        doc.setDrawColor(200, 200, 200);
        doc.line(55, 86, 190, 86);
        
        if (numStudents > 0) {
            doc.text(`Estimated Students: ${numStudents} per year`, 20, 94);
        }
        
        // Pricing Summary Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
        doc.text('PRICING SUMMARY', 20, 100);
        
        // Add total cost
        doc.setFontSize(16);
        doc.text(`Total Investment: ${totalCost}`, 20, 110);
        
        // Add yearly breakdown if available
        if (yearlyBreakdown.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(darkText[0], darkText[1], darkText[2]);
            doc.text('Year-by-Year Breakdown:', 20, 120);
            
            yearlyBreakdown.forEach((year, index) => {
                doc.setFont('helvetica', 'normal');
                doc.text(year, 25, 130 + (index * 8));
            });
        }
        
        // Add per-student cost if available
        let yPosition = 130 + (yearlyBreakdown.length * 8);
        if (perStudentCost) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(darkText[0], darkText[1], darkText[2]);
            doc.text(perStudentCost, 20, yPosition);
            yPosition += 15;
        } else {
            yPosition += 5;
        }
        
        // Configurations Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
        doc.text('CONFIGURATION DETAILS', 20, yPosition);
        yPosition += 10;
        
        // Create table headers with improved spacing
        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text('Config #', 20, yPosition);
        doc.text('Quantity', 40, yPosition);
        doc.text('Product', 65, yPosition);
        doc.text('Headset', 105, yPosition);
        doc.text('MDM', 145, yPosition);
        doc.text('PD Days', 165, yPosition); // Adjusted position for PD Days
        doc.text('Subtotal', 190, yPosition, { align: 'right' });
        
        // Draw header line
        yPosition += 2;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
        
        // Add configurations with improved alignment
        doc.setFont('helvetica', 'normal');
        configurations.forEach((config, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
                
                // Add headers on new page
                doc.setFont('helvetica', 'bold');
                doc.text('Config #', 20, yPosition);
                doc.text('Quantity', 40, yPosition);
                doc.text('Product', 65, yPosition);
                doc.text('Headset', 105, yPosition);
                doc.text('MDM', 145, yPosition);
                doc.text('PD Days', 165, yPosition); // Adjusted position for PD Days
                doc.text('Subtotal', 190, yPosition, { align: 'right' });
                
                // Draw header line
                yPosition += 2;
                doc.line(20, yPosition, 190, yPosition);
                yPosition += 5;
                doc.setFont('helvetica', 'normal');
            }
            
            doc.text(`#${config.number}`, 20, yPosition);
            doc.text(config.quantity, 40, yPosition);
            
            // Special handling for product type
            let productText = config.productType;
            if (productText === "CE") productText = "Transfr Trek (CE)";
            if (productText === "AA") productText = "All Access (AA)";
            doc.text(productText, 65, yPosition, { maxWidth: 35 });
            
            // For long headset names, split into multiple lines
            const headsetLines = doc.splitTextToSize(config.headsetType, 40); // Reduced width for better layout
            doc.text(headsetLines, 105, yPosition);
            
            doc.text(config.mdmType, 145, yPosition, { maxWidth: 20 });
            doc.text(config.pdDays, 165, yPosition);
            doc.text(config.subtotal, 190, yPosition, { align: 'right' });
            
            // Determine how much to increase y position based on headset name lines
            const lineHeight = headsetLines.length > 1 ? headsetLines.length * 5 : 7;
            yPosition += lineHeight;
        });
        
        // Footer - disclaimer
        yPosition = Math.min(yPosition + 15, 270);
        doc.setFontSize(8);
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        const disclaimer = "IMPORTANT: This is an estimate only. It does not represent a guarantee of pricing. Official pricing is only guaranteed via fully approved Quotes generated in CPQ.";
        const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
        doc.text(disclaimerLines, 105, yPosition, { align: 'center' });
        
        // Add page numbers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }
        
        // Pricing Key Section on a new page
        doc.addPage();
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
        doc.text('PRICING REFERENCE', 20, 20);
        
        // Product Pricing
        doc.setFontSize(12);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text('Product Pricing', 20, 35);
        
        let keyYPosition = 45;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Product prices from the productPrices object
        for (const [product, price] of Object.entries(productPrices)) {
            const formattedPrice = formatCurrency(price);
            
            // Special handling for product codes
            let productText = product;
            if (product === "CE") productText = "Transfr Trek (CE)";
            if (product === "AA") productText = "All Access (AA)";
            
            doc.text(`${productText}`, 20, keyYPosition);
            doc.text(`${formattedPrice} per headset/year`, 100, keyYPosition);
            keyYPosition += 7;
        }
        
        keyYPosition += 5;
        
        // Headset Pricing
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Headset Pricing', 20, keyYPosition);
        keyYPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Headset prices from the headsetPrices object, excluding zero values
        for (const [headset, price] of Object.entries(headsetPrices)) {
            if (price > 0) {
                const formattedPrice = formatCurrency(price);
                const unit = headset === "Transfr Leased Hardware" ? "per unit/year" : "per unit";
                const headsetLines = doc.splitTextToSize(headset, 80);
                doc.text(headsetLines, 20, keyYPosition);
                doc.text(`${formattedPrice} ${unit}`, 100, keyYPosition);
                keyYPosition += headsetLines.length > 1 ? 10 : 7;
            }
        }
        
        keyYPosition += 5;
        
        // MDM Pricing
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('MDM Pricing', 20, keyYPosition);
        keyYPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // MDM prices from the mdmPrices object, excluding zero values
        for (const [mdm, price] of Object.entries(mdmPrices)) {
            if (price > 0) {
                const formattedPrice = formatCurrency(price);
                doc.text(`${mdm}`, 20, keyYPosition);
                doc.text(`${formattedPrice} per unit/year`, 100, keyYPosition);
                keyYPosition += 7;
            }
        }
        
        keyYPosition += 5;
        
        // PD Days Pricing
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Other Costs', 20, keyYPosition);
        keyYPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        doc.text("PD Days", 20, keyYPosition);
        doc.text(`${formatCurrency(pdDaysPrice)} per day`, 100, keyYPosition);
        
        // Download the PDF
        doc.save('Transfr_Pricing_Proposal.pdf');
        
        // Reset button state
        exportPdfBtn.disabled = false;
        exportPdfBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
            <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
        </svg> Export to PDF`;
    }
}); 