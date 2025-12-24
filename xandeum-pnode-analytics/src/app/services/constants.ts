export const POLL_INTERVAL = 10000;
export const MAX_BARS = 10;
export const ONE_MB = 1024 * 1024;
export const ONE_GB = 1024 * 1024 * 1024;
export const ECHARTS_OPTIONS = {
    title: {
      show: true
    },
    textStyle: {
        fontSize: 16
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    legend: {
        data: ['Total Bytes', 'Packets Sent'],
        itemGap: 20
    },
    grid: {
        left: window.innerWidth <= 667 ? '5%' : '15%',
        right: window.innerWidth <= 667 ? '5%' : '15%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        data: [],
        axisTick: {
            alignWithLabel: true
        },
        axisLabel: {
            rotate: 30
        }
    },
    yAxis: [{
        name: 'Total Bytes',
        type: 'value',
        position: 'left',
        nameLocation: 'middle',
        nameGap: window.innerWidth <= 667 ? 50 : 100,
        nameRotate: window.innerWidth <= 667 ? 90 : 0,
        nameTextStyle: {
            fontSize: 12,
            fontWeight: 'bold'
        },
        splitLine: {
            show: false
        },
        axisTick: {
            show: true
        },
        axisLine: {
            show: true
        },
        axisLabel: {
            formatter: '{value} GB',
            rotate: window.innerWidth <= 667 ? 30 : 0,
        }
    },
    {
        name: 'Packets Sent',
        type: 'value',
        position: 'right',
        nameLocation: 'middle',
        nameGap: window.innerWidth <= 667 ? 50 : 100,
        nameRotate: window.innerWidth <= 667 ? 90 : 0,
        nameTextStyle: {
            fontSize: 12,
            fontWeight: 'bold'
        },
        splitLine: {
            show: false
        },
        axisTick: {
            show: true
        },
        axisLine: {
            show: true
        },
        axisLabel: {
            formatter: '{value} MB',
            rotate: window.innerWidth <= 667 ? 330 : 0,
            show: true
        }
    }],
    series: [
        {
            name: 'Total Bytes',
            type: 'bar',
            data: [],
            yAxisIndex: 0
        },
        {
            name: 'Packets Sent',
            type: 'line',
            data: [],
            smooth: true,
            yAxisIndex: 1,
            itemStyle: {
                color: '#ee6666'
            }
        }
    ]
};
