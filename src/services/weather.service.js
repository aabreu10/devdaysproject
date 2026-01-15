import axios from 'axios';
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('weather-service');
const weatherDurationHistogram = meter.createHistogram('weather_api_duration', {
    description: 'Duration of weather API calls in milliseconds',
    unit: 'ms',
});

const OPENMETEO_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

export const getWeatherData = async (city, latitude, longitude, weeks = 4) => {
    const startTime = performance.now();
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (weeks * 7));

        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        const response = await axios.get(OPENMETEO_API_URL, {
            params: {
                latitude: latitude,
                longitude: longitude,
                start_date: start,
                end_date: end,
                daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean',
                timezone: 'auto'
            }
        });

        const duration = performance.now() - startTime;
        weatherDurationHistogram.record(duration, { city });
        
        if (!response.data.daily) {
            throw new Error('No weather data received from OpenMeteo');
        }

        return {
            city,
            latitude,
            longitude,
            timezone: response.data.timezone,
            dates: response.data.daily.time,
            maxTemperatures: response.data.daily.temperature_2m_max,
            minTemperatures: response.data.daily.temperature_2m_min,
            meanTemperatures: response.data.daily.temperature_2m_mean
        };
    } catch (error) {
        const duration = performance.now() - startTime;
        weatherDurationHistogram.record(duration, { city, error: 'true' });
        console.error(`Error fetching weather data for ${city}:`, error.message);
        throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
};

export const calculateWeeklyAverages = (dates, temperatures) => {
    const weeklyData = [];
    let currentWeek = null;
    let weekTemperatures = [];
    let weekDates = [];

    for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        const weekNumber = getWeekNumber(date);
        const year = date.getFullYear();

        if (currentWeek === null) {
            currentWeek = { year, week: weekNumber };
        }

        if (currentWeek.week !== weekNumber && weekTemperatures.length > 0) {
            const avgTemp = weekTemperatures.reduce((a, b) => a + b, 0) / weekTemperatures.length;
            weeklyData.push({
                year: currentWeek.year,
                week: currentWeek.week,
                startDate: weekDates[0],
                endDate: weekDates[weekDates.length - 1],
                averageTemperature: Math.round(avgTemp * 100) / 100,
                dataPoints: weekTemperatures.length
            });

            weekTemperatures = [];
            weekDates = [];
            currentWeek = { year, week: weekNumber };
        }

        weekTemperatures.push(temperatures[i]);
        weekDates.push(dates[i]);
    }

    if (weekTemperatures.length > 0) {
        const avgTemp = weekTemperatures.reduce((a, b) => a + b, 0) / weekTemperatures.length;
        weeklyData.push({
            year: currentWeek.year,
            week: currentWeek.week,
            startDate: weekDates[0],
            endDate: weekDates[weekDates.length - 1],
            averageTemperature: Math.round(avgTemp * 100) / 100,
            dataPoints: weekTemperatures.length
        });
    }

    return weeklyData;
};

export const verifyThreshold = (weeklyData, threshold, operator = '>') => {
    return weeklyData.map(week => {
        let isCompliant = false;

        switch (operator) {
            case '>':
                isCompliant = week.averageTemperature > threshold;
                break;
            case '<':
                isCompliant = week.averageTemperature < threshold;
                break;
            case '>=':
                isCompliant = week.averageTemperature >= threshold;
                break;
            case '<=':
                isCompliant = week.averageTemperature <= threshold;
                break;
            case '==':
                isCompliant = week.averageTemperature === threshold;
                break;
            default:
                throw new Error(`Invalid operator: ${operator}`);
        }

        return {
            ...week,
            threshold,
            operator,
            isCompliant,
            message: `Week ${week.week} (${week.startDate} to ${week.endDate}): ${week.averageTemperature}°C is ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'} with threshold ${operator}${threshold}°C`
        };
    });
};

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export const analyzeWeatherAudit = async (city, latitude, longitude, threshold, operator = '>', weeks = 4) => {
    const weatherData = await getWeatherData(city, latitude, longitude, weeks);
    const weeklyAverages = calculateWeeklyAverages(weatherData.dates, weatherData.meanTemperatures);
    const auditResults = verifyThreshold(weeklyAverages, threshold, operator);

    const compliantWeeks = auditResults.filter(w => w.isCompliant).length;
    const totalWeeks = auditResults.length;
    const compliancePercentage = Math.round((compliantWeeks / totalWeeks) * 100);

    return {
        city,
        latitude,
        longitude,
        timezone: weatherData.timezone,
        auditPeriod: {
            startDate: weatherData.dates[0],
            endDate: weatherData.dates[weatherData.dates.length - 1],
            weeks: totalWeeks
        },
        threshold: {
            value: threshold,
            operator: operator,
            description: `Average weekly temperature ${operator} ${threshold}°C`
        },
        results: auditResults,
        summary: {
            totalWeeks: totalWeeks,
            compliantWeeks: compliantWeeks,
            nonCompliantWeeks: totalWeeks - compliantWeeks,
            compliancePercentage: compliancePercentage,
            isAuditPassed: compliantWeeks === totalWeeks
        }
    };
};

export default {
    getWeatherData,
    calculateWeeklyAverages,
    verifyThreshold,
    analyzeWeatherAudit
};
