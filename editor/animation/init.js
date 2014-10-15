//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210', 'snap.svg_030'],
    function (ext, $, Raphael, Snap) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide = {};
            cur_slide["in"] = data[0];
            this_e.addAnimationSlide(cur_slide);
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            //YOUR FUNCTION NAME
            var fname = 'find_path';

            var checkioInput = data.in || [
                "XXXX",
                "XPEX",
                "XXXX"
            ];
            var checkioInputStr = fname + '(' + JSON.stringify(checkioInput).replace("[", "(").replace("]", ")") + ')';

            var failError = function (dError) {
                $content.find('.call').html(checkioInputStr);
                $content.find('.output').html(dError.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
            };

            if (data.error) {
                failError(data.error);
                return false;
            }

            if (data.ext && data.ext.inspector_fail) {
                failError(data.ext.inspector_result_addon);
                return false;
            }

            $content.find('.call').html(checkioInputStr);
            $content.find('.output').html('Working...');

            var svg = new SVG($content.find(".explanation")[0]);


            if (data.ext) {
                var userResult = data.out;
                var result = data.ext["result"];
                var result_addon = data.ext["result_addon"];
                var maze = data.ext["maze"];
                var player = data.ext["old_player"];
                var shifts = data.ext["shifts"];

                svg.drawMaze(maze, checkioInput, player, shifts);

                //if you need additional info from tests (if exists)
                var explanation = data.ext["explanation"];
                $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));
                if (!result) {
                    $content.find('.answer').html(result_addon);
                    $content.find('.answer').addClass('error');
                    $content.find('.output').addClass('error');
                    $content.find('.call').addClass('error');
                }
                else {
                    $content.find('.answer').remove();
                }
            }
            else {
                $content.find('.answer').remove();
            }


            //Your code here about test explanation animation
            //$content.find(".explanation").html("Something text for example");
            //
            //
            //
            //
            //


            this_e.setAnimationHeight($content.height() + 60);

        });

        //This is for Tryit (but not necessary)
//        var $tryit;
//        ext.set_console_process_ret(function (this_e, ret) {
//            $tryit.find(".checkio-result").html("Result<br>" + ret);
//        });
//
//        ext.set_generate_animation_panel(function (this_e) {
//            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find('.tryit-content');
//            $tryit.find('.bn-check').click(function (e) {
//                e.preventDefault();
//                this_e.sendToConsoleCheckiO("something");
//            });
//        });

        function SVG(dom) {

            var colorOrange4 = "#F0801A";
            var colorOrange3 = "#FA8F00";
            var colorOrange2 = "#FAA600";
            var colorOrange1 = "#FABA00";

            var colorBlue4 = "#294270";
            var colorBlue3 = "#006CA9";
            var colorBlue2 = "#65A1CF";
            var colorBlue1 = "#8FC7ED";

            var colorGrey4 = "#737370";
            var colorGrey3 = "#9D9E9E";
            var colorGrey2 = "#C5C6C6";
            var colorGrey1 = "#EBEDED";

            var colorWhite = "#FFFFFF";

            var paper;

            var player;

            var pad = 10;

            var cell = 30;

            var aCell = {"stroke": colorBlue4, "stroke-width": 2, "fill": colorGrey1};
            var aFullExit = {"stroke": colorBlue4, "font-family": "Roboto, Arial, sans", "font-size": cell};
            var aEmptyExit = {"stroke": colorBlue2, "font-family": "Roboto, Arial, sans", "font-size": cell};
            var aPlayer = {"stroke": colorBlue4, "fill": colorOrange4, "stroke-width": 2};

            this.drawMaze = function (maze, visible, playerCoor, shifts) {
                paper = Raphael(dom, pad * 2 + cell * maze[0].length, pad * 2 + cell * maze.length);
                var rowEdges = [shifts[0], shifts[0] + visible.length];
                var colEdges = [shifts[1], shifts[1] + visible[0].length];
                for (var i = 0; i < maze.length; i++) {
                    for (var j = 0; j < maze[0].length; j++) {
                        var symb = maze[i][j];
                        var r = paper.rect(pad + cell * j, pad + cell * i, cell, cell).attr(aCell);
                        if (i > rowEdges[0] && i < rowEdges[1] && j > colEdges[0] && colEdges[1]) {
                            if (symb == "W") {
                                r.attr("fill", colorBlue4);
                            }
                            else {
                                r.attr("fill", colorBlue1);
                            }
                            if (symb == "E") {
                                paper.text(pad + cell * (j + 0.5), pad + cell * (i + 0.5), cell).attr(aFullExit);
                            }
                        }
                        else {
                            if (symb == "W") {
                                r.attr("fill", colorGrey4);
                            }
                            if (symb == "E") {
                                paper.text(pad + cell * (j + 0.5), pad + cell * (i + 0.5), cell).attr(aEmptyExit);
                            }
                        }
                    }
                }
                paper.circle(
                    pad + cell * (player[1] + 0.5), pad + cell * (player[0] + 0.5), cell / 3
                ).attr(aPlayer);
            };

        }

        //Your Additional functions or objects inside scope
        //
        //
        //


    }
);
