



<script lang="javascript">

    import "./style.css"
    
     const record = () => {
        navigator.mediaDevices.getUserMedia({ audio: true, video : true })
            .then(stream => {
          

                const mediaRecorder = new window.MediaRecorder(stream);
                mediaRecorder.start();

                const audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const videoEle = document.getElementById('audioBoi');
                    videoEle.src=  audioUrl;
                    const messageBox = document.getElementById('messageBox');
                    messageBox.innerHTML = "Your video has been captured";
                    messageBox.classList.add("danger");
                });

                setTimeout(() => {
                    mediaRecorder.stop();
                }, 3000);
        })
    }
    record();


</script>



<video autoplay id="audioBoi"></video>
<span class="message" id="messageBox" >Very Useful extension</span>