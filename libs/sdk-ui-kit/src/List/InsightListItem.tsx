// (C) 2007-2020 GoodData Corporation
import React, { Component, createRef } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { stringUtils } from "@gooddata/util";
import ShortenedText from "@gooddata/goodstrap/lib/core/ShortenedText";
import { getDateTimeConfig } from "@gooddata/goodstrap/lib/data/date";

import { InsightListItemDate } from "./InsightListItemDate";
import { Button } from "../Button";

const VISUALIZATION_TYPE_UNKNOWN = "unknown";
const WIDGET_TYPE_KPI = "kpi";

const visualizationIconWidthAndPadding = 42;

const tooltipAlignPoints = [
    {
        align: "cr cl",
    },
    {
        align: "cl cr",
        offset: {
            x: -visualizationIconWidthAndPadding,
            y: 0,
        },
    },
];

/**
 * @internal
 */
export interface IInsightListItemProps {
    isLoading?: boolean;
    isLocked?: boolean;
    isSelected?: boolean;

    title?: string;
    updated?: string;
    type?: string;
    width?: number;

    onClick?: () => void;
    onDelete?: () => void;
}

/**
 * @internal
 */
export class InsightListItem extends Component<IInsightListItemProps> {
    private shortenedTextRef = createRef<ShortenedText>();

    public render(): JSX.Element {
        const {
            title,
            updated,
            type = VISUALIZATION_TYPE_UNKNOWN,
            isSelected,
            isLoading,
            onClick,
        } = this.props;

        const iconClassName = cx("gd-vis-type", `gd-vis-type-${type}`);

        const visualizationListItemClassname = cx(
            "gd-visualizations-list-item",
            `s-${stringUtils.simplifyText(title)}`,
            {
                "is-selected": isSelected,
            },
        );

        return (
            <div className={visualizationListItemClassname} onClick={onClick}>
                <div className={iconClassName} />
                <div className="gd-visualizations-list-item-content">
                    <div className="gd-visualizations-list-item-content-name">
                        {this.renderLock()}
                        <ShortenedText ref={this.shortenedTextRef} tooltipAlignPoints={tooltipAlignPoints}>
                            {isLoading ? <FormattedMessage id="gs.visualizationsList.loading" /> : title}
                        </ShortenedText>
                    </div>
                    <div className="gd-visualizations-list-item-content-date">
                        {this.renderUpdatedDateTime(updated)}
                    </div>
                </div>
                {this.renderActions()}
            </div>
        );
    }

    public componentDidUpdate(prevProps: IInsightListItemProps): void {
        if (prevProps.width !== this.props.width && this.shortenedTextRef.current) {
            // TODO INE remove any when GD has correct typings
            (this.shortenedTextRef.current as any).recomputeShortening();
        }
    }

    public handleClickDelete = (e: React.MouseEvent): void => {
        e.stopPropagation();
        const { onDelete } = this.props;
        if (onDelete) {
            this.props.onDelete();
        }
    };

    private renderLock = () => {
        if (this.props.isLocked) {
            return <i className="icon-lock" />;
        }

        return false;
    };

    private renderUpdatedDateTime = (date: any) => {
        const { type } = this.props;

        if (!date) {
            return false;
        }

        if (type === WIDGET_TYPE_KPI) {
            return <span />;
        }

        return <InsightListItemDate config={getDateTimeConfig(date, {})} />;
    };

    private renderActions = () => {
        const { onDelete } = this.props;

        return (
            onDelete && (
                <div className="gd-visualizations-list-item-actions">
                    <Button
                        className="gd-button-link gd-button-icon-only gd-button-small
                        icon-cross gd-visualizations-list-item-action-delete s-delete-item"
                        onClick={this.handleClickDelete}
                    />
                </div>
            )
        );
    };
}
