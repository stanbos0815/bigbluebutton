import React from 'react';

export default class BaseMenu extends React.Component {
  constructor(props) {
    super(props);

    this.handleUpdateSettings = props.handleUpdateSettings;
  }

  handleToggle(key) {
    const obj = this.state;
    obj.settings[key] = !this.state.settings[key];
    console.log(obj.settings[key]+" "+key+" "+!this.state.settings[key])
    this.setState(obj, () => {
      console.log(this.state.settingsName)
      expandedLog(this.state.settings,100,0)
      this.handleUpdateSettings(this.state.settingsName, this.state.settings);
    });
  }
  handleDarkMode(){
    document.documentElement.style.setProperty('--color-white', '#000000');
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