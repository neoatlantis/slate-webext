<template><div>


	<div>
		<CoreStarter :started="started=$event"></CoreStarter>
	</div>

	<div v-if="!started">
		<hr />
		<CoreGenerator></CoreGenerator>
	</div>


</div></template>
<script>
import _ from "lodash";
import CoreStarter from "./CoreStarter.vue";
import CoreGenerator from "./CoreGenerator.vue";

export default {
	mounted(){
	},

	data(){
		return {
			started: false,
		}
	},

	components: {
		CoreStarter,
		CoreGenerator,
	}
}
</script>