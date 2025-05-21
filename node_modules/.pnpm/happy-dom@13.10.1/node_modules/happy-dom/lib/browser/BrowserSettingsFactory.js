import DefaultBrowserSettings from './DefaultBrowserSettings.js';
/**
 * Browser settings utility.
 */
export default class BrowserSettingsFactory {
    /**
     * Returns browser settings.
     *
     * @param [settings] Browser settings.
     * @param [freezeObject] "true" to freeze the object.
     * @returns Settings.
     */
    static getSettings(settings) {
        return {
            ...DefaultBrowserSettings,
            ...settings,
            navigation: {
                ...DefaultBrowserSettings.navigation,
                ...settings?.navigation
            },
            navigator: {
                ...DefaultBrowserSettings.navigator,
                ...settings?.navigator
            },
            device: {
                ...DefaultBrowserSettings.device,
                ...settings?.device
            }
        };
    }
}
//# sourceMappingURL=BrowserSettingsFactory.js.map