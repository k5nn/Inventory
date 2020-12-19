// External Deps
const Hapi = require('@hapi/hapi');
const mongo = require( 'mongodb' );
const moment = require( 'moment' );
const socketIO = require( 'socket.io' );
const RequestIp = require( '@supercharge/request-ip' );
const chalk = require( 'chalk' );
// External Deps

// Node Native
const fs = require( 'fs' );
const os = require( 'os' );
const os_path = require( 'path' );
const assert = require('assert');
const EventEmitter = require('events');
const crypto = require( 'crypto' );
const notifier = new EventEmitter();
// Node Native

// Globals
const d = new Date()
const MongoClient = mongo.MongoClient
const dbName  = 'inventory'
// const db_url = 'mongodb://mongo:27017/'
const db_url = 'mongodb://localhost:27017/'
const client = new MongoClient( `${db_url}/${dbName}` , { 
	    useNewUrlParser: true, 
	    useUnifiedTopology: true,
});
const connection = client.connect();
const ifaces = os.networkInterfaces();
const nullable_keys = [ "Warning" , "Formula" , "Freight" ]
// Globals

const resolve_address = ( type ) => {
	let array = [];

	Object.keys( ifaces ).forEach( ( ifname ) => {
		ifaces[ ifname ].forEach( ( iface ) => {
			//skip addresses that do not match with specified type and skip 127.0.0.1
			if ( (iface.family).toUpperCase() !== type.toUpperCase() || iface.internal !== false ) { return 1 }

			array.push( iface.address );
		});
	});

	return array;
}

const log_msg = ( message , type , request ) => {

	let color = null

	switch( type ) {
		case 'START ' :
			color = "green"
		break;
		case 'ERROR ' :
			color = "red"
		break;
		case 'REDIR ' :
			color = "yellow"
		break;
		default :
			color = "grey"
		break;
	}

	if ( request != null || request != undefined ) {
		const ip = RequestIp.getClientIp(request)
		console.log( `${d.toString().split( '(' )[0]}: ${chalk.keyword( color )(type)} : ${ip} : ${message}` )
	} else {
		console.log( `${d.toString().split( '(' )[0]}: ${chalk.keyword( color )(type)} : ${message}` )
	}

}

const header_set = ( type ) => {

	let header_obj = {}

	if ( type === 'cors' ) {
		header_obj = { 
						"origin" : [ '*' ] ,
			 			"headers" : [ 'Content-Type' ] 
			 		}
	}

	return header_obj

}

const check_db = async () => {

	const require_cols = [ "items" , "transactions" , "config" , "employees" ]

	const connect = connection

	await connect.then( async () => {
		const db = client.db( dbName )
		const cols = await db.listCollections().toArray()

		if ( cols.length == 0 || cols.length != require_cols.length ) {
			for (var i = 0; i < require_cols.length; i++) {
				await db.createCollection( require_cols[i] )
			}

			const insert = { ADMIN_INITIALIZED : false }
			const config_col = db.collection( "config" )

			await config_col.find( {} )
				.toArray()
				.then( data => {
					if ( data.length == 0 ) {
						const config_bulkOp = config_col.initializeOrderedBulkOp();

						config_bulkOp.insert( insert )

						config_bulkOp.execute().then( ( err , res ) => {
							( err.result.ok )
								? log_msg( `check_db : Init Config Done` , 'INFO  ' )
								: Log.Info( `check_db : Init Config Failed` , 'INFO  ' )
						})
					}
				})
		} else {
			log_msg( `Init Done Skipping` , 'INFO  ' )
		}
	})

}

let address_array = resolve_address( 'IPV4' );

const start = async () => {

	const server = Hapi.server({
		port : 8080 ,
		host : 'localhost' ,
		// host : address_array[0] ,
		routes : {
			files : {
				relativeTo : __dirname
			} , 
			cors : true
		}
	});
	const socket_connect = socketIO.listen( server.listener , { origins : '*:*' } );
	const connect = connection

	// hapi_dependencies
	await server.register( require( '@hapi/inert' ) );
	// hapi_dependencies

	// file service
	server.route({
		method : 'GET' ,
		path : '/' ,

		handler : ( request , h ) => {
			log_msg( `index.html` , 'ACCESS' , request )
			return h.file( 'index.html' )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/assets/{folder}/{file}' ,
		handler : ( request , h ) => {
			let params = request.params
			log_msg( `./assets/${params.folder}/${params.file}` , 'ACCESS' , request )
			return h.file( `assets/${params.folder}/${params.file}` )
		}
	})
	// file service


	// routes
	server.route({
		method : 'GET' ,
		path : '/fetch_config' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const db = client.db( dbName );
				const col = db.collection( 'config' );
				const res = await col.find( {} , { projection : { _id : 0 } } )
						.toArray()
						.then( data => {
							log_msg( `/fetch_config` , 'FETCH ' , request )
							return Promise.all( data )
						});
				return Promise.all( res )
			})
			return h.response( { status : retn[0] } )
		}
	})

	server.route({
		method : 'POST' ,
		path : '/create_admin' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const data = JSON.parse( request.payload )

				const db = client.db( dbName );
				const config = db.collection( 'config' );
				const user = db.collection( 'employees' );
				const user_bulkop = user.initializeOrderedBulkOp();
				let update = { ADMIN_INITIALIZED : true }
				let filter = { ADMIN_INITIALIZED : false }
				const hash = crypto.createHash( 'sha256' )
			 	hash.update( `${data.Username}_${data.Password}` )

			 	let insert = { 
			 		username : data.Username,
			 		password : hash.digest( 'hex' ),
			 		name : data.fname,
			 		role : 'admin',
			 		active : true ,
			 	}

			 	const res = await config.updateOne( filter , { $set : update } )
				 				.then( async ( error ) => {
				 					if ( error.result.ok ) {
				 						user_bulkop.insert( insert )
				 						const res1 = await user_bulkop.execute().then( ( error , result ) => {
				 							if ( error.result.ok ) {
				 								log_msg( `/create_admin` , 'ACCESS' , request )
				 								return Promise.all( [ "OK" ] )
				 							} else {
				 								log_msg( `/create_admin : ADMIN ACCOUNT INSERTION FAILED` , 'ERROR ' , request )
				 								return Promise.all( [ "ADMIN ACCOUNT INSERTION FAILED" ] )
				 							}
				 						})
				 						return Promise.all( res1 )
				 					} else {
				 						log_msg( `/create_admin : ADJUSTING OF ADMIN_INITIALIZED FLAG FAILED` , 'ERROR ' , request )
				 						return Promise.all( [ "ADJUSTING OF ADMIN_INITIALIZED FLAG FAILED" ] )
				 					}
				 				})
				return Promise.all( res )
			})
			return ( retn[0] == "OK" ) 
				? h.response( { status : retn[0] } )
				: h.response( { status : retn[0] } ).statusCode( 500 )
		}
	})

	server.route({
		method : 'POST' ,
		path : '/login_challenge' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const data = JSON.parse( request.payload )
				const hash = crypto.createHash( 'sha256' )
				hash.update( `${data.Username}_${data.Password}` )

				const query = { 
								username : data.Username ,
								password : hash.digest( 'hex' ) ,
								active : true
				}
				const project = { _id : 0 , password : 0 , active : 0 }

				const db = client.db( dbName );
				const col = db.collection( 'employees' );

				const res = await col.find( query , { projection : project } )
									.toArray()
									.then( data => {
										if ( data.length == 0 ) {
											log_msg( `/login_challenge` , 'ERROR ' , request )
											return Promise.all( [ "WRONG" ] )						
										} else {
											log_msg( `/login_challenge` , 'ACCESS' , request );
											return Promise.all( data )
										}			
									})					
				return Promise.all( res )
			})
			return ( retn[0] == "WRONG" )
				? h.response( { status : retn[0] } ).code( 401 )
				: h.response( { status : retn[0] } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/fetch_low' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const project = {
					_id : 0 , 
					Name : 1 , 
					Category : 1 , 
					Amount : 1 , 
					bool_warning : { $lte : [ "$Amount" , "$Warning" ] }
				}
				const db = client.db( dbName );
				const col = db.collection( 'items' );
				const res = await col.aggregate( [ { $project : project } ] )
									.toArray()
									.then( ( data ) => {
										return Promise.all( data )
									});
				return Promise.all( res )
			})
			log_msg( `/fetch_low` , 'FETCH ' , request )
			return h.response( { low_items : retn } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/fetch_customers' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const db = client.db( dbName );
				const col = db.collection( 'transactions' );
				const res = await col.distinct( "Customer" ).then( ( data ) => {
					return Promise.all( data )
				});
				return Promise.all( res )
			})
			log_msg( `/fetch_customers` , 'FETCH ' , request )
			return h.response( { customers : retn } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/fetch_items/{category?}' ,
		handler : async ( request , h ) => {
			let params = request.params
			let res = null
			const retn = await connect.then( async () => {
				const query = params.category ? { Category : params.category } : {};
				const project = params.category ? { _id : 0 , Category : 0 } : {};
				const db = client.db( dbName );
				const col = db.collection( 'items' );

				if ( params.category === undefined ) {
					res = await col.distinct( "Name" ).then( ( data ) => {
						log_msg( `/fetch_items` , 'FETCH ' , request )
						return Promise.all( data )
					});
				} else {
					res = await col.find( query , { projection : project } ).toArray()
					log_msg( `/fetch_items Category : ${params.category}` , 'FETCH ' , request )
					return Promise.all( res )
				}
				return Promise.all( res )
			})
			return ( params.category )
				? h.response( { items : retn } )
				: h.response( { inventory : retn } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/fetch_categories' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const db = client.db( dbName );
				const col = db.collection( 'items' );
				const res = await col.distinct( "Category" ).then( ( data ) => {
					return Promise.all( data )
				});
				return Promise.all( res )
			})
			log_msg( '/fetch_categories' , 'FETCH ' , request )
			return h.response( { categories : retn } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/validate/item_qtychk/{name}/{request_amount}/{type?}' ,
		handler : async ( request , h ) => {
			let params = request.params
			const retn = await connect.then( async () => {
				let query = { Name : params.name.replace( /\]/g , "/" ) }
				let reply = ""
				let reply_unit = ""
				let plural_test = new RegExp( /s$/ , 'g' )
				const db = client.db( dbName );
				const col = db.collection( 'items' );
				const res = await col.find( query ).toArray().then( ( data ) => {

					if ( data.length > 1 ) {
						reply = "Item Name Conflict between categories : "

						for (var i = 0; i < data.length; i++) {
							reply += `${data[i].Category} ,`
						}
					} else if ( params.request_amount > data[0].Amount ){
						log_msg( `/validate/item_qtychk ${query.Name}` , 'ERROR ' , request )
						reply = `${params.name} quantity insufficient`
					} else {
						log_msg( `/validate/item_qtychk ${query.Name}` , 'FETCH ' , request )
						reply = "OK"
					}

					if ( params.request_amount > 1 && !( plural_test.test( data[0].Unit ) ) ) {
						reply_unit = data[0].Unit + "s"
					} else if ( params.request_amount == 1 && plural_test.test( data[0].Unit ) ) {
						reply_unit = data[0].Unit.substring( 0 , data[0].Unit.length - 1 )
					} else {
						reply_unit = data[0].Unit
					}

					if ( params.type == "RETAIL" ) {
						return Promise.all( [ reply , data[0].Retail , reply_unit , data[0].Bought , data[0].Formula , data[0].Freight ] )
					} else if ( params.type == "WHOLESALE" ) {
						return Promise.all( [ reply , data[0].Wholesale , reply_unit , data[0].Bought , data[0].Formula , data[0].Freight ] )
					} else if ( params.type == "FREE" ) {
						return Promise.all( [ reply , 0 , reply_unit , data[0].Bought , data[0].Formula , data[0].Freight ] )
					} else if ( typeof( Number(params.type) ) == "number" ) {
						return Promise.all( [ reply , Number(params.type) , reply_unit , data[0].Bought , data[0].Formula , data[0].Freight ] )
					}
				});
				return Promise.all( res )
			})
			return h.response( { status : retn[0] , UnitPrice : retn[1] , Unit : retn[2] , Bought : retn[3] , Formula : retn[4] , Freight : retn[5] } )
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/deduct_item/{name}/{quantity}' ,
		handler : async ( request , h ) => {
			let params = request.params
			let res = null
			const retn = await connect.then( async () => {
				const query = { Name : params.name.replace( /\]/g , "/" ) }
				const db = client.db( dbName );
				const col = db.collection( 'items' );

				const remain = await col.find( query ).toArray().then( async ( data ) => {
					const new_quantity = data[0].Amount - params.quantity

					if ( new_quantity <= 0 ) {
						log_msg( `/deduct_item ${params.name}` , 'ERROR ' , request )
						return Promise.all( [ `${params.name} just ran out` ] )
					} else {
						// return Promise.all( [ data[0].Category , { Name : params.name , Amount : new_quantity } ] )
						res = await col.updateOne( query , { $set : { Amount : Number(new_quantity) } } )
										.then( ( err , res ) => {
											if ( err.result.ok ) {
												log_msg( `/deduct_item ${params.name}` , 'FETCH ' , request )
												return Promise.all( [ data[0].Category , { 	Name : params.name.replace( /\]/g , "/" ) , 
																							Amount : new_quantity } ] )
											} else {
												log_msg( `/deduct_item update ${params.name}` , 'ERROR ' , request )
												return Promise.all( [ `Minus of ${params.name} Failed` ] )
											}
										})
						return Promise.all( res )
					}
				})
				if ( remain.length == 2 ) {
					notifier.emit( 'deduct' , remain )
				}
				return Promise.all( remain )
			})
			return ( retn.length == 2 ) 
				? h.response( { status : "OK" } ) 
				: h.response( { status : retn[0] } )
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/post_tx' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const db = client.db( dbName );
				const col = db.collection( 'transactions' );
				const bulkOp = col.initializeOrderedBulkOp();
				const res = await col.find( { tx_type : "MINUS" } ).count().then( async ( data ) => {
					const body = JSON.parse( request.payload )
					let insert = {
								Customer : `${body.Name}` ,
								tx_date : new Date() ,
								tx_items : body.tx_obj ,
								tx_id : 0 ,
								tx_type : "MINUS" ,
								tx_owner : `${body.tx_owner}`
							}

					insert.tx_id = data += 1

					bulkOp.insert( insert )

					const res1 = await bulkOp.execute().then( (err , res)  => {
						if ( err.result.ok ) {
							notifier.emit( 'newtx' , { type : insert.tx_type , id : insert.tx_id , items : body.tx_obj , owner : body.tx_owner } )
							log_msg( `/post_tx SUCCESS ${insert.tx_id}` , 'FETCH ' , request )
							return Promise.all( [ "SUCCESS" , insert.tx_id ] )
						} else {
							log_msg( `/post_tx FAILED ${inser.tx_id}` , 'ERROR ' , request )
							return Promise.all( [ "FAILED" ] )
						}
					})
					return Promise.all( res1 )
				})
				return Promise.all( res )
			})
			return ( retn.length == 2 )
				? h.response( { status : retn[0] , count : retn[1] } )
				: h.response( { status : retn[0] } ).code( 500 )
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/update_item/{item}/{category}/{unit}/{amount}/{warning}/{retail}/{wholesale}/{bought}/{formula}/{freight}' ,
		handler : async ( request , h ) => {
			let params = request.params
			const retn = await connect.then( async () => {
				const filter = { Name : params.item.replace( /\]/g , "/" ) , Category : params.category }
				const update = { 
								Name : params.item.replace( /\]/g , "/" ) , 
								Category : params.category , 
								Amount : Number(params.amount) , 
								Warning : Number(params.warning) ,
								Unit : params.unit ,
								Retail : Number(params.retail) ,
								Wholesale : Number(params.wholesale) ,
								Bought : Number(params.bought) ,
								Formula : params.formula.replace( "p" , "+" ) ,
								Freight : Number(params.freight)
							}
				const query = { Category : params.category }
				let unset = {}
				let res = ""

				if ( !( ( /^[\+\-]/g ).test( update.Formula ) ) && 
					 ( update.Formula != "NULL_F13LD" && update.Formula != "UNSET_F13LD" && update.Formula != "BLANK" ) ) {
					log_msg( `/update_item Formula Start` , 'ERROR ' , request )
					return Promise.all( [ "Formula must start with + or -" ] )
				}

				if ( ( ( /[A-Za-z]/g ).test( update.Formula ) ) && 
					( update.Formula != "NULL_F13LD" && update.Formula != "UNSET_F13LD" && update.Formula != "BLANK" ) ) {
					log_msg( `/update_item Invalid Formula` , 'ERROR ' , request )
					return Promise.all( [ "Formula cannot contain Letters" ] )
				}

				for( let key in update ) {
					if ( update[ key ] == "UNSET_F13LD" || 
						( nullable_keys.includes( key ) && isNaN( update[ key ] ) && key != "Formula" ) ) {
						console.log( 'here' )
						unset[ key ] = ""
						delete update[ key ]
					} else if ( update[ key ] == "NULL_F13LD" ) {
						console.log( 'there' )
						delete update[ key ]
					}
				}

				const db = client.db( dbName );
				const col = db.collection( 'items' );

				if ( Object.keys( unset ).length >= 1 ) {
					await col.updateOne( filter , { $unset : unset } )
				}

				res = await col.updateOne( filter , { $set : update } ).then( ( err , res ) => {
					return Promise.all( ( err.result.ok ) ? [ "OK" ] : [ "Update Failed" ] )
				})

				return Promise.all( res )
			})
			log_msg( `/update_item ${params.item.replace( /\]/g , "/" )}` , 'FETCH ' , request )
			return h.response( { status : retn[0] } )
		}
	})

	server.route({
		method : 'DELETE' ,
		path : '/delete_item/{item}/{category}' ,
		handler : async ( request , h ) => {
		let params = request.params
		const retn = await connect.then( async () => {
			const filter = { Name : params.item.replace( /\]/g , "/" ) , Category : params.category }
			const query = { Category : params.category }

			const db = client.db( dbName );
			const col = db.collection( 'items' );

			const res = await col.deleteOne( filter ).then( ( err , res ) => {
				return Promise.all( ( err.result.ok ) ? [ "OK" ] : [ "Delete Failed" ] )
			})
			return Promise.all( res )
		})
		log_msg( `/delete_item ${params.item}` , 'FETCH ' , request )
		return { status : retn[0] }
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/insert_item/{item}/{unit}/{category}/{amount}/{warning}/{retail}/{wholesale}/{capital}/{formula}/{freight}' ,
		handler : async ( request , h ) => {
			let params = request.params
			const retn = await connect.then( async () => {
				const insert = { 
					Name : params.item.replace( /\]/g , "/" ) , 
					Category : params.category , 
					Amount : Number(params.amount) ,
					Warning : Number(params.warning) ,
					Unit : params.unit ,
					Retail : Number(params.retail) ,
					Wholesale : Number(params.wholesale) ,
					Bought : Number(params.capital) ,
					Formula : params.formula.replace( "p" , "+" ) ,
					Freight : Number(params.freight)
				}

				for( let key in insert ) {
					if ( insert[ key ] == "NULL_F13LD" || ( nullable_keys.includes( key ) && isNaN( insert[ key ] ) ) ) {
						delete insert[ key ]
					}
				}

				const db = client.db( dbName );
				const col = db.collection( 'items' );
				const bulkOp = col.initializeOrderedBulkOp();
				const query = { Name : params.item.replace( /\]/g , "/" ) }

				bulkOp.insert( insert )

				const res = await col.find( query ).toArray().then( async ( data ) => {
					if ( data.length >= 1 ) {
						log_msg( `/insert_item dup ${insert.Name}` , 'FETCH ' , request )
						return Promise.all( [ `${insert.Name} already exists for Category ${data[0].Category}` ] )
					} else {
						const res1 = await bulkOp.execute().then( async ( err , res ) => {
							return Promise.all( ( err.result.ok ) ? [ "SUCCESS" ] : [ `Insert Failed` ] )
						})
						return Promise.all( res1 )
					}
				})
				return Promise.all( res )
			})
			log_msg( `/insert_item ${params.item.replace( /\]/g , "/" )}` , 'FETCH ' , request )
			return h.response( { status : retn[0] } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/validate/item_exist/{name}/{category}' ,
		handler : async ( request , h ) => {
			let params = request.params
			const retn = await connect.then( async () => {
				const query = { Category : params.category }
				const query2 = { Name : params.name.replace( /\]/g , "/" ) }
				const db = client.db( dbName );
				const col = db.collection( 'items' );

				const res = await col.find( query ).toArray().then( async ( data ) => {
					if ( data.length >= 1 ) {
						log_msg( `/validate/item_exist dup` , 'ERROR ' , request )
						return Promise.all( [ `Category ${params.category} already exists` ] )
					} else {
						const res1 = await col.find( query2 ).toArray().then( async ( data ) => {
							if ( data.length >= 1 ) {
								log_msg( `/validate/item_exist dup` , 'ERROR ' , request )
								return Promise.all( [ `Item already exists for ${data[0].Category}` ] )
							} else {
								log_msg( `/validate/item_exist` , 'FETCH ' , request )
								return Promise.all( [ "OK" ] )
							}
						})
						return Promise.all( res1 )
					}
				})
				return Promise.all( res )
			})
			return h.response( { status : retn } )
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/post_accept' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const data = JSON.parse( request.payload )
				const db = client.db( dbName );
				const txs = db.collection( 'transactions' );
				const items = db.collection( 'items' );
				const bulkOp = txs.initializeOrderedBulkOp();

				let insert = {
					tx_items : data.tx_items ,
					tx_date : new Date() ,
					tx_type : "ADD" ,
					tx_owner : data.tx_owner,
					tx_id : 1
				}
				const query = { tx_type : "ADD" }
				let res1 = null
				let update_complete = true

				let change = await txs.find( query )
				.count()
				.then( async ( cnt ) => {

					if ( cnt > 0 ) {
						insert.tx_id = cnt + 1
					}

					for (var i = 0; i < data.tx_items.length; i++) {
						let accept_item = data.tx_items[i].Name
						let accept_qty = data.tx_items[i].Qty
						let accept_bought = data.tx_items[i].Bought
						let query = { Name : accept_item }
						let projection = { _id : 0 , Amount : 1 , Category : 1 , Name : 1 }

						let update = await items.find( query , { projection : projection } )
									.toArray()
									.then( async (data) => {

										let db_qty = data[0].Amount
										let updated_qty = Number( accept_qty ) + Number( db_qty )
										data[0].Amount = Number( updated_qty )

										let set = ( accept_bought == "" )
											? { Amount : Number( updated_qty ) }
											: { Amount : Number( updated_qty ) , Bought : Number( accept_bought ) }

										res = await items.updateOne( query , { $set : set } )
												.then( ( error , result ) => {
													if ( error.result.ok != 1 ) {
														log_msg( `/post_accept update failed ${accept_item} ${db_qty} ${accept_qty}` 
																	, 'ERROR ' , request )
														return Promise.all( [ "FAILED" ] )
													} else {	
														log_msg( `/post_accept qty update` , 'FETCH ' , request )
														return Promise.all( data )
													}
												})
										return Promise.all( res )
									})

						if ( update[0] != "FAILED"  ) {
							notifier.emit( 'addition' , update[0] )
						} else {
							update_complete = false
							break
						}
					}

					if ( update_complete ) {
						bulkOp.insert( insert )

						const res = await bulkOp.execute().then( ( error , result ) => {
							if ( error.result.ok ) {
								notifier.emit( 'newtx' , { type : insert.tx_type , 
																  items : insert.tx_items , 
																  owner : insert.tx_owner ,
																  id : insert.tx_id } )
								return Promise.all( [ "OK" ] )
							} else {
								return Promise.all( [ "Could not Insert Addition" ] )
							}
						})
						log_msg( '/post_accept tx_insert' , 'FETCH ' , request )
						return Promise.all( res )
					} else {
						return Promise.all( [ "Insert Incomplete" ] )
					}
				})
				return Promise.all( change )
			})
			return h.response( { status : retn[0] } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/fetch_txdetail/{tx_num}' ,
		handler : async ( request , h ) => {
			let params = request.params
			const retn = await connect.then( async () => {
				const query = { tx_id : Number(params.tx_num) , tx_type : "MINUS" }
				const filter = { _id : 0 , tx_items : 1 , Customer : 1 , tx_date : 1 , tx_owner : 1 , tx_id : 1 }
				const db = client.db( dbName );
				const col = db.collection( 'transactions' );

				const res = await col.find( query , { projection : filter } )
				.toArray()
				.then( data => {
					if ( data.length == 0 ) {
						log_msg( `/fetch_txdetail tx_num not found` , 'ERROR ' , request )
						return Promise.all( [ `Record Does not exist` ] )
					} else {
						data[0].tx_date = moment( data[0].tx_date , moment.ISO_8061 )
										.utcOffset( "+8:00" )
										.format( "YYYY-MM-DD hh:mm A" )
						log_msg( `/fetch_txdetail` , 'FETCH ' , request )
						return Promise.all( data )
					}
				})
				return Promise.all( res )
			})
			return ( typeof(retn[0]) == "string" ) 
				? h.response( { status : retn[0] } )
				: h.response( { status : retn } )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/fetch_employees' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				let query = { }
				let filter = { _id : 0 , password : 0 }
				const db = client.db( dbName );
				const user = db.collection( 'employees' );

				const res = await user.find( query , { projection : filter } )
				.toArray()
				.then( data => {
					log_msg( '/fetch_employees' , 'FETCH ' , request )
					return Promise.all( ( data.length == 0 ) ? [ `No Employees` ] : data )
				})
				return Promise.all( res )
			})
			return h.response( { status : retn } )
		}
	})

	server.route({
		method : 'PUT' , 
		path : '/add_employee' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const data = JSON.parse( request.payload )
				const hash = crypto.createHash( 'sha256' )
				hash.update( `${data.Username}_${data.Password}` )

				const db = client.db( dbName );
				const user = db.collection( 'employees' );
				const user_bulkop = user.initializeOrderedBulkOp();

				const res = await user.find( { username : data.Username } )
				.toArray()
				.then( async ( found ) => {
					if ( found.length == 0 ) {
						let insert = {
							username : data.Username,
							password : hash.digest( 'hex' ),
							name : data.Name,
							role : data.Role,
							active : true
						}

						user_bulkop.insert( insert )

						const res1 = await user_bulkop.execute().then( ( error , result ) => {
							if ( error.result.ok ) {
								log_msg( `/add_employee` , 'FETCH ' , request )
								return Promise.all( [ "OK" ] )
							} else {
								log_msg( `/add_employee ADDITION` , 'ERROR ' , request )
								return Promise.all( [ "Could not Add Employee" ] )
							}
						})
						return Promise.all( res1 )
					} else {
						return Promise.all( [ "Username is not unique" ] )
					}
				})
				return Promise.all( res )
			})
			return { status : retn[0] }
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/change_employee' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async() => {
				const db = client.db( dbName );
				const user = db.collection( 'employees' );
				const body = JSON.parse( request.payload )
				let action = ""
				let update = { role : body.role }

				const res = await user.find( { username : body.username } )
				.toArray()
				.then( async ( data ) => {
					if ( data[0].role == "admin" && update.role == "user" ) {
						action = "minus_admin"
					} else if ( data[0].role == "user" && update.role == "admin" ) {
						action = "add_admin"
					}

					if ( body.password != "---" ) {
						const hash = crypto.createHash( 'sha256' )
						hash.update( `${body.username}_${body.password}` )
						update[ "password" ] = hash.digest( 'hex' )
					}

					const res1 = await user.updateOne( { username : body.username } , { $set : update } )
						.then( ( error , result ) => {
							if ( error.result.ok ) {
								log_msg( `/change_employee` , 'FETCH ' , request )
								return Promise.all( [ "OK" , action ] )
							} else {
								log_msg( `/change_employee` , 'ERROR ' , request )
								return Promise.all( [ "Employee Update Failed" ] )
							}
						})
					return Promise.all( res1 )
					})
				return Promise.all( res )
			})
			return ( retn.length == 2 )
				? h.response( { status : retn[0] , action : retn[1] } )
				: h.response( { status : retn[0] } )
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/toggle_employee' ,
		handler : async ( request , h ) => {
			const retn = await connect.then( async () => {
				const data = JSON.parse( request.payload )
				let filter = { username : data.username }
				let set = { $set : { active : !(data.active) } }
				let action = ( data.active ) ? 'Reactivate' : 'Deactivate'

				const db = client.db( dbName );
				const user = db.collection( 'employees' );

				const res = await user.updateOne( filter , set )
				.then( ( error , result ) => {
					if ( error.result.ok ) {
						log_msg( '/toggle_employee' , 'FETCH ' , request )
						return Promise.all( [ "OK" ] )
					} else {
						log_msg( '/toggle_employee' , 'ERROR ' , request )
						return Promise.all( [ `Could not ${action} Employee` ] )
					}
				})
				return Promise.all( res )
			})
			return { status : retn[0] }
		}
	})

	server.route({
		method : 'GET' ,
		path : '/audit_search/{from}/{to}/{owner}/{item}' ,
		handler : async ( request , h ) => {
			let params = request.params
			const retn = await connect.then( async() => {
				const date = { $gte : new Date( `${params.from}T00:00:00.000Z` ) , $lte : new Date( `${params.to}T23:59:59.999Z` ) }
				const match = { tx_date : date }

				if ( params.owner != "NULL_F13LD" ) {
					match[ "tx_owner" ] = params.owner
				}

				if ( params.item != "NULL_F13LD" ) {
					match[ "tx_items" ] = { $elemMatch : { Name : params.item.replace( /\]/g , "/" ) } }
				}

				let pipline = [
					{ $match : match } ,
					{ $group :
						{ _id : { type : "$tx_type" }  ,
							tx_info : 
							{
								$push :
								{
									tx_items : "$tx_items" ,
									tx_owner : "$tx_owner" ,
									tx_id : "$tx_id" , 
									tx_date : "$tx_date"
								}
							}
						}
					}
				]

				const db = client.db( dbName );
				const txs = db.collection( 'transactions' );
				const bulkOp = txs.initializeOrderedBulkOp();

				const res = await txs.aggregate( pipline )
				.toArray()
				.then( async ( data ) => {
					return Promise.all( data )
				})
				return Promise.all( res )
			})
			return { status : retn }
		}
	})

	server.route({
		method : 'PUT' , 
		path : '/audit_edit/{tx_type}/{tx_id}/{tx_item}/{tx_qty}' ,
		handler : async ( request , h ) => {
			let params = request.params
			let res1 = null
			const retn = await connect.then( async () => {
				const db = client.db( dbName );
				const txs = db.collection( 'transactions' );
				const items = db.collection( 'items' );

				let filter = { tx_type : params.tx_type , tx_id : Number(params.tx_id) }
				let projection = { _id : 1 , tx_items : 1 }
				let idx = 0;

				const res = await txs.find( filter , { projection : projection } )
				.toArray()
				.then( async ( txs_found ) => {

					res1 = await items.find( { Name : params.tx_item } , { projection : { _id : 1 , Amount : 1 } } )
					.toArray()
					.then( async ( items_found ) => {
							for (var i = 0; i < txs_found[0].tx_items.length; i++) {
							if ( txs_found[0].tx_items[i].Name == params.tx_item ) {

								let remaining = ( params.tx_type == "ADD" )
									? Number( items_found[0].Amount ) - Number( params.tx_qty )
									: Number( items_found[0].Amount ) + Number( params.tx_qty )

								if ( remaining > 0 ) {
									txs_found[0].tx_items.splice( i , 1 )
					 				await items.updateOne( { Name : params.tx_item } , { $set : { Amount : Number( remaining ) } } )
					 				await txs.updateOne( filter , { $set : { tx_items : txs_found[0].tx_items } } )
					 				log_msg( `/audit_edit` , 'FETCH ' , request )
					 				return Promise.all( [ "OK" ] )
								} else {
									log_msg( `/audit_edit` , 'ERROR ' , request )
									return Promise.all( [ "[FAILED] Remaining Value will become lower than 0" ] )
								}

							}
						}
					})
					return Promise.all( res1 )
				})
				return Promise.all( res )
			})
			return { status : retn[0] }
		}
	})

	server.route({
		method : 'GET' , 
		path : '/test_get_curl' , 
		handler : ( request , h ) => {
			return Promise.all( [ "here" ] )
		}
	})

	server.route({
		method : 'PUT' ,
		path : '/test_parm/{test}' ,
		handler : ( request , h ) => {
			let params = request.params

			return Promise.all( [ `${params.test}` ] )
		}
	})

	server.route({
		method : 'GET' ,
		path : '/{route}' ,
		handler : ( request , h ) => {
			let params = request.params

			if ( params.route == "favicon.ico" ) {
				return 0
			} else {
				log_msg( `from ${params.route} to /` , 'REDIR ' , request )
				return h.redirect( '/' )
			}

		}
	})
	// routes

	// socket events
	socket_connect.on( 'connection', (socket) => {

	    notifier.on( 'deduct', ( change ) => {
	        socket.emit( 'deduct' , change );
	    });

	    notifier.on( 'addition' , ( change ) => {
	    	socket.emit( 'addition' , change )
	    });

	    notifier.on( 'newtx' , ( change ) => {
	    	socket.emit( 'newtx' , change )
	    })

	});
	// socket events

	await server.start()
	log_msg( `Started at ${server.info.uri}` , 'START ' )

}

process.on( 'unhandledRejection' , ( err ) => {
	console.log( err )
	process.exit( 1 )
})

check_db()

start()
