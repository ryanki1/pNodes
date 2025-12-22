export const POLL_INTERVAL = 60000;
export const MAX_BARS = 10;
export const ONE_GB = 1024 * 1024 * 1024;
export const ECHARTS_OPTIONS = {
    xAxis: {
        type: 'category',
        data: [],
    },
    yAxis: {
        type: 'value',
            axisLabel: {
                formatter: (value: number) => {
                    return value + ' GB';
                },
        },
    }
};
