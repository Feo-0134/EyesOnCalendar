<template>
    <div v-on:click="toggle">
        <p>name</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            open: false,
        };
    },
    methods: {
        toggle() {
            this.open = !this.open
            this.$emit('customEvent',this.dindex + 1)
            // var undoStep = { path: this.apiPath, payload: this.apiPayload }; // UNDO STEP HERE -- TODO
            // this.$history.push(undoStep);
            this.$http.post(this.apiPath, this.apiPayload);                 // Data upload WHY SYNC TWO TIMES I is here
        },
    }
}
</script>

<style>
</style>
