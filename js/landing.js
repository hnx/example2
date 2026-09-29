/* Gate */
$('enterBtn').onclick=()=>{
  $('gate').classList.add('gone');document.body.classList.remove('gate');show('home');
};
$('enterBtn').focus({preventScroll:true});
