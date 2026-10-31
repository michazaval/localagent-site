import {mountSite} from './ui.js';
import {createMorphScene} from './morph-scene.js';
const dispose=mountSite(createMorphScene);
window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
