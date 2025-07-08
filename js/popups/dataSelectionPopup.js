// Data Selection Popup Functions
// This file contains functions for handling data selection and conflict resolution popups

// Function to show data selection popup
function showDataSelectionPopup(song, targetRow) {
    console.log('showDataSelectionPopup called');
    
    // Remove existing popup if any
    const existingPopup = document.querySelector('.data-selection-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Get current row data
    const inputs = targetRow.querySelectorAll('input');
    const currentData = {
        artist: inputs[0] ? inputs[0].value.trim() : '',
        title: inputs[1] ? inputs[1].value.trim() : '',
        iswc: inputs[2] ? inputs[2].value.trim() : '',
        isrc: inputs[3] ? inputs[3].value.trim() : '',
        splitType: inputs[4] ? inputs[4].value : ''
    };
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'data-selection-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.zIndex = '1002';
    
    // Define the data fields to import
    const dataFields = [
        { 
            key: 'artist', 
            label: 'Artist', 
            importValue: song.artistName, 
            currentValue: currentData.artist,
            additionalValues: song.additionalArtists || []
        },
        { 
            key: 'title', 
            label: 'Work Title', 
            importValue: song.songTitle, 
            currentValue: currentData.title,
            additionalValues: song.additionalTitles || []
        },
        { 
            key: 'iswc', 
            label: 'ISWC', 
            importValue: song.ISWC, 
            currentValue: currentData.iswc,
            additionalValues: []
        },
        { 
            key: 'isrc', 
            label: 'ISRC', 
            importValue: song.ISRC, 
            currentValue: currentData.isrc,
            additionalValues: song.additionalISRCs || []
        },
        { 
            key: 'splitType', 
            label: 'Split Type', 
            importValue: song.splitType, 
            currentValue: currentData.splitType,
            additionalValues: []
        }
    ];
    
    // Generate checkboxes for each data field
    let checkboxesHTML = '';
    dataFields.forEach(field => {
        const hasConflict = field.currentValue && field.currentValue !== '' && field.currentValue !== '0';
        const conflictClass = hasConflict ? 'conflict-field' : '';
        const conflictIcon = hasConflict ? '⚠️ ' : '';
        
        // Default to checking only artist and splitType (unless there's a conflict)
        const shouldCheck = (field.key === 'artist' || field.key === 'splitType') && !hasConflict;
        
        // Build the import values list
        let importValuesList = [field.importValue];
        if (field.additionalValues && field.additionalValues.length > 0) {
            importValuesList = importValuesList.concat(field.additionalValues);
        }
        
        const primaryValue = importValuesList[0];
        const additionalValues = importValuesList.slice(1);
        
        let additionalValuesHTML = '';
        if (additionalValues.length > 0) {
            additionalValuesHTML = `
                <div style="margin-left: 25px; margin-top: 3px; color: #007bff; font-size: 13px;">
                    ${additionalValues.map(value => `• ${value}`).join(' ')}
                </div>
            `;
        }
        
        checkboxesHTML += `
            <div class="data-field ${conflictClass}" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 5px; ${hasConflict ? 'background-color: #fff3cd; border-color: #ffeaa7;' : ''}">
                <label style="display: flex; align-items: center; cursor: pointer; font-weight: bold; margin-bottom: 5px;">
                    <input type="checkbox" data-field="${field.key}" style="margin-right: 10px;" ${shouldCheck ? 'checked' : ''}>
                    ${conflictIcon}${field.label}:&nbsp;<span style="color: #007bff; font-weight: normal;">${primaryValue}</span>
                </label>
                ${additionalValuesHTML}
                ${hasConflict ? `<div style="margin-left: 25px; margin-top: 3px; color: #dc3545; font-size: 13px;"><strong>Current:</strong> ${field.currentValue}</div>` : ''}
            </div>
        `;
    });
    
    popup.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 300px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Select Data to Import</h3>
            <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
                Choose which pieces of data you want to import from "${song.songTitle}":
            </p>
            
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; border: 1px solid #dee2e6;">
                    <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #333;">Import to which rows?</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <label style="font-size: 13px; color: #666;">From:</label>
                            <input type="number" id="start-row" min="1" value="1" style="width: 60px; padding: 5px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <label style="font-size: 13px; color: #666;">To:</label>
                            <input type="number" id="end-row" min="1" value="1" style="width: 60px; padding: 5px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px;">
                        </div>
                    </div>
                </div>
                
                ${checkboxesHTML}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancel-data-selection" style="padding: 12px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    Cancel
                </button>
                <button id="import-selected-data" style="padding: 12px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    Import Selected Data
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Initialize row range inputs with current row number
    const currentRowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow) + 1;
    const startRowInput = popup.querySelector('#start-row');
    const endRowInput = popup.querySelector('#end-row');
    
    if (startRowInput && endRowInput) {
        startRowInput.value = currentRowIndex;
        endRowInput.value = currentRowIndex;
    }
    
    // Add event listener for import button
    const importButton = popup.querySelector('#import-selected-data');
    importButton.addEventListener('click', function() {
        const selectedFields = [];
        const checkboxes = popup.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            selectedFields.push(checkbox.getAttribute('data-field'));
        });
        
        if (selectedFields.length > 0) {
            // Get row range values
            const startRow = parseInt(document.getElementById('start-row').value) || 1;
            const endRow = parseInt(document.getElementById('end-row').value) || 1;
            
            // Validate row range
            if (startRow > endRow) {
                alert('Start row cannot be greater than end row.');
                return;
            }
            
            // Check for conflicts with selected fields in the target row
            const conflicts = selectedFields.filter(fieldKey => {
                const field = dataFields.find(f => f.key === fieldKey);
                return field.currentValue && field.currentValue !== '' && field.currentValue !== '0';
            });
            
            if (conflicts.length > 0) {
                // Show conflict warning popup
                showConflictWarningPopup(song, targetRow, selectedFields, conflicts, dataFields, startRow, endRow);
            } else {
                // Apply import directly (no conflicts)
                applySelectedDataToRange(song, selectedFields, 'replace', startRow, endRow);
            }
        }
        
        popup.remove();
    });
    
    // Add event listener for cancel button
    const cancelButton = popup.querySelector('#cancel-data-selection');
    cancelButton.addEventListener('click', function() {
        popup.remove();
    });
    
    // Close popup on overlay click
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Function to show conflict warning popup
function showConflictWarningPopup(song, targetRow, selectedFields, conflicts, dataFields, startRow, endRow) {
    console.log('showConflictWarningPopup called');
    
    // Remove existing popup if any
    const existingPopup = document.querySelector('.conflict-warning-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Get current row data
    const inputs = targetRow.querySelectorAll('input');
    const currentData = {
        artist: inputs[0] ? inputs[0].value.trim() : '',
        title: inputs[1] ? inputs[1].value.trim() : '',
        iswc: inputs[2] ? inputs[2].value.trim() : '',
        isrc: inputs[3] ? inputs[3].value.trim() : '',
        splitType: inputs[4] ? inputs[4].value : ''
    };
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'conflict-warning-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.zIndex = '1003';
    
    // Generate conflict details
    let conflictDetailsHTML = '';
    conflicts.forEach(conflictKey => {
        const field = dataFields.find(f => f.key === conflictKey);
        let currentValueDisplay = field.currentValue;
        
        // Special handling for artist field to show "+ more" if there are multiple artists
        if (conflictKey === 'artist') {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
            const rowData = registrationDatabase.rows[rowIndex];
            const totalArtists = rowData ? rowData.artists.length : 0;
            
            // If there are multiple artists, show "+ more" text
            if (totalArtists > 1) {
                currentValueDisplay = `${field.currentValue} + more`;
            }
        }
        
        conflictDetailsHTML += `
            <div style="margin-bottom: 10px; padding: 10px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                <div style="font-weight: bold; margin-bottom: 5px;">${field.label}:</div>
                <div style="color: #dc3545;"><strong>Current:</strong> ${currentValueDisplay}</div>
                <div style="color: #007bff;"><strong>Import:</strong> ${field.importValue}</div>
            </div>
        `;
    });
    
    popup.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); max-width: 600px; width: 90%;">
            <h3 style="margin-top: 0; margin-bottom: 20px; color: #d32f2f;">⚠️ Data Conflicts Detected</h3>
            <p style="margin-bottom: 20px; color: #333; line-height: 1.5;">
                Some of the data you selected conflicts with existing information in row ${startRow}.
            </p>
            <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
                Data will be applied to rows ${startRow} to ${endRow}.
            </p>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px; color: #666; font-size: 14px;">Conflicts:</h4>
                ${conflictDetailsHTML}
            </div>
            
            <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
                How would you like to handle these conflicts?
            </p>
            
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                <div style="display: flex; gap: 10px;">
                    <button id="cancel-conflict" style="padding: 12px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        Cancel
                    </button>
                    <button id="merge-conflict" style="padding: 12px 20px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        Merge
                    </button>
                    <button id="replace-conflict" style="padding: 12px 20px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        Replace
                    </button>
                </div>
                <div style="font-size: 12px; color: #666; text-align: center;">*Merge keeps the original entry when field can't contain two entries</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Add event listeners for buttons
    const cancelButton = popup.querySelector('#cancel-conflict');
    cancelButton.addEventListener('click', function() {
        popup.remove();
        // Re-show the data selection popup
        showDataSelectionPopup(song, targetRow);
    });
    
    const mergeButton = popup.querySelector('#merge-conflict');
    mergeButton.addEventListener('click', function() {
        popup.remove();
        applySelectedDataToRange(song, selectedFields, 'merge', startRow, endRow);
    });
    
    const replaceButton = popup.querySelector('#replace-conflict');
    replaceButton.addEventListener('click', function() {
        popup.remove();
        applySelectedDataToRange(song, selectedFields, 'replace', startRow, endRow);
    });
    
    // Close popup on overlay click
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Function to apply selected data to a range of rows
function applySelectedDataToRange(song, selectedFields, mode = 'replace', startRow, endRow) {
    console.log(`Applying data to rows ${startRow} to ${endRow}`);
    
    // Get current number of rows
    const currentRows = document.querySelectorAll('.registration-row');
    const currentRowCount = currentRows.length;
    
    // Calculate how many rows we need
    const neededRows = Math.max(endRow, currentRowCount);
    
    // If we need more rows than currently exist, create them
    if (neededRows > currentRowCount) {
        console.log(`Creating ${neededRows - currentRowCount} additional rows`);
        
        // Get the registration count input and update it
        const registrationCountInput = document.querySelector('.registration-count-input');
        if (registrationCountInput) {
            registrationCountInput.value = neededRows;
            // Trigger the blur event to generate new rows (this is what the input listens for)
            registrationCountInput.dispatchEvent(new Event('blur'));
        }
    }
    
    // Wait a moment for rows to be created, then apply data
    setTimeout(() => {
        // Get all rows after potential creation
        const allRows = document.querySelectorAll('.registration-row');
        
        // Apply data to each row in the range
        for (let i = startRow - 1; i < endRow && i < allRows.length; i++) {
            const targetRow = allRows[i];
            applySelectedData(song, targetRow, selectedFields, mode);
        }
        
        console.log(`Applied data to ${Math.min(endRow, allRows.length) - (startRow - 1)} rows`);
    }, 100);
}

// Function to apply selected data to a row
function applySelectedData(song, targetRow, selectedFields, mode = 'replace') {
    const inputs = targetRow.querySelectorAll('input');
    if (inputs.length >= 5) {
        const fieldMappings = {
            'artist': { index: 0, value: song.artistName },
            'title': { index: 1, value: song.songTitle },
            'iswc': { index: 2, value: song.ISWC },
            'isrc': { index: 3, value: song.ISRC },
            'splitType': { index: 4, value: song.splitType }
        };
        
        selectedFields.forEach(fieldKey => {
            const mapping = fieldMappings[fieldKey];
            if (mapping) {
                const input = inputs[mapping.index];
                const currentValue = input.value.trim();
                
                if (mode === 'replace') {
                    // Replace mode: always apply the data
                    input.value = mapping.value;
                    
                    // Special handling for artist field
                    if (fieldKey === 'artist') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Replace all artists with primary artist plus additional artists
                        const allArtists = [mapping.value];
                        if (song.additionalArtists && Array.isArray(song.additionalArtists)) {
                            allArtists.push(...song.additionalArtists);
                        }
                        registrationDatabase.rows[rowIndex].artists = allArtists;
                    }
                    
                    // Special handling for title field
                    if (fieldKey === 'title') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Replace all titles with primary title plus additional titles
                        const allTitles = [mapping.value];
                        if (song.additionalTitles && Array.isArray(song.additionalTitles)) {
                            allTitles.push(...song.additionalTitles);
                        }
                        registrationDatabase.rows[rowIndex].titles = allTitles;
                    }
                    
                    // Special handling for ISRC field
                    if (fieldKey === 'isrc') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Replace all ISRCs with primary ISRC plus additional ISRCs
                        const allISRCs = [mapping.value];
                        if (song.additionalISRCs && Array.isArray(song.additionalISRCs)) {
                            allISRCs.push(...song.additionalISRCs);
                        }
                        registrationDatabase.rows[rowIndex].isrcs = allISRCs;
                    }
                    
                    // Special handling for ISWC field
                    if (fieldKey === 'iswc') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Replace all ISWC
                        registrationDatabase.rows[rowIndex].iswc = [mapping.value];
                    }
                    
                    // Special handling for split type
                    if (fieldKey === 'splitType') {
                        if (input.value !== '0') {
                            input.style.color = '#000';
                        } else {
                            input.style.color = '#ccc';
                        }
                        
                        // Trigger population of expandable fields if split type was set
                        if (input.value !== '0') {
                            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                            targetRow.setAttribute('data-split-type', input.value);
                            populateInputFields(rowIndex);
                        }
                    }
                } else if (mode === 'merge') {
                    // Merge mode: only apply if field is empty or has default value
                    if (!currentValue || currentValue === '0') {
                        input.value = mapping.value;
                        
                        // Special handling for split type
                        if (fieldKey === 'splitType') {
                            if (input.value !== '0') {
                                input.style.color = '#000';
                            } else {
                                input.style.color = '#ccc';
                            }
                        }
                    }
                    
                    // Special handling for artist field in merge mode
                    // Always add to database if artist field is selected, regardless of input state
                    if (fieldKey === 'artist') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [] };
                        }
                        
                        // Add primary artist if not already present
                        if (!registrationDatabase.rows[rowIndex].artists.includes(mapping.value)) {
                            registrationDatabase.rows[rowIndex].artists.push(mapping.value);
                            console.log('Artist added to database in merge mode:', mapping.value, 'in row', rowIndex);
                        }
                        
                        // Add additional artists if they exist
                        if (song.additionalArtists && Array.isArray(song.additionalArtists)) {
                            song.additionalArtists.forEach(artist => {
                                if (!registrationDatabase.rows[rowIndex].artists.includes(artist)) {
                                    registrationDatabase.rows[rowIndex].artists.push(artist);
                                    console.log('Additional artist added to database in merge mode:', artist, 'in row', rowIndex);
                                }
                            });
                        }
                    }
                    
                    // Special handling for title field in merge mode
                    if (fieldKey === 'title') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Add primary title if not already present
                        if (!registrationDatabase.rows[rowIndex].titles.includes(mapping.value)) {
                            registrationDatabase.rows[rowIndex].titles.push(mapping.value);
                            console.log('Title added to database in merge mode:', mapping.value, 'in row', rowIndex);
                        }
                        
                        // Add additional titles if they exist
                        if (song.additionalTitles && Array.isArray(song.additionalTitles)) {
                            song.additionalTitles.forEach(title => {
                                if (!registrationDatabase.rows[rowIndex].titles.includes(title)) {
                                    registrationDatabase.rows[rowIndex].titles.push(title);
                                    console.log('Additional title added to database in merge mode:', title, 'in row', rowIndex);
                                }
                            });
                        }
                    }
                    
                    // Special handling for ISRC field in merge mode
                    if (fieldKey === 'isrc') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Add primary ISRC if not already present
                        if (!registrationDatabase.rows[rowIndex].isrcs.includes(mapping.value)) {
                            registrationDatabase.rows[rowIndex].isrcs.push(mapping.value);
                            console.log('ISRC added to database in merge mode:', mapping.value, 'in row', rowIndex);
                        }
                        
                        // Add additional ISRCs if they exist
                        if (song.additionalISRCs && Array.isArray(song.additionalISRCs)) {
                            song.additionalISRCs.forEach(isrc => {
                                if (!registrationDatabase.rows[rowIndex].isrcs.includes(isrc)) {
                                    registrationDatabase.rows[rowIndex].isrcs.push(isrc);
                                    console.log('Additional ISRC added to database in merge mode:', isrc, 'in row', rowIndex);
                                }
                            });
                        }
                    }
                    
                    // Special handling for ISWC field in merge mode
                    // Always add to database if ISWC field is selected, regardless of input state
                    if (fieldKey === 'iswc') {
                        const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
                        if (!registrationDatabase.rows[rowIndex]) {
                            registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                        }
                        
                        // Add ISWC if not already present
                        if (!registrationDatabase.rows[rowIndex].iswc.includes(mapping.value)) {
                            registrationDatabase.rows[rowIndex].iswc.push(mapping.value);
                            console.log('ISWC added to database in merge mode:', mapping.value, 'in row', rowIndex);
                        }
                    }
                }
            }
        });
    }
    
    // Update "+ more" visibility for artist field
    const artistWrapper = targetRow.querySelector('.custom-input-wrapper');
    if (artistWrapper && artistWrapper.updateMoreArtists) {
        artistWrapper.updateMoreArtists();
    }
    
    // Update "+ more" visibility for title field
    const titleWrapper = targetRow.querySelector('.custom-title-input-wrapper');
    if (titleWrapper && titleWrapper.updateMoreTitles) {
        titleWrapper.updateMoreTitles();
    }
    
    // Update "+ more" visibility for ISRC field
    const isrcWrapper = targetRow.querySelector('.custom-isrc-input-wrapper');
    if (isrcWrapper && isrcWrapper.updateMoreIsrcs) {
        isrcWrapper.updateMoreIsrcs();
    }
    
    // Update artists list in expanded view
    const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(targetRow);
    populateArtistsList(rowIndex);
    populateTitlesList(rowIndex);
    
    // Update ISRCs list in expanded view
    populateIsrcsList(rowIndex);
    
    // Update ISWC list in expanded view
    populateIswcList(rowIndex);
    
    // Update color for split type input
    if (inputs[4].value !== '0') {
        inputs[4].style.color = '#000';
    } else {
        inputs[4].style.color = '#ccc';
    }
} 