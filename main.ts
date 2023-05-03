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
import { stringify } from 'yaml'
import { getAPI } from "obsidian-dataview";
// Remember to rename these classes and interfaces!
interface MyPluginSettings {
	mySetting: string;
	year: string;
	month: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
	year: "2023",
	month: "5",
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

	
					const array = api?.index.etags.delegate.invMap.get(
						this.settings.mySetting
					);
					let object = {
						time_sleep: 0,
						english: 0,
						work: 0,
						score: 0,
						algoritms: 0,
						focus_time: 0,
						sport: 0
					}
					array?.forEach((e) => {
						const page = api?.index.pages.get(e)
							
						if(page?.ctime.c.year == parseInt(this.settings.year) && page?.ctime.c.month == parseInt(this.settings.month)) {
	
							const regeXp = /\+/g
					
							if(typeof page?.fields.get("score") == "number"){
								object.score = object.score + page?.fields.get("score")
							}
							if(typeof page?.fields.get("focus_time") == "number"){
								object.focus_time = object.focus_time + page?.fields.get("focus_time")
							}
	
							if(typeof page?.fields.get("time_sleep") == "number"){
								object.time_sleep = object.time_sleep + page?.fields.get("time_sleep")
							}
							console.log(page?.fields.get("algoritms"))
							if( page?.fields.get("algoritms")){
								const find = page?.fields.get("algoritms").match(regeXp)
								if (find)
									object.algoritms = object.algoritms + find.length
							}
	
							if( page?.fields.get("english")){
								console.log(page?.fields.get("english"))
								const find = page?.fields.get("english").match(regeXp)
								if (find)
									object.english = object.english + find.length
							}
	
							if( page?.fields.get("work")){
								const find = page?.fields.get("work").match(regeXp)
								if (find)
									object.work = object.work + find.length
							}
					
							if(typeof page?.fields.get("sport") == "string"){
								const find = page?.fields.get("sport").match(regeXp)
								if (find)
									object.sport = object.sport + find.length
							}
						}
						});
	
					
	
					
					editor.replaceSelection(stringify(object));
					new Notice("Generate")
				}
				catch(e) {
					new Notice("Error")
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
			.setName("Year Report")
			.setDesc("Year Report")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.year)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.year = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Year Report")
			.setDesc("Mounth Report")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.month)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.month = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
