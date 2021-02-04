import { DARK, BASIC } from './themes/';
import THEMES from "./constants/themes";
import Settings from '/imports/ui/services/settings';

export const getTheme = ()=> {
    if(Settings.application.darkMode){
        return DARK;
    }
    else{
        return BASIC
    }
};

