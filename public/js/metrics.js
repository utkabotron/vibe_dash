/**
 * Metrics Module
 * Calculates all business metrics based on reports data
 */

const Metrics = {
    /**
     * Parse quantity (hours) from string to float
     */
    parseHours(quantityStr) {
        if (!quantityStr) return 0;
        const parsed = parseFloat(quantityStr.toString().replace(',', '.'));
        return isNaN(parsed) ? 0 : parsed;
    },

    /**
     * Parse date string to Date object
     */
    parseDate(dateStr) {
        if (!dateStr) return null;
        // Try parsing ISO format or other common formats
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    },

    /**
     * Check if record has "переделка" tag in comment or category
     */
    isRework(record) {
        const comment = (record.comment || '').toLowerCase();
        const categoryName = (record.category_name || '').toLowerCase();
        return comment.includes('переделка') || categoryName.includes('переделка');
    },

    /**
     * Check if record belongs to overhead project (55 ПРОЧЕЕ)
     */
    isOverhead(record) {
        const projectName = (record.project_name || '').toLowerCase();
        return projectName.includes('прочее') || projectName.includes('55');
    },

    /**
     * Calculate total hours from records
     */
    calculateTotalHours(records) {
        return records.reduce((sum, record) => {
            return sum + this.parseHours(record.quantity);
        }, 0);
    },

    /**
     * Calculate Quality Rate (percentage of rework hours)
     */
    calculateQualityRate(records) {
        const totalHours = this.calculateTotalHours(records);
        if (totalHours === 0) return 0;

        const reworkHours = records
            .filter(record => this.isRework(record))
            .reduce((sum, record) => sum + this.parseHours(record.quantity), 0);

        return (reworkHours / totalHours) * 100;
    },

    /**
     * Calculate Overhead Ratio (percentage of time on "ПРОЧЕЕ")
     */
    calculateOverheadRatio(records) {
        const totalHours = this.calculateTotalHours(records);
        if (totalHours === 0) return 0;

        const overheadHours = records
            .filter(record => this.isOverhead(record))
            .reduce((sum, record) => sum + this.parseHours(record.quantity), 0);

        return (overheadHours / totalHours) * 100;
    },

    /**
     * Calculate Burn Rate for each project
     * Note: This requires planned hours data which might not be in the current sheet
     * For now, we'll return actual hours per project
     */
    calculateBurnRateByProject(records) {
        const projectHours = {};

        records.forEach(record => {
            const project = record.project_name || 'Unknown';
            const hours = this.parseHours(record.quantity);

            if (!projectHours[project]) {
                projectHours[project] = {
                    actual: 0,
                    planned: 100, // TODO: Get from a separate "Plans" sheet
                    burnRate: 0
                };
            }

            projectHours[project].actual += hours;
        });

        // Calculate burn rate for each project
        Object.keys(projectHours).forEach(project => {
            const data = projectHours[project];
            data.burnRate = (data.actual / data.planned) * 100;
        });

        return projectHours;
    },

    /**
     * Calculate Load Balance (hours per employee)
     */
    calculateLoadBalance(records) {
        const employeeHours = {};

        records.forEach(record => {
            const employee = record.employee_name || 'Unknown';
            const hours = this.parseHours(record.quantity);

            if (!employeeHours[employee]) {
                employeeHours[employee] = 0;
            }

            employeeHours[employee] += hours;
        });

        // Sort by hours (descending)
        const sorted = Object.entries(employeeHours)
            .map(([name, hours]) => ({ name, hours }))
            .sort((a, b) => b.hours - a.hours);

        // Return top 3 and bottom 3
        const top3 = sorted.slice(0, 3);
        const bottom3 = sorted.slice(-3).reverse();

        return {
            all: sorted,
            top3,
            bottom3,
            combined: [...top3, ...bottom3]
        };
    },

    /**
     * Calculate all KPIs
     */
    calculateKPIs(records) {
        return {
            totalHours: this.calculateTotalHours(records),
            qualityRate: this.calculateQualityRate(records),
            overheadRatio: this.calculateOverheadRatio(records),
            burnRateByProject: this.calculateBurnRateByProject(records),
            loadBalance: this.calculateLoadBalance(records),
            activeProjects: new Set(records.map(r => r.project_name).filter(Boolean)).size,
            activeEmployees: new Set(records.map(r => r.employee_name).filter(Boolean)).size
        };
    },

    /**
     * Group records by month for trend analysis
     */
    groupByMonth(records) {
        const monthlyData = {};

        records.forEach(record => {
            const date = this.parseDate(record.timestamp);
            if (!date) return;

            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = [];
            }

            monthlyData[monthKey].push(record);
        });

        return monthlyData;
    },

    /**
     * Calculate monthly trends for Quality Rate and Overhead Ratio
     */
    calculateMonthlyTrends(records) {
        const monthlyData = this.groupByMonth(records);
        const trends = [];

        Object.keys(monthlyData).sort().forEach(month => {
            const records = monthlyData[month];
            trends.push({
                month,
                qualityRate: this.calculateQualityRate(records),
                overheadRatio: this.calculateOverheadRatio(records),
                totalHours: this.calculateTotalHours(records)
            });
        });

        return trends;
    }
};

// Export for use in other modules
window.Metrics = Metrics;
