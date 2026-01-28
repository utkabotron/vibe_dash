/**
 * Main Application File
 * Orchestrates data loading, filtering, and UI updates
 */

const App = {
    data: {
        raw: [],
        filtered: [],
        projects: []
    },

    filters: {
        project: '',
        dateFrom: '',
        dateTo: ''
    },

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Vibe Analytics Dashboard...');

        // Show loading indicator
        this.showLoading(true);

        try {
            // Load data
            await this.loadData();

            // Initialize filters
            this.initFilters();

            // Apply filters and update UI
            this.applyFilters();

            // Hide loading indicator
            this.showLoading(false);

            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError(true);
            this.showLoading(false);
        }
    },

    /**
     * Load data from API
     */
    async loadData() {
        console.log('Loading data from API...');

        // Fetch reports and projects
        this.data.raw = await API.getReports();
        this.data.projects = await API.getProjects();

        console.log(`Loaded ${this.data.raw.length} records`);
        console.log(`Found ${this.data.projects.length} projects`);
    },

    /**
     * Initialize filters UI
     */
    initFilters() {
        // Populate project dropdown
        const projectSelect = document.getElementById('projectFilter');
        projectSelect.innerHTML = '<option value="">Все проекты</option>';

        this.data.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            projectSelect.appendChild(option);
        });

        // Set date filters to last 30 days by default
        const dateTo = new Date();
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 30);

        document.getElementById('dateFrom').value = this.formatDateInput(dateFrom);
        document.getElementById('dateTo').value = this.formatDateInput(dateTo);

        // Attach event listeners
        document.getElementById('projectFilter').addEventListener('change', () => this.onFilterChange());
        document.getElementById('dateFrom').addEventListener('change', () => this.onFilterChange());
        document.getElementById('dateTo').addEventListener('change', () => this.onFilterChange());
        document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
    },

    /**
     * Format date for input field (YYYY-MM-DD)
     */
    formatDateInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Handle filter change
     */
    onFilterChange() {
        this.filters.project = document.getElementById('projectFilter').value;
        this.filters.dateFrom = document.getElementById('dateFrom').value;
        this.filters.dateTo = document.getElementById('dateTo').value;

        this.applyFilters();
    },

    /**
     * Reset filters to default
     */
    resetFilters() {
        document.getElementById('projectFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';

        this.filters = {
            project: '',
            dateFrom: '',
            dateTo: ''
        };

        this.applyFilters();
    },

    /**
     * Apply filters to data
     */
    applyFilters() {
        console.log('Applying filters:', this.filters);

        this.data.filtered = this.data.raw.filter(record => {
            // Filter by project
            if (this.filters.project && record.project_name !== this.filters.project) {
                return false;
            }

            // Filter by date range
            const recordDate = Metrics.parseDate(record.timestamp);
            if (recordDate) {
                if (this.filters.dateFrom) {
                    const fromDate = new Date(this.filters.dateFrom);
                    if (recordDate < fromDate) return false;
                }
                if (this.filters.dateTo) {
                    const toDate = new Date(this.filters.dateTo);
                    toDate.setHours(23, 59, 59, 999); // End of day
                    if (recordDate > toDate) return false;
                }
            }

            return true;
        });

        console.log(`Filtered to ${this.data.filtered.length} records`);

        // Update UI
        this.updateUI();
    },

    /**
     * Update all UI components
     */
    updateUI() {
        // Calculate KPIs
        const kpis = Metrics.calculateKPIs(this.data.filtered);
        const trends = Metrics.calculateMonthlyTrends(this.data.filtered);

        // Update KPI cards
        this.updateKPICards(kpis);

        // Update charts
        Charts.initAllCharts(kpis, trends);

        // Update last update time
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('ru-RU');
    },

    /**
     * Update KPI cards
     */
    updateKPICards(kpis) {
        // Total Hours
        document.getElementById('totalHours').textContent = kpis.totalHours.toFixed(1) + ' ч';

        // Burn Rate (average across all projects)
        const avgBurnRate = Object.values(kpis.burnRateByProject)
            .reduce((sum, p) => sum + p.burnRate, 0) / Object.keys(kpis.burnRateByProject).length;
        document.getElementById('burnRate').textContent = (avgBurnRate || 0).toFixed(1) + '%';

        const burnRateStatus = document.getElementById('burnRateStatus');
        if (avgBurnRate < 90) {
            burnRateStatus.textContent = 'В рамках плана';
            burnRateStatus.className = 'kpi-status good';
        } else if (avgBurnRate < 110) {
            burnRateStatus.textContent = 'Близко к плану';
            burnRateStatus.className = 'kpi-status warning';
        } else {
            burnRateStatus.textContent = 'Превышение плана';
            burnRateStatus.className = 'kpi-status danger';
        }

        // Quality Rate
        document.getElementById('qualityRate').textContent = kpis.qualityRate.toFixed(2) + '%';

        const qualityStatus = document.getElementById('qualityStatus');
        if (kpis.qualityRate < 5) {
            qualityStatus.textContent = 'Отлично';
            qualityStatus.className = 'kpi-status good';
        } else if (kpis.qualityRate < 10) {
            qualityStatus.textContent = 'Требует внимания';
            qualityStatus.className = 'kpi-status warning';
        } else {
            qualityStatus.textContent = 'Критично';
            qualityStatus.className = 'kpi-status danger';
        }

        // Overhead Ratio
        document.getElementById('overheadRatio').textContent = kpis.overheadRatio.toFixed(2) + '%';

        const overheadStatus = document.getElementById('overheadStatus');
        if (kpis.overheadRatio < 15) {
            overheadStatus.textContent = 'Норма';
            overheadStatus.className = 'kpi-status good';
        } else if (kpis.overheadRatio < 25) {
            overheadStatus.textContent = 'Повышенный';
            overheadStatus.className = 'kpi-status warning';
        } else {
            overheadStatus.textContent = 'Высокий';
            overheadStatus.className = 'kpi-status danger';
        }
    },

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        indicator.style.display = show ? 'block' : 'none';
    },

    /**
     * Show/hide error message
     */
    showError(show) {
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.style.display = show ? 'block' : 'none';
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for debugging
window.App = App;
