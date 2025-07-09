// lockedState.js - Handles locked state functionality for registration rows

// Function to lock a specific row
function lockRow(rowIndex) {
    console.log('Locking row:', rowIndex);
    
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) {
        console.log('Row not found for index:', rowIndex);
        return;
    }
    
    // Set the row as locked
    row.setAttribute('data-locked', 'true');
    
    // Hide all "+ add" text elements
    hideAddElements(row);
    
    // Disable all input fields and checkboxes
    disableInputs(row);
    
    // Add event listeners to show lock message
    addLockMessageListeners(row);
    
    console.log('Row', rowIndex, 'locked successfully');
}

// Function to unlock a specific row
function unlockRow(rowIndex) {
    console.log('Unlocking row:', rowIndex);
    
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) {
        console.log('Row not found for index:', rowIndex);
        return;
    }
    
    // Remove the locked attribute
    row.removeAttribute('data-locked');
    
    // Show all "+ add" text elements
    showAddElements(row);
    
    // Enable all input fields and checkboxes
    enableInputs(row);
    
    // Remove lock message listeners
    removeLockMessageListeners(row);
    
    console.log('Row', rowIndex, 'unlocked successfully');
}

// Function to hide all "+ add" text elements
function hideAddElements(row) {
    // Hide "+ another artist" text
    const moreArtistsText = row.querySelector('.more-artists-overlay');
    if (moreArtistsText) {
        moreArtistsText.style.display = 'none';
    }
    
    // Hide "+ additional title" text
    const moreTitlesText = row.querySelector('.more-titles-overlay');
    if (moreTitlesText) {
        moreTitlesText.style.display = 'none';
    }
    
    // Hide "+ additional ISRC" text
    const moreIsrcsText = row.querySelector('.more-isrcs-overlay');
    if (moreIsrcsText) {
        moreIsrcsText.style.display = 'none';
    }
    
    // Hide "+ add another writer" button
    const addWriterBtn = row.querySelector('.add-writer-btn');
    if (addWriterBtn) {
        addWriterBtn.style.display = 'none';
    }
    
    // Hide "+ add another publisher" button
    const addPublisherBtn = row.querySelector('.add-publisher-btn');
    if (addPublisherBtn) {
        addPublisherBtn.style.display = 'none';
    }
    
    // Hide any other clickable text elements with cursor pointer
    const clickableTexts = row.querySelectorAll('[style*="cursor: pointer"], [style*="cursor:pointer"]');
    clickableTexts.forEach(element => {
        if (element.textContent && element.textContent.trim().startsWith('+')) {
            element.style.display = 'none';
        }
    });
    
    // Hide expandable content if it exists
    const expandableContent = row.nextElementSibling;
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        // Hide "+ add" elements in expandable content
        const expandableAddElements = expandableContent.querySelectorAll('.add-writer-btn, .add-publisher-btn, [style*="cursor: pointer"], [style*="cursor:pointer"]');
        expandableAddElements.forEach(element => {
            if (element.textContent && element.textContent.trim().startsWith('+')) {
                element.style.display = 'none';
            }
        });
    }
}

// Function to show all "+ add" text elements
function showAddElements(row) {
    // Show "+ another artist" text if it should be visible
    const moreArtistsText = row.querySelector('.more-artists-overlay');
    if (moreArtistsText && moreArtistsText.updateMoreArtists) {
        moreArtistsText.updateMoreArtists();
    }
    
    // Show "+ additional title" text if it should be visible
    const moreTitlesText = row.querySelector('.more-titles-overlay');
    if (moreTitlesText && moreTitlesText.updateMoreTitles) {
        moreTitlesText.updateMoreTitles();
    }
    
    // Show "+ additional ISRC" text if it should be visible
    const moreIsrcsText = row.querySelector('.more-isrcs-overlay');
    if (moreIsrcsText && moreIsrcsText.updateMoreIsrcs) {
        moreIsrcsText.updateMoreIsrcs();
    }
    
    // Show "+ add another writer" button
    const addWriterBtn = row.querySelector('.add-writer-btn');
    if (addWriterBtn) {
        addWriterBtn.style.display = 'block';
    }
    
    // Show "+ add another publisher" button
    const addPublisherBtn = row.querySelector('.add-publisher-btn');
    if (addPublisherBtn) {
        addPublisherBtn.style.display = 'block';
    }
    
    // Show any other clickable text elements that were hidden
    const clickableTexts = row.querySelectorAll('[style*="cursor: pointer"], [style*="cursor:pointer"]');
    clickableTexts.forEach(element => {
        if (element.textContent && element.textContent.trim().startsWith('+')) {
            element.style.display = '';
        }
    });
    
    // Show expandable content if it exists
    const expandableContent = row.nextElementSibling;
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        // Show "+ add" elements in expandable content
        const expandableAddElements = expandableContent.querySelectorAll('.add-writer-btn, .add-publisher-btn, [style*="cursor: pointer"], [style*="cursor:pointer"]');
        expandableAddElements.forEach(element => {
            if (element.textContent && element.textContent.trim().startsWith('+')) {
                element.style.display = '';
            }
        });
    }
}

// Function to disable all input fields and checkboxes
function disableInputs(row) {
    // Disable all input fields in the main row
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.backgroundColor = '#f5f5f5';
        input.style.color = '#999';
        input.style.cursor = 'not-allowed';
    });
    
    // Disable checkboxes
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.disabled = true;
        checkbox.style.cursor = 'not-allowed';
    });
    
    // Disable split type arrow buttons
    const arrowButtons = row.querySelectorAll('.arrow-up, .arrow-down');
    arrowButtons.forEach(button => {
        button.disabled = true;
        button.style.cursor = 'not-allowed';
        button.style.opacity = '0.5';
    });
    
    // Disable dropdown in expandable content if it exists
    const expandableContent = row.nextElementSibling;
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
        if (splitTypeDropdown) {
            splitTypeDropdown.disabled = true;
            splitTypeDropdown.style.cursor = 'not-allowed';
            splitTypeDropdown.style.opacity = '0.5';
        }
        
        const expandableInputs = expandableContent.querySelectorAll('input');
        expandableInputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#f5f5f5';
            input.style.color = '#999';
            input.style.cursor = 'not-allowed';
        });
        
        const expandableCheckboxes = expandableContent.querySelectorAll('input[type="checkbox"]');
        expandableCheckboxes.forEach(checkbox => {
            checkbox.disabled = true;
            checkbox.style.cursor = 'not-allowed';
        });
    }
}

// Function to enable all input fields and checkboxes
function enableInputs(row) {
    // Enable all input fields in the main row
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = false;
        input.style.backgroundColor = '';
        input.style.color = '';
        input.style.cursor = '';
    });
    
    // Enable checkboxes
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
        checkbox.style.cursor = '';
    });
    
    // Enable split type arrow buttons
    const arrowButtons = row.querySelectorAll('.arrow-up, .arrow-down');
    arrowButtons.forEach(button => {
        button.disabled = false;
        button.style.cursor = '';
        button.style.opacity = '';
    });
    
    // Enable dropdown in expandable content if it exists
    const expandableContent = row.nextElementSibling;
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
        if (splitTypeDropdown) {
            splitTypeDropdown.disabled = false;
            splitTypeDropdown.style.cursor = '';
            splitTypeDropdown.style.opacity = '';
        }
        
        const expandableInputs = expandableContent.querySelectorAll('input');
        expandableInputs.forEach(input => {
            input.disabled = false;
            input.style.backgroundColor = '';
            input.style.color = '';
            input.style.cursor = '';
        });
        
        const expandableCheckboxes = expandableContent.querySelectorAll('input[type="checkbox"]');
        expandableCheckboxes.forEach(checkbox => {
            checkbox.disabled = false;
            checkbox.style.cursor = '';
        });
    }
}

// Function to add event listeners for lock message
function addLockMessageListeners(row) {
    // Add listeners to all input fields
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('click', showLockMessage);
        input.addEventListener('keydown', showLockMessage);
        input.addEventListener('focus', showLockMessage);
    });
    
    // Add listeners to checkboxes
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', showLockMessage);
    });
    
    // Add listeners to split type arrow buttons
    const arrowButtons = row.querySelectorAll('.arrow-up, .arrow-down');
    arrowButtons.forEach(button => {
        button.addEventListener('click', showLockMessage);
    });
    
    // Add listeners to expandable content if it exists
    const expandableContent = row.nextElementSibling;
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
        if (splitTypeDropdown) {
            splitTypeDropdown.addEventListener('click', showLockMessage);
            splitTypeDropdown.addEventListener('change', showLockMessage);
        }
        
        const expandableInputs = expandableContent.querySelectorAll('input');
        expandableInputs.forEach(input => {
            input.addEventListener('click', showLockMessage);
            input.addEventListener('keydown', showLockMessage);
            input.addEventListener('focus', showLockMessage);
        });
        
        const expandableCheckboxes = expandableContent.querySelectorAll('input[type="checkbox"]');
        expandableCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('click', showLockMessage);
        });
    }
}

// Function to remove lock message listeners
function removeLockMessageListeners(row) {
    // Remove listeners from all input fields
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.removeEventListener('click', showLockMessage);
        input.removeEventListener('keydown', showLockMessage);
        input.removeEventListener('focus', showLockMessage);
    });
    
    // Remove listeners from checkboxes
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('click', showLockMessage);
    });
    
    // Remove listeners from split type arrow buttons
    const arrowButtons = row.querySelectorAll('.arrow-up, .arrow-down');
    arrowButtons.forEach(button => {
        button.removeEventListener('click', showLockMessage);
    });
    
    // Remove listeners from expandable content if it exists
    const expandableContent = row.nextElementSibling;
    if (expandableContent && expandableContent.classList.contains('expandable-content')) {
        const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
        if (splitTypeDropdown) {
            splitTypeDropdown.removeEventListener('click', showLockMessage);
            splitTypeDropdown.removeEventListener('change', showLockMessage);
        }
        
        const expandableInputs = expandableContent.querySelectorAll('input');
        expandableInputs.forEach(input => {
            input.removeEventListener('click', showLockMessage);
            input.removeEventListener('keydown', showLockMessage);
            input.removeEventListener('focus', showLockMessage);
        });
        
        const expandableCheckboxes = expandableContent.querySelectorAll('input[type="checkbox"]');
        expandableCheckboxes.forEach(checkbox => {
            checkbox.removeEventListener('click', showLockMessage);
        });
    }
}

// Function to show lock message
function showLockMessage(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Create and show the message
    const message = document.createElement('div');
    message.textContent = 'This row is locked. Unlock the row to make changes';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #333;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
        text-align: center;
    `;
    
    document.body.appendChild(message);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 3000);
}

// Function to check if a row is locked
function isRowLocked(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return false;
    
    return row.hasAttribute('data-locked');
}

// Function to restore lock state after content regeneration
function restoreLockState(rowIndex) {
    const row = document.querySelectorAll('.registration-row')[rowIndex];
    if (!row) return;
    
    // Check if the row is locked
    if (row.hasAttribute('data-locked')) {
        console.log('Restoring lock state for row:', rowIndex);
        
        // Re-apply lock state to the regenerated content
        const expandableContent = row.nextElementSibling;
        if (expandableContent && expandableContent.classList.contains('expandable-content')) {
            // Disable inputs in expandable content
            const expandableInputs = expandableContent.querySelectorAll('input');
            expandableInputs.forEach(input => {
                input.disabled = true;
                input.style.backgroundColor = '#f5f5f5';
                input.style.color = '#999';
                input.style.cursor = 'not-allowed';
            });
            
            // Disable checkboxes in expandable content
            const expandableCheckboxes = expandableContent.querySelectorAll('input[type="checkbox"]');
            expandableCheckboxes.forEach(checkbox => {
                checkbox.disabled = true;
                checkbox.style.cursor = 'not-allowed';
            });
            
            // Disable split type dropdown
            const splitTypeDropdown = expandableContent.querySelector('.split-type-dropdown');
            if (splitTypeDropdown) {
                splitTypeDropdown.disabled = true;
                splitTypeDropdown.style.cursor = 'not-allowed';
                splitTypeDropdown.style.opacity = '0.5';
            }
            
            // Hide "+ add" elements in expandable content
            const expandableAddElements = expandableContent.querySelectorAll('.add-writer-btn, .add-publisher-btn, [style*="cursor: pointer"], [style*="cursor:pointer"]');
            expandableAddElements.forEach(element => {
                if (element.textContent && element.textContent.trim().startsWith('+')) {
                    element.style.display = 'none';
                }
            });
            
            // Add lock message listeners to expandable content
            const expandableInputsForListeners = expandableContent.querySelectorAll('input');
            expandableInputsForListeners.forEach(input => {
                input.addEventListener('click', showLockMessage);
                input.addEventListener('keydown', showLockMessage);
                input.addEventListener('focus', showLockMessage);
            });
            
            const expandableCheckboxesForListeners = expandableContent.querySelectorAll('input[type="checkbox"]');
            expandableCheckboxesForListeners.forEach(checkbox => {
                checkbox.addEventListener('click', showLockMessage);
            });
            
            if (splitTypeDropdown) {
                splitTypeDropdown.addEventListener('click', showLockMessage);
                splitTypeDropdown.addEventListener('change', showLockMessage);
            }
        }
    }
}

// Function to save lock states before row regeneration
function saveLockStates() {
    const rows = document.querySelectorAll('.registration-row');
    const lockStates = {};
    
    rows.forEach((row, index) => {
        if (row.hasAttribute('data-locked')) {
            lockStates[index] = true;
        }
    });
    
    console.log('Saved lock states:', lockStates);
    return lockStates;
}

// Function to restore lock states after row regeneration
function restoreLockStates(lockStates) {
    if (!lockStates) return;
    
    console.log('Restoring lock states:', lockStates);
    
    Object.keys(lockStates).forEach(rowIndex => {
        const index = parseInt(rowIndex);
        const row = document.querySelectorAll('.registration-row')[index];
        if (row && lockStates[index]) {
            console.log('Restoring lock state for row:', index);
            
            // Set the locked attribute
            row.setAttribute('data-locked', 'true');
            
            // Update lock icon to locked state
            const lockIcon = row.querySelector('img[src*="lock"]');
            if (lockIcon) {
                lockIcon.src = 'Rego Icons/lockblack.svg';
                lockIcon.title = 'Unlock row';
                lockIcon.alt = 'Locked';
            }
            
            // Hide all "+ add" text elements
            hideAddElements(row);
            
            // Disable all input fields and checkboxes
            disableInputs(row);
            
            // Add event listeners to show lock message
            addLockMessageListeners(row);
        }
    });
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        lockRow,
        unlockRow,
        isRowLocked,
        restoreLockState,
        saveLockStates,
        restoreLockStates
    };
} 