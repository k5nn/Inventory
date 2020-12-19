const precedence_test = ( incoming , incoming_char , op_stack , postfix_stack ) => {
	let current_rank = 0
	let do_comparison = true

	if ( ( /\^/g ).test( op_stack[ op_stack.length - 1 ] ) ) {
		current_rank = 5
	} else if ( ( /\*/g ).test( op_stack[ op_stack.length - 1 ] ) ) {
		current_rank = 4
	} else if ( ( /\//g ).test( op_stack[ op_stack.length - 1 ] ) ) {
		current_rank = 3
	} else if ( ( /\+/g ).test( op_stack[ op_stack.length - 1 ] ) ) {
		current_rank = 2
	} else if ( ( /\-/g ).test( op_stack[ op_stack.length - 1 ] ) ) {
		current_rank = 1
	} else if ( ( /\(/g ).test( op_stack[ op_stack.length - 1 ] ) ) {
		do_comparison = !do_comparison
		op_stack.push( incoming_char )
	}

	if ( do_comparison ) {
		if ( incoming > current_rank ) {
			op_stack.push( incoming_char )
		} else if ( incoming == current_rank ) {
			postfix_stack.push( op_stack[ op_stack.length - 1 ] )
			op_stack.pop()
			op_stack.push( incoming_char )
		} else {
			if ( op_stack.length == 0 ) {
				op_stack.push( incoming_char )
			}
			postfix_stack.push( op_stack[ op_stack.length - 1 ] )
			op_stack.pop();

			precedence_test( incoming , incoming_char , op_stack , postfix_stack )
			
		}
	}

	return op_stack
}

const convert_to_postfix = ( equation ) => {
	let expression=""
	let postfix_notation=[]
	let postfix_op_stack=[]

	for (var i = 0 ; i <= equation.length; i++) {

		if ( ( /[0-9\.]/g ).test( equation[i] ) ) {
			expression += equation[i]
		} else if ( ( /\(/g ).test( equation[i] ) ) {
			if ( expression != "" ) {
				postfix_notation.push( expression )
				expression = ""
			}

			postfix_op_stack.push( equation[i] )
		} else if ( ( /\)/g ).test( equation[i] ) ) {
			if ( expression != "" ) {
				postfix_notation.push( expression )
				expression = ""
			}

			for (var j = postfix_op_stack.length - 1; j >= 0; j--) {
				if ( ( /\(/g ).test(postfix_op_stack[ j ] ) ) {
					postfix_op_stack.pop()
					break
				} else {
					postfix_notation.push( postfix_op_stack[j] )
					postfix_op_stack.pop()
				}

			}
		} else if ( ( /[\+\-]/g ).test( equation[i] ) ) {
			if ( expression != "" ) {
				postfix_notation.push( expression )
				expression = ""
			}

			if ( postfix_op_stack.length == 0 ) {
				postfix_op_stack.push( equation[i] )
			} else {
				let incoming_rank = 0

				if ( ( /\^/g ).test( equation[i] ) ) {
					incoming_rank = 5
				} else if ( ( /\*/g ).test( equation[i] ) ) {
					incoming_rank = 4
				} else if ( ( /\//g ).test( equation[i] ) ) {
					incoming_rank = 3
				} else if ( ( /\+/g ).test( equation[i] ) ) {
					incoming_rank = 2
				} else {
					incoming_rank = 1
				}

				postfix_op_stack = precedence_test( incoming_rank , equation[i] , postfix_op_stack , postfix_notation )
			}
		} else if ( expression != "" ) {
			postfix_notation.push( expression )
			expression = ""
		}
	}

	for (var i = postfix_op_stack.length - 1; i >= 0; i--) {
		postfix_notation.push( postfix_op_stack[i] )
		postfix_op_stack.pop()
	}

	return postfix_notation
}

const convert_to_infix = ( postfix ) => {
	let infix_stack=[]
	let arr_percentages=[]

	for (var i = 0; i < postfix.length; i++) {
		if ( ( /[0-9]+/g ).test( postfix[i] ) ) {
			infix_stack.push( postfix[i] )
		} else if ( ( /[\+\-]/g ).test( postfix[i] ) ) {
			arr_percentages.push( postfix[i] + infix_stack[ infix_stack.length - 1 ] )
			infix_stack.pop()
		}
	}

	return arr_percentages
}

const calculate_percentages = ( baseVal , precentages ) => {
	let base = baseVal
	let change = 0

	for (var i = precentages.length - 1; i >= 0; i--) {
		change = Number( precentages[i] )
		base = ( base * ( 1 + ( change / 100 ) ) ) 
	}

	return base
}
