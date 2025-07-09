// Complete bulk registration functionality with advanced artist management
console.log('Advanced JS loaded');

// Sidebar is already loaded in HTML, no need to load it dynamically
console.log('Sidebar already exists in HTML, skipping dynamic loading');

// Registration database to track artists, titles, and ISRCs per row
const registrationDatabase = {
    rows: {} // Will store data for each registration row: { artists: [], titles: [], isrcs: [], iswc: [] }
};

// Track the last-focused input
let lastFocusedInput = null;

// Track if this is the initial page load
let isInitialLoad = true;

// Store user-modified split data per row
const userSplitData = {};

// Function to collapse all rows
function collapseAllRows() {
    const expandableContents = document.querySelectorAll('.expandable-content');
    const expandArrows = document.querySelectorAll('.expand-arrow');
    
    expandableContents.forEach(content => {
        content.style.display = 'none';
    });
    
    expandArrows.forEach(arrow => {
        arrow.innerHTML = '▶';
        arrow.classList.remove('expanded');
    });
}

// Function to generate registration rows
function generateRows(count) {
    console.log('generateRows called with count:', count);
    
    const rowsContainer = document.querySelector('.registration-rows-container');
    if (!rowsContainer) {
        console.error('Container not found!');
        return;
    }
    
    // Get current row count
    const currentRows = rowsContainer.querySelectorAll('.registration-row');
    const currentCount = currentRows.length;
    
    // If reducing rows, check for data and warn user
    if (count < currentCount) {
        const hasDataInRemovedRows = checkForDataInRows(currentCount - count);
        if (hasDataInRemovedRows) {
            const confirmMessage = `You are about to remove ${currentCount - count} row(s) that contain data. This will permanently delete the information in those rows. Are you sure you want to continue?`;
            if (!confirm(confirmMessage)) {
                // User cancelled, restore the original count
                const input = document.querySelector('.registration-count-input');
                if (input) {
                    input.value = currentCount;
                }
                return;
            }
        }
    }
    
    // Save current row data before clearing
    const savedRowData = saveCurrentRowData();
    
    console.log('Container found, clearing and generating rows');
    rowsContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const row = document.createElement('div');
        row.className = 'registration-row';
        
        // Create expandable arrow container
        const expandArrowContainer = document.createElement('div');
        expandArrowContainer.className = 'expand-arrow-container';
        
        const expandArrow = document.createElement('button');
        expandArrow.className = 'expand-arrow';
        expandArrow.innerHTML = '▶';
        expandArrow.setAttribute('data-row', i);
        
        expandArrowContainer.appendChild(expandArrow);
        row.appendChild(expandArrowContainer);
        
        // Create expandable content area for this specific row
        const expandableContent = document.createElement('div');
        expandableContent.className = 'expandable-content';
        expandableContent.style.display = 'none';
        
        // Clone the template content
        const template = document.getElementById('expandable-content-template');
        if (template) {
            const templateContent = template.content.cloneNode(true);
            
            // Set unique IDs for pie charts
            const writerPieChart = templateContent.querySelector('.writer-pie-chart');
            const publisherPieChart = templateContent.querySelector('.publisher-pie-chart');
            if (writerPieChart) writerPieChart.id = `writer-pie-chart-${i}`;
            if (publisherPieChart) publisherPieChart.id = `publisher-pie-chart-${i}`;
            
            // Set data-row attributes for buttons
            const buttons = templateContent.querySelectorAll('.update-split-btn, .save-split-btn');
            buttons.forEach(button => {
                button.setAttribute('data-row', i);
            });
            
            // Set split type and totals
            const splitTypeDropdown = templateContent.querySelector('.split-type-dropdown');
            const writerSplitTotal = templateContent.querySelector('.additional-fields:first-child .split-total-value');
            const publisherSplitTotal = templateContent.querySelector('.additional-fields:last-child .split-total-value');
            
            // Populate dropdown with split types
            if (splitTypeDropdown) {
                // Clear existing options except the first one
                while (splitTypeDropdown.children.length > 1) {
                    splitTypeDropdown.removeChild(splitTypeDropdown.lastChild);
                }
                
                // Add options for each split type in the database
                splitDatabase.forEach(split => {
                    const option = document.createElement('option');
                    option.value = split.splitType;
                    option.textContent = `${split.splitType}: ${split.splitNickname}`;
                    splitTypeDropdown.appendChild(option);
                });
                
                // Set the current value
                splitTypeDropdown.value = splitDatabase[i]?.splitType || '';
            }
            

            
            if (writerSplitTotal) writerSplitTotal.textContent = calculateWriterSplitTotal(splitDatabase[i]);
            if (publisherSplitTotal) publisherSplitTotal.textContent = calculatePublisherSplitTotal(splitDatabase[i]);
            
            expandableContent.appendChild(templateContent);
        } else {
            console.error('Template not found: expandable-content-template');
        }
        
        // Create 5 input boxes per row
        for (let j = 0; j < 5; j++) {
            const inputBox = document.createElement('input');
            inputBox.type = 'text';
            
            // Restore saved data if available
            if (savedRowData[i] && savedRowData[i][j] !== undefined) {
                inputBox.value = savedRowData[i][j];
            }
            
            if (j === 0) {
                inputBox.placeholder = 'Artist';
                
                // Set the previous value attribute for restored data
                if (savedRowData[i] && savedRowData[i][j] !== undefined) {
                    inputBox.setAttribute('data-previous-value', savedRowData[i][j]);
                }
                
                // Create container for input and "+ another artist" text
                const artistContainer = document.createElement('div');
                artistContainer.className = 'artist-input-container';
                
                // Create custom input wrapper for more artists functionality
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'custom-input-wrapper';
                inputWrapper.style.position = 'relative';
                inputWrapper.style.display = 'inline-block';
                
                // Create "+ more" text for additional artists (initially hidden)
                const moreArtistsText = document.createElement('span');
                moreArtistsText.className = 'more-artists-overlay';
                moreArtistsText.textContent = ' + more';
                moreArtistsText.style.position = 'absolute';
                moreArtistsText.style.left = 'auto';
                moreArtistsText.style.right = '5px';
                moreArtistsText.style.top = '50%';
                moreArtistsText.style.transform = 'translateY(-50%)';
                moreArtistsText.style.fontSize = '10pt';
                moreArtistsText.style.cursor = 'pointer';
                moreArtistsText.style.color = '#87CEEB';
                moreArtistsText.style.pointerEvents = 'auto';
                moreArtistsText.style.zIndex = '4';
                moreArtistsText.style.fontFamily = 'inherit';
                moreArtistsText.style.display = 'none';
                moreArtistsText.style.backgroundColor = 'white';
                moreArtistsText.style.padding = '0 2px';
                
                // Add click event for "+ more" text
                moreArtistsText.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const currentRow = inputBox.closest('.registration-row');
                    showMoreArtistsPopup(inputBox.value, null, currentRow);
                });
                
                // Function to check and update more artists visibility
                const updateMoreArtistsVisibility = () => {
                    const currentRow = inputBox.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    const rowData = registrationDatabase.rows[rowIndex];
                    const totalArtists = rowData ? rowData.artists.length : 0;
                    const currentValue = inputBox.value.trim();
                    
                    console.log('Checking more artists visibility for row', rowIndex, ':', {
                        totalArtists: totalArtists,
                        currentValue: currentValue,
                        hasValue: !!currentValue,
                        rowData: rowData
                    });
                    
                    // Show "+ more" if:
                    // 1. There are multiple artists, OR
                    // 2. There are artists in database but input is empty (user chose "leave blank")
                    if (totalArtists > 1 || (totalArtists > 0 && !currentValue)) {
                        moreArtistsText.style.display = 'block';
                        console.log('Showing + more text for row', rowIndex, '- has', totalArtists, 'artist(s)');
                    } else {
                        moreArtistsText.style.display = 'none';
                        console.log('Hiding + more text - no artists or single artist in input for row', rowIndex);
                    }
                };
                
                inputWrapper.updateMoreArtists = updateMoreArtistsVisibility;
                
                // Add focus event listener to capture initial value
                inputBox.addEventListener('focus', function() {
                    // Store the current value as the previous value when user starts editing
                    const currentValue = this.value.trim();
                    if (currentValue) {
                        this.setAttribute('data-previous-value', currentValue);
                    }
                });
                
                // Add blur event listener to ensure artist is added when user finishes typing
                inputBox.addEventListener('blur', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingArtists = rowData.artists || [];
                    
                    // If there's a value in the input, add it to the database
                    if (currentValue) {
                        const artistName = currentValue;
                        
                        // Check if this input had a previous value (user typed over existing artist)
                        const previousValue = this.getAttribute('data-previous-value');
                        
                        if (previousValue && previousValue !== artistName) {
                            // User replaced the artist - remove the old one and add the new one
                            const oldIndex = existingArtists.indexOf(previousValue);
                            if (oldIndex !== -1) {
                                existingArtists.splice(oldIndex, 1);
                                console.log('Artist replaced in database:', previousValue, '->', artistName, 'in row', rowIndex);
                            }
                        }
                        
                        // Add the new artist if not already present
                        if (!existingArtists.includes(artistName)) {
                            existingArtists.push(artistName);
                            console.log('Artist added to database from blur:', artistName, 'in row', rowIndex);
                        }
                        
                        // Update the previous value attribute
                        this.setAttribute('data-previous-value', artistName);
                    } else {
                        // Input is empty - check if there was a previous value that needs to be removed
                        // This will be handled by the input event listener
                    }
                    
                    updateMoreArtistsVisibility();
                    // Update artists list in expanded view
                    populateArtistsList(rowIndex);
                });
                
                // Add input event listener to handle when artist is deleted from input
                inputBox.addEventListener('input', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingArtists = rowData.artists || [];
                    
                    // If input is empty and there are other artists in the database
                    if (!currentValue && existingArtists.length > 0) {
                        // Remove the first artist (assuming it was the main artist)
                        const removedArtist = existingArtists.shift();
                        console.log('Artist removed from database:', removedArtist, 'in row', rowIndex);
                        
                        // If there are still other artists, ask which should be the main artist
                        if (existingArtists.length > 0) {
                            setTimeout(() => {
                                showNewMainArtistSelection(existingArtists, null, currentRow, true);
                            }, 100); // Small delay to ensure the input change is processed first
                        }
                    }
                    
                    updateMoreArtistsVisibility();
                });
                
                // Add keydown event listener for Enter key to blur the input
                inputBox.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur(); // Deselect the input field
                    }
                });
                
                // Add elements to wrapper
                inputWrapper.appendChild(inputBox);
                inputWrapper.appendChild(moreArtistsText);
                
                // Initial check for more artists
                updateMoreArtistsVisibility();
                
                const addArtistText = document.createElement('span');
                addArtistText.className = 'add-artist-text';
                addArtistText.textContent = '+ another artist';
                addArtistText.style.fontSize = '10pt';
                addArtistText.style.cursor = 'pointer';
                addArtistText.style.color = '#007bff';
                
                // Add click event for "+ another artist"
                addArtistText.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const currentRow = this.closest('.registration-row');
                    const artistInput = currentRow.querySelector('.artist-input-container input');
                    
                    // Check if there's an artist in the input box
                    if (artistInput && artistInput.value.trim()) {
                        const artistName = artistInput.value.trim();
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                        
                        // Ensure the row exists in the database
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Add the artist to the database if not already present
                        if (!registrationDatabase.rows[rowIndex].artists.includes(artistName)) {
                            registrationDatabase.rows[rowIndex].artists.push(artistName);
                            console.log('Artist from input box added to database:', artistName, 'in row', rowIndex);
                        }
                        
                        // Update "+ more" visibility
                        const artistWrapper = currentRow.querySelector('.custom-input-wrapper');
                        if (artistWrapper && artistWrapper.updateMoreArtists) {
                            artistWrapper.updateMoreArtists();
                        }
                        
                        // Update artists list in expanded view
                        populateArtistsList(rowIndex);
                    }
                    
                    // Create callback to fill the input box with the newly added artist
                    const fillInputCallback = function(newArtistName) {
                        const artistInput = currentRow.querySelector('.artist-input-container input');
                        if (artistInput && !artistInput.value.trim()) {
                            // Only fill the input if it's currently empty
                            artistInput.value = newArtistName;
                        }
                    };
                    
                    // Open the "+ more" popup instead of the separate add popup
                    const currentArtist = artistInput ? artistInput.value.trim() : '';
                    showMoreArtistsPopup(currentArtist, null, currentRow);
                });
                
                artistContainer.appendChild(inputWrapper);
                artistContainer.appendChild(addArtistText);
                row.appendChild(artistContainer);
                
            } else if (j === 1) {
                inputBox.placeholder = 'Work Title';
                
                // Set the previous value attribute for restored data
                if (savedRowData[i] && savedRowData[i][j] !== undefined) {
                    inputBox.setAttribute('data-previous-value', savedRowData[i][j]);
                }
                
                // Create container for input and "+ additional title" text
                const titleContainer = document.createElement('div');
                titleContainer.className = 'title-input-container';
                
                // Create custom input wrapper for more titles functionality
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'custom-title-input-wrapper';
                inputWrapper.style.position = 'relative';
                inputWrapper.style.display = 'inline-block';
                
                // Create "+ more" text for additional titles (initially hidden)
                const moreTitlesText = document.createElement('span');
                moreTitlesText.className = 'more-titles-overlay';
                moreTitlesText.textContent = ' + more';
                moreTitlesText.style.position = 'absolute';
                moreTitlesText.style.left = 'auto';
                moreTitlesText.style.right = '5px';
                moreTitlesText.style.top = '50%';
                moreTitlesText.style.transform = 'translateY(-50%)';
                moreTitlesText.style.fontSize = '10pt';
                moreTitlesText.style.cursor = 'pointer';
                moreTitlesText.style.color = '#87CEEB';
                moreTitlesText.style.pointerEvents = 'auto';
                moreTitlesText.style.zIndex = '4';
                moreTitlesText.style.fontFamily = 'inherit';
                moreTitlesText.style.display = 'none';
                moreTitlesText.style.backgroundColor = 'white';
                moreTitlesText.style.padding = '0 2px';
                
                // Add click event for "+ more" text
                moreTitlesText.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const currentRow = inputBox.closest('.registration-row');
                    showMoreTitlesPopup(inputBox.value, null, currentRow);
                });
                
                // Function to check and update more titles visibility
                const updateMoreTitlesVisibility = () => {
                    const currentRow = inputBox.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    const rowData = registrationDatabase.rows[rowIndex];
                    const totalTitles = rowData ? (rowData.titles ? rowData.titles.length : 0) : 0;
                    const currentValue = inputBox.value.trim();
                    
                    console.log('Checking more titles visibility for row', rowIndex, ':', {
                        totalTitles: totalTitles,
                        currentValue: currentValue,
                        hasValue: !!currentValue,
                        rowData: rowData
                    });
                    
                    // Show "+ more" if:
                    // 1. There are multiple titles, OR
                    // 2. There are titles in database but input is empty (user chose "leave blank")
                    if (totalTitles > 1 || (totalTitles > 0 && !currentValue)) {
                        moreTitlesText.style.display = 'block';
                        console.log('Showing + more text for row', rowIndex, '- has', totalTitles, 'title(s)');
                    } else {
                        moreTitlesText.style.display = 'none';
                        console.log('Hiding + more text - no titles or single title in input for row', rowIndex);
                    }
                };
                
                inputWrapper.updateMoreTitles = updateMoreTitlesVisibility;
                
                // Add focus event listener to capture initial value
                inputBox.addEventListener('focus', function() {
                    // Store the current value as the previous value when user starts editing
                    const currentValue = this.value.trim();
                    if (currentValue) {
                        this.setAttribute('data-previous-value', currentValue);
                    }
                });
                
                // Add blur event listener to ensure title is added when user finishes typing
                inputBox.addEventListener('blur', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingTitles = rowData.titles || [];
                    
                    // If there's a value in the input, add it to the database
                    if (currentValue) {
                        const titleName = currentValue;
                        
                        // Check if this input had a previous value (user typed over existing title)
                        const previousValue = this.getAttribute('data-previous-value');
                        
                        if (previousValue && previousValue !== titleName) {
                            // User replaced the title - remove the old one and add the new one
                            const oldIndex = existingTitles.indexOf(previousValue);
                            if (oldIndex !== -1) {
                                existingTitles.splice(oldIndex, 1);
                                console.log('Title replaced in database:', previousValue, '->', titleName, 'in row', rowIndex);
                            }
                        }
                        
                        // Add the new title if not already present
                        if (!existingTitles.includes(titleName)) {
                            existingTitles.push(titleName);
                            console.log('Title added to database from blur:', titleName, 'in row', rowIndex);
                        }
                        
                        // Update the previous value attribute
                        this.setAttribute('data-previous-value', titleName);
                    } else {
                        // Input is empty - check if there was a previous value that needs to be removed
                        // This will be handled by the input event listener
                    }
                    
                    updateMoreTitlesVisibility();
                    // Update titles list in expanded view
                    populateTitlesList(rowIndex);
                });
                
                // Add input event listener to handle when title is deleted from input
                inputBox.addEventListener('input', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingTitles = rowData.titles || [];
                    
                    // If input is empty and there are other titles in the database
                    if (!currentValue && existingTitles.length > 0) {
                        // Remove the first title (assuming it was the main title)
                        const removedTitle = existingTitles.shift();
                        console.log('Title removed from database:', removedTitle, 'in row', rowIndex);
                        
                        // If there are still other titles, ask which should be the main title
                        if (existingTitles.length > 0) {
                            setTimeout(() => {
                                showNewMainTitleSelection(existingTitles, null, currentRow, true);
                            }, 100); // Small delay to ensure the input change is processed first
                        }
                    }
                    
                    updateMoreTitlesVisibility();
                });
                
                // Add keydown event listener for Enter key to blur the input
                inputBox.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur(); // Deselect the input field
                    }
                });
                
                // Add elements to wrapper
                inputWrapper.appendChild(inputBox);
                inputWrapper.appendChild(moreTitlesText);
                
                // Initial check for more titles
                updateMoreTitlesVisibility();
                
                const addTitleText = document.createElement('span');
                addTitleText.className = 'add-title-text';
                addTitleText.textContent = '+ additional title';
                addTitleText.style.fontSize = '10pt';
                addTitleText.style.cursor = 'pointer';
                addTitleText.style.color = '#007bff';
                
                // Add click event for "+ additional title"
                addTitleText.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log('+ additional title clicked');
                    const currentRow = this.closest('.registration-row');
                    console.log('Current row found:', currentRow);
                    const titleInput = currentRow.querySelector('.title-input-container input');
                    console.log('Title input found:', titleInput);
                    
                    // Check if there's a title in the input box
                    if (titleInput && titleInput.value.trim()) {
                        const titleName = titleInput.value.trim();
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                        console.log('Row index:', rowIndex);
                        
                        // Ensure the row exists in the database
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Add the title to the database if not already present
                        if (!registrationDatabase.rows[rowIndex].titles.includes(titleName)) {
                            registrationDatabase.rows[rowIndex].titles.push(titleName);
                            console.log('Title from input box added to database:', titleName, 'in row', rowIndex);
                        }
                        
                        // Update "+ more" visibility
                        const titleWrapper = currentRow.querySelector('.custom-title-input-wrapper');
                        if (titleWrapper && titleWrapper.updateMoreTitles) {
                            titleWrapper.updateMoreTitles();
                        }
                        
                        // Update titles list in expanded view
                        populateTitlesList(rowIndex);
                    }
                    
                    // Open the "+ more" popup instead of the separate add popup
                    const currentTitle = titleInput ? titleInput.value.trim() : '';
                    showMoreTitlesPopup(currentTitle, null, currentRow);
                });
                
                titleContainer.appendChild(inputWrapper);
                titleContainer.appendChild(addTitleText);
                row.appendChild(titleContainer);
                
            } else if (j === 2) {
                inputBox.placeholder = 'ISWC';
                
                // Set the previous value attribute for restored data
                if (savedRowData[i] && savedRowData[i][j] !== undefined) {
                    inputBox.setAttribute('data-previous-value', savedRowData[i][j]);
                }
                
                // Add focus event listener to capture initial value
                inputBox.addEventListener('focus', function() {
                    // Store the current value as the previous value when user starts editing
                    const currentValue = this.value.trim();
                    if (currentValue) {
                        this.setAttribute('data-previous-value', currentValue);
                    }
                });
                
                // Add blur event listener to ensure ISWC is added when user finishes typing
                inputBox.addEventListener('blur', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingIswc = rowData.iswc || [];
                    
                    // If there's a value in the input, add it to the database
                    if (currentValue) {
                        const iswcCode = currentValue;
                        
                        // Check if this input had a previous value (user typed over existing ISWC)
                        const previousValue = this.getAttribute('data-previous-value');
                        
                        if (previousValue && previousValue !== iswcCode) {
                            // User replaced the ISWC - remove the old one and add the new one
                            const oldIndex = existingIswc.indexOf(previousValue);
                            if (oldIndex !== -1) {
                                existingIswc.splice(oldIndex, 1);
                                console.log('ISWC replaced in database:', previousValue, '->', iswcCode, 'in row', rowIndex);
                            }
                        }
                        
                        // Add the new ISWC if not already present
                        if (!existingIswc.includes(iswcCode)) {
                            existingIswc.push(iswcCode);
                            console.log('ISWC added to database from blur:', iswcCode, 'in row', rowIndex);
                        }
                        
                        // Update the previous value attribute
                        this.setAttribute('data-previous-value', iswcCode);
                    } else {
                        // Input is empty - check if there was a previous value that needs to be removed
                        // This will be handled by the input event listener
                    }
                    
                    // Update ISWC list in expanded view
                    populateIswcList(rowIndex);
                });
                
                // Add input event listener to handle when ISWC is deleted from input
                inputBox.addEventListener('input', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingIswc = rowData.iswc || [];
                    
                    // If input is empty and there are other ISWC in the database
                    if (!currentValue && existingIswc.length > 0) {
                        // Remove the first ISWC (assuming it was the main ISWC)
                        const removedIswc = existingIswc.shift();
                        console.log('ISWC removed from database:', removedIswc, 'in row', rowIndex);
                        
                        // If there are still other ISWC, ask which should be the main ISWC
                        if (existingIswc.length > 0) {
                            setTimeout(() => {
                                showNewMainIswcSelection(existingIswc, null, currentRow, true);
                            }, 100); // Small delay to ensure the input change is processed first
                        }
                    }
                });
                
                // Add keydown event listener for Enter key to blur the input
                inputBox.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur(); // Deselect the input field
                    }
                });
                
                // Create container with invisible spacer
                const iswcContainer = document.createElement('div');
                iswcContainer.className = 'iswc-input-container';
                
                const invisibleSpacer = document.createElement('span');
                invisibleSpacer.className = 'invisible-spacer';
                invisibleSpacer.style.fontSize = '10pt';
                invisibleSpacer.style.visibility = 'hidden';
                invisibleSpacer.textContent = '+ additional title';
                
                iswcContainer.appendChild(inputBox);
                iswcContainer.appendChild(invisibleSpacer);
                row.appendChild(iswcContainer);
                
            } else if (j === 3) {
                inputBox.placeholder = 'ISRC';
                
                // Set the previous value attribute for restored data
                if (savedRowData[i] && savedRowData[i][j] !== undefined) {
                    inputBox.setAttribute('data-previous-value', savedRowData[i][j]);
                }
                
                // Create container for input and "+ additional ISRC" text
                const isrcContainer = document.createElement('div');
                isrcContainer.className = 'isrc-input-container';
                
                // Create custom input wrapper for more ISRCs functionality
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'custom-isrc-input-wrapper';
                inputWrapper.style.position = 'relative';
                inputWrapper.style.display = 'inline-block';
                
                // Create "+ more" text for additional ISRCs (initially hidden)
                const moreIsrcsText = document.createElement('span');
                moreIsrcsText.className = 'more-isrcs-overlay';
                moreIsrcsText.textContent = ' + more';
                moreIsrcsText.style.position = 'absolute';
                moreIsrcsText.style.left = 'auto';
                moreIsrcsText.style.right = '5px';
                moreIsrcsText.style.top = '50%';
                moreIsrcsText.style.transform = 'translateY(-50%)';
                moreIsrcsText.style.fontSize = '10pt';
                moreIsrcsText.style.cursor = 'pointer';
                moreIsrcsText.style.color = '#87CEEB';
                moreIsrcsText.style.pointerEvents = 'auto';
                moreIsrcsText.style.zIndex = '4';
                moreIsrcsText.style.fontFamily = 'inherit';
                moreIsrcsText.style.display = 'none';
                moreIsrcsText.style.backgroundColor = 'white';
                moreIsrcsText.style.padding = '0 2px';
                
                // Add click event for "+ more" text
                moreIsrcsText.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const currentRow = inputBox.closest('.registration-row');
                    showMoreIsrcsPopup(inputBox.value, null, currentRow);
                });
                
                // Function to check and update more ISRCs visibility
                const updateMoreIsrcsVisibility = () => {
                    const currentRow = inputBox.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    const rowData = registrationDatabase.rows[rowIndex];
                    const totalIsrcs = rowData ? (rowData.isrcs ? rowData.isrcs.length : 0) : 0;
                    const currentValue = inputBox.value.trim();
                    
                    console.log('Checking more ISRCs visibility for row', rowIndex, ':', {
                        totalIsrcs: totalIsrcs,
                        currentValue: currentValue,
                        hasValue: !!currentValue,
                        rowData: rowData
                    });
                    
                    // Show "+ more" if:
                    // 1. There are multiple ISRCs, OR
                    // 2. There are ISRCs in database but input is empty (user chose "leave blank")
                    if (totalIsrcs > 1 || (totalIsrcs > 0 && !currentValue)) {
                        moreIsrcsText.style.display = 'block';
                        console.log('Showing + more text for row', rowIndex, '- has', totalIsrcs, 'ISRC(s)');
                    } else {
                        moreIsrcsText.style.display = 'none';
                        console.log('Hiding + more text - no ISRCs or single ISRC in input for row', rowIndex);
                    }
                };
                
                inputWrapper.updateMoreIsrcs = updateMoreIsrcsVisibility;
                
                // Add focus event listener to capture initial value
                inputBox.addEventListener('focus', function() {
                    // Store the current value as the previous value when user starts editing
                    const currentValue = this.value.trim();
                    if (currentValue) {
                        this.setAttribute('data-previous-value', currentValue);
                    }
                });
                
                // Add blur event listener to ensure ISRC is added when user finishes typing
                inputBox.addEventListener('blur', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingIsrcs = rowData.isrcs || [];
                    
                    // If there's a value in the input, add it to the database
                    if (currentValue) {
                        const isrcName = currentValue;
                        
                        // Check if this input had a previous value (user typed over existing ISRC)
                        const previousValue = this.getAttribute('data-previous-value');
                        
                        if (previousValue && previousValue !== isrcName) {
                            // User replaced the ISRC - remove the old one and add the new one
                            const oldIndex = existingIsrcs.indexOf(previousValue);
                            if (oldIndex !== -1) {
                                existingIsrcs.splice(oldIndex, 1);
                                console.log('ISRC replaced in database:', previousValue, '->', isrcName, 'in row', rowIndex);
                            }
                        }
                        
                        // Add the new ISRC if not already present
                        if (!existingIsrcs.includes(isrcName)) {
                            existingIsrcs.push(isrcName);
                            console.log('ISRC added to database from blur:', isrcName, 'in row', rowIndex);
                        }
                        
                        // Update the previous value attribute
                        this.setAttribute('data-previous-value', isrcName);
                    } else {
                        // Input is empty - check if there was a previous value that needs to be removed
                        // This will be handled by the input event listener
                    }
                    
                    updateMoreIsrcsVisibility();
                    // Update ISRCs list in expanded view
                    populateIsrcsList(rowIndex);
                });
                
                // Add input event listener to handle when ISRC is deleted from input
                inputBox.addEventListener('input', function() {
                    const currentRow = this.closest('.registration-row');
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    
                    if (!registrationDatabase.rows[rowIndex]) {
                        registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [] };
                    }
                    
                    const currentValue = this.value.trim();
                    const rowData = registrationDatabase.rows[rowIndex];
                    const existingIsrcs = rowData.isrcs || [];
                    
                    // If input is empty and there are other ISRCs in the database
                    if (!currentValue && existingIsrcs.length > 0) {
                        // Remove the first ISRC (assuming it was the main ISRC)
                        const removedIsrc = existingIsrcs.shift();
                        console.log('ISRC removed from database:', removedIsrc, 'in row', rowIndex);
                        
                        // If there are still other ISRCs, ask which should be the main ISRC
                        if (existingIsrcs.length > 0) {
                            setTimeout(() => {
                                showNewMainIsrcSelection(existingIsrcs, null, currentRow, true);
                            }, 100); // Small delay to ensure the input change is processed first
                        }
                    }
                    
                    updateMoreIsrcsVisibility();
                });
                
                // Add keydown event listener for Enter key to blur the input
                inputBox.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur(); // Deselect the input field
                    }
                });
                
                // Add elements to wrapper
                inputWrapper.appendChild(inputBox);
                inputWrapper.appendChild(moreIsrcsText);
                
                // Initial check for more ISRCs
                updateMoreIsrcsVisibility();
                
                const addIsrcText = document.createElement('span');
                addIsrcText.className = 'add-isrc-text';
                addIsrcText.textContent = '+ additional ISRC';
                addIsrcText.style.fontSize = '10pt';
                addIsrcText.style.cursor = 'pointer';
                addIsrcText.style.color = '#007bff';
                
                // Add click event for "+ additional ISRC"
                addIsrcText.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log('+ additional ISRC clicked');
                    const currentRow = this.closest('.registration-row');
                    console.log('Current row found:', currentRow);
                    const isrcInput = currentRow.querySelector('.isrc-input-container input');
                    console.log('ISRC input found:', isrcInput);
                    
                    // Check if there's an ISRC in the input box
                    if (isrcInput && isrcInput.value.trim()) {
                        const isrcName = isrcInput.value.trim();
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                        console.log('Row index:', rowIndex);
                        
                        // Ensure the row exists in the database
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [] };
                        }
                        
                        // Add the ISRC to the database if not already present
                        if (!registrationDatabase.rows[rowIndex].isrcs.includes(isrcName)) {
                            registrationDatabase.rows[rowIndex].isrcs.push(isrcName);
                            console.log('ISRC from input box added to database:', isrcName, 'in row', rowIndex);
                        }
                        
                        // Update "+ more" visibility
                        const isrcWrapper = currentRow.querySelector('.custom-isrc-input-wrapper');
                        if (isrcWrapper && isrcWrapper.updateMoreIsrcs) {
                            isrcWrapper.updateMoreIsrcs();
                        }
                        
                        // Update ISRCs list in expanded view
                        populateIsrcsList(rowIndex);
                    }
                    
                    // Create callback to fill the input box with the newly added ISRC
                    const fillInputCallback = function(newIsrcName) {
                        const isrcInput = currentRow.querySelector('.isrc-input-container input');
                        if (isrcInput && !isrcInput.value.trim()) {
                            // Only fill the input if it's currently empty
                            isrcInput.value = newIsrcName;
                        }
                    };
                    
                    // Open the "+ more" popup instead of the separate add popup
                    const currentIsrc = isrcInput ? isrcInput.value.trim() : '';
                    showMoreIsrcsPopup(currentIsrc, null, currentRow);
                });
                
                isrcContainer.appendChild(inputWrapper);
                isrcContainer.appendChild(addIsrcText);
                row.appendChild(isrcContainer);
                
            } else if (j === 4) {
                // Create a container for the 5th input with arrows
                const inputContainer = document.createElement('div');
                inputContainer.className = 'input-arrow-container';
                
                // Only set default value if no saved data
                if (!savedRowData[i] || savedRowData[i][j] === undefined) {
                    inputBox.value = '0';
                    inputBox.style.color = '#ccc';
                } else {
                    inputBox.value = savedRowData[i][j];
                    inputBox.style.color = savedRowData[i][j] !== '0' ? '#000' : '#ccc';
                }
                inputBox.style.textAlign = 'left';
                
                // Add event listener for split type changes
                inputBox.addEventListener('input', function() {
                    const currentValue = parseInt(this.value) || 0;
                    if (currentValue !== 0) {
                        this.style.color = '#000';
                        // Store the split type on the row for later use
                        const currentRow = this.closest('.registration-row');
                        currentRow.setAttribute('data-split-type', currentValue);
                        // Always populate the expandable content when split type changes
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                        populateInputFields(rowIndex);
                        
                        // Update dropdown in expandable content if it exists
                        const expandableContent = currentRow.nextElementSibling;
                        if (expandableContent && expandableContent.classList.contains('expandable-content')) {
                            const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
                            if (splitTypeDropdown) {
                                splitTypeDropdown.value = currentValue;
                            }
                        }
                    } else {
                        this.style.color = '#ccc';
                        const currentRow = this.closest('.registration-row');
                        currentRow.removeAttribute('data-split-type');
                        
                        // Update dropdown in expandable content if it exists
                        const expandableContent = currentRow.nextElementSibling;
                        if (expandableContent && expandableContent.classList.contains('expandable-content')) {
                            const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
                            if (splitTypeDropdown) {
                                splitTypeDropdown.value = '';
                            }
                        }
                    }
                });
                
                const arrowContainer = document.createElement('div');
                arrowContainer.className = 'arrow-container';
                
                const arrowUp = document.createElement('button');
                arrowUp.className = 'arrow-up';
                arrowUp.textContent = '▲';
                
                const arrowDown = document.createElement('button');
                arrowDown.className = 'arrow-down';
                arrowDown.textContent = '▼';
                
                // Add event listeners for the arrows
                arrowUp.addEventListener('click', function() {
                    const currentValue = parseInt(inputBox.value) || 0;
                    inputBox.value = currentValue + 1;
                    if (inputBox.value !== '0') {
                        inputBox.style.color = '#000';
                        // Store the split type and populate
                        const currentRow = inputBox.closest('.registration-row');
                        currentRow.setAttribute('data-split-type', inputBox.value);
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                        populateInputFields(rowIndex);
                        
                        // Update dropdown in expandable content if it exists
                        const expandableContent = currentRow.nextElementSibling;
                        if (expandableContent && expandableContent.classList.contains('expandable-content')) {
                            const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
                            if (splitTypeDropdown) {
                                splitTypeDropdown.value = inputBox.value;
                            }
                        }
                    } else {
                        inputBox.style.color = '#ccc';
                        const currentRow = inputBox.closest('.registration-row');
                        currentRow.removeAttribute('data-split-type');
                        
                        // Update dropdown in expandable content if it exists
                        const expandableContent = currentRow.nextElementSibling;
                        if (expandableContent && expandableContent.classList.contains('expandable-content')) {
                            const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
                            if (splitTypeDropdown) {
                                splitTypeDropdown.value = '';
                            }
                        }
                    }
                });
                
                arrowDown.addEventListener('click', function() {
                    const currentValue = parseInt(inputBox.value) || 0;
                    if (currentValue > 0) {
                        inputBox.value = currentValue - 1;
                        if (inputBox.value !== '0') {
                            inputBox.style.color = '#000';
                            const currentRow = inputBox.closest('.registration-row');
                            currentRow.setAttribute('data-split-type', inputBox.value);
                            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                            populateInputFields(rowIndex);
                            
                            // Update dropdown in expandable content if it exists
                            const expandableContent = currentRow.nextElementSibling;
                            if (expandableContent && expandableContent.classList.contains('expandable-content')) {
                                const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
                                if (splitTypeDropdown) {
                                    splitTypeDropdown.value = inputBox.value;
                                }
                            }
                        } else {
                            inputBox.style.color = '#ccc';
                            const currentRow = inputBox.closest('.registration-row');
                            currentRow.removeAttribute('data-split-type');
                            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                            populateInputFields(rowIndex);
                            
                            // Update dropdown in expandable content if it exists
                            const expandableContent = currentRow.nextElementSibling;
                            if (expandableContent && expandableContent.classList.contains('expandable-content')) {
                                const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
                                if (splitTypeDropdown) {
                                    splitTypeDropdown.value = '';
                                }
                            }
                        }
                    }
                });
                
                arrowContainer.appendChild(arrowUp);
                arrowContainer.appendChild(arrowDown);
                inputContainer.appendChild(inputBox);
                inputContainer.appendChild(arrowContainer);
                
                // Create container for input and "view" text
                const splitTypeContainer = document.createElement('div');
                splitTypeContainer.className = 'split-type-input-container';
                
                const viewText = document.createElement('span');
                viewText.className = 'view-text';
                viewText.textContent = 'view';
                viewText.style.fontSize = '10pt';
                viewText.style.cursor = 'pointer';
                viewText.style.color = '#007bff';
                
                // Add click event to toggle expandable window
                viewText.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const currentRow = this.closest('.registration-row');
                    const expandableContent = currentRow.nextElementSibling;
                    const expandArrow = currentRow.querySelector('.expand-arrow');
                    if (!expandableContent || !expandArrow) return;
                    const isExpanded = expandableContent.style.display !== 'none';
                    if (isExpanded) {
                        expandableContent.style.display = 'none';
                        expandArrow.innerHTML = '▶';
                        expandArrow.classList.remove('expanded');
                        this.textContent = 'view';
                    } else {
                        expandableContent.style.display = 'block';
                        expandArrow.innerHTML = '▼';
                        expandArrow.classList.add('expanded');
                        this.textContent = 'hide';
                        // Populate content as in expand arrow logic
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                        setTimeout(() => {
                            createPieCharts(rowIndex);
                            populateInputFields(rowIndex);
                            populateArtistsList(rowIndex);
                            populateTitlesList(rowIndex);
                            populateIsrcsList(rowIndex);
                            populateIswcList(rowIndex);
                            addSplitButtonListeners(rowIndex);
                            
                            // Add split total listeners for real-time updates
                            const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
                            const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
                            
                            if (writerContainer) {
                                addSplitTotalListeners(writerContainer, rowIndex);
                            }
                            if (publisherContainer) {
                                addSplitTotalListeners(publisherContainer, rowIndex);
                            }
                        }, 100);
                    }
                });
                
                splitTypeContainer.appendChild(inputContainer);
                splitTypeContainer.appendChild(viewText);
                
                // Add lock icon
                const lockIcon = document.createElement('img');
                lockIcon.src = 'Rego Icons/lock.svg';
                lockIcon.style.width = '16px';
                lockIcon.style.height = '16px';
                lockIcon.style.marginLeft = '20px';
                lockIcon.style.cursor = 'pointer';
                lockIcon.alt = 'Lock';
                lockIcon.title = 'Lock';
                
                // Add click event to toggle lock state
                lockIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (this.src.includes('lock.svg')) {
                        this.src = 'Rego Icons/lockblack.svg';
                        this.title = 'Unlocked';
                    } else {
                        this.src = 'Rego Icons/lock.svg';
                        this.title = 'Locked';
                    }
                });
                
                splitTypeContainer.appendChild(lockIcon);
                row.appendChild(splitTypeContainer);

                // Keep view/hide text in sync with expand arrow
                row.addEventListener('expand-toggle', function(e) {
                    const expandableContent = row.nextElementSibling;
                    if (expandableContent && expandableContent.style.display !== 'none') {
                        viewText.textContent = 'hide';
                    } else {
                        viewText.textContent = 'view';
                    }
                });
            }
        }
        
        // Add both the row and its expandable content to the container
        rowsContainer.appendChild(row);
        rowsContainer.appendChild(expandableContent);
    }
    
    // Add click event listeners for expand arrows
    const expandArrows = document.querySelectorAll('.expand-arrow');
    console.log('Found', expandArrows.length, 'expand arrows');
    expandArrows.forEach(arrow => {
        arrow.addEventListener('click', function() {
            console.log('Expand arrow clicked');
            const currentRow = this.closest('.registration-row');
            const expandableContent = currentRow.nextElementSibling;
            
            if (expandableContent.classList.contains('expandable-content')) {
                const isExpanded = expandableContent.style.display !== 'none';
                
                if (isExpanded) {
                    // Collapse
                    expandableContent.style.display = 'none';
                    this.innerHTML = '▶';
                    this.classList.remove('expanded');
                } else {
                    // Expand
                    expandableContent.style.display = 'block';
                    this.innerHTML = '▼';
                    this.classList.add('expanded');
                    
                    // Create pie charts for this row
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    setTimeout(() => {
                        createPieCharts(rowIndex);
                        // Always populate when expanding, using stored split type if available
                        populateInputFields(rowIndex);
                        // Populate artists list
                        populateArtistsList(rowIndex);
                        // Populate titles list
                        populateTitlesList(rowIndex);
                        // Populate ISRCs list
                        populateIsrcsList(rowIndex);
                        // Populate ISWC list
                        populateIswcList(rowIndex);
                        
                        // Add event listeners for the buttons
                        addSplitButtonListeners(rowIndex);
                        
                        // Add split total listeners for real-time updates
                        const expandableContent = currentRow.nextElementSibling;
                        const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
                        const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
                        
                        if (writerContainer) {
                            addSplitTotalListeners(writerContainer, rowIndex);
                        }
                        if (publisherContainer) {
                            addSplitTotalListeners(publisherContainer, rowIndex);
                        }
                    }, 100); // Small delay to ensure DOM is ready
                }
                // Dispatch event to sync view/hide text
                currentRow.dispatchEvent(new Event('expand-toggle'));
            }
        });
    });
    
    // Add click event listeners to make rows selectable
    const allRows = document.querySelectorAll('.registration-row');
    allRows.forEach(row => {
        row.addEventListener('click', function() {
            // Remove selected class from all rows
            allRows.forEach(r => r.classList.remove('selected'));
            // Add selected class to clicked row
            this.classList.add('selected');
        });
    });
    
    console.log('All rows generated successfully');
    
    // Expand the first row only on initial page load
    if (isInitialLoad) {
        const firstRow = rowsContainer.querySelector('.registration-row');
        if (firstRow) {
            const firstExpandableContent = firstRow.nextElementSibling;
            const firstExpandArrow = firstRow.querySelector('.expand-arrow');
            
            if (firstExpandableContent && firstExpandableContent.classList.contains('expandable-content') && firstExpandArrow) {
                firstExpandableContent.style.display = 'block';
                firstExpandArrow.innerHTML = '▼';
                firstExpandArrow.classList.add('expanded');
                
                // Set the view text to 'hide' for the first row
                const firstViewText = firstRow.querySelector('.view-text');
                if (firstViewText) {
                    firstViewText.textContent = 'hide';
                }
                
                // Create pie charts for the first row
                setTimeout(() => {
                    createPieCharts(0);
                    populateInputFields(0);
                    populateArtistsList(0);
                    populateTitlesList(0);
                    populateIsrcsList(0);
                    populateIswcList(0);
                    addSplitButtonListeners(0);
                    
                    // Add split total listeners for real-time updates
                    const writerContainer = firstExpandableContent.querySelector('.additional-fields:first-child');
                    const publisherContainer = firstExpandableContent.querySelector('.additional-fields:last-child');
                    
                    if (writerContainer) {
                        addSplitTotalListeners(writerContainer, 0);
                    }
                    if (publisherContainer) {
                        addSplitTotalListeners(publisherContainer, 0);
                    }
                }, 100); // Small delay to ensure DOM is ready
            }
        }
        
        // Set flag to false after initial load
        isInitialLoad = false;
    }
}

// Function to save user data when they modify fields
function saveUserData(rowIndex, expandableContent) {
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    const userData = {
        hasUserModifications: true,
        writers: [],
        publishers: []
    };
    
    // Save writer data
    if (writerContainer) {
        const writerRows = writerContainer.querySelectorAll('.additional-field-row');
        writerRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
                userData.writers.push({
                    name: inputs[0].value,
                    ipi: inputs[1].value,
                    share: inputs[2].value
                });
            }
        });
    }
    
    // Save publisher data
    if (publisherContainer) {
        const publisherRows = publisherContainer.querySelectorAll('.additional-field-row');
        publisherRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
                userData.publishers.push({
                    name: inputs[0].value,
                    ipi: inputs[1].value,
                    share: inputs[2].value
                });
            }
        });
    }
    
    userSplitData[rowIndex] = userData;
    console.log('Saved user data for row', rowIndex, ':', userData);
}

// Function to restore user data
function restoreUserData(rowIndex, expandableContent) {
    const userData = userSplitData[rowIndex];
    if (!userData || !userData.hasUserModifications) {
        console.log('No user data to restore for row', rowIndex);
        return;
    }
    
    console.log('Restoring user data for row', rowIndex, ':', userData);
    
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    // Clear existing fields first
    if (writerContainer) {
        clearAllInputFields(writerContainer, 'writer');
    }
    if (publisherContainer) {
        clearAllInputFields(publisherContainer, 'publisher');
    }
    
    // Restore writer data
    if (writerContainer && userData.writers.length > 0) {
        userData.writers.forEach((writer, index) => {
            if (index === 0) {
                // First writer goes in the existing row
                const existingRow = writerContainer.querySelector('.additional-field-row');
                if (existingRow) {
                    const inputs = existingRow.querySelectorAll('input');
                    if (inputs.length >= 3) {
                        inputs[0].value = writer.name;
                        inputs[1].value = writer.ipi;
                        inputs[2].value = writer.share;
                    }
                }
            } else {
                // Additional writers need new rows
                addAdditionalRow(writerContainer, writer.name, writer.ipi, writer.share, 'writer');
            }
        });
    }
    
    // Restore publisher data
    if (publisherContainer && userData.publishers.length > 0) {
        userData.publishers.forEach((publisher, index) => {
            if (index === 0) {
                // First publisher goes in the existing row
                const existingRow = publisherContainer.querySelector('.additional-field-row');
                if (existingRow) {
                    const inputs = existingRow.querySelectorAll('input');
                    if (inputs.length >= 3) {
                        inputs[0].value = publisher.name;
                        inputs[1].value = publisher.ipi;
                        inputs[2].value = publisher.share;
                    }
                }
            } else {
                // Additional publishers need new rows
                addAdditionalRow(publisherContainer, publisher.name, publisher.ipi, publisher.share, 'publisher');
            }
        });
    }
    
    // Update split totals
    updateSplitTotalsInRealTime(rowIndex);
    
    // Manage scrollbars
    if (writerContainer) {
        manageScrollbars(writerContainer);
    }
    if (publisherContainer) {
        manageScrollbars(publisherContainer);
    }
}

// Function to save current row data before regenerating
function saveCurrentRowData() {
    const savedData = {};
    const rows = document.querySelectorAll('.registration-row');
    
    rows.forEach((row, rowIndex) => {
        savedData[rowIndex] = {};
        const inputs = row.querySelectorAll('input');
        
        inputs.forEach((input, inputIndex) => {
            savedData[rowIndex][inputIndex] = input.value;
        });
    });
    
    return savedData;
}

// Function to check if rows being removed contain data
function checkForDataInRows(rowsToRemove) {
    const rows = document.querySelectorAll('.registration-row');
    const totalRows = rows.length;
    
    // Check the last N rows (the ones that will be removed)
    for (let i = totalRows - rowsToRemove; i < totalRows; i++) {
        const row = rows[i];
        const inputs = row.querySelectorAll('input');
        
        for (let input of inputs) {
            if (input.value.trim() !== '' && input.value !== '0') {
                return true; // Found data in a row that will be removed
            }
        }
    }
    
    return false; // No data found in rows that will be removed
}

// Function to check if a row has data
function rowHasData(row) {
    const inputs = row.querySelectorAll('input');
    for (let input of inputs) {
        if (input.value.trim() !== '' && input.value !== '0') {
            return true;
        }
    }
    return false;
}



// Function to apply imported data to a row
function applyImportedData(song, targetRow, mode = 'replace') {
    const inputs = targetRow.querySelectorAll('input');
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
    if (inputs.length >= 5) {
        if (mode === 'replace') {
            // Replace all data
            inputs[0].value = song.artistName; // Artist
            inputs[1].value = song.songTitle;  // Work Title
            inputs[2].value = song.ISWC;   // ISWC
            inputs[3].value = song.ISRC;   // ISRC
            inputs[4].value = song.splitType; // Split Type
            
            // Replace all data in database
            if (!registrationDatabase.rows[rowIndex]) {
                registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
            }
            registrationDatabase.rows[rowIndex].artists = [song.artistName];
            registrationDatabase.rows[rowIndex].titles = [song.songTitle];
            registrationDatabase.rows[rowIndex].isrcs = [song.ISRC];
            registrationDatabase.rows[rowIndex].iswc = [song.ISWC];
            
        } else if (mode === 'merge') {
            // Merge data - only fill empty fields
            if (!inputs[0].value.trim()) inputs[0].value = song.artistName;
            if (!inputs[1].value.trim()) inputs[1].value = song.songTitle;
            if (!inputs[2].value.trim()) inputs[2].value = song.ISWC;
            if (!inputs[3].value.trim()) inputs[3].value = song.ISRC;
            if (inputs[4].value === '0' || !inputs[4].value.trim()) inputs[4].value = song.splitType;
            
            // Add data to database if not already present
            if (!registrationDatabase.rows[rowIndex]) {
                registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
            }
            if (!registrationDatabase.rows[rowIndex].artists.includes(song.artistName)) {
                registrationDatabase.rows[rowIndex].artists.push(song.artistName);
            }
            if (!registrationDatabase.rows[rowIndex].titles.includes(song.songTitle)) {
                registrationDatabase.rows[rowIndex].titles.push(song.songTitle);
            }
            if (!registrationDatabase.rows[rowIndex].isrcs.includes(song.ISRC)) {
                registrationDatabase.rows[rowIndex].isrcs.push(song.ISRC);
            }
            if (!registrationDatabase.rows[rowIndex].iswc.includes(song.ISWC)) {
                registrationDatabase.rows[rowIndex].iswc.push(song.ISWC);
            }
        }
        
        // Update "+ more" visibility
        const artistWrapper = targetRow.querySelector('.custom-input-wrapper');
        if (artistWrapper && artistWrapper.updateMoreArtists) {
            artistWrapper.updateMoreArtists();
        }
        
        // Update lists in expanded view
        populateArtistsList(rowIndex);
        populateTitlesList(rowIndex);
        populateIsrcsList(rowIndex);
        populateIswcList(rowIndex);
    }
}

function showImportPopup() {
    console.log('showImportPopup called');
    
    // Remove existing popup if any
    const existingPopup = document.querySelector('.import-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'import-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '5px';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    popup.style.zIndex = '1000';
    popup.style.minWidth = '300px';
    
    // Generate song options dynamically
    let songOptionsHTML = '';
    songDatabase.forEach((song, index) => {
        songOptionsHTML += `
            <div class="song-option" data-song="${index}" style="padding: 10px; border: 1px solid #ddd; margin-bottom: 5px; cursor: pointer; border-radius: 3px;">
                <strong>${song.songTitle}</strong><br>
                <small>Artist: ${song.artistName} | Split Type: ${song.splitType}</small>
            </div>
        `;
    });
    
    popup.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 15px;">Select a Title to Import</h3>
        <div style="margin-bottom: 15px; max-height: 300px; overflow-y: auto;">
            ${songOptionsHTML}
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="close-popup" style="padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
            <button id="ok-button" style="padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; opacity: 0.5;" disabled>Okay</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    let selectedSongIndex = null;
    const okButton = popup.querySelector('#ok-button');
    
    // Add event listeners for song selection
    const songOptions = popup.querySelectorAll('.song-option');
    songOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove highlight from all options
            songOptions.forEach(opt => {
                opt.style.backgroundColor = '';
                opt.style.borderColor = '#ddd';
            });
            
            // Highlight selected option
            this.style.backgroundColor = '#e3f2fd';
            this.style.borderColor = '#007bff';
            
            // Enable OK button
            selectedSongIndex = parseInt(this.getAttribute('data-song'));
            okButton.style.opacity = '1';
            okButton.disabled = false;
        });
    });
    
    // Add event listener for OK button
    okButton.addEventListener('click', function() {
        if (selectedSongIndex !== null) {
            const song = songDatabase[selectedSongIndex];
            
            // Find the selected row (row with selected class or active state)
            let targetRow = document.querySelector('.registration-row.selected');
            
            // If no row is selected, use the first row as fallback
            if (!targetRow) {
                targetRow = document.querySelector('.registration-row');
            }
            
            if (targetRow) {
                // Show data selection popup
                showDataSelectionPopup(song, targetRow);
            }
        }
        
        // Close popup
        popup.remove();
    });
    
    // Add event listener for close button
    const closeButton = popup.querySelector('#close-popup');
    closeButton.addEventListener('click', function() {
        popup.remove();
    });
    
    // Close popup on overlay click
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Function to show add artist popup
function showAddArtistPopup(currentRow, onArtistAdded = null, pendingChanges = null, fillInputCallback = null) {
    console.log('showAddArtistPopup called');
    
    // Remove existing popup if any
    const existingPopup = document.querySelector('.add-artist-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'add-artist-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '5px';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    popup.style.zIndex = '1000';
    popup.style.minWidth = '300px';
    
    popup.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 15px;">Add New Artist</h3>
        <div style="margin-bottom: 15px;">
            <label for="new-artist-name" style="display: block; margin-bottom: 5px;">Artist Name:</label>
            <input type="text" id="new-artist-name" placeholder="Enter artist name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="cancel-add-artist" style="padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
            <button id="save-add-artist" style="padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Add</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Function to save the artist
    const saveArtist = function() {
        const artistName = document.getElementById('new-artist-name').value.trim();
        if (artistName && currentRow) {
            if (pendingChanges) {
                // Add to pending changes instead of database
                if (!pendingChanges.addedArtists.includes(artistName)) {
                    pendingChanges.addedArtists.push(artistName);
                    console.log('Artist added to pending changes:', artistName);
                }
            } else {
                // Fallback to direct database addition (for backward compatibility)
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                if (!registrationDatabase.rows[rowIndex]) {
                    registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                }
                
                if (!registrationDatabase.rows[rowIndex].artists.includes(artistName)) {
                    registrationDatabase.rows[rowIndex].artists.push(artistName);
                    
                    // Update "+ more" visibility
                    const artistWrapper = currentRow.querySelector('.custom-input-wrapper');
                    if (artistWrapper && artistWrapper.updateMoreArtists) {
                        artistWrapper.updateMoreArtists();
                    }
                    
                    console.log('Artist added to database:', artistName, 'to row', rowIndex);
                }
                
                // Update artists list in expanded view
                populateArtistsList(rowIndex);
            }
            
            // Call the callback function if provided (to refresh popup list)
            if (onArtistAdded) {
                onArtistAdded(artistName);
            }
            
            // Call the fill input callback if provided
            if (fillInputCallback) {
                fillInputCallback(artistName);
            }
        }
        popup.remove();
    };
    
    // Add event listeners
    document.getElementById('cancel-add-artist').addEventListener('click', function() {
        popup.remove();
    });
    
    document.getElementById('save-add-artist').addEventListener('click', saveArtist);
    
    // Add return key functionality
    const artistInput = document.getElementById('new-artist-name');
    artistInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveArtist();
        }
    });
    
    // Focus the input field
    artistInput.focus();
    
    // Close popup on overlay click
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Function to show more artists popup
function showMoreArtistsPopup(artistName, existingPendingChanges = null, currentRow) {
    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.position = 'fixed';
    popupOverlay.style.top = '0';
    popupOverlay.style.left = '0';
    popupOverlay.style.width = '100%';
    popupOverlay.style.height = '100%';
    popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popupOverlay.style.display = 'flex';
    popupOverlay.style.justifyContent = 'center';
    popupOverlay.style.alignItems = 'center';
    popupOverlay.style.zIndex = '1000';
    
    // Find the current row and get its artists
    if (!currentRow) {
        currentRow = document.querySelector('.registration-row.selected') || 
                    document.querySelector('.registration-row');
    }
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
    const rowData = registrationDatabase.rows[rowIndex];
    const allArtists = rowData ? rowData.artists : [];
    
    // Track changes for this popup session
    let pendingChanges = existingPendingChanges;
    
    // If no existing pending changes, create new ones
    if (!pendingChanges) {
        pendingChanges = {
            deletedArtists: [],
            addedArtists: [],
            editedArtists: {},
            newMainArtist: null,
            originalArtists: [...allArtists],
            originalMainArtist: artistName
        };
    }
    
    // Function to check if there are pending changes
    const hasPendingChanges = () => {
        return pendingChanges.deletedArtists.length > 0 || 
               pendingChanges.addedArtists.length > 0 || 
               Object.keys(pendingChanges.editedArtists).length > 0 ||
               pendingChanges.newMainArtist !== null;
    };
    
    // Function to apply pending changes
    const applyPendingChanges = () => {
        // Apply deletions
        pendingChanges.deletedArtists.forEach(artistToDelete => {
            const index = registrationDatabase.rows[rowIndex].artists.indexOf(artistToDelete);
            if (index > -1) {
                registrationDatabase.rows[rowIndex].artists.splice(index, 1);
            }
        });
        
        // Apply additions
        pendingChanges.addedArtists.forEach(artistToAdd => {
            if (!registrationDatabase.rows[rowIndex].artists.includes(artistToAdd)) {
                registrationDatabase.rows[rowIndex].artists.push(artistToAdd);
            }
        });
        
        // Apply edits
        Object.keys(pendingChanges.editedArtists).forEach(oldName => {
            const newName = pendingChanges.editedArtists[oldName];
            const index = registrationDatabase.rows[rowIndex].artists.indexOf(oldName);
            if (index > -1) {
                registrationDatabase.rows[rowIndex].artists[index] = newName;
            }
        });
        
        // Apply new main artist
        if (pendingChanges.newMainArtist) {
            const artistInputField = currentRow.querySelector('.artist-input-container input');
            if (artistInputField) {
                artistInputField.value = pendingChanges.newMainArtist;
            }
        }
        
        // Update all "+ more" text visibility
        const allArtistWrappers = document.querySelectorAll('.custom-input-wrapper');
        allArtistWrappers.forEach(wrapper => {
            if (wrapper.updateMoreArtists) {
                wrapper.updateMoreArtists();
            }
        });
        
        // Update artists list in expanded view
        populateArtistsList(rowIndex);
    };
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.backgroundColor = 'white';
    popupContent.style.padding = '30px';
    popupContent.style.borderRadius = '8px';
    popupContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    popupContent.style.maxWidth = '400px';
    popupContent.style.width = '90%';
    
    // Create artist list HTML
    let artistListHTML = '';
    const currentArtists = allArtists.filter(artist => !pendingChanges.deletedArtists.includes(artist));
    const allDisplayArtists = [...currentArtists, ...pendingChanges.addedArtists];
    const currentMainArtist = pendingChanges.newMainArtist || artistName;
    
    allDisplayArtists.forEach((artist, index) => {
        // Check if this artist has been edited
        const isEdited = pendingChanges.editedArtists[artist];
        const displayName = isEdited || artist;
        const isCurrentArtist = displayName === currentMainArtist;
        const isPendingAdded = pendingChanges.addedArtists.includes(artist);
        
        artistListHTML += `
            <div class="artist-item" data-artist-index="${index}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: ${isCurrentArtist ? '#f0f8ff' : '#fff'}; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${displayName}</strong>
                    ${isCurrentArtist ? '<span style="color: #007bff; font-size: 12px;"> (main artist)</span>' : ''}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="edit-artist-btn" data-artist-index="${index}" data-artist-name="${artist}" style="background: #28a745; color: white; border: none; border-radius: 3px; padding: 4px 8px; font-size: 10px; cursor: pointer;">Edit</button>
                    <button class="delete-artist-btn" data-artist-index="${index}" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 4px 8px; font-size: 10px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
    });
    
    popupContent.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Artists in Registration Row ${rowIndex + 1}</h3>
        <div style="margin-bottom: 20px; max-height: 300px; overflow-y: auto;">
            ${artistListHTML}
        </div>
        <div style="margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="newArtistInput" placeholder="Enter new artist" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                <button id="addNewArtistBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Add</button>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
            <div style="display: flex; gap: 15px;">
                <span id="changeMainArtist" style="color: #28a745; cursor: pointer; font-size: 14px; text-decoration: underline;">Change Main Artist</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="cancelMoreArtists" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="saveMoreArtists" style="padding: 10px 20px; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Save</button>
            </div>
        </div>
    `;
    
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Add event listeners for edit buttons
    const editButtons = popupOverlay.querySelectorAll('.edit-artist-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const artistIndex = parseInt(this.getAttribute('data-artist-index'));
            const currentArtistName = this.getAttribute('data-artist-name');
            const isCurrentArtist = currentArtistName === artistName;
            
            // Create edit popup
            const editPopup = document.createElement('div');
            editPopup.className = 'popup-overlay';
            editPopup.style.position = 'fixed';
            editPopup.style.top = '0';
            editPopup.style.left = '0';
            editPopup.style.width = '100%';
            editPopup.style.height = '100%';
            editPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            editPopup.style.display = 'flex';
            editPopup.style.justifyContent = 'center';
            editPopup.style.alignItems = 'center';
            editPopup.style.zIndex = '1001';
            
            editPopup.innerHTML = `
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
                    <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Edit Artist Name</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Artist Name:</label>
                        <input type="text" id="editArtistName" value="${currentArtistName}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                        <button id="cancelEdit" style="padding: 10px 20px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                        <button id="saveEdit" style="padding: 10px 20px; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Edit</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(editPopup);
            
            // Focus on the input
            const editInput = document.getElementById('editArtistName');
            editInput.focus();
            editInput.select();
            
            // Function to save the edit
            const saveEdit = function() {
                const newArtistName = editInput.value.trim();
                if (newArtistName && newArtistName !== currentArtistName) {
                    // Add to pending edits
                    pendingChanges.editedArtists[currentArtistName] = newArtistName;
                    console.log(`Artist "${currentArtistName}" will be renamed to "${newArtistName}" when saved`);
                    
                    // If this was the current artist, update the input field
                    if (isCurrentArtist) {
                        const artistInputField = currentRow.querySelector('.artist-input-container input');
                        if (artistInputField) {
                            artistInputField.value = newArtistName;
                        }
                    }
                    
                    // Close the edit popup
                    document.body.removeChild(editPopup);
                    
                    // Refresh the main popup with updated list
                    document.body.removeChild(popupOverlay);
                    showMoreArtistsPopup(artistName, pendingChanges, currentRow);
                    
                } else if (newArtistName === currentArtistName) {
                    document.body.removeChild(editPopup);
                }
            };
            
            // Add return key functionality
            editInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                }
            });
            
            // Add event listeners for edit popup
            document.getElementById('cancelEdit').addEventListener('click', function() {
                document.body.removeChild(editPopup);
            });
            
            document.getElementById('saveEdit').addEventListener('click', saveEdit);
            
            // Close edit popup on overlay click
            editPopup.addEventListener('click', function(e) {
                if (e.target === editPopup) {
                    document.body.removeChild(editPopup);
                }
            });
        });
    });
    
    // Add event listeners for delete buttons
    const deleteButtons = popupOverlay.querySelectorAll('.delete-artist-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const artistIndex = parseInt(this.getAttribute('data-artist-index'));
            const artistToDelete = allDisplayArtists[artistIndex];
            const currentMainArtist = pendingChanges.newMainArtist || artistName;
            
            if (confirm(`Are you sure you want to delete "${artistToDelete}"?`)) {
                // Check if it's a pending added artist
                if (pendingChanges.addedArtists.includes(artistToDelete)) {
                    // Remove from pending additions
                    const addIndex = pendingChanges.addedArtists.indexOf(artistToDelete);
                    if (addIndex > -1) {
                        pendingChanges.addedArtists.splice(addIndex, 1);
                    }
                } else {
                    // Add to pending deletions
                    pendingChanges.deletedArtists.push(artistToDelete);
                }
                
                // Check if the current main artist is being deleted
                if (artistToDelete === currentMainArtist) {
                    // Get remaining artists after deletion
                    const remainingArtists = allDisplayArtists.filter(artist => 
                        artist !== artistToDelete && 
                        !pendingChanges.deletedArtists.includes(artist) &&
                        !pendingChanges.addedArtists.includes(artist)
                    );
                    
                    if (remainingArtists.length > 0) {
                        // Prompt user to select a new main artist
                        showNewMainArtistSelection(remainingArtists, pendingChanges, currentRow);
                        return; // Don't refresh the popup yet, wait for selection
                    } else {
                        // No artists left, clear the main artist
                        pendingChanges.newMainArtist = null;
                    }
                }
                
                // Refresh the popup to show updated list
                document.body.removeChild(popupOverlay);
                showMoreArtistsPopup(artistName, pendingChanges, currentRow);
            }
        });
    });
    
    // Add event listeners for artist items (to change main artist)
    const artistItems = popupOverlay.querySelectorAll('.artist-item');
    artistItems.forEach(item => {
        // Remove click functionality - users can only change main artist via "Change Main Artist" button
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = this.querySelector('strong').textContent.includes('✓') ? '#f0f8ff' : '#fff';
        });
    });
    
    // Add event listeners
    try {
        document.getElementById('addArtistFromPopup').addEventListener('click', function() {
            // Create a callback function to refresh the popup list
            const refreshPopupList = function(newArtistName) {
                // Close the current popup and reopen it to show the new artist
                document.body.removeChild(popupOverlay);
                showMoreArtistsPopup(pendingChanges.originalMainArtist, pendingChanges, currentRow);
            };
            
            showAddArtistPopup(currentRow, refreshPopupList, pendingChanges);
        });
    } catch (e) {
        // Element doesn't exist anymore, ignore the error
        console.log('addArtistFromPopup element not found, skipping old event listener');
    }
    
    document.getElementById('changeMainArtist').addEventListener('click', function() {
        // Create a new popup to select the new main artist
        const selectPopup = document.createElement('div');
        selectPopup.className = 'popup-overlay';
        selectPopup.style.position = 'fixed';
        selectPopup.style.top = '0';
        selectPopup.style.left = '0';
        selectPopup.style.width = '100%';
        selectPopup.style.height = '100%';
        selectPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        selectPopup.style.display = 'flex';
        selectPopup.style.justifyContent = 'center';
        selectPopup.style.alignItems = 'center';
        selectPopup.style.zIndex = '1001';
        
        // Create artist selection HTML (excluding deleted artists, including pending changes)
        let artistSelectionHTML = '';
        const allDisplayArtists = [...currentArtists, ...pendingChanges.addedArtists];
        
        allDisplayArtists.forEach((artist, index) => {
            // Check if this artist has been edited
            const isEdited = pendingChanges.editedArtists[artist];
            const displayName = isEdited || artist;
            
            artistSelectionHTML += `
                <div class="artist-selection-item" data-artist="${artist}" data-display-name="${displayName}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fff; cursor: pointer; text-align: center;">
                    <strong>${displayName}</strong>
                </div>
            `;
        });
        
        selectPopup.innerHTML = `
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
                <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Select New Main Artist</h3>
                <p style="margin-bottom: 20px; color: #666;">Please select which artist should be the main artist for this registration:</p>
                <div style="margin-bottom: 20px;">
                    ${artistSelectionHTML}
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="cancelSelection" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(selectPopup);
        
        // Add event listeners for artist selection
        const artistItems = selectPopup.querySelectorAll('.artist-selection-item');
        artistItems.forEach(item => {
            item.addEventListener('click', function() {
                const selectedArtist = this.getAttribute('data-artist');
                const displayName = this.getAttribute('data-display-name');
                
                // Set pending new main artist to the display name (edited version if applicable)
                pendingChanges.newMainArtist = displayName;
                
                console.log(`New main artist selected: "${displayName}" (original: "${selectedArtist}")`);
                
                // Close the selection popup
                document.body.removeChild(selectPopup);
                
                // Refresh the main popup with updated list
                document.body.removeChild(popupOverlay);
                showMoreArtistsPopup(pendingChanges.originalMainArtist, pendingChanges, currentRow);
            });
            
            // Add hover effect
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#fff';
            });
        });
        
        // Add cancel button event listener
        selectPopup.querySelector('#cancelSelection').addEventListener('click', function() {
            document.body.removeChild(selectPopup);
        });
        
        // Close selection popup on overlay click
        selectPopup.addEventListener('click', function(e) {
            if (e.target === selectPopup) {
                // Same behavior as cancel button
                if (pendingChanges) {
                    document.body.removeChild(selectPopup);
                    
                    const existingPopup = document.querySelector('.popup-overlay');
                    if (existingPopup) {
                        document.body.removeChild(existingPopup);
                    }
                    showMoreArtistsPopup(pendingChanges.originalMainArtist, pendingChanges, currentRow);
                } else {
                    // Restore the original main artist that was deleted
                    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                    if (registrationDatabase.rows[rowIndex] && registrationDatabase.rows[rowIndex].artists.length > 0) {
                        // Get the first artist from the database (the one that was deleted)
                        const originalMainArtist = registrationDatabase.rows[rowIndex].artists[0];
                        
                        // Restore the original main artist to the input field
                        const artistInput = currentRow.querySelector('.artist-input-container input');
                        if (artistInput) {
                            artistInput.value = originalMainArtist;
                        }
                        
                        // Update "+ more" visibility
                        const artistWrapper = currentRow.querySelector('.custom-input-wrapper');
                        if (artistWrapper && artistWrapper.updateMoreArtists) {
                            artistWrapper.updateMoreArtists();
                        }
                        
                        console.log(`Original main artist restored: "${originalMainArtist}"`);
                    }
                    
                    document.body.removeChild(selectPopup);
                }
            }
        });
    });
    
    document.getElementById('cancelMoreArtists').addEventListener('click', function() {
        if (hasPendingChanges()) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel? All changes will be lost.')) {
                document.body.removeChild(popupOverlay);
            }
        } else {
            document.body.removeChild(popupOverlay);
        }
    });
    
    document.getElementById('saveMoreArtists').addEventListener('click', function() {
        if (hasPendingChanges()) {
            applyPendingChanges();
            console.log('Changes applied successfully');
        }
        document.body.removeChild(popupOverlay);
    });
    
    // Close on overlay click
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            if (hasPendingChanges()) {
                if (confirm('You have unsaved changes. Are you sure you want to close? All changes will be lost.')) {
                    document.body.removeChild(popupOverlay);
                }
            } else {
                document.body.removeChild(popupOverlay);
            }
        }
    });
    
    // Add event listeners for inline add functionality
    document.getElementById('addNewArtistBtn').addEventListener('click', function() {
        const newArtistInput = document.getElementById('newArtistInput');
        const newArtistName = newArtistInput.value.trim();
        
        if (newArtistName) {
            // Add to pending changes
            if (!pendingChanges.addedArtists.includes(newArtistName)) {
                pendingChanges.addedArtists.push(newArtistName);
                console.log('Artist added to pending changes:', newArtistName);
                
                // Clear the input
                newArtistInput.value = '';
                
                // Refresh the popup to show the new artist
                document.body.removeChild(popupOverlay);
                showMoreArtistsPopup(pendingChanges.originalMainArtist, pendingChanges, currentRow);
            } else {
                alert('This artist already exists.');
            }
        } else {
            alert('Please enter an artist name.');
        }
    });
    
    // Add Enter key support for the new artist input
    document.getElementById('newArtistInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('addNewArtistBtn').click();
        }
    });
}

// Function to show new main artist selection popup
function showNewMainArtistSelection(remainingArtists, pendingChanges, currentRow) {
    // Create popup overlay
    const selectionPopup = document.createElement('div');
    selectionPopup.className = 'popup-overlay';
    selectionPopup.style.position = 'fixed';
    selectionPopup.style.top = '0';
    selectionPopup.style.left = '0';
    selectionPopup.style.width = '100%';
    selectionPopup.style.height = '100%';
    selectionPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    selectionPopup.style.display = 'flex';
    selectionPopup.style.justifyContent = 'center';
    selectionPopup.style.alignItems = 'center';
    selectionPopup.style.zIndex = '1002';
    
    // Create artist selection HTML
    let artistSelectionHTML = '';
    remainingArtists.forEach((artist, index) => {
        artistSelectionHTML += `
            <div class="artist-selection-item" data-artist="${artist}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fff; cursor: pointer; text-align: center; transition: background-color 0.2s;">
                <strong>${artist}</strong>
            </div>
        `;
    });
    
    // Create button HTML
    const buttonHTML = `
        <div style="display: flex; justify-content: flex-end;">
            <button id="cancelMainArtistSelection" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
        </div>
    `;
    
    selectionPopup.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
            <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Select New Main Artist</h3>
            <p style="margin-bottom: 20px; color: #666;">The current main artist has been deleted. Please select a new main artist from the remaining artists:</p>
            <div style="margin-bottom: 20px;">
                ${artistSelectionHTML}
            </div>
            ${buttonHTML}
        </div>
    `;
    
    document.body.appendChild(selectionPopup);
    
    // Add event listeners for artist selection
    const artistItems = selectionPopup.querySelectorAll('.artist-selection-item');
    artistItems.forEach(item => {
        item.addEventListener('click', function() {
            const selectedArtist = this.getAttribute('data-artist');
            
            if (pendingChanges) {
                // Set pending new main artist
                pendingChanges.newMainArtist = selectedArtist;
                
                console.log(`New main artist selected after deletion: "${selectedArtist}"`);
                
                // Close the selection popup
                document.body.removeChild(selectionPopup);
                
                // Refresh the main popup with updated list
                const existingPopup = document.querySelector('.popup-overlay');
                if (existingPopup) {
                    document.body.removeChild(existingPopup);
                }
                showMoreArtistsPopup(pendingChanges.originalMainArtist, pendingChanges, currentRow);
            } else {
                // Direct database update (from input event)
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                if (registrationDatabase.rows[rowIndex]) {
                    // Set the selected artist as the main artist (first in the array)
                    registrationDatabase.rows[rowIndex].artists = [selectedArtist, ...remainingArtists.filter(a => a !== selectedArtist)];
                    
                    // Update the input field
                    const artistInput = currentRow.querySelector('.artist-input-container input');
                    if (artistInput) {
                        artistInput.value = selectedArtist;
                    }
                    
                    // Update "+ more" visibility
                    const artistWrapper = currentRow.querySelector('.custom-input-wrapper');
                    if (artistWrapper && artistWrapper.updateMoreArtists) {
                        artistWrapper.updateMoreArtists();
                    }
                    
                    console.log(`New main artist set directly: "${selectedArtist}"`);
                }
                
                // Close the selection popup
                document.body.removeChild(selectionPopup);
            }
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#fff';
        });
    });
    

    
    // Add cancel button event listener
    selectionPopup.querySelector('#cancelMainArtistSelection').addEventListener('click', function() {
        if (pendingChanges) {
            // If user cancels, we'll still delete the artist but won't set a new main artist
            document.body.removeChild(selectionPopup);
            
            // Refresh the main popup with updated list
            const existingPopup = document.querySelector('.popup-overlay');
            if (existingPopup) {
                document.body.removeChild(existingPopup);
            }
            showMoreArtistsPopup(pendingChanges.originalMainArtist, pendingChanges, currentRow);
        } else {
            // Restore the original main artist that was deleted
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
            if (registrationDatabase.rows[rowIndex] && registrationDatabase.rows[rowIndex].artists.length > 0) {
                // Get the first artist from the database (the one that was deleted)
                const originalMainArtist = registrationDatabase.rows[rowIndex].artists[0];
                
                // Restore the original main artist to the input field
                const artistInput = currentRow.querySelector('.artist-input-container input');
                if (artistInput) {
                    artistInput.value = originalMainArtist;
                }
                
                // Update "+ more" visibility
                const artistWrapper = currentRow.querySelector('.custom-input-wrapper');
                if (artistWrapper && artistWrapper.updateMoreArtists) {
                    artistWrapper.updateMoreArtists();
                }
                
                console.log(`Original main artist restored: "${originalMainArtist}"`);
            }
            
            // Close the selection popup
            document.body.removeChild(selectionPopup);
        }
    });
    
    // Close selection popup on overlay click
    selectionPopup.addEventListener('click', function(e) {
        if (e.target === selectionPopup) {
            // Same behavior as cancel button
            if (pendingChanges) {
                document.body.removeChild(selectionPopup);
                
                const existingPopup = document.querySelector('.popup-overlay');
                if (existingPopup) {
                    document.body.removeChild(existingPopup);
                }
                showMoreArtistsPopup(pendingChanges.originalMainArtist, pendingChanges, currentRow);
            } else {
                // Restore the original main artist that was deleted
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                if (registrationDatabase.rows[rowIndex] && registrationDatabase.rows[rowIndex].artists.length > 0) {
                    // Get the first artist from the database (the one that was deleted)
                    const originalMainArtist = registrationDatabase.rows[rowIndex].artists[0];
                    
                    // Restore the original main artist to the input field
                    const artistInput = currentRow.querySelector('.artist-input-container input');
                    if (artistInput) {
                        artistInput.value = originalMainArtist;
                    }
                    
                    // Update "+ more" visibility
                    const artistWrapper = currentRow.querySelector('.custom-input-wrapper');
                    if (artistWrapper && artistWrapper.updateMoreArtists) {
                        artistWrapper.updateMoreArtists();
                    }
                    
                    console.log(`Original main artist restored: "${originalMainArtist}"`);
                }
                
                document.body.removeChild(selectionPopup);
            }
        }
    });
    
    // Manage scrollbars for all expandable content after generating rows
    const allExpandableContent = document.querySelectorAll('.expandable-content');
    allExpandableContent.forEach(expandableContent => {
        const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
        const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
        
        if (writerContainer) {
            manageScrollbars(writerContainer);
        }
        if (publisherContainer) {
            manageScrollbars(publisherContainer);
        }
    });
}

// Add focus/blur listeners to registration row inputs
function addInputFocusListeners() {
    const allInputs = document.querySelectorAll('.registration-row input');
    allInputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Remove .input-selected from all inputs
            allInputs.forEach(i => i.classList.remove('input-selected'));
            // Add to this input
            this.classList.add('input-selected');
            lastFocusedInput = this;
        });
        input.addEventListener('blur', function() {
            // Only remove if popup is not open
            if (!document.querySelector('.import-popup') && !document.querySelector('.add-artist-popup') && !document.querySelector('.popup-overlay')) {
                this.classList.remove('input-selected');
            }
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - advanced version');
    
    const input = document.querySelector('.registration-count-input');
    const arrowUp = document.querySelector('.arrow-up');
    const arrowDown = document.querySelector('.arrow-down');
    
    console.log('Elements found:', { input, arrowUp, arrowDown });
    
    // Add click event listener to "Import Title" text
    const importTitleText = document.querySelector('.import-title-text');
    console.log('Import Title element found:', importTitleText);
    if (importTitleText) {
        importTitleText.addEventListener('click', showImportPopup);
        console.log('Event listener attached to Import Title');
    }
    
    if (input && arrowUp && arrowDown) {
        // Arrow functionality
        arrowUp.addEventListener('click', function() {
            const currentValue = parseInt(input.value) || 0;
            input.value = currentValue + 1;
            generateRows(currentValue + 1);
        });
        
        
        arrowDown.addEventListener('click', function() {
            const currentValue = parseInt(input.value) || 0;
            if (currentValue > 1) {
                input.value = currentValue - 1;
                generateRows(currentValue - 1);
            }
        });
        
        // Input change - only trigger on Enter key press
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission if this is in a form
                const value = parseInt(input.value) || 0;
                if (value >= 1) {
                    generateRows(value);
                } else {
                    // If invalid value, reset to minimum of 1
                    input.value = 1;
                    generateRows(1);
                }
            }
        });
        
        // Also trigger on blur (when user clicks away from input)
        input.addEventListener('blur', function() {
            const value = parseInt(input.value) || 0;
            if (value >= 1) {
                generateRows(value);
            } else {
                // If invalid value, reset to minimum of 1
                input.value = 1;
                generateRows(1);
            }
        });
    } else {
        console.error('Required elements not found!');
    }
    
    // Initial generation
    const initialValue = parseInt(input.value) || 1;
    console.log('Generating initial rows with value:', initialValue);
    generateRows(initialValue);
});

console.log('Advanced JS file loaded');


function showMoreTitlesPopup(titleName, existingPendingChanges = null, currentRow) {
    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.position = 'fixed';
    popupOverlay.style.top = '0';
    popupOverlay.style.left = '0';
    popupOverlay.style.width = '100%';
    popupOverlay.style.height = '100%';
    popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popupOverlay.style.display = 'flex';
    popupOverlay.style.justifyContent = 'center';
    popupOverlay.style.alignItems = 'center';
    popupOverlay.style.zIndex = '1000';
    
    // Find the current row and get its titles
    if (!currentRow) {
        currentRow = document.querySelector('.registration-row.selected') || 
                    document.querySelector('.registration-row');
    }
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
    const rowData = registrationDatabase.rows[rowIndex];
    const allTitles = rowData ? (rowData.titles || []) : [];
    
    // Track changes for this popup session
    let pendingChanges = existingPendingChanges;
    
    // If no existing pending changes, create new ones
    if (!pendingChanges) {
        pendingChanges = {
            deletedTitles: [],
            addedTitles: [],
            editedTitles: {},
            newMainTitle: null,
            originalTitles: [...allTitles],
            originalMainTitle: titleName
        };
    }
    
    // Function to check if there are pending changes
    const hasPendingChanges = () => {
        return pendingChanges.deletedTitles.length > 0 || 
               pendingChanges.addedTitles.length > 0 || 
               Object.keys(pendingChanges.editedTitles).length > 0 ||
               pendingChanges.newMainTitle !== null;
    };
    
    // Function to apply pending changes
    const applyPendingChanges = () => {
        // Apply deletions
        pendingChanges.deletedTitles.forEach(titleToDelete => {
            const index = registrationDatabase.rows[rowIndex].titles.indexOf(titleToDelete);
            if (index > -1) {
                registrationDatabase.rows[rowIndex].titles.splice(index, 1);
            }
        });
        
        // Apply additions
        pendingChanges.addedTitles.forEach(titleToAdd => {
            if (!registrationDatabase.rows[rowIndex].titles.includes(titleToAdd)) {
                registrationDatabase.rows[rowIndex].titles.push(titleToAdd);
            }
        });
        
        // Apply edits
        Object.keys(pendingChanges.editedTitles).forEach(oldName => {
            const newName = pendingChanges.editedTitles[oldName];
            const index = registrationDatabase.rows[rowIndex].titles.indexOf(oldName);
            if (index > -1) {
                registrationDatabase.rows[rowIndex].titles[index] = newName;
            }
        });
        
        // Apply new main title
        if (pendingChanges.newMainTitle) {
            const titleInputField = currentRow.querySelector('.title-input-container input');
            if (titleInputField) {
                titleInputField.value = pendingChanges.newMainTitle;
            }
        }
        
        // Update all "+ more" text visibility
        const allTitleWrappers = document.querySelectorAll('.custom-title-input-wrapper');
        allTitleWrappers.forEach(wrapper => {
            if (wrapper.updateMoreTitles) {
                wrapper.updateMoreTitles();
            }
        });
        
        // Update titles list in expanded view
        populateTitlesList(rowIndex);
    };
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.backgroundColor = 'white';
    popupContent.style.padding = '30px';
    popupContent.style.borderRadius = '8px';
    popupContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    popupContent.style.maxWidth = '400px';
    popupContent.style.width = '90%';
    
    // Create title list HTML
    let titleListHTML = '';
    const currentTitles = allTitles.filter(title => !pendingChanges.deletedTitles.includes(title));
    const allDisplayTitles = [...currentTitles, ...pendingChanges.addedTitles];
    const currentMainTitle = pendingChanges.newMainTitle || titleName;
    
    allDisplayTitles.forEach((title, index) => {
        // Check if this title has been edited
        const isEdited = pendingChanges.editedTitles[title];
        const displayName = isEdited || title;
        const isCurrentTitle = displayName === currentMainTitle;
        const isPendingAdded = pendingChanges.addedTitles.includes(title);
        
        titleListHTML += `
            <div class="title-item" data-title-index="${index}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: ${isCurrentTitle ? '#f0f8ff' : '#fff'}; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${displayName}</strong>
                    ${isCurrentTitle ? '<span style="color: #007bff; font-size: 12px;"> (main title)</span>' : ''}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="edit-title-btn" data-title-index="${index}" data-title-name="${title}" style="background: #28a745; color: white; border: none; border-radius: 3px; padding: 4px 8px; font-size: 10px; cursor: pointer;">Edit</button>
                    <button class="delete-title-btn" data-title-index="${index}" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 4px 8px; font-size: 10px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
    });
    
    popupContent.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Titles in Registration Row ${rowIndex + 1}</h3>
        <div style="margin-bottom: 20px; max-height: 300px; overflow-y: auto;">
            ${titleListHTML}
        </div>
        <div style="margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="newTitleInput" placeholder="Enter new title" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                <button id="addNewTitleBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Add</button>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
            <div style="display: flex; gap: 15px;">
                <span id="changeMainTitle" style="color: #28a745; cursor: pointer; font-size: 14px; text-decoration: underline;">Change Main Title</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="cancelMoreTitles" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="saveMoreTitles" style="padding: 10px 20px; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Save</button>
            </div>
        </div>
    `;
    
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Add event listeners for edit buttons
    const editButtons = popupOverlay.querySelectorAll('.edit-title-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const titleIndex = parseInt(this.getAttribute('data-title-index'));
            const currentTitleName = this.getAttribute('data-title-name');
            const isCurrentTitle = currentTitleName === titleName;
            
            // Create edit popup
            const editPopup = document.createElement('div');
            editPopup.className = 'popup-overlay';
            editPopup.style.position = 'fixed';
            editPopup.style.top = '0';
            editPopup.style.left = '0';
            editPopup.style.width = '100%';
            editPopup.style.height = '100%';
            editPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            editPopup.style.display = 'flex';
            editPopup.style.justifyContent = 'center';
            editPopup.style.alignItems = 'center';
            editPopup.style.zIndex = '1001';
            
            editPopup.innerHTML = `
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
                    <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Edit Title Name</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Title Name:</label>
                        <input type="text" id="editTitleName" value="${currentTitleName}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                        <button id="cancelEdit" style="padding: 10px 20px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                        <button id="saveEdit" style="padding: 10px 20px; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Edit</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(editPopup);
            
            // Focus on the input
            const editInput = document.getElementById('editTitleName');
            editInput.focus();
            editInput.select();
            
            // Function to save the edit
            const saveEdit = function() {
                const newTitleName = editInput.value.trim();
                if (newTitleName && newTitleName !== currentTitleName) {
                    // Add to pending edits
                    pendingChanges.editedTitles[currentTitleName] = newTitleName;
                    console.log(`Title "${currentTitleName}" will be renamed to "${newTitleName}" when saved`);
                    
                    // If this was the current title, update the input field
                    if (isCurrentTitle) {
                        const titleInputField = currentRow.querySelector('.title-input-container input');
                        if (titleInputField) {
                            titleInputField.value = newTitleName;
                        }
                    }
                    
                    // Close the edit popup
                    document.body.removeChild(editPopup);
                    
                    // Refresh the main popup with updated list
                    document.body.removeChild(popupOverlay);
                    showMoreTitlesPopup(titleName, pendingChanges, currentRow);
                    
                } else if (newTitleName === currentTitleName) {
                    document.body.removeChild(editPopup);
                }
            };
            
            // Add return key functionality
            editInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                }
            });
            
            // Add event listeners for edit popup
            document.getElementById('cancelEdit').addEventListener('click', function() {
                document.body.removeChild(editPopup);
            });
            
            document.getElementById('saveEdit').addEventListener('click', saveEdit);
            
            // Close edit popup on overlay click
            editPopup.addEventListener('click', function(e) {
                if (e.target === editPopup) {
                    document.body.removeChild(editPopup);
                }
            });
        });
    });
    
    // Add event listeners for delete buttons
    const deleteButtons = popupOverlay.querySelectorAll('.delete-title-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const titleIndex = parseInt(this.getAttribute('data-title-index'));
            const titleToDelete = allDisplayTitles[titleIndex];
            const currentMainTitle = pendingChanges.newMainTitle || titleName;
            
            if (confirm(`Are you sure you want to delete "${titleToDelete}"?`)) {
                // Check if it's a pending added title
                if (pendingChanges.addedTitles.includes(titleToDelete)) {
                    // Remove from pending additions
                    const addIndex = pendingChanges.addedTitles.indexOf(titleToDelete);
                    if (addIndex > -1) {
                        pendingChanges.addedTitles.splice(addIndex, 1);
                    }
                } else {
                    // Add to pending deletions
                    pendingChanges.deletedTitles.push(titleToDelete);
                }
                
                // Check if the current main title is being deleted
                if (titleToDelete === currentMainTitle) {
                    // Get remaining titles after deletion
                    const remainingTitles = allDisplayTitles.filter(title => 
                        title !== titleToDelete && 
                        !pendingChanges.deletedTitles.includes(title) &&
                        !pendingChanges.addedTitles.includes(title)
                    );
                    
                    if (remainingTitles.length > 0) {
                        // Prompt user to select a new main title
                        showNewMainTitleSelection(remainingTitles, pendingChanges, currentRow, true);
                        return; // Don't refresh the popup yet, wait for selection
                    } else {
                        // No titles left, clear the main title
                        pendingChanges.newMainTitle = null;
                    }
                }
                
                // Refresh the popup to show updated list
                document.body.removeChild(popupOverlay);
                showMoreTitlesPopup(titleName, pendingChanges, currentRow);
            }
        });
    });
    
    // Add event listeners for title items (to change main title)
    const titleItems = popupOverlay.querySelectorAll('.title-item');
    titleItems.forEach(item => {
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = this.querySelector('strong').textContent.includes('✓') ? '#f0f8ff' : '#fff';
        });
    });
    
    // Add event listeners
    try {
        document.getElementById('addTitleFromPopup').addEventListener('click', function() {
            // Create a callback function to refresh the popup list
            const refreshPopupList = function(newTitleName) {
                // Close the current popup and reopen it to show the new title
                document.body.removeChild(popupOverlay);
                showMoreTitlesPopup(pendingChanges.originalMainTitle, pendingChanges, currentRow);
            };
            
            showAddTitlePopup(currentRow, refreshPopupList, pendingChanges);
        });
    } catch (e) {
        // Element doesn't exist anymore, ignore the error
        console.log('addTitleFromPopup element not found, skipping old event listener');
    }
    
    document.getElementById('changeMainTitle').addEventListener('click', function() {
        // Create a new popup to select the new main title
        const selectPopup = document.createElement('div');
        selectPopup.className = 'popup-overlay';
        selectPopup.style.position = 'fixed';
        selectPopup.style.top = '0';
        selectPopup.style.left = '0';
        selectPopup.style.width = '100%';
        selectPopup.style.height = '100%';
        selectPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        selectPopup.style.display = 'flex';
        selectPopup.style.justifyContent = 'center';
        selectPopup.style.alignItems = 'center';
        selectPopup.style.zIndex = '1001';
        
        // Create title selection HTML (excluding deleted titles, including pending changes)
        let titleSelectionHTML = '';
        const allDisplayTitles = [...currentTitles, ...pendingChanges.addedTitles];
        
        allDisplayTitles.forEach((title, index) => {
            // Check if this title has been edited
            const isEdited = pendingChanges.editedTitles[title];
            const displayName = isEdited || title;
            
            titleSelectionHTML += `
                <div class="title-selection-item" data-title="${title}" data-display-name="${displayName}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fff; cursor: pointer; text-align: center;">
                    <strong>${displayName}</strong>
                </div>
            `;
        });
        
        selectPopup.innerHTML = `
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
                <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Select New Main Title</h3>
                <p style="margin-bottom: 20px; color: #666;">Please select which title should be the main title for this registration:</p>
                <div style="margin-bottom: 20px;">
                    ${titleSelectionHTML}
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="cancelSelection" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(selectPopup);
        
        // Add event listeners for title selection
        const titleItems = selectPopup.querySelectorAll('.title-selection-item');
        titleItems.forEach(item => {
            item.addEventListener('click', function() {
                const selectedTitle = this.getAttribute('data-title');
                const displayName = this.getAttribute('data-display-name');
                
                // Set pending new main title to the display name (edited version if applicable)
                pendingChanges.newMainTitle = displayName;
                
                console.log(`New main title selected: "${displayName}" (original: "${selectedTitle}")`);
                
                // Close the selection popup
                document.body.removeChild(selectPopup);
                
                // Refresh the main popup with updated list
                document.body.removeChild(popupOverlay);
                showMoreTitlesPopup(pendingChanges.originalMainTitle, pendingChanges, currentRow);
            });
            
            // Add hover effect
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#fff';
            });
        });
        
        // Add cancel button event listener
        selectPopup.querySelector('#cancelSelection').addEventListener('click', function() {
            document.body.removeChild(selectPopup);
        });
        
        // Close selection popup on overlay click
        selectPopup.addEventListener('click', function(e) {
            if (e.target === selectPopup) {
                document.body.removeChild(selectPopup);
            }
        });
    });
    
    document.getElementById('cancelMoreTitles').addEventListener('click', function() {
        if (hasPendingChanges()) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel? All changes will be lost.')) {
                document.body.removeChild(popupOverlay);
            }
        } else {
            document.body.removeChild(popupOverlay);
        }
    });
    
    document.getElementById('saveMoreTitles').addEventListener('click', function() {
        if (hasPendingChanges()) {
            applyPendingChanges();
            console.log('Changes applied successfully');
        }
        document.body.removeChild(popupOverlay);
    });
    
    // Close on overlay click
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            if (hasPendingChanges()) {
                if (confirm('You have unsaved changes. Are you sure you want to close? All changes will be lost.')) {
                    document.body.removeChild(popupOverlay);
                }
            } else {
                document.body.removeChild(popupOverlay);
            }
        }
    });
    
    // Add event listeners for inline add functionality
    const addNewTitleBtn = popupOverlay.querySelector('#addNewTitleBtn');
    const newTitleInput = popupOverlay.querySelector('#newTitleInput');
    
    if (addNewTitleBtn && newTitleInput) {
        addNewTitleBtn.addEventListener('click', function() {
            const newTitleName = newTitleInput.value.trim();
            if (newTitleName) {
                if (!pendingChanges.addedTitles.includes(newTitleName)) {
                    pendingChanges.addedTitles.push(newTitleName);
                    console.log('Title added to pending changes:', newTitleName);
                    
                    // Clear the input
                    newTitleInput.value = '';
                    
                    // Refresh the popup to show the new title
                    document.body.removeChild(popupOverlay);
                    showMoreTitlesPopup(pendingChanges.originalMainTitle, pendingChanges, currentRow);
                } else {
                    alert('This title already exists.');
                }
            } else {
                alert('Please enter a title name.');
            }
        });
        
        newTitleInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                addNewTitleBtn.click();
            }
        });
    }
}

// Function to show new main title selection
function showNewMainTitleSelection(remainingTitles, pendingChanges, currentRow) {
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
    
    // Create popup overlay
    const selectionPopup = document.createElement('div');
    selectionPopup.className = 'popup-overlay';
    selectionPopup.style.position = 'fixed';
    selectionPopup.style.top = '0';
    selectionPopup.style.left = '0';
    selectionPopup.style.width = '100%';
    selectionPopup.style.height = '100%';
    selectionPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    selectionPopup.style.display = 'flex';
    selectionPopup.style.justifyContent = 'center';
    selectionPopup.style.alignItems = 'center';
    selectionPopup.style.zIndex = '1001';
    
    // Generate title selection HTML
    let titleSelectionHTML = '';
    remainingTitles.forEach((title, index) => {
        titleSelectionHTML += `
            <div class="title-selection-item" data-title="${title}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fff; cursor: pointer; text-align: center;">
                <strong>${title}</strong>
            </div>
        `;
    });
    
    selectionPopup.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
            <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Select New Main Title</h3>
            <p style="margin-bottom: 20px; color: #666;">Please select which title should be the main title for this registration:</p>
            <div style="margin-bottom: 20px;">
                ${titleSelectionHTML}
            </div>
            <div style="display: flex; justify-content: flex-end;">
                <button id="cancelTitleSelection" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(selectionPopup);
    
    // Add event listeners for title selection
    const titleItems = selectionPopup.querySelectorAll('.title-selection-item');
    titleItems.forEach(item => {
        item.addEventListener('click', function() {
            const selectedTitle = this.getAttribute('data-title');
            
            if (pendingChanges) {
                // Set pending new main title
                pendingChanges.newMainTitle = selectedTitle;
                
                console.log(`New main title selected after deletion: "${selectedTitle}"`);
                
                // Close the selection popup
                document.body.removeChild(selectionPopup);
                
                // Refresh the main popup with updated list
                const existingPopup = document.querySelector('.popup-overlay');
                if (existingPopup) {
                    document.body.removeChild(existingPopup);
                }
                showMoreTitlesPopup(pendingChanges.originalMainTitle, pendingChanges, currentRow);
            } else {
                // Direct database update (from input event)
                // Reorder titles to put selected title first
                registrationDatabase.rows[rowIndex].titles = [selectedTitle, ...remainingTitles.filter(t => t !== selectedTitle)];
                
                // Update the input field
                const titleInput = currentRow.querySelector('.title-input-container input');
                if (titleInput) {
                    titleInput.value = selectedTitle;
                    titleInput.setAttribute('data-previous-value', selectedTitle);
                }
                
                // Update "+ more" visibility
                const titleWrapper = currentRow.querySelector('.custom-title-input-wrapper');
                if (titleWrapper && titleWrapper.updateMoreTitles) {
                    titleWrapper.updateMoreTitles();
                }
                
                console.log(`New main title set directly: "${selectedTitle}"`);
                
                // Close the selection popup
                document.body.removeChild(selectionPopup);
            }
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#fff';
        });
    });
    
    // Add event listener for leave blank button
    if (showLeaveBlank) {
        const leaveBlankButton = selectionPopup.querySelector('#leave-blank');
        leaveBlankButton.addEventListener('click', function() {
            if (pendingChanges) {
                // For popup-based edits, just close without setting a new main title
                document.body.removeChild(selectionPopup);
                
                // Refresh the main popup with updated list
                const existingPopup = document.querySelector('.popup-overlay');
                if (existingPopup) {
                    document.body.removeChild(existingPopup);
                }
                showMoreTitlesPopup(pendingChanges.originalMainTitle, pendingChanges, currentRow);
            } else {
                // For direct database updates, leave the input field empty
                const titleInput = currentRow.querySelector('.title-input-container input');
                if (titleInput) {
                    titleInput.value = '';
                    titleInput.removeAttribute('data-previous-value');
                }
                
                // Update "+ more" visibility
                const titleWrapper = currentRow.querySelector('.custom-title-input-wrapper');
                if (titleWrapper && titleWrapper.updateMoreTitles) {
                    titleWrapper.updateMoreTitles();
                }
                
                console.log('Main title left blank');
                
                // Close the selection popup
                document.body.removeChild(selectionPopup);
            }
        });
    }
    
    // Add cancel button event listener
    selectionPopup.querySelector('#cancelTitleSelection').addEventListener('click', function() {
        if (pendingChanges) {
            // If user cancels, we'll still delete the title but won't set a new main title
            document.body.removeChild(selectionPopup);
            
            // Refresh the main popup with updated list
            const existingPopup = document.querySelector('.popup-overlay');
            if (existingPopup) {
                document.body.removeChild(existingPopup);
            }
            showMoreTitlesPopup(pendingChanges.originalMainTitle, pendingChanges, currentRow);
        } else {
            // Restore the original main title that was deleted
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
            if (registrationDatabase.rows[rowIndex] && registrationDatabase.rows[rowIndex].titles.length > 0) {
                // Get the first title from the database (the one that was deleted)
                const originalMainTitle = registrationDatabase.rows[rowIndex].titles[0];
                
                // Restore the original main title to the input field
                const titleInput = currentRow.querySelector('.title-input-container input');
                if (titleInput) {
                    titleInput.value = originalMainTitle;
                }
                
                // Update "+ more" visibility
                const titleWrapper = currentRow.querySelector('.custom-title-input-wrapper');
                if (titleWrapper && titleWrapper.updateMoreTitles) {
                    titleWrapper.updateMoreTitles();
                }
                
                console.log(`Original main title restored: "${originalMainTitle}"`);
            }
            
            // Close the selection popup
            document.body.removeChild(selectionPopup);
        }
    });
    
    // Close selection popup on overlay click
    selectionPopup.addEventListener('click', function(e) {
        if (e.target === selectionPopup) {
            // Same behavior as cancel button
            if (pendingChanges) {
                document.body.removeChild(selectionPopup);
                
                const existingPopup = document.querySelector('.popup-overlay');
                if (existingPopup) {
                    document.body.removeChild(existingPopup);
                }
                showMoreTitlesPopup(pendingChanges.originalMainTitle, pendingChanges, currentRow);
            } else {
                // Restore the original main title that was deleted
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
                if (registrationDatabase.rows[rowIndex] && registrationDatabase.rows[rowIndex].titles.length > 0) {
                    // Get the first title from the database (the one that was deleted)
                    const originalMainTitle = registrationDatabase.rows[rowIndex].titles[0];
                    
                    // Restore the original main title to the input field
                    const titleInput = currentRow.querySelector('.title-input-container input');
                    if (titleInput) {
                        titleInput.value = originalMainTitle;
                    }
                    
                    // Update "+ more" visibility
                    const titleWrapper = currentRow.querySelector('.custom-title-input-wrapper');
                    if (titleWrapper && titleWrapper.updateMoreTitles) {
                        titleWrapper.updateMoreTitles();
                    }
                    
                    console.log(`Original main title restored: "${originalMainTitle}"`);
                }
                
                // Close the selection popup
                document.body.removeChild(selectionPopup);
            }
        }
    });
}

// Function to show add ISRC popup
function showAddIsrcPopup(currentRow, onIsrcAdded = null, pendingChanges = null, fillInputCallback = null) {
    console.log('showAddIsrcPopup called with currentRow:', currentRow);
    
    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.position = 'fixed';
    popupOverlay.style.top = '0';
    popupOverlay.style.left = '0';
    popupOverlay.style.width = '100%';
    popupOverlay.style.height = '100%';
    popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popupOverlay.style.display = 'flex';
    popupOverlay.style.justifyContent = 'center';
    popupOverlay.style.alignItems = 'center';
    popupOverlay.style.zIndex = '1000';
    
    // Determine button text based on context
    const buttonText = pendingChanges ? 'Add ISRC' : 'Save ISRC';
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.backgroundColor = 'white';
    popupContent.style.padding = '30px';
    popupContent.style.borderRadius = '8px';
    popupContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    popupContent.style.maxWidth = '400px';
    popupContent.style.width = '90%';
    
    popupContent.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Add New ISRC</h3>
        <p style="margin-bottom: 20px; color: #666;">Enter the ISRC you want to add:</p>
        <input type="text" id="new-isrc-input" placeholder="Enter ISRC" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; font-size: 14px;">
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="cancel-add-isrc" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
            <button id="save-isrc" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">${buttonText}</button>
        </div>
    `;
    
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Focus on input
    const isrcInput = popupContent.querySelector('#new-isrc-input');
    isrcInput.focus();
    
    // Save ISRC function
    const saveIsrc = function() {
        const isrcName = isrcInput.value.trim();
        
        if (isrcName) {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
            
            if (pendingChanges) {
                // If we have pending changes, add to pending instead of database
                if (!pendingChanges.addedIsrcs.includes(isrcName)) {
                    pendingChanges.addedIsrcs.push(isrcName);
                    console.log('ISRC added to pending changes:', isrcName);
                    
                    // Call callback to refresh the main popup
                    if (onIsrcAdded) {
                        onIsrcAdded(isrcName);
                    }
                }
            } else {
                // Direct database addition (when not called from main popup)
                if (!registrationDatabase.rows[rowIndex]) {
                    registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                }
                
                if (!registrationDatabase.rows[rowIndex].isrcs.includes(isrcName)) {
                    registrationDatabase.rows[rowIndex].isrcs.push(isrcName);
                    console.log('ISRC added to database:', isrcName, 'in row', rowIndex);
                    
                    // Call callback if provided
                    if (fillInputCallback) {
                        fillInputCallback(isrcName);
                    }
                    
                    // Update "+ more" visibility
                    const isrcWrapper = currentRow.querySelector('.custom-isrc-input-wrapper');
                    if (isrcWrapper && isrcWrapper.updateMoreIsrcs) {
                        isrcWrapper.updateMoreIsrcs();
                    }
                    
                    // Update ISRCs list in expanded view
                    populateIsrcsList(rowIndex);
                }
            }
            
            document.body.removeChild(popupOverlay);
        } else {
            alert('Please enter an ISRC.');
        }
    };
    
    // Add event listeners
    popupContent.querySelector('#save-isrc').addEventListener('click', saveIsrc);
    popupContent.querySelector('#cancel-add-isrc').addEventListener('click', function() {
        document.body.removeChild(popupOverlay);
    });
    
    // Enter key to save
    isrcInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveIsrc();
        }
    });
    
    // Close on overlay click
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            document.body.removeChild(popupOverlay);
        }
    });
}

// Function to show more ISRCs popup
function showMoreIsrcsPopup(isrcName, existingPendingChanges = null, currentRow) {
    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.position = 'fixed';
    popupOverlay.style.top = '0';
    popupOverlay.style.left = '0';
    popupOverlay.style.width = '100%';
    popupOverlay.style.height = '100%';
    popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popupOverlay.style.display = 'flex';
    popupOverlay.style.justifyContent = 'center';
    popupOverlay.style.alignItems = 'center';
    popupOverlay.style.zIndex = '1000';
    
    // Find the current row and get its ISRCs
    if (!currentRow) {
        currentRow = document.querySelector('.registration-row.selected') || 
                    document.querySelector('.registration-row');
    }
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
    const rowData = registrationDatabase.rows[rowIndex];
    const allIsrcs = rowData ? (rowData.isrcs || []) : [];
    
    // Track changes for this popup session
    let pendingChanges = existingPendingChanges;
    
    // If no existing pending changes, create new ones
    if (!pendingChanges) {
        pendingChanges = {
            deletedIsrcs: [],
            addedIsrcs: [],
            editedIsrcs: {},
            newMainIsrc: null,
            originalIsrcs: [...allIsrcs],
            originalMainIsrc: isrcName
        };
    }
    
    // Function to check if there are pending changes
    const hasPendingChanges = () => {
        return pendingChanges.deletedIsrcs.length > 0 || 
               pendingChanges.addedIsrcs.length > 0 || 
               Object.keys(pendingChanges.editedIsrcs).length > 0 ||
               pendingChanges.newMainIsrc !== null;
    };
    
    // Function to apply pending changes
    const applyPendingChanges = () => {
        // Apply deletions
        pendingChanges.deletedIsrcs.forEach(isrcToDelete => {
            const index = registrationDatabase.rows[rowIndex].isrcs.indexOf(isrcToDelete);
            if (index > -1) {
                registrationDatabase.rows[rowIndex].isrcs.splice(index, 1);
            }
        });
        
        // Apply additions
        pendingChanges.addedIsrcs.forEach(isrcToAdd => {
            if (!registrationDatabase.rows[rowIndex].isrcs.includes(isrcToAdd)) {
                registrationDatabase.rows[rowIndex].isrcs.push(isrcToAdd);
            }
        });
        
        // Apply edits
        Object.keys(pendingChanges.editedIsrcs).forEach(oldName => {
            const newName = pendingChanges.editedIsrcs[oldName];
            const index = registrationDatabase.rows[rowIndex].isrcs.indexOf(oldName);
            if (index > -1) {
                registrationDatabase.rows[rowIndex].isrcs[index] = newName;
            }
        });
        
        // Apply new main ISRC
        if (pendingChanges.newMainIsrc) {
            const isrcInputField = currentRow.querySelector('.isrc-input-container input');
            if (isrcInputField) {
                isrcInputField.value = pendingChanges.newMainIsrc;
            }
        }
        
        // Update all "+ more" text visibility
        const allIsrcWrappers = document.querySelectorAll('.custom-isrc-input-wrapper');
        allIsrcWrappers.forEach(wrapper => {
            if (wrapper.updateMoreIsrcs) {
                wrapper.updateMoreIsrcs();
            }
        });
        
        // Update ISRCs list in expanded view
        populateIsrcsList(rowIndex);
    };
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.backgroundColor = 'white';
    popupContent.style.padding = '30px';
    popupContent.style.borderRadius = '8px';
    popupContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    popupContent.style.maxWidth = '400px';
    popupContent.style.width = '90%';
    
    // Create ISRC list HTML
    let isrcListHTML = '';
    const currentIsrcs = allIsrcs.filter(isrc => !pendingChanges.deletedIsrcs.includes(isrc));
    const allDisplayIsrcs = [...currentIsrcs, ...pendingChanges.addedIsrcs];
    const currentMainIsrc = pendingChanges.newMainIsrc || isrcName;
    
    allDisplayIsrcs.forEach((isrc, index) => {
        // Check if this ISRC has been edited
        const isEdited = pendingChanges.editedIsrcs[isrc];
        const displayName = isEdited || isrc;
        const isCurrentIsrc = displayName === currentMainIsrc;
        const isPendingAdded = pendingChanges.addedIsrcs.includes(isrc);
        
        isrcListHTML += `
            <div class="isrc-item" data-isrc-index="${index}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: ${isCurrentIsrc ? '#f0f8ff' : '#fff'}; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${displayName}</strong>
                    ${isCurrentIsrc ? '<span style="color: #007bff; font-size: 12px;"> (main ISRC)</span>' : ''}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="edit-isrc-btn" data-isrc-index="${index}" data-isrc-name="${isrc}" style="background: #28a745; color: white; border: none; border-radius: 3px; padding: 4px 8px; font-size: 10px; cursor: pointer;">Edit</button>
                    <button class="delete-isrc-btn" data-isrc-index="${index}" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 4px 8px; font-size: 10px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
    });
    
    popupContent.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">ISRCs in Registration Row ${rowIndex + 1}</h3>
        <div style="margin-bottom: 20px; max-height: 300px; overflow-y: auto;">
            ${isrcListHTML}
        </div>
        <div style="margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="newIsrcInput" placeholder="Enter new ISRC" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                <button id="addNewIsrcBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Add</button>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
            <div style="display: flex; gap: 15px;">
                <span id="changeMainIsrc" style="color: #28a745; cursor: pointer; font-size: 14px; text-decoration: underline;">Change Main ISRC</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="cancelMoreIsrcs" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="saveMoreIsrcs" style="padding: 10px 20px; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Save</button>
            </div>
        </div>
    `;
    
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Add event listeners for edit buttons
    const editButtons = popupOverlay.querySelectorAll('.edit-isrc-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const isrcIndex = parseInt(this.getAttribute('data-isrc-index'));
            const currentIsrcName = this.getAttribute('data-isrc-name');
            const isCurrentIsrc = currentIsrcName === isrcName;
            
            // Create edit popup
            const editPopup = document.createElement('div');
            editPopup.className = 'popup-overlay';
            editPopup.style.position = 'fixed';
            editPopup.style.top = '0';
            editPopup.style.left = '0';
            editPopup.style.width = '100%';
            editPopup.style.height = '100%';
            editPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            editPopup.style.display = 'flex';
            editPopup.style.justifyContent = 'center';
            editPopup.style.alignItems = 'center';
            editPopup.style.zIndex = '1001';
            
            editPopup.innerHTML = `
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
                    <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Edit ISRC</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">ISRC:</label>
                        <input type="text" id="editIsrcName" value="${currentIsrcName}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                        <button id="cancelEdit" style="padding: 10px 20px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                        <button id="saveEdit" style="padding: 10px 20px; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Edit</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(editPopup);
            
            // Focus on the input
            const editInput = document.getElementById('editIsrcName');
            editInput.focus();
            editInput.select();
            
            // Function to save the edit
            const saveEdit = function() {
                const newIsrcName = editInput.value.trim();
                if (newIsrcName && newIsrcName !== currentIsrcName) {
                    // Add to pending edits
                    pendingChanges.editedIsrcs[currentIsrcName] = newIsrcName;
                    console.log(`ISRC "${currentIsrcName}" will be renamed to "${newIsrcName}" when saved`);
                    
                    // If this was the current ISRC, update the input field
                    if (isCurrentIsrc) {
                        const isrcInputField = currentRow.querySelector('.isrc-input-container input');
                        if (isrcInputField) {
                            isrcInputField.value = newIsrcName;
                        }
                    }
                    
                    // Close the edit popup
                    document.body.removeChild(editPopup);
                    
                    // Refresh the main popup with updated list
                    document.body.removeChild(popupOverlay);
                    showMoreIsrcsPopup(isrcName, pendingChanges, currentRow);
                    
                } else if (newIsrcName === currentIsrcName) {
                    document.body.removeChild(editPopup);
                }
            };
            
            // Add return key functionality
            editInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                }
            });
            
            // Add event listeners for edit popup
            document.getElementById('cancelEdit').addEventListener('click', function() {
                document.body.removeChild(editPopup);
            });
            
            document.getElementById('saveEdit').addEventListener('click', saveEdit);
            
            // Close edit popup on overlay click
            editPopup.addEventListener('click', function(e) {
                if (e.target === editPopup) {
                    document.body.removeChild(editPopup);
                }
            });
        });
    });
    
    // Add event listeners for delete buttons
    const deleteButtons = popupOverlay.querySelectorAll('.delete-isrc-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const isrcIndex = parseInt(this.getAttribute('data-isrc-index'));
            const isrcToDelete = allDisplayIsrcs[isrcIndex];
            const currentMainIsrc = pendingChanges.newMainIsrc || isrcName;
            
            if (confirm(`Are you sure you want to delete "${isrcToDelete}"?`)) {
                // Check if it's a pending added ISRC
                if (pendingChanges.addedIsrcs.includes(isrcToDelete)) {
                    // Remove from pending additions
                    const addIndex = pendingChanges.addedIsrcs.indexOf(isrcToDelete);
                    if (addIndex > -1) {
                        pendingChanges.addedIsrcs.splice(addIndex, 1);
                    }
                } else {
                    // Add to pending deletions
                    pendingChanges.deletedIsrcs.push(isrcToDelete);
                }
                
                // Check if the current main ISRC is being deleted
                if (isrcToDelete === currentMainIsrc) {
                    // Get remaining ISRCs after deletion
                    const remainingIsrcs = allDisplayIsrcs.filter(isrc => 
                        isrc !== isrcToDelete && 
                        !pendingChanges.deletedIsrcs.includes(isrc) &&
                        !pendingChanges.addedIsrcs.includes(isrc)
                    );
                    
                    if (remainingIsrcs.length > 0) {
                        // Prompt user to select a new main ISRC
                        showNewMainIsrcSelection(remainingIsrcs, pendingChanges, currentRow, true);
                        return; // Don't refresh the popup yet, wait for selection
                    } else {
                        // No ISRCs left, clear the main ISRC
                        pendingChanges.newMainIsrc = null;
                    }
                }
                
                // Refresh the popup to show updated list
                document.body.removeChild(popupOverlay);
                showMoreIsrcsPopup(isrcName, pendingChanges, currentRow);
            }
        });
    });
    
    // Add event listeners for ISRC items (to change main ISRC)
    const isrcItems = popupOverlay.querySelectorAll('.isrc-item');
    isrcItems.forEach(item => {
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = this.querySelector('strong').textContent.includes('✓') ? '#f0f8ff' : '#fff';
        });
    });
    
    // Add event listener for the addNewIsrcBtn button
    const addNewIsrcBtn = popupOverlay.querySelector('#addNewIsrcBtn');
    const newIsrcInput = popupOverlay.querySelector('#newIsrcInput');
    
    if (addNewIsrcBtn && newIsrcInput) {
        addNewIsrcBtn.addEventListener('click', function() {
            const newIsrcValue = newIsrcInput.value.trim();
            if (newIsrcValue) {
                // Add to pending changes
                pendingChanges.addedIsrcs.push(newIsrcValue);
                console.log(`New ISRC added: "${newIsrcValue}"`);
                
                // Clear the input
                newIsrcInput.value = '';
                
                // Refresh the popup to show the new ISRC in the list
                document.body.removeChild(popupOverlay);
                showMoreIsrcsPopup(isrcName, pendingChanges, currentRow);
            }
        });
        
        // Add Enter key functionality for the input
        newIsrcInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addNewIsrcBtn.click();
            }
        });
    }
    
    document.getElementById('changeMainIsrc').addEventListener('click', function() {
        // Create a new popup to select the new main ISRC
        const selectPopup = document.createElement('div');
        selectPopup.className = 'popup-overlay';
        selectPopup.style.position = 'fixed';
        selectPopup.style.top = '0';
        selectPopup.style.left = '0';
        selectPopup.style.width = '100%';
        selectPopup.style.height = '100%';
        selectPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        selectPopup.style.display = 'flex';
        selectPopup.style.justifyContent = 'center';
        selectPopup.style.alignItems = 'center';
        selectPopup.style.zIndex = '1001';
        
        // Create ISRC selection HTML (excluding deleted ISRCs, including pending changes)
        let isrcSelectionHTML = '';
        const allDisplayIsrcs = [...currentIsrcs, ...pendingChanges.addedIsrcs];
        
        allDisplayIsrcs.forEach((isrc, index) => {
            // Check if this ISRC has been edited
            const isEdited = pendingChanges.editedIsrcs[isrc];
            const displayName = isEdited || isrc;
            
            isrcSelectionHTML += `
                <div class="isrc-selection-item" data-isrc="${isrc}" data-display-name="${displayName}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fff; cursor: pointer; text-align: center;">
                    <strong>${displayName}</strong>
                </div>
            `;
        });
        
        selectPopup.innerHTML = `
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
                <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Select New Main ISRC</h3>
                <p style="margin-bottom: 20px; color: #666;">Please select which ISRC should be the main ISRC for this registration:</p>
                <div style="margin-bottom: 20px;">
                    ${isrcSelectionHTML}
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="cancelSelection" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(selectPopup);
        
        // Add event listeners for ISRC selection
        const isrcItems = selectPopup.querySelectorAll('.isrc-selection-item');
        isrcItems.forEach(item => {
            item.addEventListener('click', function() {
                const selectedIsrc = this.getAttribute('data-isrc');
                const displayName = this.getAttribute('data-display-name');
                
                // Set pending new main ISRC to the display name (edited version if applicable)
                pendingChanges.newMainIsrc = displayName;
                
                console.log(`New main ISRC selected: "${displayName}" (original: "${selectedIsrc}")`);
                
                // Close the selection popup
                document.body.removeChild(selectPopup);
                
                // Refresh the main popup with updated list
                document.body.removeChild(popupOverlay);
                showMoreIsrcsPopup(pendingChanges.originalMainIsrc, pendingChanges, currentRow);
            });
            
            // Add hover effect
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#fff';
            });
        });
        
        // Add cancel button event listener
        selectPopup.querySelector('#cancelSelection').addEventListener('click', function() {
            document.body.removeChild(selectPopup);
        });
        
        // Close selection popup on overlay click
        selectPopup.addEventListener('click', function(e) {
            if (e.target === selectPopup) {
                document.body.removeChild(selectPopup);
            }
        });
    });
    
    document.getElementById('cancelMoreIsrcs').addEventListener('click', function() {
        if (hasPendingChanges()) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel? All changes will be lost.')) {
                document.body.removeChild(popupOverlay);
            }
        } else {
            document.body.removeChild(popupOverlay);
        }
    });
    
    document.getElementById('saveMoreIsrcs').addEventListener('click', function() {
        if (hasPendingChanges()) {
            applyPendingChanges();
            console.log('Changes applied successfully');
        }
        document.body.removeChild(popupOverlay);
    });
    
    // Close on overlay click
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            if (hasPendingChanges()) {
                if (confirm('You have unsaved changes. Are you sure you want to close? All changes will be lost.')) {
                    document.body.removeChild(popupOverlay);
                }
            } else {
                document.body.removeChild(popupOverlay);
            }
        }
    });
}

// Function to show new main ISRC selection
function showNewMainIsrcSelection(remainingIsrcs, pendingChanges, currentRow, showLeaveBlank = true) {
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
    
    // Create popup overlay
    const selectionPopup = document.createElement('div');
    selectionPopup.className = 'popup-overlay';
    selectionPopup.style.position = 'fixed';
    selectionPopup.style.top = '0';
    selectionPopup.style.left = '0';
    selectionPopup.style.width = '100%';
    selectionPopup.style.height = '100%';
    selectionPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    selectionPopup.style.display = 'flex';
    selectionPopup.style.justifyContent = 'center';
    selectionPopup.style.alignItems = 'center';
    selectionPopup.style.zIndex = '1001';
    
    // Generate ISRC selection HTML
    let isrcSelectionHTML = '';
    remainingIsrcs.forEach((isrc, index) => {
        isrcSelectionHTML += `
            <div class="isrc-selection-item" data-isrc="${isrc}" style="padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fff; cursor: pointer; text-align: center;">
                <strong>${isrc}</strong>
            </div>
        `;
    });
    
    selectionPopup.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;">
            <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Select New Main ISRC</h3>
            <p style="margin-bottom: 20px; color: #666;">Please select which ISRC should be the main ISRC for this registration:</p>
            <div style="margin-bottom: 20px;">
                ${isrcSelectionHTML}
            </div>
            <div style="display: flex; justify-content: flex-end;">
                <button id="cancelIsrcSelection" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(selectionPopup);
    
    // Add event listeners for ISRC selection
    const isrcItems = selectionPopup.querySelectorAll('.isrc-selection-item');
    isrcItems.forEach(item => {
        item.addEventListener('click', function() {
            const selectedIsrc = this.getAttribute('data-isrc');
            
            // Reorder ISRCs to put selected ISRC first
            registrationDatabase.rows[rowIndex].isrcs = [selectedIsrc, ...remainingIsrcs.filter(i => i !== selectedIsrc)];
            
            // Update the input field
            const isrcInput = currentRow.querySelector('.isrc-input-container input');
            if (isrcInput) {
                isrcInput.value = selectedIsrc;
                isrcInput.setAttribute('data-previous-value', selectedIsrc);
            }
            
            // Update "+ more" visibility
            const isrcWrapper = currentRow.querySelector('.custom-isrc-input-wrapper');
            if (isrcWrapper && isrcWrapper.updateMoreIsrcs) {
                isrcWrapper.updateMoreIsrcs();
            }
            
            console.log(`New main ISRC selected: "${selectedIsrc}"`);
            document.body.removeChild(selectionPopup);
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#fff';
        });
    });
    
    // Add event listener for leave blank button
    if (showLeaveBlank) {
        const leaveBlankButton = selectionPopup.querySelector('#leave-blank');
        leaveBlankButton.addEventListener('click', function() {
            // Keep the ISRCs in the database but leave the input blank
            const isrcInput = currentRow.querySelector('.isrc-input-container input');
            if (isrcInput) {
                isrcInput.value = '';
                isrcInput.removeAttribute('data-previous-value');
            }
            
            // Update "+ more" visibility
            const isrcWrapper = currentRow.querySelector('.custom-isrc-input-wrapper');
            if (isrcWrapper && isrcWrapper.updateMoreIsrcs) {
                isrcWrapper.updateMoreIsrcs();
            }
            
            console.log('ISRC input left blank');
            document.body.removeChild(selectionPopup);
        });
    }
    
    // Add cancel button event listener
    selectionPopup.querySelector('#cancelIsrcSelection').addEventListener('click', function() {
        document.body.removeChild(selectionPopup);
    });
    
    // Close selection popup on overlay click
    selectionPopup.addEventListener('click', function(e) {
        if (e.target === selectionPopup) {
            document.body.removeChild(selectionPopup);
        }
    });
}

// Function to create pie charts for a specific row
function createPieCharts(rowIndex) {
    console.log('createPieCharts called for row:', rowIndex);
    
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) {
        console.log('Row not found for index:', rowIndex);
        return;
    }
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) {
        console.log('Expandable content not found for row:', rowIndex);
        return;
    }
    
    // Define the new color scheme
    const colors = ['#FF0000', '#87CEEB', '#000080', '#00FF00', '#FFFF00']; // Red, Light Blue, Navy Blue, Green, Yellow
    const unknownColor = '#808080'; // Grey for unknown portions
    
    // Create writer pie chart
    const writerCanvas = document.getElementById(`writer-pie-chart-${rowIndex}`);
    if (writerCanvas) {
        console.log('Creating writer pie chart for row:', rowIndex);
        const writerCtx = writerCanvas.getContext('2d');
        
        // Clear previous chart
        writerCtx.clearRect(0, 0, writerCanvas.width, writerCanvas.height);
        
        // Set canvas size to match container
        const container = writerCanvas.parentElement;
        writerCanvas.width = container.offsetWidth;
        writerCanvas.height = container.offsetHeight;
        
        // Collect writer data from input fields
        const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
        const writerData = [];
        
        if (writerContainer) {
            const writerRows = writerContainer.querySelectorAll('.additional-field-row');
            console.log('Found', writerRows.length, 'writer rows for row:', rowIndex);
            let colorIndex = 0;
            let totalShare = 0;
            
            writerRows.forEach((row, index) => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length >= 3) {
                    const name = inputs[0].value.trim();
                    const share = parseFloat(inputs[2].value) || 0;
                    
                    console.log('Writer row', index, 'name:', name, 'share:', share);
                    
                    if (share > 0) {
                        writerData.push({
                            label: name || `Writer ${index + 1}`,
                            value: share,
                            color: colors[colorIndex % colors.length]
                        });
                        totalShare += share;
                        colorIndex++;
                    }
                }
            });
            
            // Add unknown portion if total is less than 100
            if (totalShare < 100) {
                const unknownShare = 100 - totalShare;
                writerData.push({
                    label: 'Unknown',
                    value: unknownShare,
                    color: unknownColor
                });
            }
            
            console.log('Writer data for pie chart:', writerData);
        }
        
        if (writerData.length > 0) {
            drawPieChart(writerCtx, writerCanvas.width, writerCanvas.height, writerData);
            console.log('Writer pie chart drawn for row:', rowIndex);
        } else {
            console.log('No writer data to draw for row:', rowIndex);
        }
    } else {
        console.log('Writer canvas not found for row:', rowIndex);
    }
    
    // Create publisher pie chart
    const publisherCanvas = document.getElementById(`publisher-pie-chart-${rowIndex}`);
    if (publisherCanvas) {
        console.log('Creating publisher pie chart for row:', rowIndex);
        const publisherCtx = publisherCanvas.getContext('2d');
        
        // Clear previous chart
        publisherCtx.clearRect(0, 0, publisherCanvas.width, publisherCanvas.height);
        
        // Set canvas size to match container
        const container = publisherCanvas.parentElement;
        publisherCanvas.width = container.offsetWidth;
        publisherCanvas.height = container.offsetHeight;
        
        // Collect publisher data from input fields
        const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
        const publisherData = [];
        
        if (publisherContainer) {
            const publisherRows = publisherContainer.querySelectorAll('.additional-field-row');
            console.log('Found', publisherRows.length, 'publisher rows for row:', rowIndex);
            let colorIndex = 0;
            let totalShare = 0;
            
            publisherRows.forEach((row, index) => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length >= 3) {
                    const name = inputs[0].value.trim();
                    const share = parseFloat(inputs[2].value) || 0;
                    
                    console.log('Publisher row', index, 'name:', name, 'share:', share);
                    
                    if (share > 0) {
                        publisherData.push({
                            label: name || `Writer ${index + 1}`,
                            value: share,
                            color: colors[colorIndex % colors.length]
                        });
                        totalShare += share;
                        colorIndex++;
                    }
                }
            });
            
            // Add unknown portion if total is less than 100
            if (totalShare < 100) {
                const unknownShare = 100 - totalShare;
                publisherData.push({
                    label: 'Unknown',
                    value: unknownShare,
                    color: unknownColor
                });
            }
            
            console.log('Publisher data for pie chart:', publisherData);
        }
        
        if (publisherData.length > 0) {
            drawPieChart(publisherCtx, publisherCanvas.width, publisherCanvas.height, publisherData);
            console.log('Publisher pie chart drawn for row:', rowIndex);
        } else {
            console.log('No publisher data to draw for row:', rowIndex);
        }
    } else {
        console.log('Publisher canvas not found for row:', rowIndex);
    }
}

// Function to draw a pie chart
function drawPieChart(ctx, width, height, data) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    
    let total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start from the left (9 o'clock position) instead of top (12 o'clock)
    
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

// Utility to calculate split total for a splitDatabase entry
function calculateSplitTotal(split) {
    let total = 0;
    if (!split) return 0;
    if (split.writerShare) total += Number(split.writerShare);
    if (split.writerShare2) total += Number(split.writerShare2);
    if (split.publisherShare) total += Number(split.publisherShare);
    if (split.publisherShare2) total += Number(split.publisherShare2);
    return total;
}

// Utility to calculate writer split total for a splitDatabase entry
function calculateWriterSplitTotal(split) {
    let total = 0;
    if (!split) return 0;
    if (split.writerShare) total += Number(split.writerShare);
    if (split.writerShare2) total += Number(split.writerShare2);
    return total;
}

// Utility to calculate publisher split total for a splitDatabase entry
function calculatePublisherSplitTotal(split) {
    let total = 0;
    if (!split) return 0;
    if (split.publisherShare) total += Number(split.publisherShare);
    if (split.publisherShare2) total += Number(split.publisherShare2);
    return total;
}

// Function to populate input fields based on split type
function populateInputFields(rowIndex) {
    console.log('populateInputFields called for row:', rowIndex);
    console.log('splitDatabase:', splitDatabase);
    
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) {
        console.log('Row not found for index:', rowIndex);
        return;
    }
    
    // Get the split type from the registration row - look for the 5th input (split type)
    const allInputs = row.querySelectorAll('input');
    console.log('All inputs in registration row:', allInputs.length);
    
    if (allInputs.length < 5) {
        console.log('Not enough inputs in registration row');
        return;
    }
    
    const splitTypeInput = allInputs[4]; // 5th input (index 4) is the split type
    console.log('Split type input found:', splitTypeInput);
    console.log('Split type input value:', splitTypeInput.value);
    
    const splitType = parseInt(splitTypeInput.value) || 0;
    console.log('Split type value:', splitType);
    
    // Get the expandable content for this row
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) {
        console.log('Expandable content not found - will populate when expanded');
        return;
    }
    
    // Check if user has already modified this row's data
    const hasUserData = userSplitData[rowIndex] && userSplitData[rowIndex].hasUserModifications;
    
    if (splitType === 0) {
        console.log('Split type is 0, checking if fields need clearing');
        
        // Check if there are any existing input fields that need clearing
        const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
        const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
        
        let hasExistingFields = false;
        if (writerContainer) {
            const existingWriterRows = writerContainer.querySelectorAll('.additional-field-row');
            hasExistingFields = hasExistingFields || existingWriterRows.length > 0;
        }
        if (publisherContainer) {
            const existingPublisherRows = publisherContainer.querySelectorAll('.additional-field-row');
            hasExistingFields = hasExistingFields || existingPublisherRows.length > 0;
        }
        
        // Only clear if there are existing fields to clear and no user data
        if (hasExistingFields && !hasUserData) {
            console.log('Found existing fields, clearing them');
            if (writerContainer) {
                clearAllInputFields(writerContainer, 'writer');
            }
            
            if (publisherContainer) {
                clearAllInputFields(publisherContainer, 'publisher');
            }
        } else if (hasUserData) {
            console.log('User has modified data, preserving it');
            // Restore user data
            restoreUserData(rowIndex, expandableContent);
        } else {
            console.log('No existing fields to clear, skipping');
        }
        
                    // Update the split type and split total values in the bottom containers
        const splitTotalValues = expandableContent.querySelectorAll('.split-total-value');
        
        // Update dropdown value
        const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
        if (splitTypeDropdown) {
            splitTypeDropdown.value = '';
        }
        
        splitTotalValues.forEach(element => {
            element.textContent = '0';
        });
        
        console.log('Set split type/total to 0');
        return;
    }
    
    // If user has modified data, restore it instead of using default
    if (hasUserData) {
        console.log('User has modified data, restoring it');
        restoreUserData(rowIndex, expandableContent);
        return;
    }
    
    // Find the corresponding split data
    const splitData = splitDatabase.find(split => split.splitType === splitType);
    console.log('Split data found:', splitData);
    
    if (!splitData) {
        console.log('No split data found for split type:', splitType);
        return;
    }
    
    console.log('Expandable content found, proceeding to populate');
    
    // Clear existing input fields
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    console.log('Writer container found:', !!writerContainer);
    console.log('Publisher container found:', !!publisherContainer);
    
    if (writerContainer) {
        clearAndPopulateContainer(writerContainer, splitData, 'writer');
    }
    
    if (publisherContainer) {
        clearAndPopulateContainer(publisherContainer, splitData, 'publisher');
    }
    
    // Update the split type and split total values in the bottom containers
    const splitTotalValues = expandableContent.querySelectorAll('.split-total-value');
    
    // Update dropdown value
    const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
    if (splitTypeDropdown) {
        splitTypeDropdown.value = splitData.splitType;
    }
    
    // Update writer and publisher totals separately
    const writerTotal = calculateWriterSplitTotal(splitData);
    const publisherTotal = calculatePublisherSplitTotal(splitData);
    
    // Update the first split total (writer section)
    if (splitTotalValues[0]) {
        splitTotalValues[0].textContent = writerTotal;
    }
    
    // Update the second split total (publisher section)
    if (splitTotalValues[1]) {
        splitTotalValues[1].textContent = publisherTotal;
    }
    
    console.log('Updated split type to:', splitData.splitType, 'writer total to:', writerTotal, 'and publisher total to:', publisherTotal);
    
    // Manage scrollbars after populating the fields
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
        const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
        
        if (writerContainer) {
            manageScrollbars(writerContainer);
        }
        if (publisherContainer) {
            manageScrollbars(publisherContainer);
        }
    }
}

// Function to clear and populate a container with split data
function clearAndPopulateContainer(container, splitData, type) {
    console.log('clearAndPopulateContainer called for type:', type);
    console.log('Container:', container);
    
    // Get the middle-info-top container
    const middleInfoTop = container.querySelector('.middle-info-top');
    
    if (!middleInfoTop) {
        console.log('Middle info top container not found');
        return;
    }
    
    // Remove ALL existing input rows from both containers
    const allExistingRows = container.querySelectorAll('.additional-field-row');
    console.log('Removing', allExistingRows.length, 'existing rows');
    allExistingRows.forEach(row => row.remove());
    
    // Remove existing add writer button if it exists
    const existingAddButton = container.querySelector('.add-writer-btn');
    if (existingAddButton) {
        existingAddButton.remove();
    }
    
    // Remove existing add publisher button if it exists
    const existingAddPublisherButton = container.querySelector('.add-publisher-btn');
    if (existingAddPublisherButton) {
        existingAddPublisherButton.remove();
    }
    // Create a new first row
    const newFirstRow = document.createElement('div');
    newFirstRow.className = 'additional-field-row';
    
    // Create the minus button
    const minusButton = document.createElement('button');
    minusButton.className = 'remove-row-btn';
    minusButton.textContent = '-';
    
    // Create the three input fields
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'additional-input writer-input';
    nameInput.placeholder = type === 'writer' ? 'Writer' : 'Publisher';
    
    const ipiInput = document.createElement('input');
    ipiInput.type = 'text';
    ipiInput.className = 'additional-input ipi-input';
    ipiInput.placeholder = type === 'writer' ? 'Writer IPI' : 'Publisher IPI';
    
    const shareInput = document.createElement('input');
    shareInput.type = 'text';
    shareInput.className = 'additional-input split-input';
    shareInput.placeholder = 'Share';
    
    // Create the link text
    const linkText = document.createElement('span');
    linkText.className = 'link-to-publisher';
    linkText.textContent = type === 'writer' ? 'Link to Publisher' : 'unlinked';
    if (type === 'publisher') {
        linkText.style.cursor = 'default';
        linkText.style.color = '#6c757d';
    } else {
        // Add click handler for writer rows to show link publisher popup
        linkText.style.cursor = 'pointer';
        linkText.addEventListener('click', function() {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
            showLinkPublisherPopup(newFirstRow, rowIndex);
        });
    }
    
    // Populate with data
    if (type === 'writer') {
        if (splitData.writerName) nameInput.value = splitData.writerName;
        nameInput.placeholder = 'Writer';
        if (splitData.writerIPI) ipiInput.value = splitData.writerIPI;
        ipiInput.placeholder = 'Writer IPI';
        if (splitData.writerShare) shareInput.value = splitData.writerShare;
        shareInput.placeholder = 'Share';
        if (splitData.writerName2) {
            addAdditionalRow(container, splitData.writerName2, splitData.writerIPI2, splitData.writerShare2, 'writer');
        }
    } else if (type === 'publisher') {
        if (splitData.publisherName) nameInput.value = splitData.publisherName;
        nameInput.placeholder = 'Publisher';
        if (splitData.publisherIPI) ipiInput.value = splitData.publisherIPI;
        ipiInput.placeholder = 'Publisher IPI';
        if (splitData.publisherShare) shareInput.value = splitData.publisherShare;
        shareInput.placeholder = 'Share';
        if (splitData.publisherName2) {
            addAdditionalRow(container, splitData.publisherName2, splitData.publisherIPI2, splitData.publisherShare2, 'publisher');
        }
    }
    
    // Add elements to the new row
    newFirstRow.appendChild(minusButton);
    newFirstRow.appendChild(nameInput);
    newFirstRow.appendChild(ipiInput);
    newFirstRow.appendChild(shareInput);
    newFirstRow.appendChild(linkText);
    
    // Insert the new first row into middle-info-top
    middleInfoTop.appendChild(newFirstRow);
    
    // Add "add writer" button for writer section
    if (type === 'writer') {
        addWriterButton(container);
    }
    
    // Add "add publisher" button for publisher section
    if (type === 'publisher') {
        addPublisherButton(container);
    }
    
    // Add split total listeners to the new row
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
    addSplitTotalListeners(container, rowIndex);
    
    // Manage scrollbars after populating the container
    manageScrollbars(container);
    
    console.log('Population completed');
}

// Function to add an additional input row
function addAdditionalRow(container, name, ipi, share, type) {
    console.log('Adding additional row with:', { name, ipi, share });
    
    // Get the middle-info-top container
    const middleInfoTop = container.querySelector('.middle-info-top');
    
    if (!middleInfoTop) {
        console.log('Middle info top container not found');
        return;
    }
    
    const newRow = document.createElement('div');
    newRow.className = 'additional-field-row';
    
    // Create the minus button
    const minusButton = document.createElement('button');
    minusButton.className = 'remove-row-btn';
    minusButton.textContent = '-';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'additional-input writer-input';
    nameInput.value = name || '';
    nameInput.placeholder = type === 'writer' ? 'Writer' : 'Publisher';
    
    const ipiInput = document.createElement('input');
    ipiInput.type = 'text';
    ipiInput.className = 'additional-input ipi-input';
    ipiInput.value = ipi || '';
    ipiInput.placeholder = type === 'writer' ? 'Writer IPI' : 'Publisher IPI';
    
    const shareInput = document.createElement('input');
    shareInput.type = 'text';
    shareInput.className = 'additional-input split-input';
    shareInput.value = share || '';
    shareInput.placeholder = 'Share';
    
    // Create the link text
    const linkText = document.createElement('span');
    linkText.className = 'link-to-publisher';
    linkText.textContent = type === 'writer' ? 'Link to Publisher' : 'unlinked';
    if (type === 'publisher') {
        linkText.style.cursor = 'default';
        linkText.style.color = '#6c757d';
    } else {
        // Add click handler for writer rows to show link publisher popup
        linkText.style.cursor = 'pointer';
        linkText.addEventListener('click', function() {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
            showLinkPublisherPopup(newRow, rowIndex);
        });
    }
    
    newRow.appendChild(minusButton);
    newRow.appendChild(nameInput);
    newRow.appendChild(ipiInput);
    newRow.appendChild(shareInput);
    newRow.appendChild(linkText);
    
    // Insert into middle-info-top container
    middleInfoTop.appendChild(newRow);
    
    // Move the add button to always be after the last row
    const addButton = type === 'writer' ? 
        middleInfoTop.querySelector('.add-writer-btn') : 
        middleInfoTop.querySelector('.add-publisher-btn');
    if (addButton) {
        addButton.remove();
        middleInfoTop.appendChild(addButton);
    }
    
    // Remove any duplicate buttons that might exist
    const allButtons = type === 'writer' ? 
        middleInfoTop.querySelectorAll('.add-writer-btn') : 
        middleInfoTop.querySelectorAll('.add-publisher-btn');
    
    // Keep only the last button (most recently added)
    if (allButtons.length > 1) {
        for (let i = 0; i < allButtons.length - 1; i++) {
            allButtons[i].remove();
        }
    }
    
    console.log('Additional row inserted into middle-info-top container');
    
    // Add split total listeners to the new row
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
    addSplitTotalListeners(container, rowIndex);
    
    // Manage scrollbars after adding the additional row
    manageScrollbars(container);
}

// Function to clear all input fields in a container
function clearAllInputFields(container, type) {
    console.log('clearAllInputFields called for type:', type);
    
    // Get the middle-info-top container
    const middleInfoTop = container.querySelector('.middle-info-top');
    
    if (!middleInfoTop) {
        console.log('Middle info top container not found');
        return;
    }
    
    // Remove ALL existing input rows from the container
    const allExistingRows = container.querySelectorAll('.additional-field-row');
    console.log('Removing', allExistingRows.length, 'existing rows');
    allExistingRows.forEach(row => row.remove());
    
    // Remove existing add writer button if it exists
    const existingAddButton = container.querySelector('.add-writer-btn');
    if (existingAddButton) {
        existingAddButton.remove();
    }
    
    // Create a new empty first row
    const newFirstRow = document.createElement('div');
    newFirstRow.className = 'additional-field-row';
    
    // Create the minus button
    const minusButton = document.createElement('button');
    minusButton.className = 'remove-row-btn';
    minusButton.textContent = '-';
    
    // Create the three empty input fields
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'additional-input writer-input';
    nameInput.placeholder = type === 'writer' ? 'Writer' : 'Publisher';
    
    const ipiInput = document.createElement('input');
    ipiInput.type = 'text';
    ipiInput.className = 'additional-input ipi-input';
    ipiInput.placeholder = type === 'writer' ? 'Writer IPI' : 'Publisher IPI';
    
    const shareInput = document.createElement('input');
    shareInput.type = 'text';
    shareInput.className = 'additional-input split-input';
    shareInput.placeholder = 'Share';
    
    // Create the link text
    const linkText = document.createElement('span');
    linkText.className = 'link-to-publisher';
    linkText.textContent = type === 'writer' ? 'Link to Publisher' : 'unlinked';
    if (type === 'publisher') {
        linkText.style.cursor = 'default';
        linkText.style.color = '#6c757d';
    } else {
        // Add click handler for writer rows to show link publisher popup
        linkText.style.cursor = 'pointer';
        linkText.addEventListener('click', function() {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
            showLinkPublisherPopup(newFirstRow, rowIndex);
        });
    }
    
    // Add elements to the new row
    newFirstRow.appendChild(minusButton);
    newFirstRow.appendChild(nameInput);
    newFirstRow.appendChild(ipiInput);
    newFirstRow.appendChild(shareInput);
    newFirstRow.appendChild(linkText);
    
    // Insert the new first row into middle-info-top
    middleInfoTop.appendChild(newFirstRow);
    
    // Add "add writer" button for writer section
    if (type === 'writer') {
        addWriterButton(container);
    }
    
    // Add "add publisher" button for publisher section
    if (type === 'publisher') {
        addPublisherButton(container);
    }
    
    // Add split total listeners to the new row
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
    addSplitTotalListeners(container, rowIndex);
    
    console.log('All fields cleared for', type);
}

// Function to add event listeners for split type buttons
function addSplitButtonListeners(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) return;
    
    // Add split total listeners to existing split input fields
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    if (writerContainer) {
        addSplitTotalListeners(writerContainer, rowIndex);
    }
    
    if (publisherContainer) {
        addSplitTotalListeners(publisherContainer, rowIndex);
    }
    
    // Add listeners to Update buttons (Save buttons in writer section)
    const updateButtons = expandableContent.querySelectorAll('.update-split-btn');
    console.log('Found', updateButtons.length, 'update buttons for row', rowIndex);
    updateButtons.forEach(button => {
        console.log('Adding listener to button with text:', button.textContent);
        button.addEventListener('click', function() {
            const currentRowIndex = parseInt(this.getAttribute('data-row'));
            console.log('Update button clicked for row:', currentRowIndex, 'Button text:', this.textContent);
            
            // Check if this is the "song information" button (publisher section)
            console.log('Button text comparison:', this.textContent, '===', 'song information', 'Result:', this.textContent === 'song information');
            if (this.textContent === 'song information') {
                console.log('Song information button detected, calling showClearSongDataPopup');
                showClearSongDataPopup(currentRowIndex);
                return;
            }
            
            // Show confirmation dialog for regular update button
            const confirmed = confirm("This split type number is taken. If you'd like to update this split type please cancel, and press \"update\". Otherwise please select a new split type number in this box HERE and click 'save'.");
            
            if (confirmed) {
                // Re-populate the fields with current split type
                populateInputFields(currentRowIndex);
            }
        });
    });
    
    // Add listeners to Save buttons (Update buttons in writer section)
    const saveButtons = expandableContent.querySelectorAll('.save-split-btn');
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentRowIndex = parseInt(this.getAttribute('data-row'));
            console.log('Save button clicked for row:', currentRowIndex);
            
            // Check if this is the "split information" button (publisher section)
            if (this.textContent === 'split information') {
                console.log('Split information button detected, calling showClearSplitDataPopup');
                showClearSplitDataPopup(currentRowIndex);
                return;
            }
            
            // Get the current split type
            const row = document.querySelectorAll('.registration-row')[currentRowIndex];
            const allInputs = row.querySelectorAll('input');
            const splitType = parseInt(allInputs[4].value) || 0;
            
            if (splitType === 0) {
                alert('Please select a split type number before saving.');
                return;
            }
            
            // Check if this split type already exists in the database
            const existingSplitData = splitDatabase.find(split => split.splitType === splitType);
            
            if (existingSplitData) {
                // Show warning dialog
                const confirmed = confirm("Warning: This will permanently update this split type for all future registration and cannot be undone. If you'd like to save a new split type, cancel and select \"save\". Otherwise press 'confirm'. You can't update split type 0.");
                
                if (!confirmed) {
                    return; // User cancelled
                }
            }
            
            // Save the current input values to the splitDatabase
            saveSplitData(currentRowIndex);
        });
    });
    
    // Add listener to split type dropdown
    const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
    if (splitTypeDropdown) {
        splitTypeDropdown.addEventListener('change', function() {
            const currentRow = this.closest('.expandable-content').previousElementSibling;
            const currentRowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
            const selectedSplitType = parseInt(this.value) || 0;
            
            console.log('Split type dropdown changed for row:', currentRowIndex, 'to:', selectedSplitType);
            
            // Update the split type input in the main registration row
            const row = document.querySelectorAll('.registration-row')[currentRowIndex];
            const allInputs = row.querySelectorAll('input');
            if (allInputs[4]) { // Split type input
                allInputs[4].value = selectedSplitType;
                
                // Update the color based on split type
                if (selectedSplitType !== 0) {
                    allInputs[4].style.color = '#000';
                } else {
                    allInputs[4].style.color = '#ccc';
                }
            }
            
            // Update the split type display and populate fields
            populateInputFields(currentRowIndex);
        });
    }
}

// Function to save split data to the database
function saveSplitData(rowIndex) {
    console.log('saveSplitData called for row:', rowIndex);
    
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) {
        console.log('Row not found for index:', rowIndex);
        return;
    }
    
    // Get the split type from the registration row
    const allInputs = row.querySelectorAll('input');
    if (allInputs.length < 5) {
        console.log('Not enough inputs in registration row');
        return;
    }
    
    const splitType = parseInt(allInputs[4].value) || 0;
    if (splitType === 0) {
        console.log('Split type is 0, cannot save');
        return;
    }
    
    // Get the expandable content for this row
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) {
        console.log('Expandable content not found');
        return;
    }
    
    // Get writer and publisher containers
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    if (!writerContainer || !publisherContainer) {
        console.log('Writer or publisher container not found');
        return;
    }
    
    // Collect writer data
    const writerRows = writerContainer.querySelectorAll('.additional-field-row');
    const writerData = {
        splitType: splitType,
        writerName: '',
        writerIPI: '',
        writerShare: '',
        writerName2: '',
        writerIPI2: '',
        writerShare2: ''
    };
    
    if (writerRows.length > 0) {
        const firstWriterRow = writerRows[0];
        const writerInputs = firstWriterRow.querySelectorAll('input');
        if (writerInputs.length >= 3) {
            writerData.writerName = writerInputs[0].value || '';
            writerData.writerIPI = writerInputs[1].value || '';
            writerData.writerShare = writerInputs[2].value || '';
        }
        
        if (writerRows.length > 1) {
            const secondWriterRow = writerRows[1];
            const secondWriterInputs = secondWriterRow.querySelectorAll('input');
            if (secondWriterInputs.length >= 3) {
                writerData.writerName2 = secondWriterInputs[0].value || '';
                writerData.writerIPI2 = secondWriterInputs[1].value || '';
                writerData.writerShare2 = secondWriterInputs[2].value || '';
            }
        }
    }
    
    // Collect publisher data
    const publisherRows = publisherContainer.querySelectorAll('.additional-field-row');
    const publisherData = {
        publisherName: '',
        publisherIPI: '',
        publisherShare: '',
        publisherName2: '',
        publisherIPI2: '',
        publisherShare2: ''
    };
    
    if (publisherRows.length > 0) {
        const firstPublisherRow = publisherRows[0];
        const publisherInputs = firstPublisherRow.querySelectorAll('input');
        if (publisherInputs.length >= 3) {
            publisherData.publisherName = publisherInputs[0].value || '';
            publisherData.publisherIPI = publisherInputs[1].value || '';
            publisherData.publisherShare = publisherInputs[2].value || '';
        }
        
        if (publisherRows.length > 1) {
            const secondPublisherRow = publisherRows[1];
            const secondPublisherInputs = secondPublisherRow.querySelectorAll('input');
            if (secondPublisherInputs.length >= 3) {
                publisherData.publisherName2 = secondPublisherInputs[0].value || '';
                publisherData.publisherIPI2 = secondPublisherInputs[1].value || '';
                publisherData.publisherShare2 = secondPublisherInputs[2].value || '';
            }
        }
    }
    
    // Combine writer and publisher data
    const splitData = { ...writerData, ...publisherData };
    
    // Check if this split type already exists in the database
    const existingIndex = splitDatabase.findIndex(split => split.splitType === splitType);
    
    if (existingIndex !== -1) {
        // Update existing entry
        splitDatabase[existingIndex] = splitData;
        console.log('Updated existing split data for split type:', splitType);
    } else {
        // Add new entry
        splitDatabase.push(splitData);
        console.log('Added new split data for split type:', splitType);
    }
    
    console.log('Split data saved:', splitData);
}

// Function to show popup for clearing song data
function showClearSongDataPopup(rowIndex) {
    console.log('showClearSongDataPopup called with rowIndex:', rowIndex);
    
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
    popupContent.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        font-family: Arial, sans-serif;
    `;
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Clear all song data, or select which data to clear:';
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    `;
    
    // Create checkbox container
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.cssText = `
        margin-bottom: 25px;
    `;
    
    // Define fields to clear
    const fields = [
        { id: 'artist', label: 'Artist' },
        { id: 'workTitle', label: 'Work Title' },
        { id: 'iswc', label: 'ISWC' },
        { id: 'isrc', label: 'ISRC' }
    ];
    
    // Create checkboxes
    const checkboxes = {};
    fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        `;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = field.id;
        checkbox.checked = true; // Default to checked
        checkbox.style.cssText = `
            margin-right: 10px;
            transform: scale(1.2);
        `;
        
        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label;
        label.style.cssText = `
            font-size: 14px;
            color: #333;
            cursor: pointer;
        `;
        
        fieldContainer.appendChild(checkbox);
        fieldContainer.appendChild(label);
        checkboxContainer.appendChild(fieldContainer);
        
        checkboxes[field.id] = checkbox;
    });
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    `;
    
    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #ccc;
        background-color: #f8f9fa;
        color: #333;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    // Create Clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #dc3545;
        background-color: #dc3545;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    // Add hover effects
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.backgroundColor = '#e9ecef';
    });
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.backgroundColor = '#f8f9fa';
    });
    
    clearButton.addEventListener('mouseenter', () => {
        clearButton.style.backgroundColor = '#c82333';
    });
    clearButton.addEventListener('mouseleave', () => {
        clearButton.style.backgroundColor = '#dc3545';
    });
    
    // Add event listeners
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    clearButton.addEventListener('click', () => {
        clearSelectedSongData(rowIndex, checkboxes);
        document.body.removeChild(popup);
    });
    
    // Assemble popup
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(clearButton);
    
    popupContent.appendChild(title);
    popupContent.appendChild(checkboxContainer);
    popupContent.appendChild(buttonContainer);
    
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
    
    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

// Function to clear selected song data
function clearSelectedSongData(rowIndex, checkboxes) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    // Get the main input fields (first 5 inputs)
    const mainInputs = row.querySelectorAll('input');
    
    // Clear Artist field (first input)
    if (checkboxes.artist.checked && mainInputs[0]) {
        mainInputs[0].value = '';
        // Clear artists from database
        if (registrationDatabase.rows[rowIndex]) {
            registrationDatabase.rows[rowIndex].artists = [];
            populateArtistsList(rowIndex);
        }
    }
    
    // Clear Work Title field (second input)
    if (checkboxes.workTitle.checked && mainInputs[1]) {
        mainInputs[1].value = '';
        // Clear titles from database
        if (registrationDatabase.rows[rowIndex]) {
            registrationDatabase.rows[rowIndex].titles = [];
            populateTitlesList(rowIndex);
        }
    }
    
    // Clear ISWC field (third input)
    if (checkboxes.iswc.checked && mainInputs[2]) {
        mainInputs[2].value = '';
        // Clear ISWC from database
        if (registrationDatabase.rows[rowIndex]) {
            registrationDatabase.rows[rowIndex].iswc = [];
            populateIswcList(rowIndex);
        }
    }
    
    // Clear ISRC field (fourth input)
    if (checkboxes.isrc.checked && mainInputs[3]) {
        mainInputs[3].value = '';
        // Clear ISRCs from database
        if (registrationDatabase.rows[rowIndex]) {
            registrationDatabase.rows[rowIndex].isrcs = [];
            populateIsrcsList(rowIndex);
        }
    }
    
    console.log('Cleared selected song data for row:', rowIndex, {
        artist: checkboxes.artist.checked,
        workTitle: checkboxes.workTitle.checked,
        iswc: checkboxes.iswc.checked,
        isrc: checkboxes.isrc.checked
    });
}

// Function to populate artists list in expanded view
function populateArtistsList(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) return;
    
    const artistsList = expandableContent.querySelector('.artists-list');
    if (!artistsList) return;
    
    const rowData = registrationDatabase.rows[rowIndex];
    const artists = rowData ? rowData.artists || [] : [];
    
    // Clear existing content
    artistsList.innerHTML = '';
    
    if (artists.length === 0) {
        artistsList.textContent = 'No artists added yet';
    } else {
        artists.forEach(artist => {
            const artistItem = document.createElement('div');
            artistItem.textContent = artist;
            artistItem.style.cssText = `
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
            `;
            artistsList.appendChild(artistItem);
        });
    }
}

// Function to populate titles list in expanded view
function populateTitlesList(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) return;
    
    const titlesList = expandableContent.querySelector('.titles-list');
    if (!titlesList) return;
    
    const rowData = registrationDatabase.rows[rowIndex];
    const titles = rowData ? rowData.titles || [] : [];
    
    // Clear existing content
    titlesList.innerHTML = '';
    
    if (titles.length === 0) {
        titlesList.textContent = 'No work titles added yet';
    } else {
        titles.forEach(title => {
            const titleItem = document.createElement('div');
            titleItem.textContent = title;
            titleItem.style.cssText = `
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
            `;
            titlesList.appendChild(titleItem);
        });
    }
}

// Function to populate ISRCs list in expanded view
function populateIsrcsList(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) return;
    
    const isrcsList = expandableContent.querySelector('.isrcs-list');
    if (!isrcsList) return;
    
    const rowData = registrationDatabase.rows[rowIndex];
    const isrcs = rowData ? rowData.isrcs || [] : [];
    
    // Clear existing content
    isrcsList.innerHTML = '';
    
    if (isrcs.length === 0) {
        isrcsList.textContent = 'No ISRCs added yet';
    } else {
        isrcs.forEach(isrc => {
            const isrcItem = document.createElement('div');
            isrcItem.textContent = isrc;
            isrcItem.style.cssText = `
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
            `;
            isrcsList.appendChild(isrcItem);
        });
    }
}

// Function to populate ISWC list in expanded view
function populateIswcList(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) return;
    
    const iswcList = expandableContent.querySelector('.iswc-list');
    if (!iswcList) return;
    
    const rowData = registrationDatabase.rows[rowIndex];
    const iswc = rowData ? rowData.iswc || [] : [];
    
    // Clear existing content
    iswcList.innerHTML = '';
    
    if (iswc.length === 0) {
        iswcList.innerHTML = '<em style="font-style: italic; color: #999; font-size: 11px; line-height: 1.3;">ISWCs are only issued by PROs when a work\'s registration is accepted and reconciled. ISWCs are not issued by publishers in the same manner that ISRCs can be issued by distributors for the release of a sound recording.</em>';
    } else {
        iswc.forEach(code => {
            const iswcItem = document.createElement('div');
            iswcItem.textContent = code;
            iswcItem.style.cssText = `
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
            `;
            iswcList.appendChild(iswcItem);
        });
    }
}

// Function to show popup for clearing split data
function showClearSplitDataPopup(rowIndex) {
    console.log('showClearSplitDataPopup called with rowIndex:', rowIndex);
    
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
    popupContent.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        font-family: Arial, sans-serif;
    `;
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Clear split data, or select which lines to clear:';
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    `;
    
    // Create checkbox container
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.cssText = `
        margin-bottom: 25px;
    `;
    
    // Get the current split data
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) {
        console.log('Expandable content not found');
        return;
    }
    
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    // Collect all writer and publisher lines
    const splitLines = [];
    
    // Add writer lines
    if (writerContainer) {
        const writerRows = writerContainer.querySelectorAll('.additional-field-row');
        writerRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
                const name = inputs[0].value.trim();
                const ipi = inputs[1].value.trim();
                const share = inputs[2].value.trim();
                
                if (name || ipi || share) {
                    splitLines.push({
                        type: 'writer',
                        index: index,
                        name: name,
                        ipi: ipi,
                        share: share,
                        row: row
                    });
                }
            }
        });
    }
    
    // Add publisher lines
    if (publisherContainer) {
        const publisherRows = publisherContainer.querySelectorAll('.additional-field-row');
        publisherRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
                const name = inputs[0].value.trim();
                const ipi = inputs[1].value.trim();
                const share = inputs[2].value.trim();
                
                if (name || ipi || share) {
                    splitLines.push({
                        type: 'publisher',
                        index: index,
                        name: name,
                        ipi: ipi,
                        share: share,
                        row: row
                    });
                }
            }
        });
    }
    
    // Initialize checkboxes object at function level
    const checkboxes = {};
    
    if (splitLines.length === 0) {
        // No split data to clear
        const noDataMessage = document.createElement('div');
        noDataMessage.textContent = 'No split data found to clear.';
        noDataMessage.style.cssText = `
            color: #666;
            font-style: italic;
            margin-bottom: 20px;
        `;
        checkboxContainer.appendChild(noDataMessage);
    } else {
        // Create checkboxes for each line
        splitLines.forEach((line, index) => {
            const lineContainer = document.createElement('div');
            lineContainer.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                padding: 8px;
                border: 1px solid #eee;
                border-radius: 4px;
            `;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `split-line-${index}`;
            checkbox.checked = true; // Default to checked
            checkbox.style.cssText = `
                margin-right: 10px;
                transform: scale(1.2);
            `;
            
            const label = document.createElement('label');
            label.htmlFor = `split-line-${index}`;
            label.style.cssText = `
                font-size: 14px;
                color: #333;
                cursor: pointer;
                flex: 1;
            `;
            
            // Create display text for the line
            const displayText = `${line.type.charAt(0).toUpperCase() + line.type.slice(1)} ${line.index + 1}: ${line.name || 'No name'}${line.ipi ? ` (IPI: ${line.ipi})` : ''}${line.share ? ` - ${line.share}%` : ''}`;
            label.textContent = displayText;
            
            lineContainer.appendChild(checkbox);
            lineContainer.appendChild(label);
            checkboxContainer.appendChild(lineContainer);
            
            checkboxes[`${line.type}-${line.index}`] = {
                checkbox: checkbox,
                line: line
            };
        });
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    `;
    
    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #ccc;
        background-color: #f8f9fa;
        color: #333;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    // Create Clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #dc3545;
        background-color: #dc3545;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    // Add hover effects
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.backgroundColor = '#e9ecef';
    });
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.backgroundColor = '#f8f9fa';
    });
    
    clearButton.addEventListener('mouseenter', () => {
        clearButton.style.backgroundColor = '#c82333';
    });
    clearButton.addEventListener('mouseleave', () => {
        clearButton.style.backgroundColor = '#dc3545';
    });
    
    // Add event listeners
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    clearButton.addEventListener('click', () => {
        clearSelectedSplitData(rowIndex, checkboxes);
        document.body.removeChild(popup);
    });
    
    // Assemble popup
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(clearButton);
    
    popupContent.appendChild(title);
    popupContent.appendChild(checkboxContainer);
    popupContent.appendChild(buttonContainer);
    
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
    
    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

// Function to clear selected split data
function clearSelectedSplitData(rowIndex, checkboxes) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) return;
    
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    let allSelected = true;
    let anyCleared = false;
    
    // Clear selected lines
    Object.keys(checkboxes).forEach(key => {
        const { checkbox, line } = checkboxes[key];
        
        if (checkbox.checked) {
            // Clear the line
            const inputs = line.row.querySelectorAll('input');
            inputs[0].value = ''; // Name
            inputs[1].value = ''; // IPI
            inputs[2].value = ''; // Share
            anyCleared = true;
        } else {
            allSelected = false;
        }
    });
    
    // If all lines were selected and cleared, set split type to 0
    if (allSelected && anyCleared) {
        const mainInputs = row.querySelectorAll('input');
        if (mainInputs[4]) { // Split type input
            mainInputs[4].value = '0';
        }
        
        // Update split type display
        const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
        
        if (splitTypeDropdown) {
            splitTypeDropdown.value = '';
        }
        
        // Update split totals to 0
        const splitTotalValues = expandableContent.querySelectorAll('.split-total-value');
        splitTotalValues.forEach(element => {
            element.textContent = '0';
        });
        
        console.log('All split data cleared, split type set to 0');
    }
    
    console.log('Cleared selected split data for row:', rowIndex, {
        allSelected: allSelected,
        anyCleared: anyCleared
    });
}

// Function to show popup for selecting new main ISWC when main ISWC is deleted
function showNewMainIswcSelection(remainingIswc, pendingChanges, currentRow, showLeaveBlank = true) {
    console.log('showNewMainIswcSelection called with remaining ISWC:', remainingIswc);
    
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
    popupContent.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        font-family: Arial, sans-serif;
    `;
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Select new main ISWC:';
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    `;
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    
    // Create buttons for each remaining ISWC
    remainingIswc.forEach(iswcCode => {
        const button = document.createElement('button');
        button.textContent = iswcCode;
        button.style.cssText = `
            padding: 10px 16px;
            border: 1px solid #007bff;
            background-color: #007bff;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-align: left;
        `;
        
        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#0056b3';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#007bff';
        });
        
        // Add click event
        button.addEventListener('click', () => {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
            const rowData = registrationDatabase.rows[rowIndex];
            
            // Set the selected ISWC as the main one in the input field
            const iswcInput = currentRow.querySelector('input[placeholder="ISWC"]');
            if (iswcInput) {
                iswcInput.value = iswcCode;
                iswcInput.setAttribute('data-previous-value', iswcCode);
            }
            
            // Update the database to reflect the new main ISWC
            if (rowData && rowData.iswc) {
                // Remove the selected ISWC from the array and put it at the beginning
                const index = rowData.iswc.indexOf(iswcCode);
                if (index !== -1) {
                    rowData.iswc.splice(index, 1);
                    rowData.iswc.unshift(iswcCode);
                }
            }
            
            // Update the ISWC list in expanded view
            populateIswcList(rowIndex);
            
            // Close popup
            document.body.removeChild(popup);
        });
        
        buttonContainer.appendChild(button);
    });
    
    // Add "Leave blank" option if requested
    if (showLeaveBlank) {
        const leaveBlankButton = document.createElement('button');
        leaveBlankButton.textContent = 'Leave blank';
        leaveBlankButton.style.cssText = `
            padding: 10px 16px;
            border: 1px solid #6c757d;
            background-color: #6c757d;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-align: left;
        `;
        
        // Add hover effect
        leaveBlankButton.addEventListener('mouseenter', () => {
            leaveBlankButton.style.backgroundColor = '#545b62';
        });
        leaveBlankButton.addEventListener('mouseleave', () => {
            leaveBlankButton.style.backgroundColor = '#6c757d';
        });
        
        // Add click event
        leaveBlankButton.addEventListener('click', () => {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
            
            // Clear the input field
            const iswcInput = currentRow.querySelector('input[placeholder="ISWC"]');
            if (iswcInput) {
                iswcInput.value = '';
                iswcInput.removeAttribute('data-previous-value');
            }
            
            // Update the ISWC list in expanded view
            populateIswcList(rowIndex);
            
            // Close popup
            document.body.removeChild(popup);
        });
        
        buttonContainer.appendChild(leaveBlankButton);
    }
    
    // Assemble popup
    popupContent.appendChild(title);
    popupContent.appendChild(buttonContainer);
    
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
    
    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

// Utility to calculate publisher split total for a splitDatabase entry
function calculatePublisherSplitTotal(split) {
    let total = 0;
    if (!split) return 0;
    if (split.publisherShare) total += Number(split.publisherShare);
    if (split.publisherShare2) total += Number(split.publisherShare2);
    return total;
}

// Function to calculate and update split totals in real-time from input fields
function updateSplitTotalsInRealTime(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    const expandableContent = row.nextElementSibling;
    if (!expandableContent || !expandableContent.classList.contains('expandable-content')) return;
    
    // Get writer and publisher containers
    const writerContainer = expandableContent.querySelector('.additional-fields:first-child');
    const publisherContainer = expandableContent.querySelector('.additional-fields:last-child');
    
    let writerTotal = 0;
    let publisherTotal = 0;
    
    // Calculate writer total from input fields
    if (writerContainer) {
        const writerRows = writerContainer.querySelectorAll('.additional-field-row');
        writerRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
                const shareValue = parseFloat(inputs[2].value) || 0; // Third input is share
                writerTotal += shareValue;
            }
        });
    }
    
    // Calculate publisher total from input fields
    if (publisherContainer) {
        const publisherRows = publisherContainer.querySelectorAll('.additional-field-row');
        publisherRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
                const shareValue = parseFloat(inputs[2].value) || 0; // Third input is share
                publisherTotal += shareValue;
            }
        });
    }
    
    // Update the split total displays
    const splitTotalValues = expandableContent.querySelectorAll('.split-total-value');
    
    // Update the first split total (writer section)
    if (splitTotalValues[0]) {
        splitTotalValues[0].textContent = writerTotal;
    }
    
    // Update the second split total (publisher section)
    if (splitTotalValues[1]) {
        splitTotalValues[1].textContent = publisherTotal;
    }
    
    console.log('Updated split totals in real-time - Writer:', writerTotal, 'Publisher:', publisherTotal);
}

// Function to add real-time split total listeners to a container
function addSplitTotalListeners(container, rowIndex) {
    console.log('Adding split total listeners for row:', rowIndex, 'container:', container);
    
    // Get split inputs from the specific container
    const splitInputs = container.querySelectorAll('.split-input');
    console.log('Found', splitInputs.length, 'split inputs in container for row:', rowIndex);
    
    splitInputs.forEach((input, index) => {
        console.log('Adding listener to split input', index, 'for row:', rowIndex);
        
        // Remove existing listeners to prevent duplicates
        input.removeEventListener('input', input.splitTotalHandler);
        input.removeEventListener('change', input.splitTotalHandler);
        
        // Create new handler
        input.splitTotalHandler = () => {
            console.log('Split input changed for row:', rowIndex, 'value:', input.value);
            updateSplitTotalsInRealTime(rowIndex);
            createPieCharts(rowIndex); // Update pie charts when split data changes
        };
        
        // Add both input and change event listeners for real-time updates
        input.addEventListener('input', input.splitTotalHandler);
        input.addEventListener('change', input.splitTotalHandler);
        
        console.log('Listener added to split input', index, 'for row:', rowIndex);
    });
    
    // Immediately update pie charts after adding listeners
    setTimeout(() => {
        console.log('Immediately updating pie charts for row:', rowIndex);
        createPieCharts(rowIndex);
    }, 50);
}

// Function to add "add writer" button
function addWriterButton(container) {
    const addWriterBtn = document.createElement('span');
    addWriterBtn.className = 'add-writer-btn';
    addWriterBtn.textContent = '+ Add Another Writer';
    addWriterBtn.style.cssText = `
        color: #007bff;
        cursor: pointer;
        font-size: 14px;
        display: block;
    `;
    
    // Add hover effect
    addWriterBtn.addEventListener('mouseenter', function() {
        this.style.color = '#0056b3';
    });
    
    addWriterBtn.addEventListener('mouseleave', function() {
        this.style.color = '#007bff';
    });
    
    // Add click event to add a new writer row
    addWriterBtn.addEventListener('click', function() {
        addWriterRow(container);
    });
    
    // Insert inside the middle-info-top container, after the last additional-field-row
    const middleInfoTop = container.querySelector('.middle-info-top');
    if (middleInfoTop) {
        middleInfoTop.appendChild(addWriterBtn);
    }
}

// Function to add a new writer row
function addWriterRow(container) {
    console.log('Adding new writer row');
    
    // Get the middle-info-top container
    const middleInfoTop = container.querySelector('.middle-info-top');
    if (!middleInfoTop) {
        console.log('Middle info top container not found');
        return;
    }
    
    const newRow = document.createElement('div');
    newRow.className = 'additional-field-row';
    
    const minusButton = document.createElement('button');
    minusButton.className = 'remove-row-btn';
    minusButton.textContent = '-';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'additional-input writer-input';
    nameInput.placeholder = 'Writer';
    
    const ipiInput = document.createElement('input');
    ipiInput.type = 'text';
    ipiInput.className = 'additional-input ipi-input';
    ipiInput.placeholder = 'Writer IPI';
    
    const shareInput = document.createElement('input');
    shareInput.type = 'text';
    shareInput.className = 'additional-input split-input';
    shareInput.placeholder = 'Split';
    
    const linkText = document.createElement('span');
    linkText.className = 'link-to-publisher';
    linkText.textContent = 'Link to Publisher';
    
    newRow.appendChild(minusButton);
    newRow.appendChild(nameInput);
    newRow.appendChild(ipiInput);
    newRow.appendChild(shareInput);
    newRow.appendChild(linkText);
    
    // Insert into middle-info-top container
    middleInfoTop.appendChild(newRow);
    
    // Move the addWriterBtn to always be after the last row
    const addWriterBtn = middleInfoTop.querySelector('.add-writer-btn');
    if (addWriterBtn) {
        // Remove from current position and append to end
        addWriterBtn.remove();
        middleInfoTop.appendChild(addWriterBtn);
    }
    
    // Remove any duplicate buttons that might exist
    const allButtons = middleInfoTop.querySelectorAll('.add-writer-btn');
    if (allButtons.length > 1) {
        for (let i = 0; i < allButtons.length - 1; i++) {
            allButtons[i].remove();
        }
    }
    
    // Add split total listeners to the new row
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
    addSplitTotalListeners(container, rowIndex);
    
    // Manage scrollbars after adding the row
    manageScrollbars(container);
    
    console.log('New writer row added to middle-info-top container');
}

// Function to add "add publisher" button
function addPublisherButton(container) {
    const addPublisherBtn = document.createElement('span');
    addPublisherBtn.className = 'add-publisher-btn';
    addPublisherBtn.textContent = '+ Add Another Publisher';
    addPublisherBtn.style.cssText = `
        color: #007bff;
        cursor: pointer;
        font-size: 14px;
        display: block;
    `;
    
    // Add hover effect
    addPublisherBtn.addEventListener('mouseenter', function() {
        this.style.color = '#0056b3';
    });
    
    addPublisherBtn.addEventListener('mouseleave', function() {
        this.style.color = '#007bff';
    });
    
    // Add click event to add a new publisher row
    addPublisherBtn.addEventListener('click', function() {
        addPublisherRow(container);
    });
    
    // Insert inside the middle-info-top container, after the last additional-field-row
    const middleInfoTop = container.querySelector('.middle-info-top');
    if (middleInfoTop) {
        middleInfoTop.appendChild(addPublisherBtn);
    }
}

// Function to add a new publisher row
function addPublisherRow(container) {
    console.log('Adding new publisher row');
    
    // Get the middle-info-top container
    const middleInfoTop = container.querySelector('.middle-info-top');
    if (!middleInfoTop) {
        console.log('Middle info top container not found');
        return;
    }
    
    const newRow = document.createElement('div');
    newRow.className = 'additional-field-row';
    
    const minusButton = document.createElement('button');
    minusButton.className = 'remove-row-btn';
    minusButton.textContent = '-';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'additional-input writer-input';
    nameInput.placeholder = 'Publisher';
    
    const ipiInput = document.createElement('input');
    ipiInput.type = 'text';
    ipiInput.className = 'additional-input ipi-input';
    ipiInput.placeholder = 'Publisher IPI';
    
    const shareInput = document.createElement('input');
    shareInput.type = 'text';
    shareInput.className = 'additional-input split-input';
    shareInput.placeholder = 'Split';
    
    const linkText = document.createElement('span');
    linkText.className = 'link-to-publisher';
    linkText.textContent = 'unlinked';
    linkText.style.cursor = 'default';
    linkText.style.color = '#6c757d';
    
    newRow.appendChild(minusButton);
    newRow.appendChild(nameInput);
    newRow.appendChild(ipiInput);
    newRow.appendChild(shareInput);
    newRow.appendChild(linkText);
    
    // Insert into middle-info-top container
    middleInfoTop.appendChild(newRow);
    
    // Move the addPublisherBtn to always be after the last row
    const addPublisherBtn = middleInfoTop.querySelector('.add-publisher-btn');
    if (addPublisherBtn) {
        // Remove from current position and append to end
        addPublisherBtn.remove();
        middleInfoTop.appendChild(addPublisherBtn);
    }
    
    // Remove any duplicate buttons that might exist
    const allButtons = middleInfoTop.querySelectorAll('.add-publisher-btn');
    if (allButtons.length > 1) {
        for (let i = 0; i < allButtons.length - 1; i++) {
            allButtons[i].remove();
        }
    }
    
    // Add split total listeners to the new row
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
    addSplitTotalListeners(container, rowIndex);
    
    // Manage scrollbars after adding the row
    manageScrollbars(container);
    
    console.log('New publisher row added to middle-info-top container');
}

// Add event delegation for remove row buttons and Enter key handling
document.addEventListener('DOMContentLoaded', function() {
    // Add event delegation for remove row buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-row-btn')) {
            removeRow(e.target);
        }
        
        // Add event delegation for link-to-publisher clicks
        if (e.target.classList.contains('link-to-publisher')) {
            console.log('Event delegation: link-to-publisher clicked, text:', e.target.textContent);
            console.log('Event delegation: target element:', e.target);
            console.log('Event delegation: current target:', e.currentTarget);
            if (e.target.textContent === 'Link to Publisher') {
                console.log('Event delegation: handling "Link to Publisher" click');
                const writerRow = e.target.closest('.additional-field-row');
                const expandableContent = writerRow.closest('.expandable-content');
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(expandableContent.previousElementSibling);
                showLinkPublisherPopup(writerRow, rowIndex);
            } else if (e.target.textContent === 'Linked') {
                console.log('Event delegation: handling "Linked" click');
                // Handle clicks on "Linked" text to reopen the popup
                const clickedRow = e.target.closest('.additional-field-row');
                const expandableContent = clickedRow.closest('.expandable-content');
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(expandableContent.previousElementSibling);
                
                // Check if this is a writer row or publisher row
                const isWriterRow = clickedRow.closest('.additional-fields:first-child') !== null;
                
                if (isWriterRow) {
                    // This is a writer row, open popup directly
                    showLinkPublisherPopup(clickedRow, rowIndex);
                } else {
                    // This is a publisher row, find the corresponding writer row
                    const writerContainer = expandableContent?.querySelector('.additional-fields:first-child');
                    if (writerContainer) {
                        const clickedInputs = clickedRow.querySelectorAll('input');
                        const clickedName = clickedInputs[0]?.value || '';
                        
                        const writerRows = writerContainer.querySelectorAll('.additional-field-row');
                        for (const writerRow of writerRows) {
                            const writerInputs = writerRow.querySelectorAll('input');
                            const writerName = writerInputs[0]?.value || '';
                            
                            if (writerName === clickedName) {
                                showLinkPublisherPopup(writerRow, rowIndex);
                                break;
                            }
                        }
                    }
                }
            }
        }
    });
    
    // Add event delegation for Enter key to exit input boxes in writer/publisher rows
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const target = e.target;
            // Check if the target is an input field in writer or publisher rows
            if (target.classList.contains('additional-input') && 
                (target.classList.contains('writer-input') || 
                 target.classList.contains('ipi-input') || 
                 target.classList.contains('split-input'))) {
                e.preventDefault();
                target.blur();
            }
        }
    });
    
    // Add event delegation for split input validation and type conversion
    document.addEventListener('input', function(e) {
        const target = e.target;
        if (target.classList.contains('split-input')) {
            // Convert to number type if not already
            if (target.type !== 'number') {
                target.type = 'number';
                target.min = '0';
                target.max = '100';
                target.step = '1';
            }
            
            // Ensure only integers
            const value = target.value;
            const intValue = parseInt(value) || 0;
            if (value !== intValue.toString()) {
                target.value = intValue;
            }
        }
        
        // Save user data when they modify writer or publisher fields
        if (target.classList.contains('additional-input') && 
            (target.classList.contains('writer-input') || 
             target.classList.contains('ipi-input') || 
             target.classList.contains('split-input'))) {
            
            const expandableContent = target.closest('.expandable-content');
            if (expandableContent) {
                const row = expandableContent.previousElementSibling;
                const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(row);
                if (rowIndex !== -1) {
                    // Use setTimeout to save after the input value has been updated
                    setTimeout(() => {
                        saveUserData(rowIndex, expandableContent);
                    }, 0);
                }
            }
        }
    });
});

// Function to remove a row when minus button is clicked
function removeRow(minusButton) {
    const row = minusButton.closest('.additional-field-row');
    if (row) {
        // Get the container to update split totals
        const container = row.closest('.expandable-content');
        if (container) {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.previousElementSibling);
            
            // Remove the row
            row.remove();
            
            // Update split totals after removing the row
            if (rowIndex !== -1) {
                updateSplitTotalsInRealTime(rowIndex);
            }
            
            // Manage scrollbars after removing the row
            manageScrollbars(container);
        }
    }
}

// Function to manage scrollbars for writer and publisher boxes
function manageScrollbars(container) {
    const middleInfoTop = container.querySelector('.middle-info-top');
    if (!middleInfoTop) return;
    
    const rows = middleInfoTop.querySelectorAll('.additional-field-row');
    
    // Count the number of rows (excluding add buttons)
    const rowCount = rows.length;
    
    // Enable scrolling after 3 rows (4 total including initial row)
    if (rowCount > 3) {
        // Set max height to accommodate 4 rows plus some space for the split total
        const maxHeight = 175; // Adjust this value based on your row height
        middleInfoTop.style.maxHeight = maxHeight + 'px';
        middleInfoTop.style.overflowY = 'auto';
        middleInfoTop.style.overflowX = 'hidden';
    } else {
        middleInfoTop.style.maxHeight = 'none';
        middleInfoTop.style.overflowY = 'visible';
    }
}

// Update the addWriterRow function to call manageScrollbars
function addWriterRow(container) {
    console.log('Adding new writer row');
    
    // Get the middle-info-top container
    const middleInfoTop = container.querySelector('.middle-info-top');
    if (!middleInfoTop) {
        console.log('Middle info top container not found');
        return;
    }
    
    const newRow = document.createElement('div');
    newRow.className = 'additional-field-row';
    
    const minusButton = document.createElement('button');
    minusButton.className = 'remove-row-btn';
    minusButton.textContent = '-';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'additional-input writer-input';
    nameInput.placeholder = 'Writer';
    
    const ipiInput = document.createElement('input');
    ipiInput.type = 'text';
    ipiInput.className = 'additional-input ipi-input';
    ipiInput.placeholder = 'Writer IPI';
    
    const shareInput = document.createElement('input');
    shareInput.type = 'text';
    shareInput.className = 'additional-input split-input';
    shareInput.placeholder = 'Split';
    
    const linkText = document.createElement('span');
    linkText.className = 'link-to-publisher';
    linkText.textContent = 'Link to Publisher';
    
    newRow.appendChild(minusButton);
    newRow.appendChild(nameInput);
    newRow.appendChild(ipiInput);
    newRow.appendChild(shareInput);
    newRow.appendChild(linkText);
    
    // Insert into middle-info-top container
    middleInfoTop.appendChild(newRow);
    
    // Move the addWriterBtn to always be after the last row
    const addWriterBtn = middleInfoTop.querySelector('.add-writer-btn');
    if (addWriterBtn) {
        // Remove from current position and append to end
        addWriterBtn.remove();
        middleInfoTop.appendChild(addWriterBtn);
    }
    
    // Remove any duplicate buttons that might exist
    const allButtons = middleInfoTop.querySelectorAll('.add-writer-btn');
    if (allButtons.length > 1) {
        for (let i = 0; i < allButtons.length - 1; i++) {
            allButtons[i].remove();
        }
    }
    
    // Add split total listeners to the new row
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
    addSplitTotalListeners(container, rowIndex);
    
    // Manage scrollbars after adding the row
    manageScrollbars(container);
    
    console.log('New writer row added to middle-info-top container');
}

// Update the addPublisherRow function to call manageScrollbars
function addPublisherRow(container) {
    console.log('Adding new publisher row');
    
    // Get the middle-info-top container
    const middleInfoTop = container.querySelector('.middle-info-top');
    if (!middleInfoTop) {
        console.log('Middle info top container not found');
        return;
    }
    
    const newRow = document.createElement('div');
    newRow.className = 'additional-field-row';
    
    const minusButton = document.createElement('button');
    minusButton.className = 'remove-row-btn';
    minusButton.textContent = '-';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'additional-input writer-input';
    nameInput.placeholder = 'Publisher';
    
    const ipiInput = document.createElement('input');
    ipiInput.type = 'text';
    ipiInput.className = 'additional-input ipi-input';
    ipiInput.placeholder = 'Publisher IPI';
    
    const shareInput = document.createElement('input');
    shareInput.type = 'text';
    shareInput.className = 'additional-input split-input';
    shareInput.placeholder = 'Share';
    
    const linkText = document.createElement('span');
    linkText.className = 'link-to-publisher';
    linkText.textContent = 'unlinked';
    linkText.style.cursor = 'default';
    linkText.style.color = '#6c757d';
    
    newRow.appendChild(minusButton);
    newRow.appendChild(nameInput);
    newRow.appendChild(ipiInput);
    newRow.appendChild(shareInput);
    newRow.appendChild(linkText);
    
    // Insert into middle-info-top container
    middleInfoTop.appendChild(newRow);
    
    // Move the addPublisherBtn to always be after the last row
    const addPublisherBtn = middleInfoTop.querySelector('.add-publisher-btn');
    if (addPublisherBtn) {
        // Remove from current position and append to end
        addPublisherBtn.remove();
        middleInfoTop.appendChild(addPublisherBtn);
    }
    
    // Remove any duplicate buttons that might exist
    const allButtons = middleInfoTop.querySelectorAll('.add-publisher-btn');
    if (allButtons.length > 1) {
        for (let i = 0; i < allButtons.length - 1; i++) {
            allButtons[i].remove();
        }
    }
    
    // Add split total listeners to the new row
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.closest('.expandable-content').previousElementSibling);
    addSplitTotalListeners(container, rowIndex);
    
    // Manage scrollbars after adding the row
    manageScrollbars(container);
    
    console.log('New publisher row added to middle-info-top container');
}

// Update the removeRow function to call manageScrollbars
function removeRow(minusButton) {
    const row = minusButton.closest('.additional-field-row');
    if (row) {
        // Get the container to update split totals
        const container = row.closest('.expandable-content');
        if (container) {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(container.previousElementSibling);
            
            // Remove the row
            row.remove();
            
            // Update split totals after removing the row
            if (rowIndex !== -1) {
                updateSplitTotalsInRealTime(rowIndex);
            }
            
            // Manage scrollbars after removing the row
            manageScrollbars(container);
        }
    }
}
