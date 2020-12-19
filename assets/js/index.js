// const api_server = '192.168.1.51:8000';
// const socket_server = '192.168.1.51:8000';
const api_server = 'localhost:8080';
const socket_server = 'localhost:8080';
const socket = io( `http://${socket_server}` )
const price_rules = [ "RETAIL" , "WHOLESALE" , "FREE" ]
const nullable_keys = [ "Warning" , "Formula" , "Freight" ]

// TODO : session
// TODO : remote access
// TODO : deduct_item minus functionality

// DOM Manip
	const error_message = ( node , message , timeout ) => {
		node.innerHTML = message

		setTimeout( () => {
			node.innerHTML = ""
		} , timeout )
	}

	const render_datalist = ( data_arr , datalist_id ) => {
		let node = ""

		node = `<datalist id="${datalist_id}" name="${datalist_id}">`

		data_arr.forEach( item => {
			node += `<option value="${item}">${item}</option>`
		})

		node += `</datalist>`

		return node
	}

	const render_select = ( data_arr , select_id , special_addition ) => {
		let node = ""

		if ( router.current.id == "newtx" ) {
			node = `<select name="${select_id}" id="${select_id}" data-cnt=0>`
		} else {
			node = `<select name="${select_id}" id="${select_id}">`
		}


		data_arr.forEach( item => {

			node += ( item == store.get( 'get_chosen_category' ) && store.get( 'get_chosen_category' ).length > 0 )
				? `<option value="${item}" selected>${item}</option>`
				: `<option value="${item}">${item}</option>`

		})

		if ( !(special_addition === undefined) ) {
			special_addition.forEach( item => {
				node += ( store.get( 'get_chosen_category' ).length == 0 )
					? `<option value="${item}" selected>${item}</option>`
					: `<option value="${item}">${item}</option>`
			})
		}

		if ( store.get( 'get_chosen_category' ) == "" && 
			 router.current.id == "maintain" && 
			 store.get( 'get_item_categories' ).length > 0 ) {
				node += `<option value="" selected disabled hidden>Choose Category</option>`
		} else if ( router.current.id == "admin" && select_id == "Role" ) {
			node += `<option value="" selected disabled hidden>Account Type</option>`
		} else if ( router.current.id == "newtx" && select_id == "price_rule" ) {
			node += `<option value="" selected disabled hidden>Price Type</option>`
		}

		node += `</select>`

		return node
	}

	const render_loading_node = () => {
		let node = `<div class="lds-spinner">`

		for (var i = 0; i < 12; i++)
				node += `<div></div>`

		node += `</div>`

		return node
	}
// DOM Manip

// Unified Fetch
	const post_json = ( source , json_data , suppress_fetch ) => {

		let url = ""
		let method = ""

		if ( source === "login" ) {
			url = `http://${api_server}/login_challenge`
			method = "POST"
		} else if ( source === "init" ) {
			url = `http://${api_server}/create_admin`
			method = "POST"
		} else if ( source === "tx" ) {
			url = `http://${api_server}/post_tx`
			method = "PUT"
		} else if ( source === "deduct" ) {
			let sanitized_name = json_data.Name.replace( /\//g , "]" )
			url = `http://${api_server}/deduct_item/${sanitized_name}/${json_data.Qty}`
			method = "PUT"
		} else if ( source === "add_item" ) {
			let sanitized_name = json_data.Name.replace( /\//g , "]" )
			let sanitized_formula = json_data.Formula.replace( "+" , "p" )
			url = `http://${api_server}/insert_item/
										${sanitized_name}/${json_data.Unit}/
										${json_data.category}/${json_data.Amount}/
										${json_data.Warning}/${json_data.Retail}/
										${json_data.Wholesale}/${json_data.Bought}/
										${sanitized_formula}/${json_data.Formula}`
			method = "PUT"
		} else if ( source === "remove_item" ) {
			let sanitized_name = json_data.Name.replace( /\//g , "]" )
			url = `http://${api_server}/delete_item/${sanitized_name}/${json_data.category}`
			method = "DELETE"
		} else if ( source === "update_item" ) {
			let sanitized_name = json_data.Name.replace( /\//g , "]" )
			let sanitized_formula = json_data.Formula.replace( "+" , "p" )
			url = `http://${api_server}/update_item/
										${sanitized_name}/${json_data.category}/
										${json_data.Unit}/${json_data.Amount}/
										${json_data.Warning}/${json_data.Retail}/
										${json_data.Wholesale}/${json_data.Bought}/
										${sanitized_formula}/${json_data.Freight}`
			method = "PUT"
		} else if ( source === "add_new_category_items" ) {
			let sanitized_name = json_data.Name.replace( /\//g , "]" )
			let sanitized_formula = json_data.Formula.replace( "+" , "p" )
			url = `http://${api_server}/insert_item/
										${sanitized_name}/${json_data.Unit}/
										${json_data.Category}/${json_data.Amount}/
										${json_data.Warning}/${json_data.Retail}/
										${json_data.Wholesale}/${json_data.Bought}/
										${sanitized_formula}/${json_data.Freight}`
			method = "PUT"
		} else if ( source === "post_accept" ) {
			url = `http://${api_server}/post_accept`
			method = "PUT"
		} else if ( source === "new_employee" ) {
			url = `http://${api_server}/add_employee`
			method = "PUT"
		} else if ( source === "change_employee" ) {
			url = `http://${api_server}/change_employee`
			method = "PUT"
		} else if ( source === "toggle_employee" ) {
			url = `http://${api_server}/toggle_employee`
			method = "PUT"
		} else if ( source === "rollback" ) {
			let sanitized_name = json_data.name.replace( /\//g , "]" )
			url = `http://${api_server}/audit_edit/
										${json_data.type}/${json_data.id}
										/${sanitized_name}/${json_data.qty}`
			method = "PUT"
		}

		if ( suppress_fetch === undefined || suppress_fetch == false ) {
			return fetch( url , {
				method : method , 
				header : {
					'Content-Type' : 'application/json'
				}, 
				body : json_data
			})
		}
	}

	const get_json = async ( item , json_data , suppress_fetch ) => {

		let url = ""

		if ( item === "config" || item === "config_change" ) {
			url = `http://${api_server}/fetch_config`
		} else if ( item === "low" ) {
			url = `http://${api_server}/fetch_low`
		} else if ( item === "customers" ) {
			url = `http://${api_server}/fetch_customers`
		} else if ( item === "inventory" ) {
			url = `http://${api_server}/fetch_items`
		} else if ( item === "validate_item_qty" || item === "validate_item_qty_changed" ) {
			let sanitized_name = json_data.Name.replace( /[\/]/g , "]" )

			if ( store.get( 'get_employee_obj' ).role == "user" ) {
				json_data.Type = "RETAIL"
			}

			url = `http://${api_server}/validate/item_qtychk/${sanitized_name}/${json_data.Qty}/${json_data.Type}`
		} else if ( item === "categories" ) {
			url = `http://${api_server}/fetch_categories`
		} else if ( item === "category_items" || item === "new_category_items" ) {
			url = `http://${api_server}/fetch_items/${json_data}`
		} else if ( item === "validate_unique_item_cat" ) {
			let sanitized_name = json_data.Name.replace( /[\/]/g , "]" )
			url = `http://${api_server}/validate/item_exist/${sanitized_name}/${json_data.Category}`
		} else if ( item === "search_tx" ) {
			url = `http://${api_server}/fetch_txdetail/${json_data.tx_no}`
		} else if ( item === "users" || item == "employee_added" ) {
			url = `http://${api_server}/fetch_employees`
		} else if ( item === "audit" ) {
			let sanitized_name = json_data.item.replace( /[\/]/g , "]" )
			url = `http://${api_server}/audit_search/${json_data.From_date}
			/${json_data.To_date}
			/${json_data.name}
			/${sanitized_name}`
		}

		if ( suppress_fetch === undefined || suppress_fetch == false ) {
			let res = await fetch( url )
			let data = await res.json();

			if ( item === "config" || item === "config_change" ) {
				store.do( 'set_config_obj' , data.status )
			} else if ( item === "low" ) {
				store.do( 'set_low_data' , data.low_items )
			} else if ( item === "customers" ) {
				store.do( 'set_customer_list' , data.customers )
			} else if ( item === "inventory" ) {
				store.do( 'set_item_list' , data.inventory )
			} else if ( item === "validate_item_qty" ) {
				let qty = document.querySelector( "#tx_qty_0" )
				let name = document.querySelector( "#tx_name_0" )
				let error_node = document.querySelector( "#tx_error" )
				let product = ( data.Formula )
									? calculate_capital( `${data.Bought}${data.Formula}` )
									: data.Bought

				if ( data.Freight ) {
					product += data.Freight
				}

				let tx_item = {
					Qty : Number(qty.value) ,
					Name : name.value ,
					UnitPrice : Number(data.UnitPrice) ,
					Amount : Number( qty.value ) * Number(data.UnitPrice) ,
					Unit : data.Unit ,
					baseVal : Number( data.UnitPrice ) ,
					Capital : Number( product ).toFixed(2)
				};

				if ( data.status == "OK" ) {
					store.do( 'add_tx_item' , tx_item )
				} else {
					error_message( error_node , `${data.status}` , 1500 )
					qty.value = 0
					name.value = ""
				}
			} else if ( item === "categories" ) {
				( data.categories.length == 0 )
					? store.do( 'set_chosen_category' , '--New Category--' ) 
					: store.do( 'set_item_categories' , data.categories )
			} else if ( item === "category_items" ) {
				store.do( 'set_category_items' , data.items )
			} else if ( item === "validate_unique_item_cat" ) {
				let error_node = document.querySelector( "#add_error" )
				if ( data.status == "OK" ) {
					store.do( 'add_new_category_items' , json_data )
				} else {
					error_message( error_node , `${data.status}` , 1500 )
				}
			} else if ( item === "new_category_items" ) {
				store.do( 'set_category_items' , data.items )
				store.do( 'add_item_categories' , json_data )
				store.do( 'reset_new_category_items' )
				store.do( 'set_chosen_category' , json_data )
			} else if ( item === "search_tx" ) {
				let error_node = document.querySelector( "#search_error" );

				( typeof( data.status ) == "string" )
					? error_message( error_node , `${data.status}` , 1500 )
					: store.do( 'set_viewed_tx' , data.status );

			} else if ( item === "users" || item === "employee_added" ) {
				if ( typeof(data.status) == "string" ) {
					alert( `${data.status}` )
				} else {
					store.do( 'set_employee_arr' , data.status );
					for (var i = 0; i < store.get( 'get_employee_arr' ).length; i++) {
						if ( store.get( 'get_employee_arr' )[i].role == "admin" && store.get( 'get_employee_arr' )[i].active ) {
							store.do( 'add_admin' )
						}
					}

					if ( item === "employee_added" ) { store.do( 'reset_employee_action' ) }
				}
			} else if ( item === "audit" ) {
				store.do( 'set_audit_trail' , data.status )
			} else if ( item === "validate_item_qty_changed" ) {
				let error_node = document.querySelector( "#tx_error" )
				let qty = document.querySelector( `#tx_qty_${json_data.id}` )

				if ( data.status == "OK" ) {
					qty.dataset.old_qty = qty.value
					store.do( 'edit_tx_item_qty' , `${json_data.id}` , `${qty.value}` )

					let change = {
						Bought : `${data.Bought}` ,
						Formula : `${data.Formula}` ,
						Freight : `${data.Freight}`
					}

					store.do( 'edit_tx_item_capital' , `${json_data.id}` , change )
				} else {
					qty.value = qty.dataset.old_qty
					error_message( error_node , `${data.status}` , 1500 )
				}
			}
		}
	}
// Unified Fetch

const calculate_capital = ( fx_arg ) => {

	let postfix = convert_to_postfix( fx_arg )
	let infix = convert_to_infix( postfix )
	let capital = calculate_percentages( postfix[0] , infix )

	return capital

}

var router = new Reef.Router({
	routes: [
		{ id: 'login', title: 'Login', url: '/' },
		{ id: 'newtx' , title: 'New Transaction' , url: '/newtx' },
		{ id: 'maintain' , title: 'Maintain' , url: '/maintain' },
		{ id: 'search' , title: 'Search Receipts' , url: '/searchtxs' },
		{ id: 'home' , title: 'Home' , url: '/home' },
		{ id: 'admin' , title: 'Admin Panel' , url: '/admin' },
		{ id: 'accept' , title: 'Accept Delivery' , url: '/accept' },
		{ id: 'history' , title: 'Search History' , url: '/txhist' }
	]
});

var store = new Reef.Store({
	data: {
		config_obj : {},
		employee_obj : {},
		state_legitacc : false,
		low_data : [],
		customer_list : [],
		item_list : [],
		tx_customer : "" ,
		tx_obj : [
			{
				Qty : 0 ,
				Name : "" ,
				UnitPrice : 0.0 ,
				Amount : 0
			}
		],
		chosen_category : "",
		item_categories : [],
		category_items : [],
		new_category_items : [],
		accept_arr : [],
		viewed_tx : {},
		emp_arr : [],
		emp_action : "",
		admin_cnt : 0,
		audit_trail : [],
		from_date : "",
		to_date : "",
	},
	setters: {
		set_config_obj : ( props , config_obj ) => { props.config_obj = config_obj },

		toggle_state_legitacc : ( props ) => { props.state_legitacc = !props.state_legitacc },
		set_employee_obj : ( props , employee_obj ) => { props.employee_obj = employee_obj },

		set_low_data : ( props , low_data ) => { props.low_data = low_data },

		set_customer_list : ( props , customer_list ) => { props.customer_list = customer_list },
		set_item_list : ( props , item_list ) => { props.item_list = item_list },

		set_tx_customer : ( props , tx_customer ) => { props.tx_customer = tx_customer },
		reset_tx_customer : ( props ) => { props.tx_customer = "" },

		set_tx_obj : ( props , tx_obj ) => { props.tx_obj = tx_obj },
		reset_tx_obj : ( props ) => {
			props.tx_obj = [ 
				{
					Qty : 0 ,
					Name : "" ,
					UnitPrice : 0.0 ,
					Amount : 0
				}
			]
		},
		remove_tx_item : ( props , tx_index ) => { props.tx_obj.splice( tx_index , 1 ) },
		add_tx_item : ( props , tx_item ) => { props.tx_obj.push( tx_item ) },
		edit_tx_item_unitprice : ( props , tx_index , unitprice ) => { 
			props.tx_obj[tx_index].UnitPrice = Number( unitprice )
			props.tx_obj[tx_index].Amount = Number(props.tx_obj[tx_index].Qty) * Number( unitprice )
		},
		edit_tx_item_qty : ( props , tx_index , qty ) => {
			props.tx_obj[tx_index].Qty = Number( qty )
			props.tx_obj[tx_index].Amount = Number(props.tx_obj[tx_index].UnitPrice) * Number( qty )	
		},
		edit_tx_item_capital : ( props , tx_index , change ) => {
			let product = 0

			if ( !(change.Formula == "undefined" ) ) {
				product = calculate_capital( `${change.Bought}${change.Formula}` ) 
			}

			if ( !(change.Freight == "undefined" ) ) {
				product += Number(change.Freight)
			}

			props.tx_obj[tx_index].Capital = product.toFixed(2)
		},

		set_chosen_category : ( props , choice ) => { props.chosen_category = choice },
		reset_chosen_category : ( props ) => { props.chosen_category = "" },
		set_item_categories : ( props , item_categories ) => { props.item_categories = item_categories },
		add_item_categories : ( props , new_category ) => { props.item_categories.push( new_category ) },
		remove_chosen_category : ( props , index ) => { props.item_categories.splice( index , 1 ) },

		set_category_items : ( props , category_item ) => { props.category_items = category_item },
		add_category_items : ( props , added_item ) => { props.category_items.push( added_item ) },
		remove_category_items : ( props , index ) => { props.category_items.splice( index , 1 ) },
		reset_category_items : ( props ) => { props.category_items = [] },
		edit_category_items : ( props , index , value ) => { props.category_items[index] = value },
		edit_category_item_qty : ( props , index , value ) => { props.category_items[index].Amount = value },

		edit_new_category_items : ( props , index , key , value ) => { props.new_category_items[index][key] = value },
		add_new_category_items : ( props , new_category_item ) => { props.new_category_items.push( new_category_item ) },
		reset_new_category_items : ( props ) => { props.new_category_items = [] },
		remove_new_category_items : ( props , index ) => { props.new_category_items.splice( index , 1 ) },

		add_accept_items : ( props , accept_obj ) => { props.accept_arr.push( accept_obj ) },
		remove_accept_items : ( props , index ) => { props.accept_arr.splice( index , 1 ) },
		edit_accept_items : ( props , index , accept_obj ) => { props.accept_arr[index] = accept_obj },
		reset_accept_items : ( props ) => { props.accept_arr = [] },

		set_viewed_tx : ( props , tx_obj ) => { props.viewed_tx = tx_obj },
		reset_viewed_tx : ( props ) => { props.viewed_tx = {} },

		set_employee_arr : ( props , emp_arr ) => { props.emp_arr = emp_arr },
		set_employee_action : ( props , action ) => { props.emp_action = action },
		reset_employee_action : ( props ) => { props.emp_action = "" },
		add_admin : ( props ) => { props.admin_cnt++ },
		minus_admin : ( props ) => { props.admin_cnt-- },
		toggle_employee_arr_active : ( props , index ) => { props.emp_arr[index].active = !props.emp_arr[index].active },
		edit_employee_arr : ( props , index , key , value ) => { props.emp_arr[index][key] = value },

		set_audit_trail : ( props , audit ) => { props.audit_trail = audit },
		set_from_date : ( props , from ) => { props.from_date = from },
		set_to_date : ( props , to ) => { props.to_date = to },
		rollback_audit_trail : ( props , type , id , cnt ) => { 
			props.audit_trail.forEach( audit => {
				if ( audit._id.type == type ) {
					audit.tx_info.forEach( item => {
						if ( item.tx_id == cnt ) {
							item.tx_items.splice( id , 1 )
							return false
						}
					})
				return false
				}
			})
		},
		add_audit_trail_item : ( props , type , id , owner , items ) => {
			props.audit_trail.forEach( audit => {
				if ( audit._id.type == type ) {
					let fresh_tx = {
						tx_items : items ,
						tx_owner : owner ,
						tx_id : id
					}
					audit.tx_info.push( fresh_tx )
					return false
				}
			})
		},
		reset_audit_trail : ( props ) => { props.audit_trail = [] }
	},
	getters: {
		get_config_obj : ( props ) => { return props.config_obj },

		get_state_legitacc : ( props ) => { return props.state_legitacc },
		get_employee_obj : ( props ) => { return props.employee_obj },

		get_low_data : ( props ) => { return props.low_data },

		get_customer_list : ( props ) => { return props.customer_list },
		get_tx_customer : ( props ) => { return props.tx_customer },
		get_item_list : ( props ) => { return props.item_list },
		get_tx_obj : ( props ) => { return props.tx_obj },
		get_tx_tot : ( props ) => {
			let tot = 0
			for (var i = 0; i < props.tx_obj.length; i++) {
				tot = tot + props.tx_obj[i].Amount	
			}
			return tot
		},

		get_chosen_category : ( props ) => { return props.chosen_category },
		get_item_categories : ( props ) => { return props.item_categories },
		get_category_items : ( props ) => { return props.category_items },
		get_new_category_items : ( props ) => { return props.new_category_items },

		get_accept_items : ( props ) => { return props.accept_arr },

		get_viewed_tx : ( props ) => { return props.viewed_tx },

		get_employee_arr : ( props ) => { return props.emp_arr },
		get_employee_action : ( props ) => { return props.emp_action },
		get_admin_cnt : ( props ) => { return props.admin_cnt },

		get_audit_trail : ( props ) => { return props.audit_trail },
		get_from_date : ( props ) => { return props.from_date },
		get_to_date : ( props ) => { return props.to_date },
	}
});

let app = new Reef( '#app', {
	router: router,
	store: store,
	template: ( props , route ) => {

		let node = ""

		if ( !(store.get( 'get_state_legitacc' )) ) {
			node = `
			<header>
		 		<a href="#"></a>
 			</header>

			<div id="login"></div>

			<ul id="actions" style="display:none;"></ul>
			<div id="controls" style="display:none;"></div>
			<div id="form" style="display:none;"></div>
			`
		} else {
			node = `
			<header>
		 		<a href="/home">HOME</a>
 			</header>

 			<div id="login" style="display:none;"></div>

 			<div id="page">
	 			<ul id="actions"></ul>
	 			<div id="controls"></div>
	 			<div id="form"></div>
 			</div>`
		}

		return node;
	}
});

let login = new Reef( '#login' , {
	template: ( props ) => {

		let node = ""

		if ( store.get( 'get_config_obj' ).ADMIN_INITIALIZED && !( store.get( 'get_config_obj' ) === {} ) ) {
			node = `
				<form id="login_form" method="post">
					<div>
						<label for="login">Username</label>
						<input type="text" id="username" name="Username"/>
					</div>
					<div>
						<label for="password">Password</label>
						<input type="password" id="password" name="Password"/>
					</div>
					<div class="form_error" id="login_error"></div>
					<input type="submit" value="LOGIN"/>
				</form>
				`
		} else if ( !(store.get( 'get_config_obj' ).ADMIN_INITIALIZED) && !( store.get( 'get_config_obj' ) === {} ) ) {
			node = `
				<form id="init_form">
					<div id="init_header" method="post">Create Admin Account</div>
					<div>
						<label for="fname">First Name</label>
						<input type="text" name="fname"/>
					</div>
					<div>
						<label for="username">Username</label>
						<input type="text" name="Username" value="admin"/>
					</div>
					<div>
						<label for="password">Password</label>
						<input type="password" name="Password"/>
					</div>
					<div class="form_error" id="setup_error"></div>
					<input type="submit" value="CREATE"/>
				</form>
			`
		} else if ( ( store.get( 'get_config_obj' ) === {} ) ) {
			node = render_loading_node()
		}

		return node
	}
});

let actions = new Reef( '#actions' , {
	store : store ,
	template: ( props ) => {

		let node = ""

		node = ( store.get( 'get_employee_obj' ).role == "admin" )
			? 	`
					<a href="/newtx"><li id="newtx">New Transaction</li></a>
					<a href="/maintain"><li id="maintain">Maintain Inventory</li></a>
					<a href="/accept"><li>Accept Delivery</li></a>
					<a href="/searchtxs"><li id="search">Search Recipt No</li></a>
					<a href="/txhist"><li>Search Records</li></a>
					<a href="/admin"><li>Manage Employees</li></a>
				`
			: 	`
					<a href="/newtx"><li id="newtx">New Transaction</li></a>
					<a href="/maintain"><li id="maintain">Maintain Inventory</li></a>
					<a href="/searchtxs"><li id="search">Search Recipt No</li></a>
				`

		return node

	}
});

let controls = new Reef( '#controls' , {
	store : store , 
	router : router ,
	template: ( props , route ) => {

		let node = ""

		if ( router.current.id == "home" ) {
			node = `<div id="low_warning">Low on the ff</div>`
		} else if ( router.current.id == "newtx" ) {
			if ( store.get( 'get_item_list' ).length > 0 ) {
				node += render_datalist( store.get( 'get_customer_list' ) , 'customer' )

				node += `
				<div id="customer_name">
					<label htmlFor="Customer">Cusomter :</label>
					<input list="customer" id="tx_customer_name" value="${store.get( 'get_tx_customer' )}">
				</div>`
			} else {
				node = render_loading_node()
			}
		} else if ( router.current.id == "maintain" ) {
			if ( store.get( 'get_item_categories' ).length >= 0 ) {

				node += `<div id="category_control">`

					node += ( store.get( 'get_employee_obj' ).role == "admin" )
						? render_select( store.get( 'get_item_categories' ) , 'categories' , [ '--New Category--' ] )
						: render_select( store.get( 'get_item_categories' ) , 'categories' )

					if ( store.get( 'get_chosen_category' ) == "--New Category--" ) {
						node += `
						<div id="new_category_control">
							<div>New Category :</div>
							<input type="text" id="new_category_name">
						</div>`
					}

				node += `</div>`

			} else {
				node = render_loading_node()	
			}
		} else if ( router.current.id == "accept" ) {
			if ( store.get( 'get_item_list' ).length > 0 ) {
				
				node += `<table id="accept_table">`

					node += `<thead>
								<tr>
									<th>Actions</th>
									<th>Item</th>
									<th>Qty</th>
									<th>Buying Price</th>
								</tr>
							</thead>
							<tbody>`

								node += render_datalist( store.get( 'get_item_list' ) , "add_items" )

								if ( store.get( 'get_accept_items' ).length > 0 ) {
									for (var i = 0; i < store.get( 'get_accept_items' ).length; i++) {
										let item = store.get( 'get_accept_items' )[i]
										node += `<tr>
													<td>
														<button id="edit_item" data-state="edit" data-cnt=${i}>&#9998;</button>
														<button id="remove_item" data-cnt=${i}>X</button>
													</td>
													<td>${item.Name}</td>
													<td data-old=${item.Qty}>${item.Qty}</td>
													<td data-old=${item.Bought}>${item.Bought}</td>
												</tr>`
									}
								}

								node += `<tr>
											<td>
												<button id="add_item">&#10133;</button>
											</td>
											<td><input list="add_items" id="accept_items" placeholder="Item Here"></td>
											<td><input type="number" min="1" step="1" placeholder="0" id="accept_qty"></td>
											<td><input type="number" min="1" step="any" placeholder="0" id="accept_capital"></td>
										</tr>`

				node += `	</tbody>
						</table>`

			} else {
				node = render_loading_node()
			}
		} else if ( router.current.id == "search" ) {
			node = `<form id="search_tx">`
				node += `<div>
							<input type="number" min="1" step="1" placeholder="Recipt No:" name="tx_no">
						</div>`
			node += `</form>`
		} else if ( router.current.id == "admin" ) {
			node += `<div id="admin_control">
						<button id="default_employees">View/Edit Employee</button>
						<button id="new_employee">New Employees</button>
					</div>`
		} else if ( router.current.id == "history" ) {
			let date = new Date()

			node += render_datalist( store.get( 'get_item_list' ) , 'items' )

			node += `<form id="audit_search">
						<div>
							<label for="From_date" style="margin-bottom: 15px;">From :</label>
							<input type="date" name="From_date" 
								min="${date.getFullYear()}-01-01" 
								max="${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()-1}">
						</div>
						<div>
							<label for="To_date" style="margin-bottom: 15px;">To :</label>
							<input type="date" name="To_date" 
								min="${date.getFullYear()}-01-01" 
								max="${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}">
						</div>
						<div>
							<label for="name">Owner :</label>
							<input type="text" name="name">
						</div>
						<div>
							<label for="name">Item :</label>
							<input list="items" name="item">
						</div>
						<button value="submit">SEARCH</button>
					</form>`
		}

		return node
	}
})

let results = new Reef( '#form' , {
	store : store , 
	router : router ,
	template: ( props , route ) => {

		let node = ""

		if ( router.current.id == "home" ) {
			store.get( 'get_low_data' ).forEach( item => {
				if ( item.bool_warning ) {
					node += `
						<div class="low_items">
							<div>
								<div>Name :</div>
								<div>${item.Name}</div>
							</div>
							<div>
								<div>Category :</div>
								<div>${item.Category}</div>
							</div>
							<div>
								<div>Amount :</div>
								<div>${item.Amount}</div>
							</div>
						</div>`
				}
			})
		} else if ( router.current.id == "newtx" ) {
			if ( store.get( 'get_item_list' ).length > 0 ) {
				node += render_datalist( store.get( 'get_item_list' ) , 'items' )

				node += `
					<table id="tx_table">
						<thead>
							<tr>
								<th>Actions</th>
								<th>Qty</th>
								<th>Unit</th>
								<th>Name</th>`

								if ( store.get( 'get_employee_obj' ).role == "admin" ) {
									node += `<th>+/- (%)</th>`			
								}

				node += 		`<th>Unit Price</th>
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
				`

				for (var i = 0; i < store.get( 'get_tx_obj' ).length; i++) {

					let tx_item = store.get( 'get_tx_obj' )[i]

					if ( i == 0 ) {
						continue
					} else {
						node += `<tr>`
							node += `<td class="action_td">
										<button id="remove_item" data-cnt=${i}>X</submit>
									</td>

									<td class="qty_td">
										<input 
											type="number" data-cnt=${i} 
											class="edit_tx_qty" id="tx_qty_${i}" 
											min="1" step="1" value=${tx_item.Qty} 
											data-old_qty=${tx_item.Qty}>
									</td>

									<td class="unit_td">
										${tx_item.Unit}
									</td>

									<td class="name_td" id="tx_item_${i}">
										${tx_item.Name}
									</td>`

								if ( store.get( 'get_employee_obj' ).role == "admin" ) {
							node += `<td class="change_td">`

									node += ( tx_item.baseVal == 0 )
										? `0`
										: `<input 
											type="number" data-cnt=${i} 
											class="tx_change" id="tx_change_${i}"
											data-baseval=${tx_item.baseVal}
											step="any" value=""
											data-old_change=0
											placeholder="0">`
										
							node += `</td>`
							node += `<td class="unitprice_td" id="tx_unitprice_${i}">`

									node += ( tx_item.baseVal == 0 )
										? `<input 
											type="number" data-cnt=${i} 
											class="tx_unitprice" id="tx_unitprice_${i}"
											step="any" value="${tx_item.UnitPrice}"
											data-old_value=0
											placeholder="0">`
										: `${tx_item.baseVal}`

							node += `</td>`
								} else {
									node += `
									<td class="unitprice_td">
										${tx_item.UnitPrice}
									</td>`
								}

							node += ``

									node += `
									<td class="total_td">${(tx_item.Amount).toFixed(2)}</td>
								</tr>`
					}
				}

					node += `
							<tr id="add_tx_row">
								<td class="action_td">&nbsp;</td>
								<td class="qty_td">
									<input 
										type="number" data-cnt=0 
										class="tx_qty"  id="tx_qty_0"
										min="0" step="1" 
										placeholder="0" data-old_qty=0>
								</td>
								<td class="unit_td">&nbsp;</td>
								<td class="name_td">
									<input list="items" data-cnt=0 
									class="tx_name" id="tx_name_0"
									value="" data-old_name="">
								</td>`

								if ( store.get( 'get_employee_obj' ).role == "admin" ) {
									node += `<td class="discount_td">0</td>`
								}

								//Price Rules
								node += ( store.get( 'get_employee_obj' ).role == "admin" )
									? `<td class="unitprice_td">
											${render_select( price_rules , 'price_rule' )}
									   </td>`
									: `<td class="unitprice_td">0</td>`
								//Price Rules

					node += `	<td class="total_td">0</td>
							</tr>`

					node += `
						</tbody>
					</table>
					`

					node += `
					<div id="tx_total">
						<div>Total :&nbsp;</div>
						<div>${Number(store.get( 'get_tx_tot' )).toFixed(2)}</div>
					</div>
					<div class="form_error" id="tx_error"></div>

					<div id="tx_control">
						<button id="finish">Check Out</button>
						<button id="cancel">Cancel</button>
					</div>`
				}
		} else if ( router.current.id == "maintain" ) {
			if ( store.get( 'get_category_items' ).length > 0 && store.get( 'get_chosen_category' ) != "" ) {

				node += ( store.get( 'get_employee_obj' ).role == "admin" )
					? `<table id="admin_item_table">`
					: `<table id="item_table">`

				node +=	`<thead>
							<tr>`
							if ( store.get( 'get_employee_obj' ).role == "admin" ) {
								node += `
									<th>Actions</th>
									<th>Name</th>
									<th>Unit</th>
									<th>Remain</th>
									<th>Warning</th>
									<th>Unit Price</th>
									<th>Plus/Minus</th>
									<th>Freight</th>
									<th>Capital</th>
									<th>Retail</th>
									<th>Wholesale</th>
									`
							} else {
								node += `
									<th>Name</th>
									<th>Unit</th>
									<th>Remain</th>
									<th>Price</th>`
							}
				node += 	`</tr>
						</thead>
						<tbody>`

						for (var i = 0; i < store.get( 'get_category_items' ).length; i++) {

							let item = store.get( 'get_category_items' )[i]

							node += `<tr>`
								if ( store.get( 'get_employee_obj' ).role == "admin" ) {
									node += `
										<td>
											<button id="edit_item" class="edit_item_${i}" data-cnt=${i} data-state="edit">&#9998;</button>
											<button id="remove_item" data-cnt=${i} >&#128465;</button>
											<button id="change_fx" data-cnt=${i} data-state="edit">Edit Capital</button>
										</td>
										<td data-original=${item.Name}>${item.Name}</td>
										<td data-original=${item.Unit}>${item.Unit}</td>
										<td data-original=${item.Amount}>${item.Amount}</td>`

									node += ( item.Warning === undefined || item.Warning == "NULL_F13LD" || 
												item.Warning == "UNSET_F13LD" || item.Warning == null || 
												item.Warning == "BLANK" )
										? `<td data-original="BLANK"></td>`
										: `<td data-original=${item.Warning}>${item.Warning}</td>`

									let capital = item.Bought

									node += `<td data-original=${(item.Bought).toFixed(2)} id="baseval_${i}">${(item.Bought).toFixed(2)}</td>`

									if ( item.Formula === undefined || item.Formula == "NULL_F13LD" || 
										 item.Formula == "UNSET_F13LD" || item.Formula == null || 
										 item.Formula == "BLANK" ) {
										capital = Number(item.Bought)

										node += `<td data-original="BLANK"></td>`
									} else {
										capital = calculate_capital( `${item.Bought}${item.Formula}` )
										
										node += `<td data-original=${item.Formula}>${item.Formula}</td>`
									}

									if ( item.Freight === undefined || item.Freight == "NULL_F13LD" || 
										 item.Freight == "UNSET_F13LD" || item.Freight == null || 
										 item.Freight == "BLANK" ) {
										node += `<td data-original="BLANK"></td>`
									} else {
										capital += Number(item.Freight)

										node += `<td data-original=${(item.Freight).toFixed(2)}>${(item.Freight).toFixed(2)}</td>`
									}


									node += `<td data-original=${capital.toFixed(2)} id="capital_${i}">${capital.toFixed(2)}</td>`

								node += `<td data-original=${(item.Retail).toFixed(2)}>${(item.Retail).toFixed(2)}</td>
										<td data-original=${(item.Wholesale).toFixed(2)}>${(item.Wholesale).toFixed(2)}</td>
										`
								} else {
									node += `
										<td>${item.Name}</td>
										<td>${item.Unit}</td>
										<td>${item.Amount}</td>
										<td>${(item.Retail).toFixed(2)}</td>`
								}
							node += `</tr>`

						}

						if ( store.get( 'get_employee_obj' ).role == "admin" ) {
							node += `<tr>
										<td>
											<button id="add_item">&#10133;</button>
										</td>
										<td><input type="text" placeholder="New Item" id="add_item_name"></td>
										<td><input type="text" placeholder="Unit" id="add_unit_name"></td>
										<td><input type="number" min="0" step="1" id="add_item_qty" placeholder="0"></td>
										<td><input type="number" min="0" step="1" id="add_item_warning" placeholder="0"></td>
										<td><input type="number" min="0" step="any" id="add_item_bought" placeholder="0"></td>
										<td><input type="text" id="add_item_formula" placeholder="Plus/Minus"></td>
										<td><input type="number" min="0" step="any" id="add_item_freight" placeholder="0"></td>
										<td id="add_item_capital">0</td>
										<td><input type="number" min="0" step="any" id="add_item_retail" placeholder="0"></td>
										<td><input type="number" min="0" step="any" id="add_item_wholesale" placeholder="0"></td>
									</tr>`
						}

				node += `
						</tbody>
					</table>
					<div class="form_error" id="add_error"></div>`
			} else if ( store.get( 'get_chosen_category' ) == "--New Category--" ) {

				node += `<table id="add_category_table">`

					node += `<thead>
								<th>Actions</th>
								<th>Name</th>
								<th>Unit</th>
								<th>Remain</th>
								<th>Warning</th>
								<th>Unit Price</th>
								<th>Plus/Minus</th>
								<th>Freight</th>
								<th>Capital</th>
								<th>Retail</th>
								<th>Wholesale</th>
							</thead>`

					node += `<tbody>`

						if ( store.get( 'get_new_category_items' ).length > 0 ) {
							for (var i = 0; i < store.get( 'get_new_category_items' ).length; i++) {

								let item = store.get( 'get_new_category_items' )[i]
								let product = 0

								node += `<tr>`
									node += `
										<td>
											<button id="remove_new_category_item" data-cnt=${i} >&#128465;</button>
										</td>
										<td>${item.Name}</td>
										<td>
											<input type="text"
											value=${item.Unit} data-cnt=${i}
											class="new_category_unit">
										</td>
										<td>
											<input type="number" 
											 min="1" step="1" 
											 value="${item.Amount}" data-cnt=${i} 
											 class="new_category_remain">
										</td>`

									node += ( item.Warning == "NULL_F13LD" )
										? `<td>
												<input type="number" min="1" step="1" 
												value="" data-cnt=${i} 
												class="new_category_warning"
												id="new_warning_${i}">
											</td>`
										: `<td>
												<input type="number" min="1" step="1" 
												value="${item.Warning}" data-cnt=${i} 
												class="new_category_warning"
												id="new_warning_${i}">
											</td>`

									node += `<td>
												<input type="number"
												min="1" step="any"
												value="${item.Bought}" data-cnt=${i}
												class="new_category_bought"
												id="new_bought_${i}">
											</td>`

									node += ( item.Formula == "NULL_F13LD" )
										? `<td>
												<input type="text"
												value="" data-cnt=${i}
												class="new_category_formula"
												id="new_formula_${i}">
											</td>`
										: `<td>
												<input type="text"
												value="${item.Formula}" data-cnt=${i}
												class="new_category_formula"
												id="new_formula_${i}">
											</td>`

									node += ( item.Freight == "NULL_F13LD" )
										? `<td>
												<input type="number"
												value="" data-cnt=${i}
												step="any"
												class="new_category_freight"
												id="new_freight_${i}">
											</td>`
										: `<td>
												<input type="number"
												value="${item.Freight}" data-cnt=${i}
												step="any"
												class="new_category_freight"
												id="new_freight_${i}">
											</td>`

										product = Number(item.Bought)

										if ( item.Formula != "NULL_F13LD" ) {
											product = calculate_capital( `${item.Bought}${item.Formula}` )
										}

										if ( item.Freight != "NULL_F13LD" ) {
											product += Number(item.Freight)
										}

								node += `<td id="new_capital_${i}">
											${product.toFixed(2)}	
										</td>`
										
								node += `<td>
											<input type="number" 
											min="1" step="any" 
											value="${item.Retail}" data-cnt=${i} 
											className="new_category_price">
										</td>
										<td>
											<input type="number" 
											min="1" step="any" 
											value="${item.Wholesale}" data-cnt=${i} 
											className="new_category_price">
										</td>`
								node += `</tr>`
							}
						}

						node += `<tr>`
							node += `<td><button id="add_new_category_item">&#10133;</button></td>
									 <td><input type="text" placeholder="Item" id="add_new_category_name"></td>
									 <td><input type="text" placeholder="Unit" id="add_new_category_unit"></td>
									 <td><input type="number" min="1" step="1" placeholder="0" id="add_new_category_remain"></td>
									 <td><input type="number" min="1" step="1" placeholder="0" id="add_new_category_warning"></td>
									 <td><input type="number" min="1" step="any" placeholder="0" id="add_new_category_bought"></td>
									 <td><input type="text" placeholder="Plus/Minus" id="add_new_category_formula"></td>
									 <td><input type="number" min="1" step="any" placeholder="0" id="add_new_category_freight"></td>
									 <td id="add_new_category_capital">0</td>
									 <td><input type="number" min="1" step="any" placeholder="0" id="add_new_category_retail"></td>
									 <td><input type="number" min="1" step="any" placeholder="0" id="add_new_category_wholesale"></td>
									 `
						node += `</tr>`

					node += `</tbody>`
				node += `</table>`

				node += `
						<div class="form_error" id="add_error"></div>
						<div id="new_category_control_buttons">
							<button id="finish_add_new_category">Finish</button>
							<button id="cancel_add_new_category">Cancel</button>
						</div>`
			}
		} else if ( router.current.id == "accept" ) {
			node += `<div id="accept_error" class="form_error"></div>
					<div id="accept_controls">
						<button id="finish">Accept</button>
						<button id="cancel">Cancel</button>
					</div>`
		} else if ( router.current.id == "search" ) {
			if ( store.get( 'get_viewed_tx' ).length > 0 ) {

				let tx_obj = store.get( 'get_viewed_tx' )[0]

				node += `
						<div id="tx_detail">
							<div style="padding-bottom:5px;">
								<span>Customer :</span>
								<span>${tx_obj.Customer}</span>
							</div>


							<div style="padding-bottom:5px;">
								<span>Seller :</span>
								<span>${tx_obj.tx_owner}</span>
							</div>

							<div style="padding-bottom:5px;">
								<span>Date :</span>
								<span>${tx_obj.tx_date}</span>
							</div>

							<div style="padding-bottom:5px;">
								<span>ID :</span>
								<span>${tx_obj.tx_id}</span>
							</div>
						</div>

						<table id="receipt_table">`

					node += `<thead>
								<tr>
									<th>Qty</th>
									<th>Name</th>
									<th>Unit Price</th>
									<th>Change( % )</th>
									<th>Total</th>
								</tr>
							</thead>

							<tbody>`

						tx_obj.tx_items.forEach( item => {

							node += `<tr>
										<td>${item.Qty}</td>
										<td>${item.Name}</td>`

						node += ( item.baseVal == 0 )
									? `<td>${item.UnitPrice}</td>`
									: `<td>${item.baseVal}</td>`

						node += ( item.Discount == "" )
									? `<td>0</td>`
									: `<td>${item.Discount}</td>`
										
							node += 	`<td>${item.Amount}</td>
									</tr>`
						})

				node += `
							</tbody>
						</table>`
			}
			node += `<div class="form_error" id="search_error"></div>`
		} else if ( router.current.id == "admin" ) {
			if ( store.get( 'get_employee_action' ) == "" && store.get( 'get_employee_arr' ).length > 0 ) {
				node += `<div id="emp_list">`
				for (var i = 0; i < store.get( 'get_employee_arr' ).length; i++) {
					let item = store.get( 'get_employee_arr' )[i]

					node += `<div class="emp_entry">
								<div id="emp_details">
									<div>
										<div>Name :</div>
										<div>${item.name}</div>
									</div>
									<div>
										<div>Username :</div>
										<div>${item.username}</div>
									</div>
									<div>
										<div>Password :</div>
										<div id="emp_pass_${i}" data-old="---">---</div>
									</div>
									<div>
										<div>Role :</div>
										<div id="emp_role_${i}" data-old=${item.role}>${item.role}</div>
									</div>
								</div>
								<div id="emp_controls">
									<button id="edit_item" data-cnt=${i} data-state="edit">Edit Employee</button>`

								node += ( item.active )
									? `<button id="activate_item" data-cnt=${i}>Deactivate</button>`
									: `<button id="activate_item" data-cnt=${i}>Reactivate</button>`

								node += `<div style="color: red;" id="edit_error_${i}"></div>`	
									
					node += 	`</div>
							</div>`
				}
				node += `</div>`
			} else if ( store.get( 'get_employee_action' ) == "delete" && store.get( 'get_employee_arr' ).length > 0 ) {
				node += `<form id="new_employee" style="padding-bottom: 15px;">
							<div>
								<label for="name">Name :</label>
								<input type="text" name="Name">
							</div>
							<div>
								<label for="username">Username :</label>
								<input type="text" name="Username">
							</div>
							<div>
								<label for="password">Password :</label>
								<input type="text" name="Password">
							</div>
							<div>
								<label for="Role">Role :</label>`
								node += render_select( [ 'user' , 'admin' ] , [ 'Role' ] )
				node += 	`</div>

							<div class="form_error" id="account_error"></div>
							<button value="submit">SUBMIT</button>
						</form>`
			} else { node += render_loading_node() }
		} else if ( router.current.id == "history" ) {
			if ( store.get( 'get_audit_trail' ).length > 0 ) {

				node += `<div id="timespan_info" style="margin-bottom:10px;">
							Transactions between ${store.get( 'get_from_date' )} and ${store.get( 'get_to_date' )}
						</div>`

			node += `<div id="history_table">`
				store.get( 'get_audit_trail' ).forEach( audit => {
					node += `<div>`
						node += `<div id="tx_type" style="margin-bottom: 10px;">${audit._id.type}</div>`
						if ( audit._id.type == "ADD" ) {
							node += `<table id="ingress_table">`
								node += `<thead>
											<tr>
												<th>Actions</th>
												<th>Qty</th>
												<th>Name</th>
												<th>Owner</th>
												<th class="big_screen">Date</th>									
											</tr>
										</thead>`

								node += `<tbody>`

								audit.tx_info.forEach( record => {
									for (var i = 0; i < record.tx_items.length; i++) {

										let item = record.tx_items[i]

										node += `<tr>`
											node += `<td>
														<button id="remove_item"
															data-cnt=${record.tx_id} 
															data-id=${i}
															data-type=${audit._id.type}
															data-name=${item.Name}
															data-qty=${item.Qty}
														>&#11148;</button>
													</td>
													<td>${item.Qty}</td>
													<td>${item.Name}</td>
													<td>${record.tx_owner}</td>
													<td class="big_screen">${record.tx_date.split( 'T' )[0]}</td>`
										node += `</tr>`
									}								
								})

							node += `	</tbody>
									</table>`
						} else if ( audit._id.type == "MINUS" ) {
							node += `<table id="egress_table">`
								node += `<thead>
											<tr>
												<th>Actions</th>
												<th>Tx No.</th>
												<th>Qty</th>
												<th>Name</th>
												<th>Seller</th>
												<th class="big_screen">Date</th>
												<th>Capital</th>
											</tr>
										</thead>`

								node += `<tbody>`

								audit.tx_info.forEach( record => {
									for (var i = 0; i < record.tx_items.length; i++) {

										let item = record.tx_items[i]

										node += `<tr>`
											node += `<td>
														<button id="remove_item" 
															data-cnt=${record.tx_id}
															data-id=${i}
															data-type=${audit._id.type}
															data-name=${item.Name}
															data-qty=${item.Qty}
														>&#11148;</button>
													</td>
													<td>${record.tx_id}</td>
													<td>${item.Qty}</td>
													<td>${item.Name}</td>
													<td>${record.tx_owner}</td>
													<td class="big_screen">${record.tx_date.split( 'T' )[0]}</td>
													<td>${item.Capital}</td>`
										node += `</tr>`
									}								
								})

							node += `	</tbody>
									</table>`
						}
					node += `</div>`
				})
			node += `</div>`
			}

			node += `<div class="form_error" id="audit_error"></div>`
		}

		return node

	}
})

Reef.debug( true );

app.render();

// globals
let maintain_update_inp = false
let accept_update_inp = false
let employee_update_inp = false
// globals

// env't loading
if ( Object.entries( store.get( 'get_config_obj' ) ).length == 0 ) {
	let login = document.querySelector( "#login" )

	login.innerHTML = `Environment Loading please wait`

	get_json( "config" )
}
// env't loading

window.addEventListener( 'beforeRouteUpdated' , async (event) => {
	let next = event.detail.next;

	if ( next.id == "home" ) {
		get_json( "low" )
	} else if ( next.id == "newtx" ) {
		get_json( "customers" )
		get_json( "inventory" )
	} else if ( next.id == "maintain" ) {
		get_json( "categories" )
	} else if ( next.id == "accept" ) {
		get_json( "inventory" )
	} else if ( next.id == "admin" ) {
		get_json( "users" )
	} else if ( next.id == "history" ) {
		if ( store.get( 'get_audit_trail' ).length != 0 ) { store.do( 'reset_audit_trail' ) }
		get_json( "inventory" )
	}

});

window.addEventListener( 'routeUpdated' , (event) => {

	let current = event.detail.current;

	if ( current.id != "login" ) {
		app.attach( actions )
		app.attach( controls )
		app.attach( results )
	}
});

document.addEventListener( 'render' , async ( event ) => {

	let app_node = document.querySelector( "#app" )
	app_node.style[ "rowGap" ] = "";

	if ( !(store.get( 'get_state_legitacc' ) ) ) {

		app_node.style[ "rowGap" ] = "33vh";

		app.attach( login )

	}
});

document.addEventListener( 'submit' , ( event ) => {
	event.preventDefault()

	let trigger_fetch = true
	const validation_obj = Object.fromEntries(new FormData(event.target))
	const body = JSON.stringify( validation_obj );

	switch( event.target.id ) {
		case 'login_form' :
			var error_node = document.querySelector( "#login_error" )

			for( let key in validation_obj ) {
				if ( validation_obj[key] == "" ) {
					trigger_fetch = !trigger_fetch
					error_message( error_node , `${key} cannot be empty` , 1500 )
					break
				}
			}

			if ( trigger_fetch ) {
				post_json( 'login' , body )
					.then( res  => res.json() )
					.then( data => {
						if ( data.status == "WRONG" ) {
							error_message( error_node , `Username or Password is Incorrect` , 1500 )	
						} else {
							store.do( 'set_employee_obj' , data.status )
							store.do( 'toggle_state_legitacc' )
							router.navigate( '/home' )
						}
					})
			}
		break;
		case 'init_form' :
			var error_node = document.querySelector( "#setup_error" )

			for( let key in validation_obj ) {
				if ( validation_obj[key] == "" ) {
					trigger_fetch = !trigger_fetch;
					( key == "fname" )
						? error_message( error_node , `First Name cannot be empty` , 1500 )
						: error_message( error_node , `${key} cannot be empty` , 1500 )
					break
				}
			}

			if ( trigger_fetch ) {
				post_json( 'init' , body )
					.then( res => res.json() )
					.then( data => {
						( data.status != "OK" )
							? error_message( error_node , `${data.status}` , 1500 )
							: get_json( 'config_change' )				
					})
			}
		break;
		case 'search_tx' :
			var error_node = document.querySelector( "#search_error" )

			for( let key in validation_obj ) {
				if ( validation_obj[key] == "" ) {
					trigger_fetch = !trigger_fetch;
					error_message( error_node , `Receipt Number is Blank` , 1500 )
					break
				}
			}

			if ( trigger_fetch ) {
				if ( store.get( 'get_viewed_tx' ).length > 0 ) {
					store.do( 'reset_viewed_tx' )
				}
				get_json( 'search_tx' , validation_obj )
			}
		break;
		case 'new_employee' :
			var error_node = document.querySelector( "#account_error" )
			let keys = Object.keys( validation_obj ) 

			if ( keys.length == 3 ) {
				error_message( error_node , `Account Type is Empty` , 1500 )
				trigger_fetch = false
			}

			if ( trigger_fetch ) {
				for( let key in validation_obj ) {
					if ( validation_obj[key] == "" ) {
						trigger_fetch = false;
						error_message( error_node , `${key} is Blank` , 1500 );
						break
					}
				}
			}

			if ( trigger_fetch ) {
				post_json( 'new_employee' , body )
					.then( res => res.json() )
					.then( data => {
						if ( data.status != "OK" ) {
							error_message( error_node , `${data.status}` , 1500 )
						} else {
							get_json( 'employee_added' )
						}
					})
			}
		break;
		case 'audit_search' :
			var error_node = document.querySelector( "#audit_error" )

			for ( let key in validation_obj ) {
				if ( ( key == "name" || key == "item" ) && validation_obj[key] == "" ) {
					validation_obj[key] = "NULL_F13LD"
				} else if ( ( key == "To_date" || key == "From_date" ) && validation_obj[key] == "" ) {
					error_message( error_node , `${key.replace( '_' , ' ' )} is empty` , 1500 )
					trigger_fetch = false
					break
				}
			}

			if ( trigger_fetch ) {
				store.do( 'set_from_date' , validation_obj.From_date )
				store.do( 'set_to_date' , validation_obj.To_date )
				get_json( 'audit' , validation_obj )
			}
		break;
	}
});

document.addEventListener( 'change' , ( event ) => {
	let changed = event.target
	let error_node = null
	let qty , name , unitprice = null
	let cnt , change = 0

	if ( router.current.id == "newtx" ) {
		cnt = changed.dataset.cnt
		discount = document.querySelector( `#tx_change_${cnt}` )
		qty = document.querySelector( `#tx_qty_${cnt}` )
		name = document.querySelector( `#tx_name_${cnt}` )
		unitprice = document.querySelector( `#tx_unitprice_${cnt}` )
		error_node = document.querySelector( "#tx_error" )
		price_rule = document.querySelector( "#price_rule" )
	} else if ( router.current.id == "accept" ) {
		accept_name_box = document.querySelector( "#accept_items" )
		accept_qty_box = document.querySelector( "#accept_qty" )
		error_node = document.querySelector( "#accept_error" )
	} else if ( router.current.id == "maintain" ) {
		error_node = document.querySelector( "#add_error" )
		bought_box = document.querySelector( "#add_item_bought" )
		capital_box = document.querySelector( "#add_item_capital" )
		new_bought_box = document.querySelector( "#add_new_category_bought" )
		new_capital_box = document.querySelector( "#add_new_category_capital" )
	}

	if ( changed.className == 'tx_qty' ) {
		if ( qty.value == 0 ) {
			alert( `Quantity cannot be equal to 0` )
			// error_message( error_node , `Quantity cannot be equal to 0` , 1500 )
			qty.value = changed.dataset.old_qty
		} else {
			changed.dataset.old_qty = qty.value
			let item = ( store.get( 'get_employee_obj' ).role == "admin" )
				? {
				Name : name.value ,
				Qty : qty.value ,
				Type : price_rule.value
				}
				: {
				Name : name.value ,
				Qty : qty.value ,
				Type : "RETAIL"
				}

			if ( name.value != "" && ( price_rule == null || price_rule.value != "" ) ) {
				get_json( `validate_item_qty` , item )
			}
		}
	} else if ( changed.className == 'tx_name' ) {
		if ( name.value == "" ) {
			alert( `Item Name cannot be empty` )
			// error_message( error_node , `Item Name cannot be empty` , 1500 )
			name.value = changed.dataset.old_name
		} else if ( !(store.get( 'get_item_list' ).includes( changed.value )) ) {
			alert( `Chosen Item does not exist` )
			// error_message( error_node , `Chosen Item does not exist` , 1500 )
			name.value = ""
		} else {
			let trigger_fetch = true

			for (var i = 0; i < store.get( 'get_tx_obj' ).length; i++) {

				if ( store.get( 'get_tx_obj' )[i].Name == name.value ) {
					alert( `Item already exists` )
					// error_message( error_node , `Item already exists` , 1500 )
					changed.dataset.old_name = ""
					name.value = ""
					qty.value = 0
					trigger_fetch = !trigger_fetch
					break;
				}

			}

			if ( trigger_fetch ) {
				changed.dataset.old_name = name.value
				if ( qty.value > 0 && ( price_rule == null || price_rule.value != "" ) ) {

				let changed = ( store.get( 'get_employee_obj' ).role == "admin" )
				? {
				Name : name.value ,
				Qty : qty.value ,
				Type : price_rule.value
				}
				: {
				Name : name.value ,
				Qty : qty.value ,
				Type : "RETAIL"
				}	

					get_json( `validate_item_qty` , changed )
				}
			}

		}
	} else if ( changed.className == 'tx_unitprice' ) {
		store.do( 'edit_tx_item_unitprice' , `${cnt}` , `${changed.value}` )
	} else if ( changed.className == 'tx_change' ) { 
		if ( discount.value == 0 ) {
			store.do( 'edit_tx_item_unitprice' , `${cnt}` , `${changed.dataset.baseval}` )
		} else if ( discount.value == "" ) {
			discount.value = 0
			store.do( 'edit_tx_item_unitprice' , `${cnt}` , `${changed.dataset.baseval}` )
		} else {
			change = Number(changed.dataset.baseval) * ( 1 + ( Number(changed.value) / 100 ) )
			store.do( 'edit_tx_item_unitprice' , `${cnt}` , `${Number( change.toFixed( 2 ) )}` )
		}
	} else if ( changed.id == "tx_customer_name" ) {
		store.do( 'set_tx_customer' , changed.value )
	} else if ( changed.id == "categories" ) {
		store.do( 'set_chosen_category' , changed.value )

		if ( changed.value == "--New Category--" ) {
			store.do( 'reset_category_items' )
			maintain_update_inp = false;
		}

		if ( changed.value != "--New Category--" ) {
			get_json( 'category_items' , changed.value )
		}
	} else if ( changed.id == "accept_items" ) {
		if ( !( store.get( 'get_item_list' ).includes( changed.value ) ) || changed.value == "" ) {
			alert( `${changed.value} is not a valid item` )
			// error_message( error_node , `${changed.value} is not a valid item` , 1500 )
			changed.value = ""
		}
	} else if ( changed.id == "accept_qty") {
		if ( changed.value <= 0 ) {
			alert( `${changed.value} cannot be less than or equal to 0` )
			// error_message( error_node , `${changed.value} cannot be less than or equal to 0` , 1500 )
			changed.value = 0
		}
	} else if ( changed.className == "edit_tx_qty" ) {
		if ( qty.value == 0 ) {
			alert( `Quantity cannot be equal to 0` )
			// error_message( error_node , `Quantity cannot be equal to 0` , 1500 )
			qty.value = changed.dataset.old_qty
		} else if ( qty.value == "" ) {
			alert( `Unit Price cannot be blank` )
			// error_message( error_node , `Unit Price cannot be blank` , 1500 )
			qty.value = changed.dataset.old_qty
		} else {
			let name = document.querySelector( `#tx_item_${changed.dataset.cnt}` )
			let change = {
				Name : name.innerHTML ,
				Qty : qty.value ,
				id : changed.dataset.cnt ,
				Type : unitprice.innerHTML
			}
			get_json( 'validate_item_qty_changed' , change )
		}
	} else if ( changed.id == "new_category_name" ) {
		if ( store.get( 'get_item_categories' ).includes( changed.value ) ) {
			alert( `Category ${changed.value} already exists` )
			// error_message( error_node , `Category ${changed.value} already exists` , 1500 )
		}
	} else if ( changed.id == "price_rule" ) {
		if ( name.value != "" && qty.value > 0 ) {

			let changed = {
				Name : name.value ,
				Qty : qty.value ,
				Type : price_rule.value
			}

			get_json( `validate_item_qty` , changed )

		}
	} else if ( changed.id == "add_item_bought" ) {
		if ( formula_box.value != "" ) {
			let product = calculate_capital( `${bought_box.value}${formula_box.value}` )
			capital_box.innerHTML = product.toFixed(2)
		} else {
			capital_box.innerHTML = changed.value
		}
	} else if ( changed.id == "add_new_category_bought" ) {
		if ( new_formula_box.value != "" ) {
			let product = calculate_capital( `${new_bought_box.value}${new_formula_box.value}` )
			new_capital_box.innerHTML = product.toFixed(2)
		} else {
			new_capital_box.innerHTML = changed.value
		}
	} else if ( changed.className == "new_category_warning" ) {
		store.do( 'edit_new_category_items' , changed.dataset.cnt , "Warning" , changed.value )
	} else if ( changed.className == "new_category_formula" ) {
		store.do( 'edit_new_category_items' , changed.dataset.cnt , "Formula" , changed.value )
	} else if ( changed.className == "new_category_freight" ) {
		store.do( 'edit_new_category_items' , changed.dataset.cnt , "Freight" , changed.value )
	}

	//TODO : cater to optional values newtx
})

document.addEventListener( 'click' , ( event ) => {
	let clicked = event.target
	let error_node , message , customer = null
	let name_span , uname_span , passwrd_span = null

	if ( router.current.id == "newtx" ) {
		error_node = document.querySelector( "#tx_error" )
	} else if ( router.current.id == "maintain" ) {
		error_node = document.querySelector( "#add_error" )
		item_table = document.querySelector( "#admin_item_table" )
		name_box = document.querySelector( "#add_item_name" )
		unit_box = document.querySelector( "#add_unit_name" )
		qty_box = document.querySelector( "#add_item_qty" )
		warning_box = document.querySelector( "#add_item_warning" )
		retail_box = document.querySelector( "#add_item_retail" )
		wholesale_box = document.querySelector( "#add_item_wholesale" )
		bought_box = document.querySelector( "#add_item_bought" )
		formula_box = document.querySelector( "#add_item_formula" )
		freight_box = document.querySelector( "#add_item_freight" )
		capital_box = document.querySelector( "#add_item_capital" )
		add_button = document.querySelector( "#add_item" )
		new_item_table = document.querySelector( "#add_category_table" )
		new_category_name = document.querySelector( "#new_category_name" )
		new_name_box = document.querySelector( "#add_new_category_name" )
		new_qty_box = document.querySelector( "#add_new_category_remain" )
		new_warning_box = document.querySelector( "#add_new_category_warning" )
		new_bought_box = document.querySelector( "#add_new_category_bought" )
		new_formula_box = document.querySelector( "#add_new_category_formula" )
		new_freight_box = document.querySelector( "#add_new_category_freight" )
		new_capital_box = document.querySelector( "#add_new_category_capital" )
		new_retail_box = document.querySelector( "#add_new_category_retail" )
		new_wholesale_box = document.querySelector( "#add_new_category_wholesale" )
		new_unit_box = document.querySelector( "#add_new_category_unit" )
	} else if ( router.current.id == "accept" ) {
		error_node = document.querySelector( "#accept_error" )
		accept_button = document.querySelector( "#add_item" )
		accept_table = document.querySelector( "#accept_table" )
		accept_name_box = document.querySelector( "#accept_items" )
		accept_qty_box = document.querySelector( "#accept_qty" )
		accept_capital_box = document.querySelector( "#accept_capital" )
	} else if ( router.current.id == "admin" ) {
		error_node = document.querySelector( `#edit_error_${clicked.dataset.cnt}` )
		passwd_span = document.querySelector( `#emp_pass_${clicked.dataset.cnt}` )
		role_span = document.querySelector( `#emp_role_${clicked.dataset.cnt}` )
	}

	if ( clicked.id == "remove_item" ) {
		if ( router.current.id == "newtx" ) {
			store.do( 'remove_tx_item' , Number(clicked.dataset.cnt) )
		} else if ( router.current.id == "maintain" ) {
			let trigger_fetch = true
			let remove_item = store.get( 'get_category_items' )[ Number(clicked.dataset.cnt) ]
			remove_item[ "category" ] = store.get( 'get_chosen_category' )

			if ( maintain_update_inp == true ) {
				alert( `Edit in Progress` )
				// error_message( error_node , `Edit in Progress` , 1500 ) 
				trigger_fetch = false;
			}

			if ( trigger_fetch ) {
				post_json( 'remove_item' , remove_item )
					.then( res => res.json() )
					.then( data => {
						if ( data.status == "OK" ) {
							store.do( 'remove_category_items' , Number(clicked.dataset.cnt) )
							if ( store.get( 'get_category_items' ).length == 0 ) {
								store.do( 'remove_chosen_category' , 
											store.get( 'get_item_categories' ).indexOf( store.get( 'get_chosen_category' ) ) 
										)
								store.do( 'reset_chosen_category' )
							}
						} else {
							alert( `${data.status}` )
							// error_message( error_node , `${data.status}` , 1500 ) 
						}
					});
			}
		} else if ( router.current.id == "accept" ) {
			store.do( 'remove_accept_items' , Number(clicked.dataset.cnt) )
		} else if ( router.current.id == "history" ) {
			let rollback_obj = { 
				type : clicked.dataset.type ,
				id : clicked.dataset.cnt ,
				name : clicked.dataset.name ,
				qty : clicked.dataset.qty
			}
			store.do( 'rollback_audit_trail' , clicked.dataset.type , clicked.dataset.id , clicked.dataset.cnt )
			post_json( 'rollback' , rollback_obj )
				.then( res => res.json() )
				.then( data => {
					if ( data.status != "OK" ) { alert( `${data.status}` ) }
				})
		}
	} else if ( clicked.id == "cancel" ) {
		if ( router.current.id == "newtx" ) {
			store.do( 'reset_tx_customer' )
			store.do( 'reset_tx_obj' )
		} else if ( router.current.id == "maintain" ) {
			store.do( 'reset_chosen_category' )
		} else if ( router.current.id == "accept" ) {
			store.do( 'reset_accept_items' )
		}
	} else if ( clicked.id == "finish" ) {
		if ( router.current.id == "newtx" ) {
			let cancel = document.querySelector( "#cancel" )
			let deductions = 0;
			let date = new Date()
			let tx_obj = Reef.clone( app.store.data.tx_obj )

			if ( store.get( 'get_tx_customer' ) == "" ) {
				alert( `Customer Name is Needed` )
				// error_message( error_node , `Customer Name is Needed` , 1500 )
			} else if ( tx_obj.length == 1 ) {
				alert( `Transaction is Empty` )
				// error_message( error_node , `Transaction is Empty` , 1500 )				
			} else {
				tx_obj.splice( 0 , 1 )
				let checkout_obj = {
					Name : store.get( 'get_tx_customer' ) ,
					tx_obj ,
					tx_owner : store.get( 'get_employee_obj' ).username 
				}

				for (var i = 0; i < tx_obj.length; i++) {

					let change = ( tx_obj[i].baseVal == 0 )
						? 1
						: tx_obj[i].UnitPrice / tx_obj[i].baseVal

					if ( change > 1 ) {
						tx_obj[i][ "Discount" ] = "+" + ( ( Number( change ) - 1 ) * 100 ).toFixed(2)
					} else if ( change == 1 ) {
						tx_obj[i][ "Discount" ] = ""
					} else if ( change < 1 ) {
						tx_obj[i][ "Discount" ] = "-" + ( ( 1 - Number( change ) ) * 100 ).toFixed(2)
					}

					post_json( 'deduct' , tx_obj[i] )
						.then( res => res.json() )
						.then( data => {

							( data.status != "OK" )
								? alert( `${data.status}` )
								: deductions++;

							if ( deductions == tx_obj.length && i == tx_obj.length ) {

								clicked.disabled = true
								cancel.disabled = true
								 
								post_json( 'tx' , JSON.stringify( checkout_obj ) )
									.then( res => res.json() )
									.then( data => {
										if ( data.status != "SUCCESS" ) {
											alert( `Network Error` )
											// error_message( error_node , `Network Error` , 1500 )
										} else {
											let print_dom = `
											<div style="display: flex; flex-direction: column" >

												<div style="display:flex; 
											 						flex-direction:row; 
											 						justify-content: space-between; 
											 						padding-bottom: 15px;">

									 				<div style="display:flex; flex-direction: column;">
									 					<span>Customer : ${store.get( 'get_tx_customer' )}</span>
									 					<br>
									 					<span>Seller : ${store.get( 'get_employee_obj' ).username}</span>
									 				</div>

													<div style="display:flex; flex-direction: column;">
									 					<span>Date ( YYYY/MM/DD ) : ${ date.getFullYear() }/
									 												${ date.getUTCMonth() + 1 }/
									 												${ date.getUTCDate() }
									 					</span>
									 					<br>
									 					<span>Transaction Number : ${data.count}</span>
									 				</div>											 				

									 			</div>

												<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;"> 
													<thead>
														<tr>
															<th style="border: 1px solid black; text-align: center;">Qty</th>
															<th style="border: 1px solid black; text-align: center;">Unit</th>
															<th style="border: 1px solid black; text-align: center;">Name</th>`

														if ( store.get( 'get_employee_obj' ).role == "admin" ) {
															print_dom += `<th style="border: 1px solid black; text-align: center;">Change (%)</th>`
														}

											print_dom += `	
															<th style="border: 1px solid black; text-align: center;">Unit Price</th>
															<th style="border: 1px solid black; text-align: center;">Total</th>
														</tr>
													</thead>

													<tbody>`

													for (var i = 0; i < tx_obj.length; i++) {
														print_dom += `
														<tr>
															<td style="border: 1px solid black; text-align: center;">${tx_obj[i].Qty}</td>
															<td style="border: 1px solid black; text-align: center;">${tx_obj[i].Unit}</td>
															<td style="border: 1px solid black; text-align: center;">${tx_obj[i].Name}</td>`

															if ( store.get( 'get_employee_obj' ).role == "admin" ) {
																print_dom += `<td style="border: 1px solid black; text-align: center;">${tx_obj[i].Discount}</td>`
															}

														print_dom += ( tx_obj[i].baseVal == 0 )
															? `<td style="border: 1px solid black; text-align: center;">${tx_obj[i].UnitPrice}</td>`
															: `<td style="border: 1px solid black; text-align: center;">${tx_obj[i].baseVal}</td>`

														print_dom += `
															<td style="border: 1px solid black; text-align: center;">${tx_obj[i].Amount}</td>
														</tr>`
													}

											print_dom += `
													</tbody>
												</table>

												<div style="display: flex; justify-content: flex-end; padding-right: 15px;">
													Total : ${store.get( 'get_tx_tot' ).toFixed(2)}
												</div>
											</div>
											`

											printJS(
												{ 
											 		printable : print_dom ,
											 		type : 'raw-html' ,
											 		documentTitle : 'Estimated Quota' ,
											 		properties : [
											 			{ field : 'Qty' , displayName : 'Qty' },
														{ field : 'Unit' , displayName : 'Unit' },
											 			{ field : 'Name' , displayName : 'Item' },
											 			{ field : 'Discount' , displayName : 'Change %' } ,
											 			{ field : 'UnitPrice' , displayName : 'Unit Price' },
											 			{ field : 'Amount' , displayName : 'Amount' }
											 		] ,
												}
											)
											store.do( 'reset_tx_obj' )
											store.do( 'reset_tx_customer' )
											let customer_name = document.querySelector( "#tx_customer_name" )
											customer_name.value = ""
											clicked.disabled = false
											cancel.disabled = true
										}

									})
							}
						})
				}	
			}		
		} else if ( router.current.id == "accept" ) {
			let trigger_fetch = true
			let addition_obj = {
				tx_items : store.get( 'get_accept_items' ) ,
				tx_owner : store.get( 'get_employee_obj' ).username
			}

			if ( store.get( 'get_accept_items' ).length == 0 ) {
				alert( `Nothing to add` )
				// error_message( error_node , `Nothing to add` , 1500 )
				trigger_fetch = false
			}

			if ( trigger_fetch ) {
				post_json( 'post_accept' , JSON.stringify( addition_obj ) )
					.then( res => res.json() )
					.then( data => {
						if ( data.status != "OK" ) {
							alert( `${data.status}` )
							// error_message( error_node , `${data.status}` , 1500 )
						} else {
							store.do( 'reset_accept_items' )
						}
					})
			}
		}
	} else if ( clicked.id == "add_item" ) {
		if ( router.current.id == "maintain" ) {
			let add_item = {
			Name : name_box.value ,
			Amount : qty_box.value ,
			Warning : warning_box.value ,
			Retail : retail_box.value ,
			category : store.get( 'get_chosen_category' ) ,
			Unit : unit_box.value ,
			Wholesale : wholesale_box.value ,
			Bought : bought_box.value ,
			Formula : formula_box.value ,
			Freight : freight_box.value
			}
			let trigger_fetch = true
			
			for ( var key in add_item ) {
				if ( key == "Name" ) {
					if ( add_item[ key ] == "" && !(nullable_keys.includes( key )) ) {
						message = `Item to Add is Blank`
						trigger_fetch = !trigger_fetch
						break;
					}
				} else if ( add_item[ key ] <= 0 && !(nullable_keys.includes( key )) ) {
					message = `${key} has invalid value`
					trigger_fetch = !trigger_fetch
					break;
				} 
			}

			for( let key in add_item ) {
				if ( add_item[ key ] == "" ) {
					add_item[ key ] = "NULL_F13LD"
				}
			}

			if ( trigger_fetch ) {
				post_json( 'add_item' , add_item )
					.then( res => res.json() )
					.then( data => {
						( data.status != "SUCCESS" )
							? alert( `${data.status}` )
							: store.do( 'add_category_items' , add_item );
					});
			} else {
				alert( message )
			}	
		} else if ( router.current.id == "accept" ){
			let trigger_add = true
			let addition = {
				Name : accept_name_box.value ,
				Qty : Number(accept_qty_box.value) ,
				Bought : Number(accept_capital_box.value)
			}

			for ( let key in addition ) {
				if ( addition[key] == "" && key != "Bought" ) {
					alert( `${key} is Blank` )
					// error_message( error_node , `${key} is Blank` , 1500 )
					trigger_add = false
					break
				} else if ( addition[key] <= 0 && key != "Bought" ) {
					alert( `${key} cannot be less than or equal to zero` )
					// error_message( error_node , `${key} cannot be less than or equal to zero` , 1500 )
					trigger_add = false
					break
				}

				if ( key == "Name" ) {
					store.get( 'get_accept_items' , ( item ) => {
						if ( item.Name == addition[key] ) {
							alert( `${item.Name} already in the list` )
							// error_message( error_node , `${item.Name} already in the list` , 1500 )
							trigger_add = false;
							return false;
						}
					})
					if ( trigger_add == false ) { break; }
				}
			}

			if ( (!(store.get( 'get_item_list' ).includes( accept_name_box.value )) && trigger_add ) ) {
				alert( `${accept_name_box.value} is not valid` )
				// error_message( error_node , `${accept_name_box.value} is not valid` , 1500 )
				trigger_add = false
			}

			if ( trigger_add ) {
				store.do( 'add_accept_items' , addition )
			}
		}		
	} else if ( clicked.id == "edit_item") {
		if ( router.current.id == "maintain" ) {
			if ( clicked.dataset.state == "edit" && maintain_update_inp == false ) {
				name_box.disabled = qty_box.disabled = warning_box.disabled = true
				retail_box.disabled = maintain_update_inp = add_button.disabled = true
				wholesale_box.disabled = bought_box.disabled = formula_box.disabled = true
				unit_box.disabled = true
				clicked.dataset.state = "cancel"
				clicked.innerHTML = "&#128190;"

				for (var i = 0; i < item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells.length; i++) {

					let cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i]

					if ( i == 0 || i == 1 || i==6 || i == 7 || i == 8 ) {
						continue
					} else if ( i == 2 ) {
						cell.innerHTML = `<input type="text" placeholder="${cell.dataset.original}">`
					} else if ( i == 5 || i == 9 || i == 10 ) {
						cell.innerHTML = `<input type="number" placeholder="${cell.dataset.original}" min="1" step="any">`
					} else {
						cell.innerHTML = `<input type="number" placeholder="${cell.dataset.original}" min="1" step="1">`
					}

				}
			} else if ( clicked.dataset.state == "cancel" ) {
				let update_item = {
					Name : store.get( 'get_category_items' )[ clicked.dataset.cnt ][ "Name" ] ,
					Unit : null ,
					Amount : null ,
					Warning : null ,
					Bought : null ,
					Formula : null ,
					Freight : null ,
					Retail : null ,
					Wholesale : null ,
					category : store.get( 'get_chosen_category' ) ,
				}
				let update_keys = Object.keys( update_item )

				for (var i = 0; i < item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells.length; i++) {

					let cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i]
					let cell_child = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i].childNodes[0]

					if ( i == 0 || i == 1 ) {
						continue
					} else if ( i == 6 || i == 7 ) {
						update_item[ `${update_keys[i - 1]}` ] = cell.innerHTML
					} else if ( update_keys[i - 1] == "Retail" || update_keys[i - 1] == "Wholesale" ) {
						let special_cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[ i + 1 ]
						let special_cell_child = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i + 1].childNodes[0]

						if ( special_cell_child.value == "" ) {
							update_item[ `${update_keys[i - 1]}` ] = special_cell.dataset.original
							special_cell.innerHTML = special_cell.dataset.original
							special_cell.dataset.original = special_cell.dataset.original
						} else {
							update_item[ `${update_keys[i - 1]}` ] = special_cell_child.value
							special_cell.innerHTML = special_cell_child.value
							special_cell.dataset.original = special_cell_child.value
						}
						
					} else if ( update_keys[i - 1] != "category" ) {
						if ( cell_child.value == "" ) {

							if ( i == 4 ) {
								update_item[ `${update_keys[i - 1]}` ] = "UNSET_F13LD"
								cell.innerHTML = "BLANK"
								cell.dataset.original = "BLANK"
							} else {
								update_item[ `${update_keys[i - 1]}` ] = cell.dataset.original
								cell.innerHTML = cell.dataset.original
								cell.dataset.original = cell.dataset.original
							}

						} else {
							update_item[ `${update_keys[i - 1]}` ] = cell_child.value
							cell.innerHTML = cell_child.value
							cell.dataset.original = cell_child.value
						}
					}
				}

				for( let key in update_item ) {
					if ( update_item[ key ] == "" ) {
						update_item[ key ] = "NULL_F13LD"
					}
				}

				post_json( 'update_item' , update_item )
				.then( res => res.json() )
				.then( data => {
					if ( data.status == "OK" ) {
						maintain_update_inp = name_box.disabled = qty_box.disabled = false
						warning_box.disabled = retail_box.disabled = add_button.disabled = false
						wholesale_box.disabled = bought_box.disabled = formula_box.disabled = false
						unit_box.disabled = false
						clicked.dataset.state = "edit"
						clicked.innerHTML = "&#9998;"
						store.do( "edit_category_items" , clicked.dataset.cnt , update_item )
					} else {
						alert( `${data.status}` )

						let arr_keys = [ "" , "" , "Unit" , "Amount" , "Warning" , "" , "" , "Retail" , "Wholesale" ]

						for (var i = 0; i < item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells.length; i++) {

							let cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i]

							if ( i == 0 || i == 1 || i==6 || i == 7 || i == 8 ) {
								continue
							} else if ( i == 2 ) {
								cell.innerHTML = `<input type="text" 
													placeholder="${store.get( 'get_category_items' )[ clicked.dataset.cnt ][ arr_keys[i] ]}">`
							} else if ( i == 5 || i == 9 || i == 10 ) {
								cell.innerHTML = `<input type="number" 
													placeholder="${store.get( 'get_category_items' )[ clicked.dataset.cnt ][ arr_keys[i] ]}"
													min="1" step="any">`
							} else {
								cell.innerHTML = `<input type="number" 
													placeholder="${store.get( 'get_category_items' )[ clicked.dataset.cnt ][ arr_keys[i] ]}"
													 min="1" step="1">`
							}
						}

						// error_message( error_node , `${data.status}` , 1500 )
					}
				})

			} else if ( clicked.dataset.state == "edit" && maintain_update_inp == true ) {
				alert( "Edit in Progress" )
				// error_message( error_node , "Edit in Progress" , 1500 )
			}	
		} else if ( router.current.id == "accept" ) {
			if ( clicked.dataset.state == "edit" && accept_update_inp == false ) {
				accept_name_box.disabled = accept_qty_box.disabled = accept_button.disabled = accept_update_inp = true
				clicked.dataset.state = "cancel"
				clicked.innerHTML = "&#128190;"

				let cell_arr = accept_table.rows[ Number(clicked.dataset.cnt) + 1 ].cells

				cell_arr[2].innerHTML = `<input type="number" min="1" step="1" placeholder=${cell_arr[2].dataset.old} id="edit_accept_qty">`
				cell_arr[3].innerHTML = `<input type="number" min="1" step="any" placeholder=${cell_arr[3].dataset.old} id="edit_accept_bought">`

			} else if ( clicked.dataset.state = "cancel" ) {
				accept_name_box.disabled = accept_qty_box.disabled = accept_button.disabled = accept_update_inp = false
				clicked.dataset.state = "edit"
				clicked.innerHTML = "&#9998;"

				let cell_arr = accept_table.rows[ Number(clicked.dataset.cnt) + 1 ].cells
				let qty_box = document.querySelector( "#edit_accept_qty" )
				let bought_box = document.querySelector( "#edit_accept_bought" )
				let new_accept = {
					Name : cell_arr[1].innerHTML ,
					Qty : qty_box.value ,
					Bought : bought_box.value
				}
				let new_accept_keys = Object.keys( new_accept );

				for (var i = 0; i < new_accept_keys.length; i++) {
					if ( i == 0 ) {
						continue
					} else {
						( new_accept[ `${new_accept_keys[ `${i}` ] }` ] == "" )
							? new_accept[ `${new_accept_keys[ `${i}` ] }` ] = cell_arr[ i+1 ].dataset.old
							: cell_arr[ i+1 ].dataset.old = new_accept[ `${new_accept_keys[ `${i}` ]}` ]
					}
				}

				cell_arr[2].innerHTML = new_accept[ `${new_accept_keys[ 1 ]}` ]
				cell_arr[3].innerHTML = new_accept[ `${new_accept_keys[ 2 ]}` ]

				store.do( 'edit_accept_items' , clicked.dataset.cnt , new_accept )

			} else if ( clicked.dataset.state = "edit" && accept_update_inp ) {
				alert( `Edit in progress` )
				// error_message( error_node , `Edit in progress` , 1500 ) 
			}
		} else if ( router.current.id == "admin" ) {
			if ( clicked.dataset.state == "edit" && employee_update_inp == false ) {
				employee_update_inp = true
				clicked.dataset.state = "save"
				clicked.innerHTML = "Save Changes"

				passwd_span.innerHTML = `<input type="text" value=${passwd_span.innerHTML}>`
				role_span.innerHTML = ( role_span.innerHTML == "admin" )
					? render_select( [ 'admin' , 'user' ] )
					: render_select( [ 'user' , 'admin' ] );
			} else if ( clicked.dataset.state == "save" ) {
				let error_node = document.querySelector( `#edit_error_${clicked.dataset.cnt}` )
				let trigger_fetch = true
				let update_obj = {
					name : store.get( 'get_employee_arr' )[ clicked.dataset.cnt ].name,
					username : store.get( 'get_employee_arr' )[ clicked.dataset.cnt ].username,
					role : role_span.childNodes[0].value,
					Password : passwd_span.childNodes[0].value
				}
				
				for( let key in update_obj ) {
					if ( update_obj[key] == "" ) {
						trigger_fetch = false
						alert( `${key} is Empty` )
						// error_message( error_node , `${key} is Empty` , 1500 )
						break
					} else {
						if ( key == "role" ) {
							if ( update_obj[key] != role_span.dataset.old ) {
								if ( role_span.dataset.old == "admin" && store.get( 'get_admin_cnt' ) == 1 ) {
									alert( `One admin account must remain` )
									// error_message( error_node , `One admin account must remain` , 1500 )
									trigger_fetch = false
									break
								}
							}

							if ( trigger_fetch ) {
								role_span.innerHTML = update_obj[key]
								store.do( 'edit_employee_arr' , clicked.dataset.cnt , key , update_obj[key] )
							}
						}

						if ( trigger_fetch ) {
							if ( key == "password" ) { 
								passwd_span.innerHTML = update_obj[key]
							}
						}
					}
				}

				if ( trigger_fetch ) {
					employee_update_inp = false
					clicked.dataset.state = "edit"
					clicked.innerHTML = "Edit Employee"
					post_json( 'change_employee' , JSON.stringify( update_obj ) )
						.then( res => res.json())
						.then( data => {
							if ( data.action != "" ) {
								store.do( `${data.action}` )	
							}
						})  
				}
			} else if ( clicked.dataset.state == "edit" && employee_update_inp ) {
				alert( `Edit in Progress` )
				// error_message( error_node , 'Edit in Progress' , 1500 )
			}
		}	
	} else if ( clicked.id == "change_fx" ) {
		if ( clicked.dataset.state == "edit" && maintain_update_inp == false ) {
			maintain_update_inp = name_box.disabled = qty_box.disabled = true
			warning_box.disabled = retail_box.disabled = add_button.disabled = true
			wholesale_box.disabled = bought_box.disabled = formula_box.disabled = true
			unit_box.disabled = true
			maintain_update_inp = true

			let baseval_change = document.querySelector( `#baseval_${clicked.dataset.cnt}` )
			let capital_change = document.querySelector( `#capital_${clicked.dataset.cnt}` )

			capital_change.innerHTML = baseval_change.innerHTML

			clicked.dataset.state = "save"
			clicked.innerHTML = "Save Capital"

			for (var i = 0; i < item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells.length; i++) {
				let cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i]
				let cell_child = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i].childNodes[0]

				if ( i == 6 ) {
					cell.innerHTML = `<input type="text" 
										id="change_formula" 
										data-cnt=${clicked.dataset.cnt}>`
				} else if ( i == 7 ) {
					cell.innerHTML = `<input type="number"
										id="change_freight"
										data-cnt=${clicked.dataset.cnt}
										>`
				} else {
					continue
				}
			}
		} else if ( clicked.dataset.state == "save" ) {
			let formula = document.querySelector( "#change_formula" )
			let update_item = {
					Name : store.get( 'get_category_items' )[ clicked.dataset.cnt ][ "Name" ] ,
					Unit : null ,
					Amount : null ,
					Warning : null ,
					Bought : null ,
					Formula : null ,
					Freight : null ,
					Retail : null ,
					Wholesale : null ,
					category : store.get( 'get_chosen_category' ) ,
				}
			let update_keys = Object.keys( update_item )

			for (var i = 0; i < item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells.length; i++) {
				let cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i]
				let cell_child = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i].childNodes[0]

				if ( i == 0 || i == 1 ) {
					continue
				} else if ( i >= 8 ) {
					let special_cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[ i + 1 ]

					if ( special_cell != undefined ) {
						update_item[ update_keys[ i - 1 ] ] = special_cell.innerHTML
					}

				} else if ( i == 6 || i == 7 ) {

					if ( cell_child.value == "" ) {

						update_item[ `${update_keys[i - 1]}` ] = "UNSET_F13LD"
						cell.innerHTML = ""
						cell.dataset.original = ""

					} else {
						update_item[ `${update_keys[i - 1]}` ] = cell_child.value
						cell.innerHTML = cell_child.value
						cell.dataset.original = cell_child.value
					}

				} else {
					update_item[ update_keys[ i - 1 ] ] = cell.innerHTML
				}

			}

			for( let key in update_item ) {
				if ( update_item[ key ] == "" ) {
					update_item[ key ] = "NULL_F13LD"
				}
			}

			post_json( 'update_item' , update_item )
				.then( res => res.json() )
				.then( data => {
					if ( data.status == "OK" ) {
						maintain_update_inp = name_box.disabled = qty_box.disabled = false
						warning_box.disabled = retail_box.disabled = add_button.disabled = false
						wholesale_box.disabled = bought_box.disabled = formula_box.disabled = false
						unit_box.disabled = false
						maintain_update_inp = false
						clicked.dataset.state = "edit"
						clicked.innerHTML = "Edit Capital"
						store.do( "edit_category_items" , clicked.dataset.cnt , update_item )
					} else {
						alert( data.status )

						for (var i = 0; i < item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells.length; i++) {
							let cell = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i]
							let cell_child = item_table.rows[ Number( clicked.dataset.cnt ) + 1 ].cells[i].childNodes[0]

							if ( i == 6 ) {
								cell.innerHTML = `<input type="text" 
													id="change_formula" 
													placeholder="${store.get( 'get_category_items' )[ clicked.dataset.cnt ]["Formula"]}" 
													data-cnt=${clicked.dataset.cnt}>`
							}else if ( i == 7 ) {
								cell.innerHTML = `<input type="text" 
													id="change_freight" 
													placeholder="${store.get( 'get_category_items' )[ clicked.dataset.cnt ]["Formula"]}" 
													data-cnt=${clicked.dataset.cnt}>`
							} else {
								continue
							}
						}
					}
				})
		} else {
			alert( "Edit in Progress" )
		}
	} else if ( clicked.id == "add_new_category_item" ) {
		let trigger_add = true
		let insert = {
			Name : new_name_box.value ,
			Unit : new_unit_box.value ,
			Amount : new_qty_box.value ,
			Warning : new_warning_box.value ,
			Bought : new_bought_box.value ,
			Formula : new_formula_box.value ,
			Freight : new_freight_box.value ,
			Retail : new_retail_box.value ,
			Wholesale : new_wholesale_box.value ,
			Category : new_category_name.value
		}

		for( var key in insert ) {
			if ( insert[key] == "" && !(nullable_keys.includes( key )) ) {
				alert( `${key} cannot be empty` )
				// error_message( error_node , `${key} cannot be empty` , 1500 )
				trigger_add = false;
				break;
			} else if ( insert[key] == 0 && !(nullable_keys.includes( key )) ) {
				alert( `${key} cannot be Equal to 0` )
				// error_message( error_node , `${key} cannot be Equal to 0` , 1500 )
				trigger_add = false;
				break;
			}
		}

		if ( trigger_add ) {
			store.get( 'get_new_category_items' ).forEach( item => {
				if ( item.Name == insert.Name ) {
					alert( `Item to add Already in list` )
					// error_message( error_node , `Item to add Already in list` , 1500 )
					trigger_add = false;
					new_name_box.placeholder = "New Item Here"
					new_formula_box.placeholder = "Plus/Minus"
					new_qty_box.placeholder = new_warning_box.placeholder = new_retail_box.placeholder = new_wholesale_box.placeholder = 0
					new_bought_box.placeholder = new_capital_box.innerHTML =0
					return false;
				}
			})
		}

		for( let key in insert ) {
			if ( insert[ key ] == "" ) {
				insert[ key ] = "NULL_F13LD"
			}
		}

		if ( trigger_add ) {
			get_json( 'validate_unique_item_cat' , insert )
		}
	} else if ( clicked.id == "cancel_add_new_category" ) {

		if ( store.get( 'get_item_categories' ).length == 0 ) {
			new_category_name.selected = "Choose Category"
		} else {
			store.do( 'reset_chosen_category' )
			store.do( 'reset_new_category_items' )
		}

	} else if ( clicked.id == "finish_add_new_category" ) {
		let trigger_add = true

		if ( store.get( 'get_new_category_items' ).length == 0 ) {
			alert( `Items to add is Blank` )
			// error_message( error_node , `Items to add is Blank` , 1500 )
			trigger_add = false
		}

		if ( trigger_add ) {
			for (var i = 0; i < store.get( 'get_new_category_items' ).length; i++) {
				post_json( 'add_new_category_items' , store.get( 'get_new_category_items' )[i] )
					.then( res => res.json() )
					.then( data => {
						if ( data.status == "SUCCESS" ) {
							store.do( 'reset_chosen_category' )	
						}
					})
			}

			get_json( 'new_category_items' , new_category_name.value )
		}
	} else if ( clicked.id == "remove_new_category_item" ) {
		store.do( 'remove_new_category_items' , clicked.dataset.cnt )
	} else if ( clicked.id == "default_employees" ) {
		store.do( 'set_employee_action' , "" )
	} else if ( clicked.id == "new_employee" ) {
		store.do( 'set_employee_action' , "delete" )
	} else if ( clicked.id == "activate_item" ) {
		if ( store.get( 'get_admin_cnt' ) == 1 && 
			 store.get( 'get_employee_arr' )[ clicked.dataset.cnt ].role == "admin" &&
			 store.get( 'get_employee_arr' )[ clicked.dataset.cnt ].active ) {
			alert( 'One admin account must remain' )
			// error_message( error_node , 'One admin account must remain' , 1500 )
		} else if ( employee_update_inp )  {
			alert( 'Edit in Progress' )
			// error_message( error_node , 'Edit in Progress' , 1500 )
		} else {
			( store.get( 'get_employee_arr' )[ clicked.dataset.cnt ].role == "admin"
				&& store.get( 'get_employee_arr' )[ clicked.dataset.cnt ].active )
				? store.do( 'minus_admin' )
				: store.do( 'add_admin' )

			post_json( 'toggle_employee' , JSON.stringify( store.get( 'get_employee_arr' )[ clicked.dataset.cnt ] ) )
				.then( res => res.json() )
				.then( data => {
					( data.status != "OK" )
						? alert( `${data.status}` )
						: store.do( 'toggle_employee_arr_active' , clicked.dataset.cnt )
				})
		}
	}
})

document.addEventListener( 'focusin' , ( event ) => {
	let focused = event.target

	if ( focused.id == "change_formula" ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let baseval = document.querySelector( `#baseval_${focused.dataset.cnt}` )
			let capital = document.querySelector( `#capital_${focused.dataset.cnt}` )
			let freight = document.querySelector( `#change_freight` )
			let arr_valid = [ "0" , "1" , "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9" , "Shift" , "Backspace" , "+" , "-" , "."  ]

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( arr_valid.includes( input ) ) {

				if ( input == "Backspace" ) {

					if ( ( /[0-9\.\+\-]$/g ).test( previous ) ) {
						fx_arg = `${baseval.dataset.original}${previous.slice( 0 , -1 )}`

						if ( ( /[\+\-\.]$/ ).test( fx_arg ) ) {
							if ( ( /^[\+\-]$/ ).test( previous.slice( 0 , -1 ) ) ) {
								fx_arg = `${baseval.dataset.original}${store.get( 'get_category_items' )[ focused.dataset.cnt ][ "Formula" ]}`
							} else {
								fx_arg += "0"
							}
						}

						if ( previous.length == 1 ) {
							if ( freight.value != "" ) {
								product = Number( freight.value ) + Number(baseval.innerHTML)
							}
						} else {
							if ( freight.value != "" ) {
								product = calculate_capital( fx_arg )
								product += Number( freight.value )
							}
						}

					} 

				} else if ( ( /[0-9]/g ).test( input ) ) {
					product = calculate_capital( `${baseval.dataset.original}${focused.value}${input}` )

					if ( freight.value != "" ) {
						product += Number( freight.value )
					}
				}

				capital.innerHTML = product.toFixed(2)
			}

		})
	} else if ( focused.id == "change_freight" ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let capital = document.querySelector( `#capital_${focused.dataset.cnt}` )
			let baseval = document.querySelector( `#baseval_${focused.dataset.cnt}` )
			let formula = document.querySelector( `#change_formula` )

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( ( /[0-9]/g ).test( input ) ) {

				if ( formula.value != "" && formula.placeholder != "BLANK" ) {
					product = calculate_capital( `${baseval.dataset.original}${formula.value}` )
					product += Number( current )
				} else {
					product += Number(baseval.innerHTML) + Number( current )
				}
				capital.innerHTML = product.toFixed(2)

			} else if ( input == "Backspace" ) {

				if ( formula.value != "" ) {
					product = calculate_capital( `${baseval.dataset.original}${formula.value}` )
					product += Number( previous.slice( 0 , -1 ) )
				} else {
					product += Number(baseval.innerHTML) + Number( previous.slice( 0 , -1 ) )
				}
				capital.innerHTML = product.toFixed(2)
				
			}
		})
	} else if ( focused.id == 'add_item_formula' ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let baseval = document.querySelector( `#add_item_bought` )
			let capital = document.querySelector( `#add_item_capital` )
			let freight = document.querySelector( `#add_item_freight` )
			let arr_valid = [ "0" , "1" , "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9" , "Shift" , "Backspace" , "+" , "-" , "."  ]

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( arr_valid.includes( input ) ) {

				if ( input == "Backspace" ) {

					if ( ( /[0-9\.\+\-]$/g ).test( previous ) ) {
						fx_arg = `${baseval.value}${previous.slice( 0 , -1 )}`

						if ( ( /[\+\-\.]$/ ).test( fx_arg ) ) {
							if ( ( /^[\+\-]$/ ).test( previous.slice( 0 , -1 ) )  ) {
								fx_arg = `${baseval.value}-0`
							} else {
								fx_arg += "0"
							}
						}

						if ( previous.length == 1 ) {
							product = Number(baseval.value)

							if ( freight.value != "" ) {
								product += Number( freight.value )
							}
						} else {
							product = calculate_capital( fx_arg )
							
							if ( freight.value != "" ) {
								product += Number( freight.value )
							}
						}

					} 

				} else if ( ( /[0-9]/g ).test( input ) ) {
					product = calculate_capital( `${baseval.value}${focused.value}${input}` )

					if ( freight.value != "" ) {
						product += Number( freight.value )
					}
				}

				capital.innerHTML = Number(product).toFixed(2)
			}

		})
	} else if ( focused.id == 'add_item_freight' ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let baseval = document.querySelector( `#add_item_bought` )
			let capital = document.querySelector( `#add_item_capital` )
			let formula = document.querySelector( `#add_item_formula` )

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( ( /[0-9]/g ).test( input ) ) {

				if ( formula.value != "" && formula.placeholder != "BLANK" ) {
					product = calculate_capital( `${baseval.value}${formula.value}` )
					product += Number( current )
				} else {
					product += Number(baseval.value) + Number( current )
				}
				capital.innerHTML = product.toFixed(2)

			} else if ( input == "Backspace" ) {

				if ( formula.value != "" ) {
					product = calculate_capital( `${baseval.value}${formula.value}` )
					product += Number( previous.slice( 0 , -1 ) )
				} else {
					product += Number(baseval.innerHTML) + Number( previous.slice( 0 , -1 ) )
				}
				capital.innerHTML = product.toFixed(2)
				
			}

		})
	} else if ( focused.id == 'add_new_category_formula' ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let baseval = document.querySelector( `#add_new_category_bought` )
			let capital = document.querySelector( `#add_new_category_capital` )
			let freight = document.querySelector( `#add_new_category_freight` )
			let arr_valid = [ "0" , "1" , "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9" , "Shift" , "Backspace" , "+" , "-" , "."  ]

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( arr_valid.includes( input ) ) {

				if ( input == "Backspace" ) {

					if ( ( /[0-9\.\+\-]$/g ).test( previous ) ) {
						fx_arg = `${baseval.value}${previous.slice( 0 , -1 )}`

						if ( ( /[\+\-\.]$/ ).test( fx_arg ) ) {
							if ( ( /^[\+\-]$/ ).test( previous.slice( 0 , -1 ) )  ) {
								fx_arg = `${baseval.value}-0`
							} else {
								fx_arg += "0"
							}
						}

						if ( previous.length == 1 ) {
							product = Number(baseval.value)

							if ( freight.value != "" ) {
								product += Number( freight.value )
							}
						} else {
							product = calculate_capital( fx_arg )
							
							if ( freight.value != "" ) {
								product += Number( freight.value )
							}
						}

					} 

				} else if ( ( /[0-9]/g ).test( input ) ) {
					product = calculate_capital( `${baseval.value}${focused.value}${input}` )

					if ( freight.value != "" ) {
						product += Number( freight.value )
					}
				}

				capital.innerHTML = Number(product).toFixed(2)
			}

		})
	} else if ( focused.id == 'add_new_category_freight' ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let baseval = document.querySelector( `#add_new_category_bought` )
			let capital = document.querySelector( `#add_new_category_capital` )
			let formula = document.querySelector( `#add_new_category_formula` )

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( ( /[0-9]/g ).test( input ) ) {

				if ( formula.value != "" && formula.placeholder != "BLANK" ) {
					product = calculate_capital( `${baseval.value}${formula.value}` )
					product += Number( current )
				} else {
					product += Number(baseval.value) + Number( current )
				}
				capital.innerHTML = product.toFixed(2)

			} else if ( input == "Backspace" ) {

				if ( formula.value != "" ) {
					product = calculate_capital( `${baseval.value}${formula.value}` )
					product += Number( previous.slice( 0 , -1 ) )
				} else {
					product += Number(baseval.innerHTML) + Number( previous.slice( 0 , -1 ) )
				}
				capital.innerHTML = product.toFixed(2)
				
			}

		})
	} else if ( focused.className == 'new_category_formula' ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let baseval = document.querySelector( `#new_bought_${focused.dataset.cnt}` )
			let capital = document.querySelector( `#new_capital_${focused.dataset.cnt}` )
			let freight = document.querySelector( `#new_freight_${focused.dataset.cnt}` )
			let arr_valid = [ "0" , "1" , "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9" , "Shift" , "Backspace" , "+" , "-" , "."  ]

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( arr_valid.includes( input ) ) {

				if ( input == "Backspace" ) {

					if ( ( /[0-9\.\+\-]$/g ).test( previous ) ) {
						fx_arg = `${baseval.value}${previous.slice( 0 , -1 )}`

						if ( ( /[\+\-\.]$/ ).test( fx_arg ) ) {
							if ( ( /^[\+\-]$/ ).test( previous.slice( 0 , -1 ) )  ) {
								fx_arg = `${baseval.value}-0`
							} else {
								fx_arg += "0"
							}
						}

						if ( previous.length == 1 ) {
							product = Number(baseval.value)

							if ( freight.value != "" ) {
								product += Number( freight.value )
							}
						} else {
							product = calculate_capital( fx_arg )
							
							if ( freight.value != "" ) {
								product += Number( freight.value )
							}
						}

					} 

				} else if ( ( /[0-9]/g ).test( input ) ) {
					product = calculate_capital( `${baseval.value}${focused.value}${input}` )

					if ( freight.value != "" ) {
						product += Number( freight.value )
					}
				}

				capital.innerHTML = Number(product).toFixed(2)
			}

		})
	} else if ( focused.className == 'new_category_freight' ) {
		focused.addEventListener( 'keydown' , ( event ) => {
			let input = event.key
			let baseval = document.querySelector( `#new_bought_${focused.dataset.cnt}` )
			let capital = document.querySelector( `#new_capital_${focused.dataset.cnt}` )
			let formula = document.querySelector( `#new_formula_${focused.dataset.cnt}` )

			let previous = focused.value
			let current = `${focused.value}${input}`
			let product = 0

			if ( ( /[0-9]/g ).test( input ) ) {

				if ( formula.value != "" && formula.placeholder != "BLANK" ) {
					product = calculate_capital( `${baseval.value}${formula.value}` )
					product += Number( current )
				} else {
					product += Number(baseval.value) + Number( current )
				}
				capital.innerHTML = product.toFixed(2)

			} else if ( input == "Backspace" ) {

				if ( formula.value != "" ) {
					product = calculate_capital( `${baseval.value}${formula.value}` )
					product += Number( previous.slice( 0 , -1 ) )
				} else {
					product += Number(baseval.innerHTML) + Number( previous.slice( 0 , -1 ) )
				}
				capital.innerHTML = product.toFixed(2)
				
			}

		})
	}
})

// socket events
	// Clone stores and update on route change

	socket.on( 'deduct' , function ( change ) {
		if ( store.get( 'get_chosen_category' ) == change[0] && store.get( 'get_category_items' ).length != 0 ) {
			for (var i = 0; i < store.get( 'get_category_items' ).length; i++) {
				if ( store.get( 'get_category_items' )[i].Name == change[1].Name ) {
					store.do( 'edit_category_item_qty' , i , change[1].Amount )
				}
			}
		}
	});

	socket.on( 'addition' , function ( change ) {
		if ( store.get( 'get_chosen_category' ) == change.Category && store.get( 'get_category_items' ).length != 0 ) {
			for (var i = 0; i < store.get( 'get_category_items' ).length; i++) {
				if ( store.get( 'get_category_items' )[i].Name == change.Name ) {
					store.do( 'edit_category_item_qty' , i , change.Amount )
				}
			}
		}
	})

	socket.on( 'newtx' , function ( change ) {
		if ( router.current.id == "history" ) {
			store.do( 'add_audit_trail_item' , change.type , change.id , change.owner , change.items )
		}
	})
// socket events