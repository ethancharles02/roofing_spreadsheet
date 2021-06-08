// Add default values to json (if Shawn wants that)
// Implement default values for new inputs

// Add formatting for accounting values
// Combine inputs and outputs (but leave the json portions separate). Add new json indicators that will add an input if necessary
// Put inputs and outputs under "display_values"
// Specify formatting in json (display_format?) Currencies, Ints, and Percentages
// Move the creation of the h2 element (section name) to only happen if there is a display name (same for others?)
// Create a function for updating the output values, putting all of the formulas inside a json format wouldn't work easily
// Merge the input and output name elements creation so that they are just created based on a display_name
// Check for display name, if not there, use the variable name for display
// Separate add_dict_elements into smaller functions
// Fix inputs not getting formatted
// Change default_fixed_value code to be based off a new very that say whether or not it can be either fixed or variable

// func for getting information from a key inside a nested object
// function getObject(theObject) {
//     var result = null;
//     if(theObject instanceof Array) {
//         for(var i = 0; i < theObject.length; i++) {
//             result = getObject(theObject[i]);
//             if (result) {
//                 break;
//             }   
//         }
//     }
//     else
//     {
//         for(var prop in theObject) {
//             console.log(prop + ': ' + theObject[prop]);
//             if(prop == 'id') {
//                 if(theObject[prop] == 1) {
//                     return theObject;
//                 }
//             }
//             if(theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
//                 result = getObject(theObject[prop]);
//                 if (result) {
//                     break;
//                 }
//             } 
//         }
//     }
//     return result;
// }

var data_sheet_input_values = {}

/**
 * Adds a query to an input text box that will run the given function
 * @param {string} id The id of the input box (without the #)
 * @param {string} event The event that will trigger the function (ex. blur, input, focus)
 * @param {function} func The function that gets triggered
 */
function add_query_on_input(id, event, func){
    // Adds a query onto the element with the given id
    jQuery("#" + id).on(event, func)
}

/**
 * Formats a given value into a currency format, the value is expected to already be a valid number (string or float)
 * @param {(string|float)} value The value to be formatted
 * @returns {string} The formatted value with a dollar sign in front and to two decimal places
 */
function format_value_to_currency(value){
    // Returns the formatted float with a dollar sign on the front and fixed to 2 decimals
    return "$ " + parseFloat(value).toFixed(2)
}

/**
 * Sets the value of the clicked event to the currency formatted version
 * @param {object} event The event given from jQuery that can be used to find the value
 */
function set_event_target_currency(event){
    let value = event.target.value
    // Checks if the string is a valid number
    if (jQuery.isNumeric(value)){
        // Sets the value to the formatted version
        event.target.value = format_value_to_currency(event.target.value)
    }
}

/**
 * Restricts the input of the target object based on if it is a valid number, if it isn't, it sets the value to the corresponding id value in the data_sheet_input_values object
 * @param {object} event The event given from jQuery that can be used to find information on the element
 */
function restrict_input(event){
    let value = event.target.value
    let target_id = event.target.id

    // The parent id is for the corresponding section that the element comes from (ex. monthly_overhead)
    let parent_id = event.target.parentElement.parentElement.id

    // If the input isn't a number and isn't an empty string, it reverts it to the previous value
    if (!jQuery.isNumeric(value) && value != ""){
        event.target.value = data_sheet_input_values[parent_id][target_id]
    }
    // If it is a valid number or an empty string, updates the input values
    // If the value has a decimal in it, it is stored with the two decimals
    // If the value is an empty string, the input values only take that string
    // If the value is an int, it is simply stored as is
    else{
        if (value.includes(".")){
            data_sheet_input_values[parent_id][target_id] = parseFloat(value).toFixed(2)
        }
        else if(value == ""){
            data_sheet_input_values[parent_id][target_id] = value
        }
        else{
            data_sheet_input_values[parent_id][target_id] = parseFloat(value)
        }
    }
}

/**
 * For easy editing, this reverts the formatted value of the event object to its raw value equivalent
 * @param {object} event The event given from jQuery that can be used to find information on the element
 */
function focus_input(event){
    let target_id = event.target.id
    let parent_id = event.target.parentElement.parentElement.id

    // If the parent id isn't in the input values, it gets updated to include it
    if (!(parent_id in data_sheet_input_values)){
        data_sheet_input_values[parent_id] = {}
    }

    // If there isn't a given value for the target, it adds one as an empty string
    if (!(target_id in data_sheet_input_values[parent_id])){
        data_sheet_input_values[parent_id][target_id] = ""
    }
    // Updates the value to be the input version of the value
    event.target.value = data_sheet_input_values[parent_id][target_id]
    // Selects the whole of the input for easier editing
    event.target.select()
}

/**
 * Adds new elements to a given element based on the data_sheet_variables formatting through json
 * @param {string} selector The id of the element you want to add the new elements on top of
 * @param {object} dict The object that contains the information for each new element
 * @param {object} value_dict The object that contains only the raw values for each element id
 */
function add_dict_elements(selector, dict, value_dict){
    // Runs through every section in the object (ex. Monthly Overhead, Labor Burden, Annual Profit & Owner Salary, etc.)
    for (const section in dict){

        // Creates a new element for the section name (ex. Monthly Overhead)
        let section_header = document.createElement("h2")
        // Updates the text content to include the display version of that item
        section_header.textContent = dict[section]["display_name"]
        // Adds the element to the selector element
        document.querySelector(selector).appendChild(section_header)

        // Runs through each of the section values (ex. display_name, inputs, outputs)
        for (const section_value in dict[section]){
            // console.log(section_value)
            let section_value_header = document.createElement("h3")
            section_value_header.textContent = dict[section][section_value]["display_name"]
            document.querySelector(selector).appendChild(section_value_header)

            let section_value_article = document.createElement("article")
            let article_id = section + "_" + section_value
            section_value_article.id = article_id
            document.querySelector(selector).appendChild(section_value_article)

            for (const key in dict[section][section_value]["display_values"]){
                
                let div = document.createElement("div")

                let label = document.createElement("label")
                label.for = key
                label.textContent = dict[section][section_value]["display_values"][key]["display_name"] + ":"
                div.appendChild(label)
                
                if (dict[section][section_value]["display_values"][key]["user_interaction"] == "input"){
                    value_dict[key] = ""
                    
                    let input = document.createElement("input")
                    input.type = "text"
                    input.id = key
                    input.name = key

                    
                    div.appendChild(input)

                    if ("default_fixed_value" in dict[section][section_value]["display_values"][key]){
                        let fixed_label = document.createElement("label")
                        fixed_label.for = key + "_fixed"
                        fixed_label.textContent = "Fixed:"

                        let fixed_input = document.createElement("input")
                        fixed_input.type = "checkbox"
                        fixed_input.checked = dict[section][section_value]["display_values"][key]["default_fixed_value"]
                        fixed_input.id = key + "_fixed"
                        fixed_input.name = key

                        div.appendChild(fixed_label)
                        div.appendChild(fixed_input)
                    }
                    
                    add_query_on_input(key, "blur", set_event_target_currency)
                    add_query_on_input(key, "blur", update_outputs)
                    add_query_on_input(key, "input", restrict_input)
                    add_query_on_input(key, "focus", focus_input)
                }

                else if (dict[section][section_value]["display_values"][key]["user_interaction"] == "output"){
                    output_label = document.createElement("label")
                    output_label.id = key + "_value"

                    div.appendChild(output_label)
                }

                document.querySelector("#" + article_id).appendChild(div)
            }
        }
    }
}

function update_outputs(){
    update_monthly_overhead_outputs()
}

function update_monthly_overhead_outputs(){
    console.log(data_sheet_input_values)
    // document.querySelector("#est_monthly_expenses_fixed_value").textContent = data_sheet_input_values["monthly_overhead"]
}

function main(){
    // Gets the json file and converts it to an array which is used as an argument in the add_dict_elements function
    fetch("./data/data_sheet_variables.json")
    .then(response => {
        return response.json()
    })
    .then(data => {
        add_dict_elements("#data_sheet_variables", data[0], data_sheet_input_values)
        update_outputs()
    })
}

main()