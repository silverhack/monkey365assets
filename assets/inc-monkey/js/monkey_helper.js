//Sidebar collapse function
$(document).ready(function(){
	$("#sidebarCollapse").on('click', function(){
		//adjust
		$("#sidebar").toggleClass('active');
	});
	//adjust datatables
	$('.collapse').on('shown.bs.collapse', function (e) {
		var table = $(this).find('table');
		if(table && $(table).attr('id')){
			//highlight code if any
			if (typeof hljs !== 'undefined') {
				var mybuttons = $(table).find('button');
				if (mybuttons) {
					for (var i=0; i < mybuttons.length; i++) {
						if($(mybuttons[i]).attr('title') && $(mybuttons[i]).attr('title')  == "showModal"){
							var mybuttonId = $(mybuttons[i]).attr('data-bs-target');
							if(mybuttonId){
								var myobj = document.getElementById(mybuttonId.substring(1));
								var codeId = $(myobj).find('code').attr('id');
								if(codeId){
									var myobj = document.getElementById(codeId);
									if (myobj.hasAttribute('data-highlighted')) {
										//data already highlighted
									}
									else{
										var obj = JSON.parse(myobj.innerText);
										myobj.textContent = JSON.stringify(obj, undefined, 4)
										hljs.highlightElement(myobj);
									}
								}
							}
						}
					}
				}
			}
			//initialise dataTable
			var type = $(table).attr('type');
			var tid = $(table).attr('id');
			if ((!$.fn.DataTable.isDataTable('#'+tid)) && (type == 'asList')){
				InitDatatableAsList(tid);
			}
			else if ((!$.fn.DataTable.isDataTable('#'+tid)) && (type == 'Default')){
				InitDatatableNormal(tid);
			}
			if(tid){
				$(tid).DataTable().columns.adjust();
				$(tid).DataTable().columns.adjust().draw();
				$(tid).DataTable().responsive.recalc();
			}
		}
	});
	//modal issue
	//https://github.com/twbs/bootstrap/issues/41005
	var modals = document.getElementsByClassName("modal");
    if (modals) {
		for (var i=0; i < modals.length; i++) {
			modals[i].addEventListener('hide.bs.modal', () => {
				if (document.activeElement instanceof HTMLElement) {
					document.activeElement.blur();
				}
			});
		}
	}
	//Init dashboard table
	InitDatatableNormal("dashboard_table");
	$("dashboard_table").DataTable().columns.adjust().draw();
	//$("dashboard_table").DataTable().responsive.recalc();
});

//clipboard
$('.monkey-clipboard').click(function(e) {
	var bsTarget = $(this).attr('data-bs-target');
	var buttonId = bsTarget.split("-");
	if(buttonId){
		copyToClipboard(buttonId[0]);
	}
});


//Search filter

$(".form-control.search-filter").on("input", function()  {
	var searchVal = $(this).val().toLowerCase();
	if ( searchVal != '' ) {
		$('#Monkey365Data').children().not("#Monkey365GlobalFindings").addClass('d-none');
		$('#Monkey365GlobalFindings').removeClass('d-none');
		$('#Monkey365Findings').empty()
		$('[id$="-findings"]').children().filter(function() {
			if ($(this).find('.card-header').text().toLowerCase().indexOf(searchVal) > -1) {
				let iterator = 0;
				let clone = document.getElementById($(this).attr('id')).cloneNode(true);
				//find table
				let tabpane = clone.querySelectorAll('.tab-pane')
				// add unique classes to each pane element
				clone.querySelectorAll('.tab-pane').forEach((el, i) => {
					var id = $(el).attr('id')
					el.setAttribute('id', (id + 1));
					el.classList.add('tab_' + iterator + i);
					var _table = el.getElementsByTagName("table");
					if(_table[0]){
						var tableId = $(_table[0]).attr('id')
						let _clone = document.getElementById($(_table[0]).attr('id')).cloneNode(true);
						_clone.setAttribute('id', (tableId + 1));
						$(el).html(_clone.outerHTML)
					}
				});

				clone.querySelectorAll('.nav-link').forEach((el, i) => {
					// update href attributes on each tab element to match panes
					var id = $(el).attr('href')
					id = id.substring(1);
					el.setAttribute('href', ("#" + id + 1));
					// initialize Bootstrap tabs on each tab element
					const tab = new bootstrap.Tab(el)
					el.addEventListener('click', event => {
						event.preventDefault();
						tab.show();
					})
				});
				// append the clone
				
				document.querySelector('#Monkey365Findings').appendChild(clone);
			}
		})
	}
	else{
		$('#Monkey365Findings').empty();
		$('#Monkey365GlobalFindings').addClass('d-none');
		show('monkey-main-dashboard');
	}
});

//clipboard 
async function copyToClipboard (id) {
	let result = await navigator.clipboard.writeText(id);
};

//Change theme
const toggleTheme = document.getElementById("toggleTheme");

function changeTheme() {
	if(this.classList.contains('bi-sun')){
		//trans();
		//this.classList.toggle("bi-moon");
		this.className = "bi bi-moon";
		document.documentElement.setAttribute('data-theme','dark');
	}
	else{
		//trans();
		this.className = "bi bi-sun";
		document.documentElement.setAttribute('data-theme','light');
	}
}

toggleTheme.addEventListener("click", changeTheme);


let trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition')
    }, 1000)
}

$('.form-control.finding-filter').on("input", function() {
	var searchVal = $(this).val().toLowerCase();
	var id = $(this).parent().next('.monkey-card-data').attr('id');
	$('#'+id).children().filter(function() {
		$(this).toggle($(this).find('.card-header').text().toLowerCase().indexOf(searchVal) > -1)		
	})
});

//Filter button
$('.btn-filter').click(function(e) {
	var value = $(this).attr('data-filter-name').toLowerCase();
	var id = $(this).parent().next('.monkey-card-data').attr('id')
	if(value == 'all'){
		//remove d-none class
		$('#'+id).find('.monkey-finding-card').removeClass('d-none');
	}
	else{
		$('#'+id).find('.monkey-finding-card').removeClass('d-none');
		$('#'+id).find('.monkey-finding-header').children().not('.finding-badge-'+value).closest('.monkey-finding-card').addClass('d-none');
	}
});

jQuery.expr[':'].icontains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

function openModal(message){
	var modal = $('#monkey365error');
	modal.find('.modal-body').html(message);
	$('#monkey365error').modal('show');
}

function hasClass(element, className) {
    return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}

function show(elementID) {
    var ele = document.getElementById(elementID);
    if (!ele) {
        openModal(elementID+" was not found");
        return;
    }
	//Hide all except ID
	$('#Monkey365Data').children().not("#accountInfo").addClass('d-none');
	
	//Show element
	if($('#'+elementID)){
        $('#'+elementID).removeClass('d-none');
    }
}

function InitDatatableAsList(ID) {
    var ele = document.getElementById(ID);
    if (!ele) {
        openModal("no such table ID "+ID);
        return;
    }
    var oTable = $("#"+ID).DataTable({
		lengthChange: false,
		responsive: true,
		aaSorting: [],
		bSort: false,
		info: false,
		paging: false,
		searching: false,
        dom: 'Bfrtip',
        fixedColumns: true,
		fixedHeader: true,
		//scrollCollapse: true,
		layout: {
			topStart: 'buttons',
		},
		buttons: {
          dom: {
            container:{
              tag:'div',
              className:'flexcontent'
            },
            buttonLiner: {
              tag: null
            }
          },
		  buttons: [
			{
				extend:    'excelHtml5',
				text:      '<i class="bi bi-file-spreadsheet"></i>',
				title:'Monkey365 Excel results',
				titleAttr: 'Excel',
				className: 'dtbtn dtbtn-app excel',
				messageTop: 'https://github.com/silverhack/monkey365'
			},
			{
				extend:    'csvHtml5',
				text:      '<i class="bi bi-filetype-csv"></i>',
				title:'Monkey365 CSV results',
				titleAttr: 'CSV',
				className: 'dtbtn dtbtn-app csv'
			},
			{
				extend:    'print',
				text:      '<i class="bi bi-printer-fill"></i>',
				title:'Monkey365 Print results',
				titleAttr: 'Print',
				className: 'dtbtn dtbtn-app print',
				messageTop: 'https://github.com/silverhack/monkey365',
				customize: function ( win ) {
						$(win.document.body)
							.css( 'font-size', '10pt' ) 
						$(win.document.body).find( 'table' )
							.addClass( 'compact' )
							.css( 'font-size', 'inherit' );
					}
			}
		],
		}
	}).columns.adjust();
}

function InitDatatableNormal(ID) {
    var ele = document.getElementById(ID);
    if (!ele) {
        openModal("no such table ID "+ID);
        return;
    }
    var oTable = $("#"+ID).DataTable({
		responsive: true,
		"initComplete": function (settings, json) {  
			$("#"+ID).wrap("<div class='monkey-datatable'></div>");            
		},
		layout: {
			topStart: 'buttons',
			topEnd: {
				search: {
					placeholder: 'Search here'
				}
			},
			bottomEnd: {
				paging: {
					numbers: true,
					firstLast: true
				}
			}
		},
        buttons: {
          dom: {
            container:{
              tag:'div',
              className:'flexcontent'
            },
            buttonLiner: {
              tag: null
            }
          },
		  buttons: [
                    {
                        extend:    'excelHtml5',
                        text:      '<i class="bi bi-file-spreadsheet"></i>',
                        title:'Monkey365 Excel results',
                        titleAttr: 'Excel',
                        className: 'dtbtn dtbtn-app excel',
						messageTop: 'https://github.com/silverhack/monkey365'
                    },
                    {
                        extend:    'csvHtml5',
                        text:      '<i class="bi bi-filetype-csv"></i>',
                        title:'Monkey365 CSV results',
                        titleAttr: 'CSV',
                        className: 'dtbtn dtbtn-app csv'
                    },
					{
                        extend:    'print',
                        text:      '<i class="bi bi-printer-fill"></i>',
                        title:'Monkey365 Print results',
                        titleAttr: 'Print',
                        className: 'dtbtn dtbtn-app print',
						messageTop: 'https://github.com/silverhack/monkey365',
						customize: function ( win ) {
								$(win.document.body)
									.css( 'font-size', '10pt' ) 
								$(win.document.body).find( 'table' )
									.addClass( 'compact' )
									.css( 'font-size', 'inherit' );
							}
                    },
                ],
		}
	}).columns.adjust().responsive.recalc();
}