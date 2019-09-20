// (C) 2007-2019 GoodData Corporation
import * as VisEvents from "./interfaces/Events";
import CatalogHelper from "./base/helpers/CatalogHelper";
import { isEmptyResult } from "./base/helpers/errorHandlers";
import * as Model from "./base/helpers/model";
// import { ICommonVisualizationProps } from "./_defunct/to_delete/VisualizationLoadingHOC";
import { ErrorComponent } from "./base/simple/ErrorComponent";
import { LoadingComponent } from "./base/simple/LoadingComponent";
// import { Kpi } from "./_defunct/kpi/Kpi";
// import { Visualization } from "./_defunct/uri/Visualization";
import { ErrorStates, ErrorCodes } from "./base/constants/errorStates";
import { VisualizationTypes, ChartType, VisualizationEnvironment } from "./base/constants/visualizationTypes";
// import { Execute } from "./execution/Execute";
import { IDrillableItem } from "./interfaces/DrillEvents";
import { IHeaderPredicate } from "./interfaces/HeaderPredicate";
import { IPushData, IColorsData } from "./interfaces/PushData";
import { AttributeFilter } from "./filters/AttributeFilter/AttributeFilter";
import { AttributeElements } from "./filters/AttributeFilter/AttributeElements";
import * as PropTypes from "./proptypes/index";
import { generateDimensions } from "./base/helpers/dimensions";
import * as BucketNames from "./base/constants/bucketNames";
import * as MeasureTitleHelper from "./base/helpers/measureTitleHelper";
import * as SortsHelper from "./base/helpers/sorts";
import DerivedMeasureTitleSuffixFactory from "./base/factory/DerivedMeasureTitleSuffixFactory";
import ArithmeticMeasureTitleFactory from "./base/factory/ArithmeticMeasureTitleFactory";
// import { IDataSourceProviderInjectedProps } from "./_defunct/afm/DataSourceProvider";

import { BarChart } from "./charts/barChart/BarChart";
import { ColumnChart } from "./charts/columnChart/ColumnChart";
import { LineChart } from "./charts/lineChart/LineChart";
import { AreaChart } from "./charts/areaChart/AreaChart";
import { PieChart } from "./charts/pieChart/PieChart";
import { Treemap } from "./charts/treemap/Treemap";
import { DonutChart } from "./charts/donutChart/DonutChart";
import { BubbleChart } from "./charts/bubbleChart/BubbleChart";
// import { PivotTable } from "./_defunct/pivotTable/PivotTable";
import { Headline } from "./charts/headline/Headline";
import { ScatterPlot } from "./charts/scatterPlot/ScatterPlot";
import { ComboChart } from "./charts/comboChart/ComboChart";
import { FunnelChart } from "./charts/funnelChart/FunnelChart";
import { Heatmap } from "./charts/heatmap/Heatmap";
import { withJsxExport } from "./charts/withJsxExport";
import { withExecution } from "./execution/withExecution";
import { Executor } from "./execution/Executor";
import * as ChartConfiguration from "./interfaces/Config";
// tslint:disable-next-line:no-duplicate-imports
import { ILegendConfig, IChartConfig, IColorPalette, IColorPaletteItem } from "./interfaces/Config";
import Chart from "./highcharts/chart/Chart";
import ChartTransformation from "./highcharts/chart/ChartTransformation";
import { RuntimeError } from "./base/errors/RuntimeError";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "./interfaces/MeasureTitle";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "./interfaces/OverTimeComparison";
import ColorUtils from "./highcharts/utils/color";
import * as HeaderPredicateFactory from "./base/factory/HeaderPredicateFactory";
import * as MappingHeader from "./interfaces/MappingHeader";
// import { BucketExecutor } from "./execution/BucketExecutor";

/**
 * CoreComponents
 * A collection of BaseChart, Headline, Table, ScatterPlot, FunnelChart
 * TODO: SDK8: revisit
 * @internal
 */
/*
const CoreComponents: ICoreComponents = {
    BaseChart: CoreBaseChart,
    Headline: CoreHeadline,
    Table: CoreTable,
    PivotTable: CorePivotTable,
    ScatterPlot: CoreScatterPlot,
    FunnelChart: CoreFunnelChart,
};
*/

export {
    AttributeElements,
    AttributeFilter,
    BarChart,
    BucketNames,
    CatalogHelper,
    Model,
    ChartType,
    ColumnChart,
    ScatterPlot,
    ComboChart,
    FunnelChart,
    ErrorCodes,
    ErrorStates,
    ErrorComponent,
    // Execute,
    // BucketExecutor,
    Executor,
    withExecution,
    generateDimensions,
    Headline,
    // ICommonVisualizationProps,
    IDrillableItem,
    ILegendConfig,
    IChartConfig,
    IColorPalette,
    IColorPaletteItem,
    IPushData,
    IColorsData,
    isEmptyResult,
    LoadingComponent,
    LineChart,
    AreaChart,
    PieChart,
    Treemap,
    BubbleChart,
    DonutChart,
    Heatmap,
    IMeasureTitleProps,
    IArithmeticMeasureTitleProps,
    MeasureTitleHelper,
    DerivedMeasureTitleSuffixFactory,
    ArithmeticMeasureTitleFactory,
    PropTypes,
    RuntimeError,
    VisEvents,
    VisualizationEnvironment,
    VisualizationTypes,
    ChartTransformation,
    Chart,
    OverTimeComparisonType,
    OverTimeComparisonTypes,
    SortsHelper,
    ChartConfiguration,
    ColorUtils,
    IHeaderPredicate,
    HeaderPredicateFactory,
    MappingHeader,
    withJsxExport,
};
