import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Vault,
} from "obsidian";
import { stringify } from "yaml";
import { getAPI } from "obsidian-dataview";
// Remember to rename these classes and interfaces!
interface MyPluginSettings {
	mySetting: string;
	fromDate: string;
	toDate: string;
	autoreporter: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "#diary",
	fromDate: "2023-06-02",
	toDate: "2023-06-31",
	autoreporter: "score(number)",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		const api = getAPI();
		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				try {
					console.log(api);

					const array = api?.index.etags.delegate.invMap.get(
						this.settings.mySetting
					);
					const objectsReport = this.settings.autoreporter;
					const typeObject = handleObjectGet(objectsReport);
					console.log(array);
					const toDate = new Date(this.settings.toDate);
					const fromDate = new Date(this.settings.fromDate);
					const dateRange = getDateRange(
						this.settings.fromDate,
						this.settings.toDate
					);
					const arrayfields = [];
					array?.forEach((e) => {
						const page = api?.index.pages.get(e);
						// TODO: this is strange

						// if (page.ctime > toDate && page.ctime < fromDate) {
						// 	arrayfields.push(
						// 		Object.fromEntries(page.fields.entries())
						// 	);
						// }
						// console.log(
						// 	dateRange.includes(getLastValueAfterSlash(e)),
						// 	getLastValueAfterSlash(e),
						// 	dateRange,
						// 	page
						// );
						if (dateRange.includes(getLastValueAfterSlash(e))) {
							arrayfields.push(
								Object.fromEntries(page.fields.entries())
							);
						}
					});
					// console.log(arrayfields);
					const object = handleParcer(arrayfields, typeObject);
					// console.log(object);
					editor.replaceSelection(stringify(object));
					new Notice("Generate");
				} catch (e) {
					console.log(e);
					new Notice("Error");
				}
				// console.log(this.app.plugins.plugins.dataview.api.index.pages("#diary/daily"))
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Tag report")
			.setDesc("Tag report")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("fromDate Report")
			.setDesc("fromDate Report")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.fromDate)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.fromDate = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("To date")
			.setDesc("To date")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.toDate)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.toDate = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Objects")
			.setDesc("Objects Report")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.autoreporter)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.autoreporter = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
const handleObjectGet = (input) => {
	const matchObjets = input.match(/\w+\((string|number)\)/g);
	const tempObject = {};
	console.log(matchObjets, "--");
	matchObjets.forEach((el) => {
		const key = el.replace(/\(\w+\)/g, "");
		const value = el.replace(/\w+\(/g, "").replace(")", "");
		tempObject[key] = value;
	});
	return tempObject;
};
const handleParcer = (fields, typeObject) => {
	let entries = Object.entries(typeObject);
	const resultOBject = {};
	const copyObject = functionCopy(typeObject);
	fields.forEach((el) => {
		entries.forEach((entryEl) => {
			const key = entryEl[0];
			const type = entryEl[1];
			const elementByEntry = el[key];
			const regeXp = /\+/g;
			if (typeof elementByEntry == type) {
				if (type == "string") {
					elementByEntry.split(" ").forEach((splitEl) => {
						const countsPlus = counterPluss(splitEl);
						copyObject[key]["+"] =
							countsPlus + copyObject[key]["+"];
						if (copyObject[key][splitEl]) {
							copyObject[key][splitEl] =
								copyObject[key][splitEl] + 1;
						} else {
							copyObject[key][splitEl] = 1;
						}
						// if (copyObject[key][splitEl + "_sum"]) {
						// 	copyObject[key][splitEl + "_sum"] =
						// 		copyObject[key][splitEl + "_sum"] + countsPlus;
						// } else {
						// 	copyObject[key][splitEl + "_sum"] = countsPlus;
						// }
					});
				}
				if (type == "number") {
					copyObject[key] = copyObject[key] + elementByEntry;
				}
			}
		});
	});
	return copyObject;
};
const counterPluss = (string) => {
	const findRegexp = string.match(/\+/g);
	if (findRegexp) {
		return findRegexp.length;
	}
	return 0;
};
const functionCopy = (object, type) => {
	const newObj = {};
	Object.entries(object).forEach((el) => {
		const type = el[1];
		if (type == "string") {
			newObj[el[0]] = {
				"+": 0,
			};
		}
		if (type == "number") {
			newObj[el[0]] = 0;
		}
	});
	return newObj;
};

function getDateRange(fromDate, toDate) {
	const dates = [];
	let currentDate = new Date(fromDate);
	const endDate = new Date(toDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0] + ".md");
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}
function getLastValueAfterSlash(str) {
	const parts = str.split("/");
	return parts[parts.length - 1];
}
