// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { BarChart, ColumnChart, PieChart } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import {
    totalSalesIdentifier,
    locationResortIdentifier,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    workspace,
} from "../../../constants/fixtures";

const totalSales = newMeasure(totalSalesIdentifier, m => m.aggregation("sum").localId(totalSalesIdentifier));

const locationResort = newAttribute(locationResortIdentifier);
const month = newAttribute(monthDateIdentifier);

const franchiseFeesMeasures = [
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
].map(identifier => newMeasure(identifier, m => m.aggregation("sum").localId(identifier)));

export class AggregationTest extends Component {
    onLoadingChanged(...params) {
        console.info("onLoadingChanged", ...params);
    }

    onError(...params) {
        console.info("onLoadingChanged", ...params);
    }

    render() {
        return (
            <div>
                <h1>Aggregation test</h1>

                <p>
                    This route is meant for testing requests with aggregation that sometimes fail during
                    migration.
                </p>

                <hr className="separator" />

                <h2 id="bar-chart">Bar chart</h2>
                <div style={{ height: 300 }} className="s-bar-chart">
                    <BarChart
                        workspace={workspace}
                        measures={[totalSales]}
                        viewBy={locationResort}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>

                <hr className="separator" />

                <h2 id="column-chart">Column chart</h2>
                <div style={{ height: 300 }} className="s-bar-chart">
                    <ColumnChart
                        workspace={workspace}
                        measures={[totalSales]}
                        viewBy={month}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>

                <hr className="separator" />

                <h2 id="column-chart">Pie chart</h2>

                <div style={{ height: 300 }} className="s-pie-chart">
                    <PieChart
                        workspace={workspace}
                        measures={franchiseFeesMeasures}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
            </div>
        );
    }
}
