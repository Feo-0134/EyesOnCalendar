<template>
    <div> 
        <h1> 404 Page Not Found </h1>
        <button class="modal-default-button"><a :href="linkToCalendar" class="linkFontStyle">Back To Calendar</a></button>
    </div>
</template>

<script>
export default {
    computed: {
        linkToCalendar() {
        return "/";
        },
    }
}
</script>

<style>
.linkFontStyle {
    font-size: 16px;
    color: #FFF;
    text-decoration: none;
}
.modal-default-button {
  background-color: #4CAF50; /* Green */
  border: none;
  color: rgb(255, 255, 255);
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 20px;
}

</style>
