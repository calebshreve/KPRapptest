// Link Publisher functionality for writer-publisher connections
console.log('Link Publisher popup loaded');

/**
 * Shows the link publisher popup for connecting writers to publishers
 * @param {HTMLElement} writerRow - The writer row element that was clicked
 * @param {number} rowIndex - The index of the registration row
 */
function showLinkPublisherPopup(writerRow, rowIndex) {
    console.log('showLinkPublisherPopup called for row:', rowIndex);
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'popup-overlay';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 450px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transition: max-width 0.3s ease;
    `;
    
    // Get writer information from the clicked row
    const writerInputs = writerRow.querySelectorAll('input');
    const writerName = writerInputs[0]?.value || '';
    const writerIPI = writerInputs[1]?.value || '';
    const writerShare = writerInputs[2]?.value || '';
    
    // Create popup header with toggle button
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    `;
    
    const header = document.createElement('h3');
    header.textContent = 'Link Writer to Publishers';
    header.style.cssText = `
        margin: 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    `;
    
    const toggleButton = document.createElement('span');
    toggleButton.textContent = 'more detail >';
    toggleButton.style.cssText = `
        color: #007bff;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
    `;
    
    headerContainer.appendChild(header);
    headerContainer.appendChild(toggleButton);
    
    // Create writer info display
    const writerInfo = document.createElement('div');
    writerInfo.style.cssText = `
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 20px;
        border-left: 4px solid #007bff;
    `;
    
    const writerInfoText = document.createElement('p');
    writerInfoText.innerHTML = `
        <strong>Writer:</strong> ${writerName || 'Not specified'}<br>
        <strong>IPI:</strong> ${writerIPI || 'Not specified'}<br>
        <strong>Writer's Share:</strong> ${writerShare || '0'}%
    `;
    writerInfoText.style.margin = '0';
    writerInfo.appendChild(writerInfoText);
    
    // Create publisher list section
    const publisherSection = document.createElement('div');
    publisherSection.style.marginBottom = '20px';
    
    const publisherLabel = document.createElement('label');
    publisherLabel.textContent = 'Performance and mechanical splits should each equal writer\'s share';
    publisherLabel.style.cssText = `
        display: block;
        margin-bottom: 15px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
    `;
    
    const publisherList = document.createElement('div');
    publisherList.style.cssText = `
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
    `;
    
    // Get available publishers from the current row
    const expandableContent = document.querySelectorAll('.registration-row')[rowIndex]?.nextElementSibling;
    const publishers = [];
    
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
        if (publisherContainer) {
            const publisherRows = publisherContainer.querySelectorAll('.additional-field-row');
            publisherRows.forEach((row, index) => {
                const publisherInputs = row.querySelectorAll('input');
                const publisherName = publisherInputs[0]?.value || '';
                const publisherIPI = publisherInputs[1]?.value || '';
                
                if (publisherName.trim()) {
                    publishers.push({
                        index: index,
                        name: publisherName,
                        ipi: publisherIPI,
                        row: row
                    });
                }
            });
        }
    }
    
    // Create publisher items with split inputs
    const publisherItems = [];
    publishers.forEach((publisher, index) => {
        const publisherItem = document.createElement('div');
        publisherItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #eee;
            background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};
        `;
        
        const publisherInfo = document.createElement('div');
        publisherInfo.style.cssText = `
            flex: 1;
            margin-right: 15px;
        `;
        
        const publisherName = document.createElement('div');
        publisherName.textContent = publisher.name;
        publisherName.style.cssText = `
            font-weight: 600;
            color: #333;
            margin-bottom: 2px;
        `;
        
        const publisherIPI = document.createElement('div');
        publisherIPI.textContent = `IPI: ${publisher.ipi || 'Not specified'}`;
        publisherIPI.style.cssText = `
            font-size: 12px;
            color: #666;
        `;
        
        publisherInfo.appendChild(publisherName);
        publisherInfo.appendChild(publisherIPI);
        
        // Performance label above input (only for first publisher)
        const performanceLabel = document.createElement('div');
        performanceLabel.textContent = index === 0 ? 'Performance' : '';
        performanceLabel.style.cssText = `
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 12px;
            text-align: center;
            height: 14px;
        `;
        
        const splitContainer = document.createElement('div');
        splitContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
        `;
        
        const performanceInput = document.createElement('input');
        performanceInput.type = 'number';
        performanceInput.min = '0';
        performanceInput.max = '100';
        performanceInput.step = '0.01';
        performanceInput.placeholder = '0%';
        performanceInput.style.cssText = `
            width: 60px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
        `;
        
        splitContainer.appendChild(performanceLabel);
        splitContainer.appendChild(performanceInput);
        
        // Mechanicals section (initially hidden)
        const mechanicalsContainer = document.createElement('div');
        mechanicalsContainer.id = `mechanicals-${index}`;
        mechanicalsContainer.style.cssText = `
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            margin-left: 15px;
        `;
        
        const mechanicalsLabel = document.createElement('div');
        mechanicalsLabel.textContent = index === 0 ? 'Mechanicals' : '';
        mechanicalsLabel.style.cssText = `
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 12px;
            text-align: center;
            height: 14px;
        `;
        
        const mechanicalsInput = document.createElement('input');
        mechanicalsInput.type = 'number';
        mechanicalsInput.min = '0';
        mechanicalsInput.max = '100';
        mechanicalsInput.step = '0.01';
        mechanicalsInput.placeholder = '0%';
        mechanicalsInput.style.cssText = `
            width: 60px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
        `;
        
        mechanicalsContainer.appendChild(mechanicalsLabel);
        mechanicalsContainer.appendChild(mechanicalsInput);
        
        // Create a container for both inputs
        const inputsContainer = document.createElement('div');
        inputsContainer.style.cssText = `
            display: flex;
            align-items: center;
        `;
        
        inputsContainer.appendChild(splitContainer);
        inputsContainer.appendChild(mechanicalsContainer);
        
        publisherItem.appendChild(publisherInfo);
        publisherItem.appendChild(inputsContainer);
        publisherList.appendChild(publisherItem);
        
        publisherItems.push({
            publisher: publisher,
            publisherInfo: publisherInfo,
            performanceInput: performanceInput,
            mechanicalsInput: mechanicalsInput,
            mechanicalsContainer: mechanicalsContainer
        });
    });
    
    // Pre-populate existing split values if this is an edit (writer is already linked)
    const existingLinkText = writerRow.querySelector('.link-to-publisher');
    if (existingLinkText && existingLinkText.textContent === 'Linked') {
        // Find existing split values from the writer's current splits
        const expandableContent = document.querySelectorAll('.registration-row')[rowIndex]?.nextElementSibling;
        if (expandableContent && expandableContent.classList.contains('expandable-content')) {
            const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
            if (writerContainer) {
                const writerRows = writerContainer.querySelectorAll('.additional-field-row');
                writerRows.forEach((writerRow, writerIndex) => {
                    const writerInputs = writerRow.querySelectorAll('input');
                    const writerName = writerInputs[0]?.value || '';
                    
                    // Find matching publisher and populate splits
                    publisherItems.forEach(item => {
                        if (item.publisher.name === writerName) {
                            const performanceSplit = writerInputs[2]?.value || '0';
                            const mechanicalsSplit = writerInputs[3]?.value || '0';
                            
                            item.performanceInput.value = performanceSplit;
                            item.mechanicalsInput.value = mechanicalsSplit;
                        }
                    });
                });
            }
        }
        
        // Update totals after pre-populating
        updateTotal();
        
        // Expand popup if there are mechanical splits
        const hasMechanicals = publisherItems.some(item => parseFloat(item.mechanicalsInput.value) > 0);
        if (hasMechanicals) {
            popupContent.style.maxWidth = '500px';
            publisherItems.forEach(item => {
                item.mechanicalsContainer.style.display = 'flex';
            });
            mechanicalsTotalValue.style.display = 'inline';
            toggleButton.textContent = '< less detail';
            isExpanded = true;
        }
    }
    
    // Add total display
    const totalContainer = document.createElement('div');
    totalContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background-color: #e9ecef;
        border-radius: 4px;
        margin-top: 15px;
        font-weight: 600;
    `;
    
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Total';
    totalLabel.style.cssText = `
        font-weight: 600;
    `;
    
    const totalsRow = document.createElement('div');
    totalsRow.style.cssText = `
        display: flex;
        gap: 50px;
        align-items: center;
        padding-right: 20px;
    `;
    
    const performanceTotalValue = document.createElement('span');
    performanceTotalValue.textContent = '0%';
    performanceTotalValue.id = 'performance-total';
    performanceTotalValue.style.cssText = `
        color: #007bff;
        font-weight: 600;
    `;
    
    const mechanicalsTotalValue = document.createElement('span');
    mechanicalsTotalValue.textContent = '0%';
    mechanicalsTotalValue.id = 'mechanicals-total';
    mechanicalsTotalValue.style.cssText = `
        color: #007bff;
        font-weight: 600;
        display: none;
    `;
    
    totalsRow.appendChild(performanceTotalValue);
    totalsRow.appendChild(mechanicalsTotalValue);
    
    totalContainer.appendChild(totalLabel);
    totalContainer.appendChild(totalsRow);
    
    // Add input validation and total calculation
    publisherItems.forEach(item => {
        item.performanceInput.addEventListener('input', function() {
            updateTotal();
        });
        
        item.mechanicalsInput.addEventListener('input', function() {
            updateTotal();
        });
        
        // Add Enter key handling to exit input boxes
        item.performanceInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
        
        item.mechanicalsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
    
    function updateTotal() {
        const performanceTotal = publisherItems.reduce((sum, item) => {
            return sum + (parseFloat(item.performanceInput.value) || 0);
        }, 0);
        
        const mechanicalsTotal = publisherItems.reduce((sum, item) => {
            return sum + (parseFloat(item.mechanicalsInput.value) || 0);
        }, 0);
        
        // Format totals to show decimals only when needed
        const formatPercentage = (value) => {
            return value % 1 === 0 ? value + '%' : value.toFixed(2) + '%';
        };
        
        performanceTotalValue.textContent = formatPercentage(performanceTotal);
        mechanicalsTotalValue.textContent = formatPercentage(mechanicalsTotal);
    }
    
    // Toggle functionality
    let isExpanded = false;
    toggleButton.addEventListener('click', function() {
        if (isExpanded) {
            // Collapse
            popupContent.style.maxWidth = '450px';
            publisherItems.forEach(item => {
                item.mechanicalsContainer.style.display = 'none';
            });
            mechanicalsTotalValue.style.display = 'none';
            toggleButton.textContent = 'more detail >';
            isExpanded = false;
        } else {
            // Expand
            popupContent.style.maxWidth = '500px';
            publisherItems.forEach(item => {
                item.mechanicalsContainer.style.display = 'flex';
            });
            mechanicalsTotalValue.style.display = 'inline';
            toggleButton.textContent = '< less detail';
            isExpanded = true;
        }
    });
    
    publisherSection.appendChild(publisherLabel);
    publisherSection.appendChild(publisherList);
    publisherSection.appendChild(totalContainer);
    
    // Create bottom options container
    const bottomOptionsContainer = document.createElement('div');
    bottomOptionsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
    `;
    
    // Choose Writer's Entity option
    const chooseEntityOption = document.createElement('span');
    chooseEntityOption.textContent = 'Choose Writer\'s Entity';
    chooseEntityOption.style.cssText = `
        color: #007bff;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
    `;
    
    chooseEntityOption.addEventListener('click', function() {
        showChooseEntityPopup(publishers, publisherItems);
    });
    
    // Calculate 75/25 mechanical split option
    const calculateSplitOption = document.createElement('span');
    calculateSplitOption.textContent = 'Calculate 75/25 mechanical split';
    calculateSplitOption.style.cssText = `
        color: #007bff;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
    `;
    
    // Track the current mode for the calculate split option
    let isUsingSameSplits = false;
    
    calculateSplitOption.addEventListener('click', function() {
        if (calculateSplitOption.textContent === 'Calculate 75/25 mechanical split') {
            // Button says "Calculate 75/25 mechanical split", so perform 75/25 calculation
            calculateMechanicalSplit(publisherItems, isExpanded, toggleButton, popupContent, mechanicalsTotalValue, updateTotal);
            calculateSplitOption.textContent = 'Use same splits for both';
            isUsingSameSplits = true;
        } else {
            // Button says "Use same splits for both", so copy performance to mechanical
            useSameSplitsForMechanicals(publisherItems, updateTotal);
            calculateSplitOption.textContent = 'Calculate 75/25 mechanical split';
            isUsingSameSplits = false;
        }
    });
    
    bottomOptionsContainer.appendChild(chooseEntityOption);
    bottomOptionsContainer.appendChild(calculateSplitOption);
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: space-between;
        align-items: center;
        margin-top: 25px;
    `;
    
    // Create left side container for bottom options
    const leftSideContainer = document.createElement('div');
    leftSideContainer.appendChild(bottomOptionsContainer);
    
    // Create right side container for buttons
    const rightSideContainer = document.createElement('div');
    rightSideContainer.style.cssText = `
        display: flex;
        gap: 10px;
    `;
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border: 1px solid #ddd;
        background-color: white;
        color: #333;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    // Create link button
    const linkButton = document.createElement('button');
    linkButton.textContent = 'Link Publishers';
    linkButton.style.cssText = `
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    linkButton.addEventListener('click', () => {
        const performanceTotal = publisherItems.reduce((sum, item) => {
            return sum + (parseFloat(item.performanceInput.value) || 0);
        }, 0);
        
        const mechanicalsTotal = publisherItems.reduce((sum, item) => {
            return sum + (parseFloat(item.mechanicalsInput.value) || 0);
        }, 0);
        
        const writerTotal = parseFloat(writerShare) || 0;
        
        if (performanceTotal > writerTotal) {
            alert(`Performance share (${performanceTotal.toFixed(2)}%) cannot exceed the writer's share (${writerTotal}%).`);
            return;
        }
        
        if (mechanicalsTotal > writerTotal) {
            alert(`Mechanical share (${mechanicalsTotal.toFixed(2)}%) cannot exceed the writer's share (${writerTotal}%).`);
            return;
        }
        
        // Perform the linking logic here
        linkWriterToPublishers(writerRow, rowIndex, publisherItems);
        
        // Close popup
        document.body.removeChild(popup);
    });
    
    rightSideContainer.appendChild(cancelButton);
    rightSideContainer.appendChild(linkButton);
    
    buttonsContainer.appendChild(leftSideContainer);
    buttonsContainer.appendChild(rightSideContainer);
    
    // Assemble popup
    popupContent.appendChild(headerContainer);
    popupContent.appendChild(writerInfo);
    popupContent.appendChild(publisherSection);
    popupContent.appendChild(buttonsContainer);
    popup.appendChild(popupContent);
    
    // Add to page
    document.body.appendChild(popup);
    
    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

/**
 * Links a writer to multiple publishers with specified splits
 * @param {HTMLElement} writerRow - The writer row element
 * @param {number} rowIndex - The index of the registration row
 * @param {Array} publisherItems - Array of publisher items with performance and mechanicals inputs
 */
function linkWriterToPublishers(writerRow, rowIndex, publisherItems) {
    console.log('linkWriterToPublishers called:', { rowIndex, publisherItems });
    
    // Filter publishers that have splits assigned
    const linkedPublishers = publisherItems.filter(item => {
        const performanceSplit = parseFloat(item.performanceInput.value) || 0;
        const mechanicalsSplit = parseFloat(item.mechanicalsInput.value) || 0;
        return performanceSplit > 0 || mechanicalsSplit > 0;
    });
    
    if (linkedPublishers.length === 0) {
        console.log('No publishers selected for linking');
        return;
    }
    
    // Update the writer row's link text
    const linkText = writerRow.querySelector('.link-to-publisher');
    if (linkText) {
        const performanceTotal = linkedPublishers.reduce((sum, item) => {
            return sum + (parseFloat(item.performanceInput.value) || 0);
        }, 0);
        
        const mechanicalsTotal = linkedPublishers.reduce((sum, item) => {
            return sum + (parseFloat(item.mechanicalsInput.value) || 0);
        }, 0);
        
        const totalSplit = performanceTotal + mechanicalsTotal;
        
        if (linkedPublishers.length === 1) {
            // Single publisher
            const publisher = linkedPublishers[0];
            const performanceSplit = parseFloat(publisher.performanceInput.value) || 0;
            const mechanicalsSplit = parseFloat(publisher.mechanicalsInput.value) || 0;
            
            const formatPercentage = (value) => {
                return value % 1 === 0 ? value + '%' : value.toFixed(2) + '%';
            };
            
            linkText.textContent = 'Linked';
            
            linkText.style.color = '#28a745';
            linkText.style.cursor = 'pointer';
            
            // Add click handler to open link publisher popup for editing
            linkText.onclick = () => {
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(writerRow);
                showLinkPublisherPopup(writerRow, rowIndex);
            };
        } else {
            // Multiple publishers
            linkText.textContent = 'Linked';
            linkText.style.color = '#28a745';
            linkText.style.cursor = 'pointer';
            
            // Add click handler to open link publisher popup for editing
            linkText.onclick = () => {
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(writerRow);
                showLinkPublisherPopup(writerRow, rowIndex);
            };
        }
    }
    
    // Update publisher link texts to show "Linked" for selected publishers
    linkedPublishers.forEach(item => {
        const publisherLinkText = item.publisher.row.querySelector('.link-to-publisher');
        if (publisherLinkText) {
            publisherLinkText.textContent = 'Linked';
            publisherLinkText.style.color = '#28a745';
            publisherLinkText.style.cursor = 'pointer';
        }
    });
    
    // Store the link information (you might want to save this to your database)
    const linkData = {
        writerRow: writerRow,
        writerName: writerRow.querySelector('input')?.value || '',
        linkedPublishers: linkedPublishers.map(item => ({
            publisher: item.publisher,
            performanceSplit: parseFloat(item.performanceInput.value) || 0,
            mechanicalsSplit: parseFloat(item.mechanicalsInput.value) || 0
        })),
        linkedAt: new Date().toISOString()
    };
    
    console.log('Writer linked to publishers:', linkData);
    
    // You can add additional logic here, such as:
    // - Saving to localStorage
    // - Sending to server
    // - Updating other UI elements
}

/**
 * Shows information about the linked publisher
 * @param {string} publisherName - The name of the linked publisher
 * @param {string} publisherIPI - The IPI of the linked publisher
 * @param {number} performanceSplit - The performance split percentage
 * @param {number} mechanicalsSplit - The mechanicals split percentage
 */
function showLinkedPublisherInfo(publisherName, publisherIPI, performanceSplit, mechanicalsSplit) {
    const formatPercentage = (value) => {
        return value % 1 === 0 ? value + '%' : value.toFixed(2) + '%';
    };
    
    let info = `Linked Publisher:\n\nName: ${publisherName}\nIPI: ${publisherIPI || 'Not specified'}\n`;
    
    if (performanceSplit > 0) {
        info += `Performance: ${formatPercentage(performanceSplit)}\n`;
    }
    if (mechanicalsSplit > 0) {
        info += `Mechanicals: ${formatPercentage(mechanicalsSplit)}\n`;
    }
    
    alert(info);
}

/**
 * Shows information about multiple linked publishers
 * @param {Array} linkedPublishers - Array of linked publisher items
 */
function showMultipleLinkedPublishersInfo(linkedPublishers) {
    const formatPercentage = (value) => {
        return value % 1 === 0 ? value + '%' : value.toFixed(2) + '%';
    };
    
    let info = 'Linked Publishers:\n\n';
    
    linkedPublishers.forEach((item, index) => {
        const performanceSplit = parseFloat(item.performanceInput.value) || 0;
        const mechanicalsSplit = parseFloat(item.mechanicalsInput.value) || 0;
        
        info += `${index + 1}. ${item.publisher.name}\n`;
        info += `   IPI: ${item.publisher.ipi || 'Not specified'}\n`;
        
        if (performanceSplit > 0) {
            info += `   Performance: ${formatPercentage(performanceSplit)}\n`;
        }
        if (mechanicalsSplit > 0) {
            info += `   Mechanicals: ${formatPercentage(mechanicalsSplit)}\n`;
        }
        info += '\n';
    });
    
    alert(info);
}

/**
 * Shows popup to choose writer's entity
 * @param {Array} publishers - Array of available publishers
 * @param {Array} publisherItems - Array of publisher items with inputs
 */
function showChooseEntityPopup(publishers, publisherItems) {
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'popup-overlay';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    `;
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    // Create header
    const header = document.createElement('h3');
    header.textContent = 'Choose Writer\'s Entity';
    header.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    `;
    
    // Create publisher list
    const publisherList = document.createElement('div');
    publisherList.style.cssText = `
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 20px;
    `;
    
    publishers.forEach((publisher, index) => {
        const publisherItem = document.createElement('div');
        publisherItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #eee;
            background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};
            cursor: pointer;
        `;
        
        const publisherInfo = document.createElement('div');
        publisherInfo.style.cssText = `
            flex: 1;
        `;
        
        const publisherName = document.createElement('div');
        publisherName.textContent = publisher.name;
        publisherName.style.cssText = `
            font-weight: 600;
            color: #333;
            margin-bottom: 2px;
        `;
        
        const publisherIPI = document.createElement('div');
        publisherIPI.textContent = `IPI: ${publisher.ipi || 'Not specified'}`;
        publisherIPI.style.cssText = `
            font-size: 12px;
            color: #666;
        `;
        
        publisherInfo.appendChild(publisherName);
        publisherInfo.appendChild(publisherIPI);
        
        const entityLabel = document.createElement('span');
        entityLabel.textContent = 'Writer\'s Entity';
        entityLabel.style.cssText = `
            color: #28a745;
            font-weight: 600;
            font-size: 12px;
            display: none;
        `;
        
        publisherItem.appendChild(publisherInfo);
        publisherItem.appendChild(entityLabel);
        publisherList.appendChild(publisherItem);
        
        // Add click handler
        publisherItem.addEventListener('click', function() {
            // Remove "Writer's Entity" label from all items
            publisherList.querySelectorAll('span').forEach(label => {
                label.style.display = 'none';
            });
            
            // Add "Writer's Entity" label to selected item
            entityLabel.style.display = 'inline';
            
            // Store the selected entity
            window.selectedWriterEntity = publisher;
        });
        
        // Add hover effect
        publisherItem.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e3f2fd';
        });
        
        publisherItem.addEventListener('mouseleave', function() {
            const index = Array.from(publisherList.children).indexOf(this);
            this.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        });
    });
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border: 1px solid #ddd;
        background-color: white;
        color: #333;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    // Create select button
    const selectButton = document.createElement('button');
    selectButton.textContent = 'Select';
    selectButton.style.cssText = `
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    selectButton.addEventListener('click', () => {
        if (window.selectedWriterEntity) {
            // Update the main popup to show the selected entity
            updateWriterEntityDisplay(publisherItems, window.selectedWriterEntity);
            document.body.removeChild(popup);
        } else {
            alert('Please select a writer\'s entity first.');
        }
    });
    
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(selectButton);
    
    // Assemble popup
    popupContent.appendChild(header);
    popupContent.appendChild(publisherList);
    popupContent.appendChild(buttonsContainer);
    popup.appendChild(popupContent);
    
    // Add to page
    document.body.appendChild(popup);
    
    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

/**
 * Updates the display to show the selected writer's entity
 * @param {Array} publisherItems - Array of publisher items
 * @param {Object} selectedEntity - The selected writer's entity
 */
function updateWriterEntityDisplay(publisherItems, selectedEntity) {
    // Remove existing entity labels from all publisher items
    publisherItems.forEach(item => {
        const existingLabel = item.publisherInfo.querySelector('.entity-label');
        if (existingLabel) {
            existingLabel.remove();
        }
    });
    
    // Add entity label to the selected publisher
    publisherItems.forEach(item => {
        if (item.publisher.name === selectedEntity.name) {
            const entityLabel = document.createElement('div');
            entityLabel.textContent = 'Writer\'s Entity';
            entityLabel.className = 'entity-label';
            entityLabel.style.cssText = `
                color: #28a745;
                font-weight: 600;
                font-size: 12px;
                margin-top: 2px;
            `;
            item.publisherInfo.appendChild(entityLabel);
        }
    });
}

/**
 * Calculates 75/25 mechanical split
 * @param {Array} publisherItems - Array of publisher items
 * @param {boolean} isExpanded - Whether the popup is expanded
 * @param {HTMLElement} toggleButton - The toggle button element
 * @param {HTMLElement} popupContent - The popup content element
 * @param {HTMLElement} mechanicalsTotalValue - The mechanicals total value element
 * @param {Function} updateTotal - Function to update totals
 */
function calculateMechanicalSplit(publisherItems, isExpanded, toggleButton, popupContent, mechanicalsTotalValue, updateTotal) {
    // Check if writer's entity is selected
    if (!window.selectedWriterEntity) {
        alert('A writer entity must be chosen first');
        return;
    }
    
    // Expand popup if not already expanded
    if (!isExpanded) {
        popupContent.style.maxWidth = '500px';
        publisherItems.forEach(item => {
            item.mechanicalsContainer.style.display = 'flex';
        });
        mechanicalsTotalValue.style.display = 'inline';
        toggleButton.textContent = '< less detail';
        isExpanded = true;
    }
    
    // Calculate mechanical splits
    publisherItems.forEach(item => {
        const performanceValue = parseFloat(item.performanceInput.value) || 0;
        
        if (item.publisher.name === window.selectedWriterEntity.name) {
            // Writer's entity: performance amount * 1.5
            const mechanicalValue = performanceValue * 1.5;
            item.mechanicalsInput.value = mechanicalValue.toFixed(2);
        } else if (performanceValue > 0) {
            // Other publishers: performance amount * 0.5
            const mechanicalValue = performanceValue * 0.5;
            item.mechanicalsInput.value = mechanicalValue.toFixed(2);
        } else {
            // No performance value, set mechanical to 0
            item.mechanicalsInput.value = '0';
        }
    });
    
    // Update totals
    updateTotal();
}

/**
 * Copies performance splits to mechanical splits
 * @param {Array} publisherItems - Array of publisher items
 * @param {Function} updateTotal - Function to update totals
 */
function useSameSplitsForMechanicals(publisherItems, updateTotal) {
    // Expand popup if not already expanded
    const popupContent = document.querySelector('.popup-content');
    const toggleButton = document.querySelector('.popup-content span[style*="color: #007bff"]');
    const mechanicalsTotalValue = document.getElementById('mechanicals-total');
    
    if (popupContent && popupContent.style.maxWidth === '450px') {
        popupContent.style.maxWidth = '500px';
        publisherItems.forEach(item => {
            item.mechanicalsContainer.style.display = 'flex';
        });
        if (mechanicalsTotalValue) {
            mechanicalsTotalValue.style.display = 'inline';
        }
        if (toggleButton) {
            toggleButton.textContent = '< less detail';
        }
    }
    
    // Copy performance splits to mechanical splits
    publisherItems.forEach(item => {
        const performanceValue = parseFloat(item.performanceInput.value) || 0;
        item.mechanicalsInput.value = performanceValue.toFixed(2);
    });
    
    // Update totals
    updateTotal();
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLinkPublisherPopup,
        linkWriterToPublishers,
        showLinkedPublisherInfo,
        showMultipleLinkedPublishersInfo,
        showChooseEntityPopup,
        calculateMechanicalSplit,
        useSameSplitsForMechanicals
    };
} 