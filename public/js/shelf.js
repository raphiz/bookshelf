$.getJSON("books", function( data ) {

    for (var i = 0; i < data.length; i++) {
        var item = data[i],
            basePath = 'documents/' + item._path + '/'

        $('<div/>', {class:'item'})
            .append($('<img>', {class: 'cover', src: basePath + item.cover}))
            .append($('<div/>', {class: 'title', text: item.title}))
            .append($('<div/>', {class: 'author', text: item.author}))
            .append($('<div/>', {class: 'year', text: item.year}))
            .on('click', function(){
                window.location.href = 'browse.html?doc=' + basePath + item.file;
            })
            .appendTo(".shelf");
    }
    $('.overlay').hide();
});

var refresh = false;
function status() {
    $.ajax("log")
    .done(function( data ) {
        refresh = true;
        setTimeout(status, 6000)
    })
    .error(function() {
      //Great, it's done
      $('.status').hide()
      
      if (refresh === true) {
          location.reload();
      }
    });
}
status();
