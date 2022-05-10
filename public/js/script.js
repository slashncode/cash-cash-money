
//burger menu slide in/out
document.querySelector(".burgericon").addEventListener("click", function() {
    if(document.querySelector(".burgermenu").style.width == "80vw"){
        document.querySelector(".burgermenu").style.width = "0px";
    }
    else{
        document.querySelector(".burgermenu").style.width = "80vw";
    }
    }
  );
