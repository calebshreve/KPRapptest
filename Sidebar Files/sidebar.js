console.log('Sidebar.js loaded successfully');

// Sidebar Functions
function toggleSidebar() {
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    console.log('Toggle sidebar clicked');
    console.log('Current classes:', sidebarWrapper.classList.toString());
    sidebarWrapper.classList.toggle('collapsed');
    console.log('After toggle classes:', sidebarWrapper.classList.toString());
    localStorage.setItem('sidebarState', sidebarWrapper.classList.contains('collapsed') ? 'collapsed' : 'expanded');
}

// Test function to manually trigger sidebar toggle
function testSidebarToggle() {
    console.log('Testing sidebar toggle manually');
    toggleSidebar();
}

// Theme Functions
function updateThemeUI(theme) {
    const isDarkMode = theme === 'dark-mode';
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.querySelector('.theme-switch input[type="checkbox"]').checked = isDarkMode;

    // Update chart if it exists (for dashboard integration)
    if (typeof expenseChart !== 'undefined' && expenseChart) {
        const colors = getChartColors();
        expenseChart.data.datasets[0].backgroundColor = colors.backgroundColor;
        expenseChart.data.datasets[0].borderColor = colors.borderColor;
        expenseChart.options.plugins.legend.labels.color = colors.labelColor;
        expenseChart.update();
    }
}

function switchTheme(e) {
    const newTheme = e.target.checked ? 'dark-mode' : 'light';
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
}

// Event Listeners
function initializeSidebarEventListeners() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const themeSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    
    console.log('Initializing sidebar event listeners');
    console.log('Sidebar toggle element:', sidebarToggle);
    console.log('Theme switch element:', themeSwitch);
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
        console.log('Sidebar toggle event listener added');
    } else {
        console.error('Sidebar toggle element not found!');
    }
    if (themeSwitch) {
        themeSwitch.addEventListener('change', switchTheme);
        console.log('Theme switch event listener added');
    } else {
        console.error('Theme switch element not found!');
    }
}

// Sidebar Initialization
function initializeSidebar() {
    initializeSidebarEventListeners();
    
    // Set initial theme and sidebar state
    const currentTheme = localStorage.getItem('theme') || 'light';
    updateThemeUI(currentTheme);
    
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'collapsed') {
        toggleSidebar();
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleSidebar,
        updateThemeUI,
        switchTheme,
        initializeSidebarEventListeners,
        initializeSidebar
    };
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing sidebar');
    initializeSidebar();
});

// Also try initializing on window load as backup
window.addEventListener('load', function() {
    console.log('Window Loaded - Checking sidebar initialization');
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    console.log('Sidebar wrapper found:', !!sidebarWrapper);
    console.log('Sidebar toggle found:', !!sidebarToggle);
    if (sidebarWrapper && sidebarToggle) {
        console.log('Both elements found, re-initializing');
        initializeSidebar();
    }
});

// Make testSidebarToggle globally available
window.testSidebarToggle = testSidebarToggle; 