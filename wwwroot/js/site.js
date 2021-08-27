$(document).ready(function () {

    var modal = document.getElementById("eventModal");
    var span = document.getElementsByClassName("close")[0];

    fillTable(modal);

    span.onclick = function () {
        modal.style.display = "none";
        document.getElementsByClassName("id-container")[0].id = -1;
        document.getElementById("txtModalEventTitle").value = "";
        document.getElementById("txtModalStartDate").value = "";
        document.getElementById("txtModalEndDate").value = "";
        document.getElementById("txtModalEventLocation").value = "";
        document.getElementById("txtModalEventDesc").value = "";
        document.getElementById("txtModalEventUrl").value = "";
        document.getElementById("chkHideEvent").value = false;
    }

    $("#btnCancel").click(function () {
        modal.style.display = "none";
        document.getElementsByClassName("id-container")[0].id = -1;
        document.getElementById("txtModalEventTitle").value = "";
        document.getElementById("txtModalStartDate").value = "";
        document.getElementById("txtModalEndDate").value = "";
        document.getElementById("txtModalEventLocation").value = "";
        document.getElementById("txtModalEventDesc").value = "";
        document.getElementById("txtModalEventUrl").value = "";
        document.getElementById("chkHideEvent").value = false;
    });

    $("#btnAddEvent").click(function () {
        modal.style.display = "block";
    });


    $("#btnSaveEvent").click(function () {

        var eventId = parseInt(document.getElementsByClassName("id-container")[0].id);
        var eventTitle = $("#txtModalEventTitle").val();
        var startDate = $("#txtModalStartDate").val();
        var endDate = $("#txtModalEndDate").val();
        var eventLocation = $("#txtModalEventLocation").val();
        var description = $("#txtModalEventDesc").val();
        var eventUrl = $("#txtModalEventUrl").val();
        var hidden = $("#chkHideEvent").is(":checked");
        var active = !hidden;

        if (endDate === "") {
            endDate = new Date("9999/12/31");
        }

        if (eventTitle === "") {
            alert("Fatal: An event title must be filled out.")
        } else if (startDate === "") {
            alert("Fatal: An event start date must be filled out.")
        } else {
            
            var eventSaveData = JSON.stringify({
                seID: eventId,
                seTitle: eventTitle,
                seStartDate: startDate,
                seEndDate: endDate,
                seLocation: eventLocation,
                seDescription: description,
                seUrl: eventUrl,
                seActive: active
            });

            $.ajax({
                type: "POST",
                url: "https://eventsapi2.netkinetix.com/SiteEvent/Set",
                data: eventSaveData,
                dataType: "json",
                contentType: "application/json",
                success: function (result, status, xhr) {
                    location.reload();
                },
                error: function (xhr, status, error) {
                    alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
                }
            });

         }      
    });

    $("#btnSearchEvents").click(function () {

        var Table = document.getElementById("tbodySearchResults");
        Table.innerHTML = "";


        var eventTitle = $("#txtEventTitle").val();
        var startDate = $("#txtStartDateAfter").val();
        var endDate = $("#txtStartDateBefore").val();

        if (startDate === "") {
            startDate = "2016-01-01T06:00:00.000Z";
        }
        if (endDate === "") {
            endDate = "2021-01-01T06:00:00.000Z";
        }

        var formData = JSON.stringify({
            seTitle: eventTitle,
            seStartDate: startDate,
            seEndDate: endDate
        });

        $.ajax({
            type: "POST",
            url: "https://eventsapi2.netkinetix.com/SiteEvent/Search",
            data: formData,
            dataType: "json",
            contentType: "application/json",
            success: function (result, status, xhr) {
                //add new rows into the table
                var table = "";

                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {

                        var date = new Date(result[i]["seStartDate"]);
                        var month = ("0" + (date.getMonth() + 1)).slice(-2);
                        var day = ("0" + date.getDate()).slice(-2);
                        var year = date.getFullYear();
                        var formattedDate = month + "-" + day + "-" + year;

                        table += ("<tr><td><button class = 'asText' style='color: blue' id = '" + result[i]["seID"] + "'> " + result[i]["seTitle"] + " </button></td>");
                        table += ("<td>" + formattedDate + "</td>");
                        table += ("<td>" + result[i]["seDescription"] + "</td></tr>");
                    }

                    $("#tbodySearchResults").html(table);

                    $("tr:even").css("background-color", "#a8a8a8");

                    $(".asText").on('click', function () {

                        document.getElementsByClassName("id-container")[0].id = $(this).attr('id');

                        $.ajax({
                            type: "GET",
                            url: "https://eventsapi2.netkinetix.com/SiteEvent/GetById/" + $(this).attr('id'),
                            dataType: "json",
                            success: function (result, status, xhr) {
                                //open the popup and fill in the data of the event clicked
                                modal.style.display = "block";
                                //$("#txtModalEventTitle").value = result["seTitle"];
                                document.getElementById("txtModalEventTitle").value = result["seTitle"];
                                document.getElementById("txtModalEventLocation").value = result["seLocation"];
                                document.getElementById("txtModalEventDesc").value = result["seDescription"];
                                document.getElementById("txtModalEventUrl").value = result["seUrl"];
                                document.getElementById("chkHideEvent").checked = !result["seActive"];

                                var date = new Date(result["seStartDate"]);
                                var month = ("0" + (date.getMonth() + 1)).slice(-2);
                                var day = ("0" + date.getDate()).slice(-2);
                                var year = date.getFullYear();
                                var formattedDate = year + "-" + month + "-" + day;

                                document.getElementById("txtModalStartDate").value = formattedDate;

                                date = new Date(result["seEndDate"]);
                                month = month = ("0" + (date.getMonth() + 1)).slice(-2);
                                day = day = ("0" + date.getDate()).slice(-2);
                                year = date.getFullYear();
                                formattedDate = formattedDate = year + "-" + month + "-" + day;

                                document.getElementById("txtModalEndDate").value = formattedDate;
                            },
                            error: function (xhr, status, error) {
                                alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
                            }
                        });
                    });
                } else {
                    fillTable(modal);
                }

            },
            error: function (xhr, status, error) {
                alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
            }
        });
    });
});



function fillTable(modal) {
    //pull all active events and display in a grid on the first page
    $.ajax({
        type: "GET",
        url: "https://eventsapi2.netkinetix.com/SiteEvent/List/true",
        dataType: "json",
        success: function (result, status, xhr) {

            //add new rows into the table
            var table = "";

            for (let i = 0; i < result.length; i++) {

                var date = new Date(result[i]["seStartDate"]);
                var month = ("0" + (date.getMonth() + 1)).slice(-2);
                var day = ("0" + date.getDate()).slice(-2);
                var year = date.getFullYear();
                var formattedDate = month + "-" + day + "-" + year;

                table += ("<tr><td><button class = 'asText' style='color: blue' id = '" + result[i]["seID"] + "'> " + result[i]["seTitle"] + " </button></td>");
                table += ("<td>" + formattedDate + "</td>");
                table += ("<td>" + result[i]["seDescription"] + "</td></tr>");
            }

            $("#tbodySearchResults").html(table);

            $("tr:even").css("background-color", "#a8a8a8");

            $(".asText").on('click', function () {

                document.getElementsByClassName("id-container")[0].id = $(this).attr('id');

                $.ajax({
                    type: "GET",
                    url: "https://eventsapi2.netkinetix.com/SiteEvent/GetById/" + $(this).attr('id'),
                    dataType: "json",
                    success: function (result, status, xhr) {
                        //open the popup and fill in the data of the event clicked
                        modal.style.display = "block";
                        //$("#txtModalEventTitle").value = result["seTitle"];
                        document.getElementById("txtModalEventTitle").value = result["seTitle"];
                        document.getElementById("txtModalEventLocation").value = result["seLocation"];
                        document.getElementById("txtModalEventDesc").value = result["seDescription"];
                        document.getElementById("txtModalEventUrl").value = result["seUrl"];
                        document.getElementById("chkHideEvent").checked = !result["seActive"];

                        var date = new Date(result["seStartDate"]);
                        var month = ("0" + (date.getMonth() + 1)).slice(-2);
                        var day = ("0" + date.getDate()).slice(-2);
                        var year = date.getFullYear();
                        var formattedDate = year + "-" + month + "-" + day;

                        document.getElementById("txtModalStartDate").value = formattedDate;

                        date = new Date(result["seEndDate"]);
                        month = month = ("0" + (date.getMonth() + 1)).slice(-2);
                        day = day = ("0" + date.getDate()).slice(-2);
                        year = date.getFullYear();
                        formattedDate = formattedDate = year + "-" + month + "-" + day;

                        document.getElementById("txtModalEndDate").value = formattedDate;
                    },
                    error: function (xhr, status, error) {
                        alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
                    }
                });
            });

        },
        error: function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        }
    });
}






