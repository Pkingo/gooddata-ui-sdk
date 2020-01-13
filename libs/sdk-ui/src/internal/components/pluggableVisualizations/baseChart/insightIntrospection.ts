// (C) 2019 GoodData Corporation
import { bucketItems, IInsight, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "../../../../base";
import { isBarChart, isScatterPlot, isBubbleChart } from "../../../../highcharts/utils/common";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import get = require("lodash/get");

export function countBucketItems(insight: IInsight) {
    if (!insight) {
        return {
            viewByItemCount: 0,
            measureItemCount: 0,
            secondaryMeasureItemCount: 0,
        };
    }

    const viewBucket = insightBucket(insight, BucketNames.VIEW);
    const measureBucket = insightBucket(insight, BucketNames.MEASURES);
    const secondaryMeasureBucket = insightBucket(insight, BucketNames.SECONDARY_MEASURES);

    return {
        viewByItemCount: viewBucket ? bucketItems(viewBucket).length : 0,
        measureItemCount: measureBucket ? bucketItems(measureBucket).length : 0,
        secondaryMeasureItemCount: secondaryMeasureBucket ? bucketItems(secondaryMeasureBucket).length : 0,
    };
}

export function countItemsOnAxes(type: string, controls: IVisualizationProperties, insight: IInsight) {
    const isBarChartType = isBarChart(type);

    const { viewByItemCount, measureItemCount, secondaryMeasureItemCount } = countBucketItems(insight);
    const totalMeasureItemCount = measureItemCount + secondaryMeasureItemCount;

    const secondaryMeasureCountInConfig = (isBarChartType
        ? get(controls, "secondary_xaxis.measures", [])
        : get(controls, "secondary_yaxis.measures", [])
    ).length;

    if (isBarChartType) {
        return {
            yaxis: viewByItemCount,
            xaxis: totalMeasureItemCount - secondaryMeasureCountInConfig,
            secondary_xaxis: secondaryMeasureCountInConfig,
        };
    }

    if (isScatterPlot(type) || isBubbleChart(type)) {
        return {
            xaxis: measureItemCount,
            yaxis: secondaryMeasureItemCount,
        };
    }

    return {
        xaxis: viewByItemCount,
        yaxis: totalMeasureItemCount - secondaryMeasureCountInConfig,
        secondary_yaxis: secondaryMeasureCountInConfig,
    };
}