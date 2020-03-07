# vue-submit

Helper for requests with confirmation, notification and loading status.

### Instalation

```js
import Vue from "vue";
import VueSubmit from "@rhangai/vue-submit";
import axios from "axios";

// Or using full options
Vue.use(VueSubmit, {
	axios,
	confirmation: (vm, confirmation) => {
		// Do something and returns true/false depending on the confirmation
	},
	notify: (vm, result) => {
		// Notify the status
	}
});
```

### Basic usage with buefy

```js
import Vue from "vue";
import VueSubmit from "@rhangai/vue-submit";
import axios from "axios";

Vue.use(VueSubmit, {
	axios,
	confirmation(vm, options) {
		return new Promise(resolve => {
			vm.$buefy.dialog.confirm({
				message: options.message || "Are you sure?",
				onCancel: () => resolve(false),
				onConfirm: () => resolve(true)
			});
		});
	},
	notify(vm, { notification, error }) {
		if (error) {
			vm.$buefy.snackbar.open({
				type: "is-danger",
				message: notification.message || "Something went wrong"
			});
		} else {
			vm.$buefy.snackbar.open({
				type: "is-success",
				message: notification.message || "Success"
			});
		}
	}
});
```
