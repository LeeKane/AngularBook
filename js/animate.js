/**
 * Created by LeeKane on 17/3/7.
 */
$(document).ready(function () {
    $('#fullpage').fullpage({
        anchors: ['page1', 'page2', 'page3', 'page4', 'page5', 'page6'],
        'navigation': true,
        'navigationPosition': 'right',
        'navigationTooltips': ['高分图书', '中国文学', '外国文学', '短片小说', '历史传记', '最受关注'],
        'navigationColor': '#e50914',
        'loopBottom': true,
    });
    $('#fullpage').fullpage.setAllowScrolling(false, 'down, up');
});
