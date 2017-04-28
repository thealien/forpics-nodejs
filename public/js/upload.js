(function (window) {
    var $ = window.$,
        $uploadBtn = $('#upload-btn'),
        $fileInput = $('#upload').find('.file');

     $fileInput.hover(function () {
        $uploadBtn.addClass('hover');
     }, function () {
        $uploadBtn.removeClass('hover');
     });

    // 50MB
    var maxFilesSize = 1024 * 1024 * 50;

    window.app.upload = function (input) {
        var files = input.files,
            summSize = 0,
            count = files.length;

        while (count--) {
            summSize += files[count].size;
        }

        if (summSize > maxFilesSize) {
            Materialize.toast('Ощий вес выбранных файлов превышает 50 MB. \nПожалуйста, выберите меньшее количество файлов', 3000);
            return false;
        }

        var form = input.form;
        $('.progress.upload').css('visibility', 'visible');
        $('.preloader-wrapper').addClass('active');
        form.submit();
    };

})(window);


