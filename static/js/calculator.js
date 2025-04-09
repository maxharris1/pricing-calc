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
        'No License - Only Headsets': 0,
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
    
    // Maximum discount percentages by contract length
    const maxDiscountsByYear = {
        2: 2.5,
        3: 3.33,
        4: 3.75,
        5: 4.0
    };
    
    // Track the currently selected discount percentage
    let selectedDiscount = 0;
    
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
        
        // Calculate original total before discount
        const originalTotal = totalCost;
        
        // Apply discount if applicable (only to renewable revenue, not one-time costs)
        const renewableRevenue = originalTotal - totalOneTimeCost;
        const discountAmount = renewableRevenue * (selectedDiscount / 100);
        totalCost = originalTotal - discountAmount;
        
        console.log("Discount calculation:", {
            originalTotal,
            totalOneTimeCost,
            renewableRevenue,
            selectedDiscount,
            discountAmount,
            finalTotal: totalCost
        });
        
        // Update discount display if it exists
        const discountRow = document.getElementById('discountRow');
        if (discountRow) {
            if (selectedDiscount > 0) {
                discountRow.innerHTML = `Discount (${selectedDiscount}%): <span style="font-size: 1.1em;">-${formatCurrency(discountAmount)}</span>`;
                discountRow.style.display = 'block';
            } else {
                discountRow.style.display = 'none';
            }
        }
        
        // Update savings display if it exists
        const savingsRow = document.getElementById('savingsRow');
        if (savingsRow) {
            if (selectedDiscount > 0) {
                savingsRow.innerHTML = `★ You save: ${formatCurrency(discountAmount)} ★`;
                savingsRow.style.display = 'block';
            } else {
                savingsRow.style.display = 'none';
            }
        }
        
        // Update savings per student if applicable
        let savingsPerStudentRow = document.getElementById('savingsPerStudentRow');
        
        // Create the savings per student row if it doesn't exist
        if (!savingsPerStudentRow && selectedDiscount > 0 && numStudents > 0) {
            savingsPerStudentRow = document.createElement('div');
            savingsPerStudentRow.id = 'savingsPerStudentRow';
            savingsPerStudentRow.className = 'savings-per-student-row';
            savingsPerStudentRow.style.marginTop = '5px';
            savingsPerStudentRow.style.fontSize = '12px';
            savingsPerStudentRow.style.color = '#FFEB3B';
            
            // Add it after the savings row
            const resultBox = document.querySelector('.result-box');
            if (resultBox) {
                if (savingsRow) {
                    resultBox.insertBefore(savingsPerStudentRow, savingsRow.nextSibling);
                } else {
                    resultBox.appendChild(savingsPerStudentRow);
                }
            }
        }
        
        // Update or hide savings per student row
        if (savingsPerStudentRow) {
            if (selectedDiscount > 0 && numStudents > 0) {
                // Calculate savings per student (annualized)
                const annualizedSavings = discountAmount / numYears;
                const savingsPerStudent = annualizedSavings / numStudents;
                
                savingsPerStudentRow.innerHTML = `Each student saves: ${formatCurrency(savingsPerStudent)}/year`;
                savingsPerStudentRow.style.display = 'block';
            } else {
                savingsPerStudentRow.style.display = 'none';
            }
        }
        
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
            
            // Calculate yearly costs with discount applied to recurring costs
            const discountedRecurringCost = totalRecurringCost * (1 - selectedDiscount / 100);
            
            // Year 1 includes one-time costs + recurring costs
            const year1Cost = totalOneTimeCost + discountedRecurringCost;
            const year1Element = document.createElement('div');
            year1Element.className = 'year-cost';
            year1Element.innerHTML = `<strong>Year 1:</strong> ${formatCurrency(year1Cost)}`;
            yearlyBreakdownContent.appendChild(year1Element);
            
            // Years 2 through N only include recurring costs
            for (let year = 2; year <= numYears; year++) {
                const yearElement = document.createElement('div');
                yearElement.className = 'year-cost';
                yearElement.innerHTML = `<strong>Year ${year}:</strong> ${formatCurrency(discountedRecurringCost)}`;
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
        if (discountRow && selectedDiscount > 0) {
            animateElement(discountRow);
        }
        if (savingsPerStudentRow && selectedDiscount > 0 && numStudents > 0) {
            animateElement(savingsPerStudentRow);
        }
        
        // Update discount dropdown options based on contract length
        updateDiscountOptions();
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
        const mdmCostPerUnit = mdmType ? (mdmPrices[mdmType] || 0) : 0;
        
        const productCost = productCostPerUnit * quantity * numYears;
        let headsetCost = 0;
        let leasedHardwareCost = 0;
        
        // Handle leased hardware as a recurring cost instead of one-time
        if (headsetType === "Transfr Leased Hardware") {
            leasedHardwareCost = headsetCostPerUnit * quantity * numYears;
        } else {
            headsetCost = headsetCostPerUnit * quantity;
        }
        
        const mdmCost = mdmType ? (mdmCostPerUnit * quantity * numYears) : 0;
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
    
    // Create and update discount options based on selected years
    function updateDiscountOptions() {
        const numYears = parseInt(numYearsInput.value) || 1;
        
        // Find or create the discount container
        let discountContainer = document.getElementById('discountContainer');
        
        if (!discountContainer) {
            // Create the main discount container if it doesn't exist
            discountContainer = document.createElement('div');
            discountContainer.id = 'discountContainer';
            discountContainer.className = 'form-group';
            
            // Create the checkbox container
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            checkboxContainer.style.marginBottom = '10px';
            
            // Create the checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'applyDiscountCheckbox';
            checkbox.style.marginRight = '8px';
            
            // Create the checkbox label
            const checkboxLabel = document.createElement('label');
            checkboxLabel.setAttribute('for', 'applyDiscountCheckbox');
            checkboxLabel.textContent = 'Apply Discount';
            checkboxLabel.style.userSelect = 'none';
            checkboxLabel.style.cursor = 'pointer';
            
            // Append checkbox and label to container
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            
            // Use addEventListener for more reliability
            checkbox.addEventListener('change', function() {
                // Get the current state of the checkbox
                const isChecked = this.checked;
                
                console.log("Discount checkbox CHANGED, now:", isChecked);
                
                // Get the current years and maximum discount
                const currentYears = parseInt(numYearsInput.value) || 1;
                const maxDiscount = maxDiscountsByYear[currentYears] || 0;
                
                console.log("Current years:", currentYears, "Max discount:", maxDiscount);
                
                // Show/hide discount form based on checkbox
                const discountFormContainer = document.getElementById('discountFormContainer');
                if (discountFormContainer) {
                    discountFormContainer.style.display = isChecked ? 'block' : 'none';
                }
                
                // Update the selected discount
                if (!isChecked) {
                    selectedDiscount = 0;
                    console.log("Discount set to 0 (checkbox unchecked)");
                } else {
                    // DIRECTLY set to maximum allowed discount for this contract length
                    selectedDiscount = maxDiscount;
                    console.log("Discount FORCE SET TO", selectedDiscount, "% (checkbox checked) - MAXIMUM for", currentYears, "years");
                    
                    // Explicitly update the input field to show the maximum discount
                    const discountInput = document.getElementById('discountInput');
                    if (discountInput) {
                        discountInput.value = maxDiscount;
                        console.log("Input value explicitly set to:", maxDiscount);
                    }
                }
                
                // Apply immediately to ensure changes take effect
                applyDiscountImmediately();
            });
            
            // Create the discount form container (initially hidden)
            const discountFormContainer = document.createElement('div');
            discountFormContainer.id = 'discountFormContainer';
            discountFormContainer.style.marginTop = '8px';
            discountFormContainer.style.display = 'none'; // Hidden by default
            
            // Create the label element with max discount info
            const label = document.createElement('label');
            label.className = 'label';
            label.setAttribute('for', 'discountInput');
            
            // Create a span for the main label text
            const labelText = document.createElement('span');
            labelText.textContent = 'Discount (%)';
            label.appendChild(labelText);
            
            // Create a span for the max discount info
            const maxDiscountInfo = document.createElement('span');
            maxDiscountInfo.id = 'maxDiscountInfo';
            maxDiscountInfo.style.fontSize = '11px';
            maxDiscountInfo.style.fontWeight = 'normal';
            maxDiscountInfo.style.color = '#666';
            maxDiscountInfo.style.marginLeft = '5px';
            label.appendChild(maxDiscountInfo);
            
            // Create the badge for "Applied" indicator
            const appliedBadge = document.createElement('span');
            appliedBadge.id = 'discountAppliedBadge';
            appliedBadge.className = 'badge';
            appliedBadge.textContent = 'Applied';
            appliedBadge.style.display = 'none';
            appliedBadge.style.marginLeft = '5px';
            appliedBadge.style.padding = '2px 6px';
            appliedBadge.style.fontSize = '10px';
            appliedBadge.style.backgroundColor = '#d4edda';
            appliedBadge.style.color = '#155724';
            appliedBadge.style.borderRadius = '4px';
            label.appendChild(appliedBadge);
            
            // Create input wrapper for input and % sign
            const inputWrapper = document.createElement('div');
            inputWrapper.style.position = 'relative';
            
            // Create the input element
            const input = document.createElement('input');
            input.type = 'number';
            input.id = 'discountInput';
            input.className = 'input';
            input.min = '0';
            input.step = '1'; // Changed from 0.01 to 1 for 1% increments
            input.style.paddingRight = '25px'; // Make room for the % sign
            
            // Add % sign after input
            const percentSign = document.createElement('span');
            percentSign.textContent = '%';
            percentSign.style.position = 'absolute';
            percentSign.style.right = '10px';
            percentSign.style.top = '50%';
            percentSign.style.transform = 'translateY(-50%)';
            percentSign.style.color = '#666';
            
            // Create error message element
            const errorMessage = document.createElement('div');
            errorMessage.id = 'discountError';
            errorMessage.style.color = '#dc3545';
            errorMessage.style.fontSize = '12px';
            errorMessage.style.marginTop = '3px';
            errorMessage.style.display = 'none';
            
            // Add event listener for discount input change
            input.addEventListener('input', function() {
                const numYears = parseInt(numYearsInput.value) || 1;
                const maxDiscount = maxDiscountsByYear[numYears] || 0;
                let inputValue = this.value;
                
                console.log("Discount input changed:", inputValue);
                
                // Allow empty or partial inputs during editing
                if (inputValue === '' || inputValue === null) {
                    // Clear error and allow empty field while typing
                    errorMessage.style.display = 'none';
                    this.classList.remove('input-error');
                    return; // Don't update anything yet, wait for actual value
                }
                
                // Convert to number for validation
                inputValue = parseFloat(inputValue) || 0;
                
                // Show warning if exceeds max but don't prevent typing
                if (inputValue > maxDiscount) {
                    // Show error but don't enforce max yet
                    errorMessage.textContent = `Maximum discount for ${numYears} years is ${maxDiscount}%`;
                    errorMessage.style.display = 'block';
                    this.classList.add('input-error');
                } else {
                    // Clear error
                    errorMessage.style.display = 'none';
                    this.classList.remove('input-error');
                }
                
                // Update the selected discount only if checkbox is checked
                const discountCheckbox = document.getElementById('applyDiscountCheckbox');
                if (discountCheckbox && discountCheckbox.checked) {
                    selectedDiscount = inputValue;
                    console.log("Discount value updated to:", selectedDiscount);
                } else {
                    selectedDiscount = 0;
                    console.log("Discount value set to 0 (checkbox not checked)");
                }
                
                // Show/hide the applied badge
                const badge = document.getElementById('discountAppliedBadge');
                if (badge) {
                    badge.style.display = selectedDiscount > 0 ? 'inline-block' : 'none';
                }
                
                // Apply discount immediately instead of calling calculateTotalCostWithoutUpdatingOptions
                applyDiscountImmediately();
            });
            
            // Add blur event to enforce maximum on leaving the field
            input.addEventListener('blur', function() {
                const numYears = parseInt(numYearsInput.value) || 1;
                const maxDiscount = maxDiscountsByYear[numYears] || 0;
                let inputValue = parseFloat(this.value) || 0;
                
                // Enforce max discount when field loses focus
                if (inputValue > maxDiscount) {
                    inputValue = maxDiscount;
                    this.value = maxDiscount;
                    errorMessage.style.display = 'none';
                    this.classList.remove('input-error');
                    console.log("Enforced max discount on blur:", maxDiscount);
                }
                
                // Update with final validated value
                if (document.getElementById('applyDiscountCheckbox').checked) {
                    selectedDiscount = inputValue;
                    applyDiscountImmediately();
                }
            });
            
            // Append elements to their containers
            inputWrapper.appendChild(input);
            inputWrapper.appendChild(percentSign);
            
            // Append elements to the discount form container
            discountFormContainer.appendChild(label);
            discountFormContainer.appendChild(inputWrapper);
            discountFormContainer.appendChild(errorMessage);
            
            // Append checkbox container and form container to main container
            discountContainer.appendChild(checkboxContainer);
            discountContainer.appendChild(discountFormContainer);
            
            // Create discount and savings display rows
            const discountRow = document.createElement('div');
            discountRow.id = 'discountRow';
            discountRow.className = 'discount-row';
            discountRow.style.marginTop = '10px';
            discountRow.style.color = '#FFFFFF';
            discountRow.style.fontWeight = 'bold';
            discountRow.style.padding = '3px 6px';
            discountRow.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; // Semi-transparent white background
            discountRow.style.borderRadius = '4px';
            discountRow.style.display = 'none';
            
            const savingsRow = document.createElement('div');
            savingsRow.id = 'savingsRow';
            savingsRow.className = 'savings-row';
            savingsRow.style.marginTop = '5px';
            savingsRow.style.fontSize = '12px';
            savingsRow.style.color = '#FFEB3B';
            savingsRow.style.display = 'none';
            
            // Insert the discount container after the numYears input
            const yearFormGroup = numYearsInput.closest('.form-group');
            yearFormGroup.parentNode.insertBefore(discountContainer, yearFormGroup.nextSibling);
            
            // Insert discount display in the result box before the total cost
            const resultBox = document.querySelector('.result-box');
            resultBox.insertBefore(discountRow, totalCostElement);
            resultBox.appendChild(savingsRow);
        }
        
        // Show/hide the container based on contract length
        if (numYears >= 2) {
            const maxDiscount = maxDiscountsByYear[numYears] || 0;
            const discountInput = document.getElementById('discountInput');
            const maxDiscountInfo = document.getElementById('maxDiscountInfo');
            const errorMessage = document.getElementById('discountError');
            const discountCheckbox = document.getElementById('applyDiscountCheckbox');
            const discountFormContainer = document.getElementById('discountFormContainer');
            
            // Show the main discount container
            discountContainer.style.display = 'block';
            
            // Update max discount info
            if (maxDiscountInfo) {
                maxDiscountInfo.textContent = `(Max: ${maxDiscount}%)`;
            }
            
            // Set input constraints
            if (discountInput) {
                discountInput.max = maxDiscount;
                
                // If no discount previously selected or we're changing years, 
                // set to max discount
                if (selectedDiscount === 0 || 
                    (selectedDiscount > 0 && selectedDiscount > maxDiscount)) {
                    discountInput.value = maxDiscount;
                    // Only update selectedDiscount if checkbox is checked
                    if (discountCheckbox && discountCheckbox.checked) {
                        selectedDiscount = maxDiscount;
                    }
                } else {
                    // Keep the current discount if it's valid
                    discountInput.value = selectedDiscount;
                }
                
                // Clear any error message
                if (errorMessage) {
                    errorMessage.style.display = 'none';
                    discountInput.classList.remove('input-error');
                }
            }
            
            // Ensure discount form visibility matches checkbox state
            if (discountFormContainer && discountCheckbox) {
                discountFormContainer.style.display = discountCheckbox.checked ? 'block' : 'none';
            }
            
            // Update the badge visibility
            const badge = document.getElementById('discountAppliedBadge');
            if (badge) {
                badge.style.display = selectedDiscount > 0 ? 'inline-block' : 'none';
            }
        } else {
            // Hide for 1-year contracts and reset discount
            discountContainer.style.display = 'none';
            selectedDiscount = 0;
            
            // Uncheck the checkbox if it exists
            const discountCheckbox = document.getElementById('applyDiscountCheckbox');
            if (discountCheckbox) {
                discountCheckbox.checked = false;
            }
            
            // Hide discount display
            const discountRow = document.getElementById('discountRow');
            const savingsRow = document.getElementById('savingsRow');
            if (discountRow) discountRow.style.display = 'none';
            if (savingsRow) savingsRow.style.display = 'none';
        }
    }
    
    // Handle numYears change
    function handleYearsChange() {
        // Get previous value of discount checkbox if it exists
        let wasChecked = false;
        const discountCheckbox = document.getElementById('applyDiscountCheckbox');
        if (discountCheckbox) {
            wasChecked = discountCheckbox.checked;
        }

        // Call calculate cost which will also update discount options
        calculateTotalCost();
        
        // Restore checkbox state if it was checked
        const newDiscountCheckbox = document.getElementById('applyDiscountCheckbox');
        if (newDiscountCheckbox && wasChecked) {
            newDiscountCheckbox.checked = true;
            
            // Trigger the change event to ensure discount is applied
            const event = new Event('change');
            newDiscountCheckbox.dispatchEvent(event);
        }
        
        // Apply the discount calculations again to ensure they take effect
        calculateTotalCost();
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
        const productTypeSelect = row.querySelector('.product-type');
        const headsetValue = headsetTypeSelect.value;
        
        // If "No License - Only Headsets" is selected, disable MDM and exit early
        if (productTypeSelect.value === "No License - Only Headsets") {
            mdmTypeSelect.value = "";
            mdmTypeSelect.disabled = true;
            calculateTotalCost();
            return;
        }
        
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
        
        productTypeSelect.addEventListener('change', function(event) {
            // Check if "No License - Only Headsets" is selected
            if (productTypeSelect.value === "No License - Only Headsets") {
                mdmTypeSelect.value = "";
                mdmTypeSelect.disabled = true;
            } else {
                // Reset MDM selection based on headset type
                handleHeadsetTypeChange({ target: headsetTypeSelect });
            }
            calculateTotalCost();
        });
        
        headsetTypeSelect.addEventListener('change', function(event) {
            // Only apply headset type logic if not using "No License - Only Headsets"
            if (productTypeSelect.value !== "No License - Only Headsets") {
                handleHeadsetTypeChange(event);
            }
        });
        mdmTypeSelect.addEventListener('change', calculateTotalCost);
        pdDaysInput.addEventListener('input', calculateTotalCost);
        pdDaysInput.addEventListener('blur', function() {
            // No validation needed for PD Days as it can be 0
            calculateTotalCost();
        });
        
        removeBtn.addEventListener('click', removeHeadsetRow);
        
        // Initial check for product type and headset type
        if (productTypeSelect.value === "No License - Only Headsets") {
            mdmTypeSelect.value = "";
            mdmTypeSelect.disabled = true;
        } else {
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
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Years input (now a select element)
        numYearsInput.addEventListener('change', handleYearsChange);
        
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
    
    // Add CSS dynamically for the animations and new elements
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
        
        .input-error {
            border-color: #dc3545 !important;
            background-color: rgba(220, 53, 69, 0.05) !important;
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
        
        .discount-row, .savings-row {
            transition: opacity 0.3s ease;
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
    
    // Initialize discount options
    updateDiscountOptions();
    
    // Initial calculations
    calculateTotalCost();
    
    // Add console message for debugging
    console.log("Calculator initialized. Check for discount options when years >= 2");
    
    // PDF Export Functionality
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    
    exportPdfBtn.addEventListener('click', function() {
        // Show loading state
        exportPdfBtn.disabled = true;
        exportPdfBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px; animation: spin 1s linear infinite;"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg> Generating PDF...';
        
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
        try {
            console.log("Starting PDF generation...");
            
            // Get data for PDF
            const title = document.querySelector('.calculator-header h1').textContent;
            console.log("Title:", title);
            
            const numYears = parseInt(numYearsInput.value) || 1;
            console.log("Years:", numYears);
            
            const numStudents = numStudentsInput.value ? parseInt(numStudentsInput.value) : 0;
            console.log("Students:", numStudents);
            
            const totalCost = document.getElementById('totalCost').textContent.split(':')[1].trim();
            console.log("Total Cost:", totalCost);
            
            // Get all configurations
            const configurations = [];
            document.querySelectorAll('.headset-row').forEach((row, index) => {
                const config = {
                    number: index + 1,
                    quantity: row.querySelector('.quantity').value,
                    productType: row.querySelector('.product-type').value,
                    headsetType: row.querySelector('.headset-type').value,
                    mdmType: row.querySelector('.product-type').value === 'No License - Only Headsets' ? "" : row.querySelector('.mdm-type').value,
                    pdDays: row.querySelector('.pd-days').value,
                    subtotal: row.querySelector('.row-cost').textContent.split(':')[1].trim()
                };
                configurations.push(config);
            });
            console.log("Configurations:", configurations.length);
            
            // Get yearly breakdown if available
            const yearlyBreakdown = [];
            const yearlyBreakdownElement = document.getElementById('yearlyBreakdown');
            if (yearlyBreakdownElement && yearlyBreakdownElement.style.display !== 'none') {
                document.querySelectorAll('.year-cost').forEach(yearCost => {
                    yearlyBreakdown.push(yearCost.textContent);
                });
            }
            console.log("Yearly breakdown items:", yearlyBreakdown.length);
            
            // Get per-student cost if available
            const perStudentCostElement = document.getElementById('perStudentCost');
            const perStudentCost = perStudentCostElement && perStudentCostElement.style.display !== 'none' ? 
                perStudentCostElement.textContent : null;
            console.log("Per student cost:", perStudentCost);
            
            console.log("Creating PDF document...");
            
            // Create PDF
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                throw new Error("jsPDF library not loaded");
            }
            
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            console.log("PDF document created successfully");

            // Define branding colors - exact Transfr website colors
            const brandBlue = [196, 218, 234]; // RGB for #C4DAEA (new blue accent)
            const brandTeal = [52, 194, 194]; // RGB for teal accent color
            const lightBlue = [235, 242, 255]; // Lighter blue for backgrounds
            const darkText = [51, 51, 51]; // Dark gray for text
            const lightGray = [150, 150, 150]; // Medium gray for secondary elements
            const veryLightGray = [245, 247, 250]; // Very light gray for alternating rows
            
            // Content layout settings - reduce margins slightly to maximize space
            const margin = 8; // 8mm margins
            const pageWidth = 210; // A4 width in mm
            const contentWidth = pageWidth - (margin * 2);
            
            console.log("Set up colors and margins");
            
            // Use built-in fonts only to avoid external font loading issues
            doc.setFont('helvetica', 'normal');
            
            // Add header with brand color background
            doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
            doc.rect(0, 0, 210, 35, 'F'); // Expanded header height from 25 to 35 for better spacing
            
            console.log("Added header background");
            
            // Center logo at the top with proper aspect ratio - fixed to prevent distortion
            if (logoDataUrl) {
                try {
                    console.log("Adding logo to PDF");
                    // Fix logo distortion by maintaining aspect ratio
                    const logoMaxWidth = 60;
                    const logoMaxHeight = 30; // Increased height for better visibility
                    
                    // Create a temporary image to get dimensions
                    const img = new Image();
                    img.src = logoDataUrl;
                    
                    // Calculate scaled dimensions that maintain aspect ratio
                    let logoWidth = logoMaxWidth;
                    let logoHeight = logoMaxHeight;
                    
                    // Only try to use aspect ratio if we can reliably get image dimensions
                    if (img.width && img.height) {
                        if (img.width > img.height) {
                            // Landscape logo (likely case for Transfr)
                            logoWidth = logoMaxWidth;
                            logoHeight = (img.height / img.width) * logoWidth;
                            
                            // Ensure minimum height to prevent squishing
                            if (logoHeight < 20) {
                                logoHeight = 20;
                            }
                        } else {
                            // Portrait or square logo
                            logoHeight = logoMaxHeight;
                            logoWidth = (img.width / img.height) * logoHeight;
                        }
                    }
                    
                    // Center the logo
                    const logoX = (pageWidth - logoWidth) / 2;
                    // Position the logo higher in the blue header area (moved up from 0 to -5)
                    doc.addImage(logoDataUrl, 'PNG', logoX, -5, logoWidth, logoHeight);
                    console.log("Logo added successfully");
                } catch (error) {
                    console.error('Error adding logo to PDF:', error);
                    // Fall back to text if image adding fails
                    doc.setFontSize(16);
                    doc.setTextColor(255, 255, 255);
                    doc.text('TRANSFR', pageWidth / 2, 8, { align: 'center' });
                }
            }
            
            // Add title - "PRICING PROPOSAL" centered below the logo, uppercase like Transfr website headings
            doc.setFontSize(18); // Slightly smaller font for better proportion
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255); // Changed to white for visibility on blue header
            doc.text('PRICING PROPOSAL', pageWidth / 2, 25, { align: 'center' }); // Moved up to inside the header bar
            
            console.log("Added title");
            
            // Start content below header - begin the pricing summary
            let yPosition = 48; // Adjusted position from 38 to 48 to start content after expanded header
            
            // Pricing Summary Section with improved formatting
            console.log("Starting Pricing Summary section at y=", yPosition);
            doc.setFontSize(16); // Reduced font size for better proportion
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 46, 109); // Changed to #002E6D dark blue
            doc.text('Summary', margin, yPosition);
            yPosition += 8; // Reduced spacing
            
            // Total Investment (bold and prominent)
            doc.setFontSize(14); // Reduced for better proportion
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(darkText[0], darkText[1], darkText[2]);
            doc.text(`Total Investment: ${totalCost}`, margin, yPosition);
            yPosition += 10; // Increased spacing for better readability
            
            // Store this position for summary section height calculation
            const detailStartY = yPosition;
            
            // Format date nicely
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Create a cleaner, more organized layout for summary details
            doc.setDrawColor(230, 230, 230); // Light gray for dividers (lighter than before)
            doc.setLineWidth(0.1); // Thinner lines for a more subtle look
            
            // Key details with cleaner layout
            doc.setFontSize(10); // Consistent size for all details
            
            // First row - Date
            doc.setFont('helvetica', 'bold');
            doc.text('Date:', margin, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(formattedDate, margin + 15, yPosition);
            
            // Contract Duration (right side of same row)
            doc.setFont('helvetica', 'bold');
            doc.text('Contract Duration:', pageWidth/2, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(`${numYears} ${numYears > 1 ? 'Years' : 'Year'}`, pageWidth/2 + 35, yPosition);
            
            yPosition += 8; // More spacing between rows for readability
            
            // Students info in same style if available
            if (numStudents > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text('Estimated Students:', margin, yPosition);
                doc.setFont('helvetica', 'normal');
                doc.text(`${numStudents} per year`, margin + 40, yPosition);
                
                // Add per-student cost on same row if available
                if (perStudentCost) {
                    doc.setFont('helvetica', 'bold');
                    // Extract the cost value for more compact display
                    const costPerStudent = perStudentCost.split(':')[1].trim();
                    doc.text('Cost per Student:', pageWidth/2, yPosition);
                    doc.setFont('helvetica', 'normal');
                    doc.text(costPerStudent, pageWidth/2 + 30, yPosition);
                }
                
                yPosition += 8; // Increased spacing for readability
            }
            
            // Divider line
            doc.setDrawColor(180, 180, 180); // Darker gray for more visibility
            doc.setLineWidth(0.2); // Slightly thicker line
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8; // More spacing after divider
            
            // End of summary section background - adjust if needed based on content height
            const summaryEndY = yPosition + 5;
            
            // Divider between pricing summary and configuration details - stronger style
            yPosition += 5; // Space before the divider
            doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.setLineWidth(0.5); // Thicker line for major section divider
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10; // Space after the divider
            
            // By now the Pricing Summary should occupy approximately 40% of content space
            // Configuration Details section will take the remaining 60%
            
            // License Subscription header (adding back above the table)
            doc.setFontSize(12); // Smaller size (12 instead of 16)
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 46, 109); // Dark blue
            doc.text('License Subscription:', margin, yPosition);
            yPosition += 8;
            
            // Table layout
            const tableWidth = pageWidth - (margin * 2);
            const columnWidths = {
                qty: 15,
                product: 45, // Further reduced by 5
                headset: 55, // Further reduced by 5
                mdm: 30,
                // Removed PD column as requested
                subtotal: 55 // Increased from 45 to 55 to ensure enough space
            };
            
            // Calculate starting positions for each column
            let xPos = margin;
            const columnPositions = {
                qty: xPos,
                product: xPos += columnWidths.qty,
                headset: xPos += columnWidths.product,
                mdm: xPos += columnWidths.headset,
                // Removed PD column position
                subtotal: xPos += columnWidths.mdm
            };
            
            // Table header styling
            doc.setFillColor(230, 236, 245); // Light blue header background
            doc.rect(margin, yPosition - 5, tableWidth, 8, 'F');
            
            // Table headers
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(darkText[0], darkText[1], darkText[2]);
            
            doc.text('Qty', columnPositions.qty + 7, yPosition, { align: 'center' });
            doc.text('Product', columnPositions.product + 5, yPosition);
            doc.text('Headset', columnPositions.headset + 5, yPosition);
            doc.text('MDM', columnPositions.mdm + 5, yPosition);
            // Removed PD column header
            doc.text('Subtotal', columnPositions.subtotal + 27, yPosition, { align: 'center' }); // Changed to center alignment
            
            yPosition += 5;
            
            // Draw table outer border
            doc.setDrawColor(100, 100, 100); // Darker border
            doc.setLineWidth(0.5);
            doc.rect(margin, yPosition - 10, tableWidth, 10, 'S'); // Header border
            
            // Define formatter for consistent currency display with safety features
            const formatCurrency = (value) => {
                let result;
                if (typeof value === 'string') {
                    if (!value.includes('$')) {
                        result = `$${value}`;
                    } else {
                        result = value;
                    }
                } else {
                    result = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value);
                }
                
                // Add left and right padding spaces to ensure centered text has buffer space
                return ` ${result} `;
            };
            
            // Safety function to handle extremely large numbers
            const ensureCurrencyFits = (doc, value, x, y, options = {}) => {
                const formattedValue = formatCurrency(value);
                
                // Start with normal font size
                let fontSize = 9;
                doc.setFontSize(fontSize);
                
                // Check if the text is too long
                const textWidth = doc.getTextWidth(formattedValue);
                const maxWidth = 45; // Maximum allowed width in mm
                
                if (textWidth > maxWidth) {
                    // Reduce font size until it fits
                    while (textWidth > maxWidth && fontSize > 6) {
                        fontSize -= 0.5;
                        doc.setFontSize(fontSize);
                    }
                    
                    // If still too big, abbreviate (e.g., change $1,000,000 to $1M)
                    if (textWidth > maxWidth) {
                        // Extract the numeric part
                        const numericValue = typeof value === 'string' ? 
                            parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
                        
                        let abbreviated;
                        if (numericValue >= 1000000) {
                            abbreviated = `$${(numericValue / 1000000).toFixed(1)}M`;
                        } else if (numericValue >= 1000) {
                            abbreviated = `$${(numericValue / 1000).toFixed(1)}K`;
                        } else {
                            abbreviated = formattedValue;
                        }
                        
                        doc.text(abbreviated, x, y, options);
                    } else {
                        doc.text(formattedValue, x, y, options);
                    }
                } else {
                    doc.text(formattedValue, x, y, options);
                }
                
                // Reset to default font size
                doc.setFontSize(9);
            };
            
            // Add each configuration row
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            
            configurations.forEach((config, index) => {
                // Check if we need a new page
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 30;
                    
                    // Add "Continued" text at top of new page
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(100, 100, 100);
                    doc.text('Configuration Details (Continued)', margin, 20);
                    
                    // Redraw header on new page
                    doc.setFillColor(230, 236, 245);
                    doc.rect(margin, yPosition - 5, tableWidth, 8, 'F');
                    
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
                    
                    doc.text('Qty', columnPositions.qty + 7, yPosition, { align: 'center' });
                    doc.text('Product', columnPositions.product + 5, yPosition);
                    doc.text('Headset', columnPositions.headset + 5, yPosition);
                    doc.text('MDM', columnPositions.mdm + 5, yPosition);
                    // Removed PD column header
                    doc.text('Subtotal', columnPositions.subtotal + 27, yPosition, { align: 'center' }); // Changed to center alignment
                    
                    doc.setDrawColor(100, 100, 100);
                    doc.setLineWidth(0.5);
                    doc.rect(margin, yPosition - 5, tableWidth, 8, 'S');
                    
                    yPosition += 5;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                }
                
                // Calculate content for this row
                let productText = config.productType;
                if (productText === "CE") productText = "Transfr Trek (CE)";
                if (productText === "AA") productText = "All Access (AA)";
                if (productText === "VTF Single Discipline") productText = "Virtual Training Facility (VTF) Single Discipline";
                if (productText === "VTF Bundle") productText = "Virtual Training Facility (VTF) Bundle";
                if (productText === "No License - Only Headsets") productText = "No License - Only Headsets";
                
                // Prepare text with wrapped lines if needed
                const productLines = doc.splitTextToSize(productText, columnWidths.product - 10);
                const headsetLines = doc.splitTextToSize(config.headsetType, columnWidths.headset - 10);
                const mdmLines = doc.splitTextToSize(safeText(config.mdmType, ""), columnWidths.mdm - 5);
                
                // Calculate row height based on wrapped content
                const lineHeight = 5;
                const maxLines = Math.max(productLines.length, headsetLines.length, mdmLines.length);
                const rowHeight = Math.max(maxLines * lineHeight + 6, 12); // Minimum row height
                
                // Row background - alternating colors
                if (index % 2 === 0) {
                    doc.setFillColor(245, 247, 250); // Very light blue for even rows
                } else {
                    doc.setFillColor(250, 250, 252); // Slightly lighter for odd rows
                }
                doc.rect(margin, yPosition - 1, tableWidth, rowHeight, 'F');
                
                // Add row border
                doc.setDrawColor(200, 200, 200); // Light gray for row borders
                doc.setLineWidth(0.1);
                doc.rect(margin, yPosition - 1, tableWidth, rowHeight, 'S');
                
                // Cell vertical dividers
                doc.line(columnPositions.product, yPosition - 1, columnPositions.product, yPosition + rowHeight - 1);
                doc.line(columnPositions.headset, yPosition - 1, columnPositions.headset, yPosition + rowHeight - 1);
                doc.line(columnPositions.mdm, yPosition - 1, columnPositions.mdm, yPosition + rowHeight - 1);
                // Removed PD column divider
                doc.line(columnPositions.subtotal, yPosition - 1, columnPositions.subtotal, yPosition + rowHeight - 1);
                
                // Cell content
                doc.setTextColor(darkText[0], darkText[1], darkText[2]);
                const cellY = yPosition + 3; // Center text vertically in row
                
                // Quantity (centered)
                doc.text(config.quantity, columnPositions.qty + 7, cellY, { align: 'center' });
                
                // Product
                doc.text(productLines, columnPositions.product + 5, cellY);
                
                // Headset
                doc.text(headsetLines, columnPositions.headset + 5, cellY);
                
                // MDM
                doc.text(mdmLines, columnPositions.mdm + 5, cellY);
                
                // Subtotal (centered, bold)
                doc.setFont('helvetica', 'bold');
                
                // Use the safety function to display currency
                ensureCurrencyFits(doc, config.subtotal, columnPositions.subtotal + 27, cellY, { align: 'center' });
                
                doc.setFont('helvetica', 'normal');
                
                // Move position for next row
                yPosition += rowHeight;
            });
            
            // Draw bottom border of table
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition - 1, margin + tableWidth, yPosition - 1);
            
            // Calculate and display total
            let licenseTotal = 0;
            configurations.forEach(config => {
                try {
                    // Extract numeric value from the subtotal
                    const subtotalValue = safeParseFloat(config.subtotal, 0);
                    licenseTotal += subtotalValue;
                } catch (error) {
                    console.error("Error calculating license total for config:", config, error);
                }
            });
            
            yPosition += 5;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('License Subscription Total:', margin + tableWidth - 85, yPosition);
            
            // Use the safety function for the total
            ensureCurrencyFits(doc, licenseTotal, margin + tableWidth - 27, yPosition, { align: 'center' });
            doc.setFontSize(10); // Reset font size
            
            // Professional Learning section
            yPosition += 15;
            
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            
            console.log("Starting Professional Learning section at y=", yPosition);
            
            // Making Professional Learning header smaller to match License Subscription
            doc.setFontSize(12); // Smaller size (12 instead of 16)
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 46, 109); // Dark blue
            doc.text('Professional Learning:', margin, yPosition);
            yPosition += 8;
            
            // Create a smaller table for Professional Learning
            const plTableWidth = tableWidth;
            const plColumnWidths = {
                product: 60, // Reduced by 5
                description: 80, // Reduced by 5
                qty: 15,
                subtotal: 55  // Increased from 45 to 55 to ensure enough space
            };
            
            // Calculate column positions
            let plXPos = margin;
            const plColumnPositions = {
                product: plXPos,
                description: plXPos += plColumnWidths.product,
                qty: plXPos += plColumnWidths.description,
                subtotal: plXPos += plColumnWidths.qty
            };
            
            // Table header
            doc.setFillColor(230, 236, 245);
            doc.rect(margin, yPosition - 5, plTableWidth, 8, 'F');
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(darkText[0], darkText[1], darkText[2]);
            
            doc.text('Product', plColumnPositions.product + 5, yPosition);
            doc.text('Description', plColumnPositions.description + 5, yPosition);
            doc.text('QTY', plColumnPositions.qty + 7, yPosition, { align: 'center' });
            doc.text('Sub total', plColumnPositions.subtotal + 27, yPosition, { align: 'center' }); // Changed to center alignment
            
            yPosition += 5;
            
            // Table border
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.5);
            doc.rect(margin, yPosition - 10, plTableWidth, 10, 'S');
            
            console.log("Added Professional Learning table header");
            
            // Only add PD days if any exist in the configurations
            try {
                let hasPD = false;
                let totalPDDays = 0;
                
                configurations.forEach(config => {
                    const pdDaysValue = parseInt(config.pdDays) || 0;
                    if (pdDaysValue > 0) {
                        hasPD = true;
                        totalPDDays += pdDaysValue;
                    }
                });
                
                console.log("Has PD days:", hasPD, "Total PD days:", totalPDDays);
                
                if (hasPD) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    
                    // Row height calculation
                    const description = "Engaging professional development session guiding educators on integrating Transfr's career exploration virtual reality modules into their curriculum effectively.";
                    const descriptionLines = doc.splitTextToSize(description, plColumnWidths.description - 10);
                    const lineHeight = 5;
                    const maxLines = descriptionLines.length;
                    const rowHeight = Math.max(maxLines * lineHeight + 6, 12);
                    
                    console.log("PD row height:", rowHeight, "lines:", maxLines);
                    
                    // Row background
                    doc.setFillColor(245, 247, 250);
                    doc.rect(margin, yPosition - 1, plTableWidth, rowHeight, 'F');
                    
                    // Row border
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.1);
                    doc.rect(margin, yPosition - 1, plTableWidth, rowHeight, 'S');
                    
                    // Cell dividers
                    doc.line(plColumnPositions.description, yPosition - 1, plColumnPositions.description, yPosition + rowHeight - 1);
                    doc.line(plColumnPositions.qty, yPosition - 1, plColumnPositions.qty, yPosition + rowHeight - 1);
                    doc.line(plColumnPositions.subtotal, yPosition - 1, plColumnPositions.subtotal, yPosition + rowHeight - 1);
                    
                    // Cell content
                    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
                    const cellY = yPosition + 3;
                    
                    // Product
                    doc.text("Transfr Trek for Career Exploration", plColumnPositions.product + 5, cellY);
                    
                    // Description - updated as requested in feedback
                    doc.text(descriptionLines, plColumnPositions.description + 5, cellY);
                    
                    // Quantity
                    doc.text(totalPDDays.toString(), plColumnPositions.qty + 7, cellY, { align: 'center' });
                    
                    // Subtotal
                    doc.setFont('helvetica', 'bold');
                    
                    // Calculate PD cost
                    const pdCost = totalPDDays * 3500; // $3,500 per PD day
                    
                    // Use the safety function to display currency
                    ensureCurrencyFits(doc, pdCost, plColumnPositions.subtotal + 27, cellY, { align: 'center' });
                    
                    yPosition += rowHeight;
                    
                    // Bottom border
                    doc.setDrawColor(100, 100, 100);
                    doc.setLineWidth(0.5);
                    doc.line(margin, yPosition - 1, margin + plTableWidth, yPosition - 1);
                    
                    // Total
                    yPosition += 5;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Professional Learning Total:', margin + plTableWidth - 85, yPosition);
                    
                    // Use the safety function for the total
                    ensureCurrencyFits(doc, pdCost, margin + plTableWidth - 27, yPosition, { align: 'center' });
                    doc.setFontSize(10); // Reset font size
                    
                    console.log("Added PD content with cost:", pdCost);
                } else {
                    // No PD days, add empty row
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(9);
                    doc.text("No professional learning items selected", margin + 5, yPosition + 5);
                    
                    yPosition += 10;
                    
                    // Bottom border
                    doc.setDrawColor(100, 100, 100);
                    doc.setLineWidth(0.5);
                    doc.line(margin, yPosition - 1, margin + plTableWidth, yPosition - 1);
                    
                    // Total when no PD days
                    yPosition += 5;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Professional Learning Total:', margin + plTableWidth - 85, yPosition);
                    
                    // Use the safety function even for zero
                    ensureCurrencyFits(doc, 0, margin + plTableWidth - 27, yPosition, { align: 'center' });
                    doc.setFontSize(10); // Reset font size
                    
                    console.log("Added empty PD section");
                }
            } catch (error) {
                console.error("Error in Professional Learning section:", error);
                // In case of error, display a basic message but don't fail the PDF generation
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9);
                doc.text("Professional Learning data not available", margin + 5, yPosition + 5);
                yPosition += 10;
            }
            
            console.log("Completed Professional Learning section");
            
            // ADD Year-by-Year Breakdown AFTER the Professional Learning section
            yPosition += 15;
            
            console.log("Starting Year-by-Year Breakdown section at y=", yPosition);
            try {
                if (yearlyBreakdown && yearlyBreakdown.length > 0) {
                    // Check if we need a new page
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 30;
                        console.log("Added new page for Year-by-Year Breakdown at y=", yPosition);
                    }
                    
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 46, 109); // Dark blue
                    doc.text('Year-by-Year Breakdown:', margin, yPosition);
                    yPosition += 8;
                    
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
                    
                    // Display year-by-year breakdown
                    const yearSpacing = 6;
                    yearlyBreakdown.forEach((year, index) => {
                        console.log(`Adding year ${index + 1}: ${year} at y=${yPosition}`);
                        doc.text(`• ${year}`, margin + 5, yPosition);
                        yPosition += yearSpacing;
                    });
                    
                    yPosition += 5;
                    console.log("Completed Year-by-Year Breakdown section");
                } else {
                    console.log("No yearly breakdown data to display");
                }
            } catch (error) {
                console.error("Error in Year-by-Year Breakdown section:", error);
                // Continue with PDF generation even if this section fails
            }
            
            // Define disclaimer text once
            const disclaimer = "IMPORTANT: This is an estimate only. It does not represent a guarantee of pricing. Official pricing is only guaranteed via fully approved Quotes generated in CPQ.";
            
            // Add disclaimer in footer on all pages
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                
                // Add disclaimer as footer - made more prominent
                doc.setFontSize(9);
                doc.setTextColor(220, 0, 0); // Bright red color for importance
                doc.setFont('helvetica', 'bold');
                const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - (2 * margin));
                doc.text(disclaimerLines, pageWidth / 2, 283, { align: 'center' });
            }
            
            console.log("PDF Download initiated");
            // Download the PDF with Transfr naming convention
            doc.save('Transfr_Pricing_Proposal.pdf');
            
            // Success message in console
            console.log('PDF generated successfully');
            
        } catch (error) {
            // Handle any errors that occur during PDF generation
            console.error('Error generating PDF:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            alert('There was an error generating the PDF: ' + error.message);
        } finally {
            // Reset button state regardless of success or failure
            exportPdfBtn.disabled = false;
            exportPdfBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645a19.697 19.697 0 0 0 1.062-2.227a7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686a5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416a.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95a11.651 11.651 0 0 0-1.997.406a11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193a11.744 11.744 0 0 1-.51-.858a20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015a.307.307 0 0 0 .094-.125a.436.436 0 0 0 .059-.2a.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198a.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
            </svg> Export to PDF`;
            console.log("Reset export button state");
        }
    }

    // Calculate total cost without calling updateDiscountOptions() to avoid circularity
    function calculateTotalCostWithoutUpdatingOptions() {
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
        
        // Calculate original total before discount
        const originalTotal = totalCost;
        
        // Apply discount if applicable (only to renewable revenue, not one-time costs)
        const renewableRevenue = originalTotal - totalOneTimeCost;
        const discountAmount = renewableRevenue * (selectedDiscount / 100);
        totalCost = originalTotal - discountAmount;
        
        console.log("Discount calculation (without updating options):", {
            originalTotal,
            totalOneTimeCost,
            renewableRevenue,
            selectedDiscount,
            discountAmount,
            finalTotal: totalCost
        });
        
        // Update discount display if it exists
        const discountRow = document.getElementById('discountRow');
        if (discountRow) {
            if (selectedDiscount > 0) {
                discountRow.innerHTML = `Discount (${selectedDiscount}%): <span style="font-size: 1.1em;">-${formatCurrency(discountAmount)}</span>`;
                discountRow.style.display = 'block';
            } else {
                discountRow.style.display = 'none';
            }
        }
        
        // Update savings display if it exists
        const savingsRow = document.getElementById('savingsRow');
        if (savingsRow) {
            if (selectedDiscount > 0) {
                savingsRow.innerHTML = `★ You save: ${formatCurrency(discountAmount)} ★`;
                savingsRow.style.display = 'block';
            } else {
                savingsRow.style.display = 'none';
            }
        }
        
        // Update savings per student if applicable
        let savingsPerStudentRow = document.getElementById('savingsPerStudentRow');
        
        // Create the savings per student row if it doesn't exist
        if (!savingsPerStudentRow && selectedDiscount > 0 && numStudents > 0) {
            savingsPerStudentRow = document.createElement('div');
            savingsPerStudentRow.id = 'savingsPerStudentRow';
            savingsPerStudentRow.className = 'savings-per-student-row';
            savingsPerStudentRow.style.marginTop = '5px';
            savingsPerStudentRow.style.fontSize = '12px';
            savingsPerStudentRow.style.color = '#FFEB3B';
            
            // Add it after the savings row
            const resultBox = document.querySelector('.result-box');
            if (resultBox) {
                if (savingsRow) {
                    resultBox.insertBefore(savingsPerStudentRow, savingsRow.nextSibling);
                } else {
                    resultBox.appendChild(savingsPerStudentRow);
                }
            }
        }
        
        // Update or hide savings per student row
        if (savingsPerStudentRow) {
            if (selectedDiscount > 0 && numStudents > 0) {
                // Calculate savings per student (annualized)
                const annualizedSavings = discountAmount / numYears;
                const savingsPerStudent = annualizedSavings / numStudents;
                
                savingsPerStudentRow.innerHTML = `Each student saves: ${formatCurrency(savingsPerStudent)}/year`;
                savingsPerStudentRow.style.display = 'block';
            } else {
                savingsPerStudentRow.style.display = 'none';
            }
        }
        
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
            
            // Calculate yearly costs with discount applied to recurring costs
            const discountedRecurringCost = totalRecurringCost * (1 - selectedDiscount / 100);
            
            // Year 1 includes one-time costs + recurring costs
            const year1Cost = totalOneTimeCost + discountedRecurringCost;
            const year1Element = document.createElement('div');
            year1Element.className = 'year-cost';
            year1Element.innerHTML = `<strong>Year 1:</strong> ${formatCurrency(year1Cost)}`;
            yearlyBreakdownContent.appendChild(year1Element);
            
            // Years 2 through N only include recurring costs
            for (let year = 2; year <= numYears; year++) {
                const yearElement = document.createElement('div');
                yearElement.className = 'year-cost';
                yearElement.innerHTML = `<strong>Year ${year}:</strong> ${formatCurrency(discountedRecurringCost)}`;
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
        if (discountRow && selectedDiscount > 0) {
            animateElement(discountRow);
        }
        if (savingsPerStudentRow && selectedDiscount > 0 && numStudents > 0) {
            animateElement(savingsPerStudentRow);
        }
    }

    // Function to directly apply discount without causing UI state changes
    function applyDiscountImmediately() {
        // Double-check that the discount value is correct
        const checkBox = document.getElementById('applyDiscountCheckbox');
        const discountInput = document.getElementById('discountInput');
        const numYears = parseInt(numYearsInput.value) || 1;
        const maxDiscount = maxDiscountsByYear[numYears] || 0;
        const numStudents = numStudentsInput.value ? parseInt(numStudentsInput.value) : 0;
        
        if (checkBox && checkBox.checked) {
            // If checked but discount is 0, force it to max discount
            if (selectedDiscount === 0 || selectedDiscount < 0.01) {
                selectedDiscount = maxDiscount;
                console.log("Corrected discount to max value:", maxDiscount);
                
                // Update input field if it exists
                if (discountInput) {
                    discountInput.value = maxDiscount;
                }
            }
        }
        
        console.log("APPLYING DISCOUNT IMMEDIATELY, discount =", selectedDiscount);
        
        // Calculate total cost values manually
        let totalCost = 0;
        let totalOneTimeCost = 0;
        let totalRecurringCost = 0;
        const rows = headsetRowsContainer.querySelectorAll('.headset-row');
        
        rows.forEach(row => {
            // Get individual costs for the row
            const costs = calculateRowCostDetails(row);
            totalCost += costs.totalRowCost;
            totalOneTimeCost += costs.headsetCost + costs.pdDaysCost;
            totalRecurringCost += (costs.productCost + costs.mdmCost + costs.leasedHardwareCost) / numYears; // Normalize to per year
        });
        
        // Calculate original total before discount
        const originalTotal = totalCost;
        
        // Apply discount if applicable (only to renewable revenue, not one-time costs)
        const renewableRevenue = originalTotal - totalOneTimeCost;
        const discountAmount = renewableRevenue * (selectedDiscount / 100);
        totalCost = originalTotal - discountAmount;
        
        console.log("Direct discount calculation:", {
            originalTotal,
            totalOneTimeCost,
            renewableRevenue,
            selectedDiscount,
            discountAmount,
            finalTotal: totalCost
        });
        
        // Update discount display if it exists
        const discountRow = document.getElementById('discountRow');
        if (discountRow) {
            if (selectedDiscount > 0) {
                discountRow.innerHTML = `Discount (${selectedDiscount}%): <span style="font-size: 1.1em;">-${formatCurrency(discountAmount)}</span>`;
                discountRow.style.display = 'block';
            } else {
                discountRow.style.display = 'none';
            }
        }
        
        // Update savings display if it exists
        const savingsRow = document.getElementById('savingsRow');
        if (savingsRow) {
            if (selectedDiscount > 0) {
                savingsRow.innerHTML = `★ You save: ${formatCurrency(discountAmount)} ★`;
                savingsRow.style.display = 'block';
            } else {
                savingsRow.style.display = 'none';
            }
        }
        
        // Update savings per student if applicable
        let savingsPerStudentRow = document.getElementById('savingsPerStudentRow');
        
        // Create the savings per student row if it doesn't exist
        if (!savingsPerStudentRow && selectedDiscount > 0 && numStudents > 0) {
            savingsPerStudentRow = document.createElement('div');
            savingsPerStudentRow.id = 'savingsPerStudentRow';
            savingsPerStudentRow.className = 'savings-per-student-row';
            savingsPerStudentRow.style.marginTop = '5px';
            savingsPerStudentRow.style.fontSize = '12px';
            savingsPerStudentRow.style.color = '#FFEB3B';
            
            // Add it after the savings row
            const resultBox = document.querySelector('.result-box');
            if (resultBox) {
                if (savingsRow) {
                    resultBox.insertBefore(savingsPerStudentRow, savingsRow.nextSibling);
                } else {
                    resultBox.appendChild(savingsPerStudentRow);
                }
            }
        }
        
        // Update or hide savings per student row
        if (savingsPerStudentRow) {
            if (selectedDiscount > 0 && numStudents > 0) {
                // Calculate savings per student (annualized)
                const annualizedSavings = discountAmount / numYears;
                const savingsPerStudent = annualizedSavings / numStudents;
                
                savingsPerStudentRow.innerHTML = `Each student saves: ${formatCurrency(savingsPerStudent)}/year`;
                savingsPerStudentRow.style.display = 'block';
            } else {
                savingsPerStudentRow.style.display = 'none';
            }
        }
        
        // Update total cost
        totalCostElement.textContent = `Estimated Total Cost: ${formatCurrency(totalCost)}`;
        
        // Update yearly breakdown if it exists
        const yearlyBreakdownElement = document.getElementById('yearlyBreakdown');
        const yearlyBreakdownContent = document.getElementById('yearlyBreakdownContent');
        
        if (numYears > 1 && yearlyBreakdownContent) {
            // Calculate yearly costs with discount applied to recurring costs
            const discountedRecurringCost = totalRecurringCost * (1 - selectedDiscount / 100);
            
            // Clear previous content
            yearlyBreakdownContent.innerHTML = '';
            
            // Year 1 includes one-time costs + recurring costs
            const year1Cost = totalOneTimeCost + discountedRecurringCost;
            const year1Element = document.createElement('div');
            year1Element.className = 'year-cost';
            year1Element.innerHTML = `<strong>Year 1:</strong> ${formatCurrency(year1Cost)}`;
            yearlyBreakdownContent.appendChild(year1Element);
            
            // Years 2 through N only include recurring costs
            for (let year = 2; year <= numYears; year++) {
                const yearElement = document.createElement('div');
                yearElement.className = 'year-cost';
                yearElement.innerHTML = `<strong>Year ${year}:</strong> ${formatCurrency(discountedRecurringCost)}`;
                yearlyBreakdownContent.appendChild(yearElement);
            }
            
            // Show the yearly breakdown
            yearlyBreakdownElement.style.display = 'block';
        }
        
        // Add animation effects for visual feedback
        animateElement(totalCostElement);
        if (discountRow && selectedDiscount > 0) {
            animateElement(discountRow);
        }
        if (savingsPerStudentRow && selectedDiscount > 0 && numStudents > 0) {
            animateElement(savingsPerStudentRow);
        }
        if (yearlyBreakdownElement && numYears > 1) {
            animateElement(yearlyBreakdownElement);
        }
    }

    // Helper function to safely display text, with a default value if the input is empty
    const safeText = (text, defaultValue = "") => {
        return text || defaultValue;
    };
    
    const safeParseFloat = (value, defaultValue = 0) => {
        try {
            if (typeof value === 'string') {
                // Remove any non-numeric characters except decimal point, allowing for currency formatting
                value = value.replace(/[^0-9.-]+/g, "");
            }
            const result = parseFloat(value);
            return isNaN(result) ? defaultValue : result;
        } catch (error) {
            console.error("Error parsing float value:", value, error);
            return defaultValue;
        }
    };
}); 