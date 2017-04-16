(function (window) {
    var $ = window.$,
        $uploadBtn = $('#upload-btn'),
        $fileInput = $('#upload').find('.file');

     $fileInput.hover(function () {
        $uploadBtn.addClass('hover');
     }, function () {
        $uploadBtn.removeClass('hover');
     });

    window.app.upload = function (input) {
        var form = input.form;
        $('.progress.upload').css('visibility', 'visible');
        $('.preloader-wrapper').addClass('active');
        form.submit();
    };

})(window);


