// Generating a generic Abstract Factory Method
// see https://github.com/robdodson/JavaScript-Design-Patterns/blob/master/factory/abstract-factory/main.js
// Elminates the need for most calls with "new" modifier, as well as passing variables as this.*
// See notes:
//			@requirements: required input values for functionality
//			@to-add: for info on where things may be missing at this time
//			@return for return values as a type from functions
//			//---DATABASE--- as items to move to database at a later time


// // LoanCalculator extension template: (use cmd + / to remove comment markers)
// // create nameOfCalculator from extended calculator
// // @requirements: 
// //				input_variable.thing >= that
// // @to-add: better functionality in the future
// LoanCalculator.nameOfCalculator = function(input_variable){
// 	//set variables for use by all functions
// 	var this_variable = input_variable.thing;

// 	//generate universal calculations based on any variables for use by all functions

// 	return fromPrototype(LoanCalculator, {
// 		//function call declaration
// 		// this function does a thing
// 		// @requirements: 
// 		//				input_variable.thing >= that
// 		// @to-add: better functionality in the future
// 		// @optional: things that may or may not be used
// 		// @return the_thing as a thing
// 		functionName: function(){
// 			var the_thing;
// 			//---DATABASE--- this item should be called from a databse in the future
// 			return the_thing;
// 		},
// 		//next function
// 		nextFunctionName: function(){}
// 	});
// };


// Polyfill for old browsers pre ES5
// see http://kangax.github.com/es5-compat-table/
if(!Object.create) {
	Object.create = function(object) {
		if (arguments.length > 1){
			throw new Error ('Object.create implementation only accepts the first parameter of the argument.');
		}
		function Function(){}
		Function.prototype = object;
		return new Function();
	}
}

// from Prototype function
// see http://yehudakatz.com/2011/08/12/understanding-prototypes-in-javascript/
var fromPrototype = function(prototype, object) {
	var newObject = Object.create(prototype);
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) { newObject[prop] = object[prop]; }
	}
	return newObject;
};

// global constants
var CentsPerDollar 				= 100;
var MonthsPerYear 				= 12;
var DefaultTermInYears 			= 30;
var DefaultDownPayment 			= 20000;
var DefaultInterestRate 		= 4.125;
var MinDTIPercent 				= 10;
var DefaultDTIPercent 			= 26;
var MaxDTIPercent 				= 50;
var NationalPropertyTaxAvg 		= 1.15;
var NationalInsuranceRateAvg 	= 0.8;
var LoantoValueRatio 			= 0.8;
var NationalPMIAvg				= 0.05;
var DefaultPropertyTaxState = "CA";

//property taxes by state
var annual_property_tax_table_2018 = {
	"AL"			: "0.43",
	"AK"			: "1.19",
	"AR"			: "0.77",
	"AZ"			: "0.63",
	"CA"			: "0.79",
	"CO"			: "0.57",
	"CT"			: "2.02",
	"DE"			: "0.55",
	"FL"			: "1.02",
	"GA"			: "0.93",
	"HI"			: "0.27",
	"ID"			: "0.76",
	"IL"			: "2.32",
	"IN"			: "0.87",
	"IA"			: "1.50",
	"KS"			: "1.40",
	"KY"			: "0.85",
	"LA"			: "0.51",
	"ME"			: "1.32",
	"MD"			: "1.10",
	"MA"			: "1.21",
	"MI"			: "1.71",
	"MN"			: "1.17",
	"MS"			: "0.80",
	"MO"			: "1.00",
	"MT"			: "0.85",
	"NE"			: "1.83",
	"NV"			: "0.77",
	"NH"			: "2.19",
	"NJ"			: "2.40",
	"NM"			: "0.76",
	"NY"			: "1.65",
	"NC"			: "0.86",
	"ND"			: "1.05",
	"OH"			: "1.56",
	"OK"			: "0.89",
	"OR"			: "1.07",
	"PA"			: "1.55",
	"SC"			: "0.57",
	"SD"			: "1.32",
	"TN"			: "0.75",
	"TX"			: "1.86",
	"UT"			: "0.67",
	"VT"			: "1.78",
	"VA"			: "0.79",
	"WA"			: "1.06",
	"WV"			: "0.59",
	"WI"			: "1.95",
	"WY"			: "0.61"
};


	// if a variable LTV is required, that can be created here
	// var VariableLTVRatio = [
	// 	{ratio: 0.90, pmi: 0.0050},
	// 	{ratio: 0.75, pmi: 0.0025},
	// 	{ratio: 0.60, pmi: 0.0005}
	// ];

// define generic Calculator base object
// months go from 0 to 11 in javascript, make sure to account for this by subtracting 1 from any user entered data
var LoanCalculator = {
	dateCreation: function(startDate){
		if(!startDate){ startDate = new Date(); }
		var day = startDate.getDate();
		//if this is a new calculation, add 1 month to todays date
		checker = new Date();
		if( (startDate.getFullYear() == checker.getFullYear()) && (startDate.getMonth() == checker.getMonth()) ){
			startDate.setMonth(startDate.getMonth() + 2);
		}
		var month = startDate.getMonth();
		var year = startDate.getFullYear();
		return {'day': day, 'month': month, 'year': year};
	}
};

// create MortgageCalculator from extended calculator
// @requirements: 
//				loan_amount > 0
//				interest_rate >= 0
//				term_in_years > 0
// @to-add: VariableLTVRatio
LoanCalculator.createMortgageCalculator = function(object){

	// set values for calculations
	var total_loan_amount             = parseInt(object.loan_amount); 
	var loan_cashout                  = parseInt(object.cashout_amount) || 0;
	total_loan_amount                 += loan_cashout;
	var interest_rate                 = parseFloat(object.interest_rate);
	var term_in_years                 = parseInt(object.term_in_years);
	var listed_house_value            = parseInt(object.listed_house_value) || total_loan_amount;
	var down_payment                  = parseInt(object.down_payment) || 0;
	var lender_fees                   = parseInt(object.lender_fees) || 0;
	var additional_payment            = parseFloat(object.additional_payment) || 0;
	var primary_mortgage_insurance    = parseFloat(object.primary_mortgage_insurance) || NationalPMIAvg;
	var annual_property_insurance_rate= parseFloat(object.annual_property_insurance_rate) || NationalInsuranceRateAvg;
	var annual_hoa_fee                = parseInt(object.annual_hoa_fee) || 0;
	var loan_state 										= object.state || DefaultPropertyTaxState;
	loan_state 												= loan_state.toUpperCase();
	
	var annual_property_tax_rate 			= parseFloat(object.annual_property_tax_rate) || NationalPropertyTaxAvg;
	if(annual_property_tax_rate == 0 || loan_state != "NONE"){
		annual_property_tax_rate 	  		= parseFloat(annual_property_tax_table_2018[loan_state]) || NationalPropertyTaxAvg;
	}
	
	if('property_tax' in object){
		var annual_property_tax                   = parseFloat(object.property_tax) || 0;
	} else {
		var annual_property_tax                   = Math.round((annual_property_tax_rate / 100) * listed_house_value);
	}

	if('property_insurance' in object){
		var annual_property_insurance             = parseFloat(object.property_insurance) || 0;
	} else {
		var annual_property_insurance             = ((annual_property_insurance_rate / 100) * listed_house_value);
	}

	// calculate full loan_amount
	var loan_amount                               = total_loan_amount - down_payment + lender_fees;
	// generate principal_in_cents as P
	var principal_in_cents                        = Math.round(CentsPerDollar * loan_amount);
	// generate monthly_interest_rate as r
	var monthly_interest_rate                     = (interest_rate / 100) / MonthsPerYear;
	// generate term_in_months as N
	var term_in_months                            = term_in_years * MonthsPerYear;
	// generate effective_annual_rate as E where E= (1+r)^N-1
	var effective_annual_rate                     = parseFloat(Math.pow( 1+monthly_interest_rate, term_in_months ) - 1);
	// generate additional_payment_in_cents
	var additional_payment_in_cents               = Math.round(CentsPerDollar * additional_payment);
	// generate monthly_property_tax
	var annual_property_tax_in_cents              = Math.round( (annual_property_tax || annual_property_tax) * 100);
	var monthly_property_tax_in_cents             = Math.round(annual_property_tax_in_cents / MonthsPerYear);
	// generate monthly_property_insurance
	var monthly_property_insurance_in_cents       = Math.round( (annual_property_insurance * CentsPerDollar) / MonthsPerYear );
	// generate monthly_hoa_fee_in_cents
	var monthly_HOA_dues_in_cents                 = Math.round( (annual_hoa_fee * CentsPerDollar) / MonthsPerYear );
		
	return fromPrototype(LoanCalculator, {
		// test created variables
		//test_output : function(){
		// 	console.log("Initial Loan: $" + loan_amount);
		//},

		// calculate base monthly_payment on a loan based on object parameters
		// @requirements: 
		//				loan_amount > 0
		//				interest_rate >= 0
		//				term_in_years > 0
		// @optional: additional_payment_in_cents
		// @return: monthly_payment in dollars, property_tax monthly in dollars
		baseMonthlyPayment: function(){
			var monthly_payment = [];
			//verify required values exist and build function
			if( !('loan_amount' in object) || !('interest_rate' in object) || !('term_in_years' in object) ){
				console.error("One of the required variables in missing in call to createMortgageCalculator.monthlyPayment");
				return 0;
			}

			//verify that required values can give proper output
			if( isNaN(loan_amount) || isNaN(interest_rate) || isNaN(term_in_years) ){
				console.error("Wrong variable types in call to createMortgageCalculator.monthlyPayment");
				return 0;
			}

			// monthly payment defined as (from wikipedia):
			// if r=0, payment = P/N
			// else payment = (r*P*(E+1)/(E)
			monthly_payment.total = additional_payment_in_cents;
			if(monthly_interest_rate <= 0){
				monthly_payment.total += Math.round(principal_in_cents / monthly_interest_rate);
			} else {
				monthly_payment.total += Math.round(
					(monthly_interest_rate * principal_in_cents * (effective_annual_rate + 1)) / 
					(effective_annual_rate) )
			}
			
			// convert monthly payment to dollars
			monthly_payment.total /= CentsPerDollar;
			monthly_payment.property_tax = Math.round((annual_property_tax_rate * listed_house_value / MonthsPerYear)/CentsPerDollar);
			monthly_payment.pmi = Math.round(((primary_mortgage_insurance/100 * principal_in_cents)/MonthsPerYear)/CentsPerDollar);

			return monthly_payment;
		},

		// calculate the additional fees that are monthly payments but are not part of the mortgage payment
		// some of these calculations are redundant
		// @requirements:
		//				monthly_property_tax_in_cents
		//				monthly_property_insurance_in_cents
		//				monthly_HOA_dues_in_cents
		// @optional:
		// 				primary_mortgage_insurance
		// 				primary_mortgage_insurance
		// 				principal_in_cents
		// @return additional_fees as itemized fees and a sum of those fees
		addMonthlyPayment: function(){
			additional_fees = {};

			// store monthly_property_tax_in_cents
			additional_fees.monthly_property_tax_in_cents = monthly_property_tax_in_cents;
			// store monthly_property_insurance_in_cents
			additional_fees.monthly_property_insurance_in_cents = monthly_property_insurance_in_cents;
			// store monthly_HOA_dues_in_cents
			additional_fees.monthly_HOA_dues_in_cents = monthly_HOA_dues_in_cents;

			// calculate monthly payment of pmi if required
			var pmi_per_month_in_cents = 0;
			if(primary_mortgage_insurance > 0){ pmi_per_month_in_cents = (primary_mortgage_insurance * principal_in_cents)/12/100; }
			additional_fees.pmi_per_month_in_cents = pmi_per_month_in_cents;

			//calculate total_fees due based on all stored values
			var total_fees_in_cents = 0;
			for(var key in additional_fees){
				total_fees_in_cents += additional_fees[key];
			}
			additional_fees.total_fees = total_fees_in_cents / CentsPerDollar;
			return additional_fees;
		},

		// create an object to hold a payment, inner function usage
		storePayment: function(principal_remaining_in_cents, principal_paid_in_cents, interest_paid_in_cents, additional_fees, current_month, current_year){
			return {
				principal_remaining: Math.round(principal_remaining_in_cents) / 100,
				principal_paid     : Math.round(principal_paid_in_cents) / 100,
				interest_paid      : Math.round(interest_paid_in_cents) / 100,
				additional_fees    : Math.round(additional_fees) / 100,
				monthly_payment    : Math.round(principal_paid_in_cents + interest_paid_in_cents + additional_fees) / 100,
				current_month      : current_month,
				current_year       : current_year,
			};
		},

		// store payment schedule (this prevents a stack overflow), inner function usage
		storePaymentSchedule: function(loan, payments)
		{
			return {
				loan: loan,
				payments: payments,
			};
		},

		// create a monthly dimensional array of all payments to be made on the loan
		// @requirements: all requirements of Calculator.createMortgageCalculator->baseMonthlyPayment and addMonthlyPayment
		// @return return_data as an array of all payments and subvalue calculations per payment
		paymentSchedule: function(){

			// build variables for calculations
			// if dates are not supplied, use next month
			if(!('start_year' in object) || !('start_month' in object) || !('start_day' in object)){
				var date = this.dateCreation();
			} // else use dates specified
			else {
				start_year = parseInt(object.start_year);
				start_month = parseInt(object.start_month);
				start_day = parseInt(object.start_day);

				// check dates specified are valid and build date
				if(isNaN(start_year) || isNaN(start_month) || isNaN(start_day)){
					console.error("Wrong variable types for dates sent to createMortgageCalculator.paymentSchedule");
					return 0;
				} else {
					var date = new Date( object.start_year, object.start_month, object.start_day );
					date = this.dateCreation(date);
				}
			}
			
			// build object to hold payment schedule
			var payments = {};

			// build array as object
			for(var i = date.year; i <= date.year + term_in_years; ++i){
				payments[i] = {};
				for(var j = 1; j <= MonthsPerYear; ++j){
					payments[i][j] = [];
				}
			}
			
			var current_year = date.year;
			// start month is 1 month after this one
			var current_month = date.month++;
			if(current_month > MonthsPerYear){
				current_month = 1;
				current_year++;
			}
			var current_principal = principal_in_cents;

			// get monthly_payment from Calculator.createMortgageCalculator->baseMonthlyPayment()
			var base_monthly = this.baseMonthlyPayment();
			var monthly_payment_in_cents = Math.round(base_monthly.total * 100);

			//get additional payments if required
			var additional_fees = this.addMonthlyPayment();

			// get pmi_per_month_in_cents
			var pmi_per_month_in_cents = additional_fees.pmi_per_month_in_cents;

			// formula based on function found on wikipedia
			for(var months = 0; months < term_in_months; months++){
				// calculate whether pmi is still paid
				// this is where variable pmi table would be used
				if(current_principal <= (LoantoValueRatio * total_loan_amount*CentsPerDollar)){ pmi_per_month_in_cents = 0; }

				// calculate additional_items_in_cents paid for this month
				var additional_items_in_cents = monthly_property_insurance_in_cents + monthly_property_tax_in_cents + pmi_per_month_in_cents;
				// get interest_paid_in_cents for this month
				var interest_paid_in_cents = Math.round(current_principal * monthly_interest_rate);
				// get principal_paid_in_cents this month
				var principal_paid_in_cents = monthly_payment_in_cents - interest_paid_in_cents;

				if(principal_paid_in_cents > current_principal){ principal_paid_in_cents = current_principal; }

				// remove amount of principal_paid_in_cents from the current_principal to get the new principal owed
				current_principal -= 			principal_paid_in_cents;

				// save the payment made to return
				var payment = this.storePayment(
					current_principal, 
					principal_paid_in_cents, 
					interest_paid_in_cents, 
					additional_items_in_cents, 
					current_month, 
					current_year
				);
				payments[current_year][current_month].push(payment);

				// check to see if payments are complete
				if(current_principal <= 0){ break; }

				// increase month and year as required
				current_month++;
				if(current_month > MonthsPerYear){
					current_month = 1;
					current_year++;
				}
			}

			var return_data = this.storePaymentSchedule( this, payments );

			return return_data;
		}

	});
};

// create RefinanceCalculator from extended calculator
// @requirements: all functional requirements found in LoanCalculator.createMortgageCalculator
// @to-add: break-even data in month output
LoanCalculator.createRefinanceCalculator = function(original_mortgage, new_mortgage){
	// get data of payments for:
	// original_mortgage
	var mortgage_calc             = LoanCalculator.createMortgageCalculator(original_mortgage);
	var original_payment_schedule = mortgage_calc.paymentSchedule();
	var original_monthly_payment  = mortgage_calc.baseMonthlyPayment();

	// get today's date and use it to calculate how much has been paid so far
	var date           = new Date();
	var today          = {};
	today.year         = date.getFullYear();
	today.month        = date.getMonth();
	var last_payment   = original_payment_schedule.payments[today.year][today.month];
	var principal_owed = Math.round(last_payment[0].principal_remaining);

	// new_mortgage may be based on old mortgage
	new_mortgage.cashout_amount                 = parseInt(new_mortgage.cashout_amount) || 0;
	new_mortgage.loan_amount 					= parseInt(new_mortgage.loan_amount) || principal_owed;
	new_mortgage.listed_house_value 			= original_mortgage.listed_house_value;
	new_mortgage.interest_rate 					= parseFloat(new_mortgage.interest_rate) || 0;
	new_mortgage.term_in_years 					= parseInt(new_mortgage.term_in_years) || parseInt(original_mortgage.term_in_years);
	new_mortgage.primary_mortgage_insurance		= parseFloat(new_mortgage.primary_mortgage_insurance) || parseFloat(original_mortgage.primary_mortgage_insurance);
	new_mortgage.annual_property_tax			= parseFloat(new_mortgage.property_tax) || parseFloat(original_mortgage.property_tax);
	new_mortgage.annual_property_insurance		= parseFloat(new_mortgage.property_insurance) || parseFloat(original_mortgage.property_insurance);
	new_mortgage.lender_fees					= parseFloat(new_mortgage.lender_fees) || 0;

	return fromPrototype(LoanCalculator, {

		// get the current number of months the original loan has been paid on, inner function usage
		// @return months as integer
		getLoanAge: function(object){
			var months;

			months = ( today.year - object.start_year ) * 12;
			months += today.month - object.start_month + 1;

			return months <= 0 ? 0 : months
		},

		// calculate mortgage paymentSchedule, inner function usage
		// @return mortgage_calc.paymentSchedule() as array
		getPaymentSchedule: function(mortgage){
			mortgage_calc = LoanCalculator.createMortgageCalculator(mortgage);
			return mortgage_calc.paymentSchedule();
		},

		// calculate new_mortgage monthlyPayment, inner function usage
		// @return mortgage_calc.baseMonthlyPayment() as integer
		getMonthlyPayment: function(mortgage){
			mortgage_calc = LoanCalculator.createMortgageCalculator(mortgage);
			return mortgage_calc.baseMonthlyPayment();
		},

		// get new_mortgage APR, inner function usage
		// @return apr_calc.getAPR() as float
		getAPR: function(mortgage){
			apr_calc = LoanCalculator.createAPRCalculator(mortgage);
			return apr_calc.getAPR();
		},

		// get breakEvenValues, inner function usage
		// break even values are the number of months it takes to break even
		// on payments with a new mortgage to equal the amounts of an old mortgage.
		// These values are estimates, and should only be considered theoretical.
		// @requirements:
		// @return results as array of results in number of months
		getBreakevenValues: function(){
			var results 						= {};

			var lender_fees 					= new_mortgage.lender_fees;
			var new_monthly_payment 			= this.getMonthlyPayment(new_mortgage);
			var old_monthly_payment 			= original_monthly_payment;

			// calculate monthly_payment_breakeven as lender_fees / (old_monthly_payment - new_monthly_payment)
			results.monthly_payment_breakeven = Math.round( lender_fees / (old_monthly_payment - new_monthly_payment) );

			// calculate interest_expense_breakeven as number of months until:
			// amount of interest saved < lender_fees paid
			var original_payment_schedule 		= this.getPaymentSchedule(original_mortgage);
			var new_payment_schedule			= this.getPaymentSchedule(new_mortgage);
			//calculate all past interest paid
			var original_interest_paid 			= 0;
			var date 							= this.dateCreation();
			var it_month 						= date.month;
			var it_year 						= date.year;
			var end_year 						= date.year + new_mortgage.term_in_years;
			// var counter = 0;
			// //cost of insurance of original_mortgage into the future = lender_fees + cost of insurance of original_mortgage new_mortgage into the future
			// //from original year up to this year
			// for( it_year; it_year < today.year; ++it_year){
			// 	for( it_month; it_month <= MonthsPerYear; ++it_month ){
			// 		original_interest_paid += original_payment_schedule.payments[it_year][it_month][0].interest_paid;
			// 		counter++;
			// 	}
			// 	it_month = 1;
			// }
			// //from beginning of this year to this month
			// for( it_month; it_month <= today.month; ++it_month ){
			// 	original_interest_paid += original_payment_schedule.payments[it_year][it_month][0].interest_paid;
			// 	counter++;
			// }
			//while sum of interest_saved < lender_fees, calculate interest for the next month and keep a count
			//it_month and it_year are set to the first payment date of the new_mortgage
			var new_interest_paid = 0;
			var interest_saved = 0;
			var interest_expense_breakeven = 0;
			var end_count = new_mortgage.term_in_years * MonthsPerYear;
			while (it_year <= end_year && interest_expense_breakeven < end_count ){
				//calculate interest saved
				if(original_payment_schedule.payments[it_year][it_month][0].interest_paid){
					original_interest_paid += original_payment_schedule.payments[it_year][it_month][0].interest_paid;
				}
				new_interest_paid += new_payment_schedule.payments[it_year][it_month][0].interest_paid;
				interest_saved = original_interest_paid - new_interest_paid;
				//compare lender_fees to interest_saved
				if(interest_saved > lender_fees){ break; }

				//increase counters
				interest_expense_breakeven++;
				if(it_month == 12) it_month = 1; else it_month++;
				if(it_month == 1) it_year++;
			}
			results.interest_expense_breakeven = interest_expense_breakeven;

			// calculate pay_down_existing_mortgage as the amount of time it takes for the difference in payments between the new_mortgage and a reamortized version of the original mortgage to cover the cost of refinancing the mortgage
			var pay_down_existing_mortgage = 0;
			//set reamortized_mortgage as copy of existing original_mortgage
			var reamortized_mortgage = Object.assign({}, original_mortgage);
			//change variables of the original_mortgage and treat as a new mortgage
			reamortized_mortgage.loan_amount = new_mortgage.loan_amount - lender_fees;
			delete reamortized_mortgage.start_year;
			delete reamortized_mortgage.start_month;
			delete reamortized_mortgage.start_day;
			reamortized_mortgage.term_in_years = original_mortgage.term_in_years;
			//calculate time as lender_fees / new monthly payment differences
			var reamortized_monthly_payment = this.getMonthlyPayment(reamortized_mortgage);
			results.reamortized_monthly_payment = Math.round( lender_fees / (reamortized_monthly_payment - new_monthly_payment) );

			return results;
		},

		// get results of new_mortgage calculations
		// @return results as array of results
		getResults: function(){
			var results = {};

			// basic information
			results.original_loan_age_in_months 	= this.getLoanAge(original_mortgage);
			results.original_monthly_payment 		= original_monthly_payment;
			results.original_principal_owed 		= principal_owed;
			results.new_monthly_payment 			= this.getMonthlyPayment(new_mortgage);
			results.new_loan_amount 				= new_mortgage.loan_amount + new_mortgage.lender_fees + new_mortgage.cashout_amount;
			results.lender_fees 					= new_mortgage.lender_fees;
			results.new_apr 						= this.getAPR(new_mortgage);
			results.break_even_values 				= this.getBreakevenValues();

			// basic analysis
			// difference in monthly payments old - new
			results.difference_in_monthly_payment 	= Math.round( (results.original_monthly_payment - results.new_monthly_payment) * 100) / 100;

			// decrease in costs during time in house as short_term_savings = future_years_in_home * difference_in_monthly_payment * 12
			results.short_term_savings 				= Math.round( new_mortgage.future_years_in_home * results.difference_in_monthly_payment * MonthsPerYear );

			// difference in lifetime cost = new_loan_total_cost + original_loan_paid_amount - original_loan_total_cost
			var original_loan_total_cost 			= Math.round( original_mortgage.term_in_years * results.original_monthly_payment * MonthsPerYear );
			var original_loan_amount_paid 			= results.original_loan_age_in_months * results.original_monthly_payment;
			var new_loan_total_cost 				= new_mortgage.term_in_years * results.new_monthly_payment * MonthsPerYear;
			results.difference_in_lifetime_cost 	= Math.round( new_loan_total_cost + original_loan_amount_paid - original_loan_total_cost );

			// increased_time = new_term - old_term + years paid with old term
			var years_paid							= today.year - original_mortgage.start_year;
			results.increased_time 					= new_mortgage.term_in_years - original_mortgage.term_in_years + years_paid;

			return results;
		}

	});
	
};

// create APRCalculator from extended calculator
// requirements: 
//				loan_amount > 0, 
//				loan_amount + lender_fees - down_payment > 0
LoanCalculator.createAPRCalculator = function(object){

	// verify values to use in calculation
	var loan_amount = parseInt(object.loan_amount) || 0;
	var lender_fees = parseInt(object.lender_fees) || 0;
	var down_payment = parseInt(object.down_payment) || 0;

	return fromPrototype(LoanCalculator, {
	
		// calculate theoretical new APR based on adjusted values
		getAPR: function(){
			var loan_APR = 0

			if(loan_amount <= 0){
				console.error("Nothing to calculate in LoanCalculator.createAPRCalculator.");
				return 0;
			}

			// calculate calculated_principal as P
			var calculated_principal = loan_amount + lender_fees - down_payment;

			if(calculated_principal <= 0){
				console.error("Nothing to calculate in LoanCalculator.createAPRCalculator.");
				return 0;
			}

			// get interest_rate as r
			var interest_rate = parseFloat(object.interest_rate) || 0;
			interest_rate /= 100;
			if(interest_rate <= 0){
				console.warn("Interest rate incorrect for LoanCalculator.createAPRCalculator.");
				return 0;
			}

			// get term_in_years as t
			var term_in_years = parseInt(object.term_in_years) || 0;
			if(term_in_years <= 0){
				console.warn("Term incorrect for LoanCalculator.createAPRCalculator.");
				return 0;
			}

			// calculate entire amount to be paid
			// calculation from https://www.math.nmsu.edu/~pmorandi/math210gs99/InterestRateFormulas.html
			// total_paid as A = P(1+r)^t
			var total_paid = Math.round( calculated_principal * Math.pow( 1 + interest_rate, term_in_years) );

			// calculate loan_APR from total calculated
			// r = (A/P)^(1/t)-1 where P is the initial loan_amount
			loan_APR = Math.pow( ((total_paid+9282) / loan_amount ) , (1 / term_in_years) ) - 1;
			loan_APR = Math.round(loan_APR * 100000) / (1000);

			return loan_APR;
		}
	});
};


// create createIncomeTaxCalculator from extended calculator
LoanCalculator.createIncomeTaxCalculator = function(object){
	//---DATABASE---
	//build tax_table_2018 as generic tax values for this year 
	var tax_table_2018 = [];
	tax_table_2018.fica = "7.65";
	tax_table_2018.single = {
		"deduction" 	: "12000",
		"exemption" 	: "0",
		"10" 			: "9525",
		"12" 			: "38700",
		"22" 			: "82500",
		"24" 			: "157500",
		"32" 			: "200000",
		"35" 			: "500000",
		"37" 			: "0"
	};
	tax_table_2018.married_jointly = {
		"deduction" 	: "24000",
		"exemption" 	: "0",
		"10" 			: "19050",
		"12" 			: "77400",
		"22" 			: "165000",
		"24" 			: "315000",
		"32" 			: "400000",
		"35" 			: "600000",
		"37" 			: "0"
	};
	tax_table_2018.married_separately = {
		"deduction" 	: "12000",
		"exemption" 	: "0",
		"10" 			: "9535",
		"12" 			: "38700",
		"22" 			: "82500",
		"24" 			: "157500",
		"32" 			: "200000",
		"35" 			: "300000",
		"37" 			: "0"
	};
	tax_table_2018.head = {
		"deduction" 	: "18000",
		"exemption" 	: "0",
		"10" 			: "13600",
		"12" 			: "51800",
		"22" 			: "82500",
		"24" 			: "157500",
		"32" 			: "200000",
		"35" 			: "500000",
		"37" 			: "0"
	};

	//set variables for use by all functions
	var annual_income = object.annual_income;
	var tax_file_type = object.tax_file_type;


	return fromPrototype(LoanCalculator, {

		// getAnnualIncomeTax will calculate the annual income tax of an individual based on the tax table
		// as well as the specific individual's tax file type and their annual income
		// @requirements
		//				tax_file_type
		//				annual_income
		// @return annual_income_tax as an integer
		getYearlyIncomeTax: function(){
			var annual_income_tax      = 0;

			var temp_income            = annual_income - parseFloat(tax_table_2018[tax_file_type]["deduction"]) - parseFloat(tax_table_2018[tax_file_type]["exemption"]);
			var tax_rate               = 0;
			var taxable_max            = 0;
			var taxed_amount_of_income = 0;

			//compute annual_income_tax from tax_table_2018[tax_file_type]
			for(var rate in tax_table_2018[tax_file_type]){
				if( !isNaN(parseFloat(rate)) ){
					tax_rate = parseFloat(rate) / 100;
					taxable_max = parseFloat(tax_table_2018[tax_file_type][rate]);
					if(temp_income > taxable_max){
						taxed_amount_of_income 	= taxable_max;
						temp_income 			-= taxed_amount_of_income;
					} else {
						taxed_amount_of_income 	= temp_income;
						temp_income 			= 0;
					}
					annual_income_tax 			+= taxed_amount_of_income * tax_rate;
				}
			}
			//compute tax for fica
			tax_rate 							= parseFloat(tax_table_2018.fica) / 100;
			annual_income_tax 					+= annual_income * tax_rate;

			if(annual_income_tax < 0){
				annual_income_tax = 0;
			} 

			return annual_income_tax;
		}
	})

}


// create createPrincipalCalculator from extended calculator
LoanCalculator.createPrincipalCalculator = function(object){
	return fromPrototype(LoanCalculator, {
		//calculate the principal investment of a loan based on term_in_years and mortgage_rate
		// @requirements:
		//				monthly_payment
		//				term_in_years
		//				mortgage_rate
		// @optional:
		//				annual_property_tax
		//				annual_property_tax_rate
		//				annual_property_insurance
		//				annual_property_insurance_rate
		//				annual_hoa_fees
		getPrincipal: function(){
			var principal = 0;
			//set required variables
			if( isNaN(object.monthly_payment) || isNaN(object.term_in_years) || isNaN(object.mortgage_rate) ){
				console.error("Incorrect variable types used in getPrincipal() function of LoanCalculator.createPrincipalCalculator.");
				return principal;
			}
			var monthly_payment = object.monthly_payment;
			var term_in_years = object.term_in_years;
			var mortgage_rate = object.mortgage_rate;
			//calculate monthly_property_tax
			if( isNaN(object.annual_property_tax_rate) && isNaN(object.annual_property_tax) ){
				var monthly_property_tax = (monthly_payment / (1 + (NationalPropertyTaxAvg / 100))) / MonthsPerYear;
			} else if (object.annual_property_tax > 0) {
				var monthly_property_tax = object.annual_property_tax / MonthsPerYear;
			} else if (object.annual_property_tax_rate > 0) {
				var monthly_property_tax = (monthly_payment / (1 + (object.annual_property_tax_rate / 100))) / MonthsPerYear;
			} else {
				var monthly_property_tax = 0;
			}
			//calculate monthly_property_insurance
			if( isNaN(object.annual_property_insurance_rate) && isNaN(object.annual_property_insurance) ){
				var monthly_property_insurance = (monthly_payment / (1 + (NationalInsuranceRateAvg / 100))) / MonthsPerYear;
			} else if (object.annual_property_insurance > 0) {
				var monthly_property_insurance = object.annual_property_insurance / MonthsPerYear;
			} else if (object.annual_property_insurance_rate > 0) {
				var monthly_property_insurance = (monthly_payment / (1 + (object.annual_property_insurance_rate / 100))) / MonthsPerYear;
			} else {
				var monthly_property_insurance = 0;
			}
			if( monthly_property_tax == 0 || monthly_property_insurance == 0){
				console.warn("Using values of 0 in getPrincipal() function of LoanCalculator.createPrincipalCalculator can cause greatly underestimated results.");
			}
			//calculate monthly_hoa_fees
			if( isNaN(object.annual_hoa_fees) ){
				var monthly_hoa_fees = 0;
			} else{
				var monthly_hoa_fees = object.annual_hoa_fees / MonthsPerYear;
			}

			//calculate a modified monthly payment based on other payments as P
			var new_monthly_payment = monthly_payment - monthly_property_insurance - monthly_property_tax - monthly_hoa_fees;

			//calculate principal loan amount as A = P/r * (1 - (1+r)^(-t)) where r = mortgage_rate / 12 / 100 and t = term_in_months
			var monthly_interest_rate = mortgage_rate / MonthsPerYear / 100;
			var term_in_months = term_in_years * MonthsPerYear;
			principal = Math.round( ( new_monthly_payment / monthly_interest_rate ) * ( 1 - Math.pow( 1 + monthly_interest_rate, -term_in_months) ) );
			if(object.down_payment > 0){
				principal = Math.round(principal + object.down_payment);
			}else if(object.down_percent > 0){
				principal = Math.round(principal / (1 - (object.down_percent/100)));
			}
			return principal;
		}
	});
}


// create createHomeAffordabiltyCalculator from extended calculator
// to-add: better functionality in the future
LoanCalculator.createHomeAffordabiltyCalculator = function(object){

	//set tax_file_type to default if not set by user
	if(	object.tax_file_type == "single" || object.tax_file_type == "married_jointly" || object.tax_file_type == "married_separately" || object.tax_file_type == "head" ){
		var tax_file_type = object.tax_file_type;
	} else {
		var tax_file_type = "single"; //set default
		console.warn("No tax_file_type found for LoanCalculator.createHomeAffordabiltyCalculator, using default value of 'single'.");
	}

	//set mortgage_rate to default if not set by user
	var mortgage_rate = parseFloat(object.mortgage_rate) || DefaultInterestRate;
	//set down_payment to default if not set by user
	var down_payment = parseInt(object.down_payment) || 0;
	var down_percent = parseInt(object.down_percent) || 0;
	//set DTU to default if not set by user
	var desired_dti = parseFloat(object.desired_dti) || DefaultDTI;
	//set term_in)years to default if not set by the user
	var term_in_years = parseInt(object.term_in_years) || DefaultTermInYears;
	//set taxes on the property to default rate if not set by user
	var loan_state = object.state || DefaultPropertyTaxState;
	loan_state = loan_state.toUpperCase();
	var annual_property_tax = parseInt(object.annual_property_tax) || 0;
	var annual_property_tax_rate = parseFloat(object.annual_property_tax_rate) || NationalPropertyTaxAvg;
	if(annual_property_tax_rate == 0 || loan_state != "NONE"){
		annual_property_tax_rate 	  = parseFloat(annual_property_tax_table_2018[loan_state]) || NationalPropertyTaxAvg;
	}
	if( annual_property_tax <= 0 ){
		var listed_house_value = parseInt(listed_house_value) || 0;
		annual_property_tax = (listed_house_value * annual_property_tax_rate / 100) || 0;
	}
	//set annual_property_insurance if not set by the user to default values
	var annual_property_insurance = parseInt(object.annual_property_insurance) || 0;
	var annual_property_insurance_rate = parseFloat(object.annual_property_insurance_rate) || NationalInsuranceRateAvg;
	if( annual_property_insurance <= 0 ){
		var listed_house_value = parseInt(listed_house_value) || 0;
		annual_property_insurance = (listed_house_value * annual_property_insurance_rate / 100) || 0;
	}

	return fromPrototype(LoanCalculator, {

		// getMonthlyBudget will calculate a breakdown of the monthly budget
		// @requirements: 
		//				annual_income > 0
		//				monthly_expenses >= 0
		//				down_payment >=0
		// @to-add: desired_dti >=MinDTIPercent && <=MaxDTIPercent
		// @return monthly_budget_breakdown as array of integers 
		getMonthlyBudget: function(){
			var monthly_budget_breakdown = {};

			//verify requirements
			if( !('annual_income' in object) || !('monthly_expenses' in object)){
				console.error("Variables not provided for getMonthlyBudget() in LoanCalculator.createHomeAffordabiltyCalculator.");
				return 0;
			} else {
				var annual_income = parseInt(object.annual_income);
				var monthly_expenses = parseInt(object.monthly_expenses) || 0;
			}
			if( annual_income < (monthly_expenses*MonthsPerYear) ){
				console.error("Monthly expenses exceed annual income for getMonthlyBudget() in LoanCalculator.createHomeAffordabiltyCalculator. ")
				return 0;
			}
			//verify variables are corrent type and value
			if( isNaN(annual_income) || isNaN(monthly_expenses) || isNaN(down_payment) || isNaN(desired_dti) ){
				console.error("Variables are wrong type for getMonthlyBudget() in LoanCalculator.createHomeAffordabiltyCalculator.");
				return 0;
			} else if( (annual_income <= 0) || (monthly_expenses < 0) || (down_payment < 0) || (desired_dti < MinDTIPercent) || (desired_dti > MaxDTIPercent) ){
				console.warn("Incorrect values for getMonthlyBudget() in LoanCalculator.createHomeAffordabiltyCalculator.");
				return 0;
			}

			//calculate monthly_budget as annual_income / MonthsPerYear
			monthly_budget_breakdown.monthly_budget = Math.round(annual_income / MonthsPerYear);
			monthly_budget_breakdown.monthly_expenses = monthly_expenses;

			//calculate monthly_income_tax as annual_income_tax / MonthsPerYear
			monthly_budget_breakdown.monthly_income_tax = this.getMonthlyIncomeTax(annual_income, tax_file_type);

			//saved for future use
			//var current_dti = Math.round( (monthly_budget_breakdown.monthly_expenses + monthly_budget_breakdown.monthly_income_tax) / monthly_budget_breakdown.monthly_budget * 100);
			
			//calculate amount of monthly mortgage based on DTI
			var monthly_to_spend = monthly_budget_breakdown.monthly_budget * desired_dti / 100;
			if(monthly_to_spend < 0){
				console.error("negative number computed for getMonthlyBudget in LoanCalculator.createHomeAffordabiltyCalculator.");
				return 0;
			}
			monthly_budget_breakdown.monthly_mortgage_payment = Math.round(monthly_to_spend - monthly_budget_breakdown.monthly_expenses);

			//store already calculated values
			monthly_budget_breakdown.monthly_property_tax = Math.round(annual_property_tax / MonthsPerYear);
			monthly_budget_breakdown.monthly_free_money = Math.round( 
				monthly_budget_breakdown.monthly_budget 
				- monthly_budget_breakdown.monthly_mortgage_payment
				- monthly_budget_breakdown.monthly_income_tax
				- monthly_budget_breakdown.monthly_expenses
				- monthly_budget_breakdown.monthly_property_tax);

			return monthly_budget_breakdown;
		},

		// getIncomeTax returns an estimated value of monthly_income_tax, used as inner function
		// @requirements:
		//				annual_income as an integer
		//				tax_file_type as a string
		// @return monthly_income_tax as an integer
		getMonthlyIncomeTax: function(annual_income, tax_file_type){
			var data                  = [];
			data.annual_income        = annual_income;
			data.tax_file_type        = tax_file_type;
			var income_tax_calculator = LoanCalculator.createIncomeTaxCalculator(data);
			var annual_income_tax     = income_tax_calculator.getYearlyIncomeTax();
			var monthly_income_tax    = Math.round(annual_income_tax / MonthsPerYear);
			return monthly_income_tax;
		},

		//get principe_investment
		// @requirements:
		//				mortgage_rate
		//				term_in_years
		// @returns principal_investment as an int
		getPrincipalValue: function(){
			var principal_investment = 0;

			//setup data to get prinicipal investment amount
			var data = [];
			data.mortgage_rate = mortgage_rate;
			data.term_in_years = term_in_years;
			data.annual_property_tax_rate = annual_property_tax_rate;
			data.annual_property_tax = annual_property_tax;
			data.annual_property_insurance = annual_property_insurance;
			data.annual_property_insurance_rate = annual_property_tax_rate;
			data.down_percent = down_percent;

			var budget = this.getMonthlyBudget();
			data.monthly_payment = budget.monthly_mortgage_payment;

			if( isNaN(data.mortgage_rate) || isNaN(data.term_in_years) || isNaN(data.monthly_payment) ){
				console.error("Variables are wrong type for getPrincipalValue() in LoanCalculator.createHomeAffordabiltyCalculator.");
				return principal_investment;
			}
			var principal_calculator = LoanCalculator.createPrincipalCalculator(data);
			principal_investment = principal_calculator.getPrincipal();

			return principal_investment;
		},

		// get results of home affordability calculations
		// @return results as array of results
		getResults: function(){
			var results = {};
			results.monthly_breakdown = this.getMonthlyBudget();
			// console.log(results.monthly_breakdown);
			results.principal_investment = this.getPrincipalValue();
			results.monthly_breakdown.monthly_property_tax = Math.round(results.principal_investment * annual_property_tax_rate / 100 / MonthsPerYear) || 0;
			results.monthly_breakdown.monthly_free_money = Math.round(results.monthly_breakdown.monthly_free_money - results.monthly_breakdown.monthly_property_tax);
			return results;
		}
	});
};


/*---BEGIN TEST DATA---///
// create test object with basic values and optional values for calculation
// based on calculations verified at: 
var test_mortgage = {
	loan_amount 						: "250000",
	term_in_years						: "30",
	interest_rate 						: "4.125",
	// optional values for testing
	down_payment						: "25000",
	additional_payment 					: "",
	primary_mortgage_insurance			: "0.005",
	property_tax						: "1.2",
	property_insurance					: "0.06",
	listed_house_value					: "275000",
	annual_hoa_fee						: "0.0",
	cashout_amount						: "10000"
};


//TEST BENCH
// based on calculations verified at: https://www.lendingtree.com/refinance-calculator
var old_mortgage = {
	listed_house_value 					: "300000",
	loan_amount 						: "290000",
	start_year 							: "2009",
	start_month 						: "3",
	start_day 							: "1",
	term_in_years						: "30",
	interest_rate 						: "4.25",
};

var new_mortgage = {
	term_in_years 						: "30",
	interest_rate 						: "3.00",
	future_years_in_home 				: "5",
	lender_fees 						: "4727"
};

var home_afford = {
	annual_income 						: "65000",
	monthly_expenses 					: "300",
	down_payment 						: "25000",
	desired_dti 						: "28",
	annual_property_tax_rate 			: "1.4",
	annual_property_insurance			: "800"
};

// start timer
var start = new Date();

// create MortgageCalculator object
var calc = LoanCalculator.createMortgageCalculator(test_mortgage);
// get monthly payment from the calculator
var monthly_payment = calc.baseMonthlyPayment();
var add_monthly = calc.addMonthlyPayment();
// get a payment schedule from the calculator
var payment_schedule = calc.paymentSchedule();
console.log("Calculated Monthly Payment: $" + monthly_payment);
console.log("Additional per Month: $" + add_monthly.total_fees);
console.log(add_monthly);
console.log(payment_schedule);

calc = LoanCalculator.createRefinanceCalculator(old_mortgage, new_mortgage);
results = calc.getResults();
console.log(results);

calc = LoanCalculator.createHomeAffordabiltyCalculator(home_afford);
results = calc.getResults();
console.log(results);

// end timer
var end = new Date();
var time = end-start;
console.log("exe time: " + time);
/*---END TEST DATA---*/
