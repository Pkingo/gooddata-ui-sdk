// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppLog } from "./appLog";
import { PackageList } from "./packageList";
import { appLogWarn, getTerminalSize } from "./utils";
import { AppMenu, AppMenuItem } from "./appMenu";
import {
    autobuildToggled,
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
    PackageChange,
    packagesChanged,
} from "../events";
import { BuildOutput } from "./buildOutput";
import { PackageJson, TargetDependency } from "../../base/types";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";

export class TerminalUi implements IEventListener {
    private readonly screen: blessed.Widgets.Screen;
    private readonly packageList: PackageList;
    private readonly log: AppLog;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly buildOutput: BuildOutput;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly menu: AppMenu;

    private allPackages: string[] = [];
    private selectedPackages: string[] = [];

    private constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
        this.screen = this.createScreen();
        this.packageList = this.createPackageList();
        this.buildOutput = this.createBuildOutput();
        this.log = this.createApplicationLog();
        this.menu = this.createApplicationMenu();

        this.screen.render();
    }

    public static init(eventBus: EventBus = GlobalEventBus): TerminalUi {
        return new TerminalUi(eventBus);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "packagesSelected": {
                this.selectedPackages = event.body.packages;

                break;
            }
            case "targetSelected": {
                const { targetDescriptor } = event.body;
                this.allPackages = targetDescriptor.dependencies.map((dep) => dep.pkg.packageName);

                const different3rdParty = findMissing3rdPartyDependencies(targetDescriptor.dependencies);

                if (!isEmpty(different3rdParty)) {
                    this.onDifferent3rdParty(different3rdParty);
                }

                break;
            }
        }
    };

    private onDifferent3rdParty = (diff: Record<string, string[]>): void => {
        const problems = Object.entries(diff).map(([packageName, missing]) => {
            return (
                `Version of ${packageName} that is installed in the target has different dependencies compared to current version of ${packageName} which you are trying to sync. ` +
                `The following packages are missing in the target: ${missing.join(", ")}.`
            );
        });

        const message = blessed.message({
            border: "line",
            scrollable: true,
            height: 2 + problems.length * 3,
        });

        this.screen.append(message);
        this.screen.render();

        const content = problems.join("\n");

        message.log(content, () => {
            appLogWarn(content);
            appLogWarn(
                "Applink does not do anything with the 3rd party dependencies. It will continue to sync the code but you will likely run into errors in the app.",
            );

            this.screen.remove(message);
        });
    };

    private createScreen(): blessed.Widgets.Screen {
        const screen = blessed.screen({
            smartCSR: true,
            title: "GD.UI Applink DevConsole",
        });

        return screen;
    }

    private createPackageList(): PackageList {
        const [rows] = getTerminalSize(this.screen);

        return new PackageList({
            title: "Packages",
            top: 0,
            left: 0,
            height: rows - 6,
            width: 40,
            screen: this.screen,
        });
    }

    private createApplicationLog(): AppLog {
        const [rows, cols] = getTerminalSize(this.screen);

        return new AppLog({
            title: "Log",
            top: rows - 6,
            left: 0,
            width: cols,
            height: 5,
            screen: this.screen,
        });
    }

    private createBuildOutput(): BuildOutput {
        const [rows, cols] = getTerminalSize(this.screen);

        return new BuildOutput({
            title: "Build Output (hit enter on package to show)",
            top: 0,
            left: 41,
            width: cols - 41,
            height: rows - 6,
            screen: this.screen,
        });
    }

    private createApplicationMenu(): AppMenu {
        const items: AppMenuItem[] = [
            {
                name: "Log Toggle",
                keyName: "F2",
                registerKeys: ["f2"],
                registerCb: () => {
                    this.log.toggleExpand();

                    if (this.log.expanded) {
                        this.log.focus();
                    } else {
                        this.packageList.focus();
                    }
                },
            },
            {
                name: (item: AppMenuItem): string => {
                    if (item.itemState) {
                        return "Auto On";
                    } else {
                        return "Auto Off";
                    }
                },
                keyName: "F3",
                registerKeys: ["f3"],
                registerCb: (item: AppMenuItem) => {
                    item.itemState = !item.itemState;
                    this.eventBus.post(autobuildToggled(item.itemState));
                },
                itemState: true,
            },
            {
                name: "BuildOne",
                keyName: "F7",
                registerKeys: ["f7"],
                registerCb: () => {
                    if (!this.selectedPackages.length) {
                        return;
                    }

                    const changes: PackageChange[] = this.selectedPackages.map((sel) => ({
                        packageName: sel,
                        files: [],
                        independent: true,
                    }));
                    this.eventBus.post(packagesChanged(changes));
                },
            },
            {
                name: "BuildDeps",
                keyName: "F8",
                registerKeys: ["f8"],
                registerCb: () => {
                    if (!this.selectedPackages.length) {
                        return;
                    }

                    const changes: PackageChange[] = this.selectedPackages.map((sel) => ({
                        packageName: sel,
                        files: [],
                    }));
                    this.eventBus.post(packagesChanged(changes));
                },
            },
            {
                name: "BuildAll",
                keyName: "F9",
                registerKeys: ["f9"],
                registerCb: () => {
                    // fire package change for all packages. these form transitive closure so it is ok to
                    // mark changes as independent (means less initial processing for scheduler).
                    const changes: PackageChange[] = this.allPackages.map((sel) => ({
                        packageName: sel,
                        files: [],
                        independent: true,
                    }));
                    this.eventBus.post(packagesChanged(changes));
                },
            },
            {
                name: "Quit",
                keyName: "F10",
                registerKeys: ["f10"],
                registerCb: () => {
                    process.exit(0);
                },
            },
        ];

        return new AppMenu(this.screen, items);
    }
}

function findMissing3rdPartyDependencies(targets: TargetDependency[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    targets.forEach((target) => {
        const missing = identifyMissingDependencies(target.pkg.packageJson, target.packageJson);

        if (!isEmpty(missing)) {
            result[target.pkg.packageName] = missing;
        }
    });

    return result;
}

function identifyMissingDependencies(src: PackageJson, target: PackageJson): string[] {
    const sourceDependencies = Object.keys(src.dependencies || {});
    const targetDependencies = Object.keys(target.dependencies || {});

    return difference(sourceDependencies, targetDependencies);
}
