// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { anyAttribute, AttributePredicate, IAttribute, idMatchAttribute, isAttribute } from "../attribute";
import { Identifier } from "../base";
import {
    anyMeasure,
    idMatchMeasure,
    IMeasure,
    isMeasure,
    measureDisableComputeRatio,
    MeasurePredicate,
} from "../measure";
import { isTotal, ITotal } from "../base/totals";
import invariant from "ts-invariant";

/**
 * Type representing bucket items - which can be either measure or an attribute.
 *
 * @public
 */
export type AttributeOrMeasure = IMeasure | IAttribute;

/**
 * Bucket is a logical, user-defined grouping of attributes, measures and totals. Buckets can be used to create
 * a new execution and to derive the result dimensionality. In the context of an existing execution, they serve
 * as metadata about the execution.
 *
 * @public
 */
export interface IBucket {
    localIdentifier?: Identifier;
    items: AttributeOrMeasure[];
    totals?: ITotal[];
}

/**
 * Signature for bucket predicates; predicates are used by different functions to find/filter buckets according
 * to some criteria.
 *
 * @public
 */
export type BucketPredicate = (bucket: IBucket) => boolean;

/**
 * This predicate evaluates true for any bucket.
 *
 * @public
 */
export const anyBucket: BucketPredicate = _ => true;

/**
 * Factory function for predicates that will evaluate true if bucket's id is same as the provided id.
 *
 * @public
 */
export const idMatchBucket: (id: string) => BucketPredicate = id => bucket => bucket.localIdentifier === id;

/**
 * Describes exact location of attribute in a bucket.
 *
 * @public
 */
export type AttributeInBucket = {
    bucket: IBucket;
    idx: number;
    attribute: IAttribute;
};

/**
 * Describes exact location of measure in a bucket.
 *
 * @public
 */
export type MeasureInBucket = {
    bucket: IBucket;
    idx: number;
    measure: IMeasure;
};

//
// Type guards
//

/**
 * Type-guard testing whether the provided object is an instance of {@link IBucket}.
 *
 * @param obj - object to test
 * @public
 */
export function isBucket(obj: any): obj is IBucket {
    return (
        !isEmpty(obj) &&
        (obj as IBucket).localIdentifier !== undefined &&
        (obj as IBucket).items !== undefined
    );
}

//
// Functions
//

/**
 * Creates a new bucket with the provided id and all the specified content.
 *
 * @param localId - bucket identifier
 * @param content - items to put into the bucket; attributes, measures and/or totals
 * @returns always new instance
 * @public
 */
export function newBucket(
    localId: string,
    ...content: Array<AttributeOrMeasure | ITotal | undefined>
): IBucket {
    invariant(localId, "local identifier must be specified");

    const items: AttributeOrMeasure[] = [];
    const totals: ITotal[] = [];

    (content ? content : []).forEach(i => {
        if (!i) {
            return;
        }
        if (isAttribute(i) || isMeasure(i)) {
            items.push(i);
        } else if (isTotal(i)) {
            totals.push(i);
        } else {
            invariant(false, `Contents of a bucket must be either attribute, measure or total. Got: ${i}`);
        }
    });

    const totalsProp = !isEmpty(totals) ? { totals } : {};

    return {
        localIdentifier: localId,
        items,
        ...totalsProp,
    };
}

/**
 * Tests whether the provided bucket is empty = contains no items and no totals.
 *
 * @param bucket - bucket to test
 * @returns true if empty, false if not
 * @public
 */
export function bucketIsEmpty(bucket: IBucket): boolean {
    return !bucket || (bucket.items.length === 0 && (!bucket.totals || bucket.totals.length === 0));
}

/**
 * Gets first attribute matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyAttribute predicate - meaning first found attribute
 * will be returned.
 *
 * This function also provides convenience to find attribute by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchAttribute predicate.
 *
 * @param bucket - bucket to to search in
 * @param idOrFun - attribute identifier or instance of AttributePredicate; {@link anyAttribute} predicate is default
 * @returns undefined if no matching attribute is found
 * @public
 */
export function bucketAttribute(
    bucket: IBucket,
    idOrFun: string | AttributePredicate = anyAttribute,
): IAttribute | undefined {
    if (!bucket) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchAttribute(idOrFun) : idOrFun;
    const compositeGuard = (obj: any): obj is IAttribute => {
        return isAttribute(obj) && predicate(obj);
    };

    return bucket.items.find(compositeGuard);
}

/**
 * Gets all attributes matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyAttribute predicate - meaning all attributes
 * from the bucket will be returned.
 *
 * @param bucket - bucket to work with
 * @param predicate - attribute predicate; {@link anyAttribute} predicate is default
 * @returns empty list if none match
 * @public
 */
export function bucketAttributes(
    bucket: IBucket,
    predicate: AttributePredicate = anyAttribute,
): IAttribute[] {
    if (!bucket) {
        return [];
    }

    // need custom type-guard so as not to break type inference in filter() method
    const compositeGuard = (obj: any): obj is IAttribute => {
        return isAttribute(obj) && predicate(obj);
    };

    return bucket.items.filter(compositeGuard);
}

/**
 * Gets first measure matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyMeasure predicate - meaning first found measure
 * will be returned.
 *
 * This function also provides convenience to find measure by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchMeasure predicate.
 *
 * @param bucket - bucket to to search in
 * @param idOrFun - measure identifier or instance of MeasurePredicate; {@link anyMeasure} predicate is default
 * @returns undefined if no matching measure is found
 * @public
 */
export function bucketMeasure(
    bucket: IBucket,
    idOrFun: string | MeasurePredicate = anyMeasure,
): IMeasure | undefined {
    if (!bucket) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchMeasure(idOrFun) : idOrFun;
    const compositeGuard = (obj: any): obj is IMeasure => {
        return isMeasure(obj) && predicate(obj);
    };

    return bucket.items.find(compositeGuard);
}

/**
 * Gets all measures matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyMeasure predicate - meaning all measures from
 * the bucket will be returned.
 *
 * @param bucket - bucket to work with
 * @param predicate - measure predicate; {@link anyMeasure} predicate is default
 * @returns empty list if none match
 * @public
 */
export function bucketMeasures(bucket: IBucket, predicate: MeasurePredicate = anyMeasure): IMeasure[] {
    if (!bucket) {
        return [];
    }

    // need custom type-guard so as not to break type inference in filter() method
    const compositeGuard = (obj: any): obj is IMeasure => {
        return isMeasure(obj) && predicate(obj);
    };

    return bucket.items.filter(compositeGuard);
}

/**
 * Gets all attributes and measures from the bucket.
 *
 * @param bucket - bucket to work with
 * @returns empty list if no items
 * @public
 */
export function bucketItems(bucket: IBucket): AttributeOrMeasure[] {
    if (!bucket) {
        return [];
    }

    return bucket.items;
}

/**
 * Gets all totals from the bucket
 *
 * @param bucket - bucket to work with
 * @returns empty list if no totals
 * @public
 */
export function bucketTotals(bucket: IBucket): ITotal[] {
    if (!bucket || !bucket.totals) {
        return [];
    }

    return bucket.totals;
}

/**
 * Defines possible compute ratio sanitization rules.
 *
 * @public
 */
export enum ComputeRatioRule {
    /**
     * Compute ratio must not be used in any measure
     */
    NEVER,

    /**
     * Compute ratio can be used if there is just a single measure
     */
    SINGLE_MEASURE_ONLY,

    /**
     * Compute ratio can be used on any measure
     */
    ANY_MEASURE,
}

/**
 * Applies compute ratio rule to all measures in a list - this MAY be done to sanitize measure definitions
 * so that the computed results make sense when visualized in a chart
 *
 * The function will return a new list with updated measures according to the specified rule; see {@link ComputeRatioRule}.
 *
 * For convenience this function can work with list of measures AND attributes; attributes will be ignored
 * in processing and kept in resulting array as-is.
 *
 * @param items - list of attributes or measures to sanitize; attributes will be lef
 * @param rule - rule to apply; see {@link ComputeRatioRule}
 * @returns new list with modified measures; the original list and measures in it are left intact
 * @public
 */
export function applyRatioRule<T extends AttributeOrMeasure>(
    items: T[],
    rule: ComputeRatioRule = ComputeRatioRule.SINGLE_MEASURE_ONLY,
): T[] {
    if (!items) {
        return [];
    }

    if (rule === ComputeRatioRule.ANY_MEASURE) {
        return items;
    }

    const numberOfMeasures = items.filter(isMeasure).length;

    if (numberOfMeasures > 1 || rule === ComputeRatioRule.NEVER) {
        return items.map(disableComputeRatio);
    }

    return items;
}

function disableComputeRatio<T extends AttributeOrMeasure>(item: T): T {
    if (isMeasure(item)) {
        return measureDisableComputeRatio(item) as T;
    }
    return item;
}
