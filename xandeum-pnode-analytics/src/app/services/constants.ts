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
        },
        formatter: function (params: any) {
            let result = params[0].axisValue + '<br/>';
            params.forEach((param: any) => {
                const value = param.value;
                let formattedValue: string;

                if (param.seriesName === 'Total Bytes') {
                    // Bytes: eine Dezimalstelle
                    formattedValue = value.toFixed(1) + ' GB';
                } else {
                    // Packets: ganzzahlig (gerundet)
                    if (value >= 1e9) {
                        formattedValue = (value / 1e9).toFixed(2) + ' GPkts';
                    } else if (value >= 1e6) {
                        formattedValue = (value / 1e6).toFixed(2) + ' MPkts';
                    } else if (value >= 1e3) {
                        formattedValue = (value / 1e3).toFixed(2) + ' kPkts';
                    } else {
                        formattedValue = Math.round(value) + ' Pkts';
                    }
                }

                result += param.marker + ' ' + param.seriesName + ': ' + formattedValue + '<br/>';
            });
            return result;
        }
    },
    legend: {
        data: ['Total Bytes', 'Packets Sent', 'Packets Received'],
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
        name: 'Packets',
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
            formatter: function (value: any) {
                if (value >= 1e9) return (value / 1e9).toFixed(1) + ' GPkts';
                if (value >= 1e6) return (value / 1e6).toFixed(1) + ' MPkts';
                if (value >= 1e3) return (value / 1e3).toFixed(1) + ' kPkts';
                return value + ' Pkts';
            },
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
        },
        {
            name: 'Packets Received',
            type: 'line',
            data: [],
            smooth: true,
            yAxisIndex: 1,
            itemStyle: {
                color: '#eecc66ff'
            }
        }
    ]
};
