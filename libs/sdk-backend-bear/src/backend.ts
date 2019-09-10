// (C) 2019 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import {
    AnalyticalBackendConfig,
    BackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    NotAuthenticated,
} from "@gooddata/sdk-backend-spi";
import { factory as createSdk, SDK } from "@gooddata/gooddata-js";
import { BearWorkspace } from "./workspace";
import { IAuthenticatedSdkProvider } from "./commonTypes";

const CAPABILITIES: BackendCapabilities = {
    canCalculateTotals: true,
    canExportCsv: true,
    canExportXlsx: true,
    canSortData: true,
    canTransformExistingResult: false,
    maxDimensions: 2,
    supportsElementUris: true,
    supportsObjectUris: true,
};

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export type BearBackendConfig = {
    packageName?: string;
    packageVersion?: string;
};

type TelemetryData = {
    componentName?: string;
    props?: string[];
};

export class BearBackend implements IAnalyticalBackend, IAuthenticatedSdkProvider {
    public readonly capabilities: BackendCapabilities = CAPABILITIES;
    public readonly config: AnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: any;
    private readonly sdk: SDK;
    private readonly deferredAuth: Promise<any> | undefined;

    constructor(
        config?: AnalyticalBackendConfig,
        implConfig?: BearBackendConfig,
        telemetry?: TelemetryData,
        deferredAuth?: Promise<any>,
    ) {
        this.config = configSanitize(config);
        this.implConfig = bearConfigSanitize(implConfig);
        this.telemetry = telemetrySanitize(telemetry);

        this.sdk = newSdkInstance(this.config, this.implConfig, this.telemetry);

        if (deferredAuth) {
            this.deferredAuth = deferredAuth;
        } else if (this.config.credentials) {
            this.deferredAuth = this.sdk.user.login(
                this.config.credentials.username,
                this.config.credentials.password,
            );
        }
    }

    public onHostname(hostname: string): IAnalyticalBackend {
        return new BearBackend({ ...this.config, hostname }, this.implConfig, this.telemetry);
    }

    public withCredentials(username: string, password: string): IAnalyticalBackend {
        return new BearBackend(
            { ...this.config, credentials: { username, password } },
            this.implConfig,
            this.telemetry,
        );
    }

    public withTelemetry(componentName: string, props: object): IAnalyticalBackend {
        return new BearBackend(
            this.config,
            this.implConfig,
            { componentName, props: Object.keys(props) },
            this.deferredAuth,
        );
    }

    public workspace(id: string): IAnalyticalWorkspace {
        if (!this.deferredAuth) {
            // TODO: SDK8: rework this to account for SSO
            throw new NotAuthenticated("Backend is not set up with credentials.");
        }

        return new BearWorkspace(this, id);
    }

    public get(): Promise<SDK> {
        if (!this.deferredAuth) {
            // TODO: SDK8: rework this to account for SSO
            throw new NotAuthenticated("Backend is not set up with credentials.");
        }

        return this.deferredAuth
            .then(_ => {
                return this.sdk;
            })
            .catch(e => {
                const user = this.config.credentials ? this.config.credentials.username : "unknown";
                throw new NotAuthenticated(
                    `Authentication to hostname ${this.config.hostname} as user ${user} has failed`,
                    e,
                );
            });
    }
}

function configSanitize(config?: AnalyticalBackendConfig): AnalyticalBackendConfig {
    return config ? config : {};
}

function bearConfigSanitize(implConfig?: BearBackendConfig): BearBackendConfig {
    return implConfig ? implConfig : {};
}

function telemetrySanitize(telemetry?: TelemetryData): TelemetryData {
    return telemetry ? telemetry : {};
}

function newSdkInstance(
    config: AnalyticalBackendConfig,
    implConfig: BearBackendConfig,
    telemetry: TelemetryData,
): SDK {
    const sdk = createSdk();

    if (config.hostname) {
        sdk.config.setCustomDomain(config.hostname);
    }

    if (implConfig.packageName && implConfig.packageVersion) {
        sdk.config.setJsPackage(implConfig.packageName, implConfig.packageVersion);
    }

    if (telemetry.componentName) {
        sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP", telemetry.componentName);

        if (telemetry.props && !isEmpty(telemetry.props)) {
            sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP-PROPS", telemetry.props.join(","));
        }
    }

    return sdk;
}
