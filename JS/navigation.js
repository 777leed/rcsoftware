
  document.addEventListener('keydown', (event)=>{
    if (event.keyCode === 8 && location.href.split("/").slice(-1)[0] === 'allspaces.html') {
      window.location.href = `../Html/initial.html`;

    }
  });


if (location.href.split("/").slice(-1)[0] != 'initial.html') {
  document.getElementById('goback').addEventListener('click', (event) => {
    window.location.href = `../Html/initial.html`;
  
  });
}
