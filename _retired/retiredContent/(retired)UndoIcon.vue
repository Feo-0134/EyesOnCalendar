<template>
    <div class="undo">
        <p class="undo-text">
            UNDONE
        </p>
    </div>
</template>

<style>
.undo {
  width: 20%;
  height: 15%;
  position: fixed;
  left: 50%;
  top: 50%;
  margin-left: -10%;
  margin-top: -7.5%;
  color: white;
  font-size: 50px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 40px;
  -webkit-transition: background-color 2s ease-out;
  -moz-transition: background-color 2s ease-out;
  -o-transition: background-color 2s ease-out;
  transition: background-color 2s ease-out;
}

.undo-text {
  display: flex;
  justify-content: center;
  line-height: 50px;
  text-align: center;
}
</style>
