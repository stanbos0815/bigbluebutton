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
    defaultValues.application.darkMode=false;
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
      document.documentElement.style.setProperty('--color-chat', getComputedStyle(document.body).getPropertyValue('--color-darkmode-chat'));
      document.documentElement.style.setProperty('--color-background', getComputedStyle(document.body).getPropertyValue('--color-darkmode-background'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-background-color', getComputedStyle(document.body).getPropertyValue('--color-darkmode-background'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-color', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--user-list-darktheme', getComputedStyle(document.body).getPropertyValue('--color-darkmode-background'));

    }
    else{
      document.documentElement.style.setProperty('--color-chat', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-background', getComputedStyle(document.body).getPropertyValue('--color-standard-background'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-background-color', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-color', getComputedStyle(document.body).getPropertyValue('--color-black'));
      document.documentElement.style.setProperty('--user-list-darktheme', getComputedStyle(document.body).getPropertyValue('--color-off-white'));
    }
  }
  
  save() {
    console.log(expandedLog(Storage.getItem("settings_application"),100,0));

    if(Storage.getItem("settings_application").darkMode!==this["_application"].value.darkMode){
       this.handleDarkMode(this["_application"].value.darkMode);
    }
    
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
function expandedLog(item, maxDepth = 100, depth = 0){
  if (depth > maxDepth ) {
      console.log(item);
      return;
  }
  if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
          console.group(key + ' : ' +(typeof value));
          expandedLog(value, maxDepth, depth + 1);
          console.groupEnd();
      });
  } else {
      console.log(item);
  }
}

const SettingsSingleton = new Settings(Meteor.settings.public.app.defaultSettings);
export default SettingsSingleton;
