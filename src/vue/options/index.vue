<template><div class="container-fluid" style="padding: 0.5em">


	<div>
		<CoreStarter @started="started=$event"></CoreStarter>
	</div>

	<div v-if="!started">
		<br />
		<CoreSeedfileGenerator></CoreSeedfileGenerator>
	</div>


</div></template>
<script>
import _ from "lodash";
import CoreStarter from "./CoreStarter.vue";
import CoreSeedfileGenerator from "./CoreSeedfileGenerator.vue";

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
		CoreSeedfileGenerator,
	}
}
</script>