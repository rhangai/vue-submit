import { SubmitManager } from "../SubmitManager";
import { SubmitOptionsFramework } from "../Options";
import { createDefaultsVanilla } from "./Vanilla";
import { createDefaultsBuefy } from "./Buefy";

export default function createDefaults( submitManager: SubmitManager, framework: SubmitOptionsFramework = null  ) {
	let defaults: any = createDefaultsVanilla( submitManager );
	if ( framework === 'buefy' )
		defaults = Object.assign( defaults, createDefaultsBuefy( submitManager, defaults ) );
	return defaults;
};