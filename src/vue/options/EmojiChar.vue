<template>
<div
    :style="style"
></div>
</template>
<script>
export default {
    props: ["number"],
    computed: {
        style(){
            let size_x = 1198/30, size_y = 962/24;
            let offset_x = 0;
            let offset_y = 0;

            let n = this.number % 719;

            let nx = n % 30;
            let ny = Math.floor(n / 30);
            let x = offset_x + nx * size_x;
            let y = offset_y + ny * size_y;

            return {
                display: "inline-block",
                width: size_x+"px",
                height: size_y+"px",
                background: `url('/static/emoji.png') ${-x}px ${-y}px`,
                transform: 'scale(0.6)',
            }
        }
    }
}
</script>