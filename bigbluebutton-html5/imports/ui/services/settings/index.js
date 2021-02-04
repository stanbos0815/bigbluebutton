import Storage from '/imports/ui/services/storage/session';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';

const SETTINGS = [
  'application',
  'audio',
  'video',
  'cc',
  'dataSaving',
];

class Settings {
  constructor(defaultValues = {}) {
    SETTINGS.forEach((p) => {
      const privateProp = `_${p}`;
      this[privateProp] = {
        tracker: new Tracker.Dependency(),
        value: undefined,
      };

      Object.defineProperty(this, p, {
        get: () => {
          this[privateProp].tracker.depend();
          return this[privateProp].value;
        },

        set: (v) => {
          this[privateProp].value = v;
          this[privateProp].tracker.changed();
        },
      });
    });

    // Sets default locale to browser locale
    defaultValues.application.locale = navigator.languages ? navigator.languages[0] : false
      || navigator.language
      || defaultValues.application.locale;

    this.setDefault(defaultValues);
  }

  setDefault(defaultValues) {
    const savedSettings = {};

    SETTINGS.forEach((s) => {
      savedSettings[s] = Storage.getItem(`settings_${s}`);
    });

    Object.keys(defaultValues).forEach((key) => {
      this[key] = _.extend(defaultValues[key], savedSettings[key]);
    });

    this.save();
  }
  handleDarkMode(darkMode){
    if(darkMode){
    document.documentElement.style.setProperty('--color-chat', getComputedStyle(document.body).getPropertyValue('--color-black'));
    }
    else{
      document.documentElement.style.setProperty('--color-chat', getComputedStyle(document.body).getPropertyValue('--color-white'));
    }
  }
  save() {
    /*console.log(Storage.getItem("settings"+"darkMode"))
    console.log(this["darkMode"].value)
    if(Storage.getItem("settings"+"darkMode")!==this["darkMode"].value){
      this.handleDarkMode(this["darkMode"].value);
    }*/
    Object.keys(this).forEach((k) => {
      console.log(k);
      console.log(`settings${k}`);
      console.log(this[k].value);
      Storage.setItem(`settings${k}`, this[k].value);
    });

    const userSettings = {};

    SETTINGS.forEach((e) => {
      userSettings[e] = this[e];
    });

    Tracker.autorun((c) => {
      const { status } = Meteor.status();
      if (status === 'connected') {
        c.stop();
        makeCall('userChangedLocalSettings', userSettings);
      }
    });
  }
}

const SettingsSingleton = new Settings(Meteor.settings.public.app.defaultSettings);
export default SettingsSingleton;
