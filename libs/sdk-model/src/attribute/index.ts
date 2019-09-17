// (C) 2019 GoodData Corporation
import { Identifier, ObjQualifier } from "../base";
import isEmpty = require("lodash/isEmpty");

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttribute {
    attribute: {
        localIdentifier: Identifier;
        displayForm: ObjQualifier;
        alias?: string;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isAttribute(obj: any): obj is IAttribute {
    return !isEmpty(obj) && (obj as IAttribute).attribute !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type AttributePredicate = (attribute: IAttribute) => boolean;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export const anyAttribute: AttributePredicate = _ => true;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export const idMatchAttribute: (id: string) => AttributePredicate = id => attr =>
    attr.attribute.localIdentifier === id;

//
//
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function attributeId(a: IAttribute): string {
    return a.attribute.localIdentifier;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function attributeFingerprint(attribute: IAttribute): string {
    return JSON.stringify(attribute);
}
