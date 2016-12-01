$(function () {
  $.get('/list', function (res) {
    for (var i = 0; i < res.length; i++) {
      $('body').prepend('<h3>' + res[i] + '</h3><video src="/video?' + res[i] + '" controls></video><br/>');
    }
  });
});
