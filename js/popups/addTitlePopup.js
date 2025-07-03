// Add Title Popup Functions
// This file contains the showAddTitlePopup function for handling the add title popup

function showAddTitlePopup(currentRow, onTitleAdded = null, pendingChanges = null, fillInputCallback = null) {
    console.log('showAddTitlePopup called with currentRow:', currentRow);
    
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
    const buttonText = pendingChanges ? 'Add Title' : 'Save Title';
    
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
        <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">Add New Title</h3>
        <p style="margin-bottom: 20px; color: #666;">Enter the title you want to add:</p>
        <input type="text" id="new-title-input" placeholder="Enter title" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; font-size: 14px;">
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="cancel-add-title" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
            <button id="save-title" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">${buttonText}</button>
        </div>
    `;
    
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Focus on input
    const titleInput = popupContent.querySelector('#new-title-input');
    titleInput.focus();
    
    // Save title function
    const saveTitle = function() {
        const titleName = titleInput.value.trim();
        
        if (titleName) {
            const rowIndex = Array.from(document.querySelectorAll('.registration-row')).indexOf(currentRow);
            
            if (pendingChanges) {
                // If we have pending changes, add to pending instead of database
                if (!pendingChanges.addedTitles.includes(titleName)) {
                    pendingChanges.addedTitles.push(titleName);
                    console.log('Title added to pending changes:', titleName);
                    
                    // Call callback to refresh the main popup
                    if (onTitleAdded) {
                        onTitleAdded(titleName);
                    }
                }
            } else {
                // Direct database addition (when not called from main popup)
                if (!registrationDatabase.rows[rowIndex]) {
                    registrationDatabase.rows[rowIndex] = { artists: [], titles: [], isrcs: [], iswc: [] };
                }
                
                if (!registrationDatabase.rows[rowIndex].titles.includes(titleName)) {
                    registrationDatabase.rows[rowIndex].titles.push(titleName);
                    console.log('Title added to database:', titleName, 'in row', rowIndex);
                    
                    // Call callback if provided
                    if (fillInputCallback) {
                        fillInputCallback(titleName);
                    }
                    
                    // Update "+ more" visibility
                    const titleWrapper = currentRow.querySelector('.custom-title-input-wrapper');
                    if (titleWrapper && titleWrapper.updateMoreTitles) {
                        titleWrapper.updateMoreTitles();
                    }
                    
                    // Update titles list in expanded view
                    populateTitlesList(rowIndex);
                }
            }
            
            document.body.removeChild(popupOverlay);
        } else {
            alert('Please enter a title name.');
        }
    };
    
    // Add event listeners
    popupContent.querySelector('#save-title').addEventListener('click', saveTitle);
    popupContent.querySelector('#cancel-add-title').addEventListener('click', function() {
        document.body.removeChild(popupOverlay);
    });
    
    // Enter key to save
    titleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
    
    // Close on overlay click
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            document.body.removeChild(popupOverlay);
        }
    });
} 