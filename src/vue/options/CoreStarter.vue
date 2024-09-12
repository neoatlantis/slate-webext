<template>
<div>

	<div>Start the crypto core by supplying a seed file and your password.</div>

	<div>
		Seed file:
		<input type="file" @change="read_file"/>
	</div>

	<div>
		Your password:
		<input type="password" />
	</div>

	<div>
		<button type="button">Start the core</button>
	</div>


</div>
</template>
<script>
export default {
	data(){ return {
	}},

	methods: {
		read_file(e){
			console.log(e);
		}
	}
}
</script>