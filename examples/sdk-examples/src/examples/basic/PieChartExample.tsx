// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PieChart } from "@gooddata/sdk-ui-charts";
import { newMeasure } from "@gooddata/sdk-model";

import {
    workspace,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const measures = [
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m => m.format("#,##0")),
];

const style = { height: 300 };

export const PieChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-pie-chart">
            <PieChart backend={backend} workspace={workspace} measures={measures} />
        </div>
    );
};
