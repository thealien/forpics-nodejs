/*global $, app*/

(function () {

    function selectActiveMenu(item) {
        $('.side-nav').find('li.' + item).addClass('active');
    }

    $(function () {
        selectActiveMenu(app.active_menu);
    });

})();

