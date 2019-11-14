// (C) 2007-2019 GoodData Corporation
import * as headerPredicateFactory from "../../factory/HeaderPredicateFactory";
import { context, measureDescriptors } from "../../factory/tests/HeaderPredicateFactory.fixtures";
import { IMappingHeader } from "../../interfaces/MappingHeader";
import { IHeaderPredicate } from "../../interfaces/HeaderPredicate";
import { convertDrillableItemsToPredicates, isSomeHeaderPredicateMatched } from "../drilling";
import { emptyFacade } from "../../../../__mocks__/fixtures";

describe("isSomeHeaderPredicateMatched", () => {
    it("should return true when some of predicates match header", () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: "uri", name: "name" } };
        const drillablePredicates: IHeaderPredicate[] = [jest.fn(() => false), jest.fn(() => true)];

        expect(isSomeHeaderPredicateMatched(drillablePredicates, header, emptyFacade)).toBe(true);
        expect(drillablePredicates[0]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
        expect(drillablePredicates[1]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
    });

    it("should return false when none of predicates match header", () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: "uri", name: "name" } };
        const drillablePredicates: IHeaderPredicate[] = [jest.fn(() => false), jest.fn(() => false)];

        expect(isSomeHeaderPredicateMatched(drillablePredicates, header, emptyFacade)).toBe(false);
        expect(drillablePredicates[0]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
        expect(drillablePredicates[1]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
    });

    it("should return false when no of predicates provided", () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: "uri", name: "name" } };
        const drillablePredicates: IHeaderPredicate[] = [];

        expect(isSomeHeaderPredicateMatched(drillablePredicates, header, emptyFacade)).toBe(false);
    });
});

describe("convertDrillableItemsToPredicates", () => {
    it("should convert legacy drillable items to drillable predicates", () => {
        const drillableItems = [{ uri: "/some-uri" }, { identifier: "some-identifier" }];

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        expect(drillablePredicates).toHaveLength(drillableItems.length);
        drillablePredicates.forEach(predicate => {
            expect(typeof predicate).toBe("function");
            expect(typeof predicate(measureDescriptors.uriBasedMeasure, context)).toBe("boolean");
        });
    });

    it("should convert legacy drillable items with drillable predicates to drillable predicates", () => {
        const drillableItems = [
            { uri: "/some-uri" },
            { identifier: "some-identifier" },
            headerPredicateFactory.uriMatch("/some-uri"),
            headerPredicateFactory.identifierMatch("identifier"),
        ];

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        expect(drillablePredicates).toHaveLength(drillableItems.length);
        drillablePredicates.forEach(predicate => {
            expect(typeof predicate).toBe("function");
            expect(typeof predicate(measureDescriptors.uriBasedMeasure, context)).toBe("boolean");
        });
    });

    it("should match converted legacy drillable item with uri", () => {
        const drillableItems = [{ uri: "/uriBasedMeasureUri" }];

        const [predicate] = convertDrillableItemsToPredicates(drillableItems);
        expect(predicate(measureDescriptors.uriBasedMeasure, context)).toEqual(true);
    });

    it("should match converted legacy drillable item with identifier", () => {
        const drillableItems = [{ identifier: "uriBasedMeasureIdentifier" }];

        const [predicate] = convertDrillableItemsToPredicates(drillableItems);
        expect(predicate(measureDescriptors.uriBasedMeasure, context)).toEqual(true);
    });

    it("should match both converted legacy drillable items with identifier and uri", () => {
        const drillableItems = [
            {
                uri: "/uriBasedMeasureUri",
                identifier: "uriBasedMeasureIdentifier",
            },
        ];

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
        drillablePredicates.forEach(predicate => {
            expect(predicate(measureDescriptors.uriBasedMeasure, context)).toEqual(true);
        });
    });
});
